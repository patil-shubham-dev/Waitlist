import { useEffect, useState, useMemo, useCallback } from 'react';
import { 
  Search, Filter, SortDesc, Pin, 
  Eye, EyeOff, Trash2, MoreHorizontal,
  ChevronRight, MessageCircle, Send, Check
} from 'lucide-react';
import { adminGet, adminPost, type QuestionRecord } from '../../lib/adminApi';

interface QuestionsTabProps {
  onSelect: (id: string) => void;
  selectedId: string | null;
}

const TOAST_DURATION = 3000;

export default function QuestionsTab({ onSelect, selectedId }: QuestionsTabProps) {
  const [items, setItems] = useState<QuestionRecord[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [isBusy, setIsBusy] = useState(false);
  const [isActionBusy, setIsActionBusy] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [toasts, setToasts] = useState<{ id: number; message: string }[]>([]);


  const showToast = useCallback((message: string) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, TOAST_DURATION);
  }, []);

  const load = async () => {
    setIsBusy(true);
    try {
      const data = await adminGet<{ items: QuestionRecord[] }>('questions');
      setItems(data.items);
    } catch (err) {
      console.error(err);
      showToast('Failed to load questions');
    } finally {
      setIsBusy(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const selectedItem = useMemo(() => 
    items.find(i => i.id === selectedId),
  [items, selectedId]);

  useEffect(() => {
    if (selectedItem) {
      setReplyText(selectedItem.admin_response || '');
    }
  }, [selectedId, selectedItem]);

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesSearch = (item.title?.toLowerCase().includes(search.toLowerCase()) || 
                             item.content?.toLowerCase().includes(search.toLowerCase()) ||
                             item.author_name?.toLowerCase().includes(search.toLowerCase()));
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      const matchesType = typeFilter === 'all' || item.type === typeFilter;
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [items, search, statusFilter, typeFilter]);

  const handleAction = async (e: React.MouseEvent | null, action: string, item: QuestionRecord) => {
    e?.stopPropagation();
    setIsActionBusy(true);
    try {
      if (action === 'delete') {
        if (!window.confirm('Delete this post?')) return;
        await adminPost('delete-question', { id: item.id });
        setItems(prev => prev.filter(i => i.id !== item.id));
        if (selectedId === item.id) onSelect('');
        showToast('Deleted successfully');
      } else if (action === 'feature') {
        await adminPost('toggle-question-featured', { id: item.id, isFeatured: !item.is_featured });
        setItems(prev => prev.map(i => i.id === item.id ? { ...i, is_featured: !i.is_featured } : i));
      } else if (action === 'visibility') {
        await adminPost('toggle-question-visibility', { id: item.id, isPublic: !item.is_public });
        setItems(prev => prev.map(i => i.id === item.id ? { ...i, is_public: !i.is_public } : i));
      }
    } catch (err) {
      showToast('Action failed');
    } finally {
      setIsActionBusy(false);
    }
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem || !replyText.trim()) return;

    setIsActionBusy(true);
    try {
      await adminPost('reply-question', {
        id: selectedItem.id,
        adminResponse: replyText,
        status: 'answered',
        isFeatured: selectedItem.is_featured,
        isPublic: selectedItem.is_public
      });
      
      setItems(prev => prev.map(i => i.id === selectedId ? { 
        ...i, 
        admin_response: replyText, 
        status: 'answered',
        admin_responded_at: new Date().toISOString()
      } : i));
      
      showToast('Reply sent');
    } catch (err) {
      showToast('Failed to send reply');
    } finally {
      setIsActionBusy(false);
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 350px', gap: '24px' }}>
      <div className="tab-stack">
        <header className="panel" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)' }} />
              <input 
                type="text" 
                placeholder="Search community posts..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ paddingLeft: '40px' }}
              />
            </div>
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ width: 'auto' }}
            >
              <option value="all">Status</option>
              <option value="pending">Pending</option>
              <option value="answered">Answered</option>
              <option value="flagged">Flagged</option>
            </select>
          </div>
        </header>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {isBusy && items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40 }}><div className="loading-dot" /></div>
          ) : filteredItems.length === 0 ? (
            <div className="panel" style={{ textAlign: 'center', padding: 60, color: 'var(--text-faint)' }}>
              <MessageCircle size={48} strokeWidth={1} style={{ marginBottom: 16, opacity: 0.2 }} />
              <p>No threads found matching your filters.</p>
            </div>
          ) : (
            filteredItems.map((item) => (
              <article 
                key={item.id} 
                className={`panel${selectedId === item.id ? ' active' : ''}`}
                onClick={() => onSelect(item.id)}
                style={{ 
                  cursor: 'pointer', 
                  transition: 'var(--transition)',
                  borderColor: selectedId === item.id ? 'var(--accent)' : 'var(--border)',
                  borderWidth: selectedId === item.id ? '2px' : '1px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--page)' }} />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '14px' }}>{item.author_name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-faint)' }}>{new Date(item.created_at).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '4px' }}>
                     <button 
                      className="sidebar-toggle" 
                      style={{ color: item.is_featured ? 'var(--accent)' : 'inherit' }}
                      onClick={(e) => handleAction(e, 'feature', item)}
                     >
                       <Pin size={14} />
                     </button>
                     <button 
                      className="sidebar-toggle" 
                      onClick={(e) => handleAction(e, 'visibility', item)}
                     >
                       {item.is_public ? <Eye size={14} /> : <EyeOff size={14} />}
                     </button>
                  </div>
                </div>

                <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '8px' }}>{item.title || 'Inquiry'}</h3>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineBreak: 'anywhere', marginBottom: '16px' }}>
                  {item.content.length > 200 ? item.content.slice(0, 200) + '...' : item.content}
                </p>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <span style={{ 
                    fontSize: '11px', 
                    fontWeight: 700, 
                    textTransform: 'uppercase',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    background: 'var(--page)',
                    color: 'var(--text-secondary)'
                  }}>
                    {item.status}
                  </span>
                  <span style={{ 
                    fontSize: '11px', 
                    fontWeight: 700, 
                    textTransform: 'uppercase',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    background: 'var(--accent-soft)',
                    color: 'var(--accent)'
                  }}>
                    {item.type || 'Thread'}
                  </span>
                </div>
              </article>
            ))
          )}
        </div>
      </div>

      <aside className="mod-aside" style={{ position: 'sticky', top: '0' }}>
        {selectedItem ? (
          <div className="tab-stack">
            <div className="panel">
              <div className="panel-header" style={{ marginBottom: '16px' }}>
                <span className="stat-label">MODERATION PANEL</span>
                <h2 style={{ marginTop: '8px' }}>Thread Detail</h2>
              </div>

              <div className="mod-detail-card" style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-faint)', marginBottom: '8px' }}>POST CONTENT</div>
                <p style={{ fontSize: '14px', lineHeight: 1.5, color: 'var(--text)' }}>
                  {selectedItem.content}
                </p>
              </div>

              <form className="mod-reply-form" onSubmit={handleReply}>
                <div className="stat-label">Response</div>
                <textarea 
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type your official response..."
                  rows={6}
                  required
                  disabled={isActionBusy}
                />
                <button 
                  type="submit" 
                  className="button-primary" 
                  style={{ width: '100%', justifyContent: 'center' }}
                  disabled={isActionBusy || !replyText.trim() || replyText === selectedItem.admin_response}
                >
                  {isActionBusy ? <div className="spinner" /> : <Send size={16} />}
                  <span>{selectedItem.admin_response ? 'Update Reply' : 'Send Response'}</span>
                </button>
              </form>
            </div>

            <div className="panel mod-actions">
              <div className="stat-label">Critical Actions</div>
              <button 
                className="mod-delete-btn"
                onClick={() => handleAction(null, 'delete', selectedItem)}
                disabled={isActionBusy}
              >
                <Trash2 size={16} />
                <span>Delete Thread</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="panel" style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-faint)' }}>
            <MessageCircle size={32} strokeWidth={1} style={{ marginBottom: '12px', opacity: 0.3 }} />
            <p style={{ fontSize: '13px' }}>Select a thread to moderate</p>
          </div>
        )}

        <div className="toast-container">
          {toasts.map(toast => (
            <div key={toast.id} className="toast">
              {toast.message}
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}

