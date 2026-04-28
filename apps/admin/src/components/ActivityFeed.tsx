import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { UserPlus, MessageCircle, ShieldCheck, Zap, ArrowUpRight } from 'lucide-react';

type ActivityEvent = {
  id: string;
  type: 'signup' | 'question' | 'admin_reply' | 'roadmap_update';
  content: string;
  user_name?: string;
  created_at: string;
};

function formatRelativeTime(date: string) {
  const delta = Date.now() - new Date(date).getTime();
  const seconds = Math.floor(delta / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return new Date(date).toLocaleDateString();
}

export default function ActivityFeed() {
  const [activities, setActivities] = useState<ActivityEvent[]>([]);

  const fetchActivities = async () => {
    // Fetch latest signups and questions
    const [signups, questions] = await Promise.all([
      supabase.from('waitlist').select('id, name, created_at').order('created_at', { ascending: false }).limit(5),
      supabase.from('suggestions').select('id, name, content, created_at').order('created_at', { ascending: false }).limit(5)
    ]);

    const mapped: ActivityEvent[] = [
      ...(signups.data || []).map(s => ({
        id: `s-${s.id}`,
        type: 'signup' as const,
        content: 'joined the waitlist',
        user_name: s.name,
        created_at: s.created_at
      })),
      ...(questions.data || []).map(q => ({
        id: `q-${q.id}`,
        type: 'question' as const,
        content: `asked: "${q.content.substring(0, 40)}${q.content.length > 40 ? '...' : ''}"`,
        user_name: q.name,
        created_at: q.created_at
      }))
    ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 10);

    setActivities(mapped);
  };

  useEffect(() => {
    fetchActivities();
    const sub = supabase.channel('activity-all').on('postgres_changes', { event: 'INSERT', schema: 'public' }, () => fetchActivities()).subscribe();
    return () => { supabase.removeChannel(sub); };
  }, []);

  return (
    <article className="panel activity-feed">
      <div className="panel-header">
        <div>

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
