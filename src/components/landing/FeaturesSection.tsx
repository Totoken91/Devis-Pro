'use client'

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

const FEATURES = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    title: 'Tu sais quand il l\u2019ouvre.',
    body: 'Une notification instantan\u00e9e d\u00e8s que ton client consulte le devis. Tu rappelles au bon moment \u2014 pas au hasard.',
    accent: 'text-brand',
    glow: 'bg-brand/5',
    border: 'border-brand/15 hover:border-brand/35',
    preview: (
      <div className="mt-5 flex items-center gap-3 bg-black/20 border border-brand/20 rounded-xl px-4 py-3">
        <span className="w-2 h-2 rounded-full bg-brand animate-pulse shrink-0" />
        <div>
          <p className="text-white text-xs font-semibold">Marc Dupont a ouvert votre devis</p>
          <p className="text-white/35 text-[11px] mt-0.5">il y a quelques secondes &middot; 3 200 &euro;</p>
        </div>
      </div>
    ),
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: 'Il signe en un clic.',
    body: 'Un lien unique, pas de compte \u00e0 cr\u00e9er. Ton client accepte depuis son t\u00e9l\u00e9phone en 30 secondes.',
    accent: 'text-emerald-400',
    glow: 'bg-emerald-400/5',
    border: 'border-emerald-400/15 hover:border-emerald-400/30',
    preview: (
      <div className="mt-5 flex gap-2">
        <div className="flex-1 bg-brand/15 border border-brand/30 rounded-xl py-2.5 text-center text-brand text-xs font-semibold">
          ✓ Accepter le devis
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white/35 text-xs font-medium">
          Refuser
        </div>
      </div>
    ),
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
      </svg>
    ),
    title: 'Relances sans malaise.',
    body: 'Planifie un rappel automatique si ton client n\u2019a pas r\u00e9pondu. Tu restes pro sans passer pour quelqu\u2019un de lourd.',
    accent: 'text-sky-400',
    glow: 'bg-sky-400/5',
    border: 'border-sky-400/15 hover:border-sky-400/30',
    preview: null,
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    ),
    title: 'Un devis qui force le respect.',
    body: 'G\u00e9n\u00e8re un PDF soign\u00e9 en 2 minutes. Ton logo, tes couleurs, tes CGV \u2014 z\u00e9ro friction.',
    accent: 'text-violet-400',
    glow: 'bg-violet-400/5',
    border: 'border-violet-400/15 hover:border-violet-400/30',
    preview: null,
  },
]

export default function FeaturesSection() {
  const headerRef = useRef(null)
  const gridRef   = useRef(null)

  const headerInView = useInView(headerRef, { once: true, margin: '-80px' })
  const gridInView   = useInView(gridRef,   { once: true, margin: '-80px' })

  return (
    <section id="features" className="relative bg-[#0A0F1E] py-32 px-4 overflow-hidden">

      {/* Séparateur haut */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/8 to-transparent" />

      {/* Glow décoratif */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-brand/6 rounded-full blur-3xl pointer-events-none" />

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
            Ce que tu gagnes
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
          Tout ce qu&apos;il faut pour{' '}
          <span className="text-brand">closer plus vite.</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={headerInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.18, ease }}
          className="text-white/45 text-lg mb-16 max-w-xl leading-relaxed"
        >
          Un outil construit pour les freelances et les TPE qui veulent signer, pas attendre.
        </motion.p>

        {/* Grille features */}
        <div ref={gridRef} className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {FEATURES.map((feat, i) => (
            <motion.div
              key={feat.title}
              custom={i}
              variants={fadeUp}
              initial="hidden"
              animate={gridInView ? 'visible' : 'hidden'}
              className={`
                relative group rounded-2xl border p-6 transition-all duration-300
                bg-white/[0.02] ${feat.border} ${feat.glow}
              `}
            >
              {/* Icône */}
              <div className={`${feat.accent} mb-5`}>
                {feat.icon}
              </div>

              {/* Texte */}
              <h3 className="font-display text-white font-semibold text-lg leading-snug mb-2">
                {feat.title}
              </h3>
              <p className="text-white/40 text-sm leading-relaxed">
                {feat.body}
              </p>

              {/* Prévisualisation inline (optionnelle) */}
              {feat.preview}
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  )
}
