'use client'

import { formatCurrency } from '@/lib/utils'
import type { DevisLigne, DevisTemplate, Profile, Client } from '@/types/supabase'
import { Mail, Phone } from 'lucide-react'

interface DevisPreviewProps {
  numero: string
  titre: string
  template: DevisTemplate
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

export function DevisPreview(props: DevisPreviewProps) {
  switch (props.template) {
    case 'moderne':
      return <ModernePreview {...props} />
    case 'minimaliste':
      return <MinimalistePreview {...props} />
    default:
      return <ClassiquePreview {...props} />
  }
}

/* ═══════════════════════════════════════════════════════════════
   SHARED
   ═══════════════════════════════════════════════════════════════ */

function usePreviewData(props: DevisPreviewProps) {
  const emetteurName = props.profile.company_name || props.profile.full_name || '—'
  const today = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
  const validite = props.dateValidite
    ? new Date(props.dateValidite).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
    : null
  const visibleLignes = props.lignes.filter(l => l.description || l.total > 0)
  return { emetteurName, today, validite, visibleLignes }
}

function NotesBlock({ notes, conditions, labelCls }: { notes: string; conditions: string; labelCls: string }) {
  if (!notes && !conditions) return null
  return (
    <div className="border-t border-gray-100 pt-2 space-y-2">
      {notes && (
        <div>
          <p className={labelCls}>Notes</p>
          <p className="text-gray-600 whitespace-pre-line line-clamp-3">{notes}</p>
        </div>
      )}
      {conditions && (
        <div>
          <p className={labelCls}>Conditions</p>
          <p className="text-gray-600 whitespace-pre-line line-clamp-2">{conditions}</p>
        </div>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   CLASSIQUE — Accent strip, structured traditional layout
   ═══════════════════════════════════════════════════════════════ */

function ClassiquePreview(props: DevisPreviewProps) {
  const { emetteurName, today, validite, visibleLignes } = usePreviewData(props)
  const { numero, titre, tvaTaux, montantHT, montantTVA, montantTTC, profile, client, brandColor, notes, conditions } = props
  const labelCls = 'text-[7px] font-bold text-gray-400 uppercase tracking-widest mb-0.5'

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm text-[10px] leading-tight">
      <div className="h-1" style={{ backgroundColor: brandColor }} />
      <div className="px-5 py-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <p className="text-[7px] font-bold uppercase tracking-widest mb-1" style={{ color: brandColor }}>Devis</p>
            <p className="text-sm font-bold text-gray-900 leading-none mb-0.5">{numero}</p>
            <p className="text-gray-500 text-[9px]">{titre || 'Sans titre'}</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-[7px] font-semibold text-gray-400 uppercase tracking-wider">Émis le</p>
            <p className="text-[9px] font-semibold text-gray-900">{today}</p>
            {validite && (
              <>
                <p className="text-[7px] font-semibold text-gray-400 uppercase tracking-wider mt-1">Valide jusqu&apos;au</p>
                <p className="text-[9px] font-semibold text-gray-900">{validite}</p>
              </>
            )}
          </div>
        </div>

        {/* Parties */}
        <div className="grid grid-cols-2 gap-3 py-3 border-t border-b border-gray-100 mb-4">
          <div>
            <p className={labelCls}>De</p>
            {profile.logo_url && <img src={profile.logo_url} alt="" className="h-6 w-auto object-contain mb-1" />}
            <p className="font-semibold text-gray-900">{emetteurName}</p>
            {profile.full_name && profile.company_name && <p className="text-gray-500">{profile.full_name}</p>}
            {profile.email && <p className="text-gray-400 flex items-center gap-0.5 mt-0.5"><Mail size={7} className="shrink-0" />{profile.email}</p>}
          </div>
          {client && (
            <div>
              <p className={labelCls}>À</p>
              <p className="font-semibold text-gray-900">{client.company || client.name}</p>
              {client.company && <p className="text-gray-500">{client.name}</p>}
              {client.email && <p className="text-gray-400 flex items-center gap-0.5 mt-0.5"><Mail size={7} className="shrink-0" />{client.email}</p>}
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
            {visibleLignes.map((l, i) => (
              <tr key={l.id} className={i % 2 !== 0 ? 'bg-gray-50/50' : ''}>
                <td className="py-1.5 pr-2 text-gray-900 truncate max-w-[100px]">{l.description || '—'}</td>
                <td className="py-1.5 text-gray-400 text-center tabular-nums">{l.quantite}</td>
                <td className="py-1.5 text-gray-400 text-right tabular-nums">{formatCurrency(l.prix_unitaire)}</td>
                <td className="py-1.5 font-medium text-gray-900 text-right tabular-nums">{formatCurrency(l.total)}</td>
              </tr>
            ))}
            {visibleLignes.length === 0 && (
              <tr><td colSpan={4} className="py-3 text-center text-gray-300 italic">Aucune ligne</td></tr>
            )}
          </tbody>
        </table>

        {/* Totaux */}
        <div className="flex justify-end mb-3">
          <div className="w-36">
            <div className="space-y-1 mb-2">
              <div className="flex justify-between"><span className="text-gray-400">HT</span><span className="font-medium text-gray-700 tabular-nums">{formatCurrency(montantHT)}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">TVA ({tvaTaux}%)</span><span className="font-medium text-gray-700 tabular-nums">{formatCurrency(montantTVA)}</span></div>
            </div>
            <div className="rounded-lg px-3 py-2 flex items-center justify-between" style={{ backgroundColor: brandColor }}>
              <span className="text-[9px] font-semibold text-white/70">TTC</span>
              <span className="text-xs font-bold text-white tabular-nums">{formatCurrency(montantTTC)}</span>
            </div>
          </div>
        </div>

        <NotesBlock notes={notes} conditions={conditions} labelCls={labelCls} />
      </div>
      <div className="px-5 py-2 border-t border-gray-100 text-center text-gray-300">
        Propulsé par <span className="font-semibold text-gray-400">Deviso</span>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   MODERNE — Bold colored header, card-style sections, rounded
   ═══════════════════════════════════════════════════════════════ */

function ModernePreview(props: DevisPreviewProps) {
  const { emetteurName, today, validite, visibleLignes } = usePreviewData(props)
  const { numero, titre, tvaTaux, montantHT, montantTVA, montantTTC, profile, client, brandColor, notes, conditions } = props
  const labelCls = 'text-[7px] font-bold text-gray-400 uppercase tracking-widest mb-0.5'

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm text-[10px] leading-tight">
      {/* Colored header block */}
      <div className="px-5 py-5 text-white" style={{ backgroundColor: brandColor }}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[8px] font-bold uppercase tracking-widest text-white/60 mb-1">Devis</p>
            <p className="text-base font-bold leading-none mb-0.5">{numero}</p>
            <p className="text-white/70 text-[9px]">{titre || 'Sans titre'}</p>
          </div>
          <div className="text-right shrink-0 text-white/80">
            <p className="text-[9px] font-semibold">{today}</p>
            {validite && <p className="text-[8px] text-white/50 mt-0.5">Valide jusqu&apos;au {validite}</p>}
          </div>
        </div>
      </div>

      <div className="px-5 py-4">
        {/* Parties — cards */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="bg-gray-50 rounded-lg p-2.5">
            <p className={labelCls}>Émetteur</p>
            {profile.logo_url && <img src={profile.logo_url} alt="" className="h-6 w-auto object-contain mb-1" />}
            <p className="font-semibold text-gray-900">{emetteurName}</p>
            {profile.full_name && profile.company_name && <p className="text-gray-500">{profile.full_name}</p>}
            {profile.email && <p className="text-gray-400 flex items-center gap-0.5 mt-0.5"><Mail size={7} className="shrink-0" />{profile.email}</p>}
          </div>
          {client ? (
            <div className="bg-gray-50 rounded-lg p-2.5">
              <p className={labelCls}>Destinataire</p>
              <p className="font-semibold text-gray-900">{client.company || client.name}</p>
              {client.company && <p className="text-gray-500">{client.name}</p>}
              {client.email && <p className="text-gray-400 flex items-center gap-0.5 mt-0.5"><Mail size={7} className="shrink-0" />{client.email}</p>}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-2.5 flex items-center justify-center">
              <p className="text-gray-300 italic">Pas de client</p>
            </div>
          )}
        </div>

        {/* Lignes — rounded rows */}
        <div className="space-y-1 mb-4">
          {visibleLignes.map((l) => (
            <div key={l.id} className="flex items-center gap-2 bg-gray-50 rounded-lg px-2.5 py-1.5">
              <span className="flex-1 text-gray-900 truncate">{l.description || '—'}</span>
              <span className="text-gray-400 tabular-nums">{l.quantite} ×</span>
              <span className="text-gray-400 tabular-nums w-12 text-right">{formatCurrency(l.prix_unitaire)}</span>
              <span className="font-semibold text-gray-900 tabular-nums w-14 text-right">{formatCurrency(l.total)}</span>
            </div>
          ))}
          {visibleLignes.length === 0 && (
            <div className="bg-gray-50 rounded-lg px-2.5 py-3 text-center text-gray-300 italic">Aucune ligne</div>
          )}
        </div>

        {/* Totaux — accent card */}
        <div className="rounded-xl overflow-hidden mb-3">
          <div className="bg-gray-50 px-3 py-1.5 flex justify-between">
            <span className="text-gray-500">HT</span>
            <span className="font-medium text-gray-700 tabular-nums">{formatCurrency(montantHT)}</span>
          </div>
          <div className="bg-gray-50 px-3 py-1.5 flex justify-between border-t border-gray-100">
            <span className="text-gray-500">TVA ({tvaTaux}%)</span>
            <span className="font-medium text-gray-700 tabular-nums">{formatCurrency(montantTVA)}</span>
          </div>
          <div className="px-3 py-2.5 flex items-center justify-between text-white" style={{ backgroundColor: brandColor }}>
            <span className="text-[9px] font-bold uppercase tracking-wider text-white/70">Total TTC</span>
            <span className="text-sm font-bold tabular-nums">{formatCurrency(montantTTC)}</span>
          </div>
        </div>

        <NotesBlock notes={notes} conditions={conditions} labelCls={labelCls} />
      </div>
      <div className="px-5 py-2 border-t border-gray-100 text-center text-gray-300">
        Propulsé par <span className="font-semibold text-gray-400">Deviso</span>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   MINIMALISTE — Ultra clean, thin borders, lots of whitespace
   ═══════════════════════════════════════════════════════════════ */

function MinimalistePreview(props: DevisPreviewProps) {
  const { emetteurName, today, validite, visibleLignes } = usePreviewData(props)
  const { numero, titre, tvaTaux, montantHT, montantTVA, montantTTC, profile, client, brandColor, notes, conditions } = props
  const labelCls = 'text-[7px] font-medium text-gray-300 uppercase tracking-widest mb-0.5'

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm text-[10px] leading-tight">
      <div className="px-6 py-5">
        {/* Header — large numero, minimal info */}
        <div className="mb-5">
          <p className="text-xl font-light text-gray-900 tracking-tight leading-none mb-1">{numero}</p>
          <p className="text-gray-400 text-[9px]">{titre || 'Sans titre'}</p>
          <div className="flex gap-3 mt-2 text-[8px] text-gray-400">
            <span>{today}</span>
            {validite && <span>· Valide jusqu&apos;au {validite}</span>}
          </div>
        </div>

        {/* Parties — inline, minimal */}
        <div className="flex gap-6 mb-5 pb-4 border-b border-gray-100">
          <div className="flex-1">
            <p className={labelCls}>De</p>
            {profile.logo_url && <img src={profile.logo_url} alt="" className="h-6 w-auto object-contain mb-1" />}
            <p className="font-medium text-gray-900">{emetteurName}</p>
            {profile.email && <p className="text-gray-400 mt-0.5">{profile.email}</p>}
          </div>
          {client && (
            <div className="flex-1">
              <p className={labelCls}>À</p>
              <p className="font-medium text-gray-900">{client.company || client.name}</p>
              {client.email && <p className="text-gray-400 mt-0.5">{client.email}</p>}
            </div>
          )}
        </div>

        {/* Lignes — clean, no bg */}
        <div className="mb-5">
          {visibleLignes.map((l, i) => (
            <div key={l.id} className={`flex items-baseline justify-between py-2 ${i > 0 ? 'border-t border-gray-50' : ''}`}>
              <div className="flex-1 min-w-0">
                <p className="text-gray-900 truncate">{l.description || '—'}</p>
                <p className="text-gray-300 text-[8px]">{l.quantite} × {formatCurrency(l.prix_unitaire)}</p>
              </div>
              <span className="font-medium text-gray-900 tabular-nums ml-3">{formatCurrency(l.total)}</span>
            </div>
          ))}
          {visibleLignes.length === 0 && (
            <p className="py-4 text-center text-gray-300 italic">Aucune ligne</p>
          )}
        </div>

        {/* Totaux — right aligned, subtle */}
        <div className="flex justify-end mb-3">
          <div className="w-36 space-y-1.5">
            <div className="flex justify-between text-gray-400">
              <span>HT</span><span className="tabular-nums">{formatCurrency(montantHT)}</span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>TVA {tvaTaux}%</span><span className="tabular-nums">{formatCurrency(montantTVA)}</span>
            </div>
            <div className="border-t border-gray-100 pt-1.5 flex justify-between">
              <span className="font-medium text-gray-900">TTC</span>
              <span className="text-xs font-semibold tabular-nums" style={{ color: brandColor }}>{formatCurrency(montantTTC)}</span>
            </div>
          </div>
        </div>

        <NotesBlock notes={notes} conditions={conditions} labelCls={labelCls} />
      </div>
      <div className="px-5 py-2 text-center text-gray-200 text-[9px]">
        Propulsé par <span className="font-medium text-gray-300">Deviso</span>
      </div>
    </div>
  )
}
