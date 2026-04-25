import { ShieldAlert, CheckCircle, XCircle, Sliders } from 'lucide-react'

export default function ProofsTab() {
  const proofs = [
    { id: '1', user: 'Oracle01', task: 'Deep Work Session', confidence: 99, status: 'ai_approved', xp: 500 },
    { id: '2', user: 'Neo', task: 'Run 10km', confidence: 45, status: 'flagged', xp: 300 },
  ]

  return (
    <div className="main-view">
      <div style={{ marginBottom: '3rem' }}>
        <h1 style={{ fontFamily: 'var(--font-mono)', fontSize: '1.5rem', fontWeight: 700 }}>PROOF MONITORING</h1>
        <p className="stat-label">AI CONFIDENCE & MANUAL OVERRIDES</p>
      </div>

      <div className="oracle-table-container">
        <table>
          <thead>
            <tr>
              <th>NODE</th>
              <th>TASK DEFINITION</th>
              <th>AI CONFIDENCE</th>
              <th>SYSTEM STATUS</th>
              <th>BASE XP</th>
              <th style={{ textAlign: 'right' }}>OVERRIDE</th>
            </tr>
          </thead>
          <tbody>
            {proofs.map(p => (
              <tr key={p.id}>
                <td style={{ fontWeight: 600 }}>{p.user}</td>
                <td>{p.task}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ flex: 1, height: '4px', background: 'var(--bg-subtle)' }}>
                      <div style={{ height: '100%', width: `${p.confidence}%`, background: p.confidence > 80 ? 'var(--safe)' : 'var(--warning)' }} />
                    </div>
                    <span className="stat-label">{p.confidence}%</span>
                  </div>
                </td>
                <td><span className="stat-label">{p.status.toUpperCase().replace('_', ' ')}</span></td>
                <td>{p.xp}</td>
                <td style={{ textAlign: 'right', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                  <button className="btn-hud" style={{ padding: '0.2rem 0.5rem', color: 'var(--safe)' }} title="Force Approve"><CheckCircle size={14} /></button>
                  <button className="btn-hud" style={{ padding: '0.2rem 0.5rem', color: 'var(--critical)' }} title="Reject"><XCircle size={14} /></button>
                  <button className="btn-hud" style={{ padding: '0.2rem 0.5rem' }} title="Adjust XP"><Sliders size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
