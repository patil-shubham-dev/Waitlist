import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import { 
  Sparkles, 
  Orbit, 
  Cpu, 
  ShieldCheck, 
  ArrowUpRight, 
  Mail, 
  Github, 
  Twitter,
  ChevronRight,
  Globe,
  Zap,
  CheckCircle2,
  Flame,
  Camera,
  Trophy,
  ArrowRight,
  Activity,
  Play
} from 'lucide-react'

/* ─── Premium Components ─── */

function BackgroundFX() {
  return (
    <>
      <div className="bg-mesh" />
      <div className="bg-noise" />
    </>
  )
}

function Counter({ label, value, suffix = "", prefix = "" }: { label: string, value: number, suffix?: string, prefix?: string }) {
  const [displayValue, setDisplayValue] = useState(0)
  
  useEffect(() => {
    let start = 0
    const end = value
    if (start === end) {
      setDisplayValue(end)
      return
    }
    
    let totalMiliseconds = 2000
    let incrementTime = (totalMiliseconds / end)
    
    let timer = setInterval(() => {
      start += Math.ceil(end / 40)
      if (start >= end) {
        start = end
        clearInterval(timer)
      }
      setDisplayValue(start)
    }, incrementTime)
    
    return () => clearInterval(timer)
  }, [value])

  return (
    <div className="stat-item">
      <h4>{prefix}{displayValue.toLocaleString()}{suffix}</h4>
      <p>{label}</p>
    </div>
  )
}

function UIMockupCard({ children, title, subtitle, icon: Icon, delay = 0, noPadding = false }: any) {
  return (
    <div className="glass-card feature-showcase" style={{ transitionDelay: `${delay}ms`, padding: noPadding ? 0 : '1.5rem' }}>
      {!noPadding && (
        <div style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div className="feature-icon" style={{ margin: 0 }}>
            <Icon size={24} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.2rem' }}>{title}</h3>
            <p style={{ color: 'var(--text-muted)' }}>{subtitle}</p>
          </div>
        </div>
      )}
      <div className={`mockup-container ${noPadding ? 'full-bleed' : ''}`}>
        {children}
      </div>
    </div>
  )
}

export default function App() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [count, setCount] = useState(0)
  const [scrolled, setScrolled] = useState(false)
  const [position, setPosition] = useState(0)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const [config, setConfig] = useState({
    hero_title: 'Turn Action Into Progress.',
    hero_subtext: 'LifeOS is a proof-driven system where your actions become measurable growth.',
    cta_text: 'Secure Your Position',
    show_features: true
  })

  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem('site_config_mock')
      if (saved) setConfig(JSON.parse(saved))
    }
    handleStorageChange()
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  useEffect(() => {
    const fetchCount = async () => {
      const { count } = await supabase
        .from('waitlist')
        .select('*', { count: 'exact', head: true })
      setCount(count || 0)
    }
    fetchCount()
  }, [])

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    
    try {
      const { error } = await supabase
        .from('waitlist')
        .insert([{ email, name: email.split('@')[0], role: 'beta' }])
      
      if (error) throw error
      setSubmitted(true)
      setPosition(count + 1)
    } catch (err: any) {
      console.error(err)
      alert('Error joining waitlist. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const scrollToWaitlist = () => {
    document.getElementById('waitlist')?.scrollIntoView({ behavior: 'smooth' })
  }

  const smoothScrollTo = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <div className="app-container">
      <BackgroundFX />
      
      {/* ─── Navigation ─── */}
      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="nav-content">
          <a href="#" className="logo">
            <img src="/assets/logo-wordmark.svg" alt="LifeOS Protocol" style={{ height: '32px' }} />
          </a>
          
          <div className="nav-links">
            <a href="#core-loop" onClick={(e) => smoothScrollTo(e, 'core-loop')} className="nav-link">The Loop</a>
            <a href="#features" onClick={(e) => smoothScrollTo(e, 'features')} className="nav-link">Systems</a>
            <a href="#timeline" onClick={(e) => smoothScrollTo(e, 'timeline')} className="nav-link">Timeline</a>
            <button className="btn btn-primary" onClick={scrollToWaitlist}>
              Secure Your Position
            </button>
          </div>
        </div>
      </nav>

      {/* ─── Hero Section ─── */}
      <section className="hero">
        <div className="hero-content" style={{ maxWidth: '1200px' }}>
          <div className="hero-tag float">
            <img src="/assets/logo-mark.svg" alt="LifeOS" style={{ height: '16px', marginRight: '8px' }} />
            The Proof-Driven Evolution System
          </div>
          
          <h1 className="hero-title gradient-text">
            {config.hero_title}
          </h1>
          
          <p className="hero-subtitle">
            {config.hero_subtext}
          </p>
          
          <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', marginBottom: '4rem' }}>
            <button className="btn btn-primary" onClick={scrollToWaitlist}>
              {config.cta_text} <ChevronRight size={18} />
            </button>
            <a href="#core-loop" className="btn btn-outline" style={{ textDecoration: 'none' }}>
              <Play size={16} /> See LifeOS in Action
            </a>
          </div>

          {/* Animated Hero Mock */}
          <div className="hero-mockup-wrapper float">
            <div className="hero-mockup-glow" />
            <div className="hero-mockup glass-card">
              <div className="mock-header">
                <div className="mock-dots" />
                <div className="mock-title">LifeOS Global Dashboard</div>
              </div>
              <div className="mock-body">
                <div className="mock-sidebar">
                  <div className="mock-profile">
                    <div className="mock-avatar" />
                    <div>
                      <div className="mock-name">Lvl 42 Oracle</div>
                      <div className="mock-xp-bar">
                        <div className="mock-xp-fill" style={{ width: '70%' }} />
                      </div>
                    </div>
                  </div>
                  <div className="mock-streak">
                    <Flame size={20} color="var(--primary)" />
                    <span>36 Day Streak</span>
                  </div>
                </div>
                <div className="mock-main">
                  <div className="mock-feed">
                    <div className="mock-task active-task">
                      <div className="task-info">
                        <strong>Deep Work: Ship Waitlist</strong>
                        <span className="ai-badge"><Cpu size={12}/> Extreme Difficulty [+500 XP]</span>
                      </div>
                      <div className="task-action">
                        <button className="btn-hud-primary" style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem' }}><Camera size={14} style={{ marginRight: '4px' }}/> Prove</button>
                      </div>
                    </div>
                    
                    <div className="mock-proof-card">
                      <div className="proof-header">
                        <div className="proof-user">1h ago • Workout Complete</div>
                        <div className="proof-ai">
                          <CheckCircle2 size={12} color="var(--safe)" />
                          <span>AI Verified: 98% Confidence</span>
                        </div>
                      </div>
                      <div className="proof-image" />
                      <div className="proof-footer">
                        <span>+150 XP Gained</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Core Loop Section ─── */}
      <section id="core-loop" className="features">
        <div className="section-header">
          <div className="hero-tag" style={{ background: 'transparent', border: '1px solid var(--border)' }}>The Engine</div>
          <h2>The LifeOS Core Loop</h2>
          <p>Consume → Act → Prove → Earn → Show → Repeat</p>
        </div>

        <div className="loop-track">
          <div className="loop-step">
            <div className="step-num">01</div>
            <h3>Consume</h3>
            <p>Your feed is optimized for action, not scrolling.</p>
            <div className="step-ui">
              <div className="ui-skeleton line w-full" />
              <div className="ui-skeleton line w-3/4" />
            </div>
          </div>
          <div className="loop-connector"><ArrowRight color="var(--primary)" opacity={0.5} /></div>
          
          <div className="loop-step active">
            <div className="step-num">02</div>
            <h3>Act</h3>
            <p>Execute verified tasks tailored by your AI.</p>
            <div className="step-ui highlight">
              <CheckCircle2 color="var(--safe)" /> <span>Deep Work Started</span>
            </div>
          </div>
          <div className="loop-connector"><ArrowRight color="var(--primary)" opacity={0.5} /></div>

          <div className="loop-step">
            <div className="step-num">03</div>
            <h3>Prove</h3>
            <p>Upload cryptographic visual proof of completion.</p>
            <div className="step-ui border-dashed">
              <Camera color="var(--text-muted)" />
            </div>
          </div>
          <div className="loop-connector"><ArrowRight color="var(--primary)" opacity={0.5} /></div>

          <div className="loop-step">
            <div className="step-num">04</div>
            <h3>Earn</h3>
            <p>AI verifies proof and awards quantified XP.</p>
            <div className="step-ui glowing">
              <span className="accent-gradient font-bold">+500 XP</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── A Day With LifeOS (Timeline) ─── */}
      <section id="timeline" className="timeline-section">
        <div className="section-header">
          <h2>A Day With LifeOS</h2>
        </div>
        <div className="timeline-container">
          <div className="timeline-item">
            <div className="time-marker">08:00</div>
            <UIMockupCard title="Morning Optimization" subtitle="AI schedules tasks based on biometric recovery and priority." icon={Cpu}>
              <div className="ui-panel">
                <div className="ai-chat-bubble">
                  <strong>Oracle AI</strong>
                  <p>Recovery is at 92%. I've front-loaded your Deep Work for 09:00.</p>
                </div>
                <div className="mock-schedule">
                  <div className="schedule-item">09:00 - Ship LifeOS Feature</div>
                  <div className="schedule-item muted">12:00 - Workout (Legs)</div>
                </div>
              </div>
            </UIMockupCard>
          </div>

          <div className="timeline-item">
            <div className="time-marker">14:00</div>
            <UIMockupCard title="Execution Mode" subtitle="Flow state activated. Distractions eliminated." icon={Zap}>
              <div className="ui-panel dark-mode">
                <div className="focus-timer">
                  <span className="time">45:00</span>
                  <span className="label">ACTIVE FLOW STATE</span>
                </div>
              </div>
            </UIMockupCard>
          </div>

          <div className="timeline-item">
            <div className="time-marker">21:00</div>
            <UIMockupCard title="Validation & Growth" subtitle="Cryptographic proof verified. Level up." icon={Trophy}>
              <div className="ui-panel success-mode">
                <div className="verification-status">
                  <ShieldCheck size={48} color="var(--safe)" />
                  <h4>Visual Proof Verified</h4>
                  <p className="confidence">Confidence Score: 99.4%</p>
                </div>
                <div className="xp-gain-anim">+850 XP GAINED</div>
              </div>
            </UIMockupCard>
          </div>
        </div>
      </section>

      {/* ─── Features (UI Showcases) ─── */}
      {config.show_features && (
        <section id="features" className="features">
          <div className="section-header">
            <h2>System Architecture</h2>
          </div>
          <div className="features-grid">
            <UIMockupCard title="Intelligent Task System" subtitle="Tasks automatically rated for difficulty." icon={CheckCircle2}>
              <div className="mock-task-card">
                <input type="text" value="Run 10km" readOnly />
                <div className="ai-difficulty-pill">
                  <Cpu size={12}/> Hard (+300 XP)
                </div>
              </div>
            </UIMockupCard>
            
            <UIMockupCard title="Gamification Engine" subtitle="Maintain streaks. Burn through levels." icon={Flame}>
              <div className="mock-gamification">
                <div className="streak-circle glowing">
                  <Flame size={32} color="var(--primary)" />
                  <span>124</span>
                </div>
                <div className="level-info">Level 42 · Master</div>
              </div>
            </UIMockupCard>
          </div>
        </section>
      )}

      {/* ─── Waitlist Section ─── */}
      <section id="waitlist" className="waitlist-section">
        <div className="waitlist-container glass-card" style={{ textAlign: 'center' }}>
          {!submitted ? (
            <>
              <div className="hero-tag">Secure Your Position</div>
              <h2 style={{ marginBottom: '1rem', fontSize: '2.5rem' }}>Enter LifeOS</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem', fontSize: '1.1rem' }}>
                The algorithm is selecting founding nodes. <br />
                Currently tracking <strong className="accent-gradient">{count > 0 ? count.toLocaleString() : '...'}</strong> members waiting for initialization.
              </p>
              
              <form onSubmit={handleJoin} style={{ maxWidth: '500px', margin: '0 auto' }}>
                <div className="form-group" style={{ position: 'relative' }}>
                  <Mail size={18} style={{ position: 'absolute', left: '16px', top: '16px', color: 'var(--text-muted)' }} />
                  <input 
                    type="email" 
                    className="input-glow" 
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={{ paddingLeft: '48px' }}
                  />
                </div>
                <button type="submit" className="btn btn-primary btn-full" disabled={loading} style={{ fontSize: '1.1rem', padding: '1rem' }}>
                  {loading ? 'Transmitting...' : 'Enter LifeOS'}
                </button>
              </form>
            </>
          ) : (
            <div style={{ padding: '2rem' }}>
              <div className="feature-icon" style={{ margin: '0 auto 1.5rem', background: 'var(--safe)', color: '#000' }}>
                <ShieldCheck size={32} />
              </div>
              <h2 className="gradient-text">Position Secured</h2>
              <div className="position-board">
                <p>Your Initialization Sequence:</p>
                <div className="position-number">#{position.toLocaleString()}</div>
              </div>
              <p style={{ color: 'var(--text-muted)', marginTop: '1.5rem' }}>
                You will be notified when your node is approved for connection.<br/>
                Prepare for synchronization.
              </p>
              <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'var(--bg-elevated)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <p style={{ fontSize: '0.9rem', color: 'var(--primary)', fontWeight: '600', marginBottom: '0.5rem' }}>ADVANCE YOUR POSITION</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Invite 3 operators to skip the queue.</p>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input type="text" className="input-glow" value={`https://lifeos.com/invite/${email.split('@')[0]}`} readOnly style={{ padding: '0.75rem', fontSize: '0.85rem' }} />
                  <button className="btn btn-outline" style={{ padding: '0.75rem' }}>Copy</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer style={{ padding: '4rem 2rem', borderTop: '1px solid var(--border)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '2rem' }}>
          <div>
            <div className="logo" style={{ marginBottom: '1rem' }}>
              <img src="/assets/logo-wordmark.svg" alt="LifeOS Protocol" style={{ height: '28px' }} />
            </div>
            <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>© 2027 LifeOS Protocol. All rights reserved.</p>
          </div>
          
          <div style={{ display: 'flex', gap: '2rem' }}>
            <a href="#" className="nav-link"><Twitter size={20} /></a>
            <a href="#" className="nav-link"><Github size={20} /></a>
            <a href="#" className="nav-link"><Activity size={20} /></a>
          </div>
        </div>
      </footer>
    </div>
  )
}