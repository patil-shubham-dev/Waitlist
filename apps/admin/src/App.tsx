import { useEffect, useState } from 'react';
import Login, { LOCAL_SESSION_KEY } from './components/Login';
import Dashboard from './components/Dashboard';

export default function App() {
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      // 1. Check local dev session first (set by Login fallback)
      if (sessionStorage.getItem(LOCAL_SESSION_KEY) === 'true') {
        setAuthed(true);
        setChecking(false);
        return;
      }

      // 2. Check the Vercel /api/auth cookie session (production)
      try {
        const response = await fetch('/api/auth', { credentials: 'include' });
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          setAuthed(Boolean(data.authenticated));
        } else {
          // If we get HTML or something else, the API isn't ready/deployed
          setAuthed(false);
        }
      } catch {
        // API not available (local dev without Vercel) — not authed yet
        setAuthed(false);
      } finally {
        setChecking(false);
      }
    };

    checkSession();
  }, []);

  const handleLogout = async () => {
    // Clear local dev session
    sessionStorage.removeItem(LOCAL_SESSION_KEY);
    // Clear Vercel cookie session (no-op in local dev)
    try {
      await fetch('/api/auth', { method: 'DELETE', credentials: 'include' });
    } catch {
      // Ignore in local dev
    }
    setAuthed(false);
  };

  if (checking) {
    return (
      <div className="app-loading">
        <div className="loading-dot" />
      </div>
    );
  }

  return authed ? <Dashboard onLogout={handleLogout} /> : <Login onLogin={() => setAuthed(true)} />;
}
