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
  return (
    <div className={`stat-card-shell ${accent ? 'accent' : ''}`}>
      <div className="stat-card-label">
        {live && <span className="loading-dot" style={{ width: 6, height: 6, border: 'none', background: 'var(--green)', boxShadow: '0 0 8px var(--green)' }} />}
        {label}
        {trend === 'up' && <span style={{ color: 'var(--success)', marginLeft: 'auto' }}>↑</span>}
        {trend === 'down' && <span style={{ color: 'var(--danger)', marginLeft: 'auto' }}>↓</span>}
      </div>

      <div className="stat-card-value" style={{ color: accent ? 'var(--accent)' : 'inherit' }}>
        {value}
      </div>

      {sub && <div className="stat-card-sub">{sub}</div>}
    </div>
  );
}
