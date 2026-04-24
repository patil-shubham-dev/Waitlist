import { useState } from 'react'
import Sidebar from './Sidebar'
import Overview from './tabs/Overview'
import WaitlistTab from './tabs/WaitlistTab'
import SuggestionsTab from './tabs/SuggestionsTab'
import VisitsTab from './tabs/VisitsTab'
import TimelineTab from './tabs/TimelineTab'
import ContentTab from './tabs/ContentTab'

export type Tab = 'overview' | 'waitlist' | 'suggestions' | 'visits' | 'timeline' | 'content'

interface Props { onLogout: () => void }

export default function Dashboard({ onLogout }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('overview')

  const renderTab = () => {
    switch (activeTab) {
      case 'overview':    return <Overview setTab={setActiveTab} />
      case 'waitlist':    return <WaitlistTab />
      case 'suggestions': return <SuggestionsTab />
      case 'visits':      return <VisitsTab />
      case 'timeline':    return <TimelineTab />
      case 'content':     return <ContentTab />
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
