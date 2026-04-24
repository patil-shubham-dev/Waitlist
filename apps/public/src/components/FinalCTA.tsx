import { useState, useRef } from 'react'
import { supabase } from '../lib/supabase'

export default function FinalCTA() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'exists'>('idle')
  const [focused, setFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setStatus('loading')
    const { error } = await supabase.from('waitlist').insert({
      name: email.split('@')[0], email: email.trim(), role: 'other',
    })
    setStatus(error?.code === '23505' ? 'exists' : error ? 'idle' : 'done')
  }

  return (
    <section className="section section-border" id="final-cta">
      <div className="container-xs" style={{ textAlign: 'center', position: 'relative' }}>

        {/* Ambient glow */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 600, height: 400,
          background: 'radial-gradient(ellipse, rgba(255,90,31,0.09) 0%, transparent 65%)',
          pointerEvents: 'none',
          animation: 'float-glow 10s ease-in-out infinite',
        }} />

        <div className="reveal" style={{ position: 'relative' }}>
          <p className="t-label" style={{ marginBottom: 20 }}>Limited early access</p>

          <h2 className="t-h2" style={{ marginBottom: 22, lineHeight: 1.1 }}>
            Ready to build the life
            <br />
            <span className="accent-gradient-text">
              you keep planning?
            </span>
          </h2>

          <p className="t-body" style={{ color: 'var(--text-muted)', marginBottom: 48 }}>
            Join the waitlist. Be among the first to use LifeOS.
            <br />
            No spam. No credit card. Just an invite when it's ready.
          </p>

          {status === 'done' || status === 'exists' ? (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 12,
              padding: '16px 28px',
              background: 'rgba(52,211,153,0.07)',
              border: '1px solid rgba(52,211,153,0.18)',
              borderRadius: 12, fontSize: 15, color: '#6ee7b7',
              animation: 'fade-in-up 0.4s ease',
              fontWeight: 500,
            }}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M3.5 9.5L7.5 13L14.5 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              You're on the list — see you on the inside.
            </div>
          ) : (
            <form onSubmit={submit} style={{ maxWidth: 440, margin: '0 auto' }}>
              <div style={{
                display: 'flex', gap: 8,
                background: focused ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.025)',
                border: `1px solid ${focused ? 'var(--accent-border)' : 'var(--border-strong)'}`,
                borderRadius: 13, padding: '5px 5px 5px 18px',
                backdropFilter: 'blur(16px)',
                boxShadow: focused ? '0 0 0 3px var(--accent-dim)' : 'none',
                transition: 'border-color 0.2s, box-shadow 0.2s, background 0.2s',
              }}>
                <input
                  ref={inputRef}
                  type="email" required
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  style={{
                    flex: 1, background: 'transparent',
                    border: 'none', outline: 'none',
                    color: 'var(--text)', fontSize: 14,
                    fontFamily: 'Inter, sans-serif',
                  }}
                />
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="btn-primary"
                  style={{ opacity: status === 'loading' ? 0.65 : 1 }}
                >
                  {status === 'loading' ? 'Joining…' : 'Get Early Access'}
                </button>
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-faint)', marginTop: 14 }}>
                Unsubscribe anytime. We hate spam too.
              </p>
            </form>
          )}
        </div>

      </div>
    </section>
  )
}
