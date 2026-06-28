import { useEffect, useState } from 'react';
import { supabase, type TimelineEntry } from '../../lib/supabase';
import { Plus, Trash2, ArrowUp, ArrowDown, X } from 'lucide-react';

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

  useEffect(() => { fetchPhases(); }, []);

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
      <div className="page-header">
        <div>
          <h1>Launch Phases</h1>
          <p>Control the public roadmap displayed on the landing page</p>
        </div>
        <button className="btn btn-primary" onClick={handleAddPhase}>
          <Plus size={16} />
          New Phase
        </button>
      </div>

      <div className="timeline-stack">
        {phases.map((phase, index) => (
          <div key={phase.id} className={`phase-card${phase.status === 'present' ? ' active' : ''}`}>
            <div className="phase-body">
              <div className="phase-top">
                {editingId === phase.id ? (
                  <div className="edit-inline">
                    <input
                      autoFocus
                      defaultValue={phase.title}
                      onBlur={(e) => handleEditPhase(phase.id, { title: e.target.value })}
                      onKeyDown={(e) => e.key === 'Enter' && handleEditPhase(phase.id, { title: e.currentTarget.value })}
                      placeholder="Phase title"
                    />
                    <textarea
                      defaultValue={phase.description || ''}
                      onBlur={(e) => handleEditPhase(phase.id, { description: e.target.value })}
                      placeholder="Phase description"
                      rows={2}
                    />
                  </div>
                ) : (
                  <div className="phase-title-area" onClick={() => setEditingId(phase.id)} style={{ cursor: 'pointer' }}>
                    <div className="phase-title">
                      {phase.title}
                      {phase.status === 'present' && <span className="phase-active-badge">Active</span>}
                    </div>
                    <div className="phase-desc">{phase.description}</div>
                  </div>
                )}

                <div className="phase-controls">
                  <select
                    className="phase-select"
                    value={phase.status}
                    onChange={(e) => handleUpdateStatus(phase.id, e.target.value as any)}
                  >
                    <option value="past">Completed</option>
                    <option value="present">In Progress</option>
                    <option value="future">Upcoming</option>
                  </select>

                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button className="phase-move-btn" disabled={index === 0} onClick={() => handleMove(index, 'up')}>
                      <ArrowUp size={13} />
                    </button>
                    <button className="phase-move-btn" disabled={index === phases.length - 1} onClick={() => handleMove(index, 'down')}>
                      <ArrowDown size={13} />
                    </button>
                  </div>

                  <button className="phase-delete" onClick={() => handleDeletePhase(phase.id)}>
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              <div className="phase-features">
                {phase.items?.map((item, idx) => (
                  <div key={idx} className="feature-chip">
                    <span>{item}</span>
                    <button onClick={() => handleRemoveFeature(phase.id, phase.items!, idx)}>
                      <X size={10} />
                    </button>
                  </div>
                ))}
                <button className="feature-add" onClick={() => handleAddFeature(phase.id, phase.items)}>
                  <Plus size={12} /> Add Feature
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
