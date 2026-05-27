import TopThree from './Topthree'
import LeaderTable from './LeaderTable'

type LeaderboardProps = {
  account: any
  leaderboard: any[]
  lbLoading: boolean
  loadLeaderboard: () => void
}

const font = "'DM Sans', 'Syne', system-ui, sans-serif"

export default function Board({ account, leaderboard, lbLoading, loadLeaderboard }: LeaderboardProps) {
  const myAddr = account?.address ?? ''
  const top3 = leaderboard.slice(0, 3)

  return (
    // Full-width page fill — matches your App.tsx root background
    <div style={{
      width: '100%',
      minHeight: '100vh',
      background: '#050f23',
      paddingBottom: 'calc(64px + env(safe-area-inset-bottom, 0px) + 24px)',
    }}>
      {/* Centered content column */}
      <div style={{
        maxWidth: 860,
        margin: '0 auto',
        padding: '60px 20px 24px',
        color: '#e8f0ff',
        fontFamily: font,
      }}>

        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#141f33',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 12,
          padding: '10px 16px',
          marginBottom: 24,
          maxWidth: 860,
          margin: '0 auto 24px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
            <p style={{ fontSize: 11, letterSpacing: 6, color: '#4a9eff', margin: 0, textTransform: 'uppercase', fontFamily: font }}>
              Leaderboard
            </p>
            <span style={{
              fontSize: 10, letterSpacing: 2, color: '#4a9eff',
              background: 'rgba(74,158,255,0.08)', padding: '3px 12px',
              borderRadius: 20, border: '1px solid rgba(74,158,255,0.2)',
            }}>
              Season 1
            </span>
          </div>
          <p style={{ fontSize: 10, letterSpacing: 2, color: '#5a7399', margin: 0, textTransform: 'uppercase', fontFamily: font, position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
            Top Crushers
          </p>
          <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}></div>
            <button
            onClick={loadLeaderboard}
            style={{
              border: '1px solid rgba(255,255,255,0.12)',
              background: 'transparent',
              color: '#4a9eff',
              padding: '7px 22px',
              fontSize: 10,
              letterSpacing: 3,
              cursor: 'pointer',
              borderRadius: 8,
              fontFamily: font,
              fontWeight: 600,
              textTransform: 'uppercase',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            {lbLoading ? '...' : '↻ Reload'}
          </button>
        </div>

        {!lbLoading && (
          <>
            <TopThree top3={top3} />
            <LeaderTable leaderboard={leaderboard} myAddr={myAddr} />
          </>
        )}
      </div>
    </div>
  )
}