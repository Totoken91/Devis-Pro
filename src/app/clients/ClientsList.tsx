'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Client } from '@/types/supabase'
import { Plus, Pencil, Trash2, X, Users } from 'lucide-react'
import { Spinner } from '@/components/ui/Spinner'

const emptyForm = { name: '', email: '', phone: '', company: '', address: '' }

const inputCls = 'w-full border border-white/10 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder:text-white/25 bg-white/5 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand/50 transition-all'

export function ClientsList({ initialClients, userId }: { initialClients: Client[]; userId: string }) {
  const [clients,  setClients]  = useState<Client[]>(initialClients)
  const [modal,    setModal]    = useState<'add' | 'edit' | null>(null)
  const [selected, setSelected] = useState<Client | null>(null)
  const [form,     setForm]     = useState(emptyForm)
  const [loading,  setLoading]  = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const supabase = createClient()

  const openAdd = () => { setForm(emptyForm); setSelected(null); setModal('add') }
  const openEdit = (c: Client) => {
    setSelected(c)
    setForm({ name: c.name, email: c.email ?? '', phone: c.phone ?? '', company: c.company ?? '', address: c.address ?? '' })
    setModal('edit')
  }
  const closeModal = () => { setModal(null); setSelected(null) }
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    if (modal === 'add') {
      const { data, error } = await supabase
        .from('clients')
        .insert({ user_id: userId, name: form.name, email: form.email || null, phone: form.phone || null, company: form.company || null, address: form.address || null })
        .select().single()
      if (!error && data) setClients((prev) => [(data as unknown as Client), ...prev])
    } else if (modal === 'edit' && selected) {
      const { data, error } = await supabase
        .from('clients')
        .update({ name: form.name, email: form.email || null, phone: form.phone || null, company: form.company || null, address: form.address || null })
        .eq('id', selected.id).select().single()
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
    <div className="p-4 md:p-8">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl font-bold text-white tracking-tight">Mes clients</h1>
          <p className="text-white/35 mt-0.5 text-sm">{clients.length} client{clients.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-brand hover:bg-brand-dark text-white font-semibold rounded-xl px-4 py-2.5 text-sm transition-all shadow-sm shadow-brand/25 hover:-translate-y-px cursor-pointer"
        >
          <Plus size={15} strokeWidth={2.5} />
          Ajouter un client
        </button>
      </div>

      {clients.length === 0 ? (
        <div className="bg-white/[0.03] rounded-2xl border border-white/8 py-16 flex flex-col items-center text-center px-6">
          <div className="w-12 h-12 bg-brand/10 border border-brand/15 rounded-2xl flex items-center justify-center mb-4">
            <Users size={20} className="text-brand/60" />
          </div>
          <p className="text-sm font-medium text-white/70 mb-1">Aucun client pour l&apos;instant</p>
          <p className="text-xs text-white/30 mb-6 max-w-xs">Ajoute ton premier client pour commencer à créer des devis.</p>
          <button
            onClick={openAdd}
            className="inline-flex items-center gap-2 bg-brand hover:bg-brand-dark text-white font-semibold rounded-xl px-4 py-2.5 text-sm transition-all shadow-sm shadow-brand/25 cursor-pointer"
          >
            <Plus size={14} />
            Ajouter un client
          </button>
        </div>
      ) : (
        <div className="bg-white/[0.03] rounded-2xl border border-white/8 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/6 bg-white/[0.02]">
                {['Nom', 'Entreprise', 'Email', 'Téléphone', ''].map((h, i) => (
                  <th key={i} className={`text-left text-[11px] font-semibold text-white/30 uppercase tracking-wider px-5 py-3${i >= 1 && i <= 3 ? (i === 1 ? ' hidden md:table-cell' : ' hidden lg:table-cell') : ''}`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {clients.map((client) => (
                <tr key={client.id} className="hover:bg-white/[0.03] transition-colors group">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-brand/15 border border-brand/20 flex items-center justify-center shrink-0">
                        <span className="text-[11px] font-bold text-brand">{client.name[0]?.toUpperCase()}</span>
                      </div>
                      <p className="font-medium text-white/80 text-sm">{client.name}</p>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 hidden md:table-cell">
                    <p className="text-sm text-white/40">{client.company ?? <span className="text-white/15">—</span>}</p>
                  </td>
                  <td className="px-5 py-3.5 hidden lg:table-cell">
                    <p className="text-sm text-white/40">{client.email ?? <span className="text-white/15">—</span>}</p>
                  </td>
                  <td className="px-5 py-3.5 hidden lg:table-cell">
                    <p className="text-sm text-white/40">{client.phone ?? <span className="text-white/15">—</span>}</p>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-0.5 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEdit(client)} className="p-1.5 text-white/30 hover:text-brand hover:bg-brand/8 rounded-lg transition-colors cursor-pointer">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => setDeleteId(client.id)} className="p-1.5 text-white/30 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal add/edit */}
      {modal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0D1320] border border-white/10 rounded-2xl shadow-2xl shadow-black/60 w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/8">
              <h2 className="text-sm font-semibold text-white">
                {modal === 'add' ? 'Ajouter un client' : 'Modifier le client'}
              </h2>
              <button onClick={closeModal} className="p-1.5 text-white/40 hover:text-white rounded-lg transition-colors cursor-pointer">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleSave} className="px-6 py-5 space-y-3.5">
              {[
                { label: 'Nom *', name: 'name', required: true },
                { label: 'Entreprise', name: 'company' },
                { label: 'Email', name: 'email' },
                { label: 'Téléphone', name: 'phone' },
                { label: 'Adresse', name: 'address' },
              ].map(({ label, name, required }) => (
                <div key={name}>
                  <label className="block text-xs font-medium text-white/40 mb-1.5">{label}</label>
                  <input
                    type="text" name={name}
                    value={form[name as keyof typeof form]}
                    onChange={handleChange}
                    required={required}
                    className={inputCls}
                  />
                </div>
              ))}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeModal} className="flex-1 border border-white/10 text-white/60 font-medium rounded-xl py-2.5 hover:bg-white/5 transition-colors text-sm cursor-pointer">
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={loading || !form.name.trim()}
                  className="flex-1 bg-brand hover:bg-brand-dark text-white font-semibold rounded-xl py-2.5 transition-colors disabled:opacity-60 text-sm cursor-pointer disabled:cursor-not-allowed"
                >
                  {loading ? <><Spinner />Sauvegarde…</> : modal === 'add' ? 'Ajouter' : 'Sauvegarder'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal suppression */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0D1320] border border-white/10 rounded-2xl shadow-2xl shadow-black/60 w-full max-w-sm p-6 text-center">
            <div className="w-10 h-10 bg-red-500/10 border border-red-500/15 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Trash2 size={18} className="text-red-400" />
            </div>
            <h2 className="text-sm font-semibold text-white mb-1">Supprimer ce client ?</h2>
            <p className="text-xs text-white/40 mb-5">Cette action est irréversible.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 border border-white/10 text-white/60 font-medium rounded-xl py-2.5 hover:bg-white/5 text-sm cursor-pointer">Annuler</button>
              <button onClick={() => handleDelete(deleteId)} className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl py-2.5 text-sm cursor-pointer">Supprimer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
