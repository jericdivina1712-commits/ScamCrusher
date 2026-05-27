import { useEffect } from 'react'

export default function Home() {
  useEffect(() => {
    const el = document.getElementById('hero-div')
    if (el) console.log('[hero] computed bg-position:', window.getComputedStyle(el).backgroundPosition)
  }, [])

  return (
    <div style={{ fontFamily: 'Georgia, serif', paddingBottom: 100, overflowX: 'hidden', background: '#050f23' }}>

      <style>{`
        @keyframes hpulse { 0%,100%{opacity:1} 50%{opacity:0.25} }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

        .section-card {
          background: #0f1829;
          border-radius: 16px;
          padding: 24px;
          margin-bottom: 20px;
          border: 1px solid rgba(74,158,255,0.12);
          box-shadow: 0 4px 24px rgba(0,0,0,0.3);
        }
        .section-card-title {
          font-size: 10px;
          letter-spacing: 4px;
          color: #4a9eff;
          border-bottom: 1px solid rgba(74,158,255,0.12);
          padding-bottom: 10px;
          margin-bottom: 18px;
          font-weight: bold;
          text-transform: uppercase;
        }

        /* Mobile overrides */
        @media (max-width: 768px) {
          #hero-div {
            align-items: center !important;
            padding-left: 0 !important;
            padding-right: 0 !important;
            background-position: 75% 50% !important;
            justify-content: center !important;
            padding-bottom: 0 !important;
            padding-top: 80px !important;
          }
          .hero-text-wrap {
            align-items: center !important;
            text-align: center !important;
            padding: 0 20px !important;
          }
          .hero-kanji { font-size: 48px !important; }
          .hero-title { font-size: 22px !important; letter-spacing: 4px !important; }
          .hero-sub   { font-size: 9px !important; letter-spacing: 2px !important; }
          .hero-stats { width: 100% !important; }
        }
      `}</style>

      {/* ── HERO ── */}
      <div
        id="hero-div"
        style={{
          position: 'relative',
          width: '100%',
          minHeight: '95svh',
          backgroundImage: "url('/Crusher.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: '50% 50%',
          backgroundAttachment: 'scroll',
          backgroundRepeat: 'no-repeat',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          paddingLeft: '18%',
          justifyContent: 'center',
          paddingBottom: 48,
          paddingTop: 60,
        }}
      >
        {/* dark gradient overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.55) 70%, rgba(5,15,35,0.98) 100%)',
          pointerEvents: 'none',
        }} />

        {/* Hero text */}
        <div
          className="hero-text-wrap"
          style={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            textAlign: 'left',
            padding: '0 24px',
          }}
        >
          {/* Live badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            background: 'rgba(74,158,255,0.18)', border: '1px solid rgba(74,158,255,0.4)',
            borderRadius: 99, padding: '5px 16px', marginBottom: 20,
          }}>
            <span style={{
              width: 7, height: 7, borderRadius: '50%', background: '#4a9eff',
              display: 'inline-block', animation: 'hpulse 2s infinite',
            }} />
            <span style={{ fontSize: 10, letterSpacing: 3, color: '#7ab3ff' }}>SEASON 1 ACTIVE</span>
          </div>

          {/* Kanji */}
          <div className="hero-kanji" style={{
            fontSize: 72, lineHeight: 1, color: '#e74c3c',
            marginBottom: 12, textShadow: '0 0 32px rgba(231,76,60,0.5)',
          }}>
            粛清
          </div>

          {/* Title */}
          <div className="hero-title" style={{
            fontSize: 34, fontWeight: 'bold', letterSpacing: 7,
            color: '#fff', marginBottom: 8,
            textShadow: '0 0 40px rgba(74,158,255,0.6), 2px 2px 0 #0a1a3a',
          }}>
            SCAM CRUSHER
          </div>

          {/* Subtitle */}
          <div className="hero-sub" style={{
            fontSize: 11, letterSpacing: 4, color: '#a8c8ff', marginBottom: 32,
          }}>
            PURGE THE UNWORTHY · RISE IN RARITY
          </div>

          {/* Quick stats strip */}
          <div className="hero-stats" style={{
            display: 'flex', borderRadius: 14, overflow: 'hidden',
            border: '1px solid rgba(74,158,255,0.25)',
            background: 'rgba(5,15,35,0.75)',
            backdropFilter: 'blur(12px)',
          }}>
            {[
              ['1,000', 'SUPPLY'],
              ['10 SUI', 'MINT'],
              ['70%', 'TO TOP 5'],
            ].map(([val, label], i) => (
              <div key={label} style={{
                flex: 1, padding: '14px 8px', textAlign: 'center',
                borderRight: i < 2 ? '1px solid rgba(74,158,255,0.15)' : 'none',
              }}>
                <div style={{ fontSize: 18, fontWeight: 'bold', color: '#fff' }}>{val}</div>
                <div style={{ fontSize: 9, letterSpacing: 2, color: '#4a9eff', marginTop: 3 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll cue */}
        <div style={{
          position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
        }}>
          <div style={{ fontSize: 9, letterSpacing: 3, color: 'rgba(122,179,255,0.6)' }}>SCROLL</div>
          <div style={{ width: 1, height: 24, background: 'rgba(122,179,255,0.3)' }} />
        </div>
      </div>

      {/* ── BELOW HERO ── */}
      <div style={{ background: '#050f23', borderTop: '1px solid rgba(74,158,255,0.12)', width: '100%' }}>

        {/* SUI badge strip */}
        <div style={{
          background: 'linear-gradient(90deg, rgba(26,107,255,0.15) 0%, rgba(14,165,233,0.15) 100%)',
          borderBottom: '1px solid rgba(74,158,255,0.12)',
          padding: '10px 24px',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" fill="rgba(74,158,255,0.3)" />
            <path d="M8 12.5c0-2.21 1.79-4 4-4s4 1.79 4 4-1.79 4-4 4-4-1.79-4-4z" fill="#4a9eff" />
          </svg>
          <span style={{ fontSize: 11, letterSpacing: 3, color: '#4a9eff', fontWeight: 'bold' }}>
            BUILT ON SUI NETWORK
          </span>
        </div>

        <div style={{ maxWidth: 640, margin: '0 auto', padding: '32px 20px' }}>

          {/* ── Rarity tiers ── */}
          <div className="section-card">
            <div className="section-card-title">RARITY &amp; EVOLUTION</div>
            {[
              { kanji: '凡', name: 'COMMON',    pts: '0 – 49 pt',    color: '#e74c3c', bar: 20  },
              { kanji: '稀', name: 'RARE',      pts: '50 – 199 pt',  color: '#4a9eff', bar: 45  },
              { kanji: '傑', name: 'EPIC',      pts: '200 – 499 pt', color: '#a855f7', bar: 70  },
              { kanji: '神', name: 'LEGENDARY', pts: '500 pt〜',     color: '#f5c842', bar: 100 },
            ].map(({ kanji, name, pts, color, bar }) => (
              <div key={name} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '11px 12px', marginBottom: 8, borderRadius: 10,
                background: 'rgba(255,255,255,0.03)',
                border: `1px solid rgba(255,255,255,0.06)`,
                borderLeft: `3px solid ${color}`,
              }}>
                <span style={{ fontSize: 20, width: 24, textAlign: 'center', color }}>{kanji}</span>
                <span style={{ fontSize: 12, fontWeight: 'bold', color: '#e8f0ff', flex: 1 }}>{name}</span>
                <div style={{ width: 56, height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ width: `${bar}%`, height: '100%', background: color, borderRadius: 2 }} />
                </div>
                <span style={{ fontSize: 10, color: '#5a7399', fontFamily: 'monospace', minWidth: 72, textAlign: 'right' }}>{pts}</span>
              </div>
            ))}
          </div>

          {/* ── How it works ── */}
          <div className="section-card">
            <div className="section-card-title">HOW IT WORKS</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                { icon: '⛏', label: 'Mint Price',        val: '10 SUI'       },
                { icon: '💥', label: 'Crush Fee',         val: '0.1 SUI'      },
                { icon: '🪙', label: 'Total Supply',      val: '1,000 NFTs'   },
                { icon: '🏆', label: 'Reward Pool Share', val: '70% to Top 5' },
              ].map(({ icon, label, val }) => (
                <div key={label} style={{
                  background: 'rgba(74,158,255,0.04)',
                  borderRadius: 12, padding: '14px',
                  border: '1px solid rgba(74,158,255,0.1)',
                }}>
                  <div style={{ fontSize: 22, marginBottom: 6 }}>{icon}</div>
                  <div style={{ fontSize: 9, letterSpacing: 2, color: '#5a7399', marginBottom: 4 }}>{label.toUpperCase()}</div>
                  <div style={{ fontSize: 15, fontWeight: 'bold', color: '#e8f0ff' }}>{val}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Reward split ── */}
          <div className="section-card">
            <div className="section-card-title">SEASON REWARD SPLIT</div>
            {[
              { rank: '1st', pct: '35%', color: '#f5c842', bg: 'rgba(245,200,66,0.06)',   label: 'Gold'   },
              { rank: '2nd', pct: '12%', color: '#a8b8cc', bg: 'rgba(168,184,204,0.06)', label: 'Silver' },
              { rank: '3rd', pct: '10%', color: '#e07c3a', bg: 'rgba(224,124,58,0.06)',  label: 'Bronze' },
              { rank: '4th', pct: '7%',  color: '#4a9eff', bg: 'rgba(74,158,255,0.04)',  label: ''       },
              { rank: '5th', pct: '6%',  color: '#4a9eff', bg: 'rgba(74,158,255,0.04)',  label: ''       },
            ].map(({ rank, pct, color, bg, label }) => (
              <div key={rank} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 12px', marginBottom: 8, borderRadius: 10,
                background: bg,
                border: '1px solid rgba(255,255,255,0.05)',
              }}>
                <div style={{
                  width: 34, height: 34, borderRadius: '50%',
                  border: `1.5px solid ${color}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 'bold', color, flexShrink: 0,
                }}>
                  {rank}
                </div>
                <span style={{ flex: 1, fontSize: 12, color: '#a8c0e0' }}>
                  {label || rank + ' place'}
                </span>
                <span style={{ fontSize: 20, fontWeight: 'bold', color, fontFamily: 'monospace' }}>{pct}</span>
              </div>
            ))}
            <div style={{
              fontSize: 10, color: '#5a7399', marginTop: 12, lineHeight: 1.7,
              padding: '10px 12px',
              background: 'rgba(255,255,255,0.03)',
              borderRadius: 8,
              border: '1px solid rgba(255,255,255,0.06)',
            }}>
              30% allocated to protocol operations &amp; maintenance.
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}