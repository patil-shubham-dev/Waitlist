import { Activity, Users, Lightning, Clock } from 'lucide-react'

export default function TelemetryTab() {
  return (
    <div className="main-view">
      <div style={{ marginBottom: '3rem' }}>
        <h1 style={{ fontFamily: 'var(--font-mono)', fontSize: '1.5rem', fontWeight: 700 }}>SYSTEM TELEMETRY</h1>
        <p className="stat-label">REAL-TIME GLOBAL METRICS</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
        <div className="oracle-card">
          <div className="stat-label"><Users size={12} style={{ marginRight: '4px' }} /> DAU</div>
          <div className="stat-value">14,204</div>
          <div className="stat-label" style={{ marginTop: '0.5rem', color: 'var(--safe)' }}>+12% vs Yesterday</div>
        </div>
        <div className="oracle-card">
          <div className="stat-label"><Activity size={12} style={{ marginRight: '4px' }} /> COMPLETION RATE</div>
          <div className="stat-value">72.4%</div>
          <div className="stat-label" style={{ marginTop: '0.5rem', color: 'var(--primary)' }}>TASK EXECUTION</div>
        </div>
        <div className="oracle-card">
          <div className="stat-label"><Clock size={12} style={{ marginRight: '4px' }} /> RETENTION (D7)</div>
          <div className="stat-value">48.2%</div>
          <div className="stat-label" style={{ marginTop: '0.5rem', color: 'var(--warning)' }}>STABLE</div>
        </div>
        <div className="oracle-card">
          <div className="stat-label">AI LATENCY</div>
          <div className="stat-value">124ms</div>
          <div className="stat-label" style={{ marginTop: '0.5rem', color: 'var(--safe)' }}>OPTIMAL</div>
        </div>
      </div>

      <div className="oracle-card" style={{ padding: '2rem' }}>
        <div className="stat-label" style={{ marginBottom: '2rem' }}>Throughput Analysis (72h)</div>
        <div style={{ height: '200px', borderLeft: '1px solid var(--border)', borderBottom: '1px solid var(--border)', position: 'relative' }}>
          {/* Mock Graph */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '40%', background: 'linear-gradient(0deg, var(--primary-muted) 0%, transparent 100%)', clipPath: 'polygon(0 100%, 0 50%, 20% 40%, 40% 60%, 60% 30%, 80% 50%, 100% 20%, 100% 100%)' }} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '40%', borderTop: '2px solid var(--primary)', clipPath: 'polygon(0 100%, 0 50%, 20% 40%, 40% 60%, 60% 30%, 80% 50%, 100% 20%, 100% 100%)' }} />
        </div>
      </div>
    </div>
  )
}
