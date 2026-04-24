import { useEffect, useState } from 'react'
import { supabase, type Suggestion } from '../../lib/supabase'

export default function SuggestionsTab() {
  const [items, setItems] = useState<Suggestion[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState('all')
  const [replyTarget, setReplyTarget] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    supabase.from('suggestions').select('*').order('created_at', { ascending: false })
      .then(({ data }) => { setItems(data ?? []); setLoading(false) })
  }, [])

  const filtered = items.filter((s) => {
    const q = search.toLowerCase()
    return (
      (s.content.toLowerCase().includes(q) || s.name?.toLowerCase().includes(q) || s.email?.toLowerCase().includes(q)) &&
      (catFilter === 'all' || s.category === catFilter)
    )
  })

  const toggleFeatured = async (id: string, val: boolean) => {
    await supabase.from('suggestions').update({ is_featured: !val }).eq('id', id)
    setItems((p) => p.map((s) => s.id === id ? { ...s, is_featured: !val } : s))
  }

  const submitReply = async (id: string) => {
    if (!replyText.trim()) return
    setSaving(true)
    await supabase.from('suggestions').update({ admin_response: replyText.trim(), admin_responded_at: new Date().toISOString() }).eq('id', id)
    setItems((p) => p.map((s) => s.id === id ? { ...s, admin_response: replyText.trim() } : s))
    setReplyTarget(null); setReplyText(''); setSaving(false)
  }

  const deleteReply = async (id: string) => {
    await supabase.from('suggestions').update({ admin_response: null, admin_responded_at: null }).eq('id', id)
    setItems((p) => p.map((s) => s.id === id ? { ...s, admin_response: null } : s))
  }

  const cats = ['all', ...Array.from(new Set(items.map((s) => s.category).filter(Boolean)))]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text)' }}>Suggestions</h1>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>
            {items.length} total · {items.filter((s) => s.is_featured).length} featured · {items.filter((s) => !s.admin_response && s.email).length} need reply
          </p>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)}
          style={{ ...fInput, flex: 1, minWidth: 200 }}
          onFocus={(e) => (e.target.style.borderColor = 'var(--accent-border)')}
          onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
        />
        <select value={catFilter} onChange={(e) => setCatFilter(e.target.value)} style={fSelect}>
          {cats.map((c) => <option key={c} value={c}>{c === 'all' ? 'All categories' : c}</option>)}
        </select>
      </div>

      {/* Cards */}
      {loading ? (
        <p style={{ color: 'var(--text-faint)', padding: 40, textAlign: 'center' }}>Loading...</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {filtered.map((s) => (
            <div key={s.id} style={{
              background: 'var(--bg-raised)',
              border: '1px solid var(--border)',
              borderRadius: 8, padding: '18px 20px',
              borderLeftColor: s.is_featured ? 'var(--accent)' : 'var(--border)',
              borderLeftWidth: s.is_featured ? 2 : 1,
            }}>
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 11, color: 'var(--text-faint)', textTransform: 'capitalize', background: 'var(--bg-subtle)', padding: '2px 8px', borderRadius: 4 }}>
                    {s.category}
                  </span>
                  {s.rating && (
                    <span style={{ fontSize: 12, color: 'var(--text-faint)' }}>
                      {'★'.repeat(s.rating)}{'☆'.repeat(5 - s.rating)}
                    </span>
                  )}
                  <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{s.name || 'Anonymous'}</span>
                  {s.email && <span style={{ fontSize: 11, color: 'var(--text-faint)', fontFamily: 'monospace' }}>{s.email}</span>}
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{ fontSize: 11, color: 'var(--text-faint)' }}>
                    {new Date(s.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                  <button onClick={() => toggleFeatured(s.id, s.is_featured)} style={{
                    padding: '4px 10px', borderRadius: 5, fontSize: 11, cursor: 'pointer',
                    border: '1px solid var(--border)',
                    background: s.is_featured ? 'var(--accent-dim)' : 'transparent',
                    color: s.is_featured ? 'var(--accent)' : 'var(--text-faint)',
                    transition: 'all 0.15s',
                  }}>
                    {s.is_featured ? 'Featured' : 'Feature'}
                  </button>
                </div>
              </div>

              <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.65, marginBottom: 14 }}>
                {s.content}
              </p>

              {/* Existing reply */}
              {s.admin_response && replyTarget !== s.id && (
                <div style={{
                  padding: '12px 14px',
                  background: 'var(--bg)', borderLeft: '2px solid var(--accent)',
                  borderRadius: '0 6px 6px 0', marginBottom: 10,
                }}>
                  <p style={{ fontSize: 11, color: 'var(--accent)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Your reply
                  </p>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>{s.admin_response}</p>
                  <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                    <button onClick={() => { setReplyTarget(s.id); setReplyText(s.admin_response ?? '') }} style={smallBtn}>Edit</button>
                    <button onClick={() => deleteReply(s.id)} style={{ ...smallBtn, color: '#f87171' }}>Remove</button>
                  </div>
                </div>
              )}

              {/* Reply form */}
              {replyTarget === s.id ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <textarea value={replyText} onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Write a reply..." rows={3} autoFocus
                    style={{
                      background: 'var(--bg)', border: '1px solid var(--border)',
                      borderRadius: 6, padding: '10px 12px',
                      color: 'var(--text)', fontSize: 13, resize: 'vertical',
                      outline: 'none', fontFamily: 'Inter, sans-serif', lineHeight: 1.6,
                    }}
                    onFocus={(e) => (e.target.style.borderColor = 'var(--accent-border)')}
                    onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
                  />
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => submitReply(s.id)} disabled={saving || !replyText.trim()} style={{
                      background: 'var(--accent)', color: '#fff', border: 'none',
                      padding: '7px 16px', borderRadius: 6, fontSize: 13, fontWeight: 500,
                      cursor: 'pointer', opacity: !replyText.trim() ? 0.5 : 1,
                    }}>
                      {saving ? 'Saving...' : 'Post reply'}
                    </button>
                    <button onClick={() => { setReplyTarget(null); setReplyText('') }} style={smallBtn}>Cancel</button>
                  </div>
                </div>
              ) : !s.admin_response && (
                <button onClick={() => { setReplyTarget(s.id); setReplyText('') }} style={smallBtn}>
                  Reply
                </button>
              )}
            </div>
          ))}
          {filtered.length === 0 && !loading && (
            <p style={{ color: 'var(--text-faint)', padding: 40, textAlign: 'center' }}>No suggestions</p>
          )}
        </div>
      )}
    </div>
  )
}

const fInput: React.CSSProperties = {
  background: 'var(--bg-raised)', border: '1px solid var(--border)',
  borderRadius: 6, padding: '8px 12px', color: 'var(--text)',
  fontSize: 13, outline: 'none', fontFamily: 'Inter, sans-serif', transition: 'border-color 0.15s',
}
const fSelect: React.CSSProperties = {
  background: 'var(--bg-raised)', border: '1px solid var(--border)',
  borderRadius: 6, padding: '8px 12px', color: 'var(--text-muted)', fontSize: 13, outline: 'none', cursor: 'pointer',
}
const smallBtn: React.CSSProperties = {
  background: 'transparent', border: '1px solid var(--border)',
  color: 'var(--text-faint)', padding: '5px 12px', borderRadius: 5,
  fontSize: 12, cursor: 'pointer', fontFamily: 'Inter, sans-serif',
}
