import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  try {
    // Sur Vercel, ne tracker qu'en production (pas sur les previews/branches)
    if (process.env.VERCEL_ENV && process.env.VERCEL_ENV !== 'production') {
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
