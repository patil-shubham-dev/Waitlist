import { useState } from 'react';
import { LockKeyhole, ShieldCheck } from 'lucide-react';

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
    <div style={{ 
      height: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '24px'
    }}>
      <form 
        style={{ 
          background: 'var(--card)',
          padding: '40px',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border)',
          width: '100%',
          maxWidth: '440px',
          boxShadow: 'var(--shadow)',
          textAlign: 'center'
        }} 
        onSubmit={handleSubmit}
      >
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
          <div style={{ 
            width: '64px', 
            height: '64px', 
            borderRadius: '16px', 
            background: 'var(--accent-soft)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--accent)'
          }}>
            <ShieldCheck size={32} />
          </div>
        </div>

        <h1 style={{ fontSize: '24px', fontWeight: 800, letterSpacing: '-0.04em', marginBottom: '8px' }}>
          Admin Login
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '32px' }}>
          Secure access to the LifeOS Waitlist control panel
        </p>

        <div style={{ textAlign: 'left', marginBottom: '24px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
            Administrator Password
          </label>
          <div style={{ position: 'relative' }}>
            <LockKeyhole size={18} style={{ 
              position: 'absolute', 
              left: '12px', 
              top: '50%', 
              transform: 'translateY(-50%)', 
              color: 'var(--text-faint)' 
            }} />
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              style={{ paddingLeft: '40px' }}
              autoFocus
              required
            />
          </div>
        </div>

        <button 
          className="button-primary" 
          type="submit" 
          disabled={status === 'loading'}
          style={{ width: '100%', justifyContent: 'center', height: '48px' }}
        >
          {status === 'loading' ? 'Authenticating...' : 'Open Control surface'}
        </button>

        {status === 'error' && (
          <p style={{ color: 'var(--danger)', fontSize: '13px', marginTop: '16px', fontWeight: 500 }}>
            Incorrect password. Please try again.
          </p>
        )}
      </form>
    </div>
  );
}
