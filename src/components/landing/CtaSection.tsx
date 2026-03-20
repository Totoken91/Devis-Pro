'use client'

import Link from 'next/link'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

const ease = [0.22, 1, 0.36, 1] as [number, number, number, number]

export default function CtaSection() {
  const ref    = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section className="relative bg-[#0A0F1E] py-32 px-4 overflow-hidden">

      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/8 to-transparent" />

      {/* Glow central */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[300px] bg-brand/12 rounded-full blur-3xl pointer-events-none" />

      <div ref={ref} className="relative max-w-3xl mx-auto text-center">

        {/* Chip */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.45, ease }}
          className="inline-flex items-center gap-2 bg-brand/10 border border-brand/20 rounded-full px-4 py-1.5 text-sm text-brand-light mb-8"
        >
          <span className="w-2 h-2 rounded-full bg-brand animate-pulse" />
          Aucune carte requise &middot; 14 jours gratuits
        </motion.div>

        {/* Titre */}
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.65, delay: 0.08, ease }}
          className="font-display text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white leading-tight mb-6 tracking-tight"
        >
          Ton prochain devis.{' '}
          <span className="text-brand">Signé.</span>
        </motion.h2>

        {/* Sous-titre */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.18, ease }}
          className="text-white/50 text-lg sm:text-xl leading-relaxed mb-10 max-w-xl mx-auto"
        >
          Arrête d&apos;envoyer des PDF dans le vide. Lance-toi en 2 minutes &mdash; et sache enfin où en est ton devis.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.28, ease }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <Link
            href="/inscription"
            className="bg-brand hover:bg-brand-dark text-white font-semibold px-8 py-4 rounded-xl text-lg
                       shadow-sm shadow-brand/30 hover:shadow-md hover:shadow-brand/40
                       transition-all duration-200 hover:-translate-y-px"
          >
            Créer mon compte gratuit
          </Link>
          <Link
            href="/connexion"
            className="text-white/55 hover:text-white text-sm font-medium transition-colors duration-200"
          >
            J&apos;ai déjà un compte &rarr;
          </Link>
        </motion.div>

        {/* Preuve sociale */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.5, ease }}
          className="mt-12 text-white/20 text-sm"
        >
          +500 freelances &amp; TPE font confiance à Deviso chaque semaine
        </motion.p>

      </div>
    </section>
  )
}
