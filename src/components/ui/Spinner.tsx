'use client'

import { useEffect, useRef } from 'react'

export function Spinner({ size = 15 }: { size?: number }) {
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (!ref.current) return
    ref.current.animate(
      [{ transform: 'rotate(0deg)' }, { transform: 'rotate(360deg)' }],
      { duration: 700, iterations: Infinity, easing: 'linear' }
    )
  }, [])

  return (
    <span
      ref={ref}
      aria-hidden="true"
      style={{
        display: 'inline-block',
        width: size,
        height: size,
        borderRadius: '50%',
        border: '2.5px solid',
        borderColor: 'currentColor',
        borderTopColor: 'transparent',
        flexShrink: 0,
      }}
    />
  )
}
