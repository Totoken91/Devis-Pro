'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { CheckCircle } from 'lucide-react'

const inputCls = 'w-full border border-white/10 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder:text-white/25 bg-white/5 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand/50 transition-all'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirm,  setConfirm]  = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
  const [success,  setSuccess]  = useState(false)
  const router = useRouter()

  const handleUpdatePassword = async (e: React.FormEvent) => {
    const supabase = createClient()
    e.preventDefault(); setError('')

    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.')
      return
    }
    if (password !== confirm) {
      setError('Les mots de passe ne correspondent pas.')
      return
    }

    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      setError('Une erreur est survenue. Le lien est peut-être expiré.')
      setLoading(false)
    } else {
      setSuccess(true)
      setTimeout(() => router.push('/dashboard'), 2000)
    }
  }

  return (
    <div className="min-h-screen bg-[#0A0F1E] flex items-center justify-center p-4">
      {/* Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-64 bg-brand/8 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-sm">

        {/* Logo */}
        <div className="flex items-center gap-2.5 justify-center mb-10">
          <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center shadow-sm shadow-brand/40">
            <span className="text-white font-display font-bold text-sm">D</span>
          </div>
          <span className="font-display font-bold text-white text-lg tracking-tight">Deviso</span>
        </div>

        <div className="bg-white/[0.04] border border-white/8 rounded-2xl p-8">
          {success ? (
            <div className="text-center">
              <div className="w-14 h-14 bg-brand/10 border border-brand/15 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <CheckCircle size={22} className="text-brand" />
              </div>
              <h2 className="font-display text-xl font-bold text-white mb-2">Mot de passe mis à jour !</h2>
              <p className="text-white/40 text-sm">Redirection vers le dashboard…</p>
            </div>
          ) : (
            <>
              <h1 className="font-display text-2xl font-bold text-white mb-1">Nouveau mot de passe</h1>
              <p className="text-white/40 text-sm mb-6">Choisis un mot de passe sécurisé.</p>

              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-white/40 mb-1.5">Nouveau mot de passe</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="8 caractères minimum"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/40 mb-1.5">Confirmer le mot de passe</label>
                  <input
                    type="password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    required
                    placeholder="••••••••"
                    className={inputCls}
                  />
                </div>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl px-4 py-3 text-sm">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-brand hover:bg-brand-dark text-white font-semibold rounded-xl py-2.5 text-sm transition-all shadow-sm shadow-brand/25 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                >
                  {loading ? 'Mise à jour…' : 'Mettre à jour le mot de passe'}
                </button>
              </form>

              <p className="text-center text-sm text-white/30 mt-6">
                <Link href="/connexion" className="text-brand font-medium hover:text-brand-dark transition-colors">
                  ← Retour à la connexion
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
