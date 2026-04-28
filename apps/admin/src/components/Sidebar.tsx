import { useState, useEffect } from 'react';
import {
  BarChart3, Shield, Users, LayoutDashboard,
  LogOut, MessageSquareText, ClipboardList,
  ChevronLeft, ChevronRight, Activity, Zap
} from 'lucide-react';

export type Tab = 'dashboard' | 'threads' | 'questions' | 'users' | 'reports' | 'analytics' | 'launch';

const ITEMS: Array<{ id: Tab; label: string; icon: any }> = [
  { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
  { id: 'launch',    label: 'Launch Phases', icon: Zap },
  { id: 'questions', label: 'Moderation', icon: MessageSquareText },
  { id: 'users',     label: 'Waitlist',     icon: Users },
  { id: 'analytics', label: 'Real-time', icon: Activity },
  { id: 'reports',   label: 'Security',   icon: Shield },
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

  useEffect(() => {
    localStorage.setItem('admin_sidebar_collapsed', String(collapsed));
  }, [collapsed]);

  return (
    <aside className={`sidebar-shell${collapsed ? ' collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-brand">
          <img src="/logo.png" alt="L" />
          {!collapsed && <strong>LifeOS</strong>}
        </div>
        <button 
          className="sidebar-toggle" 
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? "Expand" : "Collapse"}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      <nav className="sidebar-nav">
        {ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              className={`sidebar-link${activeTab === item.id ? ' active' : ''}`}
              onClick={() => setTab(item.id)}
              title={collapsed ? item.label : undefined}
            >
              <Icon size={18} strokeWidth={2} />
              {!collapsed && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      <div style={{ padding: '16px 12px', borderTop: '1px solid var(--border)' }}>
        <button 
          className="sidebar-link" 
          onClick={onLogout} 
          style={{ width: '100%', color: 'var(--danger)' }}
          title={collapsed ? "Sign out" : undefined}
        >
          <LogOut size={18} />
          {!collapsed && <span>Sign out</span>}
        </button>
      </div>
    </aside>
  );
}
