'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

const fadeUp = {
  hidden:  { opacity: 0, y: 28 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] },
  }),
}

const PAINS = [
  {
    num: '01',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 9v.906a2.25 2.25 0 01-1.183 1.981l-6.478 3.488M2.25 9v.906a2.25 2.25 0 001.183 1.981l6.478 3.488m8.839 2.51l-4.66-2.51m0 0l-1.023-.55a2.25 2.25 0 00-2.134 0l-1.022.55m0 0l-4.661 2.51m16.5 1.615a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V8.844a2.25 2.25 0 011.183-1.98l7.5-4.04a2.25 2.25 0 012.134 0l7.5 4.04a2.25 2.25 0 011.183 1.98V19.5z" />
      </svg>
    ),
    headline: 'Il disparaît dans sa boîte mail.',
    body: 'Tu envoies un PDF en pièce jointe. Il se noie entre les newsletters et les factures. Ton client dit qu'il n'a rien reçu.',
    color: 'text-orange-400',
    glow: 'bg-orange-400/5',
    border: 'border-orange-400/10 hover:border-orange-400/25',
  },
  {
    num: '02',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
      </svg>
    ),
    headline: 'Tu relances. C'est gênant.',
    body: 'Trois jours sans réponse. Tu rappelles en espérant ne pas passer pour quelqu'un de lourd. Il dit "je regarde ça ce soir".',
    color: 'text-red-400',
    glow: 'bg-red-400/5',
    border: 'border-red-400/10 hover:border-red-400/25',
  },
  {
    num: '03',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
      </svg>
    ),
    headline: 'Le projet part ailleurs.',
    body: 'Un concurrent a répondu en 10 minutes avec un lien propre. Ton client a signé ce matin. Toi, tu attends encore.',
    color: 'text-rose-400',
    glow: 'bg-rose-400/5',
    border: 'border-rose-400/10 hover:border-rose-400/25',
  },
]

export default function ProblemSection() {
  const ref        = useRef(null)
  const labelRef   = useRef(null)
  const bridgeRef  = useRef(null)

  const isInView       = useInView(ref,       { once: true, margin: '-80px' })
  const labelInView    = useInView(labelRef,   { once: true, margin: '-80px' })
  const bridgeInView   = useInView(bridgeRef,  { once: true, margin: '-80px' })

  return (
    <section className="relative bg-[#0A0F1E] py-32 px-4 overflow-hidden">

      {/* Séparateur visuel depuis le Hero */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/8 to-transparent" />

      {/* Glow décoratif bas-gauche */}
      <div className="absolute bottom-0 left-1/4 w-96 h-64 bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto">

        {/* Label section */}
        <motion.div
          ref={labelRef}
          initial={{ opacity: 0, y: 16 }}
          animate={labelInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center gap-3 mb-16"
        >
          <span className="text-xs font-semibold tracking-widest uppercase text-white/25">
            Ce qui se passe en ce moment
          </span>
          <div className="flex-1 h-px bg-white/6" />
        </motion.div>

        {/* Titre */}
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          animate={labelInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="font-display text-4xl sm:text-5xl font-bold text-white leading-tight mb-16 max-w-2xl"
        >
          Envoyer un devis ne devrait pas être{' '}
          <span className="text-white/35">aussi stressant.</span>
        </motion.h2>

        {/* 3 cards douleur */}
        <div ref={ref} className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {PAINS.map((pain, i) => (
            <motion.div
              key={pain.num}
              custom={i}
              variants={fadeUp}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
              className={`
                relative group rounded-2xl border p-6 transition-all duration-300
                bg-white/[0.02] ${pain.border} ${pain.glow}
              `}
            >
              {/* Numéro en filigrane */}
              <span className="absolute top-4 right-5 font-display text-5xl font-black text-white/[0.04] select-none tabular-nums">
                {pain.num}
              </span>

              {/* Icône */}
              <div className={`${pain.color} mb-5`}>
                {pain.icon}
              </div>

              {/* Texte */}
              <h3 className="font-display text-white font-semibold text-lg leading-snug mb-3">
                {pain.headline}
              </h3>
              <p className="text-white/40 text-sm leading-relaxed">
                {pain.body}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Bridge vers la solution */}
        <motion.div
          ref={bridgeRef}
          initial={{ opacity: 0, y: 20 }}
          animate={bridgeInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mt-20 flex flex-col sm:flex-row items-center gap-6"
        >
          {/* Ligne gauche */}
          <div className="hidden sm:block flex-1 h-px bg-gradient-to-r from-transparent to-white/8" />

          {/* Texte pivot */}
          <div className="text-center sm:text-left px-2">
            <p className="text-white/50 text-base leading-relaxed max-w-lg">
              Il existe une façon plus intelligente.{' '}
              <span className="text-white font-medium">
                Sache quand ton client ouvre ton devis.
              </span>{' '}
              Relance au bon moment. Ferme le deal.
            </p>
          </div>

          {/* Flèche + ligne droite */}
          <div className="hidden sm:flex items-center gap-3">
            <div className="w-16 h-px bg-gradient-to-r from-white/8 to-brand/40" />
            <div className="w-7 h-7 rounded-full border border-brand/40 flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  )
}
