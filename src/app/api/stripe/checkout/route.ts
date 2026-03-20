import { createClient }    from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { stripe, getPriceId } from '@/lib/stripe'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const schema = z.object({
  interval: z.enum(['monthly', 'yearly']).default('monthly'),
})

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const raw    = await req.json().catch(() => ({}))
  const parsed = schema.safeParse(raw)
  if (!parsed.success) return NextResponse.json({ error: 'Paramètres invalides' }, { status: 400 })

  const { interval } = parsed.data
  console.log('[checkout] env monthly:', process.env.STRIPE_PRO_MONTHLY_PRICE_ID ? 'SET' : 'EMPTY')
  console.log('[checkout] env yearly:', process.env.STRIPE_PRO_YEARLY_PRICE_ID ? 'SET' : 'EMPTY')
  let priceId: string
  try { priceId = getPriceId(interval) }
  catch { return NextResponse.json({ error: `Price ID ${interval} non configuré` }, { status: 500 }) }

  const admin = createAdminClient()
  const { data: profile } = await admin
    .from('profiles')
    .select('email, full_name, company_name, stripe_customer_id, plan')
    .eq('id', user.id)
    .single()

  if (!profile) return NextResponse.json({ error: 'Profil introuvable' }, { status: 404 })
  if (profile.plan === 'pro') return NextResponse.json({ error: 'Déjà Pro' }, { status: 409 })

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  // Récupère ou crée le customer Stripe
  let customerId = profile.stripe_customer_id
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: profile.email,
      name:  profile.company_name || profile.full_name || undefined,
      metadata: { supabase_user_id: user.id },
    })
    customerId = customer.id
    await admin.from('profiles').update({ stripe_customer_id: customerId }).eq('id', user.id)
  }

  const session = await stripe.checkout.sessions.create({
    customer:               customerId,
    mode:                   'subscription',
    payment_method_types:   ['card'],
    line_items:             [{ price: priceId, quantity: 1 }],
    allow_promotion_codes:  true,
    subscription_data: {
      trial_period_days: 14,
      metadata: { supabase_user_id: user.id },
    },
    success_url: `${appUrl}/parametres/facturation?success=1`,
    cancel_url:  `${appUrl}/parametres/facturation?canceled=1`,
    metadata: { supabase_user_id: user.id },
  })

  return NextResponse.json({ url: session.url })
}
