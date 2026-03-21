import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'

const MAX_SIZE = 2 * 1024 * 1024 // 2 Mo
const ALLOWED_EXTENSIONS = new Set(['png', 'jpg', 'jpeg', 'webp', 'gif'])
const ALLOWED_MIME = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/gif'])

export async function POST(req: NextRequest) {
  // Auth check
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) {
    return NextResponse.json({ error: 'Fichier manquant' }, { status: 400 })
  }

  // Validation MIME type (whitelist — pas de SVG pour éviter les XSS)
  if (!ALLOWED_MIME.has(file.type)) {
    return NextResponse.json({ error: 'Format autorisé : PNG, JPG, WebP, GIF' }, { status: 400 })
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "L'image ne doit pas dépasser 2 Mo" }, { status: 400 })
  }

  // Whitelist extension
  const ext = (file.name.split('.').pop() ?? '').toLowerCase()
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    return NextResponse.json({ error: 'Extension non autorisée' }, { status: 400 })
  }

  const path = `${user.id}/logo.${ext}`
  const buffer = Buffer.from(await file.arrayBuffer())

  const admin = createAdminClient()

  const { error: uploadError } = await admin.storage
    .from('logos')
    .upload(path, buffer, { upsert: true, contentType: file.type })

  if (uploadError) {
    console.error('[upload-logo]', uploadError.message)
    return NextResponse.json({ error: "Erreur lors de l'upload" }, { status: 500 })
  }

  const { data: { publicUrl } } = admin.storage.from('logos').getPublicUrl(path)

  return NextResponse.json({ publicUrl })
}
