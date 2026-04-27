import { useEffect, useState, useMemo } from 'react';
import { 
  Search, Filter, SortDesc, Pin, 
  Eye, EyeOff, Trash2, MoreHorizontal,
  ChevronRight
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
    <>
      <header className="feed-header">
        <div className="search-box">
          <Search size={16} />
          <input 
            type="text" 
            placeholder="Search threads, users, or keywords..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ minHeight: 36, padding: '0 12px', fontSize: 13, width: 'auto' }}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="answered">Answered</option>
            <option value="flagged">Flagged</option>
          </select>

          <select 
            value={typeFilter} 
            onChange={(e) => setTypeFilter(e.target.value)}
            style={{ minHeight: 36, padding: '0 12px', fontSize: 13, width: 'auto' }}
          >
            <option value="all">All Types</option>
            <option value="question">Questions</option>
            <option value="suggestion">Suggestions</option>
            <option value="bug">Bugs</option>
            <option value="feature">Features</option>
          </select>
        </div>
      </header>

      <div className="feed-scroll">
        {isBusy && items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, opacity: 0.5 }}>Loading feed...</div>
        ) : filteredItems.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, opacity: 0.5 }}>No threads found.</div>
        ) : (
          filteredItems.map((item) => (
            <article 
              key={item.id} 
              className={`mod-card ${selectedId === item.id ? 'active' : ''}`}
              onClick={() => onSelect(item.id)}
            >
              <div className="card-top">
                <div className="user-info">
                  <div className="user-avatar" />
                  <div className="user-meta">
                    <span className="user-name">{item.author_name}</span>
                    <span className="post-time">{new Date(item.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                   <button 
                    className="icon-button" 
                    style={{ width: 32, height: 32, color: item.is_featured ? 'var(--accent)' : 'inherit' }}
                    onClick={(e) => handleAction(e, 'feature', item)}
                   >
                     <Pin size={14} />
                   </button>
                   <button 
                    className="icon-button" 
                    style={{ width: 32, height: 32 }}
                    onClick={(e) => handleAction(e, 'visibility', item)}
                   >
                     {item.is_public ? <Eye size={14} /> : <EyeOff size={14} />}
                   </button>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <h2 style={{ fontSize: 15 }}>{item.title || 'Untitled Discussion'}</h2>
                <p className="card-content">{item.content}</p>
              </div>

              <div className="card-tags">
                <span className={`status-pill ${item.status}`}>{item.status}</span>
                <span className="type-tag">{item.type || 'Question'}</span>
                {item.is_featured && <span className="type-tag" style={{ color: 'var(--accent)' }}>Featured</span>}
                {!item.is_public && <span className="type-tag" style={{ opacity: 0.5 }}>Hidden</span>}
              </div>
            </article>
          ))
        )}
      </div>
    </>
  );
}

