import { useEffect, useState, useMemo, useCallback } from 'react';
import {
  Search, Pin, Eye, EyeOff, Trash2, Send, MessageCircle
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
    } catch {
      showToast('Failed to load questions');
    } finally {
      setIsBusy(false);
    }
  };

  useEffect(() => { load(); }, []);

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
      return matchesSearch && matchesStatus;
    });
  }, [items, search, statusFilter]);

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
    } catch {
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
    } catch {
      showToast('Failed to send reply');
    } finally {
      setIsActionBusy(false);
    }
  };

  return (
    <div className="mod-layout">
      <div className="tab-stack">
        <header className="panel" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', gap: '12px' }}>
            <div className="search-wrap">
              <Search size={16} className="search-icon" />
              <input
                className="search-input"
                type="text"
                placeholder="Search community posts..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ width: 'auto', minWidth: '120px' }}
            >
              <option value="all">All Status</option>
              <option value="open">Open</option>
              <option value="answered">Answered</option>
              <option value="planned">Planned</option>
            </select>
          </div>
        </header>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {isBusy && items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <div className="loading-dot" />
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="empty-state">
              <MessageCircle size={48} strokeWidth={1} />
              <p>No threads found matching your filters.</p>
            </div>
          ) : (
            filteredItems.map((item) => (
              <article
                key={item.id}
                className={`panel post-card${selectedId === item.id ? ' selected' : ''}`}
                onClick={() => onSelect(item.id)}
              >
                <div className="post-meta">
                  <div className="post-avatar" />
                  <div>
                    <div className="post-author">{item.author_name}</div>
                    <div className="post-date">{new Date(item.created_at).toLocaleDateString()}</div>
                  </div>
                  <div className="post-actions">
                    <button
                      className="btn-icon"
                      style={{ color: item.is_featured ? 'var(--accent)' : 'inherit' }}
                      onClick={(e) => handleAction(e, 'feature', item)}
                      title={item.is_featured ? 'Unpin' : 'Pin'}
                    >
                      <Pin size={13} />
                    </button>
                    <button
                      className="btn-icon"
                      onClick={(e) => handleAction(e, 'visibility', item)}
                      title={item.is_public ? 'Hide' : 'Show'}
                    >
                      {item.is_public ? <Eye size={13} /> : <EyeOff size={13} />}
                    </button>
                  </div>
                </div>

                <h3 className="post-title">{item.title || 'Inquiry'}</h3>
                <p className="post-body">
                  {item.content.length > 200 ? item.content.slice(0, 200) + '...' : item.content}
                </p>

                <div className="post-footer">
                  <span className={`status-badge ${item.status}`}>{item.status}</span>
                  <span className="type-badge">{item.type || 'Thread'}</span>
                </div>
              </article>
            ))
          )}
        </div>
      </div>

      <aside className="mod-sidebar">
        {selectedItem ? (
          <>
            <div className="panel">
              <div className="panel-header" style={{ marginBottom: '12px' }}>
                <div>
                  <div className="mod-section-label">Moderation Panel</div>
                  <h2 style={{ fontSize: '16px', fontWeight: 700, marginTop: '6px' }}>Thread Detail</h2>
                </div>
              </div>

              <div className="mod-detail-box" style={{ marginBottom: '20px' }}>
                <div className="mod-section-label">Post Content</div>
                <p style={{ lineHeight: 1.6 }}>{selectedItem.content}</p>
              </div>

              <form onSubmit={handleReply} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="mod-section-label">Response</div>
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type your official response..."
                  rows={5}
                  required
                  disabled={isActionBusy}
                />
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: '100%', justifyContent: 'center' }}
                  disabled={isActionBusy || !replyText.trim() || replyText === selectedItem.admin_response}
                >
                  {isActionBusy ? <div className="spinner" /> : <Send size={15} />}
                  <span>{selectedItem.admin_response ? 'Update Reply' : 'Send Response'}</span>
                </button>
              </form>
            </div>

            <div className="panel">
              <div className="mod-section-label">Critical Actions</div>
              <button
                className="btn btn-danger"
                style={{ width: '100%', justifyContent: 'center', marginTop: '10px' }}
                onClick={() => handleAction(null, 'delete', selectedItem)}
                disabled={isActionBusy}
              >
                <Trash2 size={15} />
                <span>Delete Thread</span>
              </button>
            </div>
          </>
        ) : (
          <div className="panel" style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-faint)' }}>
            <MessageCircle size={32} strokeWidth={1} style={{ opacity: 0.3, marginBottom: '12px' }} />
            <p style={{ fontSize: '13px' }}>Select a thread to moderate</p>
          </div>
        )}

        <div className="toast-container">
          {toasts.map(toast => (
            <div key={toast.id} className="toast">{toast.message}</div>
          ))}
        </div>
      </aside>
    </div>
  );
}
