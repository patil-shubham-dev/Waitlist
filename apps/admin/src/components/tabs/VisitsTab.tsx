import { useEffect, useState } from 'react'
import { supabase, type PageVisit } from '../../lib/supabase'
import StatCard from '../StatCard'

export default function VisitsTab() {
  const [visits, setVisits] = useState<PageVisit[]>([])
  const [loading, setLoading] = useState(true)
  const [liveCount, setLiveCount] = useState(0)

  useEffect(() => {
    supabase.from('page_visits').select('*').order('created_at', { ascending: false })
      .then(({ data }) => { setVisits(data ?? []); setLoading(false) })

    const updateLive = async () => {
      const since = new Date(Date.now() - 5 * 60 * 1000).toISOString()
      const { count } = await supabase.from('page_visits').select('*', { count: 'exact', head: true }).gte('created_at', since)
      setLiveCount(count ?? 0)
    }
    updateLive()
    const interval = setInterval(updateLive, 30_000)

    const ch = supabase.channel('visits-admin')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'page_visits' },
        (p) => { setVisits((prev) => [p.new as PageVisit, ...prev]); setLiveCount((c) => c + 1) })
      .subscribe()

    return () => { supabase.removeChannel(ch); clearInterval(interval) }
  }, [])

  const today = new Date().toISOString().split('T')[0]
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
  const todayCount = visits.filter((v) => v.created_at.startsWith(today)).length
  const yesterdayCount = visits.filter((v) => v.created_at.startsWith(yesterday)).length

  // Referrer breakdown
  const refBreakdown: Record<string, number> = {}
  visits.forEach((v) => {
    let ref = 'Direct'
    if (v.referrer) {
      try { ref = new URL(v.referrer).hostname.replace('www.', '') } catch { ref = v.referrer }
    }
    refBreakdown[ref] = (refBreakdown[ref] ?? 0) + 1
  })
  const topRefs = Object.entries(refBreakdown).sort((a, b) => b[1] - a[1]).slice(0, 6)

  // Hourly for today
  const hourly = Array(24).fill(0)
  visits.filter((v) => v.created_at.startsWith(today)).forEach((v) => {
    hourly[new Date(v.created_at).getHours()]++
  })
  const maxH = Math.max(...hourly, 1)
  const currentHour = new Date().getHours()

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text)' }}>Visits</h1>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>{visits.length} total visits tracked</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10, marginBottom: 24 }}>
        <StatCard label="Active now" value={liveCount} sub="last 5 minutes" accent live />
        <StatCard label="Today" value={todayCount} sub={yesterdayCount > 0 ? `${yesterdayCount} yesterday` : undefined} />
        <StatCard label="Total" value={visits.length} />
        <StatCard label="Top source" value={topRefs[0]?.[0] ?? '—'} sub={topRefs[0] ? `${topRefs[0][1]} visits` : undefined} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
        {/* Hourly chart */}
        <div style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)', borderRadius: 8, padding: '18px 20px' }}>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 14 }}>Today by hour</p>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 60 }}>
            {hourly.map((count, h) => (
              <div key={h} title={`${h}:00 — ${count} visits`} style={{
                flex: 1,
                height: `${Math.max((count / maxH) * 100, count > 0 ? 5 : 0)}%`,
                minHeight: count > 0 ? 3 : 0,
                background: h === currentHour ? 'var(--accent)' : 'var(--bg-subtle)',
                border: '1px solid var(--border)',
                borderRadius: 2,
                transition: 'height 0.3s ease',
              }} />
            ))}
          </div>
          <div style={{ display: 'flex', gap: 3, marginTop: 5 }}>
            {hourly.map((_, h) => (
              <div key={h} style={{
                flex: 1, fontSize: 8,
                color: h === currentHour ? 'var(--accent)' : 'var(--text-faint)',
                textAlign: 'center',
              }}>
                {h % 6 === 0 ? `${h}h` : ''}
              </div>
            ))}
          </div>
        </div>

        {/* Traffic sources */}
        <div style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)', borderRadius: 8, padding: '18px 20px' }}>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 14 }}>Traffic sources</p>
          {topRefs.length === 0 ? (
            <p style={{ fontSize: 13, color: 'var(--text-faint)' }}>No data yet</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {topRefs.map(([ref, count]) => {
                const pct = visits.length > 0 ? Math.round((count / visits.length) * 100) : 0
                return (
                  <div key={ref}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{ref}</span>
                      <span style={{ fontSize: 11, color: 'var(--text-faint)', fontFamily: 'monospace' }}>{pct}%</span>
                    </div>
                    <div style={{ height: 2, background: 'var(--bg-subtle)', borderRadius: 1 }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: ref === 'Direct' ? 'var(--accent)' : 'var(--border-strong)', borderRadius: 1, transition: 'width 0.4s ease' }} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Recent visits log */}
      <div style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
        <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)' }}>
          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Recent visits</p>
        </div>
        <div style={{ maxHeight: 300, overflowY: 'auto' }}>
          {loading ? (
            <p style={{ padding: 20, fontSize: 13, color: 'var(--text-faint)', textAlign: 'center' }}>Loading...</p>
          ) : visits.slice(0, 40).map((v) => (
            <div key={v.id} style={{
              display: 'flex', justifyContent: 'space-between',
              padding: '9px 18px', borderBottom: '1px solid var(--border)',
              fontSize: 12,
            }}>
              <span style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>{v.page}</span>
              <span style={{ color: 'var(--text-faint)', whiteSpace: 'nowrap' }}>
                {new Date(v.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
