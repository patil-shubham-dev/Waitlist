import { useState } from 'react';
import Sidebar, { type Tab } from './Sidebar';
import QuestionsTab from './tabs/QuestionsTab';
import TelemetryTab from './tabs/TelemetryTab';
import AuditTab from './tabs/AuditTab';
import TimelineTab from './tabs/TimelineTab';
import WaitlistTab from './tabs/WaitlistTab';
import { Users } from 'lucide-react';

export default function Dashboard({ onLogout }: { onLogout: () => void }) {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <div className="admin-shell">
      <Sidebar activeTab={activeTab} setTab={setActiveTab} onLogout={onLogout} />

      <main className="admin-main">
        {activeTab === 'dashboard' && <TelemetryTab />}
        
        {activeTab === 'launch' && <TimelineTab />}

        {activeTab === 'questions' && (
          <div className="tab-stack">
            <div className="tab-header">
              <h1 style={{ fontSize: '32px', fontWeight: 800, letterSpacing: '-0.04em' }}>Moderation</h1>
              <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>Review and respond to community questions</p>
            </div>
            <QuestionsTab onSelect={setSelectedId} selectedId={selectedId} />
          </div>
        )}

        {activeTab === 'users' && <WaitlistTab />}

        {activeTab === 'analytics' && <TelemetryTab />}

        {activeTab === 'reports' && <AuditTab />}
      </main>
    </div>
  );
}
