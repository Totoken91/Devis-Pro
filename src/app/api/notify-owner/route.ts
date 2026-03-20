import { sendOwnerNotification, type NotifyEvent } from '@/lib/notify'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const notifySchema = z.object({
  token:         z.string().regex(/^[a-f0-9]{12,32}$/),
  event:         z.enum(['ouvert', 'accepte', 'refuse']),
  nomSignataire: z.string().max(200).trim().optional(),
})

export async function POST(req: NextRequest) {
  const raw = await req.json().catch(() => null)
  const parsed = notifySchema.safeParse(raw)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Paramètres invalides' }, { status: 400 })
  }

  const { token, event, nomSignataire } = parsed.data
  await sendOwnerNotification(token, event as NotifyEvent, nomSignataire)
  return NextResponse.json({ success: true })
}
