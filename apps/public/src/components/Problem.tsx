import { useRef, useState } from 'react'

const PAINS = [
  {
    number: '01',
    headline: '12 apps. Zero clarity.',
    body: 'Notes in one place, tasks in another, goals in a journal you haven\'t opened in months. Everything is somewhere. Nothing is actionable.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <rect x="2" y="2" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.5"/>
        <rect x="12" y="2" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.5"/>
        <rect x="2" y="12" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.5"/>
        <rect x="12" y="12" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.5"/>
      </svg>
    ),
  },
  {
    number: '02',
    headline: 'Planning feels productive. It isn\'t.',
    body: 'You spend Sunday setting goals, organizing systems, color-coding categories. Monday arrives. The gap between plan and reality is exactly the same.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <circle cx="11" cy="11" r="8.5" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M11 7v4l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    number: '03',
    headline: 'No proof you\'re growing.',
    body: 'Motivation fades because you can\'t see progress. Without a system that tracks reality — not intention — every goal quietly dies the same way.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M4 17l4-5 3 3 4-6 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M4 20h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
]

function PainCard({ pain, index }: { pain: typeof PAINS[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [glow, setGlow] = useState({ x: 50, y: 50 })

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setGlow({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    })
  }

  return (
    <div
      ref={ref}
      onMouseMove={onMouseMove}
      className={`reveal reveal-delay-${index + 1}`}
      style={{
        padding: '36px 32px',
        background: 'var(--bg-raised)',
        border: '1px solid var(--border)',
        borderRadius: 18, position: 'relative', overflow: 'hidden',
        cursor: 'default',
        transition: 'border-color 0.25s, transform 0.25s cubic-bezier(0.34,1.2,0.64,1), box-shadow 0.25s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--border-strong)'
        e.currentTarget.style.transform = 'translateY(-5px)'
        e.currentTarget.style.boxShadow = '0 24px 64px rgba(0,0,0,0.6)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--border)'
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      {/* Radial glow that follows mouse */}
      <div style={{
        position: 'absolute', inset: 0, borderRadius: 'inherit',
        background: `radial-gradient(400px circle at ${glow.x}% ${glow.y}%, rgba(255,90,31,0.06), transparent 60%)`,
        pointerEvents: 'none',
      }} />

      {/* Number */}
      <div style={{
        position: 'absolute', top: 20, right: 22,
        fontSize: 11, fontWeight: 600, color: 'var(--text-faint)',
        letterSpacing: '0.05em',
      }}>
        {pain.number}
      </div>

      {/* Icon */}
      <div style={{
        width: 44, height: 44, borderRadius: 12,
        background: 'rgba(255,90,31,0.08)',
        border: '1px solid rgba(255,90,31,0.15)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--accent)', marginBottom: 22,
        transition: 'background 0.2s, box-shadow 0.2s',
      }}>
        {pain.icon}
      </div>

      <h3 className="t-h3" style={{ color: 'var(--text)', marginBottom: 14 }}>
        {pain.headline}
      </h3>
      <p className="t-small" style={{ color: 'var(--text-muted)', lineHeight: 1.78 }}>
        {pain.body}
      </p>
    </div>
  )
}

export default function Problem() {
  return (
    <section className="section section-border" id="problem">
      <div className="container">

        <div className="reveal" style={{ textAlign: 'center', marginBottom: 72 }}>
          <p className="t-label" style={{ marginBottom: 18 }}>The problem</p>
          <h2 className="t-h2" style={{ maxWidth: 580, margin: '0 auto' }}>
            You don't need another app.
            <br />
            <span className="gradient-text" style={{ fontWeight: 400 }}>
              You need a system.
            </span>
          </h2>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))',
          gap: 14,
        }}>
          {PAINS.map((p, i) => (
            <PainCard key={i} pain={p} index={i} />
          ))}
        </div>

      </div>
    </section>
  )
}
