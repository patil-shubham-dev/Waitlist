import { Database, Search } from 'lucide-react'

export default function AuditTab() {
  const audits = [
    { id: '1092', action: 'XP_MODIFIER_UPDATE', admin: 'super_admin_01', detail: 'Boosted global XP multiplier to x1.5', time: '10:45 AM' },
    { id: '1091', action: 'USER_SHADOWBANNED', admin: 'super_admin_01', detail: 'Node id: Neo (Reason: Malicious proof uploading)', time: '09:12 AM' },
    { id: '1090', action: 'COMMUNITY_FROZEN', admin: 'mod_04', detail: 'Faction "Test Realm" frozen for inactivity', time: 'Yesterday' },
    { id: '1089', action: 'CMS_HERO_UPDATE', admin: 'content_bot', detail: 'Changed primary headline CTA', time: 'Yesterday' },
  ]

  return (
    <div className="main-view">
      <div style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-mono)', fontSize: '1.5rem', fontWeight: 700 }}>IMMUTABLE AUDIT LOG</h1>
          <p className="stat-label">DISTRIBUTED RECORD OF ADMINISTRATIVE ACTION</p>
        </div>
        <div style={{ position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--text-muted)' }} />
          <input type="text" className="input-hud" placeholder="SCAN LOGS..." style={{ marginBottom: 0, paddingLeft: '40px' }} />
        </div>
      </div>

      <div className="oracle-table-container">
        <table>
          <thead>
            <tr>
              <th>LOG_ID</th>
              <th>ACTION_TYPE</th>
              <th>ACTOR</th>
              <th>SECURE_DETAILS</th>
              <th style={{ textAlign: 'right' }}>TIMESTAMP</th>
            </tr>
          </thead>
          <tbody>
            {audits.map(a => (
              <tr key={a.id}>
                <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>#{a.id}</td>
                <td><span className="stat-label" style={{ color: 'var(--primary)' }}>{a.action}</span></td>
                <td style={{ fontWeight: 600 }}>{a.admin}</td>
                <td style={{ color: 'var(--text-dim)' }}>{a.detail}</td>
                <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>{a.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
