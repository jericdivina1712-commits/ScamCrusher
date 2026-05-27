import { useState, useEffect } from 'react'
import CrushModal from './CrushModal'

type Entry = {
  owner: string
  total: number
  rarity?: string
}

type Props = {
  leaderboard: Entry[]
  myAddr: string
}

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

const sa = (a: string) => (a ? a.slice(0, 6) + '...' + a.slice(-4) : '')

const rankColor = (r: number) =>
  r === 1 ? '#f5c842' : r === 2 ? '#a8b8cc' : r === 3 ? '#e07c3a' : '#5a7399'

const RARITY_STYLE: Record<string, { bg: string; color: string }> = {
  COMMON: { bg: 'rgba(239,68,68,0.10)',   color: '#ef4444' },
  RARE:   { bg: 'rgba(74,158,255,0.12)',  color: '#4a9eff' },
  EPIC:   { bg: 'rgba(168,85,247,0.12)', color: '#a855f7' },
  LEGEND: { bg: 'rgba(245,200,66,0.12)', color: '#f5c842' },
}

const font = "'DM Sans', system-ui, sans-serif"

export default function LeaderTable({ leaderboard, myAddr }: Props) {
  const [modalOwner, setModalOwner] = useState<string | null>(null)
  const width = useWindowWidth()

  const isWide = width >= 768

  const grid = isWide
    ? '52px 1fr 100px 100px 70px'
    : '36px 1fr 80px 80px'

  const myIndex = leaderboard.findIndex(e => e.owner === myAddr)
  const inTable = myIndex >= 0

  const col: React.CSSProperties = {
    fontSize: 9, letterSpacing: 3, color: '#5a7399',
    fontWeight: 600, textTransform: 'uppercase', fontFamily: font,
  }

  function RarityPill({ rarity }: { rarity: string }) {
    const rs = RARITY_STYLE[rarity] ?? RARITY_STYLE.COMMON
    return (
      <span style={{
        fontSize: 9, letterSpacing: 2, padding: '3px 10px', borderRadius: 20,
        fontWeight: 600, fontFamily: font, textTransform: 'uppercase',
        ...rs,
      }}>
        {rarity}
      </span>
    )
  }

  return (
    <>
      <div style={{
        borderRadius: 14, overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.06)',
        background: '#0f1829',
      }}>

        {/* Column headers */}
        <div style={{
          display: 'grid', gridTemplateColumns: grid,
          padding: '10px 16px', alignItems: 'center',
          background: '#141f33',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}>
          <span style={col}>Rank</span>
          <span style={col}>Wallet</span>
          <span style={{ ...col, textAlign: 'right' }}>Crushes</span>
          <span style={{ ...col, textAlign: 'right' }}>Rarity</span>
          {isWide && <span style={col} />}
        </div>

        {/* Pinned unranked "You" row */}
        {!inTable && myAddr && (
          <div style={{
            display: 'grid', gridTemplateColumns: grid,
            padding: '12px 16px', alignItems: 'center',
            background: 'rgba(74,158,255,0.04)',
            borderBottom: '2px dashed rgba(74,158,255,0.22)',
            borderLeft: '3px solid #4a9eff',
          }}>
            <span style={{ fontSize: 13, color: '#5a7399', fontFamily: font }}>—</span>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
              <span style={{ fontSize: 12, color: '#e8f0ff', fontFamily: font, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {sa(myAddr)}
              </span>
              <span style={{
                fontSize: 9, background: 'rgba(74,158,255,0.15)', color: '#4a9eff',
                padding: '2px 7px', borderRadius: 10, fontWeight: 600,
                letterSpacing: 1, fontFamily: font, flexShrink: 0,
              }}>You</span>
            </div>

            <span style={{ fontSize: 13, color: '#5a7399', textAlign: 'right', fontFamily: font }}>×0</span>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <RarityPill rarity="COMMON" />
            </div>
            {isWide && <span />}
          </div>
        )}

        {/* All leaderboard rows */}
        {leaderboard.map((e, i) => {
          const rank   = i + 1
          const isMe   = e.owner === myAddr
          const rarity = (e.rarity ?? 'COMMON').toUpperCase()
          const rc     = rankColor(rank)

          return (
            <div
              key={e.owner}
              onClick={!isWide ? () => setModalOwner(e.owner) : undefined}
              style={{
                display: 'grid', gridTemplateColumns: grid,
                padding: '12px 16px', alignItems: 'center',
                background: isMe ? 'rgba(74,158,255,0.06)' : 'transparent',
                borderLeft: isMe ? '3px solid #4a9eff' : '3px solid transparent',
                borderBottom: i === leaderboard.length - 1 ? 'none' : '1px solid rgba(255,255,255,0.05)',
                transition: 'background 0.15s',
                cursor: !isWide ? 'pointer' : 'default',
              }}
            >
              {/* Rank */}
              <span style={{ fontSize: 13, fontWeight: 700, color: rc, fontFamily: font }}>
                #{rank}
              </span>

              {/* Wallet */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
                <span style={{
                  fontSize: 12, color: '#e8f0ff', fontFamily: font,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {sa(e.owner)}
                </span>
                {isMe && (
                  <span style={{
                    fontSize: 9, background: 'rgba(74,158,255,0.15)', color: '#4a9eff',
                    padding: '2px 7px', borderRadius: 10, fontWeight: 600,
                    letterSpacing: 1, fontFamily: font, flexShrink: 0,
                  }}>You</span>
                )}
              </div>

              {/* Crush count */}
              <span style={{
                fontSize: 14, fontWeight: 700,
                color: isMe ? '#4a9eff' : '#e8f0ff',
                textAlign: 'right', fontFamily: font,
              }}>
                ×{e.total.toLocaleString()}
              </span>

              {/* Rarity pill */}
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <RarityPill rarity={rarity} />
              </div>

              {/* View button — wide screens only */}
              {isWide && (
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => setModalOwner(e.owner)}
                    style={{
                      fontSize: 9, letterSpacing: 2, padding: '4px 10px', borderRadius: 6,
                      background: 'transparent', border: '1px solid rgba(255,255,255,0.12)',
                      color: '#4a9eff', cursor: 'pointer', fontFamily: font, fontWeight: 600,
                      textTransform: 'uppercase',
                    }}
                  >
                    View
                  </button>
                </div>
              )}
            </div>
          )
        })}

        {leaderboard.length === 0 && (
          <p style={{ fontSize: 12, color: '#5a7399', textAlign: 'center', padding: '36px 0', fontFamily: font }}>
            No data yet.
          </p>
        )}

        {/* Footer */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '10px 16px',
          background: '#141f33',
          borderTop: '1px solid rgba(255,255,255,0.06)',
        }}>
          <span style={{ fontSize: 9, letterSpacing: 2, color: '#5a7399', textTransform: 'uppercase', fontFamily: font }}>
            Wallets: {leaderboard.length}
          </span>
          <span style={{ fontSize: 9, letterSpacing: 2, color: '#5a7399', textTransform: 'uppercase', fontFamily: font }}>
            Season 1 · Live
          </span>
        </div>
      </div>

      {modalOwner && (
      <CrushModal
        owner={modalOwner}
        totalCrushes={leaderboard.find(e => e.owner === modalOwner)?.total ?? null}
        onClose={() => setModalOwner(null)}
      />
    )}
    </>
  )
}