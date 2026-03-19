import { AppLayout } from '@/components/shared/AppLayout'
import { createClient } from '@/lib/supabase/server'
import { DevisForm } from '../DevisForm'
import { generateNumeroDevis } from '@/lib/utils'
import type { Client, Profile } from '@/types/supabase'

export default async function NouveauDevisPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: profile }, { data: clients }, { count }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user!.id).single(),
    supabase.from('clients').select('*').eq('user_id', user!.id).order('name'),
    supabase.from('devis').select('*', { count: 'exact', head: true }).eq('user_id', user!.id),
  ])

  const nextNumero = generateNumeroDevis(count ?? 0)

  return (
    <AppLayout>
      <DevisForm
        mode="create"
        clients={(clients ?? []) as unknown as Client[]}
        profile={profile as unknown as Profile}
        nextNumero={nextNumero}
      />
    </AppLayout>
  )
}
