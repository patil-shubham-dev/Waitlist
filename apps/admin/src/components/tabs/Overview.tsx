import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import StatCard from '../StatCard'
import type { Tab } from '../Dashboard'

interface Props { setTab: (t: Tab) => void }

export default function Overview({ setTab }: Props) {
  const [stats, setStats] = useState({
    waitlist: 0, suggestions: 0, visits: 0,
    todaySignups: 0, todayVisits: 0, unanswered: 0, avgRating: 0,
  })
  const [daily, setDaily] = useState<{ date: string; signups: number }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const today = new Date().toISOString().split('T')[0]
      const [{ data: wl }, { data: sg }, { data: pv }] = await Promise.all([
        supabase.from('waitlist').select('*'),
        supabase.from('suggestions').select('*'),
        supabase.from('page_visits').select('*'),
      ])
      const waitlist = wl ?? [], suggestions = sg ?? [], visits = pv ?? []
      const rated = suggestions.filter((s) => s.rating)
      const avgRating = rated.length ? rated.reduce((a, s) => a + s.rating, 0) / rated.length : 0

      const days = Array.from({ length: 14 }, (_, i) => {
        const d = new Date(); d.setDate(d.getDate() - (13 - i))
        const date = d.toISOString().split('T')[0]
        return { date, signups: waitlist.filter((w) => w.created_at.startsWith(date)).length }
      })
      setDaily(days)
      setStats({
        waitlist: waitlist.length,
        suggestions: suggestions.length,
        visits: visits.length,
        todaySignups: waitlist.filter((w) => w.created_at.startsWith(today)).length,
        todayVisits: visits.filter((v) => v.created_at.startsWith(today)).length,
        unanswered: suggestions.filter((s) => !s.admin_response && s.email).length,
        avgRating: Math.round(avgRating * 10) / 10,
      })
      setLoading(false)
    }
    load()
  }, [])

  const maxSignups = Math.max(...daily.map((d) => d.signups), 1)

  if (loading) return <Spinner />

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 20, fontWeight: 600, letterSpacing: '-0.02em', marginBottom: 4 }}>
          Overview
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          Live snapshot of LifeOS waitlist activity
        </p>
      </div>

      {/* Stat cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))',
        gap: 12, marginBottom: 24,
      }}>
        <StatCard label="Total signups" value={stats.waitlist} sub={`+${stats.todaySignups} today`} accent live />
        <StatCard label="Page visits"   value={stats.visits}   sub={`${stats.todayVisits} today`} live />
        <StatCard label="Suggestions"  value={stats.suggestions} sub={`${stats.unanswered} need reply`} />
        <StatCard label="Avg rating"   value={stats.avgRating > 0 ? `${stats.avgRating} / 5` : '—'} />
      </div>

      {/* Chart */}
      <div style={{
        background: 'var(--bg-raised)', border: '1px solid var(--border)',
        borderRadius: 10, padding: '20px 22px', marginBottom: 16,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>
            Signups — last 14 days
          </p>
          <p style={{ fontSize: 11, color: 'var(--text-faint)', fontVariantNumeric: 'tabular-nums' }}>
            {daily.reduce((a, d) => a + d.signups, 0)} total
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 88 }}>
          {daily.map((d, i) => {
            const isToday = i === 13
            const h = d.signups > 0
              ? Math.max((d.signups / maxSignups) * 100, 6)
              : 0
            return (
              <div key={i} title={`${d.signups} signups on ${d.date}`}
                style={{
                  flex: 1, borderRadius: '3px 3px 0 0',
                  height: h > 0 ? `${h}%` : '2px',
                  background: isToday
                    ? 'var(--accent)'
                    : h > 0
                    ? 'var(--bg-subtle)'
                    : 'var(--border)',
                  border: `1px solid ${isToday ? 'transparent' : 'var(--border-strong)'}`,
                  transition: 'height 0.4s ease',
                  boxShadow: isToday ? '0 0 10px var(--accent-glow)' : 'none',
                  minHeight: 2,
                }} />
            )
          })}
        </div>

        <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
          {daily.map((d, i) => (
            <div key={i} style={{
              flex: 1, fontSize: 9,
              color: i === 13 ? 'var(--accent)' : 'var(--text-faint)',
              textAlign: 'center',
              fontVariantNumeric: 'tabular-nums',
            }}>
              {i % 4 === 0 || i === 13 ? d.date.slice(8) : ''}
            </div>
          ))}
        </div>
      </div>

      {/* Action alert */}
      {stats.unanswered > 0 && (
        <div style={{
          padding: '14px 18px',
          background: 'var(--accent-dim)',
          border: '1px solid var(--accent-border)',
          borderRadius: 8,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12,
        }}>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            <span style={{ color: 'var(--accent)', fontWeight: 500 }}>
              {stats.unanswered} suggestion{stats.unanswered > 1 ? 's' : ''}
            </span>{' '}
            with email — no reply yet.
          </p>
          <button
            onClick={() => setTab('suggestions')}
            style={{
              background: 'var(--accent)', color: '#fff',
              border: 'none', padding: '7px 16px',
              borderRadius: 6, fontSize: 12, fontWeight: 500,
              cursor: 'pointer', whiteSpace: 'nowrap',
            }}
          >
            Review
          </button>
        </div>
      )}
    </div>
  )
}

function Spinner() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}>
      <div style={{
        width: 20, height: 20, borderRadius: '50%',
        border: '2px solid var(--border)',
        borderTopColor: 'var(--accent)',
        animation: 'spin 0.7s linear infinite',
      }} />
    </div>
  )
}
