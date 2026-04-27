import { useEffect, useState } from 'react';
import { Eye, EyeOff, Pin, Save, Trash2 } from 'lucide-react';
import { adminGet, adminPost, type QuestionRecord } from '../../lib/adminApi';

type ReplyState = Record<string, string>;

export default function QuestionsTab() {
  const [items, setItems] = useState<QuestionRecord[]>([]);
  const [draftReplies, setDraftReplies] = useState<ReplyState>({});
  const [busyId, setBusyId] = useState('');

  const load = async () => {
    const data = await adminGet<{ items: QuestionRecord[] }>('questions');
    setItems(data.items);
    setDraftReplies(
      data.items.reduce<ReplyState>((acc, item) => {
        acc[item.id] = item.admin_response || '';
        return acc;
      }, {}),
    );
  };

  useEffect(() => {
    load();
  }, []);

  const saveReply = async (item: QuestionRecord) => {
    setBusyId(item.id);
    await adminPost('reply-question', {
      id: item.id,
      adminResponse: draftReplies[item.id] || '',
      status: draftReplies[item.id] ? 'answered' : item.status,
      isFeatured: item.is_featured,
      isPublic: item.is_public,
    });
    await load();
    setBusyId('');
  };

  const toggleFeature = async (item: QuestionRecord) => {
    setBusyId(item.id);
    await adminPost('toggle-question-featured', { id: item.id, isFeatured: !item.is_featured });
    await load();
    setBusyId('');
  };

  const toggleVisibility = async (item: QuestionRecord) => {
    setBusyId(item.id);
    await adminPost('toggle-question-visibility', { id: item.id, isPublic: !item.is_public });
    await load();
    setBusyId('');
  };

  const remove = async (id: string) => {
    if (!window.confirm('Delete this public post?')) return;
    setBusyId(id);
    await adminPost('delete-question', { id });
    await load();
    setBusyId('');
  };

  return (
    <div className="tab-stack">
      <div className="tab-header">
        <div>
          <h1>Public Q&amp;A and feedback wall</h1>
          <p>Answer visitor questions, highlight the best threads, and hide anything you do not want public.</p>
        </div>
      </div>

      <div className="list-stack">
        {items.map((item) => (
          <article className="panel-card" key={item.id}>
            <div className="section-row">
              <div>
                <h2>{item.title || 'Untitled post'}</h2>
                <p>{item.author_name} · {item.email} · {item.type} · {new Date(item.created_at).toLocaleString()}</p>
              </div>
              <div className="table-actions">
                <button className="icon-button" disabled={busyId === item.id} onClick={() => toggleFeature(item)}>
                  <Pin size={16} />
                </button>
                <button className="icon-button" disabled={busyId === item.id} onClick={() => toggleVisibility(item)}>
                  {item.is_public ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>
                <button className="icon-button danger" disabled={busyId === item.id} onClick={() => remove(item.id)}>
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <p>{item.content}</p>

            <div className="tag-row">
              <span className={`status-pill ${item.status === 'answered' ? 'ok' : 'pending'}`}>{item.status}</span>
              {item.is_featured && <span className="tag">featured</span>}
              {!item.is_public && <span className="tag">hidden</span>}
            </div>

            <label>
              <span>Admin reply</span>
              <textarea
                rows={4}
                value={draftReplies[item.id] || ''}
                onChange={(event) =>
                  setDraftReplies((current) => ({ ...current, [item.id]: event.target.value }))
                }
              />
            </label>

            <div className="table-actions">
              <button className="admin-button admin-button-primary" disabled={busyId === item.id} onClick={() => saveReply(item)}>
                <Save size={16} />
                Save reply
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
