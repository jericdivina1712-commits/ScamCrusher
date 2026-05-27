import { useEffect, useRef, useState } from 'react'
import { ConnectButton, useCurrentAccount } from '@mysten/dapp-kit'

function useIsDesktop(breakpoint = 768) {
  const [isDesktop, setIsDesktop] = useState(
    () => typeof window !== 'undefined' && window.innerWidth >= breakpoint
  )
  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${breakpoint}px)`)
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [breakpoint])
  return isDesktop
}

type Tab = 'home' | 'crusher' | 'assets' | 'board'

type NavbarProps = {
  tab: Tab
  setTab: (t: Tab) => void
}

const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
  {
    id: 'home',
    label: 'Home',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z"/>
        <path d="M9 21V12h6v9"/>
      </svg>
    ),
  },
  {
    id: 'crusher',
    label: 'Crusher',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9"/>
        <path d="M9 9.5c0-1.1.9-2 2-2h2a2 2 0 0 1 0 4h-2a2 2 0 0 0 0 4h2a2 2 0 0 0 2-2"/>
        <line x1="12" y1="6" x2="12" y2="7.5"/>
        <line x1="12" y1="16.5" x2="12" y2="18"/>
      </svg>
    ),
  },
  {
    id: 'assets',
    label: 'Assets',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2"/>
        <path d="M8 21h8M12 17v4"/>
      </svg>
    ),
  },
  {
    id: 'board',
    label: 'Board',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
      </svg>
    ),
  },
]

// ── Shared glass surface tokens ──────────────────────────────────────────────
const glass: React.CSSProperties = {
  background: 'rgba(8, 18, 40, 0.90)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
}

// ── Desktop top navbar ───────────────────────────────────────────────────────
function TopNav({ tab, setTab }: NavbarProps) {
  const pillRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  // Animate the sliding pill indicator
  useEffect(() => {
    const list = listRef.current
    const pill = pillRef.current
    if (!list || !pill) return

    const activeBtn = list.querySelector<HTMLButtonElement>('[data-active="true"]')
    if (!activeBtn) return

    const listRect = list.getBoundingClientRect()
    const btnRect  = activeBtn.getBoundingClientRect()
    pill.style.left  = `${btnRect.left - listRect.left}px`
    pill.style.width = `${btnRect.width}px`
  }, [tab])

  return (
    <nav
      style={{
        ...glass,
        position: 'fixed',
        top: 0, left: 0, right: 0,
        zIndex: 1000,
        height: 56,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 250px',
        borderBottom: '0.5px solid rgba(74, 111, 165, 0.22)',
      }}
    >
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{
          width: 8, height: 8, borderRadius: '50%',
          background: '#4a9eff', display: 'inline-block',
        }} />
        <span style={{
          fontSize: 14, fontWeight: 500, letterSpacing: '0.06em',
          color: '#e8eaf6', fontFamily: 'Georgia, serif',
        }}>
          APPNAME
        </span>
      </div>

      {/* Tab links */}
      <ul
        ref={listRef}
        style={{
          display: 'flex', alignItems: 'center', gap: 2,
          listStyle: 'none', margin: 0, padding: 0,
          position: 'absolute', left: '50%', transform: 'translateX(-50%)',
        }}
      >
        {/* Sliding pill background */}
        <div
          ref={pillRef}
          style={{
            position: 'absolute',
            top: 4, height: 'calc(100% - 8px)',
            background: 'rgba(74, 158, 255, 0.13)',
            border: '0.5px solid rgba(74, 158, 255, 0.28)',
            borderRadius: 8,
            transition: 'left 0.28s cubic-bezier(.4,0,.2,1), width 0.28s cubic-bezier(.4,0,.2,1)',
            pointerEvents: 'none',
          }}
        />

        {tabs.map(({ id, label, icon }) => {
          const active = tab === id
          return (
            <li key={id}>
              <button
                data-active={active}
                onClick={() => setTab(id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 7,
                  padding: '6px 14px',
                  border: 'none', background: 'transparent',
                  borderRadius: 8, cursor: 'pointer',
                  color: active ? '#7ab3ff' : '#4a6fa5',
                  fontSize: 11, letterSpacing: '0.1em',
                  fontFamily: 'Georgia, serif',
                  fontWeight: active ? 600 : 400,
                  transition: 'color 0.2s',
                  position: 'relative', zIndex: 1,
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={e => {
                  if (!active) (e.currentTarget as HTMLButtonElement).style.color = '#6a90c8'
                }}
                onMouseLeave={e => {
                  if (!active) (e.currentTarget as HTMLButtonElement).style.color = '#4a6fa5'
                }}
              >
                <span style={{ display: 'flex', color: 'currentColor' }}>{icon}</span>
                {label.toUpperCase()}
              </button>
            </li>
          )
        })}
      </ul>

      {/* Wallet — desktop */}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <ConnectButton />
      </div>
    </nav>
  )
}
function WalletAvatar() {
  const account = useCurrentAccount()
  const [modalOpen, setModalOpen] = useState(false)
  const short = account ? account.address.slice(-4).toUpperCase() : null

  useEffect(() => {
    if (!account) setModalOpen(false)
  }, [account])

  return (
    <>
      {/* Avatar button */}
      <div
        onClick={() => setModalOpen(true)}
        style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3, cursor: 'pointer' }}
      >
        <div style={{
          width: 34, height: 34, borderRadius: '50%',
          background: account ? 'rgba(74,158,255,0.15)' : 'rgba(74,111,165,0.15)',
          border: account ? '1px solid rgba(74,158,255,0.35)' : '1px solid rgba(74,111,165,0.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {account
            ? <span style={{ fontSize: 9, fontWeight: 700, color: '#7ab3ff', fontFamily: 'Georgia, serif', letterSpacing: '0.05em' }}>{short}</span>
            : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4a6fa5" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
          }
        </div>
        <span style={{ fontSize: 9, letterSpacing: '0.08em', color: '#4a6fa5', fontFamily: 'Georgia, serif' }}>
          {account ? 'WALLET' : 'CONNECT'}
        </span>
      </div>

      {/* Modal backdrop */}
      {modalOpen && (
        <div
          onClick={() => setModalOpen(false)}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.6)',
            zIndex: 2000,
            backdropFilter: 'blur(4px)',
          }}
        />
      )}

      {/* Modal */}
      {modalOpen && (
        <div style={{
          position: 'fixed',
          bottom: 80, left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 2001,
          background: 'rgba(8,18,40,0.98)',
          border: '0.5px solid rgba(74,158,255,0.25)',
          borderRadius: 16,
          padding: '24px 28px',
          minWidth: 260,
          textAlign: 'center',
          fontFamily: 'Georgia, serif',
        }}>
          {/* Address if connected */}
          {account && (
            <p style={{ fontSize: 10, color: '#4a6fa5', letterSpacing: '0.15em', margin: '0 0 16px', wordBreak: 'break-all' }}>
              {account.address.slice(0, 6)}...{account.address.slice(-6)}
            </p>
          )}

          {/* Close btn */}
          <button
            onClick={() => setModalOpen(false)}
            style={{
              position: 'absolute', top: 12, right: 12,
              width: 28, height: 28,
              border: '0.5px solid rgba(74,111,165,0.3)',
              borderRadius: 6, background: 'transparent',
              color: '#4a6fa5', fontSize: 14, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'Georgia, serif',
            }}
          >✕</button>

          <p style={{ fontSize: 13, color: '#7ab3ff', letterSpacing: '0.2em', margin: '0 0 20px' }}>
            {account ? 'WALLET CONNECTED' : 'CONNECT WALLET'}
          </p>

          {/* ConnectButton hidden but functional */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <ConnectButton />
          </div>
        </div>
      )}
    </>
  )
}
// ── Mobile bottom navbar ─────────────────────────────────────────────────────
function BottomNav({ tab, setTab }: NavbarProps) {
  return (
    <nav
      style={{
        ...glass,
        position: 'fixed',
        bottom: 0, left: 0, right: 0,
        zIndex: 1000,
        height: 64,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        padding: '0 8px',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        borderTop: '0.5px solid rgba(74, 111, 165, 0.22)',
      }}
    >
      {tabs.map(({ id, label, icon }) => {
        const active = tab === id
        return (
          <button
            key={id}
            onClick={() => setTab(id)}
            style={{
              flex: 1,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              gap: 3, border: 'none', background: 'transparent',
              cursor: 'pointer', padding: '6px 0',
              borderRadius: 12, position: 'relative',
            }}
          >
            {/* Icon pill */}
            <div
              style={{
                width: 44, height: 28,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: 14,
                background: active ? 'rgba(74, 158, 255, 0.18)' : 'transparent',
                border: active ? '0.5px solid rgba(74,158,255,0.25)' : '0.5px solid transparent',
                transform: active ? 'translateY(-2px)' : 'none',
                transition: 'background 0.25s, transform 0.22s, border-color 0.25s',
                color: active ? '#7ab3ff' : '#4a6fa5',
              }}
            >
              {icon}
            </div>

            {/* Label */}
            <span style={{
              fontSize: 9, letterSpacing: '0.08em',
              color: active ? '#7ab3ff' : '#4a6fa5',
              fontFamily: 'Georgia, serif',
              transition: 'color 0.2s',
            }}>
              {label.toUpperCase()}
            </span>

            {/* Active dot */}
            <span style={{
              position: 'absolute', bottom: 2,
              width: 4, height: 4, borderRadius: '50%',
              background: '#4a9eff',
              opacity: active ? 1 : 0,
              transform: active ? 'scale(1)' : 'scale(0)',
              transition: 'opacity 0.2s, transform 0.2s',
            }} />
          </button>
         )
      })}

      {/* Wallet avatar — mobile */}
      <WalletAvatar />
    </nav>
  )
}

// ── Responsive wrapper ───────────────────────────────────────────────────────
export default function Navbar({ tab, setTab }: NavbarProps) {
  const isDesktop = useIsDesktop()
  return isDesktop
    ? <TopNav tab={tab} setTab={setTab} />
    : <BottomNav tab={tab} setTab={setTab} />
}