import { sendOwnerNotification, type NotifyEvent } from '@/lib/notify'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const notifySchema = z.object({
  token:         z.string().regex(/^[a-z0-9]{12,64}$/),
  event:         z.enum(['ouvert', 'accepte', 'refuse']),
  nomSignataire: z.string().max(200).trim().optional(),
  _secret:       z.string().optional(),
})

// Internal-only endpoint — validated by shared secret
const INTERNAL_SECRET = process.env.CRON_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || ''

export async function POST(req: NextRequest) {
  const raw = await req.json().catch(() => null)
  const parsed = notifySchema.safeParse(raw)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Paramètres invalides' }, { status: 400 })
  }

  // Vérifier l'appel interne via secret ou header Authorization
  const authHeader = req.headers.get('authorization')
  const isAuthorized =
    (parsed.data._secret && parsed.data._secret === INTERNAL_SECRET) ||
    (authHeader && authHeader === `Bearer ${INTERNAL_SECRET}`)

  if (!isAuthorized) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const { token, event, nomSignataire } = parsed.data
  await sendOwnerNotification(token, event as NotifyEvent, nomSignataire)
  return NextResponse.json({ success: true })
}
