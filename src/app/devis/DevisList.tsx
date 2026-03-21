'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Devis, DevisStatut } from '@/types/supabase'
import { Plus, FileText, Pencil, Trash2, Copy, Eye, Users, Bell } from 'lucide-react'
import Link from 'next/link'
import { Spinner } from '@/components/ui/Spinner'

type DevisWithClient = Devis & {
  clients: { name: string; company: string | null } | null
}

function getRelanceInfo(d: DevisWithClient): { jours: number; premiere: boolean } | null {
  if (!d.relance_active) return null
  if (d.statut !== 'envoye' && d.statut !== 'ouvert') return null
  const premiere = !d.derniere_relance
  const nextMs = d.derniere_relance
    ? new Date(d.derniere_relance).getTime() + 4 * 86_400_000
    : new Date(d.created_at).getTime() + 3 * 86_400_000
  const jours = Math.ceil((nextMs - Date.now()) / 86_400_000)
  return { jours, premiere }
}

const STATUT_CONFIG: Record<DevisStatut, { label: string; color: string; dot: string }> = {
  brouillon: { label: 'Brouillon', color: 'bg-white/8 text-white/40 border border-white/10',               dot: 'bg-white/30'   },
  envoye:    { label: 'Envoyé',    color: 'bg-blue-500/15 text-blue-400 border border-blue-500/20',        dot: 'bg-blue-400'   },
  ouvert:    { label: 'Ouvert',    color: 'bg-amber-500/15 text-amber-400 border border-amber-500/20',     dot: 'bg-amber-400'  },
  accepte:   { label: 'Accepté',  color: 'bg-brand/15 text-brand border border-brand/20',                  dot: 'bg-brand'      },
  refuse:    { label: 'Refusé',   color: 'bg-red-500/15 text-red-400 border border-red-500/20',            dot: 'bg-red-400'    },
  expire:    { label: 'Expiré',   color: 'bg-orange-500/15 text-orange-400 border border-orange-500/20',   dot: 'bg-orange-400' },
}

export function DevisList({ initialDevis, hasClients }: { initialDevis: DevisWithClient[]; hasClients: boolean }) {
  const [devisList, setDevisList] = useState<DevisWithClient[]>(initialDevis)
  const [deleteId,      setDeleteId]      = useState<string | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const supabase = createClient()

  const handleDelete = async (id: string) => {
    setDeleteLoading(true)
    await supabase.from('devis').delete().eq('id', id)
    setDevisList((prev) => prev.filter((d) => d.id !== id))
    setDeleteLoading(false)
    setDeleteId(null)
  }

  return (
    <div className="p-4 md:p-8">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl font-bold text-white tracking-tight">Mes devis</h1>
          <p className="text-white/35 mt-0.5 text-sm">{devisList.length} devis</p>
        </div>
        <Link
          href="/devis/nouveau"
          className="flex items-center gap-2 bg-brand hover:bg-brand-dark text-white font-semibold rounded-xl px-4 py-2.5 text-sm transition-all shadow-sm shadow-brand/25 hover:-translate-y-px"
        >
          <Plus size={15} strokeWidth={2.5} />
          Nouveau devis
        </Link>
      </div>

      {/* Bannière : aucun client enregistré */}
      {!hasClients && (
        <Link
          href="/clients"
          className="flex items-center gap-3 bg-brand/8 border border-brand/20 rounded-xl px-4 py-3 mb-5 hover:bg-brand/12 transition-colors group"
        >
          <div className="w-8 h-8 bg-brand/15 border border-brand/25 rounded-lg flex items-center justify-center shrink-0">
            <Users size={15} className="text-brand" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white/80">Commence par ajouter tes clients</p>
            <p className="text-xs text-white/35">Ils seront disponibles lors de la création d&apos;un devis.</p>
          </div>
          <span className="text-xs font-semibold text-brand opacity-70 group-hover:opacity-100 transition-opacity shrink-0">
            Ajouter →
          </span>
        </Link>
      )}

      {devisList.length === 0 ? (
        /* ── Empty state ── */
        <div className="bg-white/[0.03] rounded-2xl border border-white/8 py-16 flex flex-col items-center text-center px-6">
          <div className="w-12 h-12 bg-brand/10 border border-brand/15 rounded-2xl flex items-center justify-center mb-4">
            <FileText size={20} className="text-brand/60" />
          </div>
          <p className="text-sm font-medium text-white/70 mb-1">Aucun devis pour l&apos;instant</p>
          <p className="text-xs text-white/30 mb-6 max-w-xs">
            Crée ton premier devis et envoie-le directement à ton client.
          </p>
          <Link
            href="/devis/nouveau"
            className="inline-flex items-center gap-2 bg-brand hover:bg-brand-dark text-white font-semibold rounded-xl px-4 py-2.5 text-sm transition-all shadow-sm shadow-brand/25 hover:-translate-y-px"
          >
            <Plus size={14} />
            Créer un devis
          </Link>
        </div>
      ) : (
        /* ── Table ── */
        <div className="bg-white/[0.03] rounded-2xl border border-white/8 overflow-hidden overflow-x-auto">
          <table className="w-full min-w-[500px]">
            <thead>
              <tr className="border-b border-white/6 bg-white/[0.02]">
                <th className="text-left text-[11px] font-semibold text-white/30 uppercase tracking-wider px-5 py-3">Numéro</th>
                <th className="text-left text-[11px] font-semibold text-white/30 uppercase tracking-wider px-5 py-3">Titre</th>
                <th className="text-left text-[11px] font-semibold text-white/30 uppercase tracking-wider px-5 py-3 hidden md:table-cell">Client</th>
                <th className="text-left text-[11px] font-semibold text-white/30 uppercase tracking-wider px-5 py-3">Statut</th>
                <th className="text-right text-[11px] font-semibold text-white/30 uppercase tracking-wider px-5 py-3 hidden lg:table-cell">Montant TTC</th>
                <th className="text-left text-[11px] font-semibold text-white/30 uppercase tracking-wider px-5 py-3 hidden xl:table-cell">Date</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {devisList.map((d) => {
                const cfg = STATUT_CONFIG[d.statut]
                return (
                  <tr key={d.id} className="hover:bg-white/[0.03] transition-colors group">
                    <td className="px-5 py-3.5">
                      <span className="text-xs font-mono text-white/40 bg-white/6 px-2 py-0.5 rounded-md">{d.numero}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-sm font-medium text-white/80 truncate max-w-[200px]">{d.titre}</p>
                    </td>
                    <td className="px-5 py-3.5 hidden md:table-cell">
                      <p className="text-sm text-white/40">
                        {d.clients?.name ?? <span className="text-white/15">—</span>}
                      </p>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
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
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium border ${cls}`}>
                              <Bell size={9} />
                              {premiere ? countdown : `1ère faite · ${countdown}`}
                            </span>
                          )
                        })()}
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${cfg.color}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                          {cfg.label}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-right hidden lg:table-cell">
                      <span className="text-sm font-semibold text-white/70 tabular-nums">{formatCurrency(d.montant_ttc)}</span>
                    </td>
                    <td className="px-5 py-3.5 hidden xl:table-cell">
                      <span className="text-sm text-white/35">{formatDate(d.created_at)}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-0.5 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                        <a
                          href={`/q/${d.token_public}`}
                          target="_blank" rel="noreferrer"
                          className="p-1.5 text-white/30 hover:text-brand hover:bg-brand/8 rounded-lg transition-colors"
                          title="Voir la page publique"
                        >
                          <Eye size={14} />
                        </a>
                        <button
                          onClick={() => navigator.clipboard.writeText(`${window.location.origin}/q/${d.token_public}`)}
                          className="p-1.5 text-white/30 hover:text-brand hover:bg-brand/8 rounded-lg transition-colors cursor-pointer"
                          title="Copier le lien"
                        >
                          <Copy size={14} />
                        </button>
                        <Link
                          href={`/devis/${d.id}`}
                          className="p-1.5 text-white/30 hover:text-brand hover:bg-brand/8 rounded-lg transition-colors"
                        >
                          <Pencil size={14} />
                        </Link>
                        <button
                          onClick={() => setDeleteId(d.id)}
                          className="p-1.5 text-white/30 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal suppression */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0D1320] border border-white/10 rounded-2xl shadow-2xl shadow-black/60 w-full max-w-sm p-6 text-center">
            <div className="w-10 h-10 bg-red-500/10 border border-red-500/15 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Trash2 size={18} className="text-red-400" />
            </div>
            <h2 className="text-base font-semibold text-white mb-1">Supprimer ce devis ?</h2>
            <p className="text-sm text-white/40 mb-6">Cette action est irréversible.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 border border-white/10 text-white/60 font-medium rounded-xl py-2.5 hover:bg-white/5 transition-colors text-sm cursor-pointer"
              >
                Annuler
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                disabled={deleteLoading}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl py-2.5 transition-colors text-sm cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {deleteLoading ? <span className="inline-flex items-center gap-2"><Spinner />Suppression…</span> : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
