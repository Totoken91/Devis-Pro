'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency, generateToken } from '@/lib/utils'
import type { Client, Devis, DevisLigne, DevisTemplate, Profile, DevisStatut, DevisModele } from '@/types/supabase'
import { Plus, Trash2, ArrowLeft, Save, Send, Eye, EyeOff, BellRing, Lock, Zap, BookmarkPlus, AlertTriangle, Copy, X, Check, FolderOpen } from 'lucide-react'
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
  modeles?: DevisModele[]
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

export function DevisForm({ mode, clients, profile, nextNumero, initialData, modeles = [] }: DevisFormProps) {
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
  const [relanceActive, setRelanceActive] = useState(profile.plan === 'pro' && (initialData?.relance_active ?? false))
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

  // Devis finalisés : lecture seule
  const locked = mode === 'edit' && ['accepte', 'refuse', 'expire'].includes(initialData!.statut)

  // Sauvegarder comme modèle
  const [savingModel, setSavingModel] = useState(false)
  const [showModelModal, setShowModelModal] = useState(false)
  const [modelName, setModelName] = useState('')
  const [modelSaved, setModelSaved] = useState(false)
  const handleSaveAsModel = async () => {
    if (!modelName.trim()) return
    setSavingModel(true)
    await supabase.from('devis_modeles').insert({
      user_id: profile.id,
      name: modelName.trim(),
      lignes,
      tva_taux: tvaT,
      notes: notes || null,
      conditions: conditions || null,
      template,
    })
    setSavingModel(false)
    setModelSaved(true)
    setTimeout(() => {
      setShowModelModal(false)
      setModelName('')
      setModelSaved(false)
    }, 1200)
  }

  // Charger un modèle
  const [showModelPicker, setShowModelPicker] = useState(false)
  const loadModel = (id: string) => {
    const m = modeles.find((x) => x.id === id)
    if (!m) return
    setLignes(m.lignes?.length ? m.lignes : [newLigne()])
    setTvaT(m.tva_taux ?? 20)
    setNotes(m.notes ?? '')
    setConditions(m.conditions ?? '')
    setTemplate((m.template ?? 'classique') as DevisTemplate)
    setShowModelPicker(false)
  }

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
          {modeles.length > 0 && (
            <div className="relative">
              <button
                onClick={() => setShowModelPicker((v) => !v)}
                className="flex items-center gap-2 border border-white/10 text-white/40 font-medium rounded-lg px-3 py-2 text-sm hover:bg-white/5 hover:text-white/60 transition-colors cursor-pointer"
                title="Charger un modèle"
              >
                <FolderOpen size={14} />
                <span className="hidden sm:inline">Charger</span>
              </button>
              {showModelPicker && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowModelPicker(false)} />
                  <div className="absolute left-0 top-full mt-2 z-50 w-64 bg-[#1E293B] border border-white/10 rounded-xl shadow-xl overflow-hidden">
                    <div className="px-4 py-3 border-b border-white/8">
                      <p className="text-xs font-semibold text-white/50 uppercase tracking-wider">Mes modèles</p>
                    </div>
                    <div className="max-h-56 overflow-y-auto">
                      {modeles.map((m) => (
                        <button
                          key={m.id}
                          onClick={() => loadModel(m.id)}
                          className="w-full text-left px-4 py-2.5 text-sm text-white/70 hover:bg-white/8 hover:text-white transition-colors cursor-pointer"
                        >
                          {m.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
          <button
            onClick={() => { setShowModelModal(true); setModelName(''); setModelSaved(false) }}
            className="flex items-center gap-2 border border-white/10 text-white/40 font-medium rounded-lg px-3 py-2 text-sm hover:bg-white/5 hover:text-white/60 transition-colors cursor-pointer"
            title="Sauvegarder comme modèle"
          >
            <BookmarkPlus size={14} />
            <span className="hidden sm:inline">Sauvegarder</span>
          </button>
          {!locked && (
            <>
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
            </>
          )}
          {locked && (
            <Link
              href={`/devis/nouveau`}
              className="flex items-center gap-2 bg-brand hover:bg-brand-dark text-white font-semibold rounded-lg px-4 py-2 text-sm transition-all shadow-sm shadow-brand/25 hover:shadow-brand/40"
            >
              <Copy size={14} />
              Dupliquer
            </Link>
          )}
        </div>
      </div>

      {locked && (
        <div className="max-w-4xl mb-5 bg-amber-500/10 border border-amber-500/20 rounded-xl px-5 py-3.5 flex items-center gap-3">
          <AlertTriangle size={16} className="text-amber-400 shrink-0" />
          <p className="text-sm text-amber-300/80">
            Ce devis a été <strong>{STATUT_LABEL[initialData!.statut].toLowerCase()}</strong> et ne peut plus être modifié.
            Tu peux le <strong>sauvegarder comme modèle</strong> ou le <strong>dupliquer</strong>.
          </p>
        </div>
      )}

      <div className="flex gap-8 items-start">
        {/* ── Form column ── */}
        <div className={`flex-1 max-w-4xl space-y-5 min-w-0 ${locked ? 'pointer-events-none opacity-60 select-none' : ''}`}>

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
                        value={ligne.prix_unitaire === 0 ? '' : ligne.prix_unitaire}
                        onChange={(e) => updateLigne(ligne.id, 'prix_unitaire', e.target.value)}
                        placeholder="0,00"
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
          <div className={`rounded-2xl border p-5 ${profile.plan === 'pro' ? 'bg-white/[0.04] border-white/8' : 'bg-white/[0.02] border-white/6'}`}>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${profile.plan === 'pro' ? 'bg-brand/10 border border-brand/20' : 'bg-white/5 border border-white/10'}`}>
                  {profile.plan === 'pro'
                    ? <BellRing size={14} className="text-brand/60" />
                    : <Lock size={14} className="text-white/30" />}
                </div>
                <div>
                  <p className={`text-sm font-medium ${profile.plan === 'pro' ? 'text-white/80' : 'text-white/40'}`}>Relances automatiques</p>
                  {profile.plan === 'pro' ? (
                    <p className="text-xs text-white/35 mt-0.5 max-w-sm">
                      Deux rappels automatiques sont envoyés au client : à J+3 puis J+7 après l&apos;envoi du devis.
                    </p>
                  ) : (
                    <p className="text-xs text-white/30 mt-0.5 max-w-sm">
                      Fonctionnalité réservée au plan Pro.{' '}
                      <Link href="/parametres/facturation" className="inline-flex items-center gap-1 text-brand hover:text-brand-dark transition-colors">
                        <Zap size={10} />Passer Pro
                      </Link>
                    </p>
                  )}
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={relanceActive}
                disabled={profile.plan !== 'pro'}
                onClick={() => setRelanceActive((v) => !v)}
                className={`shrink-0 relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${
                  profile.plan !== 'pro'
                    ? 'bg-white/8 cursor-not-allowed opacity-50'
                    : relanceActive ? 'bg-brand cursor-pointer' : 'bg-white/15 cursor-pointer'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
                    relanceActive && profile.plan === 'pro' ? 'translate-x-6' : 'translate-x-1'
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

      {/* ── Modal : sauvegarder comme modèle ── */}
      {showModelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModelModal(false)} />
          <div className="relative w-full max-w-sm bg-[#131C27] border border-white/10 rounded-2xl shadow-2xl p-6">
            <button
              onClick={() => setShowModelModal(false)}
              className="absolute top-4 right-4 p-1.5 text-white/30 hover:text-white hover:bg-white/8 rounded-lg transition-colors cursor-pointer"
            >
              <X size={15} />
            </button>

            {modelSaved ? (
              <div className="flex flex-col items-center gap-3 py-4">
                <div className="w-12 h-12 rounded-full bg-brand/15 border border-brand/25 flex items-center justify-center">
                  <Check size={22} className="text-brand" />
                </div>
                <p className="text-white font-semibold">Modèle sauvegardé !</p>
              </div>
            ) : (
              <>
                <div className="mb-5">
                  <h3 className="text-base font-semibold text-white mb-1">Sauvegarder comme modèle</h3>
                  <p className="text-xs text-white/40">Les lignes, TVA, notes et template seront enregistrés.</p>
                </div>
                <div className="mb-4">
                  <label className="block text-xs font-medium text-white/40 mb-1.5">Nom du modèle</label>
                  <input
                    type="text"
                    value={modelName}
                    onChange={(e) => setModelName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveAsModel()}
                    placeholder="Ex : Prestation web standard"
                    autoFocus
                    className={inputCls}
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => setShowModelModal(false)}
                    className="px-4 py-2 text-sm text-white/40 hover:text-white hover:bg-white/8 rounded-lg transition-colors cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleSaveAsModel}
                    disabled={savingModel || !modelName.trim()}
                    className="flex items-center gap-2 bg-brand hover:bg-brand-dark text-white font-semibold rounded-lg px-4 py-2 text-sm transition-all shadow-sm shadow-brand/25 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {savingModel ? <Spinner size={13} /> : <BookmarkPlus size={13} />}
                    Sauvegarder
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
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
