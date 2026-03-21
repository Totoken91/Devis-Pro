import { ImageResponse } from 'next/og'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          borderRadius: 40,
          background: '#111318',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span
          style={{
            fontFamily: 'sans-serif',
            fontWeight: 800,
            fontSize: 110,
            color: '#6CC531',
            lineHeight: 1,
            letterSpacing: '-4px',
          }}
        >
          D
        </span>
      </div>
    ),
    { ...size }
  )
}
