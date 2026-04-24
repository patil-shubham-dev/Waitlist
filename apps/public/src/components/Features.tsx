import { useState } from 'react'

const FEATURES = [
  {
    tag: 'Life Dashboard',
    title: 'Everything in one view.',
    desc: 'Streak, Growth Points, consistency score, active tasks, and daily progress — unified in a dashboard that loads in under a second.',
    accent: true,
    stat: { value: '1 screen', label: 'to see it all' },
  },
  {
    tag: 'Goals Engine',
    title: 'Goals become tasks become proof.',
    desc: 'Set a goal. LifeOS breaks it into executable tasks with deadlines. Complete them. Submit proof. AI validates. Points awarded.',
    stat: { value: 'AI-validated', label: 'every completion' },
  },
  {
    tag: 'Timeline System',
    title: 'Your permanent record of discipline.',
    desc: 'Every completed task, streak hit, and milestone reached is logged forever. Your timeline is the most honest portfolio you\'ve ever built.',
    stat: { value: '∞', label: 'history preserved' },
  },
  {
    tag: 'Social Layer',
    title: 'Growth is more powerful witnessed.',
    desc: 'Follow real people making real progress. Share proof posts. Join communities built around specific goals — not noise.',
    stat: { value: 'Public proof', label: 'not just claims' },
  },
  {
    tag: 'Anti-Cheat System',
    title: 'The most honest productivity app.',
    desc: 'EXIF validation, duplicate detection, behavioral pattern analysis. You cannot fake your way to Growth Points.',
    stat: { value: '0 fakes', label: 'allowed through' },
  },
  {
    tag: 'Streak Engine',
    title: 'Consistency that compounds.',
    desc: '1 task minimum per day. 1 grace skip per 7 days. Miss it and the streak resets. Simple rules, real consequences.',
    stat: { value: 'Daily', label: 'accountability' },
  },
]

function FeatureCard({ f, i }: { f: typeof FEATURES[0]; i: number }) {
  const [hovered, setHovered] = useState(false)
  const [mouse, setMouse] = useState({ x: 50, y: 50 })

  return (
    <div
      className={`reveal reveal-delay-${Math.min((i % 3) + 1, 4)}`}
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect()
        setMouse({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 })
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: '28px 26px',
        background: f.accent ? 'rgba(255,90,31,0.04)' : 'var(--bg-raised)',
        border: `1px solid ${f.accent ? 'rgba(255,90,31,0.18)' : 'var(--border)'}`,
        borderRadius: 18,
        position: 'relative', overflow: 'hidden',
        cursor: 'default',
        transform: hovered ? 'translateY(-5px)' : 'translateY(0)',
        boxShadow: hovered
          ? f.accent
            ? '0 20px 60px rgba(255,90,31,0.12), 0 1px 0 rgba(255,255,255,0.04) inset'
            : '0 20px 60px rgba(0,0,0,0.55)'
          : 'none',
        transition: 'transform 0.25s cubic-bezier(0.34,1.2,0.64,1), box-shadow 0.25s ease, border-color 0.2s',
      }}
    >
      {/* Mouse-following glow */}
      <div style={{
        position: 'absolute', inset: 0, borderRadius: 'inherit',
        background: `radial-gradient(320px circle at ${mouse.x}% ${mouse.y}%, rgba(255,90,31,${hovered ? '0.07' : '0'}), transparent 60%)`,
        transition: 'background 0.1s',
        pointerEvents: 'none',
      }} />

      {/* Top accent bar */}
      {f.accent && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 2,
          background: 'linear-gradient(90deg, var(--accent) 0%, transparent 80%)',
          borderRadius: '18px 18px 0 0',
        }} />
      )}

      <p style={{
        fontSize: 10, fontWeight: 700, color: f.accent ? 'var(--accent)' : 'var(--text-faint)',
        letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 14,
      }}>
        {f.tag}
      </p>

      <h3 className="t-h3" style={{ marginBottom: 12, color: 'var(--text)' }}>
        {f.title}
      </h3>

      <p className="t-small" style={{ color: 'var(--text-muted)', marginBottom: 22, lineHeight: 1.78 }}>
        {f.desc}
      </p>

      <div style={{
        padding: '10px 14px',
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid var(--border)',
        borderRadius: 9,
        display: 'flex', gap: 8, alignItems: 'center',
      }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: f.accent ? 'var(--accent)' : 'var(--text)', letterSpacing: '-0.01em' }}>
          {f.stat.value}
        </span>
        <span style={{ fontSize: 11, color: 'var(--text-faint)' }}>
          {f.stat.label}
        </span>
      </div>
    </div>
  )
}

export default function Features() {
  return (
    <section id="features" className="section section-border">
      <div className="container">

        <div className="reveal" style={{ marginBottom: 72, textAlign: 'center' }}>
          <p className="t-label" style={{ marginBottom: 18 }}>Features</p>
          <h2 className="t-h2">Built for real growth.</h2>
          <p className="t-body" style={{ color: 'var(--text-muted)', maxWidth: 440, margin: '18px auto 0' }}>
            Every feature closes the gap between who you are and who you're trying to become.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: 14,
        }}>
          {FEATURES.map((f, i) => <FeatureCard key={i} f={f} i={i} />)}
        </div>

      </div>
    </section>
  )
}
