import { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { password } = req.body;
  const adminPassword = process.env.ADMIN_PASSWORD || process.env.VITE_ADMIN_PASSWORD;

  if (password === adminPassword) {
    // Set a secure HTTP-only cookie
    res.setHeader('Set-Cookie', `admin_session=true; Path=/; HttpOnly; SameSite=Strict; Max-Age=86400`);
    return res.status(200).json({ success: true });
  }

  return res.status(401).json({ error: 'Invalid password' });
}
