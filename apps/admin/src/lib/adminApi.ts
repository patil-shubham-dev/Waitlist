import { supabase } from './supabase';

export type WaitlistRecord = {
  id: string;
  name: string;
  email: string;
  role: string | null;
  approved: boolean;
  created_at: string;
};

export type QuestionRecord = {
  id: string;
  title: string | null;
  content: string;
  type: 'question' | 'suggestion' | 'feedback';
  status: 'open' | 'reviewing' | 'answered' | 'planned';
  name: string | null;
  email: string;
  author_name: string;
  author_avatar_url: string;
  admin_name: string | null;
  admin_avatar_url: string | null;
  admin_response: string | null;
  admin_responded_at: string | null;
  is_featured: boolean;
  is_public: boolean;
  tags: string[] | null;
  created_at: string;
};

export type SiteContentRecord = {
  key: string;
  value: string;
  updated_at: string;
};

export type PhaseRecord = {
  id: string;
  title: string;
  description: string | null;
  status: 'past' | 'present' | 'future';
  sort_order: number;
  items: string[] | null;
  created_at: string;
  updated_at: string;
};

export type AuditRecord = {
  id: string;
  action: string;
  detail: string;
  actor: string;
  created_at: string;
};

export type OverviewResponse = {
  totals: {
    waitlist: number;
    new24h: number;
    questions: number;
    answered: number;
    visits14d: number;
  };
  series: {
    waitlist: Array<{ date: string; value: number }>;
    questions: Array<{ date: string; value: number }>;
  };
};

// ─── GET (read) ───

export async function adminGet<T>(view: string): Promise<T> {
  // Try API first
  try {
    const response = await fetch(`/api/admin?view=${encodeURIComponent(view)}`, {
      credentials: 'include',
    });
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      if (response.ok) return data as T;
      throw new Error(data.error || 'Request failed.');
    }
  } catch {
    // API unavailable — fallback below
  }

  // Fallback: direct Supabase query
  if (view === 'overview') {
    const now = Date.now();
    const yesterday = new Date(now - 24 * 60 * 60 * 1000).toISOString();
    const [wc, nc, qc, ac, vc, ws, qs] = await Promise.all([
      supabase.from('waitlist').select('*', { head: true, count: 'exact' }),
      supabase.from('waitlist').select('*', { head: true, count: 'exact' }).gte('created_at', yesterday),
      supabase.from('suggestions').select('*', { head: true, count: 'exact' }),
      supabase.from('suggestions').select('*', { head: true, count: 'exact' }).eq('status', 'answered'),
      supabase.from('page_visits').select('*', { head: true, count: 'exact' }),
      supabase.from('waitlist').select('created_at').order('created_at', { ascending: true }),
      supabase.from('suggestions').select('created_at').order('created_at', { ascending: true }),
    ]);

    const build = (items: { created_at: string }[]) => {
      const map = new Map<string, number>();
      items?.forEach(item => {
        const key = item.created_at.slice(0, 10);
        map.set(key, (map.get(key) ?? 0) + 1);
      });
      return Array.from(map.entries()).map(([date, value]) => ({ date, value }));
    };

    return {
      totals: {
        waitlist: wc.count ?? 0,
        new24h: nc.count ?? 0,
        questions: qc.count ?? 0,
        answered: ac.count ?? 0,
        visits14d: vc.count ?? 0,
      },
      series: {
        waitlist: build((ws.data ?? []) as { created_at: string }[]),
        questions: build((qs.data ?? []) as { created_at: string }[]),
      },
    } as T;
  }

  if (view === 'waitlist') {
    const { data, error } = await supabase
      .from('waitlist')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(500);
    if (error) throw error;
    return { items: data ?? [] } as T;
  }

  if (view === 'questions') {
    const { data, error } = await supabase
      .from('suggestions')
      .select('*')
      .order('is_featured', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(300);
    if (error) throw error;
    return { items: data ?? [] } as T;
  }

  if (view === 'audit') {
    const { data, error } = await supabase
      .from('admin_audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);
    if (error) throw error;
    return { items: data ?? [] } as T;
  }

  if (view === 'content') {
    const { data, error } = await supabase.from('site_content').select('*').order('key');
    if (error) throw error;
    return { items: data ?? [] } as T;
  }

  throw new Error(`Unknown view: ${view}`);
}

// ─── POST (write) ───

const _contentCache: Record<string, string> = {};

export async function adminPost<T>(action: string, payload: unknown): Promise<T> {
  // Try API first
  try {
    const response = await fetch('/api/admin', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, payload }),
    });
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      if (response.ok) return data as T;
      throw new Error(data.error || 'Request failed.');
    }
  } catch {
    // API unavailable — fallback below
  }

  // Fallback: direct Supabase mutation
  const p = payload as Record<string, any>;

  if (action === 'toggle-waitlist-approval') {
    const { error } = await supabase.from('waitlist').update({ approved: p.approved }).eq('id', p.id);
    if (error) throw error;
    return { success: true } as T;
  }

  if (action === 'delete-waitlist-entry') {
    const { error } = await supabase.from('waitlist').delete().eq('id', p.id);
    if (error) throw error;
    return { success: true } as T;
  }

  if (action === 'reply-question') {
    const { error } = await supabase.from('suggestions').update({
      admin_response: p.adminResponse,
      admin_name: _contentCache['brand_reply_name'] || 'LifeOS Team',
      admin_avatar_url: _contentCache['reply_logo_url'] || '/assets/logo-mark.jpg',
      admin_responded_at: new Date().toISOString(),
      status: p.status || 'answered',
      is_featured: p.isFeatured ?? false,
      is_public: p.isPublic ?? true,
    }).eq('id', p.id);
    if (error) throw error;
    return { success: true } as T;
  }

  if (action === 'toggle-question-featured') {
    const { error } = await supabase.from('suggestions').update({ is_featured: p.isFeatured }).eq('id', p.id);
    if (error) throw error;
    return { success: true } as T;
  }

  if (action === 'toggle-question-visibility') {
    const { error } = await supabase.from('suggestions').update({ is_public: p.isPublic }).eq('id', p.id);
    if (error) throw error;
    return { success: true } as T;
  }

  if (action === 'delete-question') {
    const { error } = await supabase.from('suggestions').delete().eq('id', p.id);
    if (error) throw error;
    return { success: true } as T;
  }

  if (action === 'save-content') {
    const items = Array.isArray(p.items) ? p.items : [];
    if (items.length === 0) throw new Error('No content items supplied.');
    for (const item of items) {
      const { error } = await supabase.from('site_content').upsert({ key: item.key, value: item.value });
      if (error) throw error;
      _contentCache[item.key] = item.value;
    }
    return { success: true } as T;
  }

  throw new Error(`Unknown action: ${action}`);
}
