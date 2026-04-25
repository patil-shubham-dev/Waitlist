import { Globe, Users, Trash2, Snowflake } from 'lucide-react'

export default function CommunitiesTab() {
  const communities = [
    { id: '1', name: 'Olympians', members: 1400, type: 'public', status: 'active' },
    { id: '2', name: 'Shadow Protocol', members: 42, type: 'private', status: 'active' },
    { id: '3', name: 'Test Realm', members: 3, type: 'public', status: 'frozen' },
  ]

  return (
    <div className="main-view">
      <div style={{ marginBottom: '3rem' }}>
        <h1 style={{ fontFamily: 'var(--font-mono)', fontSize: '1.5rem', fontWeight: 700 }}>COMMUNITY CONTROL</h1>
        <p className="stat-label">FACTIONS & GUILDS GOVERNANCE</p>
      </div>

      <div className="oracle-table-container">
        <table>
          <thead>
            <tr>
              <th>FACTION NAME</th>
              <th>POPULATION</th>
              <th>TYPE</th>
              <th>STATUS</th>
              <th style={{ textAlign: 'right' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {communities.map(c => (
              <tr key={c.id}>
                <td style={{ fontWeight: 600 }}>{c.name}</td>
                <td style={{ fontFamily: 'var(--font-mono)' }}>{c.members.toLocaleString()}</td>
                <td><span className="stat-label">{c.type.toUpperCase()}</span></td>
                <td>
                  <span className="stat-label" style={{ color: c.status === 'active' ? 'var(--safe)' : 'var(--warning)' }}>
                    {c.status.toUpperCase()}
                  </span>
                </td>
                <td style={{ textAlign: 'right', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                  <button className="btn-hud" style={{ padding: '0.2rem 0.5rem', color: 'var(--warning)' }} title="Freeze Faction"><Snowflake size={14} /></button>
                  <button className="btn-hud" style={{ padding: '0.2rem 0.5rem', color: 'var(--critical)' }} title="Purge Faction"><Trash2 size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
