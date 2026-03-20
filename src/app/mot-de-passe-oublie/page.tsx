'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Mail, ArrowLeft } from 'lucide-react'

const inputCls = 'w-full border border-white/10 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder:text-white/25 bg-white/5 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand/50 transition-all'

export default function MotDePasseOubliePage() {
  const [email,   setEmail]   = useState('')
  const [loading, setLoading] = useState(false)
  const [sent,    setSent]    = useState(false)
  const [error,   setError]   = useState('')

  const handleReset = async (e: React.FormEvent) => {
    const supabase = createClient()
    e.preventDefault()
    setLoading(true); setError('')
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/auth/reset-password`,
    })
    if (error) {
      setError('Une erreur est survenue. Réessaie.')
      setLoading(false)
    } else {
      setSent(true)
    }
  }

  return (
    <div className="min-h-screen bg-[#0A0F1E] flex items-center justify-center p-4">
      {/* Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-64 bg-brand/8 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-sm">

        {/* Logo */}
        <div className="flex justify-center mb-10">
          <span className="font-display font-bold text-white text-xl tracking-tight">
            Devi<span className="text-brand">so</span>
          </span>
        </div>

        <div className="bg-white/[0.04] border border-white/8 rounded-2xl p-8">
          {sent ? (
            <div className="text-center">
              <div className="w-14 h-14 bg-brand/10 border border-brand/15 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <Mail size={22} className="text-brand" />
              </div>
              <h2 className="font-display text-xl font-bold text-white mb-2">Email envoyé !</h2>
              <p className="text-white/40 text-sm mb-6">
                Un lien de réinitialisation a été envoyé à{' '}
                <strong className="text-white/70">{email}</strong>.
                Vérifie aussi tes spams.
              </p>
              <Link
                href="/connexion"
                className="text-sm text-brand font-medium hover:text-brand-dark transition-colors"
              >
                ← Retour à la connexion
              </Link>
            </div>
          ) : (
            <>
              <h1 className="font-display text-2xl font-bold text-white mb-1">Mot de passe oublié</h1>
              <p className="text-white/40 text-sm mb-6">
                Saisis ton email et on t&apos;envoie un lien de réinitialisation.
              </p>

              <form onSubmit={handleReset} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-white/40 mb-1.5">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="vous@exemple.fr"
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
                  {loading ? 'Envoi…' : 'Envoyer le lien'}
                </button>
              </form>

              <p className="text-center text-sm text-white/30 mt-6">
                <Link href="/connexion" className="text-brand font-medium hover:text-brand-dark transition-colors inline-flex items-center gap-1.5">
                  <ArrowLeft size={13} />
                  Retour à la connexion
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
