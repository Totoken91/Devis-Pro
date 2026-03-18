import { AppLayout } from '@/components/shared/AppLayout'
import { createClient } from '@/lib/supabase/server'
import { FileText, Users, TrendingUp, Plus } from 'lucide-react'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, plan')
    .eq('id', user!.id)
    .single()

  const { count: clientsCount } = await supabase
    .from('clients')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user!.id)

  const prenom = profile?.full_name?.split(' ')[0] ?? 'toi'

  return (
    <AppLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Bonjour, {prenom} 👋</h1>
          <p className="text-gray-500 mt-1">Voici un aperçu de ton activité.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            icon={<FileText size={22} className="text-[#2E86C1]" />}
            label="Devis ce mois"
            value="—"
            sub="disponible en S4"
          />
          <StatCard
            icon={<Users size={22} className="text-[#2E86C1]" />}
            label="Clients"
            value={clientsCount ?? 0}
            sub="dans ta base"
          />
          <StatCard
            icon={<TrendingUp size={22} className="text-[#2E86C1]" />}
            label="Chiffre d'affaires"
            value="—"
            sub="disponible en S4"
          />
        </div>

        {/* Actions rapides */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Actions rapides</h2>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/clients"
              className="flex items-center gap-2 bg-[#2E86C1] text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-[#1E3A5F] transition-colors"
            >
              <Plus size={16} />
              Ajouter un client
            </Link>
            <Link
              href="/devis"
              className="flex items-center gap-2 border border-gray-300 text-gray-700 px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              <Plus size={16} />
              Nouveau devis
              <span className="text-xs bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded-md">S4</span>
            </Link>
          </div>
        </div>

        {/* Plan */}
        {profile?.plan === 'free' && (
          <div className="mt-6 bg-gradient-to-r from-[#1E3A5F] to-[#2E86C1] rounded-2xl p-6 text-white">
            <p className="font-semibold mb-1">Plan gratuit — 3 devis/mois</p>
            <p className="text-sm text-white/70">
              Passe en Pro pour des devis illimités, signature électronique et relances automatiques.
            </p>
          </div>
        )}
      </div>
    </AppLayout>
  )
}

function StatCard({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode
  label: string
  value: string | number
  sub: string
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-gray-500">{label}</span>
        <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center">
          {icon}
        </div>
      </div>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-400 mt-1">{sub}</p>
    </div>
  )
}
