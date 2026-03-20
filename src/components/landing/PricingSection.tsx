'use client'

import Link from 'next/link'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

const ease = [0.22, 1, 0.36, 1] as [number, number, number, number]

const fadeUp = {
  hidden:  { opacity: 0, y: 28 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay: i * 0.1, ease },
  }),
}

const PLANS = [
  {
    name: 'Starter',
    price: 'Gratuit',
    sub: 'Pour découvrir',
    features: [
      '3 devis par mois',
      'Lien de partage unique',
      'PDF professionnel',
      'Signature en ligne',
    ],
    missing: [
      'Tracking d\u2019ouverture',
      'Relances automatiques',
      'Branding personnalis\u00e9',
    ],
    cta: 'Commencer gratuitement',
    href: '/inscription',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '29\u00a0\u20ac',
    sub: 'par mois, HT',
    badge: 'Le plus populaire',
    features: [
      'Devis illimit\u00e9s',
      'Lien de partage unique',
      'PDF professionnel',
      'Signature en ligne',
      'Tracking d\u2019ouverture en temps r\u00e9el',
      'Relances automatiques',
      'Branding personnalis\u00e9',
    ],
    missing: [],
    cta: 'Essayer 14 jours gratuit',
    href: '/inscription',
    highlighted: true,
  },
  {
    name: 'Agence',
    price: '79\u00a0\u20ac',
    sub: 'par mois, HT',
    features: [
      'Tout le plan Pro',
      'Jusqu\u2019\u00e0 5 utilisateurs',
      'Espace client d\u00e9di\u00e9',
      'Statistiques avanc\u00e9es',
      'Priorit\u00e9 support',
    ],
    missing: [],
    cta: 'Contacter l\u2019\u00e9quipe',
    href: 'mailto:hello@deviso.fr',
    highlighted: false,
  },
]

const Check = () => (
  <svg className="w-4 h-4 shrink-0 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
  </svg>
)

const Cross = () => (
  <svg className="w-4 h-4 shrink-0 text-white/15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
)

export default function PricingSection() {
  const headerRef = useRef(null)
  const gridRef   = useRef(null)

  const headerInView = useInView(headerRef, { once: true, margin: '-80px' })
  const gridInView   = useInView(gridRef,   { once: true, margin: '-80px' })

  return (
    <section className="relative bg-[#0A0F1E] py-32 px-4 overflow-hidden">

      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/8 to-transparent" />

      {/* Glows */}
      <div className="absolute top-1/3 -right-32 w-96 h-96 bg-brand/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 -left-24 w-80 h-64 bg-brand/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto">

        {/* Label */}
        <motion.div
          ref={headerRef}
          initial={{ opacity: 0, y: 16 }}
          animate={headerInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease }}
          className="flex items-center gap-3 mb-16"
        >
          <span className="text-xs font-semibold tracking-widest uppercase text-white/25">
            Tarifs simples
          </span>
          <div className="flex-1 h-px bg-white/6" />
        </motion.div>

        {/* Titre */}
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          animate={headerInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1, ease }}
          className="font-display text-4xl sm:text-5xl font-bold text-white leading-tight mb-4 max-w-2xl"
        >
          Pas d&apos;abonnement pi\u00e8ge.{' '}
          <span className="text-white/35">Pas de surprise.</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={headerInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.18, ease }}
          className="text-white/45 text-lg mb-16 max-w-xl leading-relaxed"
        >
          14 jours gratuits sur le plan Pro, sans carte bancaire. Tu vois si \u00e7a marche pour toi, et tu d\u00e9cides ensuite.
        </motion.p>

        {/* Grille */}
        <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
          {PLANS.map((plan, i) => (
            <motion.div
              key={plan.name}
              custom={i}
              variants={fadeUp}
              initial="hidden"
              animate={gridInView ? 'visible' : 'hidden'}
              className={`
                relative rounded-2xl border p-7 flex flex-col gap-6 transition-all duration-300
                ${plan.highlighted
                  ? 'bg-brand/8 border-brand/35 shadow-lg shadow-brand/10'
                  : 'bg-white/[0.02] border-white/8 hover:border-white/16'}
              `}
            >
              {/* Badge */}
              {plan.badge && (
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-brand text-white text-xs font-bold px-4 py-1 rounded-full shadow-md shadow-brand/30 whitespace-nowrap">
                  {plan.badge}
                </span>
              )}

              {/* En-t\u00eate */}
              <div>
                <p className="text-white/45 text-sm font-medium mb-3">{plan.name}</p>
                <div className="flex items-end gap-1.5">
                  <span className="font-display text-4xl font-extrabold text-white">{plan.price}</span>
                  {plan.price !== 'Gratuit' && (
                    <span className="text-white/35 text-sm mb-1.5">{plan.sub}</span>
                  )}
                </div>
                {plan.price === 'Gratuit' && (
                  <p className="text-white/35 text-sm mt-1">{plan.sub}</p>
                )}
              </div>

              {/* Features incluses */}
              <ul className="flex flex-col gap-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5">
                    <Check />
                    <span className="text-white/70 text-sm">{f}</span>
                  </li>
                ))}
                {plan.missing.map((f) => (
                  <li key={f} className="flex items-start gap-2.5">
                    <Cross />
                    <span className="text-white/25 text-sm line-through">{f}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link
                href={plan.href}
                className={`
                  mt-auto block text-center font-semibold rounded-xl px-6 py-3.5 text-sm
                  transition-all duration-200
                  ${plan.highlighted
                    ? 'bg-brand hover:bg-brand-dark text-white shadow-sm shadow-brand/30 hover:shadow-md hover:shadow-brand/40 hover:-translate-y-px'
                    : 'border border-white/12 hover:border-white/25 text-white/70 hover:text-white'}
                `}
              >
                {plan.cta}
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Note basse */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={gridInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.5, ease }}
          className="text-center text-white/25 text-sm mt-10"
        >
          Paiement s\u00e9curis\u00e9 par Stripe &middot; R\u00e9siliation \u00e0 tout moment &middot; Sans engagement
        </motion.p>

      </div>
    </section>
  )
}
