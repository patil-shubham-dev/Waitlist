import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'

/* Floating orb background element */
function Orb({ style }: { style: React.CSSProperties }) {
  return (
    <div style={{
      position: 'absolute',
      borderRadius: '50%',
      filter: 'blur(80px)',
      pointerEvents: 'none',
      animation: 'orb-drift 14s ease-in-out infinite',
      ...style,
    }} />
  )
}

/* Single particle */
function Particle({ x, y, delay, size }: { x: string; y: string; delay: string; size: number }) {
  return (
    <div style={{
      position: 'absolute',
      left: x, top: y,
      width: size, height: size,
      borderRadius: '50%',
      background: 'var(--accent)',
      animation: `particle-rise ${7 + Math.random() * 6}s linear infinite`,
      animationDelay: delay,
      opacity: 0,
      pointerEvents: 'none',
    }} />
  )
}

const PARTICLES = Array.from({ length: 22 }, (_, i) => ({
  id: i,
  x: `${4 + Math.random() * 92}%`,
  y: `${50 + Math.random() * 46}%`,
  delay: `${(Math.random() * 10).toFixed(1)}s`,
  size: 1 + Math.random() * 2,
}))

/* Word-by-word animated headline */
function AnimatedHeadline({ text, delay = 0 }: { text: string; delay?: number }) {
  const words = text.split(' ')
  return (
    <span style={{ display: 'inline', perspective: 800 }}>
      {words.map((word, i) => (
        <span key={i} style={{ display: 'inline-block', overflow: 'hidden', marginRight: '0.25em' }}>
          <span style={{
            display: 'inline-block',
            animation: `word-reveal 0.7s cubic-bezier(0.16,1,0.3,1) both`,
            animationDelay: `${delay + i * 0.08}s`,
          }}>
            {word}
          </span>
        </span>
      ))}
    </span>
  )
}

export default function Hero() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'exists'>('idle')
  const [count, setCount] = useState<number | null>(null)
  const [mounted, setMounted] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    // Small delay so CSS animations have time to register
    const t = setTimeout(() => setMounted(true), 30)
    supabase
      .from('waitlist')
      .select('*', { count: 'exact', head: true })
      .then(({ count: c }) => setCount(c ?? 0))
    return () => clearTimeout(t)
  }, [])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setStatus('loading')
    const { error } = await supabase.from('waitlist').insert({
      name: email.split('@')[0],
      email: email.trim(),
      role: 'other',
    })
    setStatus(error?.code === '23505' ? 'exists' : error ? 'idle' : 'done')
  }

  return (
    <section
      ref={sectionRef}
      style={{
        minHeight: '100vh',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '80px clamp(20px, 5vw, 40px) 80px',
        textAlign: 'center',
        position: 'relative', overflow: 'hidden',
      }}
    >
      {/* Background orbs — Apple-style chromatic depth */}
      <Orb style={{
        width: 600, height: 600,
        background: 'radial-gradient(circle, rgba(255,90,31,0.14) 0%, transparent 70%)',
        top: '10%', left: '50%', transform: 'translateX(-50%)',
        animationDuration: '16s',
      }} />
      <Orb style={{
        width: 400, height: 400,
        background: 'radial-gradient(circle, rgba(255,130,60,0.08) 0%, transparent 70%)',
        top: '40%', left: '20%',
        animationDuration: '20s',
        animationDelay: '-5s',
      }} />
      <Orb style={{
        width: 350, height: 350,
        background: 'radial-gradient(circle, rgba(200,80,20,0.07) 0%, transparent 70%)',
        top: '30%', right: '15%',
        animationDuration: '18s',
        animationDelay: '-9s',
      }} />

      {/* Subtle noise grid */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `
          linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px)
        `,
        backgroundSize: '88px 88px',
        maskImage: 'radial-gradient(ellipse 80% 65% at 50% 45%, black, transparent)',
        WebkitMaskImage: 'radial-gradient(ellipse 80% 65% at 50% 45%, black, transparent)',
        pointerEvents: 'none',
      }} />

      {/* Particles */}
      {mounted && PARTICLES.map((p) => (
        <Particle key={p.id} x={p.x} y={p.y} delay={p.delay} size={p.size} />
      ))}

      {/* Badge */}
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 9,
        border: '1px solid rgba(255,90,31,0.22)',
        borderRadius: 100, padding: '7px 18px',
        fontSize: 12, fontWeight: 500, color: 'var(--text-muted)',
        marginBottom: 16,
        background: 'rgba(255,90,31,0.06)',
        backdropFilter: 'blur(12px)',
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateY(0)' : 'translateY(10px)',
        transition: 'opacity 0.6s ease, transform 0.6s ease',
        letterSpacing: '0.01em',
      }}>
        <span style={{
          width: 6, height: 6, borderRadius: '50%',
          background: 'var(--accent)', display: 'inline-block',
          animation: 'pulse-dot 2.5s ease-in-out infinite',
          boxShadow: '0 0 8px var(--accent-glow)',
        }} />
        Early access · Limited spots
      </div>

      {/* Social Proof */}
      <p style={{
        fontSize: 12, color: 'var(--text-faint)',
        marginBottom: 28, letterSpacing: '0.02em',
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateY(0)' : 'translateY(8px)',
        transition: 'opacity 0.6s 0.1s ease, transform 0.6s 0.1s ease',
      }}>
        Join early builders building real discipline.
      </p>

      {/* Logo + wordmark */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14,
        marginBottom: 32,
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateY(0)' : 'translateY(12px)',
        transition: 'opacity 0.65s 0.08s ease, transform 0.65s 0.08s ease',
      }}>
        <div style={{
          width: 48, height: 48, borderRadius: 12,
          background: 'var(--accent)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 32px var(--accent-glow), 0 4px 16px rgba(0,0,0,0.4)',
        }}>
          <img
            src="/assets/logo-mark.svg"
            alt="LifeOS"
            style={{ width: 32, height: 32 }}
          />
        </div>
        <span style={{
          fontSize: 'clamp(22px, 3vw, 28px)',
          fontWeight: 700, letterSpacing: '-0.045em',
          color: 'var(--text)',
        }}>
          LifeOS
        </span>
      </div>

      {/* Main headline — word by word reveal */}
      <h1
        className="t-display"
        style={{
          maxWidth: 860, marginBottom: 28,
          lineHeight: 1.04,
        }}
      >
        {mounted && (
          <>
            <AnimatedHeadline text="The operating system" delay={0.18} />
            <br />
            <span style={{ display: 'inline-block' }}>
              <span style={{
                animation: mounted ? 'word-reveal 0.7s 0.52s cubic-bezier(0.16,1,0.3,1) both' : 'none',
                display: 'inline-block',
              }}
              className="gradient-text"
              >
                for your life.
              </span>
            </span>
          </>
        )}
      </h1>

      {/* Subtext */}
      <p
        className="t-body"
        style={{
          color: 'var(--text-muted)', maxWidth: 480,
          marginBottom: 52,
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(14px)',
          transition: 'opacity 0.7s 0.50s ease, transform 0.7s 0.50s ease',
        }}
      >
        From scattered goals to consistent execution.
        Built for people who want results, not reminders.
      </p>

      {/* Email form */}
      <div style={{
        width: '100%', maxWidth: 440,
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateY(0)' : 'translateY(14px)',
        transition: 'opacity 0.7s 0.62s ease, transform 0.7s 0.62s ease',
      }}>
        {status === 'done' ? (
          <div style={{
            padding: '16px 28px',
            background: 'rgba(52,211,153,0.08)',
            border: '1px solid rgba(52,211,153,0.2)',
            borderRadius: 12, fontSize: 14, color: '#6ee7b7',
            animation: 'fade-in-up 0.4s ease',
            fontWeight: 500,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            You're on the list — see you on the inside.
          </div>
        ) : (
          <form onSubmit={submit}>
            <div style={{
              display: 'flex', gap: 8,
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid var(--border-strong)',
              borderRadius: 12, padding: '5px 5px 5px 16px',
              backdropFilter: 'blur(16px)',
              transition: 'border-color 0.2s, box-shadow 0.2s',
            }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'var(--accent-border)'
                e.currentTarget.style.boxShadow = '0 0 0 3px var(--accent-dim)'
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-strong)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              <input
                type="email" required
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: 'var(--text)',
                  fontSize: 14,
                  fontFamily: 'Inter, sans-serif',
                }}
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                className="btn-primary"
                style={{
                  opacity: status === 'loading' ? 0.8 : 1,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  minWidth: 140,
                }}
              >
                {status === 'loading' ? (
                  <>
                    <span style={{
                      width: 14, height: 14, borderRadius: '50%',
                      border: '2px solid rgba(255,255,255,0.3)',
                      borderTopColor: '#fff',
                      animation: 'spin 0.8s linear infinite',
                      display: 'inline-block',
                    }} />
                    Joining…
                  </>
                ) : 'Get Early Access'}
              </button>
            </div>
            {status === 'exists' && (
              <p style={{
                fontSize: 12, color: '#6ee7b7', marginTop: 10, textAlign: 'center',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Already on the list — you're good.
              </p>
            )}
          </form>
        )}

        {count !== null && count > 0 && (
          <p style={{
            marginTop: 16, fontSize: 12.5,
            color: 'var(--text-faint)', textAlign: 'center',
            letterSpacing: '0.01em',
            animation: 'counter-up 0.5s 1.2s ease both',
          }}>
            {count.toLocaleString()} people already waiting
          </p>
        )}
      </div>
    </section>
  )
}
