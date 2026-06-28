import { useEffect, useState } from 'react';
import { adminGet, type AuditRecord } from '../../lib/adminApi';
import { Shield } from 'lucide-react';

export default function AuditTab() {
  const [items, setItems] = useState<AuditRecord[]>([]);

  useEffect(() => {
    adminGet<{ items: AuditRecord[] }>('audit').then((data) => setItems(data.items));
  }, []);

  return (
    <div className="tab-stack">
      <div className="page-header">
        <div>
          <h1>Security Audit</h1>
          <p>Every admin action from replies to waitlist approvals is recorded here</p>
        </div>
      </div>

      <div className="panel">
        {items.length === 0 ? (
          <div className="empty-state">
            <Shield size={48} strokeWidth={1} />
            <p>No audit records yet</p>
          </div>
        ) : (
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Action</th>
                  <th>Detail</th>
                  <th>Actor</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td style={{ fontWeight: 600 }}>{item.action}</td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{item.detail}</td>
                    <td style={{ fontSize: '13px' }}>{item.actor}</td>
                    <td style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                      {new Date(item.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
