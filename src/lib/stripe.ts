import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY manquante')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2026-02-25.clover',
  typescript: true,
})

export const PRICE_IDS = {
  monthly: process.env.STRIPE_PRO_MONTHLY_PRICE_ID ?? '',
  yearly:  process.env.STRIPE_PRO_YEARLY_PRICE_ID  ?? '',
} as const
