'use client'

import Script from 'next/script'
import { useEffect } from 'react'

const PIXEL_ID        = process.env.NEXT_PUBLIC_META_PIXEL_ID    ?? '2574873622968634'
const COOKIE_SCRIPT_ID = process.env.NEXT_PUBLIC_COOKIE_SCRIPT_ID ?? ''

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

  const script   = document.createElement('script')
  script.async   = true
  script.src     = 'https://connect.facebook.net/en_US/fbevents.js'
  document.head.appendChild(script)

  win.fbq('init', PIXEL_ID)
  win.fbq('track', 'PageView')
}

/** Vérifie si le consentement "targeting" a déjà été donné (visites suivantes) */
function hasTargetingConsent(): boolean {
  const win = window as AnyWindow
  if (!win.CookieScript?.instance) return false
  const state = win.CookieScript.instance.currentState()
  return (
    state.action === 'accept' &&
    Array.isArray(state.categories) &&
    (state.categories as string[]).includes('targeting')
  )
}

/**
 * Charge Cookie Script et n'initialise le Meta Pixel que si l'utilisateur
 * accepte la catégorie "targeting" (publicité / analytics tiers).
 */
export function CookieConsent() {
  useEffect(() => {
    // Consentement déjà donné lors d'une visite précédente
    if (hasTargetingConsent()) {
      loadMetaPixel()
      return
    }

    // L'utilisateur vient d'accepter certaines catégories
    const onAccept = (e: Event) => {
      const detail = (e as CustomEvent<{ categories: string[] }>).detail
      if (detail?.categories?.includes('targeting')) {
        loadMetaPixel()
      }
    }

    // L'utilisateur a tout accepté
    const onAcceptAll = () => loadMetaPixel()

    window.addEventListener('CookieScriptAccept',    onAccept)
    window.addEventListener('CookieScriptAcceptAll', onAcceptAll)

    return () => {
      window.removeEventListener('CookieScriptAccept',    onAccept)
      window.removeEventListener('CookieScriptAcceptAll', onAcceptAll)
    }
  }, [])

  if (!COOKIE_SCRIPT_ID) return null

  return (
    <Script
      id="cookie-script"
      src={`https://cdn.cookie-script.com/s/${COOKIE_SCRIPT_ID}.js`}
      strategy="afterInteractive"
    />
  )
}
