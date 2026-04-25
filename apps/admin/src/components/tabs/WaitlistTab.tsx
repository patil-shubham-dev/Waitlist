import { useEffect, useState } from 'react'
import { supabase, type WaitlistEntry } from '../../lib/supabase'
import { Search, Download, CheckCircle, XCircle, Copy, ExternalLink } from 'lucide-react'

export default function WaitlistTab() {
  const [entries, setEntries] = useState<WaitlistEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    supabase
      .from('waitlist').select('*').order('created_at', { ascending: false })
      .then(({ data }) => { setEntries(data ?? []); setLoading(false) })
  }, [])

  const filtered = entries.filter((e) => {
    const q = search.toLowerCase()
    const matchSearch = (e.name?.toLowerCase().includes(q) || e.email?.toLowerCase().includes(q))
    const matchRole = roleFilter === 'all' || e.role === roleFilter
    return matchSearch && matchRole
  })

  const toggleApprove = async (id: string, current: boolean) => {
    setUpdating(id)
    await supabase.from('waitlist').update({ approved: !current }).eq('id', id)
    setEntries((prev) => prev.map((e) => e.id === id ? { ...e, approved: !current } : e))
    setUpdating(null)
  }

  const exportCSV = () => {
    const rows = [['Name', 'Email', 'Role', 'Status', 'Date'], ...entries.map(e => [e.name, e.email, e.role, e.approved ? 'Approved' : 'Pending', e.created_at])]
    const csv = rows.map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `lifeos_protocol_export_${new Date().toISOString().slice(0,10)}.csv`
    a.click()
  }

  return (
    <div className="main-view">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-mono)', fontSize: '1.5rem', fontWeight: 700 }}>PROTOCOL SUBJECTS</h1>
          <p className="stat-label">{entries.length} NODES IDENTIFIED</p>
        </div>
        <button className="btn-hud" onClick={exportCSV} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Download size={14} /> EXPORT_DATA.RAW
        </button>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--primary)' }} />
          <input 
            className="input-hud" 
            placeholder="SCAN BY NAME OR EMAIL..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ marginBottom: 0, paddingLeft: '40px' }}
          />
        </div>
        <select 
          className="input-hud" 
          style={{ width: '200px', marginBottom: 0 }}
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="all">ALL SECTORS</option>
          {Array.from(new Set(entries.map(e => e.role))).filter(Boolean).map(role => (
            <option key={role} value={role}>{role?.toUpperCase()}</option>
          ))}
        </select>
      </div>

      <div className="oracle-table-container">
        <table>
          <thead>
            <tr>
              <th>SUBJECT</th>
              <th>CREDENTIALS</th>
              <th>SECTOR</th>
              <th>AUTHORIZATION</th>
              <th>TIMESTAMP</th>
              <th style={{ textAlign: 'right' }}>COMMANDS</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '4rem' }} className="stat-label">SCANNING ARCHIVES...</td></tr>
            ) : filtered.map(e => (
              <tr key={e.id}>
                <td style={{ fontWeight: 600 }}>{e.name || 'ANONYMOUS'}</td>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{e.email}</td>
                <td><span className="stat-label" style={{ background: 'var(--primary-muted)', padding: '2px 6px', borderRadius: '4px' }}>{e.role || 'BETA'}</span></td>
                <td>
                  {e.approved ? (
                    <span style={{ color: 'var(--safe)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem' }}>
                      <CheckCircle size={12} /> GRANTED
                    </span>
                  ) : (
                    <span style={{ color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem' }}>
                      <XCircle size={12} /> PENDING
                    </span>
                  )}
                </td>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                  {new Date(e.created_at).toLocaleDateString()}
                </td>
                <td style={{ textAlign: 'right' }}>
                  <button 
                    className="btn-hud" 
                    onClick={() => toggleApprove(e.id, e.approved)}
                    disabled={updating === e.id}
                    style={{ 
                      borderColor: e.approved ? 'var(--critical)' : 'var(--safe)',
                      color: e.approved ? 'var(--critical)' : 'var(--safe)',
                      padding: '2px 8px'
                    }}
                  >
                    {updating === e.id ? '...' : e.approved ? 'REVOKE' : 'GRANT'}
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
