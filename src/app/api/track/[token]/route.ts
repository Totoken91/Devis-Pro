import { createAdminClient } from '@/lib/supabase/admin'
import { sendOwnerNotification } from '@/lib/notify'
import { NextRequest, NextResponse } from 'next/server'

// GIF transparent 1x1px
const TRANSPARENT_GIF = Buffer.from(
  'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
  'base64'
)

const TOKEN_RE = /^[a-f0-9]{12,32}$/

export async function GET(
  _req: NextRequest,
  { params }: { params: { token: string } }
) {
  if (!TOKEN_RE.test(params.token)) {
    return new NextResponse(TRANSPARENT_GIF, {
      headers: { 'Content-Type': 'image/gif', 'Cache-Control': 'no-store' },
    })
  }

  const admin = createAdminClient()

  const { data: devis } = await admin
    .from('devis')
    .select('id, statut')
    .eq('token_public', params.token)
    .single()

  // Déclencher "ouvert" uniquement si le devis est encore en statut "envoye"
  if (devis?.statut === 'envoye') {
    await admin
      .from('devis')
      .update({ statut: 'ouvert', ouvert_le: new Date().toISOString() })
      .eq('id', devis.id)

    sendOwnerNotification(params.token, 'ouvert').catch(() => {})
  }

  return new NextResponse(TRANSPARENT_GIF, {
    headers: {
      'Content-Type': 'image/gif',
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'Pragma': 'no-cache',
    },
  })
}
