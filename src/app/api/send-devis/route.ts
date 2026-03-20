import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

interface SendDevisPayload {
  to: string            // email du client
  clientName: string
  emetteurName: string
  emetteurEmail: string
  numero: string
  titre: string
  montantTTC: number
  token: string
}

export async function POST(req: NextRequest) {
  if (!resend) {
    // Pas de clé Resend configurée — on logue et on retourne succès silencieux
    console.warn('[send-devis] RESEND_API_KEY non configurée, email non envoyé.')
    return NextResponse.json({ success: true, skipped: true })
  }

  const body: SendDevisPayload = await req.json()
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const lienDevis = `${appUrl}/q/${body.token}`

  const montantFormate = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(body.montantTTC)

  const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background:#F3F4F1;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F3F4F1;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="580" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #e8ece7;">

          <!-- Green accent strip -->
          <tr><td style="background:#6CC531;height:4px;font-size:0;">&nbsp;</td></tr>

          <!-- Header -->
          <tr>
            <td style="padding:36px 40px 28px;">
              <!-- Logo -->
              <table cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                <tr>
                  <td style="background:#6CC531;border-radius:8px;width:28px;height:28px;text-align:center;vertical-align:middle;">
                    <span style="color:#ffffff;font-weight:700;font-size:14px;line-height:28px;">D</span>
                  </td>
                  <td style="padding-left:8px;font-weight:700;font-size:16px;color:#1a1e17;vertical-align:middle;">Deviso</td>
                </tr>
              </table>

              <p style="margin:0 0 4px;color:#9ca3af;font-size:11px;text-transform:uppercase;letter-spacing:1.5px;font-weight:600;">Nouveau devis</p>
              <h1 style="margin:0 0 4px;color:#111827;font-size:26px;font-weight:700;letter-spacing:-0.5px;">${body.numero}</h1>
              <p style="margin:0;color:#6b7280;font-size:15px;">${body.titre}</p>
            </td>
          </tr>

          <!-- Divider -->
          <tr><td style="border-top:1px solid #f3f4f6;"></td></tr>

          <!-- Body -->
          <tr>
            <td style="padding:28px 40px;">
              <p style="margin:0 0 8px;color:#374151;font-size:15px;">
                Bonjour <strong>${body.clientName}</strong>,
              </p>
              <p style="margin:0 0 28px;color:#6b7280;font-size:14px;line-height:1.7;">
                <strong style="color:#374151;">${body.emetteurName}</strong> vous a envoyé un devis
                d&apos;un montant de <strong style="color:#111827;">${montantFormate} TTC</strong>.
              </p>

              <!-- Montant box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#111827;border-radius:14px;margin-bottom:28px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="margin:0;color:rgba(255,255,255,0.5);font-size:11px;text-transform:uppercase;letter-spacing:1px;">Montant TTC</p>
                    <p style="margin:6px 0 0;color:#ffffff;font-size:30px;font-weight:700;letter-spacing:-0.5px;">${montantFormate}</p>
                  </td>
                </tr>
              </table>

              <!-- CTA -->
              <table cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                <tr>
                  <td style="background:#6CC531;border-radius:12px;box-shadow:0 2px 8px rgba(108,197,49,0.3);">
                    <a href="${lienDevis}" style="display:inline-block;padding:14px 28px;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;">
                      Voir & signer le devis →
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:0;color:#d1d5db;font-size:12px;line-height:1.7;">
                Ou copiez ce lien dans votre navigateur :<br/>
                <a href="${lienDevis}" style="color:#6CC531;word-break:break-all;">${lienDevis}</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px;border-top:1px solid #f3f4f6;background:#fafaf9;">
              <p style="margin:0;color:#d1d5db;font-size:11px;line-height:1.6;">
                Ce message a été envoyé par <strong style="color:#9ca3af;">Deviso</strong> pour le compte de
                <a href="mailto:${body.emetteurEmail}" style="color:#9ca3af;">${body.emetteurEmail}</a>.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
  <img src="${appUrl}/api/track/${body.token}" width="1" height="1" style="display:none;border:0;" alt="" />
</body>
</html>
`

  const { error } = await resend.emails.send({
    from: 'Deviso <notifications@deviso.app>',
    to: body.to,
    subject: `Devis ${body.numero} — ${body.titre} (${montantFormate})`,
    html,
    replyTo: body.emetteurEmail,
  })

  if (error) {
    console.error('[send-devis] Erreur Resend:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
