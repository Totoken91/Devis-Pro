import { stripe }         from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null
const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://deviso.app'

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

        const email = invoice.customer_email
        if (email && resend) {
          const portalUrl = `${appUrl}/parametres/facturation`
          const html = `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
<body style="margin:0;padding:0;background:#F3F4F1;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F3F4F1;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="580" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #e8ece7;">
          <tr><td style="background:#ef4444;height:4px;font-size:0;">&nbsp;</td></tr>
          <tr>
            <td style="padding:36px 40px 28px;">
              <table cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                <tr>
                  <td style="background:#111827;border-radius:8px;width:28px;height:28px;text-align:center;vertical-align:middle;">
                    <span style="color:#ffffff;font-weight:700;font-size:14px;line-height:28px;">D</span>
                  </td>
                  <td style="padding-left:8px;font-weight:700;font-size:16px;color:#1a1e17;vertical-align:middle;">Deviso</td>
                </tr>
              </table>
              <p style="margin:0 0 4px;color:#ef4444;font-size:11px;text-transform:uppercase;letter-spacing:1.5px;font-weight:600;">Action requise</p>
              <h1 style="margin:0 0 4px;color:#111827;font-size:24px;font-weight:700;letter-spacing:-0.5px;">Échec du paiement</h1>
            </td>
          </tr>
          <tr><td style="border-top:1px solid #f3f4f6;"></td></tr>
          <tr>
            <td style="padding:28px 40px;">
              <p style="margin:0 0 16px;color:#374151;font-size:15px;line-height:1.7;">
                Le renouvellement de votre abonnement <strong>Deviso Pro</strong> a échoué.
                Votre accès Pro sera suspendu si le problème n'est pas résolu rapidement.
              </p>
              <p style="margin:0 0 28px;color:#6b7280;font-size:14px;line-height:1.7;">
                Cela peut être dû à une carte expirée, des fonds insuffisants ou un problème avec votre banque.
                Mettez à jour votre moyen de paiement pour continuer à profiter de Deviso Pro.
              </p>
              <table cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                <tr>
                  <td style="background:#ef4444;border-radius:12px;">
                    <a href="${portalUrl}" style="display:inline-block;padding:14px 28px;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;">
                      Mettre à jour mon paiement →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 40px;border-top:1px solid #f3f4f6;background:#fafaf9;">
              <p style="margin:0;color:#d1d5db;font-size:11px;line-height:1.6;">
                Vous recevez cet email car vous avez un abonnement actif sur <strong style="color:#9ca3af;">Deviso</strong>.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`

          await resend.emails.send({
            from: 'Deviso <notifications@deviso.app>',
            to: email,
            subject: 'Échec du paiement — Mettez à jour votre moyen de paiement',
            html,
          })
          console.log('[webhook] Email paiement échoué envoyé à', email)
        }
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
