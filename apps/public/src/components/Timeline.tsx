import { useRef, useEffect, useState } from 'react'
import { supabase, type TimelineEntry } from '../lib/supabase'

const STATUS_CONFIG = {
  past:    { color: '#4ade80', label: 'Completed', dot: '✓' },
  present: { color: '#FF5A1F', label: 'In Progress', dot: '◉' },
  future:  { color: '#4a4a50', label: 'Planned',    dot: '○' },
}

export default function Timeline() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [entries, setEntries] = useState<TimelineEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [dragging, setDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  // Fetch from Supabase
  useEffect(() => {
    supabase
      .from('timeline_entries')
      .select('*')
      .order('sort_order', { ascending: true })
      .then(({ data }) => {
        setEntries(data ?? [])
        setLoading(false)
      })

    // Realtime updates when admin edits
    const ch = supabase
      .channel('timeline-public')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'timeline_entries' }, () => {
        supabase
          .from('timeline_entries')
          .select('*')
          .order('sort_order', { ascending: true })
          .then(({ data }) => setEntries(data ?? []))
      })
      .subscribe()

    return () => { supabase.removeChannel(ch) }
  }, [])

  const onScrollUpdate = () => {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 10)
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10)
  }

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    el.addEventListener('scroll', onScrollUpdate, { passive: true })
    onScrollUpdate()
    return () => el.removeEventListener('scroll', onScrollUpdate)
  }, [entries])

  const onMouseDown = (e: React.MouseEvent) => {
    setDragging(true)
    setStartX(e.pageX - (scrollRef.current?.offsetLeft ?? 0))
    setScrollLeft(scrollRef.current?.scrollLeft ?? 0)
  }
  const onMouseMove = (e: React.MouseEvent) => {
    if (!dragging || !scrollRef.current) return
    e.preventDefault()
    scrollRef.current.scrollLeft = scrollLeft - (e.pageX - (scrollRef.current.offsetLeft ?? 0) - startX)
  }
  const onMouseUp = () => setDragging(false)

  return (
    <section id="roadmap" className="section-border" style={{ padding: '100px 0' }}>

      {/* Header */}
      <div className="container reveal" style={{
        marginBottom: 52,
        padding: '0 clamp(20px, 5vw, 48px)',
        display: 'flex', alignItems: 'flex-end',
        justifyContent: 'space-between', flexWrap: 'wrap', gap: 16,
      }}>
        <div>
          <p className="t-label" style={{ marginBottom: 16 }}>Roadmap</p>
          <h2 className="t-h2">Built in the open.</h2>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', gap: 20, paddingBottom: 4 }}>
          {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
            <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: cfg.color }} />
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{cfg.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Connecting line across the top */}
      <div style={{ position: 'relative' }}>

        {/* Left fade */}
        <div style={{
          position: 'absolute', left: 0, top: 0, bottom: 0, width: 80, zIndex: 2,
          background: 'linear-gradient(to right, var(--bg), transparent)',
          pointerEvents: 'none', transition: 'opacity 0.3s',
          opacity: canScrollLeft ? 1 : 0,
        }} />
        {/* Right fade */}
        <div style={{
          position: 'absolute', right: 0, top: 0, bottom: 0, width: 100, zIndex: 2,
          background: 'linear-gradient(to left, var(--bg), transparent)',
          pointerEvents: 'none', transition: 'opacity 0.3s',
          opacity: canScrollRight ? 1 : 0,
        }} />

        {/* Scroll container */}
        <div
          ref={scrollRef}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
          style={{
            display: 'flex',
            gap: 0,
            overflowX: 'auto',
            padding: '0 clamp(20px, 5vw, 48px) 32px',
            cursor: dragging ? 'grabbing' : 'grab',
            userSelect: 'none',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            alignItems: 'flex-start',
          }}
        >
          {loading ? (
            // Skeleton
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} style={{
                minWidth: 230, flexShrink: 0,
                padding: '24px',
                background: 'var(--bg-raised)',
                border: '1px solid var(--border)',
                borderRadius: 14, marginRight: 12,
                opacity: 0.4,
              }}>
                <div style={{ height: 12, background: 'var(--bg-subtle)', borderRadius: 4, width: '60%', marginBottom: 12 }} />
                <div style={{ height: 18, background: 'var(--bg-subtle)', borderRadius: 4, width: '80%', marginBottom: 16 }} />
                <div style={{ height: 10, background: 'var(--bg-subtle)', borderRadius: 4, width: '100%', marginBottom: 8 }} />
                <div style={{ height: 10, background: 'var(--bg-subtle)', borderRadius: 4, width: '90%' }} />
              </div>
            ))
          ) : entries.map((entry, i) => {
            const cfg = STATUS_CONFIG[entry.status]
            const isPresent = entry.status === 'present'
            const isPast = entry.status === 'past'

            return (
              <div key={entry.id} style={{ display: 'flex', alignItems: 'flex-start', flexShrink: 0 }}>
                {/* Card */}
                <div
                  className={`reveal reveal-delay-${Math.min(i + 1, 5)}`}
                  style={{
                    minWidth: 230, maxWidth: 250,
                    padding: '24px',
                    background: isPresent
                      ? 'rgba(255,90,31,0.05)'
                      : isPast
                      ? 'rgba(74,222,128,0.03)'
                      : 'var(--bg-raised)',
                    border: `1px solid ${
                      isPresent ? 'rgba(255,90,31,0.22)'
                      : isPast  ? 'rgba(74,222,128,0.12)'
                      : 'var(--border)'
                    }`,
                    borderRadius: 14,
                    boxShadow: isPresent ? '0 0 40px rgba(255,90,31,0.07)' : 'none',
                    transition: 'transform 0.22s ease, box-shadow 0.22s ease',
                    position: 'relative',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)'
                    e.currentTarget.style.boxShadow = isPresent
                      ? '0 16px 48px rgba(255,90,31,0.15)'
                      : '0 12px 40px rgba(0,0,0,0.5)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = isPresent ? '0 0 40px rgba(255,90,31,0.07)' : 'none'
                  }}
                >
                  {/* Top accent line for present */}
                  {isPresent && (
                    <div style={{
                      position: 'absolute', top: 0, left: 0, right: 0, height: 2,
                      background: 'linear-gradient(90deg, var(--accent), transparent)',
                      borderRadius: '14px 14px 0 0',
                    }} />
                  )}

                  {/* Status badge */}
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    padding: '3px 10px', borderRadius: 100, marginBottom: 16,
                    background: `${cfg.color}18`,
                    border: `1px solid ${cfg.color}30`,
                  }}>
                    <div style={{
                      width: 5, height: 5, borderRadius: '50%',
                      background: cfg.color, flexShrink: 0,
                      animation: isPresent ? 'pulse-dot 2s infinite' : 'none',
                    }} />
                    <span style={{ fontSize: 10, fontWeight: 500, color: cfg.color, letterSpacing: '0.05em' }}>
                      {cfg.label.toUpperCase()}
                    </span>
                  </div>

                  <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', marginBottom: 8, letterSpacing: '-0.01em' }}>
                    {entry.title}
                  </h3>

                  {entry.description && (
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 14, lineHeight: 1.6 }}>
                      {entry.description}
                    </p>
                  )}

                  {entry.items && entry.items.length > 0 && (
                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 7 }}>
                      {entry.items.map((item, j) => (
                        <li key={j} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                          <span style={{
                            fontSize: 11, color: cfg.color, flexShrink: 0,
                            fontWeight: 700, marginTop: 1,
                          }}>
                            {isPast ? '✓' : '→'}
                          </span>
                          <span style={{
                            fontSize: 12,
                            color: entry.status === 'future' ? 'var(--text-faint)' : 'var(--text-muted)',
                            lineHeight: 1.5,
                          }}>
                            {item}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Connector line between cards */}
                {i < entries.length - 1 && (
                  <div style={{
                    display: 'flex', alignItems: 'center',
                    height: 30, padding: '0 4px', marginTop: 38,
                    flexShrink: 0,
                  }}>
                    <div style={{
                      width: 24, height: 1,
                      background: `linear-gradient(90deg, ${cfg.color}60, ${STATUS_CONFIG[entries[i + 1].status].color}60)`,
                    }} />
                    <div style={{
                      width: 5, height: 5, borderRadius: '50%',
                      background: STATUS_CONFIG[entries[i + 1].status].color,
                      opacity: 0.4, flexShrink: 0,
                    }} />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <p style={{
        textAlign: 'center', fontSize: 10,
        color: 'var(--text-faint)', letterSpacing: '0.08em',
        textTransform: 'uppercase', marginTop: 4,
      }}>
        Drag or scroll to explore
      </p>
    </section>
  )
}
