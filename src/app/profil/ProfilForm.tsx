'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/types/supabase'
import { Save, CheckCircle, Upload, X, Palette, CreditCard, Scale, PenLine, ChevronDown, Mail, Phone, MapPin } from 'lucide-react'
import { Spinner } from '@/components/ui/Spinner'
import Image from 'next/image'

const inputCls = 'w-full border border-white/10 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder:text-white/25 bg-white/5 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand/50 transition-all disabled:opacity-40 disabled:cursor-not-allowed'

const COLOR_PRESETS = [
  '#6CC531', '#3B82F6', '#8B5CF6', '#EC4899',
  '#F59E0B', '#EF4444', '#14B8A6', '#F97316',
]

/* ── Section repliable ── */
function CollapsibleSection({
  icon,
  title,
  description,
  children,
  defaultOpen = false,
}: {
  icon: React.ReactNode
  title: string
  description: string
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="bg-white/[0.04] rounded-2xl border border-white/8 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 px-6 py-4 cursor-pointer hover:bg-white/[0.02] transition-colors"
      >
        <span className="text-white/30">{icon}</span>
        <div className="flex-1 text-left">
          <h2 className="text-xs font-semibold text-white/50 uppercase tracking-widest">{title}</h2>
          {!open && <p className="text-[11px] text-white/20 mt-0.5">{description}</p>}
        </div>
        <ChevronDown
          size={14}
          className={`text-white/25 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div className="px-6 pb-6 pt-2 space-y-4 border-t border-white/6">
          {children}
        </div>
      )}
    </div>
  )
}

export function ProfilForm({ profile }: { profile: Profile | null }) {
  const [form, setForm] = useState({
    full_name:        profile?.full_name        ?? '',
    company_name:     profile?.company_name     ?? '',
    email:            profile?.email            ?? '',
    phone:            profile?.phone            ?? '',
    address:          profile?.address          ?? '',
    siret:            profile?.siret            ?? '',
    tva_numero:       profile?.tva_numero       ?? '',
    iban:             profile?.iban             ?? '',
    bic:              profile?.bic              ?? '',
    statut_juridique: profile?.statut_juridique ?? '',
    capital_social:   profile?.capital_social   ?? '',
    footer_custom:    profile?.footer_custom    ?? '',
  })
  const [brandColor, setBrandColor] = useState(profile?.brand_color ?? '#6CC531')
  const [logoUrl, setLogoUrl] = useState(profile?.logo_url ?? '')
  const [logoUploading, setLogoUploading] = useState(false)
  const [loading, setLoading] = useState(false)
  const [saved,   setSaved]   = useState(false)
  const [error,   setError]   = useState('')
  const supabase = createClient()
  const fileRef = useRef<HTMLInputElement>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
    setSaved(false)
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Le fichier doit être une image (PNG, JPG, SVG…)')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      setError('L\'image ne doit pas dépasser 2 Mo.')
      return
    }

    setLogoUploading(true)
    setError('')

    const body = new FormData()
    body.append('file', file)

    const res = await fetch('/api/upload-logo', { method: 'POST', body })
    const json = await res.json()

    if (!res.ok) {
      setError(json.error ?? 'Erreur lors de l\'upload.')
      setLogoUploading(false)
      return
    }

    setLogoUrl(json.publicUrl)
    setLogoUploading(false)
    setSaved(false)
  }

  const removeLogo = () => {
    setLogoUrl('')
    setSaved(false)
    if (fileRef.current) fileRef.current.value = ''
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError('')
    const { error } = await supabase.from('profiles').update({
      full_name:        form.full_name        || null,
      company_name:     form.company_name     || null,
      phone:            form.phone            || null,
      address:          form.address          || null,
      siret:            form.siret            || null,
      tva_numero:       form.tva_numero       || null,
      iban:             form.iban             || null,
      bic:              form.bic              || null,
      statut_juridique: form.statut_juridique || null,
      capital_social:   form.capital_social   || null,
      footer_custom:    form.footer_custom    || null,
      logo_url:         logoUrl               || null,
      brand_color:      brandColor            || null,
    }).eq('id', profile!.id)
    if (error) { setError('Erreur lors de la sauvegarde.') } else { setSaved(true) }
    setLoading(false)
  }

  const emetteurName = form.company_name || form.full_name || '—'

  return (
    <form onSubmit={handleSubmit} className="p-4 md:p-8">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-white tracking-tight">Mon profil</h1>
        <p className="text-white/35 mt-1 text-sm">Ces informations apparaîtront sur tes devis.</p>
      </div>

      <div className="flex gap-8 items-start">

        {/* ── Colonne gauche : formulaire ── */}
        <div className="flex-1 min-w-0 space-y-4 max-w-2xl">

          {/* ── Informations (toujours ouvert) ── */}
          <div className="bg-white/[0.04] rounded-2xl border border-white/8 p-6 space-y-4">
            <h2 className="text-xs font-semibold text-white/30 uppercase tracking-widest pb-4 border-b border-white/8">
              Informations professionnelles
            </h2>

            {[
              { label: 'Prénom et nom',      name: 'full_name',    placeholder: 'Marie Dupont' },
              { label: "Nom de l'entreprise",name: 'company_name', placeholder: 'Studio Créatif' },
              { label: 'Email',              name: 'email',        disabled: true },
              { label: 'Téléphone',          name: 'phone',        placeholder: '+33 6 00 00 00 00' },
              { label: 'SIRET',              name: 'siret',        placeholder: '000 000 000 00000' },
            ].map(({ label, name, placeholder, disabled }) => (
              <div key={name}>
                <label className="block text-xs font-medium text-white/40 mb-1.5">{label}</label>
                <input
                  type="text" name={name}
                  value={form[name as keyof typeof form]}
                  onChange={handleChange}
                  placeholder={placeholder}
                  disabled={disabled}
                  className={inputCls}
                />
              </div>
            ))}

            <div>
              <label className="block text-xs font-medium text-white/40 mb-1.5">Adresse</label>
              <textarea
                name="address"
                value={form.address}
                onChange={handleChange}
                rows={3}
                placeholder={'12 rue de la Paix\n75001 Paris'}
                className={inputCls + ' resize-none'}
              />
            </div>
          </div>

          {/* ── TVA & Bancaire (repliable) ── */}
          <CollapsibleSection
            icon={<CreditCard size={12} />}
            title="TVA & coordonnées bancaires"
            description="IBAN, BIC, numéro de TVA"
          >
            <div>
              <label className="block text-xs font-medium text-white/40 mb-1.5">Numéro de TVA intracommunautaire</label>
              <input
                type="text" name="tva_numero"
                value={form.tva_numero}
                onChange={handleChange}
                placeholder="FR 12 345678901"
                className={inputCls}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-white/40 mb-1.5">IBAN</label>
                <input
                  type="text" name="iban"
                  value={form.iban}
                  onChange={handleChange}
                  placeholder="FR76 1234 5678 9012 3456 7890 123"
                  className={inputCls + ' font-mono text-xs'}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-white/40 mb-1.5">BIC</label>
                <input
                  type="text" name="bic"
                  value={form.bic}
                  onChange={handleChange}
                  placeholder="BNPAFRPP"
                  className={inputCls + ' font-mono text-xs'}
                />
              </div>
            </div>
          </CollapsibleSection>

          {/* ── Mentions légales (repliable) ── */}
          <CollapsibleSection
            icon={<Scale size={12} />}
            title="Mentions légales"
            description="Statut juridique, capital social"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-white/40 mb-1.5">Statut juridique</label>
                <input
                  type="text" name="statut_juridique"
                  value={form.statut_juridique}
                  onChange={handleChange}
                  placeholder="Auto-entrepreneur, SAS, SARL…"
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-white/40 mb-1.5">Capital social</label>
                <input
                  type="text" name="capital_social"
                  value={form.capital_social}
                  onChange={handleChange}
                  placeholder="10 000 €"
                  className={inputCls}
                />
              </div>
            </div>
          </CollapsibleSection>

          {/* ── Signature / Footer (repliable) ── */}
          <CollapsibleSection
            icon={<PenLine size={12} />}
            title="Signature & pied de page"
            description="Texte affiché en bas de chaque devis"
          >
            <div>
              <label className="block text-xs font-medium text-white/40 mb-1.5">Texte personnalisé</label>
              <textarea
                name="footer_custom"
                value={form.footer_custom}
                onChange={handleChange}
                rows={3}
                placeholder={'Bon pour accord, signature du client :\n\n_________________________'}
                className={inputCls + ' resize-none'}
              />
            </div>
          </CollapsibleSection>

          {/* ── Personnalisation (repliable) ── */}
          <CollapsibleSection
            icon={<Palette size={12} />}
            title="Personnalisation des devis"
            description="Logo et couleur principale"
          >
            {/* Logo */}
            <div>
              <label className="block text-xs font-medium text-white/40 mb-2">Logo</label>
              <div className="flex items-center gap-4">
                {logoUrl ? (
                  <div className="relative w-16 h-16 rounded-xl border border-white/10 bg-white/5 overflow-hidden group">
                    <Image
                      src={logoUrl}
                      alt="Logo"
                      fill
                      className="object-contain p-1.5"
                    />
                    <button
                      type="button"
                      onClick={removeLogo}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      <X size={10} className="text-white" />
                    </button>
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-xl border border-dashed border-white/15 bg-white/[0.02] flex items-center justify-center">
                    <Upload size={18} className="text-white/20" />
                  </div>
                )}
                <div>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                    id="logo-upload"
                  />
                  <label
                    htmlFor="logo-upload"
                    className="inline-flex items-center gap-2 border border-white/10 text-white/60 font-medium rounded-lg px-3 py-1.5 text-xs hover:bg-white/5 hover:text-white transition-colors cursor-pointer"
                  >
                    <Upload size={12} />
                    {logoUploading ? <span className="inline-flex items-center gap-1.5"><Spinner size={12} />Upload…</span> : logoUrl ? 'Changer' : 'Importer un logo'}
                  </label>
                  <p className="text-[10px] text-white/25 mt-1">PNG, JPG ou SVG · 2 Mo max</p>
                </div>
              </div>
            </div>

            {/* Couleur */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-white/40 mb-3">
                <Palette size={12} />
                Couleur principale
              </label>
              <div className="flex items-center gap-2 flex-wrap">
                {COLOR_PRESETS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => { setBrandColor(color); setSaved(false) }}
                    className="w-8 h-8 rounded-lg border-2 transition-all cursor-pointer hover:scale-110"
                    style={{
                      backgroundColor: color,
                      borderColor: brandColor === color ? 'white' : 'transparent',
                      boxShadow: brandColor === color ? `0 0 0 2px ${color}40` : 'none',
                    }}
                    title={color}
                  />
                ))}
                <div className="flex items-center gap-1.5 ml-1">
                  <input
                    type="color"
                    value={brandColor}
                    onChange={(e) => { setBrandColor(e.target.value); setSaved(false) }}
                    className="w-8 h-8 rounded-lg border border-white/10 bg-transparent cursor-pointer [&::-webkit-color-swatch]:rounded-md [&::-webkit-color-swatch-wrapper]:p-0.5"
                  />
                  <input
                    type="text"
                    value={brandColor}
                    onChange={(e) => {
                      const v = e.target.value
                      if (/^#[0-9A-Fa-f]{0,6}$/.test(v)) { setBrandColor(v); setSaved(false) }
                    }}
                    className="w-20 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white/60 bg-white/5 font-mono focus:outline-none focus:ring-1 focus:ring-brand/30"
                    placeholder="#6CC531"
                  />
                </div>
              </div>
            </div>
          </CollapsibleSection>

          {/* ── Boutons ── */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <div className="flex items-center gap-4 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 bg-brand hover:bg-brand-dark text-white font-semibold rounded-xl px-5 py-2.5 text-sm transition-all shadow-sm shadow-brand/25 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Save size={14} />
              {loading ? <span className="inline-flex items-center gap-2"><Spinner />Sauvegarde…</span> : 'Sauvegarder'}
            </button>
            {saved && (
              <span className="flex items-center gap-1.5 text-brand text-sm font-medium">
                <CheckCircle size={15} />
                Profil mis à jour
              </span>
            )}
          </div>
        </div>

        {/* ── Colonne droite : aperçu live ── */}
        <div className="hidden lg:block w-80 shrink-0 sticky top-8">
          <p className="text-[10px] font-semibold text-white/25 uppercase tracking-widest mb-3">Aperçu sur le devis</p>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm text-[10px] leading-tight">
            {/* Accent strip */}
            <div className="h-1" style={{ backgroundColor: brandColor }} />
            <div className="px-5 py-4">
              {/* Header */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <p className="text-[7px] font-bold uppercase tracking-widest mb-1" style={{ color: brandColor }}>Devis</p>
                  <p className="text-sm font-bold text-gray-900 leading-none mb-0.5">DEV-2025-001</p>
                  <p className="text-gray-400 text-[9px]">Exemple de devis</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[7px] font-semibold text-gray-400 uppercase tracking-wider">Émis le</p>
                  <p className="text-[9px] font-semibold text-gray-900">
                    {new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
              </div>

              {/* Émetteur */}
              <div className="py-3 border-t border-b border-gray-100 mb-3">
                <p className="text-[7px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">De</p>
                {logoUrl && <img src={logoUrl} alt="" className="h-6 w-auto object-contain mb-1" />}
                <p className="font-semibold text-gray-900">{emetteurName}</p>
                {form.full_name && form.company_name && (
                  <p className="text-gray-500">{form.full_name}</p>
                )}
                {form.email && (
                  <p className="text-gray-400 flex items-center gap-0.5 mt-0.5">
                    <Mail size={7} className="shrink-0" />{form.email}
                  </p>
                )}
                {form.phone && (
                  <p className="text-gray-400 flex items-center gap-0.5">
                    <Phone size={7} className="shrink-0" />{form.phone}
                  </p>
                )}
                {form.address && (
                  <p className="text-gray-400 flex items-start gap-0.5 mt-0.5 whitespace-pre-line">
                    <MapPin size={7} className="shrink-0 mt-0.5" />{form.address}
                  </p>
                )}
                {(form.siret || form.tva_numero || form.statut_juridique) && (
                  <div className="mt-1 space-y-0.5 text-gray-300 text-[8px]">
                    {form.siret && <p>SIRET : {form.siret}</p>}
                    {form.tva_numero && <p>TVA : {form.tva_numero}</p>}
                    {form.statut_juridique && (
                      <p>
                        {form.statut_juridique}
                        {form.capital_social && ` — Capital : ${form.capital_social}`}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Lignes simulées */}
              <div className="space-y-1 mb-3">
                <div className="flex items-center justify-between bg-gray-50 rounded px-2 py-1">
                  <span className="text-gray-500">Prestation exemple</span>
                  <span className="font-medium text-gray-900">1 200,00 €</span>
                </div>
              </div>

              {/* Total */}
              <div className="flex justify-end mb-3">
                <div className="rounded-lg px-3 py-2 flex items-center justify-between w-32" style={{ backgroundColor: brandColor }}>
                  <span className="text-[9px] font-semibold text-white/70">TTC</span>
                  <span className="text-xs font-bold text-white">1 440,00 €</span>
                </div>
              </div>

              {/* Bancaire */}
              {(form.iban || form.bic) && (
                <div className="border-t border-gray-100 pt-2 mb-2">
                  <p className="text-[7px] font-bold text-gray-400 uppercase tracking-widest mb-1">Coordonnées bancaires</p>
                  <div className="bg-gray-50 rounded px-2 py-1.5 text-gray-400 space-y-0.5">
                    {form.iban && <p><span className="text-gray-300 font-medium mr-1">IBAN</span><span className="font-mono">{form.iban}</span></p>}
                    {form.bic && <p><span className="text-gray-300 font-medium mr-1">BIC</span><span className="font-mono">{form.bic}</span></p>}
                  </div>
                </div>
              )}

              {/* Footer */}
              {form.footer_custom && (
                <div className="border-t border-gray-100 pt-2">
                  <p className="text-gray-400 whitespace-pre-line text-[9px]">{form.footer_custom}</p>
                </div>
              )}
            </div>

            <div className="px-5 py-1.5 border-t border-gray-100 text-center text-gray-300 text-[8px]">
              Propulsé par <span className="font-semibold text-gray-400">Deviso</span>
            </div>
          </div>
        </div>

      </div>
    </form>
  )
}
