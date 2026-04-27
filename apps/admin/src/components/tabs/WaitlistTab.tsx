import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Download, Search, Trash2, XCircle } from 'lucide-react';
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
      <div className="tab-header">
        <div>
          <h1>Waitlist</h1>
          <p>Review signups, approve early testers, export the list, and keep launch data clean.</p>
        </div>
        <button className="admin-button" onClick={exportCsv}>
          <Download size={16} />
          Export CSV
        </button>
      </div>

      <div className="panel-card">
        <div className="toolbar-row">
          <div className="search-box">
            <Search size={16} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name, email, or role"
            />
          </div>
        </div>

        {error && <p className="admin-error">{error}</p>}

        <div className="table-shell">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td>{item.email}</td>
                  <td>{item.role || 'other'}</td>
                  <td>
                    <span className={`status-pill ${item.approved ? 'ok' : 'pending'}`}>
                      {item.approved ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                      {item.approved ? 'Approved' : 'Pending'}
                    </span>
                  </td>
                  <td>{new Date(item.created_at).toLocaleString()}</td>
                  <td className="table-actions">
                    <button className="admin-button" disabled={busyId === item.id} onClick={() => toggleApproval(item)}>
                      {item.approved ? 'Revoke' : 'Approve'}
                    </button>
                    <button className="icon-button danger" disabled={busyId === item.id} onClick={() => removeEntry(item.id)}>
                      <Trash2 size={16} />
                    </button>
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
