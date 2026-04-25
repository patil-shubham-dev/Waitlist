import { Layout, Search, Server } from 'lucide-react'

export default function CmsTab() {
  return (
    <div className="main-view">
      <div style={{ marginBottom: '3rem' }}>
        <h1 style={{ fontFamily: 'var(--font-mono)', fontSize: '1.5rem', fontWeight: 700 }}>PROTOCOL CMS</h1>
        <p className="stat-label">LANDING PAGE CONTENT INJECTION</p>
      </div>

      <div className="oracle-card" style={{ maxWidth: '800px' }}>
        <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Layout size={18} /> Hero Configuration
        </h3>
        <div style={{ marginBottom: '1rem' }}>
          <label className="stat-label">Primary Headline</label>
          <input type="text" className="input-hud" defaultValue="Turn Action Into Progress. Automatically." style={{ fontSize: '1rem' }} />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label className="stat-label">Subtext</label>
          <textarea className="input-hud" defaultValue="LifeOS is a proof-driven system where your actions become measurable growth." rows={3} style={{ resize: 'none' }} />
        </div>
        <div style={{ marginBottom: '1.5rem' }}>
          <label className="stat-label">CTA Text</label>
          <input type="text" className="input-hud" defaultValue="Secure Your Position" />
        </div>
        <button className="btn-hud btn-hud-primary" style={{ width: '100%' }}>PUSH TO PRODUCTION EDGE</button>
      </div>
    </div>
  )
}
