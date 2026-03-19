'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Users, FileText, Settings, LogOut, Menu, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { NotificationBell } from './NotificationBell'

const navItems = [
  { href: '/dashboard', label: 'Dashboard',    icon: LayoutDashboard },
  { href: '/devis',     label: 'Devis',         icon: FileText },
  { href: '/clients',   label: 'Clients',       icon: Users },
  { href: '/profil',    label: 'Paramètres',    icon: Settings },
]

export function Sidebar({ userEmail }: { userEmail: string }) {
  const pathname  = usePathname()
  const router    = useRouter()
  const supabase  = createClient()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/connexion')
    router.refresh()
  }

  const initial = userEmail[0]?.toUpperCase() ?? '?'

  const navContent = (
    <div className="flex flex-col h-full">

      {/* Logo */}
      <div className="h-[57px] flex items-center gap-2 px-5 border-b border-gray-100 shrink-0">
        <Link
          href="/dashboard"
          onClick={() => setMobileOpen(false)}
          className="flex items-center gap-2.5 group"
        >
          <div className="w-7 h-7 bg-brand rounded-lg flex items-center justify-center shadow-sm shadow-brand/30 group-hover:shadow-brand/50 transition-shadow">
            <span className="text-white font-display font-bold text-xs leading-none">D</span>
          </div>
          <span className="font-display font-bold text-gray-900 text-[17px] tracking-tight">
            Deviso
          </span>
        </Link>
        <button
          className="md:hidden ml-auto text-gray-400 hover:text-gray-700 transition-colors"
          onClick={() => setMobileOpen(false)}
        >
          <X size={18} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive =
            pathname === href ||
            (href !== '/dashboard' && pathname.startsWith(href + '/'))
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={`
                flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium
                transition-all duration-150
                ${isActive
                  ? 'bg-brand/10 text-brand'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                }
              `}
            >
              <Icon
                size={15}
                strokeWidth={isActive ? 2.5 : 2}
                className="shrink-0"
              />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 pb-4 border-t border-gray-100 pt-3 space-y-0.5">
        <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg">
          <div className="w-6 h-6 rounded-full bg-brand/15 flex items-center justify-center shrink-0">
            <span className="text-[10px] font-bold text-brand">{initial}</span>
          </div>
          <p className="text-xs text-gray-400 truncate flex-1 min-w-0">{userEmail}</p>
          <NotificationBell />
        </div>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-sm font-medium text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
        >
          <LogOut size={15} />
          Déconnexion
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-30 bg-white border-b border-gray-100 px-4 h-14 flex items-center gap-3">
        <button
          onClick={() => setMobileOpen(true)}
          className="text-gray-500 hover:text-gray-900 transition-colors"
        >
          <Menu size={20} />
        </button>
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-6 h-6 bg-brand rounded-md flex items-center justify-center">
            <span className="text-white font-bold text-[10px]">D</span>
          </div>
          <span className="font-display font-bold text-gray-900">Deviso</span>
        </Link>
        <div className="ml-auto">
          <NotificationBell />
        </div>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/25 z-40 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          bg-white border-r border-gray-100 flex flex-col shrink-0
          fixed inset-y-0 left-0 w-56 z-50 transition-transform duration-200
          md:static md:w-52 md:min-h-screen md:translate-x-0
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {navContent}
      </aside>
    </>
  )
}
