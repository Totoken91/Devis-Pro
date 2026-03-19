import { createClient } from '@/lib/supabase/server'
import { formatCurrency, formatDate } from '@/lib/utils'
import { notFound } from 'next/navigation'
import type { Devis, DevisLigne } from '@/types/supabase'
import { DevisActions } from './DevisActions'
import { Download } from 'lucide-react'

type DevisPublic = Devis & {
  profiles: {
    full_name: string | null
    company_name: string | null
    email: string
    phone: string | null
    address: string | null
    siret: string | null
  } | null
  clients: {
    name: string
    company: string | null
    email: string | null
    phone: string | null
    address: string | null
  } | null
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

export default async function DevisPublicPage({ params }: { params: { token: string } }) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const { data: devis } = await supabase
    .from('devis')
    .select('*, profiles(full_name, company_name, email, phone, address, siret), clients(name, company, email, phone, address)')
    .eq('token_public', params.token)
    .single()

  const d = devis as unknown as DevisPublic

  if (!d) notFound()

  // Brouillon : seul le propriétaire peut prévisualiser
  const isOwner = user?.id === d.user_id
  if (d.statut === 'brouillon' && !isOwner) notFound()

  const isPreview = d.statut === 'brouillon'
  const emetteur = d.profiles
  const destinataire = d.clients

  // Marquer comme ouvert si envoye (première consultation)
  if (d.statut === 'envoye') {
    await supabase
      .from('devis')
      .update({ statut: 'ouvert', ouvert_le: new Date().toISOString() })
      .eq('id', d.id)
  }

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Bannière prévisualisation */}
        {isPreview && (
          <div className="mb-4 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800 flex items-center gap-2">
            <span className="font-semibold">Prévisualisation brouillon</span>
            <span className="text-amber-600">— Ce devis n&apos;a pas encore été envoyé au client.</span>
          </div>
        )}

        {/* Bandeau statut */}
        <div className="flex items-center justify-between mb-6">
          <a href="/" className="text-2xl font-bold text-[#1E3A5F]">
            Devi<span className="text-[#2E86C1]">so</span>
          </a>
          <div className="flex items-center gap-3">
            <a
              href={`/api/devis/${params.token}/pdf`}
              download
              className="flex items-center gap-1.5 text-sm font-medium text-[#2E86C1] hover:text-[#1E3A5F] border border-[#2E86C1] hover:border-[#1E3A5F] px-3 py-1.5 rounded-xl transition-colors"
            >
              <Download size={14} />
              PDF
            </a>
            <span className={`px-3 py-1.5 rounded-xl text-sm font-semibold ${STATUT_STYLE[d.statut]}`}>
              {STATUT_LABEL[d.statut]}
            </span>
          </div>
        </div>

        {/* Devis */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {/* En-tête */}
          <div className="bg-[#1E3A5F] px-8 py-8 text-white">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-white/60 text-sm font-medium uppercase tracking-wider mb-1">Devis</p>
                <h1 className="text-3xl font-bold">{d.numero}</h1>
                <p className="text-white/80 mt-1 text-lg">{d.titre}</p>
              </div>
              <div className="text-right text-sm">
                <p className="text-white/60">Émis le</p>
                <p className="font-semibold">{formatDate(d.created_at)}</p>
                {d.date_validite && (
                  <>
                    <p className="text-white/60 mt-2">Valide jusqu&apos;au</p>
                    <p className="font-semibold">{formatDate(d.date_validite)}</p>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="px-8 py-8">
            {/* Émetteur / Destinataire */}
            <div className="grid grid-cols-2 gap-8 mb-8">
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">De</p>
                <p className="font-semibold text-gray-900">{emetteur?.company_name || emetteur?.full_name || '—'}</p>
                {emetteur?.full_name && emetteur.company_name && (
                  <p className="text-sm text-gray-500">{emetteur.full_name}</p>
                )}
                {emetteur?.email && <p className="text-sm text-gray-500">{emetteur.email}</p>}
                {emetteur?.phone && <p className="text-sm text-gray-500">{emetteur.phone}</p>}
                {emetteur?.address && <p className="text-sm text-gray-500 whitespace-pre-line">{emetteur.address}</p>}
                {emetteur?.siret && <p className="text-xs text-gray-400 mt-1">SIRET : {emetteur.siret}</p>}
              </div>
              {destinataire && (
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">À</p>
                  <p className="font-semibold text-gray-900">{destinataire.company || destinataire.name}</p>
                  {destinataire.company && <p className="text-sm text-gray-500">{destinataire.name}</p>}
                  {destinataire.email && <p className="text-sm text-gray-500">{destinataire.email}</p>}
                  {destinataire.phone && <p className="text-sm text-gray-500">{destinataire.phone}</p>}
                  {destinataire.address && <p className="text-sm text-gray-500 whitespace-pre-line">{destinataire.address}</p>}
                </div>
              )}
            </div>

            {/* Lignes */}
            <table className="w-full mb-8">
              <thead>
                <tr className="border-b-2 border-gray-100">
                  <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider pb-3">Description</th>
                  <th className="text-center text-xs font-semibold text-gray-400 uppercase tracking-wider pb-3 w-16">Qté</th>
                  <th className="text-right text-xs font-semibold text-gray-400 uppercase tracking-wider pb-3 w-28">Prix unit.</th>
                  <th className="text-right text-xs font-semibold text-gray-400 uppercase tracking-wider pb-3 w-28">Total HT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {(d.lignes as DevisLigne[]).map((ligne) => (
                  <tr key={ligne.id}>
                    <td className="py-3 pr-4 text-sm text-gray-900">{ligne.description || '—'}</td>
                    <td className="py-3 text-sm text-gray-500 text-center">{ligne.quantite}</td>
                    <td className="py-3 text-sm text-gray-500 text-right">{formatCurrency(ligne.prix_unitaire)}</td>
                    <td className="py-3 text-sm font-medium text-gray-900 text-right">{formatCurrency(ligne.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totaux */}
            <div className="flex justify-end mb-8">
              <div className="w-64 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Montant HT</span>
                  <span className="font-medium text-gray-900">{formatCurrency(d.montant_ht)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">TVA ({d.tva_taux}%)</span>
                  <span className="font-medium text-gray-900">{formatCurrency(d.montant_tva)}</span>
                </div>
                <div className="flex justify-between border-t border-gray-200 pt-2">
                  <span className="font-bold text-gray-900">Total TTC</span>
                  <span className="text-xl font-bold text-[#1E3A5F]">{formatCurrency(d.montant_ttc)}</span>
                </div>
              </div>
            </div>

            {/* Notes & Conditions */}
            {(d.notes || d.conditions) && (
              <div className="border-t border-gray-100 pt-6 space-y-4">
                {d.notes && (
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Notes</p>
                    <p className="text-sm text-gray-600 whitespace-pre-line">{d.notes}</p>
                  </div>
                )}
                {d.conditions && (
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Conditions</p>
                    <p className="text-sm text-gray-600 whitespace-pre-line">{d.conditions}</p>
                  </div>
                )}
              </div>
            )}

            {/* Actions client : Accepter / Refuser / Signé */}
            {!isPreview && (d.statut === 'ouvert' || d.statut === 'envoye' || d.statut === 'accepte' || d.statut === 'refuse') && (
              <DevisActions
                token={params.token}
                statut={d.statut}
                signeL={d.signe_le}
              />
            )}
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Propulsé par <span className="font-semibold text-[#1E3A5F]">Deviso</span>
        </p>
      </div>
    </div>
  )
}
