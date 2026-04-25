import type { Tab } from './Dashboard'
import { 
  Users, 
  ShieldAlert, 
  Rss, 
  Globe, 
  Cpu, 
  Layout, 
  UserPlus, 
  Activity, 
  Terminal, 
  Database,
  LogOut, 
  Sparkles 
} from 'lucide-react'

const NAV: { id: Tab; label: string; group: string; icon: any }[] = [
  // IDENTITIES & GOVERNANCE
  { id: 'users',       label: 'USER REGISTRY',    group: 'GOVERNANCE', icon: Users },
  { id: 'proofs',      label: 'PROOF VALIDATION', group: 'GOVERNANCE', icon: ShieldAlert },
  { id: 'feed',        label: 'FEED CONTROL',     group: 'GOVERNANCE', icon: Rss },
  { id: 'communities', label: 'COMMUNITIES',      group: 'GOVERNANCE', icon: Globe },
  
  // SYSTEM ARCHITECTURE
  { id: 'ai-control',  label: 'AI ALGORITHMS',    group: 'SYSTEM',     icon: Cpu },
  { id: 'cms',         label: 'PROTOCOL CMS',     group: 'SYSTEM',     icon: Layout },
  { id: 'waitlist',    label: 'ACCESS QUEUE',     group: 'SYSTEM',     icon: UserPlus },
  
  // INTELLIGENCE & TRACKING
  { id: 'telemetry',   label: 'TELEMETRY',        group: 'INTELLIGENCE',icon: Activity },
  { id: 'assistant',   label: 'ORACLE ASSISTANT', group: 'INTELLIGENCE',icon: Terminal },
  { id: 'audit',       label: 'AUDIT LOGS',       group: 'INTELLIGENCE',icon: Database },
]

interface Props {
  activeTab: Tab
  setTab: (t: Tab) => void
  onLogout: () => void
}

export default function Sidebar({ activeTab, setTab, onLogout }: Props) {
  const groups = ['GOVERNANCE', 'SYSTEM', 'INTELLIGENCE']

  return (
    <aside className="sidebar" style={{ overflowY: 'auto' }}>
      <div style={{ padding: '0 1rem 2rem', borderBottom: '1px solid var(--border)' }}>
        <div className="logo">
          <Sparkles className="accent-gradient" size={24} />
          <span style={{ fontSize: '1.2rem', fontWeight: 800 }}>ORACLE</span>
        </div>
        <div style={{ fontSize: '0.6rem', color: 'var(--text-dim)', letterSpacing: '0.3em', marginTop: '4px' }}>
          GLOBAL CONTROL LAYER
        </div>
      </div>

      <nav style={{ flex: 1, padding: '2rem 0' }}>
        {groups.map(group => (
          <div key={group} style={{ marginBottom: '2rem' }}>
            <p className="stat-label" style={{ paddingLeft: '1rem', marginBottom: '1rem' }}>{group}</p>
            {NAV.filter(n => n.group === group).map(item => {
              const active = activeTab === item.id
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  onClick={() => setTab(item.id)}
                  className={`btn-hud ${active ? 'btn-hud-primary' : ''}`}
                  style={{ 
                    width: '100%', 
                    textAlign: 'left', 
                    border: 'none', 
                    borderRadius: '0',
                    borderLeft: active ? '2px solid var(--primary)' : '2px solid transparent',
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.75rem', 
                    padding: '0.75rem 1rem',
                  }}
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                </button>
              )
            })}
          </div>
        ))}
      </nav>

      <div style={{ marginTop: 'auto', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
        <button 
          onClick={onLogout} 
          className="btn-hud" 
          style={{ width: '100%', color: 'var(--critical)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}
        >
          <LogOut size={16} />
          TERMINATE LINK
        </button>
      </div>
    </aside>
  )
}
