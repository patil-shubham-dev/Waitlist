import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { UserPlus, MessageCircle, ShieldCheck, Zap } from 'lucide-react';

type ActivityEvent = {
  id: string;
  type: 'signup' | 'question' | 'admin_reply' | 'phase_change';
  title: string;
  detail: string;
  timestamp: string;
};

export default function ActivityFeed() {
  const [events, setEvents] = useState<ActivityEvent[]>([]);

  useEffect(() => {
    // Initial fetch of recent activity
    const fetchRecent = async () => {
      // Fetch signups
      const { data: signups } = await supabase
        .from('waitlist')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      // Fetch questions
      const { data: questions } = await supabase
        .from('questions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      const combined: ActivityEvent[] = [
        ...(signups || []).map(s => ({
          id: s.id,
          type: 'signup' as const,
          title: 'New Signup',
          detail: `${s.email} joined the waitlist`,
          timestamp: s.created_at
        })),
        ...(questions || []).map(q => ({
          id: q.id,
          type: 'question' as const,
          title: 'New Question',
          detail: q.question.slice(0, 50) + (q.question.length > 50 ? '...' : ''),
          timestamp: q.created_at
        }))
      ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      setEvents(combined.slice(0, 10));
    };

    fetchRecent();

    // Subscribe to real-time changes
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'waitlist' },
        (payload) => {
          const newEvent: ActivityEvent = {
            id: payload.new.id,
            type: 'signup',
            title: 'New Signup',
            detail: `${payload.new.email} joined the waitlist`,
            timestamp: payload.new.created_at
          };
          setEvents(prev => [newEvent, ...prev].slice(0, 10));
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'questions' },
        (payload) => {
          const newEvent: ActivityEvent = {
            id: payload.new.id,
            type: 'question',
            title: 'New Question',
            detail: payload.new.question.slice(0, 50),
            timestamp: payload.new.created_at
          };
          setEvents(prev => [newEvent, ...prev].slice(0, 10));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="panel">
      <div className="panel-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2>Real-time Activity</h2>
          <p>Live stream of system events</p>
        </div>
        <div className="live-indicator">
          <div className="live-dot" />
          Live
        </div>
      </div>

      <div className="activity-feed">
        {events.length === 0 ? (
          <p style={{ color: 'var(--text-faint)', textAlign: 'center', padding: '40px 0' }}>Waiting for activity...</p>
        ) : (
          events.map(event => (
            <div key={event.id} className="activity-item">
              <div className="activity-icon">
                {event.type === 'signup' && <UserPlus size={18} />}
                {event.type === 'question' && <MessageCircle size={18} />}
                {event.type === 'admin_reply' && <ShieldCheck size={18} />}
                {event.type === 'phase_change' && <Zap size={18} />}
              </div>
              <div className="activity-content">
                <div className="activity-title">{event.title}</div>
                <div className="activity-detail">{event.detail}</div>
                <div className="activity-time">{new Date(event.timestamp).toLocaleTimeString()}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
