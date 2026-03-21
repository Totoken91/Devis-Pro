export const dynamic = 'force-dynamic'

import { createAdminClient } from '@/lib/supabase/admin'
import { sendRelanceEmail } from '@/lib/notify'
import { NextRequest, NextResponse } from 'next/server'

// Appelé par Vercel Cron — tous les jours à 9h UTC (voir vercel.json)
// En local, appeler manuellement : curl -H "Authorization: Bearer $CRON_SECRET" http://localhost:3000/api/cron/reminders

export async function GET(req: NextRequest) {
  // ── Auth (obligatoire) ──────────────────────────────────────
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) {
    console.error('[cron/reminders] CRON_SECRET non configuré')
    return NextResponse.json({ error: 'Configuration manquante' }, { status: 500 })
  }
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const admin = createAdminClient()
  const now = new Date()

  let expired  = 0
  let relanced = 0
  const errors: string[] = []

  // ── 1. Expirer les devis dont la date de validité est dépassée ──
  const { data: aExpirer } = await admin
    .from('devis')
    .select('id')
    .in('statut', ['envoye', 'ouvert'])
    .not('date_validite', 'is', null)
    .lt('date_validite', now.toISOString().split('T')[0])

  if (aExpirer && aExpirer.length > 0) {
    const ids = aExpirer.map((d) => d.id)
    const { error } = await admin.from('devis').update({ statut: 'expire' }).in('id', ids)
    if (error) {
      errors.push(`Expiry: ${error.message}`)
    } else {
      expired = ids.length
    }
  }

  // ── 2. Relances — devis en attente avec relance active ──────
  const { data: allDevis, error: queryError } = await admin
    .from('devis')
    .select('id, token_public, numero, titre, montant_ttc, user_id, client_id, derniere_relance, created_at')
    .in('statut', ['envoye', 'ouvert'])
    .eq('relance_active', true)
    .not('client_id', 'is', null)

  if (queryError) {
    errors.push(`Query: ${queryError.message}`)
    return NextResponse.json({ ok: true, expired, relanced, errors })
  }

  // Filtrage temporel en JS
  // - Première relance : pas encore relancé ET créé il y a 3+ jours (J+3)
  // - Deuxième relance : déjà relancé une fois ET dernière relance il y a 4+ jours (= J+7 au total)
  const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString()
  const fourDaysAgo  = new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString()

  const aRelancer = (allDevis ?? []).filter((d) => {
    if (!d.derniere_relance) {
      return new Date(d.created_at) < new Date(threeDaysAgo)
    } else {
      return new Date(d.derniere_relance) < new Date(fourDaysAgo)
    }
  })

  if (aRelancer.length === 0) {
    return NextResponse.json({ ok: true, expired, relanced, errors })
  }

  // Batch-fetch clients et profils
  const clientIds = Array.from(new Set(aRelancer.map((d) => d.client_id as string)))
  const userIds   = Array.from(new Set(aRelancer.map((d) => d.user_id)))

  const [{ data: clients }, { data: profiles }] = await Promise.all([
    admin.from('clients').select('id, name, company, email').in('id', clientIds),
    admin.from('profiles').select('id, full_name, company_name, email, brand_color, plan').in('id', userIds),
  ])

  const clientMap  = Object.fromEntries((clients  ?? []).map((c) => [c.id, c]))
  const profileMap = Object.fromEntries((profiles ?? []).map((p) => [p.id, p]))

  // ── Envoyer les relances ─────────────────────────────────────
  for (const devis of aRelancer) {
    const client  = clientMap[devis.client_id as string]
    const profile = profileMap[devis.user_id]

    if (!client?.email || !profile) {
      errors.push(`Devis ${devis.numero} : client sans email ou profil manquant`)
      continue
    }

    // Relances réservées aux utilisateurs Pro
    if (profile.plan !== 'pro') {
      continue
    }

    const isSecondRelance = !!devis.derniere_relance

    try {
      await sendRelanceEmail({
        devis:   { token_public: devis.token_public, numero: devis.numero, titre: devis.titre, montant_ttc: devis.montant_ttc },
        client:  { name: client.name, company: client.company, email: client.email },
        profile: { full_name: profile.full_name, company_name: profile.company_name, email: profile.email, brand_color: profile.brand_color },
      })

      await admin
        .from('devis')
        .update({
          derniere_relance: now.toISOString(),
          // Après la 2e relance (J+7), on stoppe les relances automatiquement
          ...(isSecondRelance ? { relance_active: false } : {}),
        })
        .eq('id', devis.id)

      relanced++
    } catch (err) {
      errors.push(`Devis ${devis.numero} : ${String(err)}`)
    }
  }

  console.log(`[cron/reminders] expired=${expired} relanced=${relanced} errors=${errors.length}`)
  return NextResponse.json({ ok: true, expired, relanced, errors })
}
