import { useEffect, useState } from 'react'
import { supabase, type TimelineEntry } from '../../lib/supabase'

type FormState = {
  title: string
  description: string
  status: 'past' | 'present' | 'future'
  sort_order: number
  itemsRaw: string   // newline-separated string for textarea
}

const EMPTY_FORM: FormState = {
  title: '', description: '', status: 'future', sort_order: 0, itemsRaw: '',
}

export default function TimelineTab() {
  const [entries, setEntries] = useState<TimelineEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  const load = async () => {
    const { data } = await supabase
      .from('timeline_entries')
      .select('*')
      .order('sort_order', { ascending: true })
    setEntries(data ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const setField = (field: keyof FormState, val: string | number) =>
    setForm((f) => ({ ...f, [field]: val }))

  const openNew = () => {
    setEditId(null)
    setForm({ ...EMPTY_FORM, sort_order: entries.length + 1 })
    setShowForm(true)
  }

  const openEdit = (entry: TimelineEntry) => {
    setEditId(entry.id)
    setForm({
      title: entry.title,
      description: entry.description ?? '',
      status: entry.status,
      sort_order: entry.sort_order,
      itemsRaw: (entry.items ?? []).join('\n'),
    })
    setShowForm(true)
  }

  const cancel = () => {
    setShowForm(false)
    setEditId(null)
    setForm(EMPTY_FORM)
  }

  const save = async () => {
    if (!form.title.trim()) return
    setSaving(true)

    const payload = {
      title: form.title.trim(),
      description: form.description.trim() || null,
      status: form.status,
      sort_order: Number(form.sort_order),
      items: form.itemsRaw
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
      updated_at: new Date().toISOString(),
    }

    if (editId) {
      await supabase.from('timeline_entries').update(payload).eq('id', editId)
    } else {
      await supabase.from('timeline_entries').insert(payload)
    }

    await load()
    cancel()
    setSaving(false)
  }

  const deleteEntry = async (id: string) => {
    if (!confirm('Delete this timeline entry?')) return
    setDeleting(id)
    await supabase.from('timeline_entries').delete().eq('id', id)
    setEntries((prev) => prev.filter((e) => e.id !== id))
    setDeleting(null)
  }

  const STATUS_COLORS = {
    past:    { bg: 'rgba(74,222,128,0.08)', border: 'rgba(74,222,128,0.2)', text: '#4ade80' },
    present: { bg: 'rgba(255,90,31,0.08)',  border: 'rgba(255,90,31,0.2)',  text: 'var(--accent)' },
    future:  { bg: 'var(--bg-subtle)',       border: 'var(--border)',        text: 'var(--text-faint)' },
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 600, letterSpacing: '-0.02em' }}>Timeline</h1>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>
            {entries.length} entries · changes reflect instantly on the public site
          </p>
        </div>
        <button
          onClick={openNew}
          style={{
            background: 'var(--accent)', color: '#fff',
            border: 'none', padding: '8px 18px',
            borderRadius: 7, fontSize: 13, fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          + Add entry
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div style={{
          background: 'var(--bg-raised)',
          border: '1px solid var(--border)',
          borderRadius: 10, padding: '24px',
          marginBottom: 20,
        }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 18 }}>
            {editId ? 'Edit entry' : 'New entry'}
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            <div>
              <label style={labelS}>Title *</label>
              <input
                value={form.title}
                onChange={(e) => setField('title', e.target.value)}
                placeholder="Foundation"
                style={fInput}
                onFocus={(e) => (e.target.style.borderColor = 'var(--accent-border)')}
                onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
              />
            </div>
            <div>
              <label style={labelS}>Status</label>
              <select
                value={form.status}
                onChange={(e) => setField('status', e.target.value)}
                style={fInput}
              >
                <option value="past">Past — Completed</option>
                <option value="present">Present — In Progress</option>
                <option value="future">Future — Planned</option>
              </select>
            </div>
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={labelS}>Description</label>
            <input
              value={form.description}
              onChange={(e) => setField('description', e.target.value)}
              placeholder="Short description of this phase…"
              style={fInput}
              onFocus={(e) => (e.target.style.borderColor = 'var(--accent-border)')}
              onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
            />
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={labelS}>Bullet items (one per line)</label>
            <textarea
              value={form.itemsRaw}
              onChange={(e) => setField('itemsRaw', e.target.value)}
              placeholder={'Task system\nSocial feed\nUser profiles'}
              rows={5}
              style={{
                ...fInput,
                resize: 'vertical', lineHeight: 1.6,
                fontFamily: 'Inter, sans-serif',
              }}
              onFocus={(e) => (e.target.style.borderColor = 'var(--accent-border)')}
              onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={labelS}>Sort order</label>
            <input
              type="number"
              value={form.sort_order}
              onChange={(e) => setField('sort_order', Number(e.target.value))}
              style={{ ...fInput, width: 100 }}
              onFocus={(e) => (e.target.style.borderColor = 'var(--accent-border)')}
              onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
            />
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={save}
              disabled={saving || !form.title.trim()}
              style={{
                background: 'var(--accent)', color: '#fff',
                border: 'none', padding: '9px 20px',
                borderRadius: 7, fontSize: 13, fontWeight: 500,
                cursor: saving ? 'wait' : 'pointer',
                opacity: !form.title.trim() ? 0.5 : 1,
                fontFamily: 'Inter, sans-serif',
              }}
            >
              {saving ? 'Saving…' : editId ? 'Update' : 'Create'}
            </button>
            <button onClick={cancel} style={ghostBtn}>Cancel</button>
          </div>
        </div>
      )}

      {/* Entries list */}
      {loading ? (
        <p style={{ color: 'var(--text-faint)', textAlign: 'center', padding: 48 }}>Loading…</p>
      ) : entries.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '56px 24px',
          background: 'var(--bg-raised)', border: '1px solid var(--border)',
          borderRadius: 10,
        }}>
          <p style={{ color: 'var(--text-muted)', marginBottom: 16 }}>No timeline entries yet.</p>
          <button onClick={openNew} style={{
            background: 'var(--accent)', color: '#fff', border: 'none',
            padding: '8px 18px', borderRadius: 7, fontSize: 13, cursor: 'pointer',
            fontFamily: 'Inter, sans-serif',
          }}>
            Add first entry
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {entries.map((entry) => {
            const sc = STATUS_COLORS[entry.status]
            return (
              <div
                key={entry.id}
                style={{
                  background: 'var(--bg-raised)',
                  border: '1px solid var(--border)',
                  borderRadius: 10,
                  padding: '16px 20px',
                  display: 'flex', alignItems: 'flex-start',
                  justifyContent: 'space-between', gap: 16,
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>
                      {entry.title}
                    </span>
                    <span style={{
                      padding: '2px 9px', borderRadius: 100,
                      fontSize: 10, fontWeight: 500,
                      background: sc.bg, border: `1px solid ${sc.border}`,
                      color: sc.text,
                      textTransform: 'capitalize',
                    }}>
                      {entry.status}
                    </span>
                    <span style={{ fontSize: 11, color: 'var(--text-faint)' }}>
                      #{entry.sort_order}
                    </span>
                  </div>

                  {entry.description && (
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>
                      {entry.description}
                    </p>
                  )}

                  {entry.items && entry.items.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {entry.items.map((item, j) => (
                        <span key={j} style={{
                          fontSize: 11, padding: '2px 8px',
                          background: 'var(--bg-subtle)',
                          border: '1px solid var(--border)',
                          borderRadius: 5, color: 'var(--text-muted)',
                        }}>
                          {item}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  <button
                    onClick={() => openEdit(entry)}
                    style={{ ...ghostBtn, padding: '5px 12px', fontSize: 12 }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteEntry(entry.id)}
                    disabled={deleting === entry.id}
                    style={{
                      ...ghostBtn, padding: '5px 12px', fontSize: 12,
                      color: '#f87171', borderColor: 'rgba(248,113,113,0.3)',
                      opacity: deleting === entry.id ? 0.5 : 1,
                    }}
                  >
                    {deleting === entry.id ? '…' : 'Delete'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

const labelS: React.CSSProperties = {
  display: 'block', fontSize: 11,
  color: 'var(--text-muted)', marginBottom: 6,
  letterSpacing: '0.03em',
}
const fInput: React.CSSProperties = {
  width: '100%', background: 'var(--bg)',
  border: '1px solid var(--border)',
  borderRadius: 7, padding: '9px 12px',
  color: 'var(--text)', fontSize: 13,
  outline: 'none', fontFamily: 'Inter, sans-serif',
  transition: 'border-color 0.15s',
}
const ghostBtn: React.CSSProperties = {
  background: 'transparent', border: '1px solid var(--border)',
  color: 'var(--text-muted)', padding: '7px 14px',
  borderRadius: 7, fontSize: 13, cursor: 'pointer',
  fontFamily: 'Inter, sans-serif',
}
