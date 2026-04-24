import type { Tab } from './Dashboard'

const NAV: { id: Tab; label: string; group?: string }[] = [
  { id: 'overview',    label: 'Overview',    group: 'Main' },
  { id: 'waitlist',    label: 'Waitlist',    group: 'Main' },
  { id: 'suggestions', label: 'Suggestions', group: 'Main' },
  { id: 'visits',      label: 'Visits',      group: 'Main' },
  { id: 'timeline',    label: 'Timeline',    group: 'Content' },
  { id: 'content',     label: 'Site Content', group: 'Content' },
]

interface Props {
  activeTab: Tab
  setTab: (t: Tab) => void
  onLogout: () => void
}

export default function Sidebar({ activeTab, setTab, onLogout }: Props) {
  const groups = ['Main', 'Content']

  return (
    <aside style={{
      width: 200, position: 'fixed', top: 0, left: 0, bottom: 0,
      background: 'var(--bg)',
      borderRight: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Logo */}
      <div style={{
        padding: '18px 18px 14px',
        borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', gap: 9,
      }}>
        <img src="/assets/logo-mark.svg" alt="LifeOS" style={{ height: 22 }} />
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', letterSpacing: '-0.2px' }}>LifeOS</div>
          <div style={{ fontSize: 9, color: 'var(--text-faint)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Admin</div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '8px 10px', overflowY: 'auto' }}>
        {groups.map((group) => (
          <div key={group} style={{ marginBottom: 4 }}>
            <p style={{
              fontSize: 9, color: 'var(--text-faint)',
              letterSpacing: '0.08em', textTransform: 'uppercase',
              padding: '10px 10px 4px',
            }}>
              {group}
            </p>
            {NAV.filter((n) => n.group === group).map((item) => {
              const active = activeTab === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => setTab(item.id)}
                  style={{
                    width: '100%', textAlign: 'left',
                    padding: '8px 12px', borderRadius: 7,
                    border: 'none',
                    background: active ? 'var(--bg-subtle)' : 'transparent',
                    color: active ? 'var(--text)' : 'var(--text-muted)',
                    fontSize: 13, fontWeight: active ? 500 : 400,
                    cursor: 'pointer', marginBottom: 1,
                    transition: 'background 0.12s, color 0.12s',
                    display: 'flex', alignItems: 'center',
                    borderLeft: active ? '2px solid var(--accent)' : '2px solid transparent',
                    paddingLeft: active ? 10 : 12,
                  }}
                  onMouseEnter={(e) => { if (!active) e.currentTarget.style.color = 'var(--text)' }}
                  onMouseLeave={(e) => { if (!active) e.currentTarget.style.color = 'var(--text-muted)' }}
                >
                  {item.label}
                </button>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Sign out */}
      <div style={{ padding: '10px', borderTop: '1px solid var(--border)' }}>
        <button
          onClick={onLogout}
          style={{
            width: '100%', textAlign: 'left',
            padding: '8px 12px', borderRadius: 7,
            background: 'transparent', border: 'none',
            color: 'var(--text-faint)', fontSize: 12, cursor: 'pointer',
            transition: 'color 0.12s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#f87171')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-faint)')}
        >
          Sign out
        </button>
      </div>
    </aside>
  )
}
