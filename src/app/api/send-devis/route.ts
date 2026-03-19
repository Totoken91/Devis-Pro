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
<body style="margin:0;padding:0;background:#f5f7fa;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f7fa;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:#1E3A5F;padding:32px 40px;">
              <p style="margin:0;color:rgba(255,255,255,0.6);font-size:12px;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Nouveau devis</p>
              <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:700;">${body.numero}</h1>
              <p style="margin:6px 0 0;color:rgba(255,255,255,0.8);font-size:16px;">${body.titre}</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 40px;">
              <p style="margin:0 0 16px;color:#374151;font-size:15px;">
                Bonjour <strong>${body.clientName}</strong>,
              </p>
              <p style="margin:0 0 24px;color:#6b7280;font-size:14px;line-height:1.6;">
                <strong>${body.emetteurName}</strong> vous a envoyé un devis d'un montant de
                <strong style="color:#1E3A5F;">${montantFormate} TTC</strong>.
              </p>

              <!-- Montant box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f7ff;border:1px solid #dbeafe;border-radius:12px;margin-bottom:28px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="margin:0;color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">Montant TTC</p>
                    <p style="margin:4px 0 0;color:#1E3A5F;font-size:28px;font-weight:700;">${montantFormate}</p>
                  </td>
                </tr>
              </table>

              <!-- CTA -->
              <table cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                <tr>
                  <td style="background:#2E86C1;border-radius:12px;">
                    <a href="${lienDevis}" style="display:inline-block;padding:14px 28px;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;">
                      Voir & signer le devis →
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:0;color:#9ca3af;font-size:12px;line-height:1.6;">
                Ou copiez ce lien dans votre navigateur :<br/>
                <a href="${lienDevis}" style="color:#2E86C1;">${lienDevis}</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px;border-top:1px solid #f3f4f6;">
              <p style="margin:0;color:#d1d5db;font-size:11px;">
                Ce message a été envoyé par <strong style="color:#1E3A5F;">Deviso</strong> pour le compte de ${body.emetteurEmail}.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
  <!-- Pixel de tracking (lecture email) -->
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
