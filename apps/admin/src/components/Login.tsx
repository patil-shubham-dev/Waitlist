import { useState } from 'react'

function getAdminPassword(): string {
  const now = new Date()
  const utcMs = now.getTime() + now.getTimezoneOffset() * 60_000
  const istMs = utcMs + 5.5 * 60 * 60 * 1000
  const ist = new Date(istMs)
  const hh = String(ist.getHours()).padStart(2, '0')
  const mm = String(ist.getMinutes()).padStart(2, '0')
  return `Shubham11#${hh}${mm}`
}

interface Props { onLogin: () => void }

export default function Login({ onLogin }: Props) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(false)
  const [shake, setShake] = useState(false)
  const [focused, setFocused] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError(false)
    await new Promise((r) => setTimeout(r, 380))
    if (password === getAdminPassword()) {
      onLogin()
    } else {
      setError(true); setLoading(false)
      setShake(true)
      setTimeout(() => setShake(false), 500)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24, background: 'var(--bg)', position: 'relative', overflow: 'hidden',
    }}>
      <style>{`
        @keyframes shake {
          0%,100% { transform: translateX(0); }
          15%      { transform: translateX(-8px); }
          30%      { transform: translateX(7px); }
          45%      { transform: translateX(-5px); }
          60%      { transform: translateX(4px); }
          75%      { transform: translateX(-2px); }
        }
        @keyframes login-in {
          from { opacity:0; transform: translateY(20px) scale(0.97); }
          to   { opacity:1; transform: translateY(0) scale(1); }
        }
      `}</style>

      {/* Background orb */}
      <div style={{
        position: 'absolute', top: '30%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 500, height: 400,
        background: 'radial-gradient(ellipse, rgba(255,90,31,0.07) 0%, transparent 65%)',
        pointerEvents: 'none',
      }} />

      <div style={{
        width: '100%', maxWidth: 340,
        animation: 'login-in 0.5s cubic-bezier(0.16,1,0.3,1) both',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 44 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14,
            background: 'var(--accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 18px',
            boxShadow: '0 0 40px var(--accent-glow), 0 4px 20px rgba(0,0,0,0.4)',
          }}>
            <img src="/assets/logo-mark.svg" alt="LifeOS" style={{ width: 34, height: 34 }} />
          </div>
          <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.03em', marginBottom: 5 }}>
            LifeOS Admin
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-faint)', letterSpacing: '0.04em' }}>
            Restricted access
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          style={{
            display: 'flex', flexDirection: 'column', gap: 12,
            animation: shake ? 'shake 0.45s ease' : 'none',
          }}
        >
          <div style={{
            background: focused ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.025)',
            border: `1px solid ${error
              ? 'rgba(248,113,113,0.45)'
              : focused
              ? 'var(--accent-border)'
              : 'var(--border-strong)'}`,
            borderRadius: 11,
            boxShadow: error
              ? '0 0 0 3px rgba(248,113,113,0.08)'
              : focused
              ? '0 0 0 3px var(--accent-dim)'
              : 'none',
            transition: 'all 0.18s',
            overflow: 'hidden',
          }}>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(false) }}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              autoFocus
              style={{
                width: '100%', background: 'transparent',
                border: 'none', outline: 'none',
                padding: '13px 16px',
                color: 'var(--text)', fontSize: 14,
              }}
            />
          </div>

          {error && (
            <p style={{
              fontSize: 12, color: '#f87171', textAlign: 'center',
              animation: 'fade-in-up 0.2s ease',
            }}>
              Incorrect password — try again.
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            style={{
              background: 'var(--accent)', color: '#fff',
              border: 'none', borderRadius: 10,
              padding: '13px', fontSize: 14, fontWeight: 600,
              cursor: loading || !password ? 'not-allowed' : 'pointer',
              opacity: !password ? 0.35 : 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9,
              transition: 'opacity 0.15s, transform 0.15s, box-shadow 0.2s',
              letterSpacing: '-0.01em',
              position: 'relative', overflow: 'hidden',
            }}
            onMouseEnter={(e) => {
              if (!loading && password) {
                e.currentTarget.style.boxShadow = '0 0 0 3px var(--accent-border), 0 6px 24px var(--accent-glow)'
                e.currentTarget.style.transform = 'translateY(-1px)'
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = 'none'
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            {loading ? (
              <>
                <div style={{
                  width: 15, height: 15, borderRadius: '50%',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTopColor: '#fff',
                  animation: 'spin 0.7s linear infinite',
                }} />
                Verifying…
              </>
            ) : 'Sign in'}
          </button>
        </form>

        <p style={{
          textAlign: 'center', marginTop: 28,
          fontSize: 10, color: 'var(--text-faint)',
          letterSpacing: '0.07em', textTransform: 'uppercase',
        }}>
          LifeOS Internal · Do not share
        </p>
      </div>
    </div>
  )
}
