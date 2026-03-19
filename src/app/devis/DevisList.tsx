'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Devis } from '@/types/supabase'
import { Plus, FileText, Pencil, Trash2, Copy, Eye } from 'lucide-react'
import Link from 'next/link'

type DevisWithClient = Devis & {
  clients: { name: string; company: string | null } | null
}

const STATUT_STYLE: Record<Devis['statut'], string> = {
  brouillon: 'bg-gray-100 text-gray-600',
  envoye:    'bg-blue-100 text-blue-700',
  ouvert:    'bg-purple-100 text-purple-700',
  accepte:   'bg-green-100 text-green-700',
  refuse:    'bg-red-100 text-red-700',
  expire:    'bg-orange-100 text-orange-700',
}

const STATUT_LABEL: Record<Devis['statut'], string> = {
  brouillon: 'Brouillon',
  envoye:    'Envoyé',
  ouvert:    'Ouvert',
  accepte:   'Accepté',
  refuse:    'Refusé',
  expire:    'Expiré',
}

interface DevisListProps {
  initialDevis: DevisWithClient[]
}

export function DevisList({ initialDevis }: DevisListProps) {
  const [devisList, setDevisList] = useState<DevisWithClient[]>(initialDevis)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const supabase = createClient()

  const handleDelete = async (id: string) => {
    await supabase.from('devis').delete().eq('id', id)
    setDevisList((prev) => prev.filter((d) => d.id !== id))
    setDeleteId(null)
  }

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mes devis</h1>
          <p className="text-gray-500 mt-1">{devisList.length} devis</p>
        </div>
        <Link
          href="/devis/nouveau"
          className="flex items-center gap-2 bg-[#2E86C1] hover:bg-[#1E3A5F] text-white font-semibold rounded-xl px-4 py-2.5 text-sm transition-colors"
        >
          <Plus size={16} />
          Nouveau devis
        </Link>
      </div>

      {/* Vide */}
      {devisList.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText size={28} className="text-[#2E86C1]" />
          </div>
          <p className="text-gray-900 font-medium mb-1">Aucun devis pour l&apos;instant</p>
          <p className="text-gray-400 text-sm mb-6">Crée ton premier devis en quelques clics.</p>
          <Link
            href="/devis/nouveau"
            className="inline-flex items-center gap-2 bg-[#2E86C1] text-white font-semibold rounded-xl px-4 py-2.5 text-sm hover:bg-[#1E3A5F] transition-colors"
          >
            <Plus size={16} />
            Nouveau devis
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden overflow-x-auto">
          <table className="w-full min-w-[500px]">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Numéro</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Titre</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3 hidden md:table-cell">Client</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Statut</th>
                <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3 hidden lg:table-cell">Montant TTC</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3 hidden xl:table-cell">Date</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {devisList.map((d) => (
                <tr key={d.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="text-sm font-mono text-gray-700">{d.numero}</span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-gray-900 truncate max-w-[200px]">{d.titre}</p>
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    <p className="text-sm text-gray-500">
                      {d.clients?.name ?? <span className="text-gray-300">—</span>}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-medium ${STATUT_STYLE[d.statut]}`}>
                      {STATUT_LABEL[d.statut]}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right hidden lg:table-cell">
                    <span className="text-sm font-semibold text-gray-900">{formatCurrency(d.montant_ttc)}</span>
                  </td>
                  <td className="px-6 py-4 hidden xl:table-cell">
                    <span className="text-sm text-gray-400">{formatDate(d.created_at)}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1 justify-end">
                      <a
                        href={`/q/${d.token_public}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 text-gray-400 hover:text-[#2E86C1] hover:bg-blue-50 rounded-lg transition-colors"
                        title={d.statut === 'brouillon' ? 'Prévisualiser' : 'Voir la page publique'}
                      >
                        <Eye size={15} />
                      </a>
                      <button
                        onClick={() => navigator.clipboard.writeText(`${window.location.origin}/q/${d.token_public}`)}
                        className="p-2 text-gray-400 hover:text-[#2E86C1] hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                        title="Copier le lien"
                      >
                        <Copy size={15} />
                      </button>
                      <Link
                        href={`/devis/${d.id}`}
                        className="p-2 text-gray-400 hover:text-[#2E86C1] hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Pencil size={15} />
                      </Link>
                      <button
                        onClick={() => setDeleteId(d.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Confirmation suppression */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={20} className="text-red-500" />
            </div>
            <h2 className="text-base font-semibold text-gray-900 mb-2">Supprimer ce devis ?</h2>
            <p className="text-sm text-gray-500 mb-6">Cette action est irréversible.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 border border-gray-300 text-gray-700 font-medium rounded-xl py-2.5 hover:bg-gray-50 transition-colors text-sm cursor-pointer"
              >
                Annuler
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl py-2.5 transition-colors text-sm cursor-pointer"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
