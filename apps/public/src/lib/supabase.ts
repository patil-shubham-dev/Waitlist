import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(url, key);

export type WaitlistEntry = {
  id: string;
  name: string;
  email: string;
  role: string | null;
  interest_level: string;
  referrer: string | null;
  approved: boolean;
  created_at: string;
};

export type Suggestion = {
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
  updated_at: string;
};

export type TimelineEntry = {
  id: string;
  title: string;
  description: string | null;
  status: 'past' | 'present' | 'future';
  sort_order: number;
  items: string[] | null;
  created_at: string;
  updated_at: string;
};

export type SiteContent = {
  key: string;
  value: string;
  updated_at: string;
};
