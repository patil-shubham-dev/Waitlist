import { useState, useEffect } from 'react';
import {
  Shield, Users, LayoutDashboard,
  LogOut, MessageSquareText, Zap,
  ChevronLeft, ChevronRight, Menu, X
} from 'lucide-react';

const base = import.meta.env.BASE_URL || '/';
const asset = (p: string) => `${base}${p.startsWith('/') ? p.slice(1) : p}`;

export type Tab = 'dashboard' | 'questions' | 'users' | 'security' | 'launch';

const ITEMS: Array<{ id: Tab; label: string; icon: any }> = [
  { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
  { id: 'launch',    label: 'Launch Phases', icon: Zap },
  { id: 'questions', label: 'Moderation', icon: MessageSquareText },
  { id: 'users',     label: 'Waitlist',     icon: Users },
  { id: 'security',  label: 'Security',   icon: Shield },
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
  const [collapsed, setCollapsed] = useState(() => {
    return localStorage.getItem('admin_sidebar_collapsed') === 'true';
  });
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('admin_sidebar_collapsed', String(collapsed));
  }, [collapsed]);

  const handleTabClick = (id: Tab) => {
    setTab(id);
    setIsMobileOpen(false);
  };

  return (
    <>
      <header className="mobile-header">
        <div className="sidebar-brand">
          <img src={asset('assets/logo-mark.jpg')} alt="L" />
          <strong>LifeOS</strong>
        </div>
        <button className="mobile-toggle" onClick={() => setIsMobileOpen(true)} aria-label="Open menu">
          <Menu size={24} />
        </button>
      </header>

      {isMobileOpen && <div className="mobile-overlay" onClick={() => setIsMobileOpen(false)} />}

      <aside className={`sidebar-shell${collapsed ? ' collapsed' : ''}${isMobileOpen ? ' mobile-open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <img src={asset('assets/logo-mark.jpg')} alt="L" />
            {!collapsed && <strong>LifeOS</strong>}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <button className="mobile-close" onClick={() => setIsMobileOpen(false)} aria-label="Close menu">
              <X size={20} />
            </button>
            <button
              className="sidebar-toggle-btn desktop-only"
              onClick={() => setCollapsed(!collapsed)}
              title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>
          </div>
        </div>

        <nav className="sidebar-nav">
          {ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                className={`sidebar-link${activeTab === item.id ? ' active' : ''}`}
                onClick={() => handleTabClick(item.id)}
                title={collapsed ? item.label : undefined}
              >
                <Icon size={18} strokeWidth={2} />
                {!collapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <button className="sidebar-link" onClick={onLogout} title={collapsed ? 'Sign out' : undefined}>
            <LogOut size={18} />
            {!collapsed && <span>Sign out</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
