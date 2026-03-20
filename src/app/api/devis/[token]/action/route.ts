import { createClient } from '@/lib/supabase/server'
import { sendOwnerNotification } from '@/lib/notify'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const actionSchema = z.object({
  action:         z.enum(['accepte', 'refuse']),
  nom_signataire: z.string().min(1).max(200).trim().optional(),
})

const TOKEN_RE = /^[a-f0-9]{12,32}$/

export async function POST(
  req: NextRequest,
  { params }: { params: { token: string } }
) {
  if (!TOKEN_RE.test(params.token)) {
    return NextResponse.json({ error: 'Token invalide' }, { status: 400 })
  }

  const raw = await req.json().catch(() => null)
  const parsed = actionSchema.safeParse(raw)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Action invalide' }, { status: 400 })
  }
  const { action, nom_signataire } = parsed.data

  if (action === 'accepte' && !nom_signataire) {
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
