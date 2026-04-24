import { useState, useEffect } from 'react'
import Login from './components/Login'
import Dashboard from './components/Dashboard'

const SESSION_KEY = 'lifeos_admin_authed'

export default function App() {
  const [authed, setAuthed] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const stored = sessionStorage.getItem(SESSION_KEY)
    if (stored === 'true') setAuthed(true)
    setChecking(false)
  }, [])

  const handleLogin = () => {
    sessionStorage.setItem(SESSION_KEY, 'true')
    setAuthed(true)
  }

  const handleLogout = () => {
    sessionStorage.removeItem(SESSION_KEY)
    setAuthed(false)
  }

  if (checking) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        background: '#080808',
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: '50%',
          border: '2px solid #1a1a1a',
          borderTop: '2px solid #FF5500',
          animation: 'spin 0.8s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  return authed
    ? <Dashboard onLogout={handleLogout} />
    : <Login onLogin={handleLogin} />
}
