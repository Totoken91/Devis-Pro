import { AppLayout } from '@/components/shared/AppLayout'
import { createClient } from '@/lib/supabase/server'
import { ClientsList } from './ClientsList'

export default async function ClientsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: clients } = await supabase
    .from('clients')
    .select('*')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })

  return (
    <AppLayout>
      <ClientsList initialClients={(clients ?? []) as unknown as import('@/types/supabase').Client[]} userId={user!.id} />
    </AppLayout>
  )
}
