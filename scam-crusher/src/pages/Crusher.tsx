import { useState } from 'react'
type CrusherProps = {
  account: any
  nfts: any[]
  objects: any[]
  selectedTargets: Set<string>
  toggleTarget: (id: string) => void
  crush: () => void
  canCrush: boolean
  siteActive: boolean
  crushFee: number
  loading: boolean
  loadAssets: () => void
  status: string

  objectPage: number
  setObjectPage: (fn: (p: number) => number) => void

  nftPage: number
  setNftPage: (fn: (p: number) => number) => void

  getImage: (obj: any) => string | null
}

const SUISCAN = 'https://suiscan.xyz/testnet'
const font = "'DM Sans', 'Syne', system-ui, sans-serif"

const rarityConfig: Record<string, { color: string; border: string; glow: string; bg: string }> = {
  COMMON: { color: '#ef4444', border: 'rgba(239,68,68,0.35)',  glow: 'rgba(239,68,68,0.15)',  bg: 'rgba(239,68,68,0.10)'  },
  RARE:   { color: '#4a9eff', border: 'rgba(74,158,255,0.40)', glow: 'rgba(74,158,255,0.15)', bg: 'rgba(74,158,255,0.10)' },
  EPIC:   { color: '#a855f7', border: 'rgba(168,85,247,0.40)', glow: 'rgba(168,85,247,0.15)', bg: 'rgba(168,85,247,0.10)' },
  LEGEND: { color: '#f5c842', border: 'rgba(245,200,66,0.45)', glow: 'rgba(245,200,66,0.20)', bg: 'rgba(245,200,66,0.10)' },
}

function NFTCard({
  image,
  name,
  subLabel,
  chips,
  rarity,
  selected,
  selectedColor,
  selectedGlow,
  objectId,
  onClick,
  placeholder,
}: {
  image: string | null
  name: string
  subLabel: string
  chips: { label: string; style: 'serial' | 'crush' | 'type' }[]
  rarity?: string
  selected: boolean
  selectedColor: string
  selectedGlow: string
  objectId: string
  onClick: () => void
  placeholder?: string
}) {
  const [imgError, setImgError] = useState(false)
  const rc = rarity ? (rarityConfig[rarity] ?? rarityConfig.COMMON) : null

  return (
    <div
      onClick={onClick}
      style={{
        background: '#0d1829',
        borderRadius: 14,
        overflow: 'hidden',
        border: selected
          ? `1px solid ${selectedColor}`
          : '1px solid rgba(255,255,255,0.08)',
        boxShadow: selected ? `0 0 16px ${selectedGlow}` : 'none',
        cursor: 'pointer',
        transition: 'border-color 0.15s, box-shadow 0.15s',
        fontFamily: font,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Image */}
      <div style={{
        position: 'relative',
        width: '100%',
        aspectRatio: '1/1',
        background: rc
          ? `linear-gradient(135deg, ${rc.bg}, rgba(5,15,35,0.8))`
          : 'rgba(255,255,255,0.03)',
        overflow: 'hidden',
        flexShrink: 0,
      }}>
        {image && !imgError ? (
          <img
            src={image}
            alt={name}
            onError={() => setImgError(true)}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        ) : (
          <div style={{
            width: '100%', height: '100%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 36, opacity: 0.3,
          }}>
            {placeholder ?? '🖼'}
          </div>
        )}

        {/* Rarity pill */}
        {rarity && rc && (
          <div style={{
            position: 'absolute', top: 8, left: 8,
            background: 'rgba(5,15,35,0.80)',
            border: `1px solid ${rc.border}`,
            borderRadius: 99, padding: '3px 9px',
            fontSize: 8, fontWeight: 700, letterSpacing: 2,
            color: rc.color, textTransform: 'uppercase',
            backdropFilter: 'blur(4px)',
          }}>
            {rarity}
          </div>
        )}

        {/* Check badge */}
        <div style={{
          position: 'absolute', top: 8, right: 8,
          width: 24, height: 24, borderRadius: '50%',
          background: selected ? `${selectedColor}33` : 'rgba(255,255,255,0.07)',
          border: `1px solid ${selected ? selectedColor : 'rgba(255,255,255,0.15)'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 11, color: selected ? selectedColor : '#3a5070',
          fontWeight: 700,
        }}>
          {selected ? '✓' : '○'}
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '10px 12px 0', flex: 1 }}>
        <div style={{
          fontSize: 13, fontWeight: 700, color: '#e8f0ff',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          marginBottom: 3,
        }}>
          {name}
        </div>
        <div style={{
          fontSize: 10, color: '#5a7399', marginBottom: 8,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {subLabel}
        </div>
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 10 }}>
          {chips.map((c, i) => (
            <span key={i} style={{
              fontSize: 9, fontWeight: 700, padding: '3px 8px', borderRadius: 6,
              letterSpacing: 0.5,
              ...(c.style === 'crush'
                ? { background: 'rgba(239,68,68,0.12)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }
                : { background: 'rgba(255,255,255,0.06)', color: '#8aafcc', border: '1px solid rgba(255,255,255,0.10)' }
              ),
            }}>
              {c.label}
            </span>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <a
          href={`${SUISCAN}/object/${objectId}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={e => e.stopPropagation()}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
            padding: '8px', fontSize: 9, fontWeight: 700, letterSpacing: 2,
            color: '#4a9eff', textDecoration: 'none', textTransform: 'uppercase',
            fontFamily: font,
          }}
        >
          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
            <polyline points="15 3 21 3 21 9"/>
            <line x1="10" y1="14" x2="21" y2="3"/>
          </svg>
          View On-Chain
        </a>
      </div>
    </div>
  )
}

export default function Crusher({
  account,
  nfts,
  objects,
  selectedTargets,
  toggleTarget,
  crush,
  canCrush,
  siteActive: _siteActive,
  crushFee,
  loading,
  loadAssets,
  status,

  objectPage,
  setObjectPage,

  nftPage,
  setNftPage,

  getImage
}: CrusherProps) {
  if (!account) {
    return (
      <div style={{
        paddingTop: 120, textAlign: 'center', color: '#4a6fa5',
        fontFamily: font,
      }}>
        <p style={{ fontSize: 13, letterSpacing: 4 }}>CONNECT YOUR WALLET TO BEGIN</p>
      </div>
    )
  }

  const totalCrush = nfts.reduce(
  (s: number, n: any) =>
    s + Number(n.data.content?.fields?.crush_count ?? 0),
  0
)

const pageCount = Math.ceil(objects.length / 20)

const sortedNFTs = [...nfts].sort(
  (a, b) =>
    Number(b.data.content?.fields?.crush_count ?? 0) -
    Number(a.data.content?.fields?.crush_count ?? 0)
)

const nftPageCount = Math.ceil(sortedNFTs.length / 2)

  return (
    <>
    <style>{`
      @media (max-width: 768px) {
        .targets-grid { grid-template-columns: repeat(2, minmax(0,1fr)) !important; }
        .crusher-layout { grid-template-columns: 1fr !important; }
        .crusher-sticky { position: static !important; }
        .crusher-root { padding-top: 16px !important; }
      }
    `}</style>
    <div className="crusher-root" style={{
      paddingTop: 70,
      paddingBottom: 100,
      maxWidth: 1400,
      margin: '0 auto',
      padding: '70px 14px 100px',
      color: '#e8f0ff',
      fontFamily: font,
    }}>

      {/* Load Assets */}
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <button
          onClick={loadAssets}
          style={{
            border: '1px solid rgba(74,158,255,0.3)',
            background: 'rgba(74,158,255,0.08)',
            color: '#4a9eff',
            padding: '10px 32px',
            fontSize: 10,
            letterSpacing: 3,
            cursor: 'pointer',
            borderRadius: 8,
            fontFamily: font,
            fontWeight: 700,
            textTransform: 'uppercase',
          }}
        >
          {loading ? 'Loading...' : '↻ Load Assets'}
        </button>
      </div>

      {/* ── YOUR CRUSHER NFTS ── */}
      <div className="crusher-layout" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24, alignItems: 'start', marginBottom: 24 }}>

      {/* ── YOUR CRUSHER NFTS ── */}
      <div className="crusher-sticky" style={{ marginBottom: 0, position: 'sticky', top: 80, alignSelf: 'start' }}>
        {/* Section header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: 14, paddingBottom: 10,
          borderBottom: '1px solid rgba(74,158,255,0.15)',
        }}>
          <span style={{ fontSize: 10, letterSpacing: 4, color: '#4a9eff', fontWeight: 700, textTransform: 'uppercase' }}>
            Your Crusher NFT
          </span>
          <span style={{
            fontSize: 10, color: '#5a7399', letterSpacing: 1,
            background: 'rgba(255,255,255,0.05)', padding: '3px 10px',
            borderRadius: 99, border: '1px solid rgba(255,255,255,0.08)',
          }}>
            Total Crush: <strong style={{ color: '#e8f0ff' }}>{totalCrush}</strong>
          </span>
        </div>

        {nfts.length === 0 && (
          <p style={{ fontSize: 12, color: '#3a5070', textAlign: 'center', padding: '24px 0' }}>
            No NFTs found. Load assets first.
          </p>
        )}

        {sortedNFTs.length > 2 && (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      marginBottom: 14,
    }}
  >
    <button
      onClick={() => setNftPage(p => Math.max(0, p - 1))}
      disabled={nftPage === 0}
      style={{
        padding: '5px 14px',
        background: 'rgba(255,255,255,0.05)',
        color: nftPage === 0 ? '#2a4a7f' : '#7ab3ff',
        border: '1px solid rgba(255,255,255,0.10)',
        borderRadius: 6,
        cursor: nftPage === 0 ? 'not-allowed' : 'pointer',
      }}
    >
      {'‹'}
    </button>

    <span style={{ fontSize: 10, color: '#5a7399' }}>
      {nftPage * 2 + 1}–
      {Math.min(nftPage * 2 + 2, sortedNFTs.length)}
      {' / '}
      {sortedNFTs.length}
    </span>

    <button
      onClick={() =>
        setNftPage(p => Math.min(nftPageCount - 1, p + 1))
      }
      disabled={nftPage >= nftPageCount - 1}
      style={{
        padding: '5px 14px',
        background: 'rgba(255,255,255,0.05)',
        color:
          nftPage >= nftPageCount - 1
            ? '#2a4a7f'
            : '#7ab3ff',
        border: '1px solid rgba(255,255,255,0.10)',
        borderRadius: 6,
        cursor:
          nftPage >= nftPageCount - 1
            ? 'not-allowed'
            : 'pointer',
      }}
    >
      {'›'}
    </button>
  </div>
)}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0,1fr))', gap: 12 }}>
                    {sortedNFTs
            .slice(nftPage * 2, nftPage * 2 + 2)
            .map((n: any) => {
            const rarity = (n.data.content?.fields?.rarity ?? 'COMMON').toUpperCase()
            const serial = n.data.content?.fields?.serial
            const crushCount = n.data.content?.fields?.crush_count ?? 0
            return (
              <NFTCard
                key={n.data.objectId}
                image={getImage(n)}
                name={`Scam Crusher #${serial}`}
                subLabel="Scam Crusher Collection"
                chips={[
                  { label: `#${serial}`, style: 'serial' },
                  { label: `Crush ×${crushCount}`, style: 'crush' },
                ]}
                rarity={rarity}
                selected={false}
                selectedColor={rarityConfig[rarity]?.color ?? '#4a9eff'}
                selectedGlow={rarityConfig[rarity]?.glow ?? 'rgba(74,158,255,0.2)'}
                objectId={n.data.objectId}
                onClick={() => {}}
              />
            )
          })}
        </div>
      </div>

      {/* ── SELECT TARGETS ── */}
      <div style={{ marginBottom: 24 }}>
        {/* Section header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: 14, paddingBottom: 10,
          borderBottom: '1px solid rgba(239,68,68,0.20)',
        }}>
          <span style={{ fontSize: 10, letterSpacing: 4, color: '#ef4444', fontWeight: 700, textTransform: 'uppercase' }}>
            Select Targets
          </span>
          {selectedTargets.size > 0 && (
            <span style={{
              fontSize: 10, background: 'rgba(239,68,68,0.12)', color: '#ef4444',
              padding: '3px 10px', borderRadius: 99, border: '1px solid rgba(239,68,68,0.25)',
              fontWeight: 700,
            }}>
              {selectedTargets.size} selected
            </span>
          )}
        </div>

        {/* Pagination */}
        {objects.length > 20 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, justifyContent: 'center' }}>
            <button
              onClick={() => setObjectPage(p => Math.max(0, p - 1))}
              disabled={objectPage === 0}
              style={{
                padding: '5px 14px', background: 'rgba(255,255,255,0.05)',
                color: objectPage === 0 ? '#2a4a7f' : '#7ab3ff',
                border: '1px solid rgba(255,255,255,0.10)', cursor: objectPage === 0 ? 'not-allowed' : 'pointer',
                borderRadius: 6, fontFamily: font, fontSize: 12,
              }}
            >{'‹'}</button>
            <span style={{ fontSize: 10, color: '#5a7399', letterSpacing: 1 }}>
              {objectPage * 20 + 1}–{Math.min(objectPage * 20 + 20, objects.length)} / {objects.length}
            </span>
            <button
              onClick={() => setObjectPage(p => Math.min(pageCount - 1, p + 1))}
              disabled={objectPage >= pageCount - 1}
              style={{
                padding: '5px 14px', background: 'rgba(255,255,255,0.05)',
                color: objectPage >= pageCount - 1 ? '#2a4a7f' : '#7ab3ff',
                border: '1px solid rgba(255,255,255,0.10)', cursor: objectPage >= pageCount - 1 ? 'not-allowed' : 'pointer',
                borderRadius: 6, fontFamily: font, fontSize: 12,
              }}
            >{'›'}</button>
          </div>
        )}

        {objects.length === 0 && (
          <p style={{ fontSize: 12, color: '#3a5070', textAlign: 'center', padding: '24px 0' }}>
            No targets found.
          </p>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: 12 }} className="targets-grid">
          {objects.slice(objectPage * 20, objectPage * 20 + 20).map((o: any) => {
            const selected = selectedTargets.has(o.data.objectId)
            const typeName = o.data.type?.split('::').pop() ?? 'Object'
            const shortId = o.data.objectId.slice(0, 6) + '...' + o.data.objectId.slice(-4)
            return (
              <NFTCard
                key={o.data.objectId}
                image={getImage(o)}
                name={typeName}
                subLabel={shortId}
                chips={[
                  { label: typeName, style: 'type' },
                ]}
                selected={selected}
                selectedColor="#ef4444"
                selectedGlow="rgba(239,68,68,0.20)"
                objectId={o.data.objectId}
                onClick={() => toggleTarget(o.data.objectId)}
                placeholder="🎯"
              />
            )
          })}
        </div>
      </div>

      </div>{/* end two-col grid */}

      {/* ── FAB: CRUSH BUTTON ── */}
      <div style={{
        position: 'fixed',
        bottom: 75,           // sits above the bottom navbar on mobile
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
        width: 'max-content',
        maxWidth: 'calc(100vw - 32px)',
        pointerEvents: 'none',
      }}>
        {status && (
          <div style={{
            fontSize: 10, letterSpacing: 2, padding: '6px 14px',
            borderRadius: 99, backdropFilter: 'blur(8px)',
            background: status.startsWith('ERROR')
              ? 'rgba(239,68,68,0.15)' : 'rgba(74,158,255,0.12)',
            border: `1px solid ${status.startsWith('ERROR') ? 'rgba(239,68,68,0.3)' : 'rgba(74,158,255,0.25)'}`,
            color: status.startsWith('ERROR') ? '#ef4444' : '#4a9eff',
            wordBreak: 'break-all', textAlign: 'center',
            fontFamily: font, pointerEvents: 'auto',
          }}>
            {status}
          </div>
        )}
        <button
          onClick={crush}
          disabled={!canCrush}
          style={{
            pointerEvents: 'auto',
            padding: '14px 32px',
            fontSize: 11,
            letterSpacing: 4,
            borderRadius: 99,
            whiteSpace: 'nowrap',
            background: !canCrush
              ? 'rgba(20,30,50,0.85)'
              : 'linear-gradient(90deg, #c0392b, #e74c3c)',
            color: !canCrush ? '#2a4a7f' : '#fff',
            cursor: !canCrush ? 'not-allowed' : 'pointer',
            boxShadow: !canCrush
              ? '0 2px 12px rgba(0,0,0,0.4)'
              : '0 4px 28px rgba(239,68,68,0.50)',
            fontFamily: font,
            fontWeight: 700,
            textTransform: 'uppercase',
            backdropFilter: 'blur(12px)',
            border: !canCrush
              ? '1px solid rgba(255,255,255,0.07)'
              : '1px solid rgba(239,68,68,0.4)',
            transition: 'box-shadow 0.2s, background 0.2s',
          }}
        >
          {canCrush
            ? `✦ Crush (${selectedTargets.size}) — ${(selectedTargets.size * crushFee / 1_000_000_000).toFixed(1)} SUI`
            : '✦ Select a Target'}
        </button>
      </div>

      {status && (
        <p style={{
          textAlign: 'center', fontSize: 10, letterSpacing: 2,
          color: status.startsWith('ERROR') ? '#ef4444' : '#4a9eff',
          marginTop: 14, wordBreak: 'break-all', fontFamily: font,
        }}>
          {status}
        </p>
      )}
      </div>
    </>
  )
}