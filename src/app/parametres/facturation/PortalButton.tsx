'use client'

import { useState } from 'react'
import { ExternalLink } from 'lucide-react'

export function PortalButton() {
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState<string | null>(null)

  const handleClick = async () => {
    setLoading(true); setError(null)
    const res = await fetch('/api/stripe/portal', { method: 'POST' })
    if (res.ok) {
      const { url } = await res.json()
      window.location.href = url
    } else {
      const data = await res.json().catch(() => ({}))
      setError(data.error ?? 'Une erreur est survenue.')
      setLoading(false)
    }
  }

  return (
    <div>
      <button
        onClick={handleClick}
        disabled={loading}
        className="inline-flex items-center gap-2 border border-white/15 text-white/70 hover:text-white hover:border-white/30 font-medium rounded-xl px-5 py-2.5 text-sm transition-all cursor-pointer disabled:opacity-50"
      >
        <ExternalLink size={14} />
        {loading ? 'Redirection…' : 'Gérer l\'abonnement'}
      </button>
      {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
    </div>
  )
}
