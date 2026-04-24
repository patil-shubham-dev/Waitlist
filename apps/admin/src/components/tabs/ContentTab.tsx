import { useEffect, useState } from 'react'
import { supabase, type SiteContent } from '../../lib/supabase'

const CONTENT_KEYS = [
  { key: 'hero_headline',  label: 'Hero headline', multiline: false },
  { key: 'hero_subtext',   label: 'Hero subtext',  multiline: true  },
  { key: 'hero_cta',       label: 'Hero CTA button text', multiline: false },
  { key: 'cta_headline',   label: 'Final CTA headline', multiline: false },
  { key: 'cta_subtext',    label: 'Final CTA subtext', multiline: true },
]

export default function ContentTab() {
  const [content, setContent] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [saved, setSaved] = useState<string | null>(null)

  useEffect(() => {
    supabase.from('site_content').select('*').then(({ data }) => {
      const map: Record<string, string> = {}
      ;(data ?? []).forEach((row: SiteContent) => { map[row.key] = row.value })
      setContent(map)
      setLoading(false)
    })
  }, [])

  const save = async (key: string) => {
    if (!content[key]?.trim()) return
    setSaving(key)
    await supabase
      .from('site_content')
      .upsert({ key, value: content[key].trim(), updated_at: new Date().toISOString() })
    setSaving(null)
    setSaved(key)
    setTimeout(() => setSaved(null), 2000)
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}>
        <div style={{ width: 20, height: 20, borderRadius: '50%', border: '2px solid var(--border)', borderTopColor: 'var(--accent)', animation: 'spin 0.7s linear infinite' }} />
      </div>
    )
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 20, fontWeight: 600, letterSpacing: '-0.02em' }}>Site Content</h1>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>
          Edit public-facing copy. Changes are reflected on the site immediately.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {CONTENT_KEYS.map(({ key, label, multiline }) => (
          <div
            key={key}
            style={{
              background: 'var(--bg-raised)',
              border: '1px solid var(--border)',
              borderRadius: 10, padding: '18px 20px',
            }}
          >
            <label style={{
              display: 'block', fontSize: 11,
              color: 'var(--text-muted)',
              letterSpacing: '0.05em', textTransform: 'uppercase',
              marginBottom: 8,
            }}>
              {label}
            </label>

            {multiline ? (
              <textarea
                value={content[key] ?? ''}
                onChange={(e) => setContent((c) => ({ ...c, [key]: e.target.value }))}
                rows={3}
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = 'var(--accent-border)')}
                onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
              />
            ) : (
              <input
                value={content[key] ?? ''}
                onChange={(e) => setContent((c) => ({ ...c, [key]: e.target.value }))}
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = 'var(--accent-border)')}
                onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
              />
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
              <button
                onClick={() => save(key)}
                disabled={saving === key}
                style={{
                  background: saved === key ? 'rgba(74,222,128,0.1)' : 'var(--accent)',
                  color: saved === key ? '#4ade80' : '#fff',
                  border: saved === key ? '1px solid rgba(74,222,128,0.2)' : 'none',
                  padding: '6px 16px', borderRadius: 6, fontSize: 12,
                  fontWeight: 500, cursor: 'pointer',
                  fontFamily: 'Inter, sans-serif',
                  transition: 'background 0.2s, color 0.2s',
                  minWidth: 70,
                }}
              >
                {saving === key ? 'Saving…' : saved === key ? 'Saved ✓' : 'Save'}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div style={{
        marginTop: 20,
        padding: '12px 16px',
        background: 'var(--bg-subtle)',
        border: '1px solid var(--border)',
        borderRadius: 8, fontSize: 12, color: 'var(--text-faint)',
      }}>
        Note: The public site currently uses default values for copy. Once the site is updated to read from the database, these values will apply.
      </div>
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%', background: 'var(--bg)',
  border: '1px solid var(--border)',
  borderRadius: 7, padding: '9px 12px',
  color: 'var(--text)', fontSize: 13,
  outline: 'none', fontFamily: 'Inter, sans-serif',
  lineHeight: 1.6, resize: 'vertical',
  transition: 'border-color 0.15s',
}
