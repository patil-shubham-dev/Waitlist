import { useState } from 'react'
import Sidebar from './Sidebar'

// Tabs
import WaitlistTab from './tabs/WaitlistTab'
import UsersTab from './tabs/UsersTab'
import ProofsTab from './tabs/ProofsTab'
import FeedTab from './tabs/FeedTab'
import CommunitiesTab from './tabs/CommunitiesTab'
import AiControlTab from './tabs/AiControlTab'
import CmsTab from './tabs/CmsTab'
import TelemetryTab from './tabs/TelemetryTab'
import AssistantTab from './tabs/AssistantTab'
import AuditTab from './tabs/AuditTab'

export type Tab = 
  | 'users' 
  | 'proofs' 
  | 'feed' 
  | 'communities' 
  | 'ai-control' 
  | 'cms' 
  | 'waitlist' 
  | 'telemetry' 
  | 'assistant' 
  | 'audit'

interface Props { onLogout: () => void }

export default function Dashboard({ onLogout }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('telemetry')

  const renderTab = () => {
    switch (activeTab) {
      case 'users':       return <UsersTab />
      case 'proofs':      return <ProofsTab />
      case 'feed':        return <FeedTab />
      case 'communities': return <CommunitiesTab />
      case 'ai-control':  return <AiControlTab />
      case 'cms':         return <CmsTab />
      case 'waitlist':    return <WaitlistTab />
      case 'telemetry':   return <TelemetryTab />
      case 'assistant':   return <AssistantTab />
      case 'audit':       return <AuditTab />
      default:            return <div className="stat-label">MODULE OFFLINE</div>
    }
  }

  return (
    <div style={{
      display: 'flex', minHeight: '100vh',
      background: 'var(--bg)', color: 'var(--text)',
      fontFamily: "'Inter', -apple-system, sans-serif",
    }}>
      <Sidebar activeTab={activeTab} setTab={setActiveTab} onLogout={onLogout} />
      <main style={{
        flex: 1, marginLeft: 200,
        padding: '32px 36px',
        minHeight: '100vh',
        maxWidth: 'calc(100vw - 200px)',
        overflowY: 'auto',
      }}>
        {renderTab()}
      </main>
    </div>
  )
}
