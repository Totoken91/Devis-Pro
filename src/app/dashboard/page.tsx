import { AppLayout } from '@/components/shared/AppLayout'
import { createClient } from '@/lib/supabase/server'
import {
  FileText, Users, TrendingUp, Plus, ArrowRight,
  Clock, CheckCircle2, Send, Eye, XCircle, AlertCircle,
} from 'lucide-react'
import Link from 'next/link'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Devis, DevisStatut } from '@/types/supabase'

type RecentDevis = {
  id: string
  numero: string
  titre: string
  statut: DevisStatut
  montant_ttc: number | null
  created_at: string
  clients: { name: string } | null
}

/* ─── Status config ──────────────────────────────────────────── */

const STATUT_CONFIG: Record<DevisStatut, { label: string; color: string; dot: string }> = {
  brouillon: { label: 'Brouillon',  color: 'bg-gray-100 text-gray-500',   dot: 'bg-gray-400'   },
  envoye:    { label: 'Envoyé',     color: 'bg-blue-50 text-blue-600',    dot: 'bg-blue-500'   },
  ouvert:    { label: 'Ouvert',     color: 'bg-amber-50 text-amber-600',  dot: 'bg-amber-400'  },
  accepte:   { label: 'Accepté',    color: 'bg-brand-light text-brand-dark', dot: 'bg-brand'  },
  refuse:    { label: 'Refusé',     color: 'bg-red-50 text-red-600',      dot: 'bg-red-500'    },
  expire:    { label: 'Expiré',     color: 'bg-orange-50 text-orange-600', dot: 'bg-orange-400' },
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
      .select('id, numero, titre, statut, montant_ttc, created_at, clients(name)')
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
      <div className="p-6 md:p-10 max-w-4xl mx-auto w-full">

        {/* ── Header ── */}
        <div className="flex items-start justify-between mb-10 gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold text-gray-900 tracking-tight leading-tight">
              Bonjour, {prenom}
            </h1>
            <p className="text-gray-400 mt-1 text-sm capitalize">{dateLabel}</p>
          </div>
          <Link
            href="/devis/nouveau"
            className="
              shrink-0 flex items-center gap-2
              bg-brand hover:bg-brand-dark
              text-white font-semibold rounded-xl px-4 py-2.5 text-sm
              transition-all duration-150
              shadow-sm shadow-brand/30 hover:shadow-md hover:shadow-brand/25
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
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-900 tracking-tight">Devis récents</h2>
            <Link
              href="/devis"
              className="text-xs text-gray-400 hover:text-brand transition-colors flex items-center gap-1 group"
            >
              Voir tous
              <ArrowRight size={11} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {recentDevis && recentDevis.length > 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50 overflow-hidden">
              {recentDevis.map((d) => {
                const cfg = STATUT_CONFIG[d.statut]
                const clientName = d.clients?.name
                return (
                  <Link
                    key={d.id}
                    href={`/devis/${d.id}`}
                    className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50/80 transition-colors group"
                  >
                    <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-brand/8 transition-colors">
                      <FileText size={13} className="text-gray-400 group-hover:text-brand transition-colors" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate leading-snug">{d.titre}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {d.numero}
                        {clientName && <> · {clientName}</>}
                      </p>
                    </div>
                    <span className={`shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${cfg.color}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                      {cfg.label}
                    </span>
                    <span className="text-sm font-semibold text-gray-900 shrink-0 hidden sm:block tabular-nums">
                      {formatCurrency(d.montant_ttc ?? 0)}
                    </span>
                    <ArrowRight size={13} className="text-gray-200 group-hover:text-brand shrink-0 transition-colors" />
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
          <div className="relative overflow-hidden bg-gray-950 rounded-2xl p-6 text-white">
            {/* Glow */}
            <div className="absolute -top-8 -right-8 w-40 h-40 bg-brand/25 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-brand/10 rounded-full blur-2xl pointer-events-none" />
            <div className="relative flex items-center justify-between gap-4">
              <div>
                <p className="font-display font-semibold text-base leading-snug mb-1">
                  Tu es sur le plan gratuit
                </p>
                <p className="text-sm text-white/50">
                  Devis illimités, signature électronique et relances automatiques en Pro.
                </p>
              </div>
              <button className="shrink-0 bg-brand hover:bg-brand-dark text-white font-semibold text-sm px-4 py-2 rounded-xl transition-colors shadow-sm shadow-brand/30 cursor-pointer">
                Passer Pro
              </button>
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
      rounded-2xl border p-5 flex flex-col gap-3 transition-all
      ${highlight
        ? 'bg-brand border-brand/20 shadow-sm shadow-brand/15'
        : 'bg-white border-gray-100'
      }
    `}>
      <div className="flex items-center justify-between">
        <span className={`text-xs font-medium ${highlight ? 'text-white/70' : 'text-gray-400'}`}>
          {label}
        </span>
        <div className={`
          w-7 h-7 rounded-lg flex items-center justify-center
          ${highlight ? 'bg-white/15 text-white' : 'bg-gray-100 text-gray-500'}
        `}>
          {icon}
        </div>
      </div>
      <div>
        <p className={`font-display text-2xl font-bold tracking-tight leading-none ${highlight ? 'text-white' : 'text-gray-900'}`}>
          {value}
        </p>
        <p className={`text-xs mt-1 ${highlight ? 'text-white/50' : 'text-gray-400'}`}>{sub}</p>
      </div>
    </div>
  )
}

/* ─── EmptyDevis ─────────────────────────────────────────────── */

function EmptyDevis() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 py-14 flex flex-col items-center text-center px-6">
      <div className="w-12 h-12 bg-brand/8 rounded-2xl flex items-center justify-center mb-4">
        <FileText size={20} className="text-brand/60" />
      </div>
      <p className="text-sm font-medium text-gray-900 mb-1">Aucun devis pour l&apos;instant</p>
      <p className="text-xs text-gray-400 mb-6 max-w-xs">
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
