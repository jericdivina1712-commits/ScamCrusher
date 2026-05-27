import { useEffect, useState } from 'react'

type Entry = {
  owner: string
  total: number
  rarity?: string
}

type Props = {
  top3: Entry[]
}

const sa = (a: string) => (a ? a.slice(0, 6) + '...' + a.slice(-4) : '—')
const initials = (a: string) => (a ? a.slice(-3).toUpperCase() : '???')

function useWindowWidth() {
  const [width, setWidth] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth : 1024
  )
  useEffect(() => {
    const handler = () => setWidth(window.innerWidth)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])
  return width
}

// Scale everything off a single "unit" derived from screen width
function getScale(width: number) {
  if (width >= 1280) return 1.0
  if (width >= 1024) return 0.95
  if (width >= 768)  return 0.88
  if (width >= 480)  return 0.82
  return 0.68
}

const BASE = {
  1: { avatarOuter: 96, avatarInner: 82, fontSize: 22, countSize: 30, pedestalH: 80, pedestalW: 140, cardPad: 20 },
  2: { avatarOuter: 76, avatarInner: 64, fontSize: 17, countSize: 24, pedestalH: 58, pedestalW: 116, cardPad: 14 },
  3: { avatarOuter: 66, avatarInner: 54, fontSize: 14, countSize: 20, pedestalH: 42, pedestalW: 100, cardPad: 14 },
} as const

const RANK_COLOR = {
  1: { color: '#f5c842', bg: 'rgba(245,200,66,0.10)', pedBg: 'rgba(245,200,66,0.06)', pedBorder: 'rgba(245,200,66,0.22)', badgeText: '#1a1000' },
  2: { color: '#a8b8cc', bg: 'rgba(168,184,204,0.10)', pedBg: 'rgba(168,184,204,0.06)', pedBorder: 'rgba(168,184,204,0.18)', badgeText: '#0d1a28' },
  3: { color: '#e07c3a', bg: 'rgba(224,124,58,0.10)',  pedBg: 'rgba(224,124,58,0.06)',  pedBorder: 'rgba(224,124,58,0.18)',  badgeText: '#1a0800' },
} as const

const RARITY_STYLE: Record<string, { bg: string; color: string }> = {
  COMMON: { bg: 'rgba(239,68,68,0.12)',   color: '#ef4444' },
  RARE:   { bg: 'rgba(74,158,255,0.14)',  color: '#4a9eff' },
  EPIC:   { bg: 'rgba(168,85,247,0.14)',  color: '#a855f7' },
  LEGEND: { bg: 'rgba(245,200,66,0.14)',  color: '#f5c842' },
}

const font = "'DM Sans', system-ui, sans-serif"

function PodiumCard({ entry, rank, scale }: { entry: Entry; rank: 1 | 2 | 3; scale: number }) {
  const b = BASE[rank]
  const c = RANK_COLOR[rank]
  const rarity = (entry.rarity ?? 'COMMON').toUpperCase()
  const rs = RARITY_STYLE[rarity] ?? RARITY_STYLE.COMMON

  const ao = Math.round(b.avatarOuter * scale)
  const ai = Math.round(b.avatarInner * scale)
  const ph = Math.round(b.pedestalH * scale)
  const pw = Math.round(b.pedestalW * scale)
  const cp = Math.round(b.cardPad * scale)
  const cs = Math.round(b.countSize * scale)
  const fs = Math.round(b.fontSize * scale)

  const isFirst = rank === 1

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      ...(isFirst ? {
        background: 'linear-gradient(180deg, rgba(245,200,66,0.07) 0%, transparent 55%)',
        borderRadius: '18px 18px 0 0',
        padding: `${cp + 4}px ${cp}px 0`,
        border: '1px solid rgba(245,200,66,0.14)',
        borderBottom: 'none',
      } : {
        padding: `${cp}px ${cp}px 0`,
      }),
    }}>

      {isFirst && (
        <span style={{ fontSize: Math.round(24 * scale), marginBottom: Math.round(6 * scale) }}>👑</span>
      )}

      {/* Avatar ring */}
      <div style={{
        width: ao, height: ao, borderRadius: '50%',
        background: c.bg, border: `2px solid ${c.color}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative', flexShrink: 0,
      }}>
        {/* Rank badge */}
        <div style={{
          position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)',
          width: Math.round(24 * scale), height: Math.round(24 * scale), borderRadius: '50%',
          background: c.color,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: Math.round(10 * scale), fontWeight: 800,
          color: c.badgeText, zIndex: 2, fontFamily: font,
        }}>
          {rank}
        </div>

        {/* Inner avatar */}
        <div style={{
          width: ai, height: ai, borderRadius: '50%',
          background: '#141f33',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: fs, fontWeight: 700, color: c.color, letterSpacing: 1,
          fontFamily: font,
        }}>
          {initials(entry.owner)}
        </div>
      </div>

      {/* Info block */}
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        padding: `${Math.round(10 * scale)}px ${Math.round(6 * scale)}px 0`,
        gap: Math.round(3 * scale),
      }}>
        <span style={{ fontSize: Math.round(10 * scale), color: '#5a7399', letterSpacing: 1, fontFamily: font }}>
          {sa(entry.owner)}
        </span>
        <span style={{
          fontSize: cs, fontWeight: 800, color: c.color,
          letterSpacing: -1, fontFamily: font, lineHeight: 1,
        }}>
          ×{entry.total.toLocaleString()}
        </span>
        <span style={{
          fontSize: Math.round(9 * scale), letterSpacing: 3,
          color: '#5a7399', textTransform: 'uppercase', fontFamily: font,
        }}>
          crushes
        </span>
        <span style={{
          fontSize: Math.round(9 * scale), letterSpacing: 2,
          padding: `${Math.round(3 * scale)}px ${Math.round(10 * scale)}px`,
          borderRadius: 20, fontWeight: 600, marginTop: Math.round(5 * scale),
          textTransform: 'uppercase', fontFamily: font,
          background: rs.bg, color: rs.color,
        }}>
          {rarity}
        </span>
      </div>

      {/* Pedestal */}
      <div style={{
        width: pw, height: ph,
        background: c.pedBg,
        borderRadius: '8px 8px 0 0',
        borderTop: `2px solid ${c.pedBorder}`,
        marginTop: Math.round(14 * scale),
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <span style={{
          fontSize: Math.round(36 * scale), fontWeight: 900,
          color: c.color, opacity: 0.08, fontFamily: font,
        }}>
          {rank}
        </span>
      </div>
    </div>
  )
}

const EMPTY: Entry = { owner: '0x0000000000000000000000000000000000000000', total: 0, rarity: 'COMMON' }

export default function TopThree({ top3 }: Props) {
  const width = useWindowWidth()
  const scale = getScale(width)
  const gap = Math.round(16 * scale)

  const first  = top3[0] ?? EMPTY
  const second = top3[1] ?? EMPTY
  const third  = top3[2] ?? EMPTY

  return (
    <div style={{ padding: `${Math.round(32 * scale)}px 0 0`, marginBottom: Math.round(24 * scale) }}>
      <p style={{
        fontSize: 10, letterSpacing: 6, color: '#4a9eff',
        textAlign: 'center', marginBottom: Math.round(28 * scale),
        textTransform: 'uppercase', fontFamily: font, margin: `0 0 ${Math.round(28 * scale)}px`,
      }}>
        Top Crushers
      </p>

      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-end',
        gap,
      }}>
        <PodiumCard entry={second} rank={2} scale={scale} />
        <PodiumCard entry={first}  rank={1} scale={scale} />
        <PodiumCard entry={third}  rank={3} scale={scale} />
      </div>
    </div>
  )
}