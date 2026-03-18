import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'Deviso — Devis professionnels pour freelances',
    template: '%s | Deviso',
  },
  description:
    'Créez, envoyez et faites signer vos devis professionnels en quelques minutes. Suivi d\'ouverture, relances automatiques et signature électronique.',
  keywords: ['devis', 'freelance', 'facturation', 'micro-entrepreneur', 'signature électronique'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  )
}
