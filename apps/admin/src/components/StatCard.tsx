import { useState } from 'react'

interface Props {
  label: string
  value: string | number
  sub?: string
  accent?: boolean
  live?: boolean
  trend?: 'up' | 'down' | 'neutral'
}

export default function StatCard({ label, value, sub, accent, live, trend }: Props) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: '20px 22px',
        background: accent
          ? `rgba(255,90,31,${hovered ? '0.07' : '0.04'})`
          : hovered ? 'var(--bg-subtle)' : 'var(--bg-raised)',
        border: `1px solid ${accent
          ? hovered ? 'rgba(255,90,31,0.32)' : 'var(--accent-border)'
          : hovered ? 'var(--border-strong)' : 'var(--border)'}`,
        borderRadius: 12,
        position: 'relative', overflow: 'hidden',
        transition: 'background 0.22s, border-color 0.22s, transform 0.22s cubic-bezier(0.34,1.2,0.64,1)',
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
        cursor: 'default',
        animation: 'fade-in-up 0.4s ease both',
      }}
    >
      {/* Accent top stripe */}
      {accent && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 2,
          background: 'linear-gradient(90deg, var(--accent) 0%, transparent 75%)',
          borderRadius: '12px 12px 0 0',
        }} />
      )}

      {/* Label */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 7,
        fontSize: 11, fontWeight: 600, color: 'var(--text-muted)',
        textTransform: 'uppercase', letterSpacing: '0.07em',
        marginBottom: 14,
      }}>
        {live && (
          <span style={{
            width: 5, height: 5, borderRadius: '50%',
            background: 'var(--green)',
            boxShadow: '0 0 6px rgba(52,211,153,0.6)',
            display: 'inline-block', flexShrink: 0,
            animation: 'pulse-dot 2.4s ease-in-out infinite',
          }} />
        )}
        {label}
      </div>

      {/* Value */}
      <div style={{
        fontSize: 32, fontWeight: 700,
        color: accent ? 'var(--accent)' : 'var(--text)',
        letterSpacing: '-0.035em', lineHeight: 1,
        fontVariantNumeric: 'tabular-nums',
      }}>
        {value}
      </div>

      {/* Sub */}
      {sub && (
        <div style={{
          fontSize: 12, color: 'var(--text-faint)',
          marginTop: 8, letterSpacing: '0.01em',
        }}>
          {sub}
        </div>
      )}
    </div>
  )
}
