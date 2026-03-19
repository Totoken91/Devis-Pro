import type { Metadata } from 'next'
import { Sora, DM_Sans } from 'next/font/google'
import './globals.css'

const sora = Sora({
  subsets: ['latin'],
  variable: '--font-sora',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
})

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
    <html lang="fr" className={`${sora.variable} ${dmSans.variable}`}>
      <body>{children}</body>
    </html>
  )
}
