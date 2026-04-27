import { useEffect, useState } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';

export default function App() {
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch('/api/auth', { credentials: 'include' });
        const data = await response.json();
        setAuthed(Boolean(data.authenticated));
      } catch {
        setAuthed(false);
      } finally {
        setChecking(false);
      }
    };

    checkSession();
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth', { method: 'DELETE', credentials: 'include' });
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
