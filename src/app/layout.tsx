import type { Metadata } from 'next'
import { Sora, DM_Sans } from 'next/font/google'
import Script from 'next/script'
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
      <Script id="meta-pixel" strategy="afterInteractive">
        {`!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window,document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init','2574873622968634');
fbq('track','PageView');`}
      </Script>
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: 'none' }}
          src="https://www.facebook.com/tr?id=2574873622968634&ev=PageView&noscript=1"
          alt=""
        />
      </noscript>
    </html>
  )
}
