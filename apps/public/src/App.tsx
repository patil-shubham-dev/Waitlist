import { useEffect } from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Problem from './components/Problem'
import What from './components/What'
import Features from './components/Features'
import Timeline from './components/Timeline'
import FinalCTA from './components/FinalCTA'
import Contact from './components/Contact'
import Footer from './components/Footer'
import { useVisitTracker } from './hooks/useVisitTracker'

export default function App() {
  useVisitTracker()

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) e.target.classList.add('visible')
      }),
      { threshold: 0.07, rootMargin: '0px 0px -32px 0px' }
    )
    const attach = () =>
      document.querySelectorAll('.reveal').forEach((el) => observer.observe(el))
    attach()
    const t = setTimeout(attach, 400)
    return () => { observer.disconnect(); clearTimeout(t) }
  }, [])

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
      <Navbar />
      <main>
        <Hero />
        <Problem />
        <What />
        <Features />
        <Timeline />
        <FinalCTA />
        <Contact />
      </main>
      <Footer />
    </div>
  )
}
