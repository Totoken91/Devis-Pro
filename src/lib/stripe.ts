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

export function getPriceId(interval: 'monthly' | 'yearly'): string {
  const value = interval === 'monthly'
    ? process.env.STRIPE_PRO_MONTHLY_PRICE_ID
    : process.env.STRIPE_PRO_YEARLY_PRICE_ID
  if (!value) throw new Error(`Price ID ${interval} non configuré`)
  return value
}
