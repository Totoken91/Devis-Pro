import { createClient } from '@/lib/supabase/server'
import { sendOwnerNotification } from '@/lib/notify'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  req: NextRequest,
  { params }: { params: { token: string } }
) {
  const body = await req.json()
  const { action, nom_signataire } = body as { action: string; nom_signataire?: string }

  if (!['accepte', 'refuse'].includes(action)) {
    return NextResponse.json({ error: 'Action invalide' }, { status: 400 })
  }

  if (action === 'accepte' && !nom_signataire?.trim()) {
    return NextResponse.json({ error: 'Nom requis pour signer' }, { status: 400 })
  }

  const supabase = createClient()

  const { data: devis } = await supabase
    .from('devis')
    .select('id, statut')
    .eq('token_public', params.token)
    .single()

  if (!devis) {
    return NextResponse.json({ error: 'Devis introuvable' }, { status: 404 })
  }

  if (!['envoye', 'ouvert'].includes(devis.statut)) {
    return NextResponse.json({ error: 'Ce devis ne peut plus être modifié' }, { status: 409 })
  }

  const update: Record<string, unknown> = { statut: action }
  if (action === 'accepte') {
    update.signe_le = new Date().toISOString()
  }

  const { error } = await supabase.from('devis').update(update).eq('id', devis.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Notifier le freelancer (fire-and-forget)
  sendOwnerNotification(
    params.token,
    action as 'accepte' | 'refuse',
    action === 'accepte' ? nom_signataire : undefined
  ).catch(() => { /* silencieux si notification échoue */ })

  return NextResponse.json({ success: true })
}
