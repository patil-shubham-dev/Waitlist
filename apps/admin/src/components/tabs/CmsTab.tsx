import { useEffect, useMemo, useState } from 'react';
import { Save } from 'lucide-react';
import { adminGet, adminPost, type SiteContentRecord } from '../../lib/adminApi';

const CONTENT_GROUPS = [
  { title: 'Hero', keys: ['hero_badge', 'hero_title', 'hero_subtext', 'hero_primary_cta', 'hero_secondary_cta', 'nav_cta'] },
  { title: 'Storytelling', keys: ['problem_title', 'problem_body', 'questions_title', 'questions_body'] },
  { title: 'Waitlist + footer', keys: ['waitlist_title', 'waitlist_body', 'footer_tagline'] },
  { title: 'Branding', keys: ['brand_reply_name', 'reply_logo_url', 'brand_wordmark_url'] },
];

export default function CmsTab() {
  const [items, setItems] = useState<SiteContentRecord[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    adminGet<{ items: SiteContentRecord[] }>('content').then((data) => setItems(data.items));
  }, []);

  const contentMap = useMemo(
    () => items.reduce<Record<string, string>>((acc, item) => {
      acc[item.key] = item.value;
      return acc;
    }, {}),
    [items],
  );

  const updateValue = (key: string, value: string) => {
    setItems((current) => {
      const existing = current.find((item) => item.key === key);
      if (existing) {
        return current.map((item) => (item.key === key ? { ...item, value } : item));
      }
      return [...current, { key, value, updated_at: new Date().toISOString() }];
    });
  };

  const save = async () => {
    setSaving(true);
    setMessage('');
    await adminPost('save-content', { items: items.map(({ key, value }) => ({ key, value })) });
    setSaving(false);
    setMessage('Saved live content and branding settings.');
  };

  return (
    <div className="tab-stack">
      <div className="tab-header">
        <div>
          <h1>Content and branding</h1>
          <p>Edit the premium landing page copy, button labels, reply branding, and public-facing message.</p>
        </div>
        <button className="admin-button admin-button-primary" onClick={save} disabled={saving}>
          <Save size={16} />
          {saving ? 'Saving...' : 'Save changes'}
        </button>
      </div>

      {message && <p className="admin-success">{message}</p>}

      <div className="content-grid">
        {CONTENT_GROUPS.map((group) => (
          <section className="panel-card" key={group.title}>
            <h2>{group.title}</h2>
            <div className="form-stack">
              {group.keys.map((key) => (
                <label key={key}>
                  <span>{key}</span>
                  {key.includes('body') || key.includes('subtext') ? (
                    <textarea
                      rows={4}
                      value={contentMap[key] || ''}
                      onChange={(event) => updateValue(key, event.target.value)}
                    />
                  ) : (
                    <input
                      value={contentMap[key] || ''}
                      onChange={(event) => updateValue(key, event.target.value)}
                    />
                  )}
                </label>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
