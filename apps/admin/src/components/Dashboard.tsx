import { useState } from 'react';
import Sidebar from './Sidebar';
import TelemetryTab from './tabs/TelemetryTab';
import WaitlistTab from './tabs/WaitlistTab';
import QuestionsTab from './tabs/QuestionsTab';
import CmsTab from './tabs/CmsTab';
import TimelineTab from './tabs/TimelineTab';
import AuditTab from './tabs/AuditTab';

export type Tab = 'overview' | 'waitlist' | 'questions' | 'content' | 'phases' | 'audit';

export default function Dashboard({ onLogout }: { onLogout: () => void }) {
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  return (
    <div className="admin-shell">
      <Sidebar activeTab={activeTab} setTab={setActiveTab} onLogout={onLogout} />
      <main className="admin-main">
        {activeTab === 'overview' && <TelemetryTab />}
        {activeTab === 'waitlist' && <WaitlistTab />}
        {activeTab === 'questions' && <QuestionsTab />}
        {activeTab === 'content' && <CmsTab />}
        {activeTab === 'phases' && <TimelineTab />}
        {activeTab === 'audit' && <AuditTab />}
      </main>
    </div>
  );
}
