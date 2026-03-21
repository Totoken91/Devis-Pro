import { ImageResponse } from 'next/og'

export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
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
            fontSize: 20,
            color: '#6CC531',
            lineHeight: 1,
            letterSpacing: '-1px',
          }}
        >
          D
        </span>
      </div>
    ),
    { ...size }
  )
}
