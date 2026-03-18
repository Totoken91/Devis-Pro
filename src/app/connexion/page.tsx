'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Suspense } from 'react'

function ConnexionForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  const urlError = searchParams.get('error')

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(
        error.message === 'Invalid login credentials'
          ? 'Email ou mot de passe incorrect'
          : 'Une erreur est survenue. Réessaie.'
      )
      setLoading(false)
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
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
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Connexion</h1>
          <p className="text-gray-500 mb-6">Bon retour sur Deviso</p>

          {urlError && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm mb-4">
              Une erreur est survenue. Réessaie.
            </div>
          )}

          {/* Google */}
          <button
            onClick={handleGoogleLogin}
            type="button"
            className="w-full flex items-center justify-center gap-3 border border-gray-300 rounded-xl py-3 px-4 text-gray-700 font-medium hover:bg-gray-50 transition-colors mb-4"
          >
            <GoogleIcon />
            Continuer avec Google
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-sm text-gray-400">ou</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Formulaire email */}
          <form onSubmit={handleEmailLogin} className="space-y-4">
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

            <div>
              <div className="flex justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Mot de passe
                </label>
                <Link
                  href="/mot-de-passe-oublie"
                  className="text-sm text-[#2E86C1] hover:underline"
                >
                  Oublié ?
                </Link>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
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
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Pas encore de compte ?{' '}
            <Link href="/inscription" className="text-[#2E86C1] font-medium hover:underline">
              Créer un compte
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z" />
      <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2.01c-.72.48-1.63.75-2.7.75-2.09 0-3.86-1.4-4.49-3.29H1.8v2.07A8 8 0 0 0 8.98 17z" />
      <path fill="#FBBC05" d="M4.49 10.51A4.8 4.8 0 0 1 4.24 9c0-.52.09-1.02.25-1.51V5.42H1.8A8 8 0 0 0 .98 9c0 1.29.31 2.51.82 3.58l2.69-2.07z" />
      <path fill="#EA4335" d="M8.98 4.2c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 8.98 1a8 8 0 0 0-7.18 4.42l2.69 2.07c.63-1.89 2.4-3.29 4.49-3.29z" />
    </svg>
  )
}

export default function ConnexionPage() {
  return (
    <Suspense>
      <ConnexionForm />
    </Suspense>
  )
}
