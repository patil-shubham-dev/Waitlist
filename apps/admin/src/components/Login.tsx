import { useState } from 'react';
import { LockKeyhole, ShieldCheck } from 'lucide-react';

const LOCAL_SESSION_KEY = 'lifeos_admin_local_authed';

// In local dev (no Vercel API), check password client-side against VITE_ADMIN_PASSWORD.
// In production, the /api/auth serverless function handles it securely.
async function attemptLogin(password: string): Promise<boolean> {
  try {
    const response = await fetch('/api/auth', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    if (response.ok) return true;
    // If the API returns 401 it's a wrong password (even in prod)
    if (response.status === 401) return false;
    // Any other status (e.g. 404 = no Vercel function in local dev) → fall through
    throw new Error(`status ${response.status}`);
  } catch {
    // Local dev fallback: check against VITE_ADMIN_PASSWORD directly
    const expected = import.meta.env.VITE_ADMIN_PASSWORD as string | undefined;
    if (expected && password === expected) {
      // Store a local session flag so the app stays logged in on refresh
      sessionStorage.setItem(LOCAL_SESSION_KEY, 'true');
      return true;
    }
    return false;
  }
}

export { LOCAL_SESSION_KEY };

export default function Login({ onLogin }: { onLogin: () => void }) {
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setStatus('loading');
    const ok = await attemptLogin(password);
    if (ok) {
      onLogin();
    } else {
      setStatus('error');
    }
  };

  return (
    <div className="login-shell">
      <form className="login-card" onSubmit={handleSubmit}>
        <div className="login-brand">
          <img src="assets/logo-mark.jpg" alt="LifeOS" />
          <div>
            <strong>LifeOS Waitlist</strong>
            <span>Admin control panel</span>
          </div>
        </div>

        <div className="login-icon">
          <ShieldCheck size={22} />
        </div>

        <h1>Secure session required</h1>
        <p>Manage launch copy, public questions, roadmap phases, and waitlist entries from one place.</p>

        <label>
          <span>Admin password</span>
          <div className="input-with-icon">
            <LockKeyhole size={16} />
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your admin password"
              autoFocus
              required
            />
          </div>
        </label>

        <button className="admin-button admin-button-primary" type="submit" disabled={status === 'loading'}>
          {status === 'loading' ? 'Checking...' : 'Open control panel'}
        </button>

        {status === 'error' && (
          <p className="admin-error">Incorrect password. Please try again.</p>
        )}
      </form>
    </div>
  );
}
