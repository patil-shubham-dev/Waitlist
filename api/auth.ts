import type { VercelRequest, VercelResponse } from '@vercel/node';

const COOKIE_NAME = 'lifeos_admin_session';

function buildCookie(value: string, maxAge: number) {
  return `${COOKIE_NAME}=${value}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAge}`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const adminPassword = process.env.ADMIN_PASSWORD || process.env.VITE_ADMIN_PASSWORD;

  if (!adminPassword) {
    return res.status(500).json({ error: 'ADMIN_PASSWORD is not configured.' });
  }

  if (req.method === 'GET') {
    const authenticated = req.cookies?.[COOKIE_NAME] === 'true';
    return res.status(200).json({ authenticated });
  }

  if (req.method === 'DELETE') {
    res.setHeader('Set-Cookie', buildCookie('false', 0));
    return res.status(200).json({ success: true });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { password } = req.body || {};

  if (password !== adminPassword) {
    return res.status(401).json({ error: 'Invalid password' });
  }

  res.setHeader('Set-Cookie', buildCookie('true', 60 * 60 * 12));
  return res.status(200).json({ success: true, authenticated: true });
}
