import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Download, Search, Trash2, XCircle, MoreVertical } from 'lucide-react';
import { adminGet, adminPost, type WaitlistRecord } from '../../lib/adminApi';

export default function WaitlistTab() {
  const [items, setItems] = useState<WaitlistRecord[]>([]);
  const [search, setSearch] = useState('');
  const [busyId, setBusyId] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    adminGet<{ items: WaitlistRecord[] }>('waitlist')
      .then((data) => setItems(data.items))
      .catch((err: Error) => setError(err.message));
  }, []);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return items;
    return items.filter((item) =>
      [item.name, item.email, item.role ?? ''].some((value) => value.toLowerCase().includes(query)),
    );
  }, [items, search]);

  const toggleApproval = async (item: WaitlistRecord) => {
    setBusyId(item.id);
    await adminPost('toggle-waitlist-approval', { id: item.id, approved: !item.approved });
    setItems((current) =>
      current.map((entry) => (entry.id === item.id ? { ...entry, approved: !entry.approved } : entry)),
    );
    setBusyId('');
  };

  const removeEntry = async (id: string) => {
    if (!window.confirm('Delete this waitlist entry?')) return;
    setBusyId(id);
    await adminPost('delete-waitlist-entry', { id });
    setItems((current) => current.filter((entry) => entry.id !== id));
    setBusyId('');
  };

  const exportCsv = () => {
    const rows = [
      ['Name', 'Email', 'Role', 'Approved', 'Created At'],
      ...filtered.map((item) => [
        item.name,
        item.email,
        item.role ?? '',
        item.approved ? 'yes' : 'no',
        new Date(item.created_at).toISOString(),
      ]),
    ];
    const blob = new Blob([rows.map((row) => row.join(',')).join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `lifeos-waitlist-${new Date().toISOString().slice(0, 10)}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="tab-stack">
      <div className="tab-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: 800, letterSpacing: '-0.04em' }}>Waitlist</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>Review and manage early access signups</p>
        </div>
        <button className="button-primary" onClick={exportCsv}>
          <Download size={18} />
          Export CSV
        </button>
      </div>

      <div className="panel">
        <div style={{ marginBottom: '24px', display: 'flex', gap: '16px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)' }} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search signups..."
              style={{ paddingLeft: '40px' }}
            />
          </div>
        </div>

        {error && <p style={{ color: 'var(--danger)', marginBottom: '16px' }}>{error}</p>}

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={{ textAlign: 'left', padding: '12px', fontSize: '12px', fontWeight: 600, color: 'var(--text-faint)', textTransform: 'uppercase' }}>User</th>
                <th style={{ textAlign: 'left', padding: '12px', fontSize: '12px', fontWeight: 600, color: 'var(--text-faint)', textTransform: 'uppercase' }}>Role</th>
                <th style={{ textAlign: 'left', padding: '12px', fontSize: '12px', fontWeight: 600, color: 'var(--text-faint)', textTransform: 'uppercase' }}>Status</th>
                <th style={{ textAlign: 'left', padding: '12px', fontSize: '12px', fontWeight: 600, color: 'var(--text-faint)', textTransform: 'uppercase' }}>Joined</th>
                <th style={{ textAlign: 'right', padding: '12px', fontSize: '12px', fontWeight: 600, color: 'var(--text-faint)', textTransform: 'uppercase' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '16px 12px' }}>
                    <div style={{ fontWeight: 600 }}>{item.name}</div>
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{item.email}</div>
                  </td>
                  <td style={{ padding: '16px 12px', fontSize: '14px' }}>{item.role || 'Other'}</td>
                  <td style={{ padding: '16px 12px' }}>
                    <span style={{ 
                      display: 'inline-flex', 
                      alignItems: 'center', 
                      gap: '4px', 
                      fontSize: '12px', 
                      fontWeight: 600,
                      color: item.approved ? 'var(--success)' : 'var(--text-faint)',
                      background: item.approved ? 'rgba(22, 121, 75, 0.08)' : 'var(--page)',
                      padding: '4px 8px',
                      borderRadius: '6px'
                    }}>
                      {item.approved ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                      {item.approved ? 'Approved' : 'Pending'}
                    </span>
                  </td>
                  <td style={{ padding: '16px 12px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                    {new Date(item.created_at).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '16px 12px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                      <button 
                        className="sidebar-toggle" 
                        disabled={busyId === item.id} 
                        onClick={() => toggleApproval(item)}
                        style={{ border: '1px solid var(--border)', fontSize: '12px', padding: '4px 12px' }}
                      >
                        {item.approved ? 'Revoke' : 'Approve'}
                      </button>
                      <button 
                        className="sidebar-toggle" 
                        disabled={busyId === item.id} 
                        onClick={() => removeEntry(item.id)}
                        style={{ color: 'var(--danger)', border: '1px solid var(--border)' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
