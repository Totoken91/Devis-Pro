'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency, generateToken } from '@/lib/utils'
import type { Client, Devis, DevisLigne, DevisTemplate, Profile, DevisStatut } from '@/types/supabase'
import { Plus, Trash2, ArrowLeft, Save, Send, Eye, EyeOff, BellRing } from 'lucide-react'
import { Spinner } from '@/components/ui/Spinner'
import Link from 'next/link'
import { DevisPreview } from '@/components/devis/DevisPreview'

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

const STATUT_BADGE: Record<DevisStatut, string> = {
  brouillon: 'bg-white/8 text-white/40',
  envoye:    'bg-blue-500/15 text-blue-400',
  ouvert:    'bg-amber-500/15 text-amber-400',
  accepte:   'bg-brand/15 text-brand',
  refuse:    'bg-red-500/15 text-red-400',
  expire:    'bg-orange-500/15 text-orange-400',
}
const STATUT_LABEL: Record<DevisStatut, string> = {
  brouillon: 'Brouillon', envoye: 'Envoyé', ouvert: 'Ouvert',
  accepte: 'Accepté', refuse: 'Refusé', expire: 'Expiré',
}

const inputCls = 'w-full border border-white/10 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder:text-white/25 bg-white/5 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand/50 transition-all'

export function DevisForm({ mode, clients, profile, nextNumero, initialData }: DevisFormProps) {
  const router   = useRouter()
  const supabase = createClient()

  const [titre,       setTitre]       = useState(initialData?.titre ?? 'Devis')
  const [clientId,    setClientId]    = useState<string>(initialData?.client_id ?? '')
  const [dateValidite,setDateValidite]= useState(initialData?.date_validite ?? '')
  const [template,    setTemplate]    = useState<DevisTemplate>(initialData?.template ?? 'classique')
  const [tvaT,        setTvaT]        = useState(initialData?.tva_taux ?? 20)
  const [notes,       setNotes]       = useState(initialData?.notes ?? '')
  const [conditions,  setConditions]  = useState(initialData?.conditions ?? '')
  const [lignes,      setLignes]      = useState<DevisLigne[]>(
    initialData?.lignes?.length ? initialData.lignes : [newLigne()]
  )
  const [relanceActive, setRelanceActive] = useState(initialData?.relance_active ?? false)
  const [loading, setLoading] = useState<'draft' | 'send' | null>(null)
  const [showPreview, setShowPreview] = useState(true)

  const montantHT  = lignes.reduce((s, l) => s + l.total, 0)
  const montantTVA = montantHT * tvaT / 100
  const montantTTC = montantHT + montantTVA

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

  const addLigne    = () => setLignes((prev) => [...prev, newLigne()])
  const removeLigne = (id: string) => setLignes((prev) => prev.filter((l) => l.id !== id))

  const handleSave = async (statut: 'brouillon' | 'envoye') => {
    setLoading(statut === 'brouillon' ? 'draft' : 'send')
    const token = mode === 'create' ? generateToken() : initialData!.token_public
    const payload = {
      client_id: clientId || null, titre, statut, lignes, tva_taux: tvaT,
      montant_ht: montantHT, montant_tva: montantTVA, montant_ttc: montantTTC,
      notes: notes || null, conditions: conditions || null,
      date_validite: dateValidite || null, template, relance_active: relanceActive,
    }

    let savedOk = false
    if (mode === 'create') {
      const { error } = await supabase.from('devis').insert({
        ...payload, user_id: profile.id, numero: nextNumero!, token_public: token,
      })
      savedOk = !error
    } else {
      const { error } = await supabase.from('devis').update(payload).eq('id', initialData!.id)
      savedOk = !error
    }

    if (savedOk && statut === 'envoye') {
      const client = clients.find((c) => c.id === clientId)
      if (client?.email) {
        const emetteurName = profile.company_name || profile.full_name || profile.email
        fetch('/api/send-devis', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: client.email, clientName: client.company || client.name,
            emetteurName, emetteurEmail: profile.email,
            numero: mode === 'create' ? nextNumero! : initialData!.numero,
            titre, montantTTC, token,
            logoUrl: profile.logo_url ?? undefined,
            brandColor: profile.brand_color ?? undefined,
          }),
        }).catch(() => {})
      }
    }

    if (savedOk) { router.refresh(); router.push('/devis') }
    setLoading(null)
  }

  const selectedClient = clients.find((c) => c.id === clientId) ?? null
  const brandColor = profile.brand_color || '#6CC531'

  return (
    <div className="p-4 md:p-8">

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-8 max-w-4xl">
        <div className="flex items-center gap-3">
          <Link
            href="/devis"
            className="p-2 text-white/40 hover:text-white hover:bg-white/8 rounded-lg transition-colors"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="font-display text-xl font-bold text-white tracking-tight">
              {mode === 'create' ? `Nouveau devis — ${nextNumero}` : `Modifier ${initialData?.numero}`}
            </h1>
            {mode === 'edit' && (
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-xs text-white/35">Statut :</span>
                <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium ${STATUT_BADGE[initialData!.statut]}`}>
                  {STATUT_LABEL[initialData!.statut]}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPreview((v) => !v)}
            className="flex items-center gap-2 border border-white/10 text-white/40 font-medium rounded-lg px-3 py-2 text-sm hover:bg-white/5 hover:text-white/60 transition-colors cursor-pointer"
            title={showPreview ? 'Masquer l\'aperçu' : 'Afficher l\'aperçu'}
          >
            {showPreview ? <EyeOff size={14} /> : <Eye size={14} />}
            <span className="hidden sm:inline">Aperçu</span>
          </button>
          <button
            onClick={() => handleSave('brouillon')}
            disabled={!!loading}
            className="flex items-center gap-2 border border-white/10 text-white/60 font-medium rounded-lg px-4 py-2 text-sm hover:bg-white/5 hover:text-white transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading === 'draft' ? <span className="inline-flex items-center gap-2"><Spinner />Sauvegarde…</span> : <><Save size={14} />Brouillon</>}
          </button>
          <button
            onClick={() => handleSave('envoye')}
            disabled={!!loading}
            className="flex items-center gap-2 bg-brand hover:bg-brand-dark text-white font-semibold rounded-lg px-4 py-2 text-sm transition-all shadow-sm shadow-brand/25 hover:shadow-brand/40 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading === 'send' ? <span className="inline-flex items-center gap-2"><Spinner />Envoi…</span> : <><Send size={14} />Finaliser {'&'} envoyer</>}
          </button>
        </div>
      </div>

      <div className="flex gap-8 items-start">
        {/* ── Form column ── */}
        <div className="flex-1 max-w-4xl space-y-5 min-w-0">

          {/* ── Informations ── */}
          <Section title="Informations">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-white/40 mb-1.5">Titre du devis</label>
                <input
                  type="text"
                  value={titre}
                  onChange={(e) => setTitre(e.target.value)}
                  placeholder="Développement site web"
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-white/40 mb-1.5">Client</label>
                <select
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  className={inputCls}
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
                <label className="block text-xs font-medium text-white/40 mb-1.5">Date de validité</label>
                <input
                  type="date"
                  value={dateValidite}
                  onChange={(e) => setDateValidite(e.target.value)}
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-white/40 mb-1.5">Template</label>
                <select
                  value={template}
                  onChange={(e) => setTemplate(e.target.value as DevisTemplate)}
                  className={inputCls}
                >
                  <option value="classique">Classique</option>
                  <option value="moderne">Moderne</option>
                  <option value="minimaliste">Minimaliste</option>
                </select>
              </div>
            </div>
          </Section>

          {/* ── Lignes ── */}
          <Section title="Lignes de devis">
            <div className="hidden md:grid grid-cols-[1fr_72px_116px_96px_32px] gap-3 mb-2 px-1">
              <span className="text-xs font-medium text-white/30">Description</span>
              <span className="text-xs font-medium text-white/30 text-center">Qté</span>
              <span className="text-xs font-medium text-white/30 text-right">Prix unitaire</span>
              <span className="text-xs font-medium text-white/30 text-right">Total HT</span>
              <span />
            </div>

            <div className="space-y-2">
              {lignes.map((ligne, i) => (
                <div
                  key={ligne.id}
                  className="flex flex-col gap-2 md:grid md:grid-cols-[1fr_72px_116px_96px_32px] md:items-center border border-white/8 rounded-xl p-3 md:border-0 md:rounded-none md:p-0 md:gap-3"
                >
                  <input
                    type="text"
                    value={ligne.description}
                    onChange={(e) => updateLigne(ligne.id, 'description', e.target.value)}
                    placeholder={`Prestation ${i + 1}`}
                    className={inputCls}
                  />
                  <div className="grid grid-cols-3 gap-2 md:contents">
                    <div className="flex flex-col gap-1 md:contents">
                      <span className="text-xs text-white/30 md:hidden">Qté</span>
                      <input
                        type="number" min="0" step="0.5"
                        value={ligne.quantite}
                        onChange={(e) => updateLigne(ligne.id, 'quantite', e.target.value)}
                        className={inputCls + ' text-center'}
                      />
                    </div>
                    <div className="flex flex-col gap-1 md:contents">
                      <span className="text-xs text-white/30 md:hidden">Prix unit.</span>
                      <input
                        type="number" min="0" step="0.01"
                        value={ligne.prix_unitaire}
                        onChange={(e) => updateLigne(ligne.id, 'prix_unitaire', e.target.value)}
                        className={inputCls + ' text-right'}
                      />
                    </div>
                    <div className="flex flex-col gap-1 md:contents">
                      <span className="text-xs text-white/30 md:hidden">Total HT</span>
                      <p className="text-sm font-medium text-white/60 text-right pr-1 py-2.5 tabular-nums">
                        {formatCurrency(ligne.total)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeLigne(ligne.id)}
                    disabled={lignes.length === 1}
                    className="self-end md:self-auto p-1.5 text-white/20 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-30 cursor-pointer"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={addLigne}
              className="mt-3 flex items-center gap-1.5 text-sm text-brand hover:text-brand-dark font-medium transition-colors cursor-pointer"
            >
              <Plus size={14} />
              Ajouter une ligne
            </button>
          </Section>

          {/* ── Notes + Récap ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Section title="Notes">
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-white/30 mb-1.5">Note client</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    placeholder="Message visible par le client…"
                    className={inputCls + ' resize-none'}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/30 mb-1.5">Conditions</label>
                  <textarea
                    value={conditions}
                    onChange={(e) => setConditions(e.target.value)}
                    rows={2}
                    placeholder="Conditions de paiement, acompte…"
                    className={inputCls + ' resize-none'}
                  />
                </div>
              </div>
            </Section>

            <Section title="Récapitulatif">
              <div className="mb-4">
                <label className="block text-xs font-medium text-white/30 mb-1.5">Taux de TVA</label>
                <select
                  value={tvaT}
                  onChange={(e) => setTvaT(Number(e.target.value))}
                  className={inputCls}
                >
                  {TVA_OPTIONS.map((t) => (
                    <option key={t} value={t}>{t}%</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2.5 border-t border-white/8 pt-4">
                <TotalRow label="Montant HT"         value={formatCurrency(montantHT)} />
                <TotalRow label={`TVA (${tvaT}%)`}   value={formatCurrency(montantTVA)} />
              </div>

              <div className="mt-4 bg-brand/10 border border-brand/20 rounded-xl px-5 py-4 flex items-center justify-between">
                <span className="text-sm font-semibold text-brand/70">Total TTC</span>
                <span className="font-display text-xl font-bold text-brand tabular-nums">
                  {formatCurrency(montantTTC)}
                </span>
              </div>
            </Section>
          </div>

          {/* ── Relances automatiques ── */}
          <div className="bg-white/[0.04] rounded-2xl border border-white/8 p-5">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center shrink-0 mt-0.5">
                  <BellRing size={14} className="text-brand/60" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white/80">Relances automatiques</p>
                  <p className="text-xs text-white/35 mt-0.5 max-w-sm">
                    Deux rappels automatiques sont envoyés au client : à J+3 puis J+7 après l&apos;envoi du devis.
                  </p>
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={relanceActive}
                onClick={() => setRelanceActive((v) => !v)}
                className={`shrink-0 relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 cursor-pointer focus:outline-none ${
                  relanceActive ? 'bg-brand' : 'bg-white/15'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
                    relanceActive ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

        </div>

        {/* ── Preview column (desktop only) ── */}
        {showPreview && (
          <div className="hidden xl:block w-[340px] shrink-0 sticky top-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs font-semibold text-white/30 uppercase tracking-widest">Aperçu</p>
            </div>
            <DevisPreview
              numero={mode === 'create' ? nextNumero! : initialData!.numero}
              titre={titre}
              template={template}
              lignes={lignes}
              tvaTaux={tvaT}
              montantHT={montantHT}
              montantTVA={montantTVA}
              montantTTC={montantTTC}
              dateValidite={dateValidite}
              notes={notes}
              conditions={conditions}
              profile={profile}
              client={selectedClient}
              brandColor={brandColor}
            />
          </div>
        )}
      </div>
    </div>
  )
}

/* ── Helpers ─────────────────────────────────────────────────── */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white/[0.04] rounded-2xl border border-white/8 p-6">
      <h2 className="text-xs font-semibold text-white/30 uppercase tracking-widest mb-5">{title}</h2>
      {children}
    </div>
  )
}

function TotalRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-white/40">{label}</span>
      <span className="font-medium text-white/65 tabular-nums">{value}</span>
    </div>
  )
}
