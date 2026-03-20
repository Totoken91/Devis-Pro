'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#0F2540] via-[#1E3A5F] to-[#0F2540] px-4">
      {/* Cercles décoratifs en arrière-plan */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-[#2E86C1]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-[#7EC8E3]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 text-center text-white max-w-4xl mx-auto">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm text-white/80 mb-8"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          Aucune carte bancaire requise · Gratuit 14 jours
        </motion.div>

        {/* Titre */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-tight mb-6"
        >
          Créez vos devis{' '}
          <span className="text-[#7EC8E3]">en 2 minutes</span>,<br />
          faites-les signer en ligne.
        </motion.h1>

        {/* Sous-titre */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg sm:text-xl text-white/70 max-w-2xl mx-auto mb-10"
        >
          Deviso remplace Excel et les PDFs bricolés. Générez des devis professionnels,
          envoyez-les par lien et recevez la signature électronique — le tout depuis un seul outil.
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <Link
            href="/inscription"
            className="bg-[#2E86C1] hover:bg-[#1a6fa8] text-white font-semibold px-8 py-4 rounded-xl text-lg transition-all duration-200 shadow-lg hover:shadow-[#2E86C1]/40 hover:-translate-y-0.5"
          >
            Commencer gratuitement
          </Link>
          <Link
            href="#demo"
            className="flex items-center gap-2 text-white/80 hover:text-white font-medium px-6 py-4 rounded-xl border border-white/20 hover:border-white/40 transition-all duration-200"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
            Voir la démo
          </Link>
        </motion.div>

        {/* Preuve sociale rapide */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-10 text-white/40 text-sm"
        >
          Rejoignez +500 freelances & TPE qui gagnent du temps chaque semaine
        </motion.p>
      </div>
    </section>
  )
}
