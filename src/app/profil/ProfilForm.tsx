'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/types/supabase'
import { Save, CheckCircle } from 'lucide-react'

const inputCls = 'w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed'

export function ProfilForm({ profile }: { profile: Profile | null }) {
  const [form, setForm] = useState({
    full_name:    profile?.full_name    ?? '',
    company_name: profile?.company_name ?? '',
    email:        profile?.email        ?? '',
    phone:        profile?.phone        ?? '',
    address:      profile?.address      ?? '',
    siret:        profile?.siret        ?? '',
  })
  const [loading, setLoading] = useState(false)
  const [saved,   setSaved]   = useState(false)
  const [error,   setError]   = useState('')
  const supabase = createClient()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
    setSaved(false)
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
    }).eq('id', profile!.id)
    if (error) { setError('Erreur lors de la sauvegarde.') } else { setSaved(true) }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 md:p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-gray-900 tracking-tight">Mon profil</h1>
        <p className="text-gray-400 mt-1 text-sm">Ces informations apparaîtront sur tes devis.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest pb-4 border-b border-gray-100">
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
            <label className="block text-xs font-medium text-gray-500 mb-1.5">{label}</label>
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
          <label className="block text-xs font-medium text-gray-500 mb-1.5">Adresse</label>
          <textarea
            name="address"
            value={form.address}
            onChange={handleChange}
            rows={3}
            placeholder="12 rue de la Paix&#10;75001 Paris"
            className={inputCls + ' resize-none'}
          />
        </div>
      </div>

      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm">
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
