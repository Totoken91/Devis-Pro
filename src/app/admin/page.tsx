import { AppLayout } from '@/components/shared/AppLayout'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import { formatCurrency } from '@/lib/utils'
import {
  Users, FileText, TrendingUp, Shield, Crown, Calendar, Eye, MessageSquarePlus,
} from 'lucide-react'
import { AdminFeedbackList } from './AdminFeedbackList'

export default async function AdminPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/connexion')

  // Vérifier is_admin
  const { data: myProfile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!myProfile?.is_admin) redirect('/dashboard')

  // Admin client pour requêtes cross-users
  const admin = createAdminClient()

  const [
    { count: totalUsers },
    { count: proUsers },
    { count: totalDevis },
    { data: devisCA },
    { data: recentUsers },
    { count: devisThisMonth },
    { count: uniqueVisitors },
    { data: feedbacksRaw },
  ] = await Promise.all([
    admin.from('profiles').select('*', { count: 'exact', head: true }),
    admin.from('profiles').select('*', { count: 'exact', head: true }).eq('plan', 'pro'),
    admin.from('devis').select('*', { count: 'exact', head: true }),
    admin.from('devis').select('montant_ttc').eq('statut', 'accepte'),
    admin.from('profiles').select('id, email, full_name, company_name, plan, created_at').order('created_at', { ascending: false }).limit(10),
    admin.from('devis').select('*', { count: 'exact', head: true }).gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),
    admin.from('visitors').select('*', { count: 'exact', head: true }),
    admin.from('feedbacks').select('id, created_at, email, message, is_read').order('created_at', { ascending: false }).limit(20),
  ])

  const caTotal = devisCA?.reduce((sum, d) => sum + (d.montant_ttc ?? 0), 0) ?? 0
  const freeUsers = (totalUsers ?? 0) - (proUsers ?? 0)

  return (
    <AppLayout>
      <div className="relative p-6 md:p-10 max-w-5xl mx-auto w-full">

        {/* Glow décoratif */}
        <div className="absolute -top-16 right-0 w-80 h-80 bg-brand/8 rounded-full blur-3xl pointer-events-none" />

        {/* ── Header ── */}
        <div className="mb-10">
          <div className="flex items-center gap-2.5 mb-1">
            <Shield size={18} className="text-brand" />
            <h1 className="font-display text-3xl font-bold text-white tracking-tight">
              Admin
            </h1>
          </div>
          <p className="text-white/35 text-sm">Vue d&apos;ensemble de la plateforme</p>
        </div>

        {/* ── Stats globales ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-10">
          <StatCard
            label="Utilisateurs"
            value={String(totalUsers ?? 0)}
            icon={<Users size={14} />}
            sub={`${proUsers ?? 0} Pro · ${freeUsers} Free`}
          />
          <StatCard
            label="Devis total"
            value={String(totalDevis ?? 0)}
            icon={<FileText size={14} />}
            sub={`${devisThisMonth ?? 0} ce mois`}
          />
          <StatCard
            label="CA accepté"
            value={formatCurrency(caTotal)}
            icon={<TrendingUp size={14} />}
            sub="tous utilisateurs"
            highlight
          />
          <StatCard
            label="Taux Pro"
            value={totalUsers ? `${Math.round(((proUsers ?? 0) / totalUsers) * 100)}%` : '0%'}
            icon={<Crown size={14} />}
            sub={`${proUsers ?? 0} / ${totalUsers ?? 0}`}
          />
          <StatCard
            label="Visiteurs uniques"
            value={String(uniqueVisitors)}
            icon={<Eye size={14} />}
            sub="navigateurs distincts"
          />
        </div>

        {/* ── Dernières inscriptions ── */}
        <section className="relative">
          <div className="flex items-center gap-2 mb-4">
            <Calendar size={14} className="text-white/40" />
            <h2 className="text-sm font-semibold text-white/70 tracking-tight">Dernières inscriptions</h2>
          </div>

          {recentUsers && recentUsers.length > 0 ? (
            <div className="bg-white/[0.03] rounded-2xl border border-white/8 divide-y divide-white/5 overflow-hidden">
              {recentUsers.map((u) => (
                <div
                  key={u.id}
                  className="flex items-center gap-4 px-5 py-3.5"
                >
                  <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-white/40">
                      {(u.email ?? '?')[0]?.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white/85 truncate leading-snug">
                      {u.full_name || u.company_name || u.email}
                    </p>
                    <p className="text-xs text-white/35 mt-0.5 truncate">{u.email}</p>
                  </div>
                  <span className={`shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${
                    u.plan === 'pro'
                      ? 'bg-brand/15 text-brand border border-brand/20'
                      : 'bg-white/8 text-white/40 border border-white/10'
                  }`}>
                    {u.plan === 'pro' ? 'Pro' : 'Free'}
                  </span>
                  <span className="text-xs text-white/25 shrink-0 tabular-nums hidden sm:block">
                    {new Date(u.created_at).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white/[0.03] rounded-2xl border border-white/8 py-14 flex flex-col items-center text-center px-6">
              <p className="text-sm text-white/40">Aucun utilisateur</p>
            </div>
          )}
        </section>

        {/* ── Feedbacks ── */}
        <section className="mt-10 relative">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquarePlus size={14} className="text-brand" />
            <h2 className="text-sm font-semibold text-white/70 tracking-tight">Feedbacks utilisateurs</h2>
            {feedbacksRaw && feedbacksRaw.length > 0 && (
              <span className="text-xs text-white/25">{feedbacksRaw.length}</span>
            )}
          </div>
          <AdminFeedbackList initialFeedbacks={feedbacksRaw ?? []} />
        </section>

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
