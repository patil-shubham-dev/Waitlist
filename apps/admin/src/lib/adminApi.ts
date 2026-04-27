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

async function parseResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    const text = await response.text();
    throw new Error(`Expected JSON response, but received ${contentType || 'plain text'}: ${text.slice(0, 50)}...`);
  }
  
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Request failed.');
  }
  return data as T;
}

export async function adminGet<T>(view: string) {
  const response = await fetch(`/api/admin?view=${encodeURIComponent(view)}`, {
    credentials: 'include',
  });
  return parseResponse<T>(response);
}

export async function adminPost<T>(action: string, payload: unknown) {
  const response = await fetch('/api/admin', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ action, payload }),
  });
  return parseResponse<T>(response);
}
