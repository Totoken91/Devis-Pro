'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency, generateToken } from '@/lib/utils'
import type { Client, Devis, DevisLigne, DevisTemplate, Profile } from '@/types/supabase'
import { Plus, Trash2, ArrowLeft, Save, Send } from 'lucide-react'
import Link from 'next/link'

const TVA_OPTIONS = [0, 5.5, 10, 20] as const

const newLigne = (): DevisLigne => ({
  id: Math.random().toString(36).slice(2),
  description: '',
  quantite: 1,
  prix_unitaire: 0,
  total: 0,
})

interface DevisFormProps {
  mode: 'create' | 'edit'
  clients: Client[]
  profile: Profile
  nextNumero?: string
  initialData?: Devis
}

export function DevisForm({ mode, clients, profile, nextNumero, initialData }: DevisFormProps) {
  const router = useRouter()
  const supabase = createClient()

  const [titre, setTitre] = useState(initialData?.titre ?? 'Devis')
  const [clientId, setClientId] = useState<string>(initialData?.client_id ?? '')
  const [dateValidite, setDateValidite] = useState(initialData?.date_validite ?? '')
  const [template, setTemplate] = useState<DevisTemplate>(initialData?.template ?? 'classique')
  const [tvaT, setTvaT] = useState(initialData?.tva_taux ?? 20)
  const [notes, setNotes] = useState(initialData?.notes ?? '')
  const [conditions, setConditions] = useState(initialData?.conditions ?? '')
  const [lignes, setLignes] = useState<DevisLigne[]>(
    initialData?.lignes?.length ? initialData.lignes : [newLigne()]
  )
  const [loading, setLoading] = useState<'draft' | 'send' | null>(null)

  // ── Calculs ──────────────────────────────────────────────
  const montantHT = lignes.reduce((s, l) => s + l.total, 0)
  const montantTVA = montantHT * tvaT / 100
  const montantTTC = montantHT + montantTVA

  // ── Lignes ───────────────────────────────────────────────
  const updateLigne = useCallback((id: string, field: keyof DevisLigne, raw: string) => {
    setLignes((prev) =>
      prev.map((l) => {
        if (l.id !== id) return l
        const value = field === 'description' ? raw : parseFloat(raw) || 0
        const updated = { ...l, [field]: value }
        updated.total = Math.round(updated.quantite * updated.prix_unitaire * 100) / 100
        return updated
      })
    )
  }, [])

  const addLigne = () => setLignes((prev) => [...prev, newLigne()])
  const removeLigne = (id: string) => setLignes((prev) => prev.filter((l) => l.id !== id))

  // ── Sauvegarde ───────────────────────────────────────────
  const handleSave = async (statut: 'brouillon' | 'envoye') => {
    setLoading(statut === 'brouillon' ? 'draft' : 'send')

    const token = mode === 'create' ? generateToken() : initialData!.token_public

    const payload = {
      client_id: clientId || null,
      titre,
      statut,
      lignes,
      tva_taux: tvaT,
      montant_ht: montantHT,
      montant_tva: montantTVA,
      montant_ttc: montantTTC,
      notes: notes || null,
      conditions: conditions || null,
      date_validite: dateValidite || null,
      template,
    }

    let savedOk = false

    if (mode === 'create') {
      const { error } = await supabase.from('devis').insert({
        ...payload,
        user_id: profile.id,
        numero: nextNumero!,
        token_public: token,
      })
      savedOk = !error
    } else {
      const { error } = await supabase.from('devis').update(payload).eq('id', initialData!.id)
      savedOk = !error
    }

    // Envoi email si statut = envoye et client a un email
    if (savedOk && statut === 'envoye') {
      const client = clients.find((c) => c.id === clientId)
      if (client?.email) {
        const emetteurName = profile.company_name || profile.full_name || profile.email
        fetch('/api/send-devis', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: client.email,
            clientName: client.company || client.name,
            emetteurName,
            emetteurEmail: profile.email,
            numero: mode === 'create' ? nextNumero! : initialData!.numero,
            titre,
            montantTTC,
            token,
          }),
        }).catch(() => {/* silencieux si email échoue */})
      }
    }

    if (savedOk) {
      router.refresh()
      router.push('/devis')
    }
    setLoading(null)
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
        <div className="flex items-center gap-4">
          <Link href="/devis" className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {mode === 'create' ? `Nouveau devis — ${nextNumero}` : `Modifier ${initialData?.numero}`}
            </h1>
            {mode === 'edit' && (
              <p className="text-sm text-gray-400 mt-0.5">Statut actuel : <StatutBadge statut={initialData!.statut} /></p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleSave('brouillon')}
            disabled={!!loading}
            className="flex items-center gap-2 border border-gray-300 text-gray-700 font-medium rounded-xl px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save size={15} />
            {loading === 'draft' ? 'Sauvegarde...' : 'Brouillon'}
          </button>
          <button
            onClick={() => handleSave('envoye')}
            disabled={!!loading}
            className="flex items-center gap-2 bg-[#2E86C1] hover:bg-[#1E3A5F] text-white font-semibold rounded-xl px-4 py-2.5 text-sm transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={15} />
            {loading === 'send' ? 'Envoi...' : 'Finaliser & envoyer'}
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Section 1 : Informations */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-5">Informations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Titre du devis</label>
              <input
                type="text"
                value={titre}
                onChange={(e) => setTitre(e.target.value)}
                placeholder="Développement site web"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E86C1] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
              <select
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E86C1] focus:border-transparent bg-white"
              >
                <option value="">— Sans client —</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}{c.company ? ` (${c.company})` : ''}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date de validité</label>
              <input
                type="date"
                value={dateValidite}
                onChange={(e) => setDateValidite(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E86C1] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Template</label>
              <select
                value={template}
                onChange={(e) => setTemplate(e.target.value as DevisTemplate)}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E86C1] focus:border-transparent bg-white"
              >
                <option value="classique">Classique</option>
                <option value="moderne">Moderne</option>
                <option value="minimaliste">Minimaliste</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2 : Lignes */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-5">Lignes de devis</h2>

          {/* En-tête table — masqué sur mobile */}
          <div className="hidden md:grid grid-cols-[1fr_80px_120px_100px_36px] gap-3 mb-2 px-1">
            <span className="text-xs font-medium text-gray-500">Description</span>
            <span className="text-xs font-medium text-gray-500 text-center">Qté</span>
            <span className="text-xs font-medium text-gray-500 text-right">Prix unitaire</span>
            <span className="text-xs font-medium text-gray-500 text-right">Total HT</span>
            <span />
          </div>

          <div className="space-y-3">
            {lignes.map((ligne, i) => (
              <div key={ligne.id} className="flex flex-col gap-2 md:grid md:grid-cols-[1fr_80px_120px_100px_36px] md:items-center border border-gray-100 rounded-xl p-3 md:border-0 md:rounded-none md:p-0">
                <input
                  type="text"
                  value={ligne.description}
                  onChange={(e) => updateLigne(ligne.id, 'description', e.target.value)}
                  placeholder={`Prestation ${i + 1}`}
                  className="border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E86C1] focus:border-transparent"
                />
                <div className="grid grid-cols-3 gap-2 md:contents">
                  <div className="flex flex-col gap-1 md:contents">
                    <span className="text-xs text-gray-400 md:hidden">Qté</span>
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={ligne.quantite}
                      onChange={(e) => updateLigne(ligne.id, 'quantite', e.target.value)}
                      className="border border-gray-300 rounded-xl px-3 py-2.5 text-sm text-center focus:outline-none focus:ring-2 focus:ring-[#2E86C1] focus:border-transparent"
                    />
                  </div>
                  <div className="flex flex-col gap-1 md:contents">
                    <span className="text-xs text-gray-400 md:hidden">Prix unit.</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={ligne.prix_unitaire}
                      onChange={(e) => updateLigne(ligne.id, 'prix_unitaire', e.target.value)}
                      className="border border-gray-300 rounded-xl px-3 py-2.5 text-sm text-right focus:outline-none focus:ring-2 focus:ring-[#2E86C1] focus:border-transparent"
                    />
                  </div>
                  <div className="flex flex-col gap-1 md:contents">
                    <span className="text-xs text-gray-400 md:hidden">Total HT</span>
                    <p className="text-sm font-medium text-gray-700 text-right pr-1 py-2.5">
                      {formatCurrency(ligne.total)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => removeLigne(ligne.id)}
                  disabled={lignes.length === 1}
                  className="self-end md:self-auto p-2 text-gray-300 hover:text-red-400 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={addLigne}
            className="mt-4 flex items-center gap-1.5 text-sm text-[#2E86C1] hover:text-[#1E3A5F] font-medium transition-colors"
          >
            <Plus size={16} />
            Ajouter une ligne
          </button>
        </div>

        {/* Section 3 : Totaux + TVA */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Notes & Conditions */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Notes</h2>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Note client</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Message visible par le client..."
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E86C1] focus:border-transparent resize-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Conditions</label>
              <textarea
                value={conditions}
                onChange={(e) => setConditions(e.target.value)}
                rows={2}
                placeholder="Conditions de paiement, acompte..."
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E86C1] focus:border-transparent resize-none"
              />
            </div>
          </div>

          {/* Totaux */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-5">Récapitulatif</h2>

            <div className="mb-5">
              <label className="block text-xs font-medium text-gray-500 mb-1">Taux de TVA</label>
              <select
                value={tvaT}
                onChange={(e) => setTvaT(Number(e.target.value))}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E86C1] focus:border-transparent bg-white"
              >
                {TVA_OPTIONS.map((t) => (
                  <option key={t} value={t}>{t}%</option>
                ))}
              </select>
            </div>

            <div className="space-y-3 border-t border-gray-100 pt-4">
              <Row label="Montant HT" value={formatCurrency(montantHT)} />
              <Row label={`TVA (${tvaT}%)`} value={formatCurrency(montantTVA)} />
              <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                <span className="font-bold text-gray-900">Total TTC</span>
                <span className="text-xl font-bold text-[#1E3A5F]">{formatCurrency(montantTTC)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-gray-900">{value}</span>
    </div>
  )
}

function StatutBadge({ statut }: { statut: Devis['statut'] }) {
  const styles: Record<Devis['statut'], string> = {
    brouillon: 'bg-gray-100 text-gray-600',
    envoye:    'bg-blue-100 text-blue-700',
    ouvert:    'bg-purple-100 text-purple-700',
    accepte:   'bg-green-100 text-green-700',
    refuse:    'bg-red-100 text-red-700',
    expire:    'bg-orange-100 text-orange-700',
  }
  const labels: Record<Devis['statut'], string> = {
    brouillon: 'Brouillon',
    envoye:    'Envoyé',
    ouvert:    'Ouvert',
    accepte:   'Accepté',
    refuse:    'Refusé',
    expire:    'Expiré',
  }
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium ${styles[statut]}`}>
      {labels[statut]}
    </span>
  )
}
