import { useState, useEffect } from 'react';
import {
  Shield, Users, LayoutDashboard,
  LogOut, MessageSquareText, Zap,
  ChevronLeft, ChevronRight, Menu, X
} from 'lucide-react';

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
      {/* Mobile Top Header */}
      <header className="mobile-admin-header">
        <div className="sidebar-brand">
          <img src="/assets/logo-mark.jpg" alt="L" style={{ borderRadius: '8px' }} />
          <strong>LifeOS</strong>
        </div>
        <button className="mobile-toggle" onClick={() => setIsMobileOpen(true)}>
          <Menu size={24} />
        </button>
      </header>

      {/* Mobile Overlay */}
      {isMobileOpen && <div className="mobile-sidebar-overlay" onClick={() => setIsMobileOpen(false)} />}

      <aside className={`sidebar-shell${collapsed ? ' collapsed' : ''}${isMobileOpen ? ' mobile-open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <img src="/assets/logo-mark.jpg" alt="L" style={{ borderRadius: '8px' }} />
            {!collapsed && <strong>LifeOS</strong>}
          </div>
          <div className="sidebar-header-actions">
            <button className="mobile-close" onClick={() => setIsMobileOpen(false)}>
              <X size={20} />
            </button>
            <button 
              className="sidebar-toggle desktop-only" 
              onClick={() => setCollapsed(!collapsed)}
              title={collapsed ? "Expand" : "Collapse"}
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
          <button 
            className="sidebar-link logout-btn" 
            onClick={onLogout} 
            title={collapsed ? "Sign out" : undefined}
          >
            <LogOut size={18} />
            {!collapsed && <span>Sign out</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
