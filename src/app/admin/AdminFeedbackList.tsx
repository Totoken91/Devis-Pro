'use client'

import { useState } from 'react'
import { MessageSquarePlus, Check } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type Feedback = {
  id: string
  created_at: string
  email: string
  message: string
  is_read: boolean
}

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "à l'instant"
  if (mins < 60) return `il y a ${mins}min`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `il y a ${hours}h`
  const days = Math.floor(hours / 24)
  return `il y a ${days}j`
}

export function AdminFeedbackList({ initialFeedbacks }: { initialFeedbacks: Feedback[] }) {
  const [feedbacks, setFeedbacks] = useState(initialFeedbacks)
  const supabase = createClient()

  const markRead = async (id: string) => {
    await supabase.from('feedbacks').update({ is_read: true }).eq('id', id)
    setFeedbacks((prev) => prev.map((f) => f.id === id ? { ...f, is_read: true } : f))
  }

  if (feedbacks.length === 0) {
    return (
      <div className="bg-white/[0.03] rounded-2xl border border-white/8 py-14 flex flex-col items-center text-center px-6">
        <MessageSquarePlus size={24} className="text-white/15 mb-2" />
        <p className="text-sm text-white/40">Aucun feedback pour l&apos;instant</p>
      </div>
    )
  }

  return (
    <div className="bg-white/[0.03] rounded-2xl border border-white/8 divide-y divide-white/5 overflow-hidden">
      {feedbacks.map((f) => (
        <div
          key={f.id}
          className={`px-5 py-4 ${!f.is_read ? 'bg-brand/5' : ''}`}
        >
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 bg-white/5 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
              <span className="text-[10px] font-bold text-white/40">
                {f.email[0]?.toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-xs font-medium text-white/60 truncate">{f.email}</p>
                <span className="text-[10px] text-white/25 shrink-0">{timeAgo(f.created_at)}</span>
                {!f.is_read && (
                  <span className="w-2 h-2 bg-brand rounded-full shrink-0" />
                )}
              </div>
              <p className="text-sm text-white/80 whitespace-pre-line leading-relaxed">{f.message}</p>
            </div>
            {!f.is_read && (
              <button
                onClick={() => markRead(f.id)}
                className="shrink-0 p-1.5 text-white/25 hover:text-brand hover:bg-brand/10 rounded-lg transition-colors cursor-pointer"
                title="Marquer comme lu"
              >
                <Check size={14} />
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
