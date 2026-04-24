import { useEffect, useState } from 'react'
import { supabase, type WaitlistEntry } from '../../lib/supabase'

export default function WaitlistTab() {
  const [entries, setEntries] = useState<WaitlistEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved'>('all')
  const [updating, setUpdating] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // Sync filters with URL params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const urlSearch = params.get('search')
    const urlRole = params.get('role')
    const urlStatus = params.get('status')
    if (urlSearch) setSearch(urlSearch)
    if (urlRole) setRoleFilter(urlRole)
    if (urlStatus && ['all', 'pending', 'approved'].includes(urlStatus)) {
      setStatusFilter(urlStatus as typeof statusFilter)
    }
  }, [])

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (roleFilter !== 'all') params.set('role', roleFilter)
    if (statusFilter !== 'all') params.set('status', statusFilter)
    const newUrl = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ''}`
    window.history.replaceState({}, '', newUrl)
  }, [search, roleFilter, statusFilter])

  useEffect(() => {
    supabase
      .from('waitlist').select('*').order('created_at', { ascending: false })
      .then(({ data }) => { setEntries(data ?? []); setLoading(false) })

    const ch = supabase.channel('wl-admin')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'waitlist' },
        (p) => setEntries((prev) => [p.new as WaitlistEntry, ...prev]))
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [])

  const filtered = entries.filter((e) => {
    const q = search.toLowerCase()
    const matchSearch = (e.name?.toLowerCase().includes(q) || e.email?.toLowerCase().includes(q))
    const matchRole = roleFilter === 'all' || e.role === roleFilter
    const matchStatus = statusFilter === 'all'
      || (statusFilter === 'approved' && e.approved)
      || (statusFilter === 'pending' && !e.approved)
    return matchSearch && matchRole && matchStatus
  })

  const copyEmail = async (email: string, id: string) => {
    try {
      await navigator.clipboard.writeText(email)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch {
      // Silent fail
    }
  }

  const toggleApprove = async (id: string, current: boolean) => {
    const action = current ? 'revoke approval' : 'approve'
    if (!window.confirm(`Are you sure you want to ${action} this entry?`)) return

    setUpdating(id)
    await supabase.from('waitlist').update({ approved: !current }).eq('id', id)
    setEntries((prev) => prev.map((e) => e.id === id ? { ...e, approved: !current } : e))
    setUpdating(null)
  }

  const exportCSV = () => {
    const rows = [
      ['Name', 'Email', 'Role', 'Interest', 'Approved', 'Referrer', 'Date'],
      ...entries.map((e) => [e.name, e.email, e.role, e.interest_level, e.approved ? 'Yes' : 'No', e.referrer ?? '', e.created_at]),
    ]
    const csv = rows.map((r) => r.join(',')).join('\n')
    const a = Object.assign(document.createElement('a'), {
      href: URL.createObjectURL(new Blob([csv], { type: 'text/csv' })),
      download: 'waitlist.csv',
    })
    a.click()
  }

  const roles = ['all', ...Array.from(new Set(entries.map((e) => e.role).filter(Boolean)))]
  const approvedCount = entries.filter((e) => e.approved).length

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 600, letterSpacing: '-0.02em' }}>Waitlist</h1>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>
            {entries.length} signups · {approvedCount} approved · {entries.length - approvedCount} pending
          </p>
        </div>
        <button onClick={exportCSV} style={ghostBtn} aria-label="Export waitlist to CSV">Export CSV</button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
        <input
          placeholder="Search name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ ...fInput, flex: 1, minWidth: 200 }}
          onFocus={(e) => (e.target.style.borderColor = 'var(--accent-border)')}
          onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
        />
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} style={fSelect}>
          {roles.map((r) => <option key={r} value={r}>{r === 'all' ? 'All roles' : r}</option>)}
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)} style={fSelect}>
          <option value="all">All status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
        </select>
      </div>

      {/* Table */}
      <div style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-subtle)' }}>
                {['Name', 'Email', '', 'Role', 'Interest', 'Status', 'Joined', 'Action'].map((h) => (
                  <th key={h} style={thS}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                // Skeleton loading
                <>
                  {[1, 2, 3, 4].map((i) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={tdS}><div style={{ height: 16, background: 'var(--bg-subtle)', borderRadius: 4, width: '70%' }} /></td>
                      <td style={tdS}><div style={{ height: 14, background: 'var(--bg-subtle)', borderRadius: 4, width: '90%' }} /></td>
                      <td style={tdS}></td>
                      <td style={tdS}><div style={{ height: 14, background: 'var(--bg-subtle)', borderRadius: 4, width: 50 }} /></td>
                      <td style={tdS}><div style={{ height: 14, background: 'var(--bg-subtle)', borderRadius: 4, width: 60 }} /></td>
                      <td style={tdS}><div style={{ height: 14, background: 'var(--bg-subtle)', borderRadius: 4, width: 70 }} /></td>
                      <td style={tdS}><div style={{ height: 14, background: 'var(--bg-subtle)', borderRadius: 4, width: 80 }} /></td>
                      <td style={tdS}><div style={{ height: 28, background: 'var(--bg-subtle)', borderRadius: 6, width: 60 }} /></td>
                    </tr>
                  ))}
                </>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={8} style={{ padding: 48, textAlign: 'center', color: 'var(--text-faint)' }}>No results</td></tr>
              ) : filtered.map((e, i) => (
                <tr
                  key={e.id}
                  style={{
                    borderBottom: '1px solid var(--border)',
                    background: i % 2 === 1 ? 'rgba(255,255,255,0.012)' : 'transparent',
                  }}
                >
                  <td style={tdS}>{e.name}</td>
                  <td style={{ ...tdS, fontFamily: 'monospace', fontSize: 12, color: 'var(--text-muted)' }}>{e.email}</td>
                  <td style={{ ...tdS, padding: '11px 4px' }}>
                    <button
                      onClick={() => copyEmail(e.email, e.id)}
                      aria-label="Copy email"
                      title={copiedId === e.id ? 'Copied!' : 'Copy email'}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        padding: 4,
                        borderRadius: 4,
                        color: copiedId === e.id ? '#4ade80' : 'var(--text-faint)',
                        transition: 'color 0.15s',
                      }}
                    >
                      {copiedId === e.id ? (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      ) : (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                          <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                        </svg>
                      )}
                    </button>
                  </td>
                  <td style={tdS}>
                    <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 11, background: 'var(--bg-subtle)', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                      {e.role}
                    </span>
                  </td>
                  <td style={{ ...tdS, fontSize: 12 }}>
                    <span style={{ color: e.interest_level === 'high' ? '#4ade80' : e.interest_level === 'medium' ? '#fbbf24' : 'var(--text-faint)' }}>
                      {e.interest_level}
                    </span>
                  </td>
                  <td style={tdS}>
                    <span style={{
                      padding: '3px 9px', borderRadius: 100, fontSize: 11, fontWeight: 500,
                      background: e.approved ? 'rgba(74,222,128,0.1)' : 'rgba(255,255,255,0.05)',
                      color: e.approved ? '#4ade80' : 'var(--text-faint)',
                      border: `1px solid ${e.approved ? 'rgba(74,222,128,0.2)' : 'var(--border)'}`,
                    }}>
                      {e.approved ? 'Approved' : 'Pending'}
                    </span>
                  </td>
                  <td style={{ ...tdS, color: 'var(--text-faint)', fontSize: 12, whiteSpace: 'nowrap' }}>
                    {new Date(e.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}
                  </td>
                  <td style={tdS}>
                    <button
                      aria-label={e.approved ? 'Revoke approval' : 'Approve entry'}
                      onClick={() => toggleApprove(e.id, e.approved)}
                      disabled={updating === e.id}
                      style={{
                        padding: '5px 12px', borderRadius: 6, fontSize: 11, cursor: 'pointer',
                        border: `1px solid ${e.approved ? 'rgba(248,113,113,0.3)' : 'rgba(74,222,128,0.3)'}`,
                        background: 'transparent',
                        color: e.approved ? '#f87171' : '#4ade80',
                        opacity: updating === e.id ? 0.5 : 1,
                        transition: 'opacity 0.15s',
                        fontFamily: 'Inter, sans-serif',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {updating === e.id ? '…' : e.approved ? 'Revoke' : 'Approve'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length > 0 && (
          <div style={{ padding: '10px 16px', borderTop: '1px solid var(--border)', fontSize: 12, color: 'var(--text-faint)', display: 'flex', justifyContent: 'space-between' }}>
            <span>{filtered.length} shown</span>
            <span>{entries.filter((e) => e.interest_level === 'high').length} high intent</span>
          </div>
        )}
      </div>
    </div>
  )
}

const fInput: React.CSSProperties = {
  background: 'var(--bg-raised)', border: '1px solid var(--border)',
  borderRadius: 7, padding: '8px 12px', color: 'var(--text)',
  fontSize: 13, outline: 'none', fontFamily: 'Inter, sans-serif',
  transition: 'border-color 0.15s',
}
const fSelect: React.CSSProperties = {
  background: 'var(--bg-raised)', border: '1px solid var(--border)',
  borderRadius: 7, padding: '8px 12px', color: 'var(--text-muted)',
  fontSize: 13, outline: 'none', cursor: 'pointer',
}
const ghostBtn: React.CSSProperties = {
  background: 'transparent', border: '1px solid var(--border)',
  color: 'var(--text-muted)', padding: '7px 16px',
  borderRadius: 7, fontSize: 13, cursor: 'pointer',
  fontFamily: 'Inter, sans-serif',
}
const thS: React.CSSProperties = {
  padding: '10px 14px', textAlign: 'left', fontSize: 11,
  color: 'var(--text-faint)', textTransform: 'uppercase',
  letterSpacing: '0.05em', fontWeight: 500,
}
const tdS: React.CSSProperties = { padding: '11px 14px', color: 'var(--text)' }
