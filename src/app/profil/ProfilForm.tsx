'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/types/supabase'
import { Save, CheckCircle, Upload, X, Palette } from 'lucide-react'
import Image from 'next/image'

const inputCls = 'w-full border border-white/10 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder:text-white/25 bg-white/5 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand/50 transition-all disabled:opacity-40 disabled:cursor-not-allowed'

const COLOR_PRESETS = [
  '#6CC531', '#3B82F6', '#8B5CF6', '#EC4899',
  '#F59E0B', '#EF4444', '#14B8A6', '#F97316',
]

export function ProfilForm({ profile }: { profile: Profile | null }) {
  const [form, setForm] = useState({
    full_name:    profile?.full_name    ?? '',
    company_name: profile?.company_name ?? '',
    email:        profile?.email        ?? '',
    phone:        profile?.phone        ?? '',
    address:      profile?.address      ?? '',
    siret:        profile?.siret        ?? '',
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

    const ext = file.name.split('.').pop() ?? 'png'
    const path = `${profile!.id}/logo.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('logos')
      .upload(path, file, { upsert: true })

    if (uploadError) {
      setError('Erreur lors de l\'upload. Vérifie que le bucket "logos" existe dans Supabase Storage.')
      setLogoUploading(false)
      return
    }

    const { data: { publicUrl } } = supabase.storage.from('logos').getPublicUrl(path)
    setLogoUrl(publicUrl)
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
      full_name:    form.full_name    || null,
      company_name: form.company_name || null,
      phone:        form.phone        || null,
      address:      form.address      || null,
      siret:        form.siret        || null,
      logo_url:     logoUrl           || null,
      brand_color:  brandColor        || null,
    }).eq('id', profile!.id)
    if (error) { setError('Erreur lors de la sauvegarde.') } else { setSaved(true) }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 md:p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-white tracking-tight">Mon profil</h1>
        <p className="text-white/35 mt-1 text-sm">Ces informations apparaîtront sur tes devis.</p>
      </div>

      <div className="space-y-5">

        {/* ── Informations ── */}
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

        {/* ── Personnalisation ── */}
        <div className="bg-white/[0.04] rounded-2xl border border-white/8 p-6 space-y-5">
          <h2 className="text-xs font-semibold text-white/30 uppercase tracking-widest pb-4 border-b border-white/8">
            Personnalisation des devis
          </h2>

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
                  {logoUploading ? 'Upload…' : logoUrl ? 'Changer' : 'Importer un logo'}
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
            {/* Preview chip */}
            <div className="mt-3 flex items-center gap-2">
              <span className="text-[10px] text-white/25">Aperçu :</span>
              <span
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold text-white"
                style={{ backgroundColor: brandColor }}
              >
                Accepté
              </span>
              <span
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold"
                style={{ backgroundColor: `${brandColor}20`, color: brandColor }}
              >
                Total TTC
              </span>
            </div>
          </div>
        </div>

      </div>

      {error && (
        <div className="mt-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <div className="mt-6 flex items-center gap-4">
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 bg-brand hover:bg-brand-dark text-white font-semibold rounded-xl px-5 py-2.5 text-sm transition-all shadow-sm shadow-brand/25 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <Save size={14} />
          {loading ? 'Sauvegarde…' : 'Sauvegarder'}
        </button>
        {saved && (
          <span className="flex items-center gap-1.5 text-brand text-sm font-medium">
            <CheckCircle size={15} />
            Profil mis à jour
          </span>
        )}
      </div>
    </form>
  )
}
