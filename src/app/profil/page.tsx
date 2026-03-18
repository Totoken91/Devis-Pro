import { AppLayout } from '@/components/shared/AppLayout'
import { createClient } from '@/lib/supabase/server'
import { ProfilForm } from './ProfilForm'

export default async function ProfilPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user!.id)
    .single()

  return (
    <AppLayout>
      <ProfilForm profile={profile as unknown as import('@/types/supabase').Profile | null} />
    </AppLayout>
  )
}
