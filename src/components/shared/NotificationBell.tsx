'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { Bell, Trash2, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Notification } from '@/types/supabase'

const EVENT_ICON: Record<Notification['event'], string> = {
  ouvert:  '👁️',
  accepte: '✅',
  refuse:  '❌',
}

const EVENT_LABEL: Record<Notification['event'], string> = {
  ouvert:  'a consulté votre devis',
  accepte: 'a accepté votre devis',
  refuse:  'a refusé votre devis',
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

export function NotificationBell() {
  const [notifs, setNotifs] = useState<Notification[]>([])
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  const markAllRead = useCallback(async (list: Notification[]) => {
    const ids = list.filter((n) => !n.is_read).map((n) => n.id)
    if (ids.length === 0) return
    await supabase.from('notifications').update({ is_read: true }).in('id', ids)
    setNotifs((prev) => prev.map((n) => ({ ...n, is_read: true })))
  }, [supabase])

  const deleteOne = useCallback(async (id: string) => {
    await supabase.from('notifications').delete().eq('id', id)
    setNotifs((prev) => prev.filter((n) => n.id !== id))
  }, [supabase])

  const deleteAll = useCallback(async () => {
    const ids = notifs.map((n) => n.id)
    if (ids.length === 0) return
    await supabase.from('notifications').delete().in('id', ids)
    setNotifs([])
  }, [supabase, notifs])

  useEffect(() => {
    let userId = ''

    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      userId = user.id

      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20)
      if (data) setNotifs(data as Notification[])

      const channel = supabase
        .channel('notifications-bell')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` },
          (payload) => {
            setNotifs((prev) => [payload.new as Notification, ...prev.slice(0, 19)])
          }
        )
        .subscribe()

      return () => { supabase.removeChannel(channel) }
    }

    init()
  }, [supabase])

  // Fermer au clic extérieur
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const unreadCount = notifs.filter((n) => !n.is_read).length

  // Calcule si le dropdown doit s'ouvrir vers le haut ou le bas, et s'aligner à droite ou gauche
  const dropdownCls = useMemo(() => {
    if (!ref.current) return 'top-full mt-2 right-0'
    const rect = ref.current.getBoundingClientRect()
    const spaceBelow = window.innerHeight - rect.bottom
    const spaceRight = window.innerWidth - rect.left
    const vertical = spaceBelow < 340 ? 'bottom-full mb-2' : 'top-full mt-2'
    const horizontal = spaceRight < 320 ? 'right-0' : 'left-0'
    return `${vertical} ${horizontal}`
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const handleToggle = () => {
    const next = !open
    setOpen(next)
    if (next) markAllRead(notifs)
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={handleToggle}
        className="relative p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
        title="Notifications"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-0.5 bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className={`absolute w-[min(320px,calc(100vw-1rem))] bg-[#0D1320] rounded-2xl shadow-2xl shadow-black/60 border border-white/10 z-50 overflow-hidden ${dropdownCls}`}>
          <div className="px-4 py-3 border-b border-white/8 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Notifications</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <span className="text-xs text-brand font-medium">
                  {unreadCount} nouvelle{unreadCount > 1 ? 's' : ''}
                </span>
              )}
              {notifs.length > 0 && (
                <button
                  onClick={deleteAll}
                  className="text-white/25 hover:text-red-400 transition-colors cursor-pointer p-0.5"
                  title="Tout effacer"
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-white/5">
            {notifs.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <Bell size={24} className="text-white/15 mx-auto mb-2" />
                <p className="text-sm text-white/35">Aucune notification</p>
              </div>
            ) : (
              notifs.map((n) => (
                <div
                  key={n.id}
                  className={`px-4 py-3 group/notif ${!n.is_read ? 'bg-brand/5' : ''}`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-base mt-0.5 shrink-0">{EVENT_ICON[n.event]}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white/80 leading-snug">
                        <span className="font-medium">{n.client_name}</span>{' '}
                        <span className="text-white/50">{EVENT_LABEL[n.event]}</span>
                      </p>
                      <p className="text-xs text-white/30 mt-0.5">
                        {n.devis_numero} · {timeAgo(n.created_at)}
                      </p>
                    </div>
                    <button
                      onClick={() => deleteOne(n.id)}
                      className="shrink-0 mt-1 p-0.5 text-white/0 group-hover/notif:text-white/25 hover:!text-red-400 transition-colors cursor-pointer"
                      title="Supprimer"
                    >
                      <X size={12} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
