import { useState } from 'react';
import { ShieldCheck, LockKeyhole } from 'lucide-react';

const LOCAL_SESSION_KEY = 'lifeos_admin_local_authed';

async function attemptLogin(password: string): Promise<boolean> {
  try {
    const response = await fetch('/api/auth', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    if (response.ok) return true;
    if (response.status === 401) return false;
    throw new Error(`status ${response.status}`);
  } catch {
    const expected = import.meta.env.VITE_ADMIN_PASSWORD as string | undefined;
    if (expected && password === expected) {
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
    <div className="login-page">
      <form className="login-card" onSubmit={handleSubmit}>
        <div className="login-icon-wrap">
          <ShieldCheck size={34} />
        </div>

        <h1 className="login-title">Admin Access</h1>
        <p className="login-sub">LifeOS Waitlist Control Panel</p>

        <div className="login-field">
          <label className="login-label">Administrator Password</label>
          <div className="login-input-wrap">
            <LockKeyhole size={18} className="login-input-icon" />
            <input
              className="login-input"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter password"
              autoFocus
              required
            />
          </div>
        </div>

        <button className="login-btn" type="submit" disabled={status === 'loading'}>
          {status === 'loading' ? (
            <><div className="spinner" /> Authenticating</>
          ) : (
            'Open Control Panel'
          )}
        </button>

        {status === 'error' && (
          <p className="login-error">Incorrect password. Please try again.</p>
        )}
      </form>
    </div>
  );
}
