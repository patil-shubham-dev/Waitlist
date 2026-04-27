import { useState } from 'react';
import { LockKeyhole, ShieldCheck } from 'lucide-react';

export default function Login({ onLogin }: { onLogin: () => void }) {
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setStatus('loading');

    const response = await fetch('/api/auth', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ password }),
    });

    if (!response.ok) {
      setStatus('error');
      return;
    }

    onLogin();
  };

  return (
    <div className="login-shell">
      <form className="login-card" onSubmit={handleSubmit}>
        <div className="login-brand">
          <img src="/assets/logo-mark.svg" alt="LifeOS" />
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

        {status === 'error' && <p className="admin-error">That password did not match. Please try again.</p>}
      </form>
    </div>
  );
}
