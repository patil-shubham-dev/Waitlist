export default function Footer() {
  return (
    <footer style={{
      padding: '20px clamp(20px, 5vw, 40px)',
      borderTop: '1px solid var(--border)',
      display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', flexWrap: 'wrap', gap: 10,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <img src="/assets/logo-mark.svg" alt="LifeOS" style={{ height: 18, opacity: 0.4 }} />
        <span style={{ fontSize: 13, color: 'var(--text-faint)' }}>LifeOS</span>
      </div>
      <p style={{ fontSize: 12, color: 'var(--text-faint)' }}>
        © {new Date().getFullYear()} LifeOS. All rights reserved.
      </p>
    </footer>
  )
}
