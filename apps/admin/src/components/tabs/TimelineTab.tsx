import { useEffect, useState } from 'react';
import { supabase, type TimelineEntry } from '../../lib/supabase';
import { CheckCircle2, Clock, Calendar, Edit2, Plus, Trash2, ArrowUp, ArrowDown } from 'lucide-react';

export default function TimelineTab() {
  const [phases, setPhases] = useState<TimelineEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchPhases = async () => {
    const { data } = await supabase
      .from('timeline_entries')
      .select('*')
      .order('sort_order', { ascending: true });
    
    setPhases(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchPhases();
  }, []);

  const handleUpdateStatus = async (id: string, status: 'past' | 'present' | 'future') => {
    await supabase.from('timeline_entries').update({ status }).eq('id', id);
    fetchPhases();
  };

  const handleAddPhase = async () => {
    const lastOrder = phases.length > 0 ? Math.max(...phases.map(p => p.sort_order)) : 0;
    await supabase.from('timeline_entries').insert({
      title: 'New Phase',
      description: 'Describe this launch stage...',
      status: 'future',
      sort_order: lastOrder + 1,
      items: []
    });
    fetchPhases();
  };

  const handleDeletePhase = async (id: string) => {
    if (!confirm('Are you sure you want to delete this phase?')) return;
    await supabase.from('timeline_entries').delete().eq('id', id);
    fetchPhases();
  };

  const handleEditPhase = async (id: string, updates: Partial<TimelineEntry>) => {
    await supabase.from('timeline_entries').update(updates).eq('id', id);
    setEditingId(null);
    fetchPhases();
  };

  const handleAddFeature = async (id: string, currentItems: string[] | null) => {
    const newItem = prompt('Enter new feature/milestone:');
    if (!newItem) return;
    const items = [...(currentItems || []), newItem];
    await supabase.from('timeline_entries').update({ items }).eq('id', id);
    fetchPhases();
  };

  const handleRemoveFeature = async (id: string, currentItems: string[], index: number) => {
    const items = currentItems.filter((_, i) => i !== index);
    await supabase.from('timeline_entries').update({ items }).eq('id', id);
    fetchPhases();
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= phases.length) return;

    const current = phases[index];
    const target = phases[targetIndex];

    await Promise.all([
      supabase.from('timeline_entries').update({ sort_order: target.sort_order }).eq('id', current.id),
      supabase.from('timeline_entries').update({ sort_order: current.sort_order }).eq('id', target.id)
    ]);
    
    fetchPhases();
  };

  if (loading) return <div className="loading-dot" />;

  return (
    <div className="tab-stack">
      <div className="tab-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: 800, letterSpacing: '-0.04em' }}>Launch Phases</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>Control the public roadmap sync on the landing page</p>
        </div>
        <button className="button-primary" onClick={handleAddPhase}>
          <Plus size={18} />
          New Phase
        </button>
      </div>

      <div className="timeline-admin-stack">
        {phases.map((phase, index) => (
          <div key={phase.id} className={`timeline-phase-card ${phase.status === 'present' ? 'active' : ''}`}>
            <div className="phase-card-main">
              <div className="phase-card-header">
                {editingId === phase.id ? (
                  <div className="edit-form">
                    <input 
                      autoFocus
                      defaultValue={phase.title} 
                      onBlur={(e) => handleEditPhase(phase.id, { title: e.target.value })}
                      onKeyDown={(e) => e.key === 'Enter' && handleEditPhase(phase.id, { title: e.currentTarget.value })}
                      placeholder="Title"
                    />
                    <textarea 
                      defaultValue={phase.description || ''} 
                      onBlur={(e) => handleEditPhase(phase.id, { description: e.target.value })}
                      placeholder="Description"
                      rows={2}
                    />
                  </div>
                ) : (
                  <div className="view-mode" onClick={() => setEditingId(phase.id)}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <h3>{phase.title}</h3>
                      {phase.status === 'present' && <span className="status-badge-mini">Active</span>}
                    </div>
                    <p>{phase.description}</p>
                  </div>
                )}

                <div className="phase-actions">
                  <select 
                    className="status-select-admin"
                    value={phase.status} 
                    onChange={(e) => handleUpdateStatus(phase.id, e.target.value as any)}
                  >
                    <option value="past">Completed</option>
                    <option value="present">In Progress</option>
                    <option value="future">Upcoming</option>
                  </select>
                  
                  <div className="order-actions">
                    <button disabled={index === 0} onClick={() => handleMove(index, 'up')}><ArrowUp size={14} /></button>
                    <button disabled={index === phases.length - 1} onClick={() => handleMove(index, 'down')}><ArrowDown size={14} /></button>
                  </div>

                  <button className="delete-phase-btn" onClick={() => handleDeletePhase(phase.id)}><Trash2 size={16} /></button>
                </div>
              </div>

              <div className="phase-items-list">
                {phase.items?.map((item, idx) => (
                  <div key={idx} className="phase-item-chip">
                    <span>{item}</span>
                    <button onClick={() => handleRemoveFeature(phase.id, phase.items!, idx)}><X size={10} /></button>
                  </div>
                ))}
                <button className="add-item-btn" onClick={() => handleAddFeature(phase.id, phase.items)}>
                  <Plus size={12} /> Add Feature
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        .timeline-admin-stack { display: flex; flex-direction: column; gap: 16px; margin-top: 24px; }
        .timeline-phase-card { background: #fff; border: 1px solid var(--border); border-radius: 16px; overflow: hidden; }
        .timeline-phase-card.active { border-left: 4px solid var(--accent); }
        .phase-card-main { padding: 20px; }
        .phase-card-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 24px; margin-bottom: 16px; }
        .edit-form { flex: 1; display: flex; flex-direction: column; gap: 8px; }
        .edit-form input { font-size: 18px; font-weight: 700; border: none; border-bottom: 1px dashed var(--accent); padding: 0; background: none; outline: none; }
        .edit-form textarea { font-size: 14px; border: none; color: var(--text-secondary); background: none; resize: none; outline: none; padding: 0; }
        .view-mode { flex: 1; cursor: pointer; }
        .view-mode h3 { font-size: 18px; font-weight: 700; color: var(--text); }
        .view-mode p { font-size: 14px; color: var(--text-secondary); margin-top: 2px; }
        .phase-actions { display: flex; align-items: center; gap: 12px; }
        .status-select-admin { background: var(--page); border: 1px solid var(--border); border-radius: 8px; padding: 4px 8px; font-size: 12px; font-weight: 600; outline: none; cursor: pointer; }
        .order-actions { display: flex; gap: 4px; }
        .order-actions button { width: 28px; height: 28px; display: grid; place-items: center; border: 1px solid var(--border); border-radius: 6px; color: var(--text-faint); background: #fff; cursor: pointer; }
        .order-actions button:disabled { opacity: 0.3; cursor: not-allowed; }
        .delete-phase-btn { color: #f43f5e; opacity: 0.5; cursor: pointer; transition: opacity 0.2s; }
        .delete-phase-btn:hover { opacity: 1; }
        .phase-items-list { display: flex; flex-wrap: wrap; gap: 8px; }
        .phase-item-chip { display: flex; align-items: center; gap: 6px; background: var(--page); border: 1px solid var(--border); padding: 4px 10px; border-radius: 999px; font-size: 13px; color: var(--text-secondary); }
        .phase-item-chip button { background: none; border: none; color: var(--text-faint); cursor: pointer; display: grid; place-items: center; }
        .phase-item-chip button:hover { color: #f43f5e; }
        .add-item-btn { border: 1px dashed var(--accent); color: var(--accent); background: none; padding: 4px 12px; border-radius: 999px; font-size: 13px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 4px; }
        .status-badge-mini { background: var(--accent-soft); color: var(--accent); font-size: 10px; font-weight: 800; padding: 2px 6px; border-radius: 4px; text-transform: uppercase; }
      `}</style>
    </div>
  );
}
