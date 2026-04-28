import { useEffect, useState } from 'react';
import { Users, UserPlus, MessageSquare, Activity, TrendingUp } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import ActivityFeed from '../ActivityFeed';

type Stats = {
  totalWaitlist: number;
  new24h: number;
  totalQuestions: number;
  totalVisits: number;
};

export default function TelemetryTab() {
  const [stats, setStats] = useState<Stats>({
    totalWaitlist: 0,
    new24h: 0,
    totalQuestions: 0,
    totalVisits: 0
  });
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      
      const [
        { count: totalWaitlist },
        { count: new24h },
        { count: totalQuestions },
        { count: totalVisits },
        { data: signups }
      ] = await Promise.all([
        supabase.from('waitlist').select('*', { count: 'exact', head: true }),
        supabase.from('waitlist').select('*', { count: 'exact', head: true }).gt('created_at', yesterday),
        supabase.from('questions').select('*', { count: 'exact', head: true }),
        supabase.from('page_visits').select('*', { count: 'exact', head: true }),
        supabase.from('waitlist').select('created_at').order('created_at', { ascending: true })
      ]);

      setStats({
        totalWaitlist: totalWaitlist || 0,
        new24h: new24h || 0,
        totalQuestions: totalQuestions || 0,
        totalVisits: totalVisits || 0
      });

      // Process chart data (daily signups)
      if (signups) {
        const counts: Record<string, number> = {};
        signups.forEach(s => {
          const date = new Date(s.created_at).toLocaleDateString();
          counts[date] = (counts[date] || 0) + 1;
        });
        
        const sortedData = Object.entries(counts)
          .map(([date, count]) => ({ date, count }))
          .slice(-14); // Last 14 days
          
        setChartData(sortedData);
      }
      
      setLoading(false);
    };

    fetchData();

    // Subscribe to changes for live updates
    const channel = supabase
      .channel('dashboard-metrics')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'waitlist' }, () => fetchData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'questions' }, () => fetchData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'page_visits' }, () => fetchData())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '400px' }}>
        <div className="loading-dot" />
      </div>
    );
  }

  return (
    <div className="tab-stack">
      <div className="tab-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: 800, letterSpacing: '-0.04em' }}>Dashboard</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>Real-time metrics and system health</p>
        </div>
        <div className="live-indicator">
          <div className="live-dot" />
          Live Metrics
        </div>
      </div>

      <div className="stats-grid">
        <article className="panel stat-card">
          <div className="stat-label"><Users size={16} /> Total Waitlist</div>
          <div className="stat-value">{stats.totalWaitlist.toLocaleString()}</div>
          <div className="stat-meta">Joined emails all-time</div>
        </article>
        
        <article className="panel stat-card">
          <div className="stat-label"><UserPlus size={16} /> New in 24h</div>
          <div className="stat-value" style={{ color: 'var(--accent)' }}>+{stats.new24h}</div>
          <div className="stat-meta">Accelerating growth</div>
        </article>

        <article className="panel stat-card">
          <div className="stat-label"><MessageSquare size={16} /> Questions</div>
          <div className="stat-value">{stats.totalQuestions}</div>
          <div className="stat-meta">Community inquiries</div>
        </article>

        <article className="panel stat-card">
          <div className="stat-label"><Activity size={16} /> Traffic</div>
          <div className="stat-value">{stats.totalVisits.toLocaleString()}</div>
          <div className="stat-meta">Site visits tracked</div>
        </article>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) 1fr', gap: '24px' }}>
        <div className="panel" style={{ minHeight: '400px' }}>
          <div className="panel-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h2>Signup Velocity</h2>
              <p>Daily growth trend for the last 14 days</p>
            </div>
            <TrendingUp size={20} style={{ color: 'var(--accent)' }} />
          </div>
          
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="var(--accent)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: 'var(--text-faint)' }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: 'var(--text-faint)' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: '1px solid var(--border)',
                    boxShadow: 'var(--shadow)',
                    fontSize: '12px'
                  }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="count" 
                  stroke="var(--accent)" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorCount)" 
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <ActivityFeed />
      </div>
    </div>
  );
}
