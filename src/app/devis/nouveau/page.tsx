import { AppLayout } from '@/components/shared/AppLayout'
import { createClient } from '@/lib/supabase/server'
import { DevisForm } from '../DevisForm'
import { generateNumeroDevis } from '@/lib/utils'
import type { Client, Profile } from '@/types/supabase'
import { Lock, ArrowLeft, Zap } from 'lucide-react'
import Link from 'next/link'

const FREE_LIMIT = 3

export default async function NouveauDevisPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const now       = new Date()
  const debutMois = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  const [
    { data: profile },
    { data: clients },
    { count: totalCount },
    { count: moisCount },
  ] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user!.id).single(),
    supabase.from('clients').select('*').eq('user_id', user!.id).order('name'),
    supabase.from('devis').select('*', { count: 'exact', head: true }).eq('user_id', user!.id),
    supabase.from('devis').select('*', { count: 'exact', head: true })
      .eq('user_id', user!.id)
      .gte('created_at', debutMois),
  ])

  const plan          = (profile as unknown as Profile)?.plan ?? 'free'
  const utilisésMois  = moisCount ?? 0
  const limitAtteinte = plan === 'free' && utilisésMois >= FREE_LIMIT

  // ── Mur de blocage plan gratuit ─────────────────────────────
  if (limitAtteinte) {
    const premierProchain = new Date(now.getFullYear(), now.getMonth() + 1, 1)
      .toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })

    return (
      <AppLayout>
        <div className="min-h-[80vh] flex items-center justify-center px-6">
          <div className="max-w-md w-full text-center">

            {/* Icône */}
            <div className="w-16 h-16 bg-white/[0.06] border border-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Lock size={24} className="text-white/40" />
            </div>

            {/* Titre */}
            <h1 className="font-display text-2xl font-bold text-white tracking-tight mb-2">
              Limite mensuelle atteinte
            </h1>
            <p className="text-white/45 text-sm leading-relaxed mb-2">
              Tu as créé <strong className="text-white/70">{utilisésMois}</strong> devis ce mois-ci.
              Le plan gratuit est limité à <strong className="text-white/70">{FREE_LIMIT} devis / mois</strong>.
            </p>
            <p className="text-white/30 text-xs mb-8">
              Nouveaux devis disponibles le <span className="text-white/50">{premierProchain}</span>
            </p>

            {/* CTA Pro */}
            <div className="bg-brand/10 border border-brand/20 rounded-2xl p-6 mb-4 relative overflow-hidden">
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-brand/20 rounded-full blur-2xl pointer-events-none" />
              <div className="relative">
                <div className="inline-flex items-center gap-1.5 bg-brand/20 text-brand text-xs font-bold px-2.5 py-1 rounded-full mb-3">
                  <Zap size={10} />
                  PRO — Devis illimités
                </div>
                <p className="text-white/70 text-sm mb-4">
                  Passe en Pro et oublie les limites : devis illimités, relances automatiques, et bien plus.
                </p>
                <Link
                  href="/parametres/facturation"
                  className="inline-flex items-center gap-2 bg-brand hover:bg-brand-dark text-white font-semibold rounded-xl px-5 py-2.5 text-sm transition-all shadow-sm shadow-brand/30 hover:shadow-brand/50 hover:-translate-y-px"
                >
                  <Zap size={14} />
                  Passer Pro — Essai 14 jours
                </Link>
              </div>
            </div>

            {/* Retour */}
            <Link
              href="/devis"
              className="inline-flex items-center gap-1.5 text-sm text-white/30 hover:text-white/60 transition-colors"
            >
              <ArrowLeft size={13} />
              Retour à mes devis
            </Link>

          </div>
        </div>
      </AppLayout>
    )
  }

  const nextNumero = generateNumeroDevis(totalCount ?? 0)

  return (
    <AppLayout>
      <DevisForm
        mode="create"
        clients={(clients ?? []) as unknown as Client[]}
        profile={profile as unknown as Profile}
        nextNumero={nextNumero}
      />
    </AppLayout>
  )
}
