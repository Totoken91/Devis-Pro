'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Spinner } from '@/components/ui/Spinner'

export default function HeroSection() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleStart = () => {
    setLoading(true)
    router.push('/inscription')
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0A0F1E] px-4">

      {/* Glows décoratifs brand */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-brand/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 -left-32 w-80 h-80 bg-brand/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -right-32 w-64 h-64 bg-brand/8 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 text-center text-white max-w-4xl mx-auto pt-20">

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 bg-brand/10 border border-brand/20 rounded-full px-4 py-1.5 text-sm text-brand-light mb-8"
        >
          <span className="w-2 h-2 rounded-full bg-brand animate-pulse" />
          Gratuit 14 jours · Aucune carte requise
        </motion.div>

        {/* Titre */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-display text-5xl sm:text-7xl lg:text-8xl font-extrabold leading-tight mb-6 tracking-tight"
        >
          Tes devis.{' '}
          <span className="text-brand">Signés.</span>
          <br />Sans attendre.
        </motion.h1>

        {/* Sous-titre */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg sm:text-xl text-white/60 max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Tu sais exactement quand ton client ouvre ton devis. Plus d&apos;attente dans le vide —
          une notification, et tu rappelles au bon moment.
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <button
            onClick={handleStart}
            disabled={loading}
            className="inline-flex items-center gap-3 bg-brand hover:bg-brand-dark text-white font-semibold px-8 py-4 rounded-xl text-lg
                       shadow-sm shadow-brand/30 hover:shadow-md hover:shadow-brand/40
                       transition-all duration-200 hover:-translate-y-px disabled:opacity-80 disabled:cursor-not-allowed"
          >
            {loading ? <><Spinner size={18} />Chargement…</> : 'Essayer gratuitement'}
          </button>
          <Link
            href="#demo"
            className="flex items-center gap-2 border border-white/15 hover:border-brand/50
                       text-white/80 hover:text-white font-medium px-6 py-4 rounded-xl
                       transition-all duration-200"
          >
            <svg className="w-5 h-5 text-brand" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
            Voir la démo
          </Link>
        </motion.div>

        {/* Mockup flottant */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="relative mt-16 mx-auto max-w-3xl"
        >
          {/* Cadre UI mockup */}
          <div className="relative bg-[#0F1812] border border-brand/20 rounded-2xl overflow-hidden shadow-2xl shadow-black/60">
            {/* Barre de fenêtre */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5">
              <span className="w-3 h-3 rounded-full bg-red-500/60" />
              <span className="w-3 h-3 rounded-full bg-yellow-500/60" />
              <span className="w-3 h-3 rounded-full bg-brand/60" />
              <span className="ml-4 text-xs text-white/30 font-mono truncate">deviso.app/q/devis-2024-047</span>
            </div>

            {/* Corps du mockup */}
            <div className="p-4 sm:p-8 text-left">
              <div className="flex items-start justify-between mb-6 gap-4">
                <div className="min-w-0">
                  <p className="text-white/40 text-xs font-semibold tracking-widest uppercase mb-1">Devis #2024-047</p>
                  <h2 className="font-display text-white text-lg sm:text-2xl font-bold">Identité visuelle — Studio Bloom</h2>
                  <p className="text-white/40 text-xs sm:text-sm mt-1 truncate">Pour Studio Bloom · Valable jusqu&apos;au 30 avril</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-white/40 text-xs mb-1">Total TTC</p>
                  <p className="font-display text-brand text-2xl sm:text-3xl font-bold">2 400 €</p>
                </div>
              </div>

              {/* Lignes de devis simulées */}
              <div className="space-y-2 mb-6">
                {[
                  { label: 'Stratégie de marque', price: '600 €' },
                  { label: 'Logo & charte graphique', price: '1 400 €' },
                  { label: 'Kit réseaux sociaux', price: '400 €' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between py-2 border-b border-white/5">
                    <span className="text-white/70 text-sm">{item.label}</span>
                    <span className="text-white/50 text-sm tabular-nums">{item.price}</span>
                  </div>
                ))}
              </div>

              {/* Bouton accepter */}
              <div className="flex gap-3">
                <div className="flex-1 bg-brand/15 border border-brand/30 rounded-xl py-3 text-center text-brand text-sm font-semibold">
                  ✓ Accepter le devis
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white/40 text-sm font-medium">
                  Refuser
                </div>
              </div>
            </div>
          </div>

          {/* Notification animée */}
          <motion.div
            initial={{ opacity: 0, x: 40, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ delay: 1.5, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="absolute -top-4 right-2 sm:-right-8 bg-[#0F1812] border border-brand/40
                       rounded-xl px-3 py-2.5 sm:px-4 sm:py-3 shadow-xl shadow-brand/10 flex items-center gap-2 sm:gap-3 max-w-[220px] sm:max-w-xs"
          >
            <div className="w-8 h-8 rounded-lg bg-brand/20 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="text-white text-[11px] sm:text-xs font-semibold leading-snug">Marc Dupont a ouvert votre devis</p>
              <p className="text-white/40 text-[10px] sm:text-[11px] mt-0.5">il y a 2 minutes · 3 200 €</p>
            </div>
            <span className="w-2 h-2 rounded-full bg-brand animate-pulse shrink-0" />
          </motion.div>
        </motion.div>

        {/* Preuve sociale */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.0 }}
          className="mt-10 pb-16 text-white/30 text-sm"
        >
          +500 freelances & TPE font confiance à Deviso chaque semaine
        </motion.p>
      </div>
    </section>
  )
}
