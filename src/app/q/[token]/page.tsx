import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendOwnerNotification } from '@/lib/notify'
import { formatCurrency, formatDate } from '@/lib/utils'
import { notFound } from 'next/navigation'
import type { Devis, DevisLigne } from '@/types/supabase'
import { DevisActions } from './DevisActions'
import { PrintButton } from './PrintButton'
import { Calendar, MapPin, Phone, Mail, Building2 } from 'lucide-react'

type DevisPublic = Devis & {
  profiles: {
    full_name:        string | null
    company_name:     string | null
    email:            string
    phone:            string | null
    address:          string | null
    siret:            string | null
    logo_url:         string | null
    brand_color:      string | null
    tva_numero:       string | null
    iban:             string | null
    bic:              string | null
    statut_juridique: string | null
    capital_social:   string | null
    footer_custom:    string | null
  } | null
  clients: {
    name:    string
    company: string | null
    email:   string | null
    phone:   string | null
    address: string | null
  } | null
}

const STATUT_CONFIG = {
  brouillon: { label: 'Brouillon', color: 'bg-gray-100 text-gray-500',      dot: 'bg-gray-400'  },
  envoye:    { label: 'Envoyé',    color: 'bg-blue-50 text-blue-600',       dot: 'bg-blue-500'  },
  ouvert:    { label: 'Ouvert',    color: 'bg-amber-50 text-amber-600',     dot: 'bg-amber-400' },
  accepte:   { label: 'Accepté',  color: 'bg-green-50 text-green-700',     dot: 'bg-green-500' },
  refuse:    { label: 'Refusé',   color: 'bg-red-50 text-red-600',         dot: 'bg-red-500'   },
  expire:    { label: 'Expiré',   color: 'bg-orange-50 text-orange-600',   dot: 'bg-orange-400'},
} as const

export default async function DevisPublicPage({ params }: { params: { token: string } }) {
  const supabase = createClient()
  const admin    = createAdminClient()

  const { data: { user } } = await supabase.auth.getUser()

  const { data: devisRow, error: devisError } = await admin
    .from('devis')
    .select('*, clients(name, company, email, phone, address)')
    .eq('token_public', params.token)
    .single()

  if (devisError || !devisRow) {
    console.error('[q/token] token:', params.token, 'error:', devisError?.message ?? 'null data')
    notFound()
  }

  const row = devisRow as Record<string, unknown> & { user_id: string }
  const { data: profileRow } = await admin
    .from('profiles')
    .select('full_name, company_name, email, phone, address, siret, logo_url, brand_color, tva_numero, iban, bic, statut_juridique, capital_social, footer_custom')
    .eq('id', row.user_id)
    .single()

  const d = { ...row, profiles: profileRow } as unknown as DevisPublic

  const isOwner  = user?.id === d.user_id
  if (d.statut === 'brouillon' && !isOwner) notFound()

  const isPreview  = d.statut === 'brouillon'
  const emetteur   = d.profiles
  const destinataire = d.clients
  const cfg        = STATUT_CONFIG[d.statut as keyof typeof STATUT_CONFIG]

  if (d.statut === 'envoye' && !isOwner) {
    await admin
      .from('devis')
      .update({ statut: 'ouvert', ouvert_le: new Date().toISOString() })
      .eq('id', d.id)
    await sendOwnerNotification(params.token, 'ouvert').catch(() => {})
  }

  const emetteurName = emetteur?.company_name || emetteur?.full_name || '—'
  const accentColor = emetteur?.brand_color || '#6CC531'

  return (
    <div className="min-h-screen bg-[#F3F4F1]">

      {/* ── Sticky top bar ── */}
      <header className="print:hidden sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-gray-100 h-14 flex items-center justify-between px-5 md:px-8">
        <div className="flex items-center gap-2">
          {emetteur?.logo_url ? (
            <img src={emetteur.logo_url} alt="" className="h-7 w-auto object-contain" />
          ) : null}
          <span className="font-display font-bold text-gray-900 text-sm tracking-tight">
            {emetteur?.company_name || (<>Devi<span style={{ color: accentColor }}>so</span></>)}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <PrintButton />
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold ${cfg.color}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
            {cfg.label}
          </span>
        </div>
      </header>

      {/* ── Preview banner ── */}
      {isPreview && (
        <div className="print:hidden bg-amber-50 border-b border-amber-100 px-5 py-2.5 flex items-center justify-center gap-2 text-sm text-amber-700">
          <span className="font-semibold">Mode prévisualisation</span>
          <span className="text-amber-500">— Ce devis n&apos;a pas encore été envoyé au client.</span>
        </div>
      )}

      {/* ── Document ── */}
      <main className="max-w-2xl mx-auto px-4 py-8 md:py-12">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

          {/* Accent strip */}
          <div className="h-1" style={{ backgroundColor: accentColor }} />

          <div className="px-4 py-6 sm:px-8 sm:py-8 md:px-10 md:py-10">

            {/* ── Doc header ── */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-widest mb-2" style={{ color: accentColor }}>Devis</p>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight leading-tight mb-1.5 break-all" style={{ fontFamily: 'var(--font-sora, sans-serif)' }}>
                  {d.numero}
                </h1>
                <p className="text-gray-500 text-base">{d.titre}</p>
              </div>
              <div className="sm:text-right shrink-0 space-y-2">
                <div>
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Émis le</p>
                  <p className="text-sm font-semibold text-gray-900">{formatDate(d.created_at)}</p>
                </div>
                {d.date_validite && (
                  <div>
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Valide jusqu&apos;au</p>
                    <p className="text-sm font-semibold text-gray-900">{formatDate(d.date_validite)}</p>
                  </div>
                )}
              </div>
            </div>

            {/* ── Parties ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-6 border-t border-b border-gray-100 mb-8">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2.5">De</p>
                <p className="font-semibold text-gray-900 text-sm">{emetteurName}</p>
                {emetteur?.full_name && emetteur.company_name && (
                  <p className="text-sm text-gray-500">{emetteur.full_name}</p>
                )}
                {emetteur?.email && (
                  <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                    <Mail size={10} className="shrink-0" />{emetteur.email}
                  </p>
                )}
                {emetteur?.phone && (
                  <p className="text-xs text-gray-400 flex items-center gap-1">
                    <Phone size={10} className="shrink-0" />{emetteur.phone}
                  </p>
                )}
                {emetteur?.address && (
                  <p className="text-xs text-gray-400 flex items-start gap-1 mt-0.5 whitespace-pre-line">
                    <MapPin size={10} className="shrink-0 mt-0.5" />{emetteur.address}
                  </p>
                )}
                {(emetteur?.siret || emetteur?.tva_numero || emetteur?.statut_juridique) && (
                  <div className="mt-1.5 space-y-0.5 text-[11px] text-gray-300">
                    {emetteur.siret && <p>SIRET : {emetteur.siret}</p>}
                    {emetteur.tva_numero && <p>TVA : {emetteur.tva_numero}</p>}
                    {emetteur.statut_juridique && (
                      <p>
                        {emetteur.statut_juridique}
                        {emetteur.capital_social && ` — Capital : ${emetteur.capital_social}`}
                      </p>
                    )}
                  </div>
                )}
              </div>
              {destinataire && (
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2.5">À</p>
                  <p className="font-semibold text-gray-900 text-sm">
                    {destinataire.company || destinataire.name}
                  </p>
                  {destinataire.company && (
                    <p className="text-sm text-gray-500">{destinataire.name}</p>
                  )}
                  {destinataire.email && (
                    <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                      <Mail size={10} className="shrink-0" />{destinataire.email}
                    </p>
                  )}
                  {destinataire.phone && (
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                      <Phone size={10} className="shrink-0" />{destinataire.phone}
                    </p>
                  )}
                  {destinataire.address && (
                    <p className="text-xs text-gray-400 flex items-start gap-1 mt-0.5 whitespace-pre-line">
                      <MapPin size={10} className="shrink-0 mt-0.5" />{destinataire.address}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* ── Lignes ── */}
            <table className="w-full mb-8">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest pb-3 pr-2">Description</th>
                  <th className="text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest pb-3 w-10 sm:w-14">Qté</th>
                  <th className="text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest pb-3 w-20 sm:w-28">Prix unit.</th>
                  <th className="text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest pb-3 w-20 sm:w-28">Total HT</th>
                </tr>
              </thead>
              <tbody>
                {(d.lignes as DevisLigne[]).map((ligne, i) => (
                  <tr key={ligne.id} className={i % 2 === 0 ? '' : 'bg-gray-50/50'}>
                    <td className="py-3 pr-2 text-sm text-gray-900 break-words">{ligne.description || '—'}</td>
                    <td className="py-3 text-sm text-gray-400 text-center tabular-nums">{ligne.quantite}</td>
                    <td className="py-3 text-xs sm:text-sm text-gray-400 text-right tabular-nums">{formatCurrency(ligne.prix_unitaire)}</td>
                    <td className="py-3 text-xs sm:text-sm font-medium text-gray-900 text-right tabular-nums">{formatCurrency(ligne.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* ── Totaux ── */}
            <div className="flex justify-end mb-8">
              <div className="w-full sm:w-64">
                <div className="space-y-2 mb-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Montant HT</span>
                    <span className="font-medium text-gray-700 tabular-nums">{formatCurrency(d.montant_ht)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">TVA ({d.tva_taux}%)</span>
                    <span className="font-medium text-gray-700 tabular-nums">{formatCurrency(d.montant_tva)}</span>
                  </div>
                </div>
                <div className="bg-gray-950 rounded-xl px-5 py-3.5 flex items-center justify-between">
                  <span className="text-sm font-semibold text-white/60">Total TTC</span>
                  <span className="text-xl font-bold text-white tabular-nums" style={{ fontFamily: 'var(--font-sora, sans-serif)' }}>
                    {formatCurrency(d.montant_ttc)}
                  </span>
                </div>
              </div>
            </div>

            {/* ── Coordonnées bancaires ── */}
            {(emetteur?.iban || emetteur?.bic) && (
              <div className="border-t border-gray-100 pt-6 mb-6">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Coordonnées bancaires</p>
                <div className="bg-gray-50 rounded-lg px-4 py-3 space-y-1">
                  {emetteur.iban && (
                    <p className="text-sm text-gray-600"><span className="text-gray-400 text-xs font-medium mr-2">IBAN</span><span className="font-mono">{emetteur.iban}</span></p>
                  )}
                  {emetteur.bic && (
                    <p className="text-sm text-gray-600"><span className="text-gray-400 text-xs font-medium mr-2">BIC</span><span className="font-mono">{emetteur.bic}</span></p>
                  )}
                </div>
              </div>
            )}

            {/* ── Notes & Conditions ── */}
            {(d.notes || d.conditions) && (
              <div className="border-t border-gray-100 pt-6 space-y-4 mb-6">
                {d.notes && (
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Notes</p>
                    <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{d.notes}</p>
                  </div>
                )}
                {d.conditions && (
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Conditions</p>
                    <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{d.conditions}</p>
                  </div>
                )}
              </div>
            )}

            {/* ── Signature / Footer custom ── */}
            {emetteur?.footer_custom && (
              <div className="border-t border-gray-100 pt-6 mb-6">
                <p className="text-sm text-gray-500 whitespace-pre-line leading-relaxed">{emetteur.footer_custom}</p>
              </div>
            )}

            {/* ── Actions client ── */}
            {!isPreview && !isOwner && (d.statut === 'ouvert' || d.statut === 'envoye' || d.statut === 'accepte' || d.statut === 'refuse') && (
              <DevisActions
                token={params.token}
                statut={d.statut}
                signeL={d.signe_le}
                brandColor={accentColor}
              />
            )}

          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 mt-6 print:hidden">
          Propulsé par{' '}
          <span className="font-semibold text-gray-500">Deviso</span>
          {' '}— devis professionnels pour freelances
        </p>
      </main>
    </div>
  )
}
