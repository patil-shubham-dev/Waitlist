import { useState, useEffect } from 'react'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const fn = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) setIsOpen(false)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const navLinks = [['What', '#what'], ['Features', '#features'], ['Roadmap', '#roadmap']]

  return (
    <>
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        height: 56,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 clamp(20px, 4vw, 44px)',
        background: '#0a0a0a',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
      }}>
        {/* Logo */}
        <a href="/" style={{
          display: 'flex', alignItems: 'center', gap: 9,
          transition: 'opacity 0.2s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.75')}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
        >
          <div style={{
            width: 26, height: 26, borderRadius: 7,
            background: 'var(--accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 12px var(--accent-glow)',
          }}>
            <img src="/assets/logo-mark.svg" alt="" style={{ width: 18, height: 18 }} />
          </div>
          <span style={{
            fontSize: 15, fontWeight: 700,
            color: 'var(--text)', letterSpacing: '-0.03em',
          }}>
            LifeOS
          </span>
        </a>

        {/* Desktop Nav */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 4 }} className="nav-desktop">
          {navLinks.map(([label, href]) => (
            <a
              key={label}
              href={href}
              style={{
                fontSize: 13, fontWeight: 500,
                color: 'var(--text-muted)',
                padding: '6px 14px', borderRadius: 7,
                transition: 'color 0.15s, background 0.15s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--text)'
                e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--text-muted)'
                e.currentTarget.style.background = 'transparent'
              }}
            >
              {label}
            </a>
          ))}

          <a
            href="#final-cta"
            className="btn-primary"
            style={{
              padding: '8px 20px', fontSize: 13,
              marginLeft: 8, textDecoration: 'none',
              borderRadius: 8,
            }}
          >
            Get early access
          </a>
        </nav>

        {/* Mobile Hamburger */}
        <button
          aria-label="Toggle menu"
          aria-expanded={isOpen}
          onClick={() => setIsOpen(!isOpen)}
          style={{
            display: 'none',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: 8,
            color: 'var(--text)',
          }}
          className="nav-mobile-btn"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {isOpen ? (
              <path d="M6 6l12 12M6 18L18 6" strokeLinecap="round" strokeLinejoin="round"/>
            ) : (
              <><path d="M3 12h18M3 6h18M3 18h18" strokeLinecap="round"/></>
            )}
          </svg>
        </button>
      </header>

      {/* Mobile Menu */}
      {isOpen && (
        <div style={{
          position: 'fixed', top: 56, left: 0, right: 0, zIndex: 99,
          background: '#0a0a0a',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          padding: '12px 20px 20px',
        }} className="nav-mobile-menu">
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {navLinks.map(([label, href]) => (
              <a
                key={label}
                href={href}
                onClick={() => setIsOpen(false)}
                style={{
                  fontSize: 14, fontWeight: 500,
                  color: 'var(--text-muted)',
                  padding: '10px 12px', borderRadius: 7,
                  textDecoration: 'none',
                }}
              >
                {label}
              </a>
            ))}
            <a
              href="#final-cta"
              onClick={() => setIsOpen(false)}
              className="btn-primary"
              style={{
                padding: '10px 16px', fontSize: 14,
                marginTop: 8, textDecoration: 'none',
                borderRadius: 8, textAlign: 'center',
              }}
            >
              Get early access
            </a>
          </nav>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .nav-desktop { display: none !important; }
          .nav-mobile-btn { display: block !important; }
        }
        @media (min-width: 769px) {
          .nav-mobile-menu { display: none !important; }
        }
      `}</style>
    </>
  )
}
