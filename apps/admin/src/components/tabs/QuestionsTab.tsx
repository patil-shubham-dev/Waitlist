import { useEffect, useState, useMemo } from 'react';
import { 
  Search, Filter, SortDesc, Pin, 
  Eye, EyeOff, Trash2, MoreHorizontal,
  ChevronRight, MessageCircle
} from 'lucide-react';
import { adminGet, adminPost, type QuestionRecord } from '../../lib/adminApi';

interface QuestionsTabProps {
  onSelect: (id: string) => void;
  selectedId: string | null;
}

export default function QuestionsTab({ onSelect, selectedId }: QuestionsTabProps) {
  const [items, setItems] = useState<QuestionRecord[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [isBusy, setIsBusy] = useState(false);

  const load = async () => {
    setIsBusy(true);
    try {
      const data = await adminGet<{ items: QuestionRecord[] }>('questions');
      setItems(data.items);
    } catch (err) {
      console.error(err);
    } finally {
      setIsBusy(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

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

  const handleAction = async (e: React.MouseEvent, action: string, item: QuestionRecord) => {
    e.stopPropagation();
    if (action === 'delete') {
      if (!window.confirm('Delete this post?')) return;
      await adminPost('delete-question', { id: item.id });
    } else if (action === 'feature') {
      await adminPost('toggle-question-featured', { id: item.id, isFeatured: !item.is_featured });
    } else if (action === 'visibility') {
      await adminPost('toggle-question-visibility', { id: item.id, isPublic: !item.is_public });
    }
    load();
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

      <aside className="panel" style={{ height: 'fit-content', position: 'sticky', top: '40px' }}>
        <div className="panel-header">
          <h2>Thread Context</h2>
          <p>Quick filters and moderation tools</p>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div className="stat-label">Sort by</div>
          <select style={{ width: '100%' }}>
            <option>Newest first</option>
            <option>Oldest first</option>
            <option>Most helpful</option>
          </select>
          
          <div className="stat-label" style={{ marginTop: '12px' }}>Bulk Actions</div>
          <button className="sidebar-link" style={{ border: '1px solid var(--border)' }}>
             <Trash2 size={16} />
             <span>Delete Selected</span>
          </button>
        </div>
      </aside>
    </div>
  );
}
