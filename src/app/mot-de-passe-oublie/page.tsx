'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function MotDePasseOubliePage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1E3A5F] to-[#2E86C1] p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="text-3xl font-bold text-white">
            Devi<span className="text-[#7EC8E3]">so</span>
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {sent ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-[#2E86C1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Email envoyé !</h2>
              <p className="text-gray-500 text-sm">
                Un lien de réinitialisation a été envoyé à <strong>{email}</strong>.
                Vérifie aussi tes spams.
              </p>
              <Link
                href="/connexion"
                className="mt-6 inline-block text-[#2E86C1] font-medium hover:underline text-sm"
              >
                Retour à la connexion
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">Mot de passe oublié</h1>
              <p className="text-gray-500 mb-6">
                Saisis ton email et on t&apos;envoie un lien de réinitialisation.
              </p>

              <form onSubmit={handleReset} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="vous@exemple.fr"
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2E86C1] focus:border-transparent transition"
                  />
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#2E86C1] hover:bg-[#1E3A5F] text-white font-semibold rounded-xl py-3 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? 'Envoi...' : 'Envoyer le lien'}
                </button>
              </form>

              <p className="text-center text-sm text-gray-500 mt-6">
                <Link href="/connexion" className="text-[#2E86C1] font-medium hover:underline">
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
