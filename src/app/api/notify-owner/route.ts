import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

export type NotifyEvent = 'ouvert' | 'accepte' | 'refuse'

interface NotifyOwnerPayload {
  token: string
  event: NotifyEvent
  nomSignataire?: string
}

const EVENT_CONFIG: Record<NotifyEvent, { subject: (n: string, t: string) => string; headerBg: string; badge: string; badgeBg: string; message: string }> = {
  ouvert: {
    subject: (n, _t) => `${n} a consulté votre devis`,
    headerBg: '#7C3AED',
    badge: 'Devis consulté',
    badgeBg: '#EDE9FE',
    message: 'vient de consulter votre devis pour la première fois.',
  },
  accepte: {
    subject: (n, t) => `✅ Devis accepté — ${t}`,
    headerBg: '#059669',
    badge: 'Devis accepté',
    badgeBg: '#D1FAE5',
    message: 'a <strong>accepté</strong> votre devis et l\'a signé électroniquement.',
  },
  refuse: {
    subject: (n, t) => `❌ Devis refusé — ${t}`,
    headerBg: '#DC2626',
    badge: 'Devis refusé',
    badgeBg: '#FEE2E2',
    message: 'a <strong>refusé</strong> votre devis.',
  },
}

export async function POST(req: NextRequest) {
  if (!resend) {
    console.warn('[notify-owner] RESEND_API_KEY non configurée, notification ignorée.')
    return NextResponse.json({ success: true, skipped: true })
  }

  const body: NotifyOwnerPayload = await req.json()
  const { token, event, nomSignataire } = body

  if (!token || !event || !EVENT_CONFIG[event]) {
    return NextResponse.json({ error: 'Paramètres invalides' }, { status: 400 })
  }

  const admin = createAdminClient()

  // Récupérer le devis + client + profil du freelancer
  const { data: devisRow } = await admin
    .from('devis')
    .select('numero, titre, montant_ttc, user_id, clients(name, company)')
    .eq('token_public', token)
    .single()

  if (!devisRow) {
    return NextResponse.json({ error: 'Devis introuvable' }, { status: 404 })
  }

  const { data: profile } = await admin
    .from('profiles')
    .select('email, full_name, company_name')
    .eq('id', devisRow.user_id)
    .single()

  if (!profile?.email) {
    return NextResponse.json({ error: 'Profil freelancer introuvable' }, { status: 404 })
  }

  const row = devisRow as typeof devisRow & { clients: { name: string; company: string | null } | null }
  const clientName = row.clients?.company || row.clients?.name || 'Votre client'
  const config = EVENT_CONFIG[event]
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const lienDashboard = `${appUrl}/devis`

  const montantFormate = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(devisRow.montant_ttc)

  const signataireLine = nomSignataire
    ? `<p style="margin:0 0 8px;color:#6b7280;font-size:13px;">Signé par : <strong>${nomSignataire}</strong></p>`
    : ''

  const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background:#f5f7fa;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f7fa;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:${config.headerBg};padding:28px 40px;">
              <p style="margin:0;color:rgba(255,255,255,0.7);font-size:12px;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">${config.badge}</p>
              <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;">${devisRow.numero}</h1>
              <p style="margin:6px 0 0;color:rgba(255,255,255,0.85);font-size:15px;">${devisRow.titre}</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px 40px;">
              <p style="margin:0 0 20px;color:#374151;font-size:15px;">
                Bonjour <strong>${profile.company_name || profile.full_name || 'vous'}</strong>,
              </p>
              <p style="margin:0 0 24px;color:#6b7280;font-size:14px;line-height:1.7;">
                <strong>${clientName}</strong> ${config.message}
              </p>

              <!-- Infos devis -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;margin-bottom:28px;">
                <tr>
                  <td style="padding:18px 24px;">
                    <p style="margin:0 0 6px;color:#9ca3af;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;">Montant TTC</p>
                    <p style="margin:0 0 12px;color:#111827;font-size:24px;font-weight:700;">${montantFormate}</p>
                    ${signataireLine}
                    <p style="margin:0;color:#6b7280;font-size:13px;">Client : <strong>${clientName}</strong></p>
                  </td>
                </tr>
              </table>

              <!-- CTA -->
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:#1E3A5F;border-radius:12px;">
                    <a href="${lienDashboard}" style="display:inline-block;padding:13px 26px;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;">
                      Voir mes devis →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:16px 40px;border-top:1px solid #f3f4f6;">
              <p style="margin:0;color:#d1d5db;font-size:11px;">
                Notification automatique de <strong style="color:#1E3A5F;">Deviso</strong>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`

  const { error } = await resend.emails.send({
    from: 'Deviso <notifications@deviso.fr>',
    to: profile.email,
    subject: config.subject(clientName, devisRow.titre),
    html,
  })

  if (error) {
    console.error('[notify-owner] Erreur Resend:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
