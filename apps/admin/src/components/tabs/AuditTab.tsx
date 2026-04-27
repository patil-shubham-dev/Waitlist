import { useEffect, useState } from 'react';
import { adminGet, type AuditRecord } from '../../lib/adminApi';

export default function AuditTab() {
  const [items, setItems] = useState<AuditRecord[]>([]);

  useEffect(() => {
    adminGet<{ items: AuditRecord[] }>('audit').then((data) => setItems(data.items));
  }, []);

  return (
    <div className="tab-stack">
      <div className="tab-header">
        <div>
          <h1>Audit log</h1>
          <p>Every admin action from replies to waitlist approvals is recorded here.</p>
        </div>
      </div>

      <div className="panel-card">
        <div className="table-shell">
          <table className="admin-table">
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
                  <td>{item.action}</td>
                  <td>{item.detail}</td>
                  <td>{item.actor}</td>
                  <td>{new Date(item.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
