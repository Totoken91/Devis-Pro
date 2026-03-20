'use client'

import { formatCurrency } from '@/lib/utils'
import type { DevisLigne, Profile, Client } from '@/types/supabase'
import { Mail, Phone, MapPin } from 'lucide-react'

interface DevisPreviewProps {
  numero: string
  titre: string
  lignes: DevisLigne[]
  tvaTaux: number
  montantHT: number
  montantTVA: number
  montantTTC: number
  dateValidite: string
  notes: string
  conditions: string
  profile: Profile
  client: Client | null
  brandColor: string
}

export function DevisPreview({
  numero, titre, lignes, tvaTaux, montantHT, montantTVA, montantTTC,
  dateValidite, notes, conditions, profile, client, brandColor,
}: DevisPreviewProps) {
  const emetteurName = profile.company_name || profile.full_name || '—'
  const today = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm text-[10px] leading-tight">
      {/* Accent strip */}
      <div className="h-1" style={{ backgroundColor: brandColor }} />

      <div className="px-5 py-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <p className="text-[7px] font-bold uppercase tracking-widest mb-1" style={{ color: brandColor }}>
              Devis
            </p>
            <p className="text-sm font-bold text-gray-900 leading-none mb-0.5">{numero}</p>
            <p className="text-gray-500 text-[9px]">{titre || 'Sans titre'}</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-[7px] font-semibold text-gray-400 uppercase tracking-wider">Émis le</p>
            <p className="text-[9px] font-semibold text-gray-900">{today}</p>
            {dateValidite && (
              <>
                <p className="text-[7px] font-semibold text-gray-400 uppercase tracking-wider mt-1">Valide jusqu&apos;au</p>
                <p className="text-[9px] font-semibold text-gray-900">
                  {new Date(dateValidite).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </>
            )}
          </div>
        </div>

        {/* Parties */}
        <div className="grid grid-cols-2 gap-3 py-3 border-t border-b border-gray-100 mb-4">
          <div>
            <p className="text-[7px] font-bold text-gray-400 uppercase tracking-widest mb-1">De</p>
            <p className="font-semibold text-gray-900">{emetteurName}</p>
            {profile.full_name && profile.company_name && (
              <p className="text-gray-500">{profile.full_name}</p>
            )}
            {profile.email && (
              <p className="text-gray-400 flex items-center gap-0.5 mt-0.5">
                <Mail size={7} className="shrink-0" />{profile.email}
              </p>
            )}
            {profile.phone && (
              <p className="text-gray-400 flex items-center gap-0.5">
                <Phone size={7} className="shrink-0" />{profile.phone}
              </p>
            )}
          </div>
          {client && (
            <div>
              <p className="text-[7px] font-bold text-gray-400 uppercase tracking-widest mb-1">À</p>
              <p className="font-semibold text-gray-900">
                {client.company || client.name}
              </p>
              {client.company && <p className="text-gray-500">{client.name}</p>}
              {client.email && (
                <p className="text-gray-400 flex items-center gap-0.5 mt-0.5">
                  <Mail size={7} className="shrink-0" />{client.email}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Lignes */}
        <table className="w-full mb-4">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left text-[7px] font-bold text-gray-400 uppercase tracking-widest pb-1.5 pr-2">Description</th>
              <th className="text-center text-[7px] font-bold text-gray-400 uppercase tracking-widest pb-1.5 w-8">Qté</th>
              <th className="text-right text-[7px] font-bold text-gray-400 uppercase tracking-widest pb-1.5 w-14">P.U.</th>
              <th className="text-right text-[7px] font-bold text-gray-400 uppercase tracking-widest pb-1.5 w-14">Total</th>
            </tr>
          </thead>
          <tbody>
            {lignes.filter(l => l.description || l.total > 0).map((ligne, i) => (
              <tr key={ligne.id} className={i % 2 === 0 ? '' : 'bg-gray-50/50'}>
                <td className="py-1.5 pr-2 text-gray-900 truncate max-w-[100px]">{ligne.description || '—'}</td>
                <td className="py-1.5 text-gray-400 text-center tabular-nums">{ligne.quantite}</td>
                <td className="py-1.5 text-gray-400 text-right tabular-nums">{formatCurrency(ligne.prix_unitaire)}</td>
                <td className="py-1.5 font-medium text-gray-900 text-right tabular-nums">{formatCurrency(ligne.total)}</td>
              </tr>
            ))}
            {lignes.filter(l => l.description || l.total > 0).length === 0 && (
              <tr>
                <td colSpan={4} className="py-3 text-center text-gray-300 italic">Aucune ligne</td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Totaux */}
        <div className="flex justify-end mb-3">
          <div className="w-36">
            <div className="space-y-1 mb-2">
              <div className="flex justify-between">
                <span className="text-gray-400">HT</span>
                <span className="font-medium text-gray-700 tabular-nums">{formatCurrency(montantHT)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">TVA ({tvaTaux}%)</span>
                <span className="font-medium text-gray-700 tabular-nums">{formatCurrency(montantTVA)}</span>
              </div>
            </div>
            <div className="rounded-lg px-3 py-2 flex items-center justify-between" style={{ backgroundColor: brandColor }}>
              <span className="text-[9px] font-semibold text-white/70">TTC</span>
              <span className="text-xs font-bold text-white tabular-nums">{formatCurrency(montantTTC)}</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        {(notes || conditions) && (
          <div className="border-t border-gray-100 pt-2 space-y-2">
            {notes && (
              <div>
                <p className="text-[7px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Notes</p>
                <p className="text-gray-600 whitespace-pre-line line-clamp-3">{notes}</p>
              </div>
            )}
            {conditions && (
              <div>
                <p className="text-[7px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Conditions</p>
                <p className="text-gray-600 whitespace-pre-line line-clamp-2">{conditions}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-5 py-2 border-t border-gray-100 text-center text-gray-300">
        Propulsé par <span className="font-semibold text-gray-400">Deviso</span>
      </div>
    </div>
  )
}
