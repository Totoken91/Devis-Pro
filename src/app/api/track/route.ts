import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

const PROD_URL = process.env.NEXT_PUBLIC_APP_URL ?? ''

export async function POST(req: NextRequest) {
  try {
    // Ignore les appels depuis les URLs de preview Vercel
    const origin = req.headers.get('origin') ?? ''
    if (PROD_URL && origin && !origin.startsWith(PROD_URL)) {
      return NextResponse.json({ ok: true })
    }

    const { visitorId } = await req.json()
    if (!visitorId || typeof visitorId !== 'string') {
      return NextResponse.json({ error: 'invalid' }, { status: 400 })
    }

    const admin = createAdminClient()
    await admin.from('visitors').upsert(
      { visitor_id: visitorId, last_seen: new Date().toISOString() },
      { onConflict: 'visitor_id', ignoreDuplicates: false }
    )

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'server error' }, { status: 500 })
  }
}
