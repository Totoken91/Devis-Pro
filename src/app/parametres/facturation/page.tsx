import { AppLayout }    from '@/components/shared/AppLayout'
import { createClient }  from '@/lib/supabase/server'
import { UpgradeButton } from './UpgradeButton'
import { PortalButton }  from './PortalButton'
import { CheckCircle2, Zap, Shield, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import type { Profile } from '@/types/supabase'

const PRO_FEATURES = [
  'Devis illimités (plus de limite mensuelle)',
  'Relances automatiques J+3 et J+7',
  'Branding personnalisé (logo + couleur)',
  'Suppression du badge « Fait avec Deviso »',
  'Suivi des ouvertures en temps réel',
]

export default async function FacturationPage({
  searchParams,
}: {
  searchParams: { success?: string; canceled?: string }
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profileRaw } = await supabase
    .from('profiles')
    .select('plan, email, full_name, company_name')
    .eq('id', user!.id)
    .single()

  const profile = profileRaw as Pick<Profile, 'plan' | 'email' | 'full_name' | 'company_name'> | null
  const plan    = profile?.plan ?? 'free'

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="mb-8">
          <Link href="/profil" className="inline-flex items-center gap-1.5 text-xs text-white/30 hover:text-white/60 transition-colors mb-4">
            <ArrowLeft size={12} />
            Retour aux paramètres
          </Link>
          <h1 className="font-display text-xl font-bold text-white tracking-tight">Facturation</h1>
          <p className="text-white/40 text-sm mt-1">Gérez votre abonnement Deviso.</p>
        </div>

        {/* Toast success / cancel */}
        {searchParams.success && (
          <div className="mb-6 bg-green-500/10 border border-green-500/20 rounded-2xl px-5 py-4 flex items-center gap-3">
            <CheckCircle2 size={18} className="text-green-400 shrink-0" />
            <p className="text-sm text-green-300 font-medium">Bienvenue dans Pro ! Votre abonnement est actif.</p>
          </div>
        )}
        {searchParams.canceled && (
          <div className="mb-6 bg-white/[0.04] border border-white/8 rounded-2xl px-5 py-4">
            <p className="text-sm text-white/50">Paiement annulé. Vous pouvez réessayer à tout moment.</p>
          </div>
        )}

        {plan === 'pro' ? (
          /* ── Plan Pro actif ── */
          <div className="bg-white/[0.04] border border-white/8 rounded-2xl overflow-hidden">
            <div className="bg-brand/10 border-b border-white/6 px-6 py-5 flex items-center justify-between">
              <div>
                <div className="inline-flex items-center gap-1.5 bg-brand/20 text-brand text-xs font-bold px-2.5 py-1 rounded-full mb-2">
                  <Zap size={10} />
                  PRO
                </div>
                <h2 className="text-white font-semibold text-base">Abonnement actif</h2>
                <p className="text-white/40 text-xs mt-0.5">Toutes les fonctionnalités Pro sont débloquées.</p>
              </div>
              <Shield size={28} className="text-brand/60 shrink-0" />
            </div>
            <div className="px-6 py-5 space-y-3">
              {PRO_FEATURES.map(f => (
                <div key={f} className="flex items-center gap-2.5 text-sm text-white/70">
                  <CheckCircle2 size={14} className="text-brand shrink-0" />
                  {f}
                </div>
              ))}
            </div>
            <div className="px-6 pb-6 border-t border-white/6 pt-4">
              <p className="text-xs text-white/30 mb-3">
                Modifier les moyens de paiement, consulter les factures ou annuler l&apos;abonnement via le portail Stripe.
              </p>
              <PortalButton />
            </div>
          </div>
        ) : (
          /* ── Plan gratuit ── */
          <>
            {/* Plan actuel */}
            <div className="bg-white/[0.04] border border-white/8 rounded-2xl px-6 py-5 mb-6">
              <p className="text-xs text-white/30 uppercase tracking-widest mb-1">Plan actuel</p>
              <p className="text-white font-semibold text-base">Gratuit</p>
              <p className="text-white/40 text-xs mt-1">3 devis par mois · Sans carte bancaire</p>
            </div>

            {/* Offre Pro */}
            <div className="bg-white/[0.04] border border-brand/20 rounded-2xl overflow-hidden relative">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-brand/10 rounded-full blur-3xl pointer-events-none" />
              <div className="bg-brand/10 border-b border-brand/15 px-6 py-5 relative">
                <div className="inline-flex items-center gap-1.5 bg-brand/20 text-brand text-xs font-bold px-2.5 py-1 rounded-full mb-2">
                  <Zap size={10} />
                  PRO — Le plus populaire
                </div>
                <div className="flex items-end gap-2">
                  <span className="text-white font-bold text-3xl tracking-tight">14,99 €</span>
                  <span className="text-white/40 text-sm mb-1">/ mois HT</span>
                </div>
                <p className="text-white/40 text-xs mt-1">Ou 12 € / mois avec l&apos;abonnement annuel (−20 %)</p>
              </div>

              <div className="px-6 py-5 space-y-3">
                {PRO_FEATURES.map(f => (
                  <div key={f} className="flex items-center gap-2.5 text-sm text-white/70">
                    <CheckCircle2 size={14} className="text-brand shrink-0" />
                    {f}
                  </div>
                ))}
              </div>

              <div className="px-6 pb-6 border-t border-white/6 pt-5 relative">
                <p className="text-xs text-white/30 mb-4">
                  Essai gratuit 14 jours — sans carte bancaire requise.
                </p>
                <div className="flex flex-wrap gap-3">
                  <UpgradeButton interval="monthly" label="Commencer l'essai — Mensuel" />
                  <UpgradeButton interval="yearly"  label="Annuel (−20 %)" />
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  )
}
