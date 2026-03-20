import Stripe from 'stripe'

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) throw new Error('STRIPE_SECRET_KEY manquante')
  return new Stripe(key, { apiVersion: '2026-02-25.clover', typescript: true })
}

let _stripe: Stripe | null = null
export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    if (!_stripe) _stripe = getStripe()
    return (_stripe as any)[prop]
  },
})

export const PRICE_IDS = {
  monthly: process.env.STRIPE_PRO_MONTHLY_PRICE_ID ?? '',
  yearly:  process.env.STRIPE_PRO_YEARLY_PRICE_ID  ?? '',
} as const
