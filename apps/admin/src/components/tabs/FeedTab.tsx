import { Rss, Sliders, Eye } from 'lucide-react'

export default function FeedTab() {
  return (
    <div className="main-view">
      <div style={{ marginBottom: '3rem' }}>
        <h1 style={{ fontFamily: 'var(--font-mono)', fontSize: '1.5rem', fontWeight: 700 }}>FEED CONTROL SYSTEM</h1>
        <p className="stat-label">ALGORITHMIC WEIGHTS & DENSITY</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <div className="oracle-card">
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sliders size={18} /> Ranking Weights
          </h3>
          <div style={{ marginBottom: '1.5rem' }}>
            <div className="stat-label" style={{ marginBottom: '0.5rem' }}>Proof Quality (Image/Context)</div>
            <input type="range" min="0" max="100" defaultValue="80" style={{ width: '100%' }} />
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <div className="stat-label" style={{ marginBottom: '0.5rem' }}>User Streak Weight</div>
            <input type="range" min="0" max="100" defaultValue="60" style={{ width: '100%' }} />
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <div className="stat-label" style={{ marginBottom: '0.5rem' }}>Recency Decay Rate</div>
            <input type="range" min="0" max="100" defaultValue="40" style={{ width: '100%' }} />
          </div>
          <button className="btn-hud btn-hud-primary" style={{ width: '100%' }}>UPDATE ALGORITHM</button>
        </div>

        <div className="oracle-card">
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Eye size={18} /> Simulation Sandbox
          </h3>
          <div style={{ background: 'var(--bg)', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--border)', height: '240px', overflowY: 'auto' }}>
            <div className="stat-label" style={{ marginBottom: '1rem', color: 'var(--primary)' }}>LIVE SIMULATION RESULTS</div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Top Post: Oracle01 (Score: 94.2)</p>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Post 2: Trinity (Score: 88.5)</p>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Suggestion Density: 1 every 6 posts</p>
          </div>
        </div>
      </div>
    </div>
  )
}
