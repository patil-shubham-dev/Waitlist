import { useEffect, useMemo, useState } from 'react';
import { Search, Download, Trash2, CheckCircle2, XCircle } from 'lucide-react';
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
      <div className="page-header">
        <div>
          <h1>Waitlist</h1>
          <p>Review and manage early access signups</p>
        </div>
        <button className="btn btn-primary" onClick={exportCsv}>
          <Download size={16} />
          Export CSV
        </button>
      </div>

      <div className="panel">
        <div style={{ marginBottom: '20px', display: 'flex', gap: '12px' }}>
          <div className="search-wrap">
            <Search size={16} className="search-icon" />
            <input
              className="search-input"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name, email, or role..."
            />
          </div>
          <span className="stat-label" style={{ alignSelf: 'center', flexShrink: 0 }}>
            {filtered.length} signup{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>

        {error && <p style={{ color: 'var(--danger)', marginBottom: '16px', fontSize: '13px' }}>{error}</p>}

        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{item.name}</div>
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{item.email}</div>
                  </td>
                  <td style={{ fontSize: '13px' }}>{item.role || '—'}</td>
                  <td>
                    <span className={`status-badge ${item.approved ? 'approved' : 'pending'}`}>
                      {item.approved ? <CheckCircle2 size={11} /> : <XCircle size={11} />}
                      {item.approved ? 'Approved' : 'Pending'}
                    </span>
                  </td>
                  <td style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                    {new Date(item.created_at).toLocaleDateString()}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                      <button
                        className="btn btn-sm"
                        disabled={busyId === item.id}
                        onClick={() => toggleApproval(item)}
                      >
                        {item.approved ? 'Revoke' : 'Approve'}
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        disabled={busyId === item.id}
                        onClick={() => removeEntry(item.id)}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && !error && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '40px 16px', color: 'var(--text-faint)' }}>
                    No signups found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
