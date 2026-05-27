import { useState, useEffect } from 'react'
import { useSuiClient } from '@mysten/dapp-kit'

const NFT_PACKAGE_ID = '0x69d9f09680a1af2a441c2b69fb868cdec6bd0636ab607db13f4642be0d8eb04c'

const rarityConfig: Record<string, { bg: string; color: string; border: string; glow: string; label: string }> = {
  COMMON: {
    bg: 'linear-gradient(135deg, rgba(239,68,68,0.15) 0%, rgba(239,68,68,0.05) 100%)',
    color: '#ef4444',
    border: 'rgba(239,68,68,0.30)',
    glow: 'rgba(239,68,68,0.20)',
    label: 'Common',
  },
  RARE: {
    bg: 'linear-gradient(135deg, rgba(74,158,255,0.18) 0%, rgba(74,158,255,0.06) 100%)',
    color: '#4a9eff',
    border: 'rgba(74,158,255,0.35)',
    glow: 'rgba(74,158,255,0.25)',
    label: 'Rare',
  },
  EPIC: {
    bg: 'linear-gradient(135deg, rgba(168,85,247,0.18) 0%, rgba(168,85,247,0.06) 100%)',
    color: '#a855f7',
    border: 'rgba(168,85,247,0.35)',
    glow: 'rgba(168,85,247,0.25)',
    label: 'Epic',
  },
  LEGEND: {
    bg: 'linear-gradient(135deg, rgba(245,200,66,0.20) 0%, rgba(245,200,66,0.06) 100%)',
    color: '#f5c842',
    border: 'rgba(245,200,66,0.40)',
    glow: 'rgba(245,200,66,0.30)',
    label: 'Legend',
  },
}

type RawEntry = {
  target_id: string
  rarity: string
  crush_count: number
  timestamp: string
  tx_digest: string
  crusher_nft_id: string
}

type EnrichedEntry = RawEntry & {
  image_url: string | null
  nft_name: string | null
  collection: string | null
  serial: string | null
  enriched: boolean
}

type Props = {
  owner: string
  onClose: () => void
}

const sa = (a: string) => (a ? a.slice(0, 6) + '...' + a.slice(-4) : '')
const font = "'DM Sans', 'Syne', system-ui, sans-serif"

const SUISCAN = 'https://suiscan.xyz/testnet'

async function recoverBurnedNFT(
  client: any,
  targetId: string,
  _txDigest: string
): Promise<{ image_url: string | null; nft_name: string | null; collection: string | null; serial: string | null }> {
  const empty = { image_url: null, nft_name: null, collection: null, serial: null }
  try {
    const obj = await client.getObject({
  id: targetId,
  options: { showDisplay: true, showContent: true },
})
const display = obj.data?.display?.data ?? {}
const fields = obj.data?.content?.fields ?? {}
return {
  image_url: display.image_url ?? fields.image_url ?? null,
  nft_name: display.name ?? fields.name ?? null,
  collection: display.project_name ?? display.collection ?? fields.collection ?? null,
  serial: fields.serial !== undefined ? String(fields.serial) : fields.name ?? null,
}
  } catch {
    return empty
  }
}

// Format timestamp nicely
function formatTs(ts: string): { date: string; time: string } {
  try {
    const d = new Date(ts)
    const date = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    const time = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
    return { date, time }
  } catch {
    return { date: '—', time: '—' }
  }
}

// Individual NFT card component
function CrushCard({ entry }: { entry: EnrichedEntry }) {
  const rarity = rarityConfig[entry.rarity] ?? rarityConfig.COMMON
  const { date, time } = formatTs(entry.timestamp)
  const [imgError, setImgError] = useState(false)

  return (
    <div
      style={{
        background: '#0d1829',
        border: `1px solid ${rarity.border}`,
        borderRadius: 14,
        overflow: 'hidden',
        marginBottom: 16,
        boxShadow: `0 0 24px ${rarity.glow}, 0 2px 8px rgba(0,0,0,0.4)`,
        transition: 'box-shadow 0.2s ease',
        fontFamily: font,
      }}
    >
      {/* Top section: image + metadata side by side */}
      <div style={{ display: 'flex', gap: 0 }}>

        {/* Image panel */}
        <div
          style={{
            width: 120,
            minWidth: 120,
            background: rarity.bg,
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 120,
            flexShrink: 0,
          }}
        >
          {/* Rarity pill overlaid on image */}
          <div
            style={{
              position: 'absolute',
              top: 8,
              left: 8,
              background: 'rgba(5,15,35,0.85)',
              border: `1px solid ${rarity.border}`,
              borderRadius: 20,
              padding: '3px 9px',
              fontSize: 8,
              fontWeight: 700,
              letterSpacing: 2,
              color: rarity.color,
              textTransform: 'uppercase',
              zIndex: 2,
              backdropFilter: 'blur(4px)',
            }}
          >
            {rarity.label}
          </div>

          {entry.image_url && !imgError ? (
            <img
              src={entry.image_url}
              alt={entry.nft_name ?? 'NFT'}
              onError={() => setImgError(true)}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
                minHeight: 120,
              }}
            />
          ) : (
            /* Placeholder when image is unavailable */
            <div
              style={{
                width: '100%',
                height: 120,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 4,
              }}
            >
              <div style={{ fontSize: 28, opacity: 0.3 }}>💀</div>
              <div style={{ fontSize: 8, color: '#3a5070', letterSpacing: 1, textTransform: 'uppercase' }}>
                Burned
              </div>
            </div>
          )}
        </div>

        {/* Metadata panel */}
        <div
          style={{
            flex: 1,
            padding: '14px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
            minWidth: 0,
          }}
        >
          {/* NFT Name */}
          <div
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: '#e8f0ff',
              letterSpacing: 0.3,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {entry.nft_name ?? (
              <span style={{ color: '#3a5070', fontStyle: 'italic', fontSize: 13 }}>Name not available</span>
            )}
          </div>

          {/* Collection */}
          {entry.collection && (
            <div style={{ fontSize: 11, color: '#5a7399', letterSpacing: 0.5 }}>
              {entry.collection}
            </div>
          )}

          {/* Chips row: serial + crush count */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 2 }}>
            {entry.serial && (
              <span
                style={{
                  fontSize: 10,
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.10)',
                  color: '#8aafcc',
                  borderRadius: 6,
                  padding: '3px 9px',
                  letterSpacing: 0.5,
                  fontWeight: 600,
                }}
              >
                Serial #{entry.serial}
              </span>
            )}
            <span
              style={{
                fontSize: 10,
                background: 'rgba(239,68,68,0.10)',
                border: '1px solid rgba(239,68,68,0.20)',
                color: '#ef4444',
                borderRadius: 6,
                padding: '3px 9px',
                letterSpacing: 0.5,
                fontWeight: 700,
              }}
            >
              Crush ×{entry.crush_count}
            </span>
          </div>

          {/* CRUSHED label + timestamp */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: 'auto',
              paddingTop: 6,
            }}
          >
            <span
              style={{
                fontSize: 8,
                fontWeight: 700,
                letterSpacing: 3,
                color: '#ef4444',
                textTransform: 'uppercase',
              }}
            >
              ✦ Crushed
            </span>
            <span style={{ fontSize: 10, color: '#3a5070' }}>
              {date} · {time}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom action bar */}
      <div
        style={{
          borderTop: `1px solid rgba(255,255,255,0.06)`,
          display: 'flex',
          gap: 0,
        }}
      >
        {/* View Transaction */}
        <a
          href={`${SUISCAN}/tx/${entry.tx_digest}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            padding: '10px 12px',
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: 2,
            color: '#4a9eff',
            textDecoration: 'none',
            textTransform: 'uppercase',
            background: 'rgba(74,158,255,0.04)',
            borderRight: '1px solid rgba(255,255,255,0.06)',
            transition: 'background 0.15s ease',
            fontFamily: font,
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(74,158,255,0.10)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(74,158,255,0.04)')}
        >
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
          View Tx
        </a>

        {/* View NFT On-Chain */}
        <a
          href={`${SUISCAN}/object/${entry.target_id}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            padding: '10px 12px',
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: 2,
            color: rarity.color,
            textDecoration: 'none',
            textTransform: 'uppercase',
            background: `rgba(0,0,0,0.0)`,
            transition: 'background 0.15s ease',
            fontFamily: font,
          }}
          onMouseEnter={e => (e.currentTarget.style.background = `${rarity.glow}`)}
          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.0)')}
        >
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
          View NFT
        </a>
      </div>
    </div>
  )
}

// Skeleton loader card
function SkeletonCard() {
  return (
    <div
      style={{
        background: '#0d1829',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 14,
        overflow: 'hidden',
        marginBottom: 16,
        display: 'flex',
        height: 120,
      }}
    >
      <div style={{ width: 120, background: 'rgba(255,255,255,0.04)', animation: 'pulse 1.5s ease-in-out infinite' }} />
      <div style={{ flex: 1, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ height: 14, width: '60%', background: 'rgba(255,255,255,0.06)', borderRadius: 6 }} />
        <div style={{ height: 10, width: '40%', background: 'rgba(255,255,255,0.04)', borderRadius: 6 }} />
        <div style={{ display: 'flex', gap: 6 }}>
          <div style={{ height: 22, width: 70, background: 'rgba(255,255,255,0.04)', borderRadius: 6 }} />
          <div style={{ height: 22, width: 60, background: 'rgba(255,255,255,0.04)', borderRadius: 6 }} />
        </div>
      </div>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>
    </div>
  )
}

export default function CrushModal({ owner, onClose }: Props) {
  const client = useSuiClient()
  const [entries, setEntries] = useState<EnrichedEntry[]>([])
  const [loading, setLoading] = useState(true)
  // track per-entry enrichment status separately so cards render as they enrich
  const [enrichCount, setEnrichCount] = useState(0)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setEntries([])
      setEnrichCount(0)

      try {
        // ── Step 1: collect raw events ──────────────────────────────────────
        const raw: RawEntry[] = []
        let cursor: string | undefined = undefined
        let hasNext = true

        while (hasNext) {
          const res: any = await client.queryEvents({
            query: { MoveEventType: `${NFT_PACKAGE_ID}::crusher::CrushEvent` },
            cursor: cursor as any,
            limit: 50,
          })

          for (const ev of res.data) {
            const j = ev.parsedJson as any
            if (!j?.target_id || j.crusher !== owner) continue
            raw.push({
              target_id: j.target_id,
              rarity: (j.rarity ?? 'COMMON').toUpperCase(),
              crush_count: Number(j.crush_count),
              timestamp: ev.timestampMs
                ? new Date(Number(ev.timestampMs)).toISOString()
                : new Date().toISOString(),
              tx_digest: ev.id?.txDigest ?? '',
              crusher_nft_id: j.nft_id ?? '',
            })
          }

          hasNext = res.hasNextPage
          cursor = res.nextCursor
        }

        // Most recent first
        raw.reverse()

        // ── Step 2: seed entries with un-enriched state, show cards immediately
        const seeded: EnrichedEntry[] = raw.map(r => ({
          ...r,
          image_url: null,
          nft_name: null,
          collection: null,
          serial: null,
          enriched: false,
        }))
        setEntries(seeded)
        setLoading(false)

        // ── Step 3: enrich each entry one by one (non-blocking)
        for (let i = 0; i < raw.length; i++) {
          const r = raw[i]
          if (!r.tx_digest) continue

          const meta = await recoverBurnedNFT(client, r.target_id, r.tx_digest)

          setEntries(prev => {
            const next = [...prev]
            next[i] = { ...next[i], ...meta, enriched: true }
            return next
          })
          setEnrichCount(c => c + 1)
        }
      } catch (e) {
        console.error(e)
        setLoading(false)
      }
    }

    load()
  }, [owner])

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.80)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        backdropFilter: 'blur(6px)',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#080f1e',
          border: '1px solid rgba(255,255,255,0.09)',
          borderRadius: 18,
          width: 520,
          maxWidth: '95vw',
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
          fontFamily: font,
          overflow: 'hidden',
          boxShadow: '0 32px 80px rgba(0,0,0,0.7)',
        }}
      >
        {/* ── Header ── */}
        <div
          style={{
            padding: '20px 24px 18px',
            borderBottom: '1px solid rgba(255,255,255,0.07)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexShrink: 0,
          }}
        >
          <div>
            <p
              style={{
                fontSize: 9,
                letterSpacing: 4,
                color: '#ef4444',
                margin: '0 0 5px',
                textTransform: 'uppercase',
                fontWeight: 700,
              }}
            >
              ✦ Crush History
            </p>
            <p style={{ fontSize: 13, color: '#4a9eff', margin: 0, letterSpacing: 1 }}>
              {sa(owner)}
            </p>
            {!loading && entries.length > 0 && (
              <p style={{ fontSize: 10, color: '#3a5070', margin: '4px 0 0', letterSpacing: 0.5 }}>
                {entries.length} crush{entries.length !== 1 ? 'es' : ''} found
                {enrichCount < entries.length && (
                  <span style={{ color: '#4a9eff', marginLeft: 8 }}>
                    · loading metadata ({enrichCount}/{entries.length})
                  </span>
                )}
              </p>
            )}
          </div>

          <button
            onClick={onClose}
            style={{
              background: '#141f33',
              border: '1px solid rgba(255,255,255,0.10)',
              color: '#a8b8cc',
              cursor: 'pointer',
              padding: '7px 18px',
              borderRadius: 8,
              fontSize: 9,
              fontFamily: font,
              fontWeight: 700,
              letterSpacing: 2,
              textTransform: 'uppercase',
              flexShrink: 0,
            }}
          >
            Close
          </button>
        </div>

        {/* ── Scrollable card list ── */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '20px 20px 8px',
            scrollbarWidth: 'thin',
            scrollbarColor: '#1a2d4a transparent',
          }}
        >
          {/* Initial full load spinner */}
          {loading && (
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          )}

          {/* Empty state */}
          {!loading && entries.length === 0 && (
            <div
              style={{
                textAlign: 'center',
                padding: '60px 20px',
                color: '#3a5070',
                fontSize: 13,
              }}
            >
              <div style={{ fontSize: 36, marginBottom: 12, opacity: 0.4 }}>💀</div>
              No crushes found for this wallet.
            </div>
          )}

          {/* Cards */}
          {!loading && entries.map((entry, i) => (
            <CrushCard key={i} entry={entry} />
          ))}
        </div>
      </div>
    </div>
  )
}