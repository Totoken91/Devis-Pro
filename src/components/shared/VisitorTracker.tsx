'use client'

import { useEffect } from 'react'

function getOrCreateVisitorId(): string {
  const key = 'deviso_vid'
  let id = localStorage.getItem(key)
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem(key, id)
  }
  return id
}

export function VisitorTracker() {
  useEffect(() => {
    const visitorId = getOrCreateVisitorId()
    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ visitorId }),
    }).catch(() => {/* silencieux */})
  }, [])

  return null
}
