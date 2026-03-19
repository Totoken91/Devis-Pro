import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { renderToBuffer } from '@react-pdf/renderer'
import { DevisPDF } from '@/lib/devis-pdf'
import React from 'react'
import type { DevisLigne } from '@/types/supabase'

type DevisRow = {
  id: string
  numero: string
  titre: string
  created_at: string
  date_validite: string | null
  statut: string
  lignes: DevisLigne[]
  tva_taux: number
  montant_ht: number
  montant_tva: number
  montant_ttc: number
  notes: string | null
  conditions: string | null
  user_id: string
  profiles: {
    full_name: string | null
    company_name: string | null
    email: string
    phone: string | null
    address: string | null
    siret: string | null
  } | null
  clients: {
    name: string
    company: string | null
    email: string | null
    phone: string | null
    address: string | null
  } | null
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { token: string } }
) {
  const supabase = createClient()

  const { data } = await supabase
    .from('devis')
    .select('*, profiles(full_name, company_name, email, phone, address, siret), clients(name, company, email, phone, address)')
    .eq('token_public', params.token)
    .single()

  if (!data) {
    return new NextResponse('Devis introuvable', { status: 404 })
  }

  const d = data as unknown as DevisRow

  const element = React.createElement(DevisPDF, {
    devis: d,
    emetteur: d.profiles,
    destinataire: d.clients,
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pdfBuffer = await renderToBuffer(element as any)

  return new NextResponse(pdfBuffer as unknown as BodyInit, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${d.numero}.pdf"`,
    },
  })
}
