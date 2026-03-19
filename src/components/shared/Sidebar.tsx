'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Users, FileText, Settings, LogOut, Menu, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { NotificationBell } from './NotificationBell'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/clients', label: 'Clients', icon: Users },
  { href: '/devis', label: 'Devis', icon: FileText },
  { href: '/profil', label: 'Paramètres', icon: Settings },
]

interface SidebarProps {
  userEmail: string
}

export function Sidebar({ userEmail }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/connexion')
    router.refresh()
  }

  const navContent = (
    <>
      <div className="px-6 py-6 border-b border-white/10 flex items-center justify-between">
        <Link href="/dashboard" className="text-2xl font-bold text-white" onClick={() => setMobileOpen(false)}>
          Devi<span className="text-[#7EC8E3]">so</span>
        </Link>
        <button className="md:hidden text-white/60 hover:text-white" onClick={() => setMobileOpen(false)}>
          <X size={20} />
        </button>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-[#2E86C1] text-white'
                  : 'text-white/60 hover:text-white hover:bg-white/10'
              }`}
            >
              <Icon size={18} />
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="px-3 py-4 border-t border-white/10">
        <div className="flex items-center justify-between px-3 py-2 mb-1">
          <p className="text-xs text-white/40 truncate">{userEmail}</p>
          <NotificationBell />
        </div>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-sm font-medium text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
        >
          <LogOut size={18} />
          Déconnexion
        </button>
      </div>
    </>
  )

  return (
    <>
      {/* Barre mobile en haut */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-30 bg-[#1E3A5F] px-4 py-3 flex items-center gap-3 shadow-md">
        <button onClick={() => setMobileOpen(true)} className="text-white/70 hover:text-white">
          <Menu size={22} />
        </button>
        <Link href="/dashboard" className="flex-1 text-xl font-bold text-white">
          Devi<span className="text-[#7EC8E3]">so</span>
        </Link>
        <NotificationBell />
      </div>

      {/* Overlay mobile */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          bg-[#1E3A5F] flex flex-col shrink-0
          fixed inset-y-0 left-0 w-64 z-50 transition-transform duration-200
          md:static md:w-60 md:min-h-screen md:translate-x-0
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {navContent}
      </aside>
    </>
  )
}
