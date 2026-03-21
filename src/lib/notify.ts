import { Resend } from 'resend'
import { createAdminClient } from '@/lib/supabase/admin'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

/** Échappe les caractères dangereux pour injection HTML dans les emails */
function escHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

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
  const admin = createAdminClient()

  const { data: devisRaw } = await admin
    .from('devis')
    .select('id, numero, titre, montant_ttc, user_id, clients(name, company)')
    .eq('token_public', token)
    .single()

  if (!devisRaw) {
    console.error('[notify-owner] Devis introuvable pour token:', token)
    return
  }

  const devisRow = devisRaw as {
    id: string
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

  const clientNameRaw = devisRow.clients?.company || devisRow.clients?.name || 'Votre client'
  const clientName = escHtml(clientNameRaw)

  // ── Notif en base (avec déduplication) ──
  const { data: existing } = await admin
    .from('notifications')
    .select('id')
    .eq('devis_id', devisRow.id)
    .eq('event', event)
    .maybeSingle()

  if (existing) {
    // Notification déjà créée pour cet événement, on skip
    return
  }

  await admin.from('notifications').insert({
    user_id:      devisRow.user_id,
    devis_id:     devisRow.id,
    event,
    devis_numero: devisRow.numero,
    client_name:  clientNameRaw,
  })

  if (!resend) {
    console.warn('[notify-owner] RESEND_API_KEY non configurée, email ignoré.')
    return
  }

  const config = EVENT_CONFIG[event]
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const lienDashboard = `${appUrl}/devis`

  const montantFormate = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(devisRow.montant_ttc)

  const signataireLine = nomSignataire
    ? `<p style="margin:0 0 8px;color:#6b7280;font-size:13px;">Signé par : <strong>${escHtml(nomSignataire)}</strong></p>`
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
                Bonjour <strong>${escHtml(profile.company_name || profile.full_name || 'vous')}</strong>,
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

/* ────────────────────────────────────────────────────────────────
   Confirmation de signature — email envoyé AU CLIENT
──────────────────────────────────────────────────────────────── */

export async function sendClientConfirmation(
  token: string,
  nomSignataire: string
): Promise<void> {
  const admin = createAdminClient()

  const { data: devisRaw } = await admin
    .from('devis')
    .select('numero, titre, montant_ttc, signe_le, user_id, clients(name, company, email)')
    .eq('token_public', token)
    .single()

  if (!devisRaw) {
    console.error('[notify-client] Devis introuvable pour token:', token)
    return
  }

  const devis = devisRaw as {
    numero: string
    titre: string
    montant_ttc: number
    signe_le: string | null
    user_id: string
    clients: { name: string; company: string | null; email: string | null } | null
  }

  const clientEmail = devis.clients?.email
  if (!clientEmail) {
    console.warn('[notify-client] Pas d\'email client, confirmation ignorée.')
    return
  }

  const { data: profile } = await admin
    .from('profiles')
    .select('full_name, company_name, email, brand_color, logo_url')
    .eq('id', devis.user_id)
    .single()

  if (!resend) {
    console.warn('[notify-client] RESEND_API_KEY non configurée, email ignoré.')
    return
  }

  const appUrl       = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const lienDevis    = `${appUrl}/q/${token}`
  const emetteurName = escHtml(profile?.company_name || profile?.full_name || 'Votre prestataire')
  const clientName   = escHtml(devis.clients?.company || devis.clients?.name || 'Client')
  const accentColor  = profile?.brand_color || '#6CC531'
  const signedAt     = devis.signe_le
    ? new Date(devis.signe_le).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
    : new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })

  const montantFormate = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(devis.montant_ttc)

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

          <!-- Accent strip -->
          <tr><td style="background:${accentColor};height:4px;font-size:0;">&nbsp;</td></tr>

          <!-- Header -->
          <tr>
            <td style="padding:36px 40px 28px;">
              <!-- Logo -->
              <table cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                <tr>
                  ${profile?.logo_url
                    ? `<td><img src="${profile.logo_url}" alt="${emetteurName}" height="32" style="display:block;height:32px;width:auto;object-fit:contain;" /></td>`
                    : `<td style="background:${accentColor};border-radius:8px;width:28px;height:28px;text-align:center;vertical-align:middle;">
                      <span style="color:#ffffff;font-weight:700;font-size:14px;line-height:28px;">D</span>
                    </td>
                    <td style="padding-left:8px;font-weight:700;font-size:16px;color:#1a1e17;vertical-align:middle;">${emetteurName}</td>`
                  }
                </tr>
              </table>

              <p style="margin:0 0 4px;color:#9ca3af;font-size:11px;text-transform:uppercase;letter-spacing:1.5px;font-weight:600;">Confirmation de signature</p>
              <h1 style="margin:0 0 4px;color:#111827;font-size:26px;font-weight:700;letter-spacing:-0.5px;">${devis.numero}</h1>
              <p style="margin:0;color:#6b7280;font-size:15px;">${devis.titre}</p>
            </td>
          </tr>

          <!-- Divider -->
          <tr><td style="border-top:1px solid #f3f4f6;"></td></tr>

          <!-- Body -->
          <tr>
            <td style="padding:28px 40px;">
              <p style="margin:0 0 8px;color:#374151;font-size:15px;">
                Bonjour <strong>${clientName}</strong>,
              </p>
              <p style="margin:0 0 28px;color:#6b7280;font-size:14px;line-height:1.7;">
                Votre signature a bien été enregistrée. Voici le récapitulatif de votre engagement.
              </p>

              <!-- Recap box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:14px;margin-bottom:28px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="margin:0 0 4px;color:#9ca3af;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Montant TTC</p>
                    <p style="margin:0 0 16px;color:#111827;font-size:28px;font-weight:700;letter-spacing:-0.5px;">${montantFormate}</p>
                    <p style="margin:0 0 4px;color:#6b7280;font-size:13px;">Signé par : <strong style="color:#374151;">${escHtml(nomSignataire)}</strong></p>
                    <p style="margin:0 0 4px;color:#6b7280;font-size:13px;">Date : <strong style="color:#374151;">${signedAt}</strong></p>
                    <p style="margin:0;color:#6b7280;font-size:13px;">Émetteur : <strong style="color:#374151;">${emetteurName}</strong></p>
                  </td>
                </tr>
              </table>

              <!-- Signature badge -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;margin-bottom:28px;">
                <tr>
                  <td style="padding:14px 20px;">
                    <p style="margin:0;color:#15803d;font-size:13px;font-weight:600;">✅ Devis accepté électroniquement</p>
                    <p style="margin:4px 0 0;color:#166534;font-size:12px;line-height:1.5;">
                      Ce document fait foi d'un accord entre les deux parties. Conservez cet email comme preuve.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- CTA -->
              <table cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                <tr>
                  <td style="background:${accentColor};border-radius:12px;">
                    <a href="${lienDevis}" style="display:inline-block;padding:13px 26px;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;">
                      Consulter le devis →
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:0;color:#d1d5db;font-size:12px;line-height:1.7;">
                Ou copiez ce lien :<br/>
                <a href="${lienDevis}" style="color:${accentColor};word-break:break-all;">${lienDevis}</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px;border-top:1px solid #f3f4f6;background:#fafaf9;">
              <p style="margin:0;color:#d1d5db;font-size:11px;line-height:1.6;">
                Confirmation envoyée par <strong style="color:#9ca3af;">Deviso</strong> pour le compte de
                <a href="mailto:${profile?.email}" style="color:#9ca3af;">${profile?.email}</a>.
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
    from:    'Deviso <notifications@deviso.app>',
    to:      clientEmail,
    replyTo: profile?.email,
    subject: `✅ Devis ${devis.numero} signé — ${devis.titre}`,
    html,
  })

  if (error) {
    console.error('[notify-client] Erreur Resend:', error)
  }
}

/* ────────────────────────────────────────────────────────────────
   Relance automatique — email envoyé AU CLIENT
──────────────────────────────────────────────────────────────── */

/* ────────────────────────────────────────────────────────────────
   Bienvenue Pro — email envoyé à l'utilisateur après achat
──────────────────────────────────────────────────────────────── */

export async function sendProWelcomeEmail(email: string, name?: string | null): Promise<void> {
  if (!resend) {
    console.warn('[pro-welcome] RESEND_API_KEY non configurée, email ignoré.')
    return
  }

  const appUrl      = process.env.NEXT_PUBLIC_APP_URL ?? 'https://deviso.app'
  const billingUrl  = `${appUrl}/parametres/facturation`
  const displayName = escHtml(name || 'vous')

  const html = `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
<body style="margin:0;padding:0;background:#F3F4F1;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F3F4F1;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="580" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #e8ece7;">
          <tr><td style="background:#111827;height:4px;font-size:0;">&nbsp;</td></tr>
          <tr>
            <td style="padding:36px 40px 28px;">
              <table cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                <tr>
                  <td style="background:#111827;border-radius:8px;width:28px;height:28px;text-align:center;vertical-align:middle;">
                    <span style="color:#ffffff;font-weight:700;font-size:14px;line-height:28px;">D</span>
                  </td>
                  <td style="padding-left:8px;font-weight:700;font-size:16px;color:#1a1e17;vertical-align:middle;">Deviso</td>
                </tr>
              </table>
              <p style="margin:0 0 4px;color:#059669;font-size:11px;text-transform:uppercase;letter-spacing:1.5px;font-weight:600;">Abonnement activé</p>
              <h1 style="margin:0 0 4px;color:#111827;font-size:26px;font-weight:700;letter-spacing:-0.5px;">Bienvenue dans Deviso Pro 🎉</h1>
            </td>
          </tr>
          <tr><td style="border-top:1px solid #f3f4f6;"></td></tr>
          <tr>
            <td style="padding:28px 40px;">
              <p style="margin:0 0 16px;color:#374151;font-size:15px;">
                Bonjour <strong>${displayName}</strong>,
              </p>
              <p style="margin:0 0 24px;color:#6b7280;font-size:14px;line-height:1.7;">
                Votre abonnement <strong style="color:#111827;">Deviso Pro</strong> est maintenant actif.
                Vous avez accès à toutes les fonctionnalités premium.
              </p>

              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:14px;margin-bottom:28px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="margin:0 0 12px;color:#15803d;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">Inclus dans votre abonnement</p>
                    <p style="margin:0 0 8px;color:#166534;font-size:14px;">✅ Devis illimités</p>
                    <p style="margin:0 0 8px;color:#166534;font-size:14px;">✅ Relances automatiques</p>
                    <p style="margin:0 0 8px;color:#166534;font-size:14px;">✅ Personnalisation de la marque</p>
                    <p style="margin:0;color:#166534;font-size:14px;">✅ Support prioritaire</p>
                  </td>
                </tr>
              </table>

              <table cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                <tr>
                  <td style="background:#111827;border-radius:12px;">
                    <a href="${appUrl}" style="display:inline-block;padding:14px 28px;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;">
                      Accéder à mon espace →
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:0;color:#9ca3af;font-size:12px;line-height:1.7;">
                Gérez votre abonnement depuis
                <a href="${billingUrl}" style="color:#6b7280;">vos paramètres de facturation</a>.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 40px;border-top:1px solid #f3f4f6;background:#fafaf9;">
              <p style="margin:0;color:#d1d5db;font-size:11px;line-height:1.6;">
                Vous recevez cet email car vous venez de souscrire à <strong style="color:#9ca3af;">Deviso Pro</strong>.
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
    from:    'Deviso <notifications@deviso.app>',
    to:      email,
    subject: '🎉 Bienvenue dans Deviso Pro — votre abonnement est actif',
    html,
  })

  if (error) {
    console.error('[pro-welcome] Erreur Resend:', error)
  }
}

type RelanceData = {
  devis: {
    token_public: string
    numero:       string
    titre:        string
    montant_ttc:  number
  }
  client: {
    name:    string
    company: string | null
    email:   string
  }
  profile: {
    full_name:    string | null
    company_name: string | null
    email:        string
    brand_color:  string | null
  }
}

export async function sendRelanceEmail({ devis, client, profile }: RelanceData): Promise<void> {
  if (!resend) {
    console.warn('[relance] RESEND_API_KEY non configurée, email ignoré.')
    return
  }

  const appUrl       = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const lienDevis    = `${appUrl}/q/${devis.token_public}`
  const emetteurName = escHtml(profile.company_name || profile.full_name || 'Votre prestataire')
  const clientName   = escHtml(client.company || client.name)
  const accentColor  = profile.brand_color || '#6CC531'

  const montantFormate = new Intl.NumberFormat('fr-FR', {
    style: 'currency', currency: 'EUR',
  }).format(devis.montant_ttc)

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

          <tr><td style="background:${accentColor};height:4px;font-size:0;">&nbsp;</td></tr>

          <tr>
            <td style="padding:32px 40px 24px;">
              <table cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                <tr>
                  <td style="background:${accentColor};border-radius:8px;width:28px;height:28px;text-align:center;vertical-align:middle;">
                    <span style="color:#ffffff;font-weight:700;font-size:14px;line-height:28px;">D</span>
                  </td>
                  <td style="padding-left:8px;font-weight:700;font-size:16px;color:#1a1e17;vertical-align:middle;">Deviso</td>
                </tr>
              </table>

              <p style="margin:0 0 4px;color:#9ca3af;font-size:11px;text-transform:uppercase;letter-spacing:1.5px;font-weight:600;">Rappel — devis en attente</p>
              <h1 style="margin:0 0 4px;color:#111827;font-size:24px;font-weight:700;letter-spacing:-0.5px;">${devis.numero}</h1>
              <p style="margin:0;color:#6b7280;font-size:15px;">${devis.titre}</p>
            </td>
          </tr>

          <tr><td style="border-top:1px solid #f3f4f6;"></td></tr>

          <tr>
            <td style="padding:28px 40px;">
              <p style="margin:0 0 8px;color:#374151;font-size:15px;">
                Bonjour <strong>${clientName}</strong>,
              </p>
              <p style="margin:0 0 24px;color:#6b7280;font-size:14px;line-height:1.7;">
                Ce message est un rappel amical : <strong style="color:#374151;">${emetteurName}</strong> attend encore votre réponse concernant le devis ci-dessous.
              </p>

              <table width="100%" cellpadding="0" cellspacing="0" style="background:#111827;border-radius:14px;margin-bottom:24px;">
                <tr>
                  <td style="padding:18px 24px;">
                    <p style="margin:0;color:rgba(255,255,255,0.5);font-size:11px;text-transform:uppercase;letter-spacing:1px;">Montant TTC</p>
                    <p style="margin:6px 0 0;color:#ffffff;font-size:28px;font-weight:700;letter-spacing:-0.5px;">${montantFormate}</p>
                  </td>
                </tr>
              </table>

              <table cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
                <tr>
                  <td style="background:${accentColor};border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.15);">
                    <a href="${lienDevis}" style="display:inline-block;padding:13px 26px;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;">
                      Voir & répondre au devis →
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:0;color:#d1d5db;font-size:12px;line-height:1.7;">
                Ou copiez ce lien :<br/>
                <a href="${lienDevis}" style="color:${accentColor};word-break:break-all;">${lienDevis}</a>
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding:16px 40px;border-top:1px solid #f3f4f6;background:#fafaf9;">
              <p style="margin:0;color:#d1d5db;font-size:11px;line-height:1.6;">
                Rappel envoyé par <strong style="color:#9ca3af;">Deviso</strong> pour le compte de
                <a href="mailto:${profile.email}" style="color:#9ca3af;">${profile.email}</a>.
                Si vous ne souhaitez plus recevoir ces rappels, contactez directement l&apos;émetteur.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`

  await resend.emails.send({
    from:    'Deviso <notifications@deviso.app>',
    to:      client.email,
    replyTo: profile.email,
    subject: `⏰ Rappel — ${devis.numero} attend votre réponse`,
    html,
  })
}
