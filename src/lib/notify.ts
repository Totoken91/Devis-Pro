import { Resend } from 'resend'
import { createAdminClient } from '@/lib/supabase/admin'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

export type NotifyEvent = 'ouvert' | 'accepte' | 'refuse'

const EVENT_CONFIG: Record<NotifyEvent, { subject: (n: string, t: string) => string; headerBg: string; badge: string; message: string }> = {
  ouvert: {
    subject: (n) => `${n} a consulté votre devis`,
    headerBg: '#7C3AED',
    badge: 'Devis consulté',
    message: 'vient de consulter votre devis pour la première fois.',
  },
  accepte: {
    subject: (n, t) => `✅ Devis accepté — ${t}`,
    headerBg: '#059669',
    badge: 'Devis accepté',
    message: "a <strong>accepté</strong> votre devis et l'a signé électroniquement.",
  },
  refuse: {
    subject: (n, t) => `❌ Devis refusé — ${t}`,
    headerBg: '#DC2626',
    badge: 'Devis refusé',
    message: 'a <strong>refusé</strong> votre devis.',
  },
}

export async function sendOwnerNotification(
  token: string,
  event: NotifyEvent,
  nomSignataire?: string
): Promise<void> {
  if (!resend) {
    console.warn('[notify-owner] RESEND_API_KEY non configurée, notification ignorée.')
    return
  }

  const admin = createAdminClient()

  const { data: devisRaw } = await admin
    .from('devis')
    .select('numero, titre, montant_ttc, user_id, clients(name, company)')
    .eq('token_public', token)
    .single()

  if (!devisRaw) {
    console.error('[notify-owner] Devis introuvable pour token:', token)
    return
  }

  const devisRow = devisRaw as {
    numero: string
    titre: string
    montant_ttc: number
    user_id: string
    clients: { name: string; company: string | null } | null
  }

  const { data: profile } = await admin
    .from('profiles')
    .select('email, full_name, company_name')
    .eq('id', devisRow.user_id)
    .single()

  if (!profile?.email) {
    console.error('[notify-owner] Profil freelancer introuvable')
    return
  }

  const clientName = devisRow.clients?.company || devisRow.clients?.name || 'Votre client'
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
          <tr>
            <td style="background:${config.headerBg};padding:28px 40px;">
              <p style="margin:0;color:rgba(255,255,255,0.7);font-size:12px;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">${config.badge}</p>
              <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;">${devisRow.numero}</h1>
              <p style="margin:6px 0 0;color:rgba(255,255,255,0.85);font-size:15px;">${devisRow.titre}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 40px;">
              <p style="margin:0 0 20px;color:#374151;font-size:15px;">
                Bonjour <strong>${profile.company_name || profile.full_name || 'vous'}</strong>,
              </p>
              <p style="margin:0 0 24px;color:#6b7280;font-size:14px;line-height:1.7;">
                <strong>${clientName}</strong> ${config.message}
              </p>
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
    from: 'Deviso <notifications@deviso.app>',
    to: profile.email,
    subject: config.subject(clientName, devisRow.titre),
    html,
  })

  if (error) {
    console.error('[notify-owner] Erreur Resend:', error)
  }
}
