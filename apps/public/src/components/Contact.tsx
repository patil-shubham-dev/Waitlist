export default function Contact() {
  return (
    <section className="section-border" style={{ padding: '64px clamp(20px, 5vw, 40px)', textAlign: 'center' }}>
      <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 10 }}>
        Questions or feedback?
      </p>
      <a
        href="mailto:lifeossocial01@gmail.com"
        style={{
          fontSize: 15, color: '#60a5fa',
          textDecorationLine: 'underline',
          textUnderlineOffset: '4px',
          textDecorationColor: 'rgba(96,165,250,0.3)',
          transition: 'color 0.15s, text-decoration-color 0.15s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = '#93c5fd'
          e.currentTarget.style.textDecorationColor = 'rgba(147,197,253,0.5)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = '#60a5fa'
          e.currentTarget.style.textDecorationColor = 'rgba(96,165,250,0.3)'
        }}
      >
        lifeossocial01@gmail.com
      </a>
    </section>
  )
}
