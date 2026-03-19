import { AppLayout } from '@/components/shared/AppLayout'
import { createClient } from '@/lib/supabase/server'
import { DevisForm } from '../DevisForm'
import { notFound } from 'next/navigation'
import type { Client, Devis, Profile } from '@/types/supabase'

export default async function EditDevisPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: devis }, { data: clients }, { data: profile }] = await Promise.all([
    supabase.from('devis').select('*').eq('id', params.id).eq('user_id', user!.id).single(),
    supabase.from('clients').select('*').eq('user_id', user!.id).order('name'),
    supabase.from('profiles').select('*').eq('id', user!.id).single(),
  ])

  if (!devis) notFound()

  return (
    <AppLayout>
      <DevisForm
        mode="edit"
        clients={(clients ?? []) as unknown as Client[]}
        profile={profile as unknown as Profile}
        initialData={devis as unknown as Devis}
      />
    </AppLayout>
  )
}
