import { Users, Slash, Flame, RotateCcw } from 'lucide-react'

export default function UsersTab() {
  const users = [
    { id: '1', name: 'Oracle01', xp: 45000, streak: 142, proofs: 312, status: 'active' },
    { id: '2', name: 'Neo', xp: 2100, streak: 12, proofs: 18, status: 'shadowbanned' },
    { id: '3', name: 'Trinity', xp: 85000, streak: 365, proofs: 890, status: 'active' },
  ]

  return (
    <div className="main-view">
      <div style={{ marginBottom: '3rem' }}>
        <h1 style={{ fontFamily: 'var(--font-mono)', fontSize: '1.5rem', fontWeight: 700 }}>USER REGISTRY</h1>
        <p className="stat-label">POPULATION CONTROL & METRICS</p>
      </div>

      <div className="oracle-table-container">
        <table>
          <thead>
            <tr>
              <th>IDENTITY</th>
              <th>XP LEVEL</th>
              <th>STREAK</th>
              <th>PROOFS</th>
              <th>STATUS</th>
              <th style={{ textAlign: 'right' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td style={{ fontWeight: 600 }}>{u.name}</td>
                <td style={{ fontFamily: 'var(--font-mono)' }}>{u.xp.toLocaleString()}</td>
                <td><Flame size={14} color="var(--primary)" style={{ display: 'inline', marginRight: '4px' }}/>{u.streak}</td>
                <td>{u.proofs}</td>
                <td>
                  <span className="stat-label" style={{ color: u.status === 'active' ? 'var(--safe)' : 'var(--critical)' }}>
                    {u.status.toUpperCase()}
                  </span>
                </td>
                <td style={{ textAlign: 'right', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                  <button className="btn-hud" style={{ padding: '0.2rem 0.5rem' }} title="Reset XP"><RotateCcw size={14} /></button>
                  <button className="btn-hud" style={{ padding: '0.2rem 0.5rem' }} title="Modify Streak"><Flame size={14} /></button>
                  <button className="btn-hud" style={{ padding: '0.2rem 0.5rem', color: 'var(--critical)', borderColor: 'var(--critical)' }} title="Ban Protocol">
                    <Slash size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
