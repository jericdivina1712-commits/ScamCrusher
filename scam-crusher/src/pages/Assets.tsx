type AssetsProps = {
  account: any
  nfts: any[]
  minted: number
  maxSupply: number
  remaining: number
  poolAmount: number
  mintPrice: number
  mintCount: number
  setMintCount: (fn: (c: number) => number) => void
  mint: () => void
  minting: boolean
  siteActive: boolean
  status: string
  getImage: (obj: any) => string | null
}

import { useState } from 'react'

const ff = 'Georgia, serif'

const rarityColor: Record<string, string> = {
  COMMON: '#e74c3c',
  RARE:   '#4a9eff',
  EPIC:   '#b44fff',
  LEGEND: '#ffd700',
}
const rarityGlow: Record<string, string> = {
  COMMON: 'rgba(231,76,60,0.3)',
  RARE:   'rgba(74,158,255,0.3)',
  EPIC:   'rgba(180,79,255,0.3)',
  LEGEND: 'rgba(255,215,0,0.3)',
}

export default function Assets({
  account, nfts, minted, maxSupply, remaining, poolAmount,
  mintPrice, mintCount, setMintCount, mint, minting, siteActive, status, getImage,
}: AssetsProps) {

  const [drawerOpen, setDrawerOpen] = useState(false)
  const isMobile = window.innerWidth < 768

  const supplyPct  = maxSupply > 0 ? Math.round((minted / maxSupply) * 100) : 0
  const totalCost  = (mintCount * mintPrice / 1_000_000_000).toFixed(2)
  const priceEach  = (mintPrice / 1_000_000_000).toFixed(2)
  const soldOut    = remaining === 0
  const disabled   = minting || soldOut || !siteActive

  if (!account) {
    return (
      <div style={{
        paddingTop: 56, minHeight: '100vh',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', gap: 16,
        fontFamily: ff,
      }}>
        <img
          src="/Crusher.jpg"
          alt="Scam Crusher"
          style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: '50%', border: '2px solid #4a9eff', opacity: 0.6 }}
        />
        <p style={{ fontSize: 11, letterSpacing: '0.3em', color: '#4a6fa5', margin: 0 }}>
          CONNECT YOUR WALLET TO JOIN THE CAUSE
        </p>
      </div>
    )
  }

  return (
    <div style={{ fontFamily: ff, color: '#e8f0ff', minHeight: '100vh', display: 'flex', flexDirection: 'column', overflowX: 'hidden', maxWidth: '100vw' }}>

      {/* ── PAGE TITLE ──────────────────────────────────────────────────── */}
      <div style={{
        textAlign: 'center',
        padding: isMobile ? '15px 20px 0' : '52px 40px 0',
        maxWidth: 800,
        margin: '0 auto',
      }}>
        <p style={{
          fontSize: 9, letterSpacing: '0.5em', color: '#2a4a7f',
          margin: '0 0 14px', textTransform: 'uppercase', fontFamily: ff,
        }}>
          Genesis Edition · Sui Blockchain
        </p>
        <h1 style={{
          fontSize: isMobile ? 33 : 44,
          fontWeight: 900, color: '#ffffff',
          margin: '0 0 10px', letterSpacing: '0.04em', lineHeight: 1.1,
        }}>
          MINT YOUR{' '}
          <span style={{ color: '#4a9eff' }}>CRUSHER</span>
          {' '}NOW
        </h1>
        <p style={{
          fontSize: 11, letterSpacing: '0.3em', color: '#4a6fa5',
          margin: 0, fontWeight: 400,
        }}>
          JOIN THE CAUSE — OBLITERATE EVERY SCAM
        </p>
        {/* decorative divider */}
        <div style={{
          display: isMobile ? 'none' : 'flex', alignItems: 'center', gap: 16,
          maxWidth: 400, margin: '18px auto 0',
        }}>
          <div style={{ flex: 1, height: 0.5, background: 'linear-gradient(90deg, transparent, rgba(74,158,255,0.3))' }} />
          <div style={{ width: 6, height: 6, border: '0.5px solid #4a9eff', borderRadius: '50%', opacity: 0.5 }} />
          <div style={{ flex: 1, height: 0.5, background: 'linear-gradient(90deg, rgba(74,158,255,0.3), transparent)' }} />
        </div>
      </div>

      {/* ── HERO: IMAGE + MINT ───────────────────────────────────────────── */}
      <div style={{
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: isMobile ? 24 : 56,
        padding: isMobile ? '24px 15px 32px' : '0 40px',
        maxWidth: 1100,
        margin: '0 auto',
        flex: 1,
        width: '100%',
        boxSizing: 'border-box' as const,
      }}>

        {/* Left — NFT image */}
        <div style={{
          flex: '0 0 auto',
          width: isMobile ? '100%' : 340,
          maxWidth: isMobile ? '100%' : '100%',
          margin: isMobile ? '0 auto' : 0,
          position: 'relative',
        }}>
          <div style={{
            position: 'absolute', inset: -24,
            background: 'radial-gradient(ellipse at center, rgba(74,158,255,0.15) 0%, transparent 68%)',
            borderRadius: '50%',
            pointerEvents: 'none',
          }} />
          <img
            src="/Crusher.jpg"
            alt="Scam Crusher NFT"
            style={{
              width: '100%',
              aspectRatio: '1',
              objectFit: 'cover',
              borderRadius: 20,
              border: '1px solid rgba(74,158,255,0.3)',
              display: 'block',
              position: 'relative',
            }}
          />
          <div style={{
            position: 'absolute', bottom: 14, left: 14,
            background: 'rgba(6,13,30,0.9)',
            border: '0.5px solid rgba(74,158,255,0.35)',
            borderRadius: 8, padding: '6px 14px',
            fontSize: 9, letterSpacing: '0.22em', color: '#7ab3ff',
            backdropFilter: 'blur(8px)',
          }}>
            GENESIS EDITION
          </div>
        </div>

        {/* Right — Info + mint */}
        <div style={{ flex: 1, minWidth: 280, paddingTop: 6 }}>

          {/* Tag */}
          <div style={{
            display: 'inline-block',
            fontSize: 9, letterSpacing: '0.3em',
            color: '#4a9eff',
            background: 'rgba(74,158,255,0.1)',
            border: '0.5px solid rgba(74,158,255,0.3)',
            borderRadius: 20, padding: '4px 12px',
            marginBottom: 14,
          }}>
            SUI BLOCKCHAIN
          </div>

          <h2 style={{
            fontSize: isMobile ? 24 : 36,
            fontWeight: 700,
            margin: '0 0 12px',
            color: '#ffffff',
            lineHeight: 1.15,
            letterSpacing: '0.02em',
          }}>
            Scam Crusher NFT
          </h2>

          <p style={{
            fontSize: isMobile ? 12 : 15,
            lineHeight: 1.8,
            color: '#6a8aaf',
            margin: isMobile ? '0 0 16px' : '0 0 28px',
            maxWidth: 440,
            fontWeight: 300,
          }}>
            The Scam Crusher is on a mission to obliterate every fraudulent NFT project in
            existence. Mint your Crusher, join the cause, and help us expose, shame, and
            destroy the scammers poisoning the blockchain — one crush at a time.
          </p>

          {/* Price row — MOBILE: smaller, DESKTOP: unchanged */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 6 }}>
            <span style={{ fontSize: 10, letterSpacing: '0.3em', color: '#4a6fa5' }}>PRICE</span>
            <span style={{ fontSize: isMobile ? 28 : 42, fontWeight: 700, color: '#ffffff', lineHeight: 1 }}>{priceEach}</span>
            <span style={{ fontSize: isMobile ? 13 : 18, color: '#4a9eff', letterSpacing: '0.1em' }}>SUI</span>
          </div>

          {/* Supply progress */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, letterSpacing: '0.2em', color: '#4a6fa5', marginBottom: 4 }}>
              <span>{minted} / {maxSupply} MINTED</span>
              <span style={{ color: '#7ab3ff' }}>{supplyPct}%</span>
            </div>
            <div style={{ height: 4, background: 'rgba(74,111,165,0.18)', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{
                height: '100%', width: `${supplyPct}%`,
                background: 'linear-gradient(90deg, #0d6e3a, #4a9eff)',
                borderRadius: 4, transition: 'width 0.6s ease',
              }} />
            </div>
          </div>

          {/* Mint counter + button — MOBILE: smaller, DESKTOP: unchanged */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
            <div style={{
              display: 'flex', alignItems: 'center',
              border: '0.5px solid rgba(74,111,165,0.35)',
              borderRadius: 10, overflow: 'hidden',
              background: 'rgba(0,0,0,0.3)',
            }}>
              <button
                onClick={() => setMintCount(c => Math.max(1, c - 1))}
                disabled={minting}
                style={{
                  width: isMobile ? 36 : 48,
                  height: isMobile ? 40 : 52,
                  border: 'none',
                  borderRight: '0.5px solid rgba(74,111,165,0.3)',
                  background: 'transparent',
                  color: mintCount <= 1 ? '#2a4a7f' : '#7ab3ff',
                  fontSize: isMobile ? 18 : 22,
                  cursor: mintCount <= 1 ? 'default' : 'pointer',
                  fontFamily: ff,
                }}
              >−</button>
              <span style={{
                minWidth: isMobile ? 32 : 44,
                textAlign: 'center',
                fontSize: isMobile ? 16 : 20,
                fontWeight: 700, color: '#fff',
                padding: '0 4px',
              }}>{mintCount}</span>
              <button
                onClick={() => setMintCount(c => Math.min(10, c + 1))}
                disabled={minting}
                style={{
                  width: isMobile ? 36 : 48,
                  height: isMobile ? 40 : 52,
                  border: 'none',
                  borderLeft: '0.5px solid rgba(74,111,165,0.3)',
                  background: 'transparent',
                  color: mintCount >= 10 ? '#2a4a7f' : '#7ab3ff',
                  fontSize: isMobile ? 18 : 22,
                  cursor: mintCount >= 10 ? 'default' : 'pointer',
                  fontFamily: ff,
                }}
              >+</button>
            </div>

            <button
              onClick={mint}
              disabled={disabled}
              style={{
                flex: 1,
                height: isMobile ? 40 : 52,
                border: 'none', borderRadius: 10,
                fontSize: isMobile ? 11 : 12,
                letterSpacing: '0.35em',
                fontFamily: ff, fontWeight: 700,
                cursor: disabled ? 'not-allowed' : 'pointer',
                background: disabled
                  ? 'rgba(42,74,127,0.35)'
                  : 'linear-gradient(90deg, #0b6830, #1aaa55)',
                color: disabled ? '#2a4a7f' : '#c8ffe0',
                transition: 'opacity 0.2s, transform 0.1s',
              }}
              onMouseEnter={e => { if (!disabled) { (e.currentTarget as HTMLButtonElement).style.opacity = '0.88'; (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)' } }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '1'; (e.currentTarget as HTMLButtonElement).style.transform = 'none' }}
            >
              {minting ? 'CRUSHING...' : soldOut ? 'SOLD OUT' : `MINT${mintCount > 1 ? ' × ' + mintCount : ''}`}
            </button>
          </div>

          {/* Total cost hint */}
          <p style={{ fontSize: 11, color: '#4a6fa5', margin: 0, letterSpacing: '0.12em' }}>
            TOTAL: <span style={{ color: '#7ab3ff' }}>{totalCost} SUI</span>
            <span style={{ marginLeft: 20, color: '#2a4a7f' }}>MAX 10 PER TX</span>
          </p>

          {status && (
            <p style={{ fontSize: 10, color: '#4a9eff', marginTop: 12, wordBreak: 'break-all', lineHeight: 1.6, letterSpacing: '0.05em' }}>
              {status}
            </p>
          )}
        </div>
      </div>

      {/* ── STATS BAR ─────────────────────────────────────────────────── */}
      <div style={{
        borderTop: '0.5px solid rgba(74,111,165,0.15)',
        borderBottom: '0.5px solid rgba(74,111,165,0.15)',
        background: 'rgba(4,10,24,0.7)',
        marginBottom: isMobile ? 70 : 0,
      }}>
        <div style={{
          maxWidth: 1100,
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 0,
          width: '100%',
        }}>
          {[
            { label: 'POOL',         value: `${(poolAmount / 1_000_000_000).toFixed(2)} SUI` },
            { label: 'TOTAL SUPPLY', value: maxSupply.toLocaleString() },
            { label: 'REMAINING',    value: remaining.toLocaleString() },
            { label: 'CRUSH RATE',   value: '100%' },
          ].map(({ label, value }, i, arr) => (
            <div key={label} style={{
              padding: isMobile ? '10px 4px' : '26px 24px',
              borderRight: i < arr.length - 1 ? '0.5px solid rgba(74,111,165,0.12)' : 'none',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: isMobile ? 11 : 26, fontWeight: 700, color: '#ffffff', marginBottom: isMobile ? 2 : 5 }}>{value}</div>
              <div style={{ fontSize: isMobile ? 6 : 9, letterSpacing: isMobile ? '0.1em' : '0.28em', color: '#4a6fa5' }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── DRAWER TRIGGER — only shown when user owns crushers ───────── */}
      {nfts.length > 0 && (
        <button
          onClick={() => setDrawerOpen(true)}
          style={{
            position: 'fixed',
            right: 0,
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 100,
            background: 'rgba(8,18,40,0.95)',
            border: '0.5px solid rgba(74,158,255,0.35)',
            borderRight: 'none',
            borderRadius: '10px 0 0 10px',
            padding: '16px 10px',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 8,
            backdropFilter: 'blur(12px)',
            transition: 'background 0.2s',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(20,40,80,0.98)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(8,18,40,0.95)')}
        >
          <span style={{
            writingMode: 'vertical-rl',
            textOrientation: 'mixed',
            fontSize: 9,
            letterSpacing: '0.25em',
            color: '#7ab3ff',
            fontFamily: ff,
            userSelect: 'none',
          }}>
            MY CRUSHERS
          </span>
          <span style={{
            background: 'rgba(74,158,255,0.15)',
            border: '0.5px solid rgba(74,158,255,0.3)',
            borderRadius: 20,
            padding: '3px 7px',
            fontSize: 10,
            fontWeight: 700,
            color: '#4a9eff',
            fontFamily: ff,
          }}>
            {nfts.length}
          </span>
        </button>
      )}

      {/* ── DRAWER BACKDROP ───────────────────────────────────────────── */}
      {drawerOpen && (
        <div
          onClick={() => setDrawerOpen(false)}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 110,
            backdropFilter: 'blur(2px)',
          }}
        />
      )}

      {/* ── DRAWER PANEL ──────────────────────────────────────────────── */}
      <div style={{
        position: 'fixed',
        top: 0, right: 0, bottom: '60px',
        width: isMobile ? '100%' : 400,
        zIndex: 120,
        background: 'rgba(6,13,30,0.98)',
        borderLeft: '0.5px solid rgba(74,158,255,0.2)',
        backdropFilter: 'blur(20px)',
        transform: drawerOpen ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
      }}>

        {/* Drawer header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '80px 24px 20px',
          borderBottom: '0.5px solid rgba(74,111,165,0.15)',
          position: 'sticky', top: 0,
          background: 'rgba(6,13,30,0.98)',
          zIndex: 1,
        }}>
          <div>
            <h2 style={{ fontSize: 14, letterSpacing: '0.25em', color: '#7ab3ff', margin: '0 0 4px', fontWeight: 400, fontFamily: ff }}>
              YOUR CRUSHERS
            </h2>
            <p style={{ fontSize: 10, letterSpacing: '0.15em', color: '#4a6fa5', margin: 0, fontFamily: ff }}>
              {nfts.length} owned
            </p>
          </div>
          <button
            onClick={() => setDrawerOpen(false)}
            style={{
              width: 36, height: 36,
              border: '0.5px solid rgba(74,111,165,0.3)',
              borderRadius: 8,
              background: 'transparent',
              color: '#4a6fa5',
              fontSize: 18, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: ff,
              transition: 'color 0.15s, border-color 0.15s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#7ab3ff'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(74,158,255,0.4)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = '#4a6fa5'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(74,111,165,0.3)' }}
          >
            ✕
          </button>
        </div>

        {/* NFT grid */}
        <div style={{ padding: '20px 24px 100px' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 12,
          }}>
            {nfts.map((n: any) => {
              const img    = getImage(n)
              const rarity = n.data.content?.fields?.rarity ?? 'COMMON'
              const color  = rarityColor[rarity] ?? '#4a9eff'
              const glow   = rarityGlow[rarity]  ?? 'rgba(74,158,255,0.2)'
              return (
                <div
                  key={n.data.objectId}
                  style={{
                    background: 'rgba(10,22,48,0.8)',
                    border: `0.5px solid ${color}55`,
                    borderRadius: 12, overflow: 'hidden',
                    boxShadow: `0 0 16px ${glow}`,
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    cursor: 'default',
                  }}
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLDivElement
                    el.style.transform = 'translateY(-3px)'
                    el.style.boxShadow = `0 6px 24px ${glow}`
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLDivElement
                    el.style.transform = 'none'
                    el.style.boxShadow = `0 0 16px ${glow}`
                  }}
                >
                  {img
                    ? <img src={img} alt={rarity} style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', display: 'block' }} />
                    : <div style={{
                        width: '100%', aspectRatio: '1',
                        background: 'rgba(0,0,0,0.5)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <span style={{ fontSize: 32, color, opacity: 0.7 }}>粛</span>
                      </div>
                  }
                  <div style={{ padding: '8px 10px' }}>
                    <div style={{
                      display: 'inline-block', fontSize: 8, letterSpacing: '0.2em',
                      color, background: `${color}15`,
                      border: `0.5px solid ${color}44`,
                      borderRadius: 4, padding: '2px 6px', marginBottom: 6,
                    }}>
                      {rarity}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: '#7ab3ff' }}>
                      <span>#{n.data.content?.fields?.serial}</span>
                      <span style={{ color: '#4a6fa5' }}>✦ {n.data.content?.fields?.crush_count}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

      </div>

    </div>
  )
}