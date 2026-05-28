import { useState, useRef } from 'react'
import { Wheel } from 'react-custom-roulette'
import { useSignAndExecuteTransaction } from '@mysten/dapp-kit'
import { Transaction } from '@mysten/sui/transactions'

const TRASH_PACKAGE_ID = '0x41caf112112c4675ed7d7c0b6ca32964848a74c21a8b78bb2709f53b3b85e7f6'

const font = "'DM Sans', 'Syne', system-ui, sans-serif"

type Prize = {
  label: string
  emoji: string
  color: string
  textColor: string
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGEND'
  description: string
}

const PRIZES: Prize[] = [
  { label: 'Mountain Trash', emoji: '🏔️', color: '#f5c842', textColor: '#1a1000', rarity: 'LEGEND', description: 'The rarest of all trash. Legend has it, no one escapes the mountain.' },
  { label: 'Try Again',      emoji: '🔄', color: '#1a2a42', textColor: '#4a6fa5', rarity: 'COMMON', description: 'The trash gods are not pleased. Spin again!' },
  { label: 'Poison Trash',   emoji: '☠️', color: '#a855f7', textColor: '#fff',    rarity: 'EPIC',   description: 'Dangerously epic. This trash bites back.' },
  { label: 'Rotten Trash',   emoji: '🦠', color: '#4a9eff', textColor: '#fff',    rarity: 'RARE',   description: 'Aged to perfection. A rare find in the dump.' },
  { label: 'Try Again',      emoji: '🔄', color: '#1a2a42', textColor: '#4a6fa5', rarity: 'COMMON', description: 'The trash gods are not pleased. Spin again!' },
  { label: 'Toxic Trash',    emoji: '☢️', color: '#2a3f5f', textColor: '#8aafcc', rarity: 'COMMON', description: 'Common but glowing. Handle with care.' },
  { label: 'Rotten Trash',   emoji: '🦠', color: '#4a9eff', textColor: '#fff',    rarity: 'RARE',   description: 'Aged to perfection. A rare find in the dump.' },
  { label: 'Poison Trash',   emoji: '☠️', color: '#a855f7', textColor: '#fff',    rarity: 'EPIC',   description: 'Dangerously epic. This trash bites back.' },
]

const rarityConfig: Record<string, { color: string; glow: string; border: string }> = {
  COMMON: { color: '#ef4444', glow: 'rgba(239,68,68,0.25)',   border: 'rgba(239,68,68,0.3)'  },
  RARE:   { color: '#4a9eff', glow: 'rgba(74,158,255,0.30)',  border: 'rgba(74,158,255,0.4)' },
  EPIC:   { color: '#a855f7', glow: 'rgba(168,85,247,0.30)',  border: 'rgba(168,85,247,0.4)' },
  LEGEND: { color: '#f5c842', glow: 'rgba(245,200,66,0.35)',  border: 'rgba(245,200,66,0.45)'},
}

const wheelData = PRIZES.map(p => ({
  option: p.label,
  style: {
    backgroundColor: p.color,
    textColor: p.textColor,
  },
}))

type RouletteProps = {
  account: any
}

export default function Roulette({ account: _account }: RouletteProps) {
  const [mustSpin, setMustSpin] = useState(false)
  const [prizeIndex, setPrizeIndex] = useState(0)
  const [result, setResult] = useState<Prize | null>(null)
  const [history, setHistory] = useState<Prize[]>([])
  const [showResult, setShowResult] = useState(false)
  const [spinCount, setSpinCount] = useState(0)
  const [minting, setMinting] = useState(false)
  const [mintStatus, setMintStatus] = useState('')
  const resultRef = useRef<HTMLDivElement>(null)
  const { mutate: signAndExecute } = useSignAndExecuteTransaction()

  const mintTrashNFT = (rarity: string) => {
    setMinting(true)
    setMintStatus('')
    const tx = new Transaction()
    tx.moveCall({
      target: `${TRASH_PACKAGE_ID}::trash_nft::mint`,
      arguments: [tx.pure.string(rarity)],
    })
    signAndExecute({ transaction: tx }, {
      onSuccess: (r) => {
        setMintStatus(`✦ NFT minted! ${r.digest.slice(0, 10)}...`)
        setMinting(false)
      },
      onError: (e) => {
        setMintStatus(`Error: ${e.message}`)
        setMinting(false)
      },
    })
  }

  const handleSpin = () => {
    if (mustSpin) return
    setShowResult(false)
    setResult(null)
    const idx = Math.floor(Math.random() * PRIZES.length)
    setPrizeIndex(idx)
    setMustSpin(true)
  }

  const handleStop = () => {
    setMustSpin(false)
    const won = PRIZES[prizeIndex]
    setResult(won)
    setHistory(prev => [won, ...prev].slice(0, 8))
    setSpinCount(c => c + 1)
    setShowResult(true)
    setTimeout(() => {
      resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 100)
  }

  return (
    <>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 18px rgba(245,200,66,0.2); }
          50%       { box-shadow: 0 0 36px rgba(245,200,66,0.5); }
        }
        @keyframes shimmer {
          0%   { background-position: -400px 0; }
          100% { background-position: 400px 0; }
        }
        .spin-btn:hover:not(:disabled) {
          transform: translateY(-2px) scale(1.03);
          box-shadow: 0 8px 32px rgba(245,200,66,0.45) !important;
        }
        .spin-btn:active:not(:disabled) {
          transform: scale(0.97);
        }
        .spin-btn { transition: transform 0.15s, box-shadow 0.15s; }
        .prize-card-appear {
          animation: fadeUp 0.4s ease forwards;
        }
        .history-pill:hover {
          border-color: rgba(255,255,255,0.2) !important;
          background: rgba(255,255,255,0.08) !important;
        }
        @media (max-width: 768px) {
          .roulette-root { padding-top: 16px !important; }
        .roulette-layout { flex-direction: column !important; align-items: center !important; padding-left: 0 !important; margin-top: 0 !important; }
          .roulette-right-col { max-width: 100% !important; width: calc(100vw - 30px) !important; }
          .prizes-table { width: 100% !important; }
          .prize-card-desktop { display: none !important; }
        }
        @keyframes modalIn {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @media (min-width: 769px) {
          .result-modal {
            bottom: auto !important;
            left: 50% !important;
            right: auto !important;
            top: 50% !important;
            transform: translate(-50%, -50%) !important;
            width: 420px !important;
          }
        }
      `}</style>

      <div
        className="roulette-root"
        style={{
          paddingTop: 70,
          paddingBottom: 120,
          maxWidth: 900,
          margin: '0 auto',
          padding: '70px 16px 120px',
          color: '#e8f0ff',
          fontFamily: font,
        }}
      >
        {/* ── HEADER ── */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{
            display: 'inline-block',
            fontSize: 9, letterSpacing: 5, fontWeight: 700,
            color: '#f5c842', textTransform: 'uppercase',
            background: 'rgba(245,200,66,0.08)',
            border: '1px solid rgba(245,200,66,0.2)',
            padding: '5px 16px', borderRadius: 99, marginBottom: 14,
          }}>
            Free Spin · No Cost
          </div>
          <h1 style={{
            fontSize: 28, fontWeight: 900, letterSpacing: -0.5,
            margin: '0 0 8px',
            background: 'linear-gradient(135deg, #e8f0ff 30%, #f5c842)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            Scam Crusher Roulette
          </h1>
          <p style={{ fontSize: 12, color: '#4a6fa5', letterSpacing: 1, margin: 0 }}>
            Spin the wheel. Claim your fate.
          </p>
          {spinCount > 0 && (
            <p style={{ fontSize: 10, color: '#2a4a7f', marginTop: 8, letterSpacing: 2 }}>
              {spinCount} spin{spinCount !== 1 ? 's' : ''} today
            </p>
          )}
        </div>

        {/* ── WHEEL + RESULT LAYOUT ── */}
        <div
          className="roulette-layout"
          style={{ display: 'flex', gap: 48, alignItems: 'flex-start', justifyContent: 'flex-start', paddingLeft: 40, marginTop: 16 }}
        >
          {/* Wheel column */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
            {/* Wheel wrapper */}
            <div style={{
              position: 'relative',
              padding: 6,
              borderRadius: '50%',
              background: 'conic-gradient(from 0deg, rgba(245,200,66,0.15), rgba(74,158,255,0.1), rgba(168,85,247,0.1), rgba(245,200,66,0.15))',
              boxShadow: mustSpin
                ? '0 0 60px rgba(245,200,66,0.25)'
                : '0 0 30px rgba(0,0,0,0.5)',
              transition: 'box-shadow 0.3s',
            }}>
              <Wheel
                mustStartSpinning={mustSpin}
                prizeNumber={prizeIndex}
                data={wheelData}
                backgroundColors={PRIZES.map(p => p.color)}
                textColors={PRIZES.map(p => p.textColor)}
                onStopSpinning={handleStop}
                outerBorderColor="rgba(255,255,255,0.08)"
                outerBorderWidth={3}
                innerRadius={18}
                innerBorderColor="rgba(255,255,255,0.06)"
                innerBorderWidth={2}
                radiusLineColor="rgba(255,255,255,0.05)"
                radiusLineWidth={1}
                fontSize={11}
                textDistance={72}
                spinDuration={0.8}
              />
            </div>

            {/* Spin button */}
            <button
              className="spin-btn"
              onClick={handleSpin}
              disabled={mustSpin}
              style={{
                padding: '14px 52px',
                border: 'none',
                borderRadius: 99,
                fontSize: 11,
                fontWeight: 900,
                letterSpacing: 4,
                textTransform: 'uppercase',
                fontFamily: font,
                cursor: mustSpin ? 'not-allowed' : 'pointer',
                background: mustSpin
                  ? 'rgba(255,255,255,0.05)'
                  : 'linear-gradient(90deg, #d4a017, #f5c842, #d4a017)',
                backgroundSize: mustSpin ? 'auto' : '200% auto',
                color: mustSpin ? '#2a4a7f' : '#0a0800',
                boxShadow: mustSpin
                  ? 'none'
                  : '0 4px 24px rgba(245,200,66,0.35)',
                animation: mustSpin ? 'none' : undefined,
              }}
            >
              {mustSpin ? '◌ Spinning...' : '✦ Spin'}
            </button>
          </div>

          {/* Right column: result + prizes list */}
          <div style={{ flex: 1, minWidth: 0, maxWidth: 520, display: 'flex', flexDirection: 'column', gap: 20, marginTop: 32 }} className="roulette-right-col">

            {/* Result card — desktop only (modal handles mobile) */}
            {showResult && result && (
              <div
                ref={resultRef}
                className="prize-card-appear prize-card-desktop"
                style={{
                  borderRadius: 16,
                  padding: '24px 20px',
                  background: `linear-gradient(135deg, rgba(13,24,41,0.95), ${rarityConfig[result.rarity].glow})`,
                  border: `1px solid ${rarityConfig[result.rarity].border}`,
                  boxShadow: `0 0 32px ${rarityConfig[result.rarity].glow}`,
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: 42, marginBottom: 10 }}>{result.emoji}</div>
                <div style={{
                  fontSize: 8, letterSpacing: 4, fontWeight: 800,
                  color: rarityConfig[result.rarity].color,
                  textTransform: 'uppercase', marginBottom: 6,
                }}>
                  {result.rarity}
                </div>
                <div style={{ fontSize: 22, fontWeight: 900, color: '#e8f0ff', marginBottom: 6 }}>
                  {result.label}
                </div>
                <div style={{ fontSize: 11, color: '#4a6fa5', letterSpacing: 0.5 }}>
                  {result.description}
                </div>
              </div>
            )}

            {/* Prizes table */}
            <div style={{
              borderRadius: 16,
              border: '1px solid rgba(255,255,255,0.07)',
              background: 'rgba(13,24,41,0.6)',
              overflow: 'hidden',
              width: '100%',
            }}>
              <div style={{
                padding: '16px 24px',
                borderBottom: '1px solid rgba(255,255,255,0.07)',
                fontSize: 9, letterSpacing: 4, fontWeight: 700,
                color: '#4a6fa5', textTransform: 'uppercase',
              }}>
                Possible Prizes
              </div>
              {PRIZES.filter((p, i, arr) => arr.findIndex(x => x.label === p.label) === i).map((prize, i) => {
                const rc = rarityConfig[prize.rarity]
                return (
                  <div
                    key={i}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 16,
                      padding: '16px 24px',
                      borderBottom: i < PRIZES.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.03)'}
                    onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = 'transparent'}
                  >
                    <div style={{
                      width: 14, height: 14, borderRadius: '50%',
                      background: prize.color, flexShrink: 0,
                      boxShadow: `0 0 8px ${rc.glow}`,
                    }} />
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: 15, fontWeight: 700, color: '#e8f0ff' }}>
                        {prize.emoji} {prize.label}
                      </span>
                    </div>
                    <span style={{
                      fontSize: 9, fontWeight: 800, letterSpacing: 2,
                      color: rc.color,
                      background: `${rc.glow}`,
                      border: `1px solid ${rc.border}`,
                      padding: '4px 14px', borderRadius: 99,
                      textTransform: 'uppercase',
                    }}>
                      {prize.rarity}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* ── HISTORY ── */}
        {history.length > 0 && (
          <div style={{ marginTop: 40 }}>
            <div style={{
              fontSize: 9, letterSpacing: 4, fontWeight: 700,
              color: '#2a4a7f', textTransform: 'uppercase', marginBottom: 12,
              textAlign: 'center',
            }}>
              Recent Spins
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
              {history.map((h, i) => {
                const rc = rarityConfig[h.rarity]
                return (
                  <div
                    key={i}
                    className="history-pill"
                    style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      padding: '6px 14px', borderRadius: 99,
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      fontSize: 10, fontWeight: 700,
                      color: rc.color, cursor: 'default',
                      transition: 'border-color 0.15s, background 0.15s',
                      opacity: i === 0 ? 1 : 0.6,
                    }}
                  >
                    <span>{h.emoji}</span>
                    <span>{h.label}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    {/* ── RESULT MODAL (mobile) ── */}
        {showResult && result && (
          <>
            {/* Backdrop */}
            <div
              onClick={() => setShowResult(false)}
              style={{
                position: 'fixed', inset: 0,
                background: 'rgba(0,0,0,0.7)',
                backdropFilter: 'blur(6px)',
                zIndex: 999,
              }}
            />
            {/* Modal */}
            {/* Modal */}
            <div className="result-modal" style={{
              position: 'fixed',
              bottom: 80, left: 15, right: 15,
              zIndex: 1000,
              borderRadius: 20,
              padding: '32px 24px 28px',
              background: `linear-gradient(160deg, rgba(13,24,41,0.98), rgba(5,10,25,0.99))`,
              border: `1px solid ${rarityConfig[result.rarity].border}`,
              boxShadow: `0 0 60px ${rarityConfig[result.rarity].glow}, 0 24px 48px rgba(0,0,0,0.6)`,
              textAlign: 'center',
              animation: 'modalIn 0.3s cubic-bezier(.34,1.56,.64,1) forwards',
            }}>
              {/* Close */}
              <button
                onClick={() => setShowResult(false)}
                style={{
                  position: 'absolute', top: 14, right: 14,
                  width: 30, height: 30, borderRadius: '50%',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#4a6fa5', fontSize: 14, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: font,
                }}
              >✕</button>

              {/* NFT Image */}
              {result.label !== 'Try Again' ? (
                <div style={{
                  width: 160, height: 160, borderRadius: 16,
                  overflow: 'hidden', margin: '0 auto 16px',
                  border: `2px solid ${rarityConfig[result.rarity].border}`,
                  boxShadow: `0 0 24px ${rarityConfig[result.rarity].glow}`,
                  position: 'relative',
                }}>
                  <img
                    src={
                      result.rarity === 'COMMON'  ? 'https://i.imgur.com/pkrU4nC.png' :
                      result.rarity === 'RARE'    ? 'https://i.imgur.com/Qpjjl91.png' :
                      result.rarity === 'EPIC'    ? 'https://i.imgur.com/uewvZoX.png' :
                                                    'https://i.imgur.com/XN11Uv6.png'
                    }
                    alt={result.label}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                </div>
              ) : (
                <div style={{
                  width: 80, height: 80, borderRadius: '50%',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 16px', fontSize: 36,
                }}>
                  🔄
                </div>
              )}

              <div style={{
                fontSize: 9, letterSpacing: 5, fontWeight: 800,
                color: rarityConfig[result.rarity].color,
                textTransform: 'uppercase', marginBottom: 8,
              }}>
                {result.rarity}
              </div>
              <div style={{
                fontSize: 28, fontWeight: 900, color: '#e8f0ff',
                marginBottom: 8, fontFamily: font,
              }}>
                {result.label}
              </div>
              <div style={{ fontSize: 12, color: '#4a6fa5', letterSpacing: 0.5, marginBottom: 12 }}>
                {result.description}
              </div>
              {mintStatus && (
                <div style={{
                  fontSize: 10, letterSpacing: 1, marginBottom: 16,
                  color: mintStatus.startsWith('Error') ? '#ef4444' : '#4a9eff',
                  wordBreak: 'break-all',
                }}>
                  {mintStatus}
                </div>
              )}
              {minting && (
                <div style={{ fontSize: 10, color: '#f5c842', letterSpacing: 2, marginBottom: 16 }}>
                  ◌ Minting your NFT...
                </div>
              )}
              {/* Claim NFT button — only if not Try Again */}
              {result.label !== 'Try Again' && !mintStatus && (
                <button
                  onClick={() => mintTrashNFT(result.rarity)}
                  disabled={minting}
                  style={{
                    width: '100%',
                    padding: '14px',
                    border: `1px solid ${rarityConfig[result.rarity].border}`,
                    borderRadius: 99,
                    fontSize: 11, fontWeight: 900,
                    letterSpacing: 4, textTransform: 'uppercase',
                    fontFamily: font, cursor: minting ? 'not-allowed' : 'pointer',
                    background: minting
                      ? 'rgba(255,255,255,0.05)'
                      : `linear-gradient(90deg, ${rarityConfig[result.rarity].color}22, ${rarityConfig[result.rarity].color}44)`,
                    color: minting ? '#2a4a7f' : rarityConfig[result.rarity].color,
                    boxShadow: minting ? 'none' : `0 4px 24px ${rarityConfig[result.rarity].glow}`,
                    marginBottom: 10,
                  }}
                >
                  {minting ? '◌ Minting...' : '✦ Claim NFT'}
                </button>
              )}

              {/* Spin again */}
              <button
                className="spin-btn"
                onClick={() => { setShowResult(false); handleSpin() }}
                disabled={mustSpin}
                style={{
                  width: '100%',
                  padding: '14px',
                  border: 'none', borderRadius: 99,
                  fontSize: 11, fontWeight: 900,
                  letterSpacing: 4, textTransform: 'uppercase',
                  fontFamily: font, cursor: 'pointer',
                  background: 'linear-gradient(90deg, #d4a017, #f5c842, #d4a017)',
                  color: '#0a0800',
                  boxShadow: '0 4px 24px rgba(245,200,66,0.35)',
                }}
              >
                ✦ Spin Again
              </button>
            </div>
          </>
        )}

    </>
  )
}