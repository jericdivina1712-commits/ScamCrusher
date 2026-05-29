import { useRef, useState } from 'react'
import domtoimage from 'dom-to-image-more'

const font = "'DM Sans', 'Syne', system-ui, sans-serif"

type CrushReceiptProps = {
  totalCrushes: number
  pointsGained: number
  targetImage: string | null
  onClose: () => void
}

export default function CrushReceipt({ totalCrushes, pointsGained, targetImage, onClose }: CrushReceiptProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [capturing, setCapturing] = useState(false)

  const capture = async (): Promise<string | null> => {
    if (!cardRef.current) return null
    setCapturing(true)
    try {
      const dataUrl = await domtoimage.toPng(cardRef.current, {
        quality: 1,
        scale: 2,
        bgcolor: '#08152e',
        useCORS: true,
      })
      return dataUrl
    } catch (e) {
      console.error('capture failed', e)
      return null
    } finally {
      setCapturing(false)
    }
  }

  const handleDownload = async () => {
    const dataUrl = await capture()
    if (!dataUrl) return
    const a = document.createElement('a')
    a.href = dataUrl
    a.download = `crush-receipt-${totalCrushes}.png`
    a.click()
  }

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(6px)',
          zIndex: 300,
        }}
      />

      {/* Modal wrapper */}
      <div style={{
        position: 'fixed',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 301,
        width: 'calc(100vw - 30px)',
        maxWidth: 400,
        boxSizing: 'border-box' as const,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 14,
      }}>

        {/* ── THE CARD ── */}
        <div
          ref={cardRef}
          style={{
            width: '100%',
            background: '#08152e',
            border: '1px solid rgba(239,68,68,0.22)',
            borderRadius: 20,
            padding: '24px 22px 20px',
            boxSizing: 'border-box' as const,
            fontFamily: font,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Background image */}
          <img
            src="/Crusher.jpg"
            alt=""
            style={{
              position: 'absolute', inset: 0,
              width: '100%', height: '100%',
              objectFit: 'cover',
              objectPosition: 'center',
              opacity: 0.12,
              zIndex: 0,
              transform: 'scale(1.15)',
            }}
          />

          {/* Content */}
          <div style={{ position: 'relative', zIndex: 1 }}>

            {/* ── TITLE BLOCK ── */}
            <div style={{ textAlign: 'center', marginBottom: 18 }}>
              <div style={{
                fontSize: 9, letterSpacing: '0.4em',
                color: '#4a85c8', fontWeight: 700,
                textTransform: 'uppercase',
                marginBottom: 4,
              }}>
                Fighting Scams Since The Beginning
              </div>
              <div style={{
                fontSize: 22, fontWeight: 900,
                color: '#ffffff', letterSpacing: '0.06em',
                lineHeight: 1.1,
                textShadow: '0 0 28px rgba(239,68,68,0.45)',
              }}>
                SCAM CRUSHER
              </div>
              <div style={{
                fontSize: 9, letterSpacing: '0.22em',
                color: '#3a6a9a', fontWeight: 400,
                marginTop: 3,
                textTransform: 'uppercase',
              }}>
                Crush. Expose. Protect.
              </div>
              {/* Red accent line */}
              <div style={{
                width: 40, height: 2,
                background: 'linear-gradient(90deg, transparent, #ef4444, transparent)',
                borderRadius: 2,
                margin: '8px auto 0',
              }} />
            </div>

            {/* ── NFT IMAGE (smaller: 72% width) ── */}
          <div style={{ position: 'relative' }}>
            <img
              src="/RaijinBCmoji.png"
              alt=""
              style={{
                position: 'absolute',
                top: -60,
                left: -40,
                width: 145,
                height: 145,
                objectFit: 'contain',
                pointerEvents: 'none',
                zIndex: 4,
              }}
            />
            <img
              src="/RaijinBCmojiR.png"
              alt=""
              style={{
                position: 'absolute',
                bottom: -30,
                right: -40,
                width: 125,
                height: 125,
                objectFit: 'contain',
                pointerEvents: 'none',
                zIndex: 4,
              }}
            />
          <div style={{
            width: '92%',
            margin: '0 auto 18px',
              aspectRatio: '1/1',
              borderRadius: 12,
              overflow: 'hidden',
              border: '1px solid rgba(239,68,68,0.28)',
              background: 'rgba(0,0,0,0.5)',
              position: 'relative',
              zIndex: 3,
            }}>
              {targetImage ? (
                <img
                  src={targetImage}
                  alt="Crushed NFT"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  crossOrigin="anonymous"
                />
              ) : (
                <div style={{
                  width: '100%', height: '100%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 36, opacity: 0.25,
                }}>
                  🎯
                </div>
              )}

              {/* CRUSHED stamp */}
              <div style={{
                position: 'absolute', inset: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(0,0,0,0.2)',
              }}>
                <div style={{
                  border: '2.5px solid #ef4444',
                  borderRadius: 6,
                  padding: '5px 16px',
                  fontSize: 18,
                  fontWeight: 900,
                  color: '#ef4444',
                  letterSpacing: '0.18em',
                  transform: 'rotate(-14deg)',
                  opacity: 0.92,
                  textShadow: '0 0 12px rgba(239,68,68,0.5)',
                  fontFamily: font,
                }}>
                  CRUSHED
                </div>
              </div>
            </div>

            </div> {/* close position: relative wrapper */}

          {/* ── DIVIDER ── */}
          <div style={{
            height: 1,
            background: 'linear-gradient(90deg, transparent, rgba(239,68,68,0.18), transparent)',
            marginBottom: 16,
          }} />

            {/* ── STATS ── */}
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <div style={{
                fontSize: 9, letterSpacing: '0.42em',
                color: '#3a6898', fontWeight: 700,
                textTransform: 'uppercase',
                marginBottom: 8,
              }}>
                Total Crushes
              </div>
              {/* Number + badge — both aligned to center baseline */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
              }}>
                <span style={{
                  fontSize: 28,
                  fontWeight: 900,
                  color: '#ffffff',
                  lineHeight: 1,
                }}>
                  {totalCrushes.toLocaleString()}
                </span>
                <span style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: '#1aaa55',
                  background: 'rgba(26,170,85,0.12)',
                  border: '1px solid rgba(26,170,85,0.28)',
                  borderRadius: 99,
                  padding: '3px 10px',
                  lineHeight: 1,
                  display: 'inline-flex',
                  alignItems: 'center',
                }}>
                  +{pointsGained}
                </span>
              </div>
            </div>

            {/* ── DIVIDER ── */}
            <div style={{
              height: 1,
              background: 'linear-gradient(90deg, transparent, rgba(239,68,68,0.15), transparent)',
              marginBottom: 14,
            }} />

            {/* ── FOOTER ── */}
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: 12, color: '#7a9abf',
                lineHeight: 1.6, fontWeight: 400,
                marginBottom: 6,
              }}>
                I just crushed a scam on Scam Crusher 🔥
              </div>
              <div style={{
                fontSize: 10, letterSpacing: '0.28em',
                color: '#7699da',
                textTransform: 'uppercase',
              }}>
                scam-crusher.vercel.app
              </div>
            </div>

          </div>
        </div>

        {/* ── ACTION BUTTONS ── */}
        <div style={{
          display: 'flex', gap: 10,
          width: '100%',
        }}>
          <button
            onClick={handleDownload}
            disabled={capturing}
            style={{
              flex: 1, height: 42,
              border: '1px solid rgba(74,158,255,0.3)',
              borderRadius: 10,
              background: 'rgba(74,158,255,0.08)',
              color: '#4a9eff',
              fontSize: 9, letterSpacing: '0.3em',
              fontFamily: font, fontWeight: 700,
              cursor: capturing ? 'not-allowed' : 'pointer',
              textTransform: 'uppercase' as const,
            }}
          >
            {capturing ? '...' : '↓ Save'}
          </button>

          <button
            onClick={async () => {
              const dataUrl = await capture()
              if (dataUrl) {
                const a = document.createElement('a')
                a.href = dataUrl
                a.download = `crush-receipt-${totalCrushes}.png`
                a.click()
              }
              const text = encodeURIComponent(
                `I just crushed a scam on Scam Crusher 🔥\n${totalCrushes} total crushes (+${pointsGained} this crush)\n\nJoin the cause →`
              )
              const url = encodeURIComponent('https://scam-crusher.vercel.app')
              window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank')
            }}
            disabled={capturing}
            style={{
              flex: 2, height: 42,
              border: 'none', borderRadius: 10,
              background: capturing ? 'rgba(20,30,50,0.8)' : '#000000',
              color: capturing ? '#2a4a7f' : '#ffffff',
              fontSize: 9, letterSpacing: '0.3em',
              fontFamily: font, fontWeight: 700,
              cursor: capturing ? 'not-allowed' : 'pointer',
              textTransform: 'uppercase' as const,
              display: 'flex', alignItems: 'center',
              justifyContent: 'center', gap: 8,
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.259 5.631L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
            {capturing ? '...' : 'Save & Share on X'}
          </button>
        </div>

        {/* Close */}
        <button
          onClick={onClose}
          style={{
            background: 'none', border: 'none',
            color: '#2a4a7f', fontSize: 10,
            letterSpacing: '0.22em', cursor: 'pointer',
            fontFamily: font, textTransform: 'uppercase' as const,
          }}
        >
          Close
        </button>

      </div>
    </>
  )
}