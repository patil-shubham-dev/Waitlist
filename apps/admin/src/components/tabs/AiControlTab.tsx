import { Cpu, Shield, Zap, AlertTriangle } from 'lucide-react'
import { useState } from 'react'

export default function AiControlTab() {
  const [godMode, setGodMode] = useState(false)

  const handleToggle = () => {
    const val = prompt('Enter SuperAdmin Passphrase to toggle God Mode:')
    if (val === 'ORACLE_GOD_MODE_2027') setGodMode(!godMode)
    else alert('Access Denied.')
  }

  return (
    <div className="main-view">
      <div style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-mono)', fontSize: '1.5rem', fontWeight: 700 }}>AI CONTROL PANEL</h1>
          <p className="stat-label">ALGORITHM DIFFICULTY & LOGIC</p>
        </div>
        <button className="btn-hud" onClick={handleToggle} style={{ borderColor: godMode ? 'var(--critical)' : 'var(--safe)', color: godMode ? 'var(--critical)' : 'var(--safe)' }}>
          {godMode ? <><AlertTriangle size={16} style={{marginRight:'8px'}}/> GOD MODE ACTIVE</> : <><Shield size={16} style={{marginRight:'8px'}}/> SAFE MODE</>}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <div className="oracle-card">
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Cpu size={18} /> Logic Thresholds
          </h3>
          <div style={{ marginBottom: '1.5rem' }}>
            <div className="stat-label" style={{ marginBottom: '0.5rem' }}>Proof Validation Auto-Reject Threshold</div>
            <input type="range" min="0" max="100" defaultValue="45" style={{ width: '100%' }} disabled={!godMode} />
            <p style={{ fontSize: '0.75rem', marginTop: '4px', color: 'var(--text-dim)' }}>Currently blocking proofs &lt;45% bot confidence.</p>
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <div className="stat-label" style={{ marginBottom: '0.5rem' }}>Difficulty Base XP Multiplier</div>
            <input type="range" min="1" max="5" step="0.1" defaultValue="1.5" style={{ width: '100%' }} disabled={!godMode} />
          </div>
        </div>

        <div className="oracle-card">
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Zap size={18} /> Level Progression
          </h3>
          <div style={{ marginBottom: '1rem' }}>
            <label className="stat-label">Lvl 1-10 Curve Steepness</label>
            <input type="text" className="input-hud" defaultValue="Logarithmic (Standard)" disabled={!godMode} />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label className="stat-label">Global XP Modifier (%)</label>
            <input type="number" className="input-hud" defaultValue="100" disabled={!godMode} />
          </div>
          <button className="btn-hud btn-hud-primary" style={{ width: '100%' }} disabled={!godMode}>DEPLOY TO AI CLUSTER</button>
        </div>
      </div>
    </div>
  )
}
