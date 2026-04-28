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

  const updateStatus = async (id: string, status: 'past' | 'present' | 'future') => {
    await supabase.from('timeline_entries').update({ status }).eq('id', id);
    fetchPhases();
  };

  if (loading) return <div className="loading-dot" />;

  return (
    <div className="tab-stack">
      <div className="tab-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: 800, letterSpacing: '-0.04em' }}>Launch Phases</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>Manage the product roadmap and rollout stages</p>
        </div>
        <button className="button-primary">
          <Plus size={18} />
          New Phase
        </button>
      </div>

      <div className="timeline">
        {phases.map((phase) => (
          <div key={phase.id} className={`timeline-phase${phase.status === 'present' ? ' active' : ''}`}>
            <div className="timeline-dot" />
            <div className="timeline-content">
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 700 }}>{phase.title}</h3>
                    {phase.status === 'present' && (
                      <span className="live-indicator" style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}>
                        Current Phase
                      </span>
                    )}
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{phase.description}</p>
                </div>
                
                <div style={{ display: 'flex', gap: '8px' }}>
                  <select 
                    value={phase.status} 
                    onChange={(e) => updateStatus(phase.id, e.target.value as any)}
                    style={{ padding: '4px 8px', fontSize: '12px', width: 'auto' }}
                  >
                    <option value="past">Completed</option>
                    <option value="present">Active</option>
                    <option value="future">Upcoming</option>
                  </select>
                  <button className="sidebar-toggle" style={{ border: '1px solid var(--border)' }}>
                    <Edit2 size={14} />
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {phase.items?.map((item, idx) => (
                  <div 
                    key={idx} 
                    style={{ 
                      background: 'var(--page)', 
                      padding: '4px 12px', 
                      borderRadius: '999px',
                      fontSize: '13px',
                      color: 'var(--text-secondary)',
                      border: '1px solid var(--border)'
                    }}
                  >
                    {item}
                  </div>
                ))}
                <button 
                  style={{ 
                    padding: '4px 12px', 
                    borderRadius: '999px',
                    fontSize: '13px',
                    color: 'var(--accent)',
                    border: '1px dashed var(--accent)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Plus size={12} /> Add Feature
                </button>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                <button style={{ color: 'var(--text-faint)' }} title="Move Up"><ArrowUp size={16} /></button>
                <button style={{ color: 'var(--text-faint)' }} title="Move Down"><ArrowDown size={16} /></button>
                <button style={{ color: 'var(--danger)', opacity: 0.5 }}><Trash2 size={16} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
