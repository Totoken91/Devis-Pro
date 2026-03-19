'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/types/supabase'
import { Save, CheckCircle } from 'lucide-react'

interface ProfilFormProps {
  profile: Profile | null
}

export function ProfilForm({ profile }: ProfilFormProps) {
  const [form, setForm] = useState({
    full_name: profile?.full_name ?? '',
    company_name: profile?.company_name ?? '',
    email: profile?.email ?? '',
    phone: profile?.phone ?? '',
    address: profile?.address ?? '',
    siret: profile?.siret ?? '',
  })
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
    setSaved(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.from('profiles').update({
      full_name: form.full_name || null,
      company_name: form.company_name || null,
      phone: form.phone || null,
      address: form.address || null,
      siret: form.siret || null,
    }).eq('id', profile!.id)

    if (error) {
      setError('Erreur lors de la sauvegarde.')
    } else {
      setSaved(true)
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Mon profil</h1>
        <p className="text-gray-500 mt-1">Ces informations apparaîtront sur tes devis.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
        <h2 className="text-base font-semibold text-gray-900 border-b border-gray-100 pb-4">
          Informations personnelles
        </h2>

        <Field label="Prénom et nom" name="full_name" value={form.full_name} onChange={handleChange} />
        <Field label="Nom de l'entreprise" name="company_name" value={form.company_name} onChange={handleChange} />
        <Field label="Email" name="email" value={form.email} onChange={handleChange} disabled />
        <Field label="Téléphone" name="phone" value={form.phone} onChange={handleChange} />
        <Field label="SIRET" name="siret" value={form.siret} onChange={handleChange} />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
          <textarea
            name="address"
            value={form.address}
            onChange={handleChange}
            rows={3}
            placeholder=""
            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E86C1] focus:border-transparent transition resize-none"
          />
        </div>
      </div>

      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <div className="mt-6 flex items-center gap-4">
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 bg-[#2E86C1] hover:bg-[#1E3A5F] text-white font-semibold rounded-xl px-6 py-3 transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <Save size={16} />
          {loading ? 'Sauvegarde...' : 'Sauvegarder'}
        </button>

        {saved && (
          <span className="flex items-center gap-1.5 text-green-600 text-sm font-medium">
            <CheckCircle size={16} />
            Profil mis à jour
          </span>
        )}
      </div>
    </form>
  )
}

function Field({
  label,
  name,
  value,
  onChange,
  placeholder,
  disabled,
}: {
  label: string
  name: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
  disabled?: boolean
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E86C1] focus:border-transparent transition disabled:bg-gray-50 disabled:text-gray-400"
      />
    </div>
  )
}
