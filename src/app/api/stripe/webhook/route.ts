import { stripe }         from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig  = req.headers.get('stripe-signature')

  if (!sig) return NextResponse.json({ error: 'Signature manquante' }, { status: 400 })

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    console.error('[webhook] STRIPE_WEBHOOK_SECRET non configuré')
    return NextResponse.json({ error: 'Webhook secret manquant' }, { status: 500 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch (err) {
    console.error('[webhook] Signature invalide:', err)
    return NextResponse.json({ error: 'Signature invalide' }, { status: 400 })
  }

  const admin = createAdminClient()

  try {
    switch (event.type) {

      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const userId  = session.metadata?.supabase_user_id
        if (!userId) break

        const subscriptionId = typeof session.subscription === 'string'
          ? session.subscription
          : session.subscription?.id

        await admin.from('profiles').update({
          plan:                    'pro',
          stripe_customer_id:      session.customer as string,
          stripe_subscription_id:  subscriptionId ?? null,
          updated_at:              new Date().toISOString(),
        }).eq('id', userId)

        console.log('[webhook] checkout.session.completed → pro pour', userId)
        break
      }

      case 'customer.subscription.updated': {
        const sub    = event.data.object as Stripe.Subscription
        const userId = sub.metadata?.supabase_user_id
        if (!userId) break

        // Subscription active (ou en période d'essai) → pro ; sinon on attend deleted
        const isActive = ['active', 'trialing'].includes(sub.status)
        if (isActive) {
          await admin.from('profiles').update({
            plan:                   'pro',
            stripe_subscription_id: sub.id,
            updated_at:             new Date().toISOString(),
          }).eq('id', userId)
        }
        console.log('[webhook] subscription.updated → status:', sub.status, 'pour', userId)
        break
      }

      case 'customer.subscription.deleted': {
        const sub    = event.data.object as Stripe.Subscription
        const userId = sub.metadata?.supabase_user_id
        if (!userId) break

        await admin.from('profiles').update({
          plan:                   'free',
          stripe_subscription_id: null,
          updated_at:             new Date().toISOString(),
        }).eq('id', userId)

        console.log('[webhook] subscription.deleted → free pour', userId)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        console.warn('[webhook] Paiement échoué pour customer:', invoice.customer)
        // TODO : envoyer un email de relance paiement
        break
      }

      default:
        break
    }
  } catch (err) {
    console.error('[webhook] Erreur traitement event:', event.type, err)
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
