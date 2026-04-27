import { useEffect, useState } from 'react';
import { Activity, MessageSquareText, UserRoundPlus, Users } from 'lucide-react';
import { adminGet, type OverviewResponse } from '../../lib/adminApi';

function MiniChart({ items }: { items: Array<{ date: string; value: number }> }) {
  const maxValue = Math.max(1, ...items.map((item) => item.value));
  return (
    <div className="mini-chart">
      {items.map((item) => (
        <div className="mini-bar-group" key={item.date}>
          <div className="mini-bar" style={{ height: `${(item.value / maxValue) * 100}%` }} />
          <span>{item.date.slice(5)}</span>
        </div>
      ))}
    </div>
  );
}

export default function TelemetryTab() {
  const [data, setData] = useState<OverviewResponse | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    adminGet<OverviewResponse>('overview')
      .then(setData)
      .catch((err: Error) => setError(err.message));
  }, []);

  if (error) {
    return <div className="panel-card"><p className="admin-error">{error}</p></div>;
  }

  if (!data) {
    return <div className="panel-card"><p>Loading overview...</p></div>;
  }

  return (
    <div className="tab-stack">
      <div className="tab-header">
        <div>
          <h1>Overview</h1>
          <p>Live launch metrics for the waitlist app, community wall, and product rollout.</p>
        </div>
      </div>

      <div className="stats-grid">
        <article className="panel-card stat-card">
          <div className="stat-topline"><Users size={16} /> Total waitlist</div>
          <strong>{data.totals.waitlist.toLocaleString()}</strong>
          <span>All joined emails</span>
        </article>
        <article className="panel-card stat-card">
          <div className="stat-topline"><UserRoundPlus size={16} /> New in 24h</div>
          <strong>{data.totals.new24h}</strong>
          <span>Fresh signups since yesterday</span>
        </article>
        <article className="panel-card stat-card">
          <div className="stat-topline"><MessageSquareText size={16} /> Public posts</div>
          <strong>{data.totals.questions}</strong>
          <span>{data.totals.answered} answered by admin</span>
        </article>
        <article className="panel-card stat-card">
          <div className="stat-topline"><Activity size={16} /> Visits in 14d</div>
          <strong>{data.totals.visits14d.toLocaleString()}</strong>
          <span>Traffic tracked from the landing page</span>
        </article>
      </div>

      <div className="chart-grid">
        <article className="panel-card">
          <div className="section-row">
            <div>
              <h2>Waitlist trend</h2>
              <p>Daily signup volume over the last two weeks.</p>
            </div>
          </div>
          <MiniChart items={data.series.waitlist} />
        </article>
        <article className="panel-card">
          <div className="section-row">
            <div>
              <h2>Community wall trend</h2>
              <p>Questions, suggestions, and feedback submitted publicly.</p>
            </div>
          </div>
          <MiniChart items={data.series.questions} />
        </article>
      </div>
    </div>
  );
}
