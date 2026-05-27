import { useEffect } from 'react'

type HomeProps = {
  setTab: (t: 'home' | 'crusher' | 'assets' | 'board') => void
}
export default function Home({ setTab }: HomeProps) {
  useEffect(() => {
    const el = document.getElementById('hero-div')
    if (el) console.log('[hero] computed bg-position:', window.getComputedStyle(el).backgroundPosition)
  }, [])

  return (
    <div style={{ fontFamily: 'Georgia, serif', paddingBottom: 100, overflowX: 'hidden', background: '#050f23' }}>

      <style>{`
        @keyframes hpulse { 0%,100%{opacity:1} 50%{opacity:0.25} }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes mintPulse { 0%,100%{ transform:scale(1) } 50%{ transform:scale(1.08) } }

        /* ── Section card shell ── */
        .sc {
          background: #0f1829;
          border-radius: 16px;
          border: 1px solid rgba(74,158,255,0.12);
          overflow: hidden;
          margin-bottom: 20px;
        }
        .sc-head {
          padding: 22px 24px 18px;
          border-bottom: 1px solid rgba(74,158,255,0.08);
        }
        .sc-tag {
          font-size: 9px; letter-spacing: 4px; color: #4a9eff;
          text-transform: uppercase; margin-bottom: 7px;
          font-family: Georgia, serif;
        }
        .sc-title {
          font-size: 17px; font-weight: bold; color: #e8f0ff;
          margin-bottom: 8px; line-height: 1.3;
        }
        .sc-sub {
          font-size: 12px; color: #5a7399; line-height: 1.75;
        }
        .sc-body {
          padding: 18px 24px;
          display: flex; flex-direction: column; gap: 10px;
        }

        /* ── Rarity rows ── */
        .rarity-row {
          display: flex; align-items: flex-start; gap: 14px;
          padding: 14px; border-radius: 10px;
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.05);
        }
        .rarity-kanji {
          font-size: 28px; width: 34px; text-align: center;
          flex-shrink: 0; line-height: 1; margin-top: 2px;
        }
        .rarity-info { flex: 1; min-width: 0; }
        .rarity-name {
          font-size: 11px; font-weight: bold; letter-spacing: 2px;
          margin-bottom: 4px; text-transform: uppercase;
        }
        .rarity-desc {
          font-size: 11px; color: #5a7399; line-height: 1.65;
          margin-bottom: 9px;
        }
        .rarity-bar-wrap { display: flex; align-items: center; gap: 10px; }
        .rarity-bar-bg {
          flex: 1; height: 4px;
          background: rgba(255,255,255,0.06); border-radius: 2px; overflow: hidden;
        }
        .rarity-bar-fill { height: 100%; border-radius: 2px; }
        .rarity-pts { font-size: 10px; color: #4a6fa5; font-family: monospace; white-space: nowrap; }

        /* ── Steps ── */
        .step-row {
          display: flex; gap: 14px; align-items: flex-start;
          padding: 14px; border-radius: 10px;
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.05);
        }
        .step-num {
          width: 34px; height: 34px; border-radius: 50%; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          font-size: 13px; font-weight: bold;
          border: 1px solid rgba(74,158,255,0.3);
          color: #4a9eff; background: rgba(74,158,255,0.08);
        }
        .step-title {
          font-size: 12px; font-weight: bold; color: #e8f0ff;
          margin-bottom: 5px; letter-spacing: 1px;
        }
        .step-desc { font-size: 11px; color: #5a7399; line-height: 1.7; }
        .step-note {
          display: inline-block; margin-top: 7px;
          font-size: 10px; padding: 3px 10px; border-radius: 20px;
          background: rgba(74,158,255,0.08); color: #4a9eff;
          border: 1px solid rgba(74,158,255,0.18); letter-spacing: 1px;
        }
        .step-connector {
          height: 10px; width: 1px;
          background: rgba(74,158,255,0.15);
          margin-left: 23px;
        }

        /* ── Reward rows ── */
        .reward-row {
          display: flex; align-items: center; gap: 12px;
          padding: 13px 14px; border-radius: 10px;
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.05);
        }
        .reward-medal {
          width: 40px; height: 40px; border-radius: 50%; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          font-size: 11px; font-weight: bold;
        }
        .reward-rank { font-size: 12px; font-weight: bold; color: #e8f0ff; margin-bottom: 3px; }
        .reward-desc { font-size: 11px; color: #5a7399; }
        .reward-pct { font-size: 22px; font-weight: bold; font-family: monospace; }
        .reward-of { font-size: 9px; color: #4a6fa5; letter-spacing: 1px; margin-top: 2px; text-align: right; }
        .ops-note {
          padding: 12px 14px; border-radius: 10px;
          background: rgba(74,158,255,0.04);
          border: 1px solid rgba(74,158,255,0.1);
          font-size: 11px; color: #4a6fa5; line-height: 1.75;
        }

        /* ── Mint Now button ── */
        .mint-now-btn {
          margin-top: 28px;
          background: rgba(5,15,35,0.85);
          border: 2px solid rgba(74,158,255,0.35);
          color: #7ab3ff;
          font-size: 13px;
          letter-spacing: 6px;
          padding: 12px 40px;
          border-radius: 4px;
          cursor: pointer;
          font-family: Georgia, serif;
          animation: mintPulse 2s ease-in-out infinite;
        }
        .mint-now-btn:hover {
          background: rgba(74,158,255,0.1);
        }

        /* ── Mobile overrides ── */
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
          .hero-kanji  { font-size: 52px !important; }
          .hero-title  { font-size: 22px !important; letter-spacing: 4px !important; }
          .hero-sub    { font-size: 9px !important; letter-spacing: 2px !important; }
          .hero-stats  { width: 100% !important; }
          .mint-now-btn { font-size: 11px !important; padding: 10px 28px !important; letter-spacing: 4px !important; }
          .sc-head     { padding: 18px 16px 14px !important; }
          .sc-body     { padding: 14px 16px !important; }
          .sc-title    { font-size: 15px !important; }
          .rarity-kanji { font-size: 22px !important; width: 26px !important; }
          .reward-pct  { font-size: 18px !important; }
          .reward-medal { width: 34px !important; height: 34px !important; font-size: 10px !important; }
        }

        @media (min-width: 769px) {
          .content-wrap { max-width: 700px; margin: 0 auto; padding: 40px 24px; }
          .sc-title { font-size: 18px !important; }
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
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.55) 70%, rgba(5,15,35,0.98) 100%)',
          pointerEvents: 'none',
        }} />

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

          {/* Stats strip */}
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
                <div style={{ fontSize: 16, fontWeight: 'bold', color: '#fff', whiteSpace: 'nowrap' }}>{val}</div>
                <div style={{ fontSize: 9, letterSpacing: 2, color: '#4a9eff', marginTop: 3, whiteSpace: 'nowrap' }}>{label}</div>
              </div>
            ))}
          </div>

          {/* MINT NOW — pulsing CTA */}
          <button
            className="mint-now-btn"
            onClick={() => setTab('assets')}
          >
            MINT NOW
          </button>

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

        <div className="content-wrap" style={{ maxWidth: 640, margin: '0 auto', padding: '32px 16px' }}>

          {/* ── CARD 1: Rarity & Evolution ── */}
          <div className="sc">
            <div className="sc-head">
              <div className="sc-tag">Rarity &amp; Evolution</div>
              <div className="sc-title">Your NFT grows as you crush</div>
              <div className="sc-sub">
                Every scam NFT you destroy earns your Crusher points. Accumulate enough and your NFT's appearance and rank automatically evolve — no manual action needed. The more you purge, the rarer you become.
              </div>
            </div>
            <div className="sc-body">
              {[
                {
                  kanji: '凡', name: 'COMMON', color: '#e74c3c',
                  desc: 'Starting rank for all new Crushers. Your NFT is freshly minted — the purge has just begun.',
                  pts: '0 – 49 pts', bar: 20,
                },
                {
                  kanji: '稀', name: 'RARE', color: '#4a9eff',
                  desc: "You've proven yourself an active enforcer. Your NFT visually evolves and your name starts appearing on the board.",
                  pts: '50 – 199 pts', bar: 45,
                },
                {
                  kanji: '傑', name: 'EPIC', color: '#a855f7',
                  desc: 'A seasoned purger. Your commitment to cleaning the ecosystem is etched onchain for all to see.',
                  pts: '200 – 499 pts', bar: 70,
                },
                {
                  kanji: '神', name: 'LEGENDARY', color: '#f5c842',
                  desc: 'The highest tier. Reserved for the most ruthless enforcers of the Sui ecosystem. Season rewards await.',
                  pts: '500+ pts', bar: 100,
                },
              ].map(({ kanji, name, color, desc, pts, bar }) => (
                <div key={name} className="rarity-row" style={{ borderLeft: `3px solid ${color}` }}>
                  <div className="rarity-kanji" style={{ color }}>{kanji}</div>
                  <div className="rarity-info">
                    <div className="rarity-name" style={{ color }}>{name}</div>
                    <div className="rarity-desc">{desc}</div>
                    <div className="rarity-bar-wrap">
                      <div className="rarity-bar-bg">
                        <div className="rarity-bar-fill" style={{ width: `${bar}%`, background: color }} />
                      </div>
                      <div className="rarity-pts">{pts}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── CARD 2: How it works ── */}
          <div className="sc">
            <div className="sc-head">
              <div className="sc-tag">How It Works</div>
              <div className="sc-title">Four steps from mint to reward</div>
              <div className="sc-sub">
                Scam Crusher is a points-based competitive protocol on Sui. Mint a Crusher NFT, destroy junk objects from your wallet, climb the leaderboard, and claim your share of the pool at season's end.
              </div>
            </div>
            <div className="sc-body">
              {[
                {
                  n: 1,
                  title: 'Mint your Crusher NFT',
                  desc: 'Pay 10 SUI to mint. Your NFT is stored in a secure Kiosk on Sui — fully onchain, fully yours. 100% of mint fees go directly into the reward pool.',
                  note: '10 SUI · 1,000 max supply',
                },
                {
                  n: 2,
                  title: 'Load your wallet targets',
                  desc: 'Connect your wallet and load assets. Any non-coin object — spam NFTs, scam tokens, junk airdrops — becomes a valid crush target.',
                  note: 'Any object type supported',
                },
                {
                  n: 3,
                  title: 'Crush & earn points',
                  desc: 'Select targets and hit Crush. Each destroy earns your NFT 1 point and costs 0.1 SUI in crush fee — also added to the pool. Hold multiple NFTs to multiply your points per crush.',
                  note: '0.1 SUI per crush · all to pool',
                },
                {
                  n: 4,
                  title: 'Rank up & claim rewards',
                  desc: "Your cumulative crush count determines your leaderboard rank. At season's end, the top 5 wallets split 70% of the entire pool based on their final position.",
                  note: 'Season ends at sold out',
                },
              ].map(({ n, title, desc, note }, i, arr) => (
                <div key={n}>
                  <div className="step-row">
                    <div className="step-num">{n}</div>
                    <div>
                      <div className="step-title">{title}</div>
                      <div className="step-desc">{desc}</div>
                      <div className="step-note">{note}</div>
                    </div>
                  </div>
                  {i < arr.length - 1 && <div className="step-connector" />}
                </div>
              ))}
            </div>
          </div>

          {/* ── CARD 3: Season Reward Split ── */}
          <div className="sc">
            <div className="sc-head">
              <div className="sc-tag">Season Reward Split</div>
              <div className="sc-title">The top 5 take 70% of the pool</div>
              <div className="sc-sub">
                At the end of Season 1, the reward pool — built entirely from mint and crush fees — is distributed to the top 5 ranked wallets. The more you crush, the bigger your share.
              </div>
            </div>
            <div className="sc-body">
              {[
                {
                  rank: '1st', label: 'Gold — Top Crusher',
                  desc: "The season's most ruthless purger. Largest single share of the pool.",
                  pct: '35%', color: '#f5c842',
                  bg: 'rgba(245,200,66,0.12)', border: 'rgba(245,200,66,0.3)',
                  rowBg: 'rgba(245,200,66,0.04)', accent: '#f5c842',
                },
                {
                  rank: '2nd', label: 'Silver',
                  desc: 'Close runner-up. Still a meaningful share for consistent grinders.',
                  pct: '12%', color: '#a8b8cc',
                  bg: 'rgba(168,184,204,0.12)', border: 'rgba(168,184,204,0.3)',
                  rowBg: 'transparent', accent: '#a8b8cc',
                },
                {
                  rank: '3rd', label: 'Bronze',
                  desc: "Top 3 is elite territory. Don't sleep on this position.",
                  pct: '10%', color: '#e07c3a',
                  bg: 'rgba(224,124,58,0.12)', border: 'rgba(224,124,58,0.3)',
                  rowBg: 'transparent', accent: '#e07c3a',
                },
                {
                  rank: '4th', label: '4th place',
                  desc: 'Still rewarded. Every position in the top 5 earns a payout.',
                  pct: '7%', color: '#4a9eff',
                  bg: 'rgba(74,111,165,0.12)', border: 'rgba(74,111,165,0.3)',
                  rowBg: 'transparent', accent: '#4a9eff',
                },
                {
                  rank: '5th', label: '5th place',
                  desc: 'The minimum to earn. Breaking top 5 is the goal every Crusher aims for.',
                  pct: '6%', color: '#4a9eff',
                  bg: 'rgba(74,111,165,0.12)', border: 'rgba(74,111,165,0.3)',
                  rowBg: 'transparent', accent: '#4a9eff',
                },
              ].map(({ rank, label, desc, pct, color, bg, border, rowBg, accent }) => (
                <div
                  key={rank}
                  className="reward-row"
                  style={{ borderLeft: `3px solid ${accent}`, background: rowBg }}
                >
                  <div className="reward-medal" style={{ background: bg, border: `1px solid ${border}`, color }}>
                    {rank}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="reward-rank">{label}</div>
                    <div className="reward-desc">{desc}</div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div className="reward-pct" style={{ color }}>{pct}</div>
                    <div className="reward-of">of pool</div>
                  </div>
                </div>
              ))}

              <div className="ops-note">
                <span style={{ color: '#4a9eff', fontSize: 10, letterSpacing: 2, fontWeight: 'bold' }}>
                  PROTOCOL NOTE —&nbsp;
                </span>
                The remaining 30% of the pool is allocated to operational costs and protocol maintenance to keep the season running smoothly.
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}