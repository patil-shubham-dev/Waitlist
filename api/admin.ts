import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const COOKIE_NAME = 'lifeos_admin_session';

function createAdminClient() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be configured.');
  }

  return createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

function ensureAuthed(req: VercelRequest, res: VercelResponse) {
  if (req.cookies?.[COOKIE_NAME] !== 'true') {
    res.status(401).json({ error: 'Unauthorized' });
    return false;
  }
  return true;
}

async function logAction(client: ReturnType<typeof createAdminClient>, action: string, detail: string) {
  await client.from('admin_audit_logs').insert({
    action,
    detail,
    actor: 'admin',
  });
}

async function getSiteContentMap(client: ReturnType<typeof createAdminClient>) {
  const { data, error } = await client.from('site_content').select('*');
  if (error) throw error;

  return (data ?? []).reduce<Record<string, string>>((acc, item) => {
    acc[item.key] = item.value;
    return acc;
  }, {});
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!ensureAuthed(req, res)) return;

  const client = createAdminClient();

  try {
    if (req.method === 'GET') {
      const view = String(req.query.view || 'overview');

      if (view === 'overview') {
        const now = Date.now();
        const yesterday = new Date(now - 24 * 60 * 60 * 1000).toISOString();
        const last14 = new Date(now - 14 * 24 * 60 * 60 * 1000).toISOString();

        const [
          waitlistCount,
          new24hCount,
          questionsCount,
          answeredCount,
          visitsCount,
          waitlistSeries,
          questionsSeries,
        ] = await Promise.all([
          client.from('waitlist').select('*', { head: true, count: 'exact' }),
          client.from('waitlist').select('*', { head: true, count: 'exact' }).gte('created_at', yesterday),
          client.from('suggestions').select('*', { head: true, count: 'exact' }),
          client.from('suggestions').select('*', { head: true, count: 'exact' }).eq('status', 'answered'),
          client.from('page_visits').select('*', { head: true, count: 'exact' }).gte('created_at', last14),
          client.from('waitlist').select('created_at').gte('created_at', last14).order('created_at', { ascending: true }),
          client.from('suggestions').select('created_at').gte('created_at', last14).order('created_at', { ascending: true }),
        ]);

        const buildSeries = (items: { created_at: string }[]) => {
          const map = new Map<string, number>();
          items.forEach((item) => {
            const key = item.created_at.slice(0, 10);
            map.set(key, (map.get(key) ?? 0) + 1);
          });
          return Array.from(map.entries()).map(([date, value]) => ({ date, value }));
        };

        return res.status(200).json({
          totals: {
            waitlist: waitlistCount.count ?? 0,
            new24h: new24hCount.count ?? 0,
            questions: questionsCount.count ?? 0,
            answered: answeredCount.count ?? 0,
            visits14d: visitsCount.count ?? 0,
          },
          series: {
            waitlist: buildSeries((waitlistSeries.data ?? []) as { created_at: string }[]),
            questions: buildSeries((questionsSeries.data ?? []) as { created_at: string }[]),
          },
        });
      }

      if (view === 'waitlist') {
        const { data, error } = await client
          .from('waitlist')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(500);
        if (error) throw error;
        return res.status(200).json({ items: data ?? [] });
      }

      if (view === 'questions') {
        const { data, error } = await client
          .from('suggestions')
          .select('*')
          .order('is_featured', { ascending: false })
          .order('created_at', { ascending: false })
          .limit(300);
        if (error) throw error;
        return res.status(200).json({ items: data ?? [] });
      }

      if (view === 'content') {
        const { data, error } = await client.from('site_content').select('*').order('key');
        if (error) throw error;
        return res.status(200).json({ items: data ?? [] });
      }

      if (view === 'phases') {
        const { data, error } = await client
          .from('timeline_entries')
          .select('*')
          .order('sort_order', { ascending: true });
        if (error) throw error;
        return res.status(200).json({ items: data ?? [] });
      }

      if (view === 'audit') {
        const { data, error } = await client
          .from('admin_audit_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(100);
        if (error) throw error;
        return res.status(200).json({ items: data ?? [] });
      }

      return res.status(400).json({ error: 'Unknown view.' });
    }

    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { action, payload } = req.body || {};

    if (action === 'toggle-waitlist-approval') {
      const { id, approved } = payload;
      const { error } = await client.from('waitlist').update({ approved }).eq('id', id);
      if (error) throw error;
      await logAction(client, 'WAITLIST_APPROVAL', `Set approved=${approved} for waitlist id ${id}`);
      return res.status(200).json({ success: true });
    }

    if (action === 'delete-waitlist-entry') {
      const { id } = payload;
      const { error } = await client.from('waitlist').delete().eq('id', id);
      if (error) throw error;
      await logAction(client, 'WAITLIST_DELETE', `Deleted waitlist entry ${id}`);
      return res.status(200).json({ success: true });
    }

    if (action === 'reply-question') {
      const { id, adminResponse, status, isFeatured, isPublic } = payload;
      const content = await getSiteContentMap(client);
      const { error } = await client
        .from('suggestions')
        .update({
          admin_response: adminResponse,
          admin_name: content.brand_reply_name || 'LifeOS Team',
          admin_avatar_url: content.reply_logo_url || '/assets/logo-mark.jpg',
          admin_responded_at: new Date().toISOString(),
          status,
          is_featured: isFeatured,
          is_public: isPublic,
        })
        .eq('id', id);
      if (error) throw error;
      await logAction(client, 'QUESTION_REPLY', `Updated question ${id} with status ${status}`);
      return res.status(200).json({ success: true });
    }

    if (action === 'toggle-question-featured') {
      const { id, isFeatured } = payload;
      const { error } = await client.from('suggestions').update({ is_featured: isFeatured }).eq('id', id);
      if (error) throw error;
      await logAction(client, 'QUESTION_FEATURED', `Set featured=${isFeatured} for question ${id}`);
      return res.status(200).json({ success: true });
    }

    if (action === 'toggle-question-visibility') {
      const { id, isPublic } = payload;
      const { error } = await client.from('suggestions').update({ is_public: isPublic }).eq('id', id);
      if (error) throw error;
      await logAction(client, 'QUESTION_VISIBILITY', `Set is_public=${isPublic} for question ${id}`);
      return res.status(200).json({ success: true });
    }

    if (action === 'delete-question') {
      const { id } = payload;
      const { error } = await client.from('suggestions').delete().eq('id', id);
      if (error) throw error;
      await logAction(client, 'QUESTION_DELETE', `Deleted question ${id}`);
      return res.status(200).json({ success: true });
    }

    if (action === 'save-content') {
      const items = Array.isArray(payload?.items) ? payload.items : [];
      if (items.length === 0) return res.status(400).json({ error: 'No content items supplied.' });

      const { error } = await client
        .from('site_content')
        .upsert(items.map((item: { key: string; value: string }) => ({ key: item.key, value: item.value })));
      if (error) throw error;
      await logAction(client, 'SITE_CONTENT_SAVE', `Updated ${items.length} content entries`);
      return res.status(200).json({ success: true });
    }

    if (action === 'save-phase') {
      const phase = payload;
      const record = {
        title: phase.title,
        description: phase.description || null,
        status: phase.status,
        sort_order: Number(phase.sort_order),
        items: Array.isArray(phase.items) ? phase.items : [],
      };

      if (phase.id) {
        const { error } = await client.from('timeline_entries').update(record).eq('id', phase.id);
        if (error) throw error;
        await logAction(client, 'PHASE_UPDATE', `Updated phase ${phase.id}`);
      } else {
        const { error } = await client.from('timeline_entries').insert(record);
        if (error) throw error;
        await logAction(client, 'PHASE_CREATE', `Created phase ${phase.title}`);
      }

      return res.status(200).json({ success: true });
    }

    if (action === 'delete-phase') {
      const { id } = payload;
      const { error } = await client.from('timeline_entries').delete().eq('id', id);
      if (error) throw error;
      await logAction(client, 'PHASE_DELETE', `Deleted phase ${id}`);
      return res.status(200).json({ success: true });
    }

    return res.status(400).json({ error: 'Unknown action.' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown admin error.';
    return res.status(500).json({ error: message });
  }
}
