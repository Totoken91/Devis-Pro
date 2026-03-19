import { sendOwnerNotification, type NotifyEvent } from '@/lib/notify'
import { NextRequest, NextResponse } from 'next/server'

interface NotifyOwnerPayload {
  token: string
  event: NotifyEvent
  nomSignataire?: string
}

export async function POST(req: NextRequest) {
  const body: NotifyOwnerPayload = await req.json()
  const { token, event, nomSignataire } = body

  if (!token || !event || !['ouvert', 'accepte', 'refuse'].includes(event)) {
    return NextResponse.json({ error: 'Paramètres invalides' }, { status: 400 })
  }

  await sendOwnerNotification(token, event, nomSignataire)
  return NextResponse.json({ success: true })
}
