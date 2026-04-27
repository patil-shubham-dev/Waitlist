import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import QuestionsTab from './tabs/QuestionsTab';
import TelemetryTab from './tabs/TelemetryTab';
import AuditTab from './tabs/AuditTab';
import { adminGet, type QuestionRecord, adminPost } from '../lib/adminApi';
import { 
  CheckCircle2, Clock, MessageSquare, 
  Send, Sparkles, Trash2, X, Archive, Eye, 
  Flag, Pin, Tag, MoreHorizontal
} from 'lucide-react';

export type Tab = 'dashboard' | 'threads' | 'questions' | 'users' | 'reports' | 'analytics';

export default function Dashboard({ onLogout }: { onLogout: () => void }) {
  const [activeTab, setActiveTab] = useState<Tab>('questions');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<QuestionRecord | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load selected item details when ID changes
  useEffect(() => {
    if (selectedId) {
      const loadItem = async () => {
        const data = await adminGet<{ items: QuestionRecord[] }>('questions');
        const found = data.items.find(i => i.id === selectedId);
        setSelectedItem(found || null);
        setReplyText('');
      };
      loadItem();
    } else {
      setSelectedItem(null);
    }
  }, [selectedId]);

  const handleReply = async () => {
    if (!selectedItem || !replyText.trim()) return;
    setIsSubmitting(true);
    try {
      await adminPost('reply-question', {
        id: selectedItem.id,
        adminResponse: replyText,
        status: 'answered'
      });
      // Refresh item
      const data = await adminGet<{ items: QuestionRecord[] }>('questions');
      const updated = data.items.find(i => i.id === selectedItem.id);
      setSelectedItem(updated || null);
      setReplyText('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleStatus = async (status: 'pending' | 'answered' | 'flagged') => {
    if (!selectedItem) return;
    await adminPost('reply-question', {
      id: selectedItem.id,
      status: status,
      adminResponse: selectedItem.admin_response
    });
    setSelectedItem({ ...selectedItem, status });
  };

  return (
    <div className="admin-shell">
      {/* 1. LEFT PANEL: Navigation */}
      <Sidebar activeTab={activeTab} setTab={setActiveTab} onLogout={onLogout} />

      {/* 2. CENTER PANEL: Main Feed */}
      <main className="admin-main">
        {activeTab === 'questions' || activeTab === 'threads' ? (
          <QuestionsTab onSelect={setSelectedId} selectedId={selectedId} />
        ) : (
          <div className="feed-scroll">
             {activeTab === 'dashboard' && <TelemetryTab />}
             {activeTab === 'analytics' && <TelemetryTab />}
             {activeTab === 'reports' && <AuditTab />}
             {activeTab === 'users' && (
               <div style={{ padding: 40, textAlign: 'center' }}>
                 <Users size={48} style={{ opacity: 0.1, marginBottom: 16 }} />
                 <h2>User Management</h2>
                 <p style={{ color: 'var(--text-muted)' }}>Community directory arriving in next update.</p>
               </div>
             )}
          </div>
        )}
      </main>

      {/* 3. RIGHT PANEL: Context Panel */}
      <aside className={`context-panel${selectedItem ? ' open' : ''}`}>
        {selectedItem ? (

          <>
            <div className="context-header">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <h3>Thread Discussion</h3>
                <span style={{ fontSize: 11, color: 'var(--text-faint)' }}>ID: {selectedItem.id.slice(0, 8)}</span>
              </div>
              <button 
                onClick={() => setSelectedId(null)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <div className="context-body">
              <div className="thread-view">
                <div className="thread-original">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                    <div className="user-avatar" />
                    <div>
                      <div className="user-name">{selectedItem.author_name}</div>
                      <div className="post-time">{new Date(selectedItem.created_at).toLocaleString()}</div>
                    </div>
                  </div>
                  <h2 style={{ fontSize: 20, marginBottom: 12 }}>{selectedItem.title || 'Inquiry'}</h2>
                  <p style={{ fontSize: 15, color: 'var(--text-muted)', whiteSpace: 'pre-wrap' }}>{selectedItem.content}</p>
                  
                  <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
                    <span className={`status-pill ${selectedItem.status}`}>{selectedItem.status}</span>
                    <span className="type-tag">{selectedItem.type || 'Question'}</span>
                  </div>
                </div>

                {selectedItem.admin_response && (
                  <div className="thread-replies">
                    <div className="reply-item">
                      <div className="reply-meta">
                        <Sparkles size={12} />
                        LifeOS Team
                      </div>
                      <div className="reply-text">{selectedItem.admin_response}</div>
                      <div style={{ fontSize: 10, color: 'var(--text-faint)', marginTop: 4 }}>Just now</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="reply-area">
              <div className="reply-input-wrapper">
                <textarea 
                  className="reply-input"
                  placeholder="Type a response as LifeOS Team..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleReply();
                  }}
                />
                <div className="reply-actions">
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="icon-button" title="Templates"><Tag size={16} /></button>
                    <button className="icon-button" title="Internal Note"><Archive size={16} /></button>
                  </div>
                  <button 
                    className="admin-button admin-button-primary" 
                    style={{ minHeight: 36, padding: '0 16px', width: 'auto' }}
                    onClick={handleReply}
                    disabled={isSubmitting || !replyText.trim()}
                  >
                    <Send size={14} />
                    <span>{isSubmitting ? 'Sending...' : 'Reply'}</span>
                  </button>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: 16 }}>
                <button 
                  className="icon-button" 
                  style={{ color: selectedItem.status === 'flagged' ? 'var(--danger)' : 'inherit' }}
                  onClick={() => toggleStatus('flagged')}
                >
                  <Flag size={18} />
                </button>
                <button className="icon-button" onClick={() => toggleStatus('pending')}>
                  <Clock size={18} />
                </button>
                <button 
                  className="icon-button" 
                  style={{ color: selectedItem.status === 'answered' ? 'var(--success)' : 'inherit' }}
                  onClick={() => toggleStatus('answered')}
                >
                  <CheckCircle2 size={18} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.3 }}>
            <MessageSquare size={48} strokeWidth={1} style={{ marginBottom: 16 }} />
            <p>Select a thread to moderate</p>
          </div>
        )}
      </aside>
    </div>
  );
}

