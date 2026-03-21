'use client'

import { useState } from 'react'
import { Zap } from 'lucide-react'
import { Spinner } from '@/components/ui/Spinner'

export function UpgradeButton({ interval, label }: { interval: 'monthly' | 'yearly'; label: string }) {
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState<string | null>(null)

  const handleClick = async () => {
    setLoading(true); setError(null)
    const res = await fetch('/api/stripe/checkout', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ interval }),
    })
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
        className="inline-flex items-center gap-2 bg-brand hover:bg-brand-dark text-white font-semibold rounded-xl px-5 py-2.5 text-sm transition-all shadow-sm shadow-brand/30 hover:shadow-brand/50 hover:-translate-y-px disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
      >
        <Zap size={14} />
        {loading ? <><Zap size={14} /><span className="inline-flex items-center gap-2"><Spinner />Redirection…</span></> : label}
      </button>
      {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
    </div>
  )
}
