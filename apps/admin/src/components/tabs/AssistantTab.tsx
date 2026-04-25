import { Terminal, Send, Command } from 'lucide-react'
import { useState } from 'react'

export default function AssistantTab() {
  const [logs, setLogs] = useState<{ id: number; text: string; type: 'in' | 'out' }[]>([
    { id: 1, text: 'Oracle Assistant Online. Awaiting command prompt.', type: 'out' }
  ])
  const [input, setInput] = useState('')

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input) return
    const currentInput = input

    setLogs(prev => [...prev, { id: Date.now(), text: currentInput, type: 'in' }])
    setInput('')

    // Fake simulation of Assistant processing
    setTimeout(() => {
      let output = `Executing NLP translation...`
      if (currentInput.toLowerCase().includes('broken streak')) {
        output = 'Found 2,143 users with broken streaks in the last 48 hours. Want me to trigger a recovery campaign?'
      } else if (currentInput.toLowerCase().includes('boost xp')) {
        output = 'SIMULATING: +20% XP boost for 24 hours. This will inject approx 4.2M XP into the economy. Proceed? (Y/N)'
      } else {
        output = `Action mapped to: [Unidentified Command Sequence]. Please refine input parameters.`
      }
      setLogs(prev => [...prev, { id: Date.now(), text: output, type: 'out' }])
    }, 800)
  }

  return (
    <div className="main-view" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 100px)' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'var(--font-mono)', fontSize: '1.5rem', fontWeight: 700 }}>ORACLE AI ASSISTANT</h1>
        <p className="stat-label">NATURAL LANGUAGE CONTROL PROTOCOL</p>
      </div>

      <div className="oracle-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 0 }}>
        <div style={{ padding: '1rem', borderBottom: '1px solid var(--border)', background: 'var(--bg-subtle)' }}>
          <div className="stat-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Command size={14} color="var(--primary)" /> LLM CONNECTED (GPT-5 CORE)
          </div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', background: '#000' }}>
          {logs.map(log => (
            <div key={log.id} style={{
              alignSelf: log.type === 'in' ? 'flex-end' : 'flex-start',
              background: log.type === 'in' ? 'var(--primary-muted)' : 'var(--bg-elevated)',
              color: log.type === 'in' ? 'var(--primary)' : 'var(--text)',
              border: `1px solid ${log.type === 'in' ? 'var(--primary)' : 'var(--border)'}`,
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              fontFamily: log.type === 'out' ? 'var(--font-mono)' : 'inherit',
              fontSize: '0.9rem',
              maxWidth: '80%'
            }}>
              {log.text}
            </div>
          ))}
        </div>
        <div style={{ padding: '1rem', borderTop: '1px solid var(--border)' }}>
          <form style={{ display: 'flex', gap: '1rem' }} onSubmit={handleSend}>
            <Terminal size={20} color="var(--text-muted)" style={{ marginTop: '0.5rem' }} />
            <input 
              type="text" 
              className="input-hud" 
              placeholder='e.g. "Show users with broken streak" or "Boost XP system by 20%"'
              value={input}
              onChange={e => setInput(e.target.value)}
              style={{ marginBottom: 0, flex: 1 }}
              autoFocus
            />
            <button type="submit" className="btn-hud btn-hud-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Send size={16} /> EXECUTE
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
