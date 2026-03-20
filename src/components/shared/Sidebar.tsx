'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Users, FileText, Settings, LogOut, Menu, X, CreditCard, Zap } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { NotificationBell } from './NotificationBell'

const navItems = [
  { href: '/dashboard',              label: 'Dashboard',    icon: LayoutDashboard },
  { href: '/devis',                  label: 'Devis',        icon: FileText },
  { href: '/clients',                label: 'Clients',      icon: Users },
  { href: '/profil',                 label: 'Paramètres',   icon: Settings },
  { href: '/parametres/facturation', label: 'Facturation',  icon: CreditCard },
]

export function Sidebar({ userEmail, plan = 'free' }: { userEmail: string; plan?: 'free' | 'pro' }) {
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
      <div className="h-[57px] flex items-center gap-2 px-5 border-b border-white/6 shrink-0">
        <Link
          href="/dashboard"
          onClick={() => setMobileOpen(false)}
          className="flex items-center gap-2.5 group"
        >
          <span className="font-display font-bold text-white text-[20px] tracking-tight">
            Devi<span className="text-brand">so</span>
          </span>
        </Link>
        {plan === 'pro' && (
          <span className="ml-1 inline-flex items-center gap-1 bg-brand/20 text-brand text-[10px] font-bold px-2 py-0.5 rounded-full">
            <Zap size={9} />
            PRO
          </span>
        )}
        <button
          className="md:hidden ml-auto text-white/40 hover:text-white transition-colors"
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
                  ? 'bg-brand/15 text-brand'
                  : 'text-white/45 hover:text-white hover:bg-white/6'
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

      {/* Promo Pro (free users only) */}
      {plan === 'free' && (
        <div className="px-3 mb-3">
          <Link
            href="/parametres/facturation"
            onClick={() => setMobileOpen(false)}
            className="block bg-brand/10 hover:bg-brand/15 border border-brand/20 rounded-xl p-3 transition-colors group"
          >
            <div className="flex items-center gap-1.5 mb-1">
              <Zap size={11} className="text-brand" />
              <span className="text-xs font-bold text-brand">Passer Pro</span>
            </div>
            <p className="text-[10px] text-white/35 leading-relaxed">
              Devis illimités, relances auto, branding custom
            </p>
          </Link>
        </div>
      )}

      {/* Bottom */}
      <div className="px-3 pb-4 border-t border-white/6 pt-3 space-y-0.5">
        <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg">
          <div className="w-6 h-6 rounded-full bg-brand/20 border border-brand/30 flex items-center justify-center shrink-0">
            <span className="text-[10px] font-bold text-brand">{initial}</span>
          </div>
          <p className="text-xs text-white/35 truncate flex-1 min-w-0">{userEmail}</p>
          <NotificationBell />
        </div>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-sm font-medium text-white/35 hover:text-white/70 hover:bg-white/5 transition-colors cursor-pointer"
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
      <div className="md:hidden fixed top-0 left-0 right-0 z-30 bg-[#1A2438] border-b border-white/6 px-4 h-14 flex items-center gap-3">
        <button
          onClick={() => setMobileOpen(true)}
          className="text-white/50 hover:text-white transition-colors"
        >
          <Menu size={20} />
        </button>
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="font-display font-bold text-white text-[20px] tracking-tight">
            Devi<span className="text-brand">so</span>
          </span>
        </Link>
        <div className="ml-auto">
          <NotificationBell />
        </div>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          bg-[#1A2438] border-r border-white/6 flex flex-col shrink-0
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
