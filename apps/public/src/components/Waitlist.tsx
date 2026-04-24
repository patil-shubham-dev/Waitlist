import { useState } from 'react'
import { supabase } from '../lib/supabase'

type Step = 'email' | 'details' | 'done'

const ROLES = [
  { v: 'student', l: 'Student' },
  { v: 'founder', l: 'Founder' },
  { v: 'creator', l: 'Creator' },
  { v: 'professional', l: 'Professional' },
  { v: 'other', l: 'Other' },
]

export default function Waitlist() {
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState('')
  const [referrer, setReferrer] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const submitEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true); setError('')
    const { error: err } = await supabase.from('waitlist').insert({
      name: name || email.split('@')[0],
      email: email.trim(),
      role: role || 'other',
      referrer: referrer || null,
    })
    setLoading(false)
    if (err?.code === '23505') { setStep('done'); return }
    if (err) { setError('Something went wrong. Try again.'); return }
    setStep('details')
  }

  if (step === 'done') {
    return (
      <section id="waitlist" className="section section-border" style={{ textAlign: 'center' }}>
        <div style={{ maxWidth: 480, margin: '0 auto' }}>
          <div style={{
            width: 48, height: 48, borderRadius: '50%',
            background: 'rgba(34,197,94,0.08)',
            border: '1px solid rgba(34,197,94,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 24px',
          }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M3.5 9L7.5 13L14.5 5.5" stroke="#6ee7a0" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h2 className="t-h2" style={{ marginBottom: 14 }}>You're on the list.</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.7 }}>
            We'll reach out to <strong style={{ color: 'var(--text)' }}>{email}</strong> with early access when it's ready.
          </p>
        </div>
      </section>
    )
  }

  if (step === 'details') {
    return (
      <section id="waitlist" className="section section-border">
        <div style={{ maxWidth: 440, margin: '0 auto' }}>
          <div className="reveal" style={{ marginBottom: 36, textAlign: 'center' }}>
            <p className="t-label" style={{ marginBottom: 14 }}>One more thing (optional)</p>
            <h2 className="t-h2" style={{ fontSize: 'clamp(24px, 4vw, 36px)' }}>
              Tell us about yourself
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 10 }}>
              Helps us build the right things for the right people.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={labelStyle}>Your name</label>
              <input value={name} onChange={(e) => setName(e.target.value)}
                placeholder="Optional" className="input" />
            </div>
            <div>
              <label style={labelStyle}>I am a...</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                {ROLES.map((r) => (
                  <button key={r.v} type="button" onClick={() => setRole(r.v)} style={{
                    padding: '7px 14px', borderRadius: 6, fontSize: 13,
                    border: `1px solid ${role === r.v ? 'var(--accent-border)' : 'var(--border)'}`,
                    background: role === r.v ? 'var(--accent-dim)' : 'var(--bg-raised)',
                    color: role === r.v ? 'var(--text)' : 'var(--text-muted)',
                    cursor: 'pointer', transition: 'all 0.15s',
                  }}>
                    {r.l}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label style={labelStyle}>How did you hear about us?</label>
              <input value={referrer} onChange={(e) => setReferrer(e.target.value)}
                placeholder="Twitter, friend, search..." className="input" />
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
              <button onClick={() => setStep('done')} className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                Submit
              </button>
              <button onClick={() => setStep('done')} className="btn-ghost">Skip</button>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id="waitlist" className="section section-border">
      <div style={{
        maxWidth: 560, margin: '0 auto', textAlign: 'center',
        padding: '48px clamp(20px, 5vw, 48px)',
        background: 'var(--bg-raised)',
        border: '1px solid var(--border)',
        borderRadius: 20,
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Subtle glow */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 400, height: 200,
          background: 'radial-gradient(ellipse, rgba(255,90,31,0.07), transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div className="reveal" style={{ marginBottom: 32, position: 'relative' }}>
          <p className="t-label" style={{ marginBottom: 14 }}>Early access</p>
          <h2 className="t-h2" style={{ marginBottom: 14 }}>Be among the first.</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.7 }}>
            We're opening LifeOS to a small group of early users.
            No spam — just an invite when you're up.
          </p>
        </div>

        <form onSubmit={submitEmail} style={{ position: 'relative' }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
            <input
              type="email" required
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
              style={{ flex: 1, textAlign: 'left' }}
            />
            <button type="submit" disabled={loading} className="btn-primary"
              style={{ opacity: loading ? 0.6 : 1 }}>
              {loading ? 'Joining...' : 'Get access'}
            </button>
          </div>
          {error && <p style={{ fontSize: 12, color: '#f87171', marginBottom: 8 }}>{error}</p>}
          <p style={{ fontSize: 12, color: 'var(--text-faint)' }}>
            No credit card. No commitment.
          </p>
        </form>
      </div>
    </section>
  )
}

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 12,
  color: 'var(--text-muted)', marginBottom: 6,
}
