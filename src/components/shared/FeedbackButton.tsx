'use client'

import { useState } from 'react'
import { createPortal } from 'react-dom'
import { MessageSquarePlus, Send, X, CheckCircle } from 'lucide-react'
import { Spinner } from '@/components/ui/Spinner'

export function FeedbackButton() {
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async () => {
    if (!message.trim()) return
    setLoading(true)
    const res = await fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: message.trim() }),
    })
    setLoading(false)
    if (res.ok) {
      setSent(true)
      setTimeout(() => { setOpen(false); setSent(false); setMessage('') }, 1500)
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-2 w-full rounded-lg text-sm font-medium text-brand bg-brand/10 hover:bg-brand/15 border border-brand/20 transition-colors cursor-pointer"
      >
        <MessageSquarePlus size={14} />
        Feedback
      </button>

      {open && createPortal(
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
          <div className="bg-[#0D1320] border border-white/10 rounded-2xl shadow-2xl shadow-black/60 w-full max-w-sm overflow-hidden">

            <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                <MessageSquarePlus size={15} className="text-brand" />
                Envoyer un feedback
              </h2>
              <button
                onClick={() => { setOpen(false); setSent(false); setMessage('') }}
                className="text-white/30 hover:text-white transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-5">
              {sent ? (
                <div className="py-6 text-center">
                  <CheckCircle size={32} className="text-brand mx-auto mb-3" />
                  <p className="text-sm font-medium text-white/80">Merci pour ton retour !</p>
                  <p className="text-xs text-white/35 mt-1">Ton message a bien été envoyé.</p>
                </div>
              ) : (
                <>
                  <p className="text-xs text-white/35 mb-3">
                    Une idée, un bug, une suggestion ? Dis-nous tout.
                  </p>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={4}
                    placeholder="Ton message..."
                    className="w-full border border-white/10 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder:text-white/25 bg-white/5 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand/50 transition-all resize-none"
                    autoFocus
                  />
                  <div className="flex justify-end gap-3 mt-4">
                    <button
                      onClick={() => { setOpen(false); setMessage('') }}
                      className="border border-white/10 text-white/60 font-medium rounded-xl px-4 py-2 text-sm hover:bg-white/5 transition-colors cursor-pointer"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={loading || !message.trim()}
                      className="flex items-center gap-2 bg-brand hover:bg-brand-dark text-white font-semibold rounded-xl px-4 py-2 text-sm transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? <Spinner size={14} /> : <Send size={13} />}
                      Envoyer
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
