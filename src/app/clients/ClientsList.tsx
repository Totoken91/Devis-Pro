'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Client } from '@/types/supabase'
import { Plus, Pencil, Trash2, X, Users } from 'lucide-react'

const emptyForm = { name: '', email: '', phone: '', company: '', address: '' }

interface ClientsListProps {
  initialClients: Client[]
  userId: string
}

export function ClientsList({ initialClients, userId }: ClientsListProps) {
  const [clients, setClients] = useState<Client[]>(initialClients)
  const [modal, setModal] = useState<'add' | 'edit' | null>(null)
  const [selected, setSelected] = useState<Client | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const supabase = createClient()

  const openAdd = () => {
    setForm(emptyForm)
    setSelected(null)
    setModal('add')
  }

  const openEdit = (client: Client) => {
    setSelected(client)
    setForm({
      name: client.name,
      email: client.email ?? '',
      phone: client.phone ?? '',
      company: client.company ?? '',
      address: client.address ?? '',
    })
    setModal('edit')
  }

  const closeModal = () => {
    setModal(null)
    setSelected(null)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    if (modal === 'add') {
      const { data, error } = await supabase
        .from('clients')
        .insert({ user_id: userId, name: form.name, email: form.email || null, phone: form.phone || null, company: form.company || null, address: form.address || null })
        .select()
        .single()

      if (!error && data) {
        setClients((prev) => [(data as unknown as Client), ...prev])
      }
    } else if (modal === 'edit' && selected) {
      const { data, error } = await supabase
        .from('clients')
        .update({ name: form.name, email: form.email || null, phone: form.phone || null, company: form.company || null, address: form.address || null })
        .eq('id', selected.id)
        .select()
        .single()

      if (!error && data) {
        const updated = data as unknown as Client
        setClients((prev) => prev.map((c) => (c.id === updated.id ? updated : c)))
      }
    }

    setLoading(false)
    closeModal()
  }

  const handleDelete = async (id: string) => {
    await supabase.from('clients').delete().eq('id', id)
    setClients((prev) => prev.filter((c) => c.id !== id))
    setDeleteId(null)
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mes clients</h1>
          <p className="text-gray-500 mt-1">{clients.length} client{clients.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-[#2E86C1] hover:bg-[#1E3A5F] text-white font-semibold rounded-xl px-4 py-2.5 text-sm transition-colors cursor-pointer"
        >
          <Plus size={16} />
          Ajouter un client
        </button>
      </div>

      {/* Liste vide */}
      {clients.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users size={28} className="text-[#2E86C1]" />
          </div>
          <p className="text-gray-900 font-medium mb-1">Aucun client pour l&apos;instant</p>
          <p className="text-gray-400 text-sm mb-6">Ajoute ton premier client pour commencer à créer des devis.</p>
          <button
            onClick={openAdd}
            className="inline-flex items-center gap-2 bg-[#2E86C1] text-white font-semibold rounded-xl px-4 py-2.5 text-sm hover:bg-[#1E3A5F] transition-colors"
          >
            <Plus size={16} />
            Ajouter un client
          </button>
        </div>
      ) : (
        /* Table */
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Nom</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3 hidden md:table-cell">Entreprise</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3 hidden lg:table-cell">Email</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3 hidden lg:table-cell">Téléphone</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {clients.map((client) => (
                <tr key={client.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900 text-sm">{client.name}</p>
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    <p className="text-sm text-gray-500">{client.company ?? '—'}</p>
                  </td>
                  <td className="px-6 py-4 hidden lg:table-cell">
                    <p className="text-sm text-gray-500">{client.email ?? '—'}</p>
                  </td>
                  <td className="px-6 py-4 hidden lg:table-cell">
                    <p className="text-sm text-gray-500">{client.phone ?? '—'}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 justify-end">
                      <button
                        onClick={() => openEdit(client)}
                        className="p-2 text-gray-400 hover:text-[#2E86C1] hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => setDeleteId(client.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal ajout / édition */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <h2 className="text-base font-semibold text-gray-900">
                {modal === 'add' ? 'Ajouter un client' : 'Modifier le client'}
              </h2>
              <button onClick={closeModal} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="px-6 py-5 space-y-4">
              <ModalField label="Nom *" name="name" value={form.name} onChange={handleChange} required />
              <ModalField label="Entreprise" name="company" value={form.company} onChange={handleChange} />
              <ModalField label="Email" name="email" value={form.email} onChange={handleChange} />
              <ModalField label="Téléphone" name="phone" value={form.phone} onChange={handleChange} />
              <ModalField label="Adresse" name="address" value={form.address} onChange={handleChange} />

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 border border-gray-300 text-gray-700 font-medium rounded-xl py-2.5 hover:bg-gray-50 transition-colors text-sm cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={loading || !form.name.trim()}
                  className="flex-1 bg-[#2E86C1] hover:bg-[#1E3A5F] text-white font-semibold rounded-xl py-2.5 transition-colors disabled:opacity-60 text-sm cursor-pointer disabled:cursor-not-allowed"
                >
                  {loading ? 'Sauvegarde...' : modal === 'add' ? 'Ajouter' : 'Sauvegarder'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal confirmation suppression */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={20} className="text-red-500" />
            </div>
            <h2 className="text-base font-semibold text-gray-900 mb-2">Supprimer ce client ?</h2>
            <p className="text-sm text-gray-500 mb-6">Cette action est irréversible.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 border border-gray-300 text-gray-700 font-medium rounded-xl py-2.5 hover:bg-gray-50 transition-colors text-sm cursor-pointer"
              >
                Annuler
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl py-2.5 transition-colors text-sm cursor-pointer"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function ModalField({
  label,
  name,
  value,
  onChange,
  placeholder,
  required,
}: {
  label: string
  name: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
  required?: boolean
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
        required={required}
        className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E86C1] focus:border-transparent transition"
      />
    </div>
  )
}
