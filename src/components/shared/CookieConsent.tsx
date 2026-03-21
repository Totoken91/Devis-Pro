'use client'

import Script from 'next/script'
import { useEffect } from 'react'

const PIXEL_ID          = process.env.NEXT_PUBLIC_META_PIXEL_ID    ?? '2574873622968634'
const AXEPTIO_CLIENT_ID = process.env.NEXT_PUBLIC_AXEPTIO_CLIENT_ID ?? ''
// Doit correspondre au nom de version configuré dans le dashboard Axeptio
const AXEPTIO_COOKIES_VERSION = process.env.NEXT_PUBLIC_AXEPTIO_COOKIES_VERSION ?? 'deviso-fr'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyWindow = Window & Record<string, any>

function loadMetaPixel() {
  const win = window as AnyWindow
  if (win.fbq) return

  win.fbq = function (...args: unknown[]) {
    win.fbq.callMethod
      ? win.fbq.callMethod.apply(win.fbq, args)
      : win.fbq.queue.push(args)
  }
  if (!win._fbq) win._fbq = win.fbq
  win.fbq.push    = win.fbq
  win.fbq.loaded  = true
  win.fbq.version = '2.0'
  win.fbq.queue   = []

  const script    = document.createElement('script')
  script.async    = true
  script.src      = 'https://connect.facebook.net/en_US/fbevents.js'
  document.head.appendChild(script)

  win.fbq('init', PIXEL_ID)
  win.fbq('track', 'PageView')
}

/**
 * Charge Axeptio et n'initialise le Meta Pixel que si l'utilisateur
 * accepte le cookie "meta_pixel" (nom à configurer dans le dashboard Axeptio).
 */
export function CookieConsent() {
  useEffect(() => {
    const win = window as AnyWindow
    win._axcb = win._axcb || []
    win._axcb.push((axeptio: { on: (event: string, cb: (choices: Record<string, boolean>) => void) => void }) => {
      axeptio.on('cookies:complete', (choices) => {
        // "meta_pixel" doit correspondre au nom du vendor dans Axeptio
        if (choices.meta_pixel) {
          loadMetaPixel()
        }
      })
    })
  }, [])

  if (!AXEPTIO_CLIENT_ID) return null

  return (
    <Script id="axeptio-sdk" strategy="afterInteractive">
      {`
        window.axeptioSettings = {
          clientId: "${AXEPTIO_CLIENT_ID}",
          cookiesVersion: "${AXEPTIO_COOKIES_VERSION}",
        };
        (function(d, s) {
          var t = d.getElementsByTagName(s)[0], e = d.createElement(s);
          e.async = true;
          e.src = "//static.axept.io/sdk-slim.js";
          t.parentNode.insertBefore(e, t);
        })(document, "script");
      `}
    </Script>
  )
}
