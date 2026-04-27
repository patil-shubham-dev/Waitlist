import { useEffect, useState } from 'react';
import { Plus, Save, Trash2 } from 'lucide-react';
import { adminGet, adminPost, type PhaseRecord } from '../../lib/adminApi';

type Draft = {
  id?: string;
  title: string;
  description: string;
  status: 'past' | 'present' | 'future';
  sort_order: number;
  items: string;
};

const EMPTY_DRAFT: Draft = {
  title: '',
  description: '',
  status: 'future',
  sort_order: 1,
  items: '',
};

export default function TimelineTab() {
  const [items, setItems] = useState<PhaseRecord[]>([]);
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const [message, setMessage] = useState('');

  const load = async () => {
    const data = await adminGet<{ items: PhaseRecord[] }>('phases');
    setItems(data.items);
  };

  useEffect(() => {
    load();
  }, []);

  const edit = (item: PhaseRecord) => {
    setDraft({
      id: item.id,
      title: item.title,
      description: item.description || '',
      status: item.status,
      sort_order: item.sort_order,
      items: (item.items || []).join('\n'),
    });
  };

  const save = async () => {
    await adminPost('save-phase', {
      ...draft,
      items: draft.items.split('\n').map((item) => item.trim()).filter(Boolean),
    });
    setDraft({ ...EMPTY_DRAFT, sort_order: items.length + 1 });
    setMessage('Phase saved.');
    await load();
  };

  const remove = async (id: string) => {
    if (!window.confirm('Delete this launch phase?')) return;
    await adminPost('delete-phase', { id });
    await load();
  };

  return (
    <div className="tab-stack">
      <div className="tab-header">
        <div>
          <h1>Launch phases</h1>
          <p>Control the public phases section and keep the rollout aligned with the LifeOS product story.</p>
        </div>
      </div>

      {message && <p className="admin-success">{message}</p>}

      <div className="content-grid">
        <section className="panel-card">
          <div className="section-row">
            <div>
              <h2>{draft.id ? 'Edit phase' : 'Add phase'}</h2>
              <p>Each phase is shown publicly on the landing page.</p>
            </div>
            {!draft.id && (
              <button className="admin-button" onClick={() => setDraft({ ...EMPTY_DRAFT, sort_order: items.length + 1 })}>
                <Plus size={16} />
                New
              </button>
            )}
          </div>
          <div className="form-stack">
            <label>
              <span>Title</span>
              <input value={draft.title} onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))} />
            </label>
            <label>
              <span>Description</span>
              <textarea rows={4} value={draft.description} onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))} />
            </label>
            <div className="form-split">
              <label>
                <span>Status</span>
                <select value={draft.status} onChange={(event) => setDraft((current) => ({ ...current, status: event.target.value as Draft['status'] }))}>
                  <option value="past">Past</option>
                  <option value="present">Present</option>
                  <option value="future">Future</option>
                </select>
              </label>
              <label>
                <span>Sort order</span>
                <input type="number" value={draft.sort_order} onChange={(event) => setDraft((current) => ({ ...current, sort_order: Number(event.target.value) }))} />
              </label>
            </div>
            <label>
              <span>Bullet items (one per line)</span>
              <textarea rows={5} value={draft.items} onChange={(event) => setDraft((current) => ({ ...current, items: event.target.value }))} />
            </label>
            <button className="admin-button admin-button-primary" onClick={save}>
              <Save size={16} />
              Save phase
            </button>
          </div>
        </section>

        <section className="panel-card">
          <h2>Current phases</h2>
          <div className="list-stack">
            {items.map((item) => (
              <article className="list-card" key={item.id}>
                <div className="section-row">
                  <div>
                    <strong>{item.title}</strong>
                    <p>{item.description}</p>
                  </div>
                  <span className={`status-pill ${item.status === 'past' ? 'ok' : item.status === 'present' ? 'pending' : ''}`}>
                    {item.status}
                  </span>
                </div>
                <div className="tag-row">
                  {(item.items || []).map((bullet) => (
                    <span className="tag" key={bullet}>{bullet}</span>
                  ))}
                </div>
                <div className="table-actions">
                  <button className="admin-button" onClick={() => edit(item)}>Edit</button>
                  <button className="icon-button danger" onClick={() => remove(item.id)}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
