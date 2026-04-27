import type { Tab } from './Dashboard';
import {
  BarChart3, Shield, Users, LayoutDashboard,
  LogOut, MessageSquareText, ClipboardList,
} from 'lucide-react';

const ITEMS: Array<{ id: Tab; label: string; icon: any }> = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'threads',   label: 'Threads',   icon: ClipboardList },
  { id: 'questions', label: 'Questions', icon: MessageSquareText },
  { id: 'users',     label: 'Users',     icon: Users },
  { id: 'reports',   label: 'Reports',   icon: Shield },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
];

export default function Sidebar({
  activeTab,
  setTab,
  onLogout,
}: {
  activeTab: Tab;
  setTab: (tab: Tab) => void;
  onLogout: () => void;
}) {
  return (
    <aside className="sidebar-shell">
      <div className="sidebar-brand">
        <img src="/logo.png" alt="L" />
        <strong>LifeOS</strong>
      </div>

      <nav className="sidebar-nav">
        {ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              className={`sidebar-link${activeTab === item.id ? ' active' : ''}`}
              onClick={() => setTab(item.id)}
            >
              <Icon size={18} strokeWidth={2} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <button className="sidebar-link" onClick={onLogout} style={{ marginTop: 'auto', color: 'var(--danger)' }}>
        <LogOut size={18} />
        <span>Sign out</span>
      </button>
    </aside>
  );
}

