import { AppLayout } from '@/components/shared/AppLayout'
import { createClient } from '@/lib/supabase/server'
import {
  FileText, Users, TrendingUp, Plus, ArrowRight, Zap, Bell,
} from 'lucide-react'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils'
import type { Devis, DevisStatut } from '@/types/supabase'

type RecentDevis = {
  id: string
  numero: string
  titre: string
  statut: DevisStatut
  montant_ttc: number | null
  created_at: string
  relance_active: boolean
  derniere_relance: string | null
  clients: { name: string } | null
}

function getRelanceInfo(d: RecentDevis): { jours: number; premiere: boolean } | null {
  if (!d.relance_active) return null
  if (d.statut !== 'envoye' && d.statut !== 'ouvert') return null
  const premiere = !d.derniere_relance
  const nextMs = d.derniere_relance
    ? new Date(d.derniere_relance).getTime() + 4 * 86_400_000
    : new Date(d.created_at).getTime() + 3 * 86_400_000
  const jours = Math.ceil((nextMs - Date.now()) / 86_400_000)
  return { jours, premiere }
}

/* ─── Status config ──────────────────────────────────────────── */

const STATUT_CONFIG: Record<DevisStatut, { label: string; color: string; dot: string }> = {
  brouillon: { label: 'Brouillon',  color: 'bg-white/8 text-white/40 border border-white/10',                  dot: 'bg-white/30'   },
  envoye:    { label: 'Envoyé',     color: 'bg-blue-500/15 text-blue-400 border border-blue-500/20',           dot: 'bg-blue-400'   },
  ouvert:    { label: 'Ouvert',     color: 'bg-amber-500/15 text-amber-400 border border-amber-500/20',        dot: 'bg-amber-400'  },
  accepte:   { label: 'Accepté',    color: 'bg-brand/15 text-brand border border-brand/20',                    dot: 'bg-brand'      },
  refuse:    { label: 'Refusé',     color: 'bg-red-500/15 text-red-400 border border-red-500/20',              dot: 'bg-red-400'    },
  expire:    { label: 'Expiré',     color: 'bg-orange-500/15 text-orange-400 border border-orange-500/20',     dot: 'bg-orange-400' },
}

/* ─── Page ───────────────────────────────────────────────────── */

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, plan')
    .eq('id', user!.id)
    .single()

  const now       = new Date()
  const debutMois = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  const [
    { count: clientsCount },
    { count: devisMoisCount },
    { data: devisCA },
    { data: recentRaw },
  ] = await Promise.all([
    supabase
      .from('clients')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user!.id),
    supabase
      .from('devis')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user!.id)
      .gte('created_at', debutMois),
    supabase
      .from('devis')
      .select('montant_ttc')
      .eq('user_id', user!.id)
      .eq('statut', 'accepte'),
    supabase
      .from('devis')
      .select('id, numero, titre, statut, montant_ttc, created_at, relance_active, derniere_relance, clients(name)')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false })
      .limit(6),
  ])

  const recentDevis = recentRaw as RecentDevis[] | null
  const chiffreAffaires = devisCA?.reduce((sum, d) => sum + (d.montant_ttc ?? 0), 0) ?? 0
  const prenom = profile?.full_name?.split(' ')[0] ?? 'toi'

  const dateLabel = now.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  return (
    <AppLayout>
      <div className="relative p-6 md:p-10 max-w-4xl mx-auto w-full">

        {/* Glow décoratif */}
        <div className="absolute -top-16 right-0 w-80 h-80 bg-brand/8 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 -right-20 w-48 h-48 bg-brand/5 rounded-full blur-3xl pointer-events-none" />

        {/* ── Header ── */}
        <div className="flex items-start justify-between mb-10 gap-4 relative">
          <div>
            <h1 className="font-display text-3xl font-bold text-white tracking-tight leading-tight">
              Bonjour, {prenom}
            </h1>
            <p className="text-white/35 mt-1 text-sm capitalize">{dateLabel}</p>
          </div>
          <Link
            href="/devis/nouveau"
            className="
              shrink-0 flex items-center gap-2
              bg-brand hover:bg-brand-dark
              text-white font-semibold rounded-xl px-4 py-2.5 text-sm
              transition-all duration-150
              shadow-sm shadow-brand/30 hover:shadow-md hover:shadow-brand/40
              hover:-translate-y-px
            "
          >
            <Plus size={15} strokeWidth={2.5} />
            Nouveau devis
          </Link>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          <StatCard
            label="Devis ce mois"
            value={String(devisMoisCount ?? 0)}
            icon={<FileText size={14} />}
            sub="créés ce mois-ci"
          />
          <StatCard
            label="Clients"
            value={String(clientsCount ?? 0)}
            icon={<Users size={14} />}
            sub="dans ta base"
          />
          <StatCard
            label="CA accepté"
            value={formatCurrency(chiffreAffaires)}
            icon={<TrendingUp size={14} />}
            sub="devis signés"
            highlight
          />
        </div>

        {/* ── Devis récents ── */}
        <section className="mb-8 relative">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white/70 tracking-tight">Devis récents</h2>
            <Link
              href="/devis"
              className="text-xs text-white/30 hover:text-brand transition-colors flex items-center gap-1 group"
            >
              Voir tous
              <ArrowRight size={11} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {recentDevis && recentDevis.length > 0 ? (
            <div className="bg-white/[0.03] rounded-2xl border border-white/8 divide-y divide-white/5 overflow-hidden">
              {recentDevis.map((d) => {
                const cfg = STATUT_CONFIG[d.statut]
                const clientName = d.clients?.name
                return (
                  <Link
                    key={d.id}
                    href={`/devis/${d.id}`}
                    className="flex items-center gap-4 px-5 py-3.5 hover:bg-white/[0.04] transition-colors group"
                  >
                    <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-brand/10 transition-colors">
                      <FileText size={13} className="text-white/30 group-hover:text-brand transition-colors" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white/85 truncate leading-snug">{d.titre}</p>
                      <p className="text-xs text-white/35 mt-0.5">
                        {d.numero}
                        {clientName && <> · {clientName}</>}
                      </p>
                    </div>
                    {(() => {
                      const info = getRelanceInfo(d)
                      if (!info) return null
                      const { jours: j, premiere } = info
                      if (j < 0) return null
                      const countdown = j > 1 ? `dans ${j}j` : j === 1 ? 'demain' : "aujourd'hui"
                      const cls = j > 1
                        ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                        : j === 1
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        : 'bg-orange-500/10 text-orange-400 border-orange-500/20'
                      return (
                        <span className={`shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium border ${cls}`}>
                          <Bell size={9} />
                          {premiere ? countdown : `1ère faite · ${countdown}`}
                        </span>
                      )
                    })()}
                    <span className={`shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${cfg.color}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                      {cfg.label}
                    </span>
                    <span className="text-sm font-semibold text-white/60 shrink-0 hidden sm:block tabular-nums">
                      {formatCurrency(d.montant_ttc ?? 0)}
                    </span>
                    <ArrowRight size={13} className="text-white/15 group-hover:text-brand shrink-0 transition-colors" />
                  </Link>
                )
              })}
            </div>
          ) : (
            <EmptyDevis />
          )}
        </section>

        {/* ── Plan banner ── */}
        {profile?.plan === 'free' && (
          <div className="relative overflow-hidden bg-white/[0.03] border border-brand/15 rounded-2xl p-6 text-white">
            <div className="absolute -top-8 -right-8 w-40 h-40 bg-brand/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-brand/8 rounded-full blur-2xl pointer-events-none" />
            <div className="relative flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="font-display font-semibold text-base leading-snug mb-1">
                  Plan gratuit
                </p>
                <p className="text-sm text-white/45 mb-3">
                  Devis illimités, relances automatiques et tracking avancé en Pro.
                </p>
                {/* Barre de progression usage mensuel */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-1.5 bg-white/8 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min((devisMoisCount ?? 0) / 3 * 100, 100)}%`,
                        backgroundColor: (devisMoisCount ?? 0) >= 3 ? '#ef4444' : '#6CC531',
                      }}
                    />
                  </div>
                  <span className={`text-xs font-medium tabular-nums shrink-0 ${(devisMoisCount ?? 0) >= 3 ? 'text-red-400' : 'text-white/40'}`}>
                    {devisMoisCount ?? 0} / 3 ce mois
                  </span>
                </div>
              </div>
              <Link
                href="/parametres/facturation"
                className="shrink-0 inline-flex items-center gap-1.5 bg-brand hover:bg-brand-dark text-white font-semibold text-sm px-4 py-2 rounded-xl transition-all shadow-sm shadow-brand/30 hover:shadow-brand/50 hover:-translate-y-px"
              >
                <Zap size={13} />
                Passer Pro
              </Link>
            </div>
          </div>
        )}

      </div>
    </AppLayout>
  )
}

/* ─── StatCard ───────────────────────────────────────────────── */

function StatCard({
  label,
  value,
  icon,
  sub,
  highlight = false,
}: {
  label: string
  value: string
  icon: React.ReactNode
  sub: string
  highlight?: boolean
}) {
  return (
    <div className={`
      relative overflow-hidden rounded-2xl border p-5 flex flex-col gap-3 transition-all duration-200
      ${highlight
        ? 'bg-brand/10 border-brand/25 hover:border-brand/40'
        : 'bg-white/[0.04] border-white/8 hover:border-white/15'}
    `}>
      {/* Glow interne sur la carte highlight */}
      {highlight && (
        <div className="absolute -top-6 -right-6 w-24 h-24 bg-brand/25 rounded-full blur-2xl pointer-events-none" />
      )}
      <div className="flex items-center justify-between relative">
        <span className={`text-xs font-medium ${highlight ? 'text-brand/70' : 'text-white/40'}`}>
          {label}
        </span>
        <div className={`
          w-7 h-7 rounded-lg flex items-center justify-center
          ${highlight ? 'bg-brand/20 text-brand' : 'bg-white/8 text-white/40'}
        `}>
          {icon}
        </div>
      </div>
      <div className="relative">
        <p className={`font-display text-2xl font-bold tracking-tight leading-none ${highlight ? 'text-brand' : 'text-white'}`}>
          {value}
        </p>
        <p className={`text-xs mt-1 ${highlight ? 'text-brand/50' : 'text-white/35'}`}>{sub}</p>
      </div>
    </div>
  )
}

/* ─── EmptyDevis ─────────────────────────────────────────────── */

function EmptyDevis() {
  return (
    <div className="bg-white/[0.03] rounded-2xl border border-white/8 py-14 flex flex-col items-center text-center px-6">
      <div className="w-12 h-12 bg-brand/10 border border-brand/15 rounded-2xl flex items-center justify-center mb-4">
        <FileText size={20} className="text-brand/60" />
      </div>
      <p className="text-sm font-medium text-white/70 mb-1">Aucun devis pour l&apos;instant</p>
      <p className="text-xs text-white/30 mb-6 max-w-xs">
        Crée ton premier devis en quelques clics et envoie-le directement à ton client.
      </p>
      <Link
        href="/devis/nouveau"
        className="inline-flex items-center gap-2 bg-brand hover:bg-brand-dark text-white font-semibold rounded-xl px-4 py-2.5 text-sm transition-all shadow-sm shadow-brand/25 hover:-translate-y-px"
      >
        <Plus size={14} />
        Créer un devis
      </Link>
    </div>
  )
}
