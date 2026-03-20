'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { ArrowRight, CheckCircle2, Mail } from 'lucide-react'

const inputCls = 'w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all'

function GoogleIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 18 18" aria-hidden="true">
      <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/>
      <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2.01c-.72.48-1.63.75-2.7.75-2.09 0-3.86-1.4-4.49-3.29H1.8v2.07A8 8 0 0 0 8.98 17z"/>
      <path fill="#FBBC05" d="M4.49 10.51A4.8 4.8 0 0 1 4.24 9c0-.52.09-1.02.25-1.51V5.42H1.8A8 8 0 0 0 .98 9c0 1.29.31 2.51.82 3.58l2.69-2.07z"/>
      <path fill="#EA4335" d="M8.98 4.2c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 8.98 1a8 8 0 0 0-7.18 4.42l2.69 2.07c.63-1.89 2.4-3.29 4.49-3.29z"/>
    </svg>
  )
}

export default function InscriptionPage() {
  const [fullName, setFullName] = useState('')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
  const [success,  setSuccess]  = useState(false)

  const handleSignUp = async (e: React.FormEvent) => {
    const supabase = createClient()
    e.preventDefault(); setLoading(true); setError('')
    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.')
      setLoading(false); return
    }
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name: fullName }, emailRedirectTo: `${window.location.origin}/auth/callback` },
    })
    if (error) {
      setError(error.message.includes('already registered') ? 'Un compte existe déjà avec cet email.' : 'Une erreur est survenue.')
      setLoading(false)
    } else {
      setSuccess(true)
    }
  }

  const handleGoogleSignUp = async () => {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: `${window.location.origin}/auth/callback` } })
  }

  return (
    <div className="min-h-screen flex">

      {/* ── Left panel ── */}
      <div className="hidden md:flex w-[420px] shrink-0 bg-gray-950 flex-col justify-between p-10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center shadow-sm shadow-brand/40">
            <span className="text-white font-display font-bold text-sm">D</span>
          </div>
          <span className="font-display font-bold text-white text-lg tracking-tight">Deviso</span>
        </div>

        <div>
          <p className="font-display text-3xl font-bold text-white leading-tight mb-4">
            Lance-toi.<br />
            <span className="text-brand">Gratuit,</span><br />
            sans carte.
          </p>
          <p className="text-white/40 text-sm leading-relaxed mb-8">
            Rejoins des centaines de freelances qui envoient leurs devis avec Deviso.
          </p>
          <ul className="space-y-3">
            {['3 devis offerts sur le plan gratuit', 'Signature électronique incluse', 'Notifications ouverture en temps réel'].map((f) => (
              <li key={f} className="flex items-center gap-2.5 text-sm text-white/60">
                <CheckCircle2 size={13} className="text-brand shrink-0" />
                {f}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-white/20 text-xs">© {new Date().getFullYear()} Deviso</p>
      </div>

      {/* ── Right panel ── */}
      <div className="flex-1 flex items-center justify-center px-4 py-12 bg-[#F7F8F5]">
        <div className="w-full max-w-sm">

          {/* Mobile logo */}
          <div className="md:hidden flex items-center gap-2 mb-8">
            <div className="w-7 h-7 bg-brand rounded-lg flex items-center justify-center">
              <span className="text-white font-display font-bold text-xs">D</span>
            </div>
            <span className="font-display font-bold text-gray-900">Deviso</span>
          </div>

          {success ? (
            /* ── Succès ── */
            <div className="text-center">
              <div className="w-14 h-14 bg-brand/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <Mail size={24} className="text-brand" />
              </div>
              <h2 className="font-display text-xl font-bold text-gray-900 mb-2">Vérifie ton email</h2>
              <p className="text-sm text-gray-400 mb-6">
                Un lien de confirmation a été envoyé à<br />
                <strong className="text-gray-700">{email}</strong>
              </p>
              <Link href="/connexion" className="text-sm text-brand font-medium hover:text-brand-dark transition-colors">
                Retour à la connexion →
              </Link>
            </div>
          ) : (
            <>
              <h1 className="font-display text-2xl font-bold text-gray-900 tracking-tight mb-1">Créer un compte</h1>
              <p className="text-gray-400 text-sm mb-7">Gratuit, sans carte bancaire</p>

              <button
                onClick={handleGoogleSignUp}
                type="button"
                className="w-full flex items-center justify-center gap-3 border border-gray-200 bg-white rounded-xl py-2.5 px-4 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors mb-5 cursor-pointer"
              >
                <GoogleIcon />
                Continuer avec Google
              </button>

              <div className="flex items-center gap-3 mb-5">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400">ou</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              <form onSubmit={handleSignUp} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Prénom et nom</label>
                  <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Email</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Mot de passe</label>
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="8 caractères minimum" className={inputCls} />
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm">{error}</div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-brand hover:bg-brand-dark text-white font-semibold rounded-xl py-2.5 text-sm transition-all shadow-sm shadow-brand/25 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? 'Création…' : <>Créer mon compte <ArrowRight size={14} /></>}
                </button>
              </form>

              <p className="text-center text-xs text-gray-400 mt-4">
                En créant un compte, tu acceptes nos{' '}
                <span className="underline cursor-pointer">CGU</span>.
              </p>
              <p className="text-center text-sm text-gray-400 mt-3">
                Déjà un compte ?{' '}
                <Link href="/connexion" className="text-brand font-medium hover:text-brand-dark transition-colors">Se connecter</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
