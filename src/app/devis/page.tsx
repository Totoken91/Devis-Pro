import { AppLayout } from '@/components/shared/AppLayout'
import { createClient } from '@/lib/supabase/server'
import { DevisList } from './DevisList'
import type { Devis } from '@/types/supabase'

type DevisWithClient = Devis & {
  clients: { name: string; company: string | null } | null
}

export default async function DevisPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: devis } = await supabase
    .from('devis')
    .select('*, clients(name, company)')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })

  return (
    <AppLayout>
      <DevisList initialDevis={(devis ?? []) as unknown as DevisWithClient[]} />
    </AppLayout>
  )
}
