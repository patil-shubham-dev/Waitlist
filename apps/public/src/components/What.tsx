export default function What() {
  return (
    <section id="what" className="section section-border">
      <div className="container-sm">

        <div className="reveal" style={{ marginBottom: 60 }}>
          <p className="t-label" style={{ marginBottom: 18 }}>What is LifeOS</p>
          <h2 className="t-h2">
            Not another productivity tool.
            <br />
            <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>
              A system for your life.
            </span>
          </h2>
        </div>

        {/* Core positioning statement */}
        <div
          className="reveal reveal-delay-1"
          style={{
            padding: '28px 32px',
            background: 'var(--bg-raised)',
            border: '1px solid var(--border)',
            borderLeft: '3px solid var(--accent)',
            borderRadius: '0 12px 12px 0',
            marginBottom: 48,
          }}
        >
          <p style={{
            fontSize: 'clamp(16px, 2.2vw, 19px)',
            fontWeight: 400,
            color: 'var(--text)',
            lineHeight: 1.7,
            letterSpacing: '-0.01em',
          }}>
            LifeOS is a single place to set goals, execute tasks, submit proof of completion,
            earn recognition for your discipline, and watch your consistency compound into
            a permanent record of who you're becoming.
          </p>
        </div>

        {/* Three pillars */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {[
            { n: '01', title: 'One system, not twelve apps', desc: 'Tasks, habits, goals, proof, community — all in one coherent place that actually works together.' },
            { n: '02', title: 'Proof over intention', desc: 'AI validates every completion. Your growth is visible, real, and fraud-resistant. No self-deception allowed.' },
            { n: '03', title: 'Accountability built-in', desc: 'Streak, Growth Points, and consistency score compound automatically. You become accountable to data, not willpower.' },
          ].map((p, i) => (
            <div
              key={i}
              className={`reveal reveal-delay-${i + 1}`}
              style={{
                display: 'grid',
                gridTemplateColumns: '48px 1fr',
                gap: '0 18px',
                padding: '28px 0',
                borderTop: '1px solid var(--border)',
              }}
            >
              <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-faint)', paddingTop: 3, letterSpacing: '0.05em' }}>
                {p.n}
              </span>
              <div>
                <h3 className="t-h3" style={{ marginBottom: 8 }}>{p.title}</h3>
                <p className="t-small" style={{ color: 'var(--text-muted)' }}>{p.desc}</p>
              </div>
            </div>
          ))}
          <div style={{ borderTop: '1px solid var(--border)' }} />
        </div>

      </div>
    </section>
  )
}
