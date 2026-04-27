import type { Tab } from './Dashboard';
import { ClipboardList, FileEdit, Flag, LayoutDashboard, LogOut, MessageSquareText, Shield } from 'lucide-react';

const ITEMS: Array<{ id: Tab; label: string; icon: typeof LayoutDashboard }> = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'waitlist', label: 'Waitlist', icon: ClipboardList },
  { id: 'questions', label: 'Public Q&A', icon: MessageSquareText },
  { id: 'content', label: 'Content + Branding', icon: FileEdit },
  { id: 'phases', label: 'Launch Phases', icon: Flag },
  { id: 'audit', label: 'Audit Log', icon: Shield },
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
        <img src="/assets/logo-mark.jpg" alt="LifeOS" />
        <div>
          <strong>LifeOS</strong>
          <span>Waitlist Control</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              className={`sidebar-link ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => setTab(item.id)}
            >
              <Icon size={16} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <button className="sidebar-link sidebar-link-danger" onClick={onLogout}>
        <LogOut size={16} />
        <span>Logout</span>
      </button>
    </aside>
  );
}
