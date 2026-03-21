import { createClient } from '@/lib/supabase/server'
import { redirect }     from 'next/navigation'
import { Sidebar }      from './Sidebar'
import type { Profile } from '@/types/supabase'

export async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/connexion')

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan, is_admin')
    .eq('id', user.id)
    .single()

  const plan = (profile as Pick<Profile, 'plan'> | null)?.plan ?? 'free'
  const isAdmin = (profile as Pick<Profile, 'is_admin'> | null)?.is_admin ?? false

  return (
    <div className="flex min-h-screen bg-[#141C2E]">
      <Sidebar userEmail={user.email ?? ''} plan={plan} isAdmin={isAdmin} />
      <main className="flex-1 overflow-auto pt-14 md:pt-0">
        {children}
      </main>
    </div>
  )
}
