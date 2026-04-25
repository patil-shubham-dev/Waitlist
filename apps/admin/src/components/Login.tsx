import { useState, useEffect } from 'react'
import { Terminal, Lock, ShieldAlert, Cpu } from 'lucide-react'

export default function Login({ onLogin }: { onLogin: () => void }) {
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState('READY')
  const [logs, setLogs] = useState<string[]>(['INITIALIZING CONNECTION...'])

  const addLog = (msg: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`].slice(-5))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('VERIFYING')
    addLog('HANDSHAKE INITIATED...')
    
    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });

      if (response.ok) {
        addLog('AUTH SUCCESS. REDIRECTING...')
        setStatus('SUCCESS')
        setTimeout(onLogin, 800)
      } else {
        addLog('ACCESS DENIED. IP LOGGED.')
        setStatus('ERROR')
        setTimeout(() => setStatus('READY'), 2000)
      }
    } catch (err) {
      addLog('UPLINK FAILED. CHECK CONNECTION.')
      setStatus('ERROR')
      setTimeout(() => setStatus('READY'), 2000)
    }
  }



  return (
    <div className="login-screen">
      <div className="login-box oracle-card">
        <div className="feature-icon" style={{ margin: '0 auto 1.5rem' }}>
          <Cpu className={status === 'VERIFYING' ? 'pulse-dot' : ''} />
        </div>
        
        <h2 style={{ fontFamily: 'var(--font-mono)', fontSize: '1rem', letterSpacing: '0.2em', marginBottom: '0.5rem' }}>
          ORACLE TERMINAL
        </h2>
        <p className="stat-label" style={{ marginBottom: '2rem' }}>Level 5 Authorization Required</p>

        <form onSubmit={handleSubmit}>
          <div style={{ position: 'relative' }}>
            <Lock size={16} style={{ position: 'absolute', left: '12px', top: '16px', color: 'var(--primary)' }} />
            <input 
              type="password" 
              className="input-hud" 
              placeholder="ENTER ACCESS CODE"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ paddingLeft: '40px' }}
              disabled={status === 'VERIFYING'}
              autoFocus
            />
          </div>
          
          <button 
            type="submit" 
            className={`btn-hud btn-hud-primary`} 
            style={{ width: '100%', padding: '1rem' }}
            disabled={status === 'VERIFYING'}
          >
            {status === 'VERIFYING' ? 'UPLINKING...' : 'INITIATE SESSION'}
          </button>
        </form>

        <div style={{ marginTop: '2rem', textAlign: 'left', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
          {logs.map((log, i) => (
            <div key={i} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-dim)', marginBottom: '0.25rem' }}>
              {log}
            </div>
          ))}
        </div>

        {status === 'ERROR' && (
          <div style={{ marginTop: '1rem', color: 'var(--critical)', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
            <ShieldAlert size={14} /> SECURITY BREACH DETECTED
          </div>
        )}
      </div>
    </div>
  )
}
