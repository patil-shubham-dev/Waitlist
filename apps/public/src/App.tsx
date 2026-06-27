import { useEffect, useRef, useState } from 'react';
import { supabase, type Suggestion, type TimelineEntry } from './lib/supabase';
import { useVisitTracker } from './hooks/useVisitTracker';

const VISITOR_KEY = 'lifeos_v4';

function readVisitor(): { name: string; email: string; role?: string } | null {
  try {
    const fromLocal = localStorage.getItem(VISITOR_KEY);
    if (fromLocal) return JSON.parse(fromLocal);
    const cookie = document.cookie
      .split('; ')
      .find((c) => c.startsWith(`${VISITOR_KEY}=`))
      ?.split('=')[1];
    if (cookie) return JSON.parse(decodeURIComponent(cookie));
  } catch { /* ignore */ }
  return null;
}

function writeVisitor(v: { name: string; email: string; role?: string }) {
  localStorage.setItem(VISITOR_KEY, JSON.stringify(v));
  document.cookie = `${VISITOR_KEY}=${encodeURIComponent(JSON.stringify(v))}; path=/; max-age=${60 * 60 * 24 * 180}; samesite=lax`;
}

function goto(id: string) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function formatRelativeDate(date: string) {
  const delta = Date.now() - new Date(date).getTime();
  const mins = Math.floor(delta / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function getAvatarColor(name: string) {
  const colors = ['#e8620a', '#166534', '#6d28d9', '#0369a1', '#b91c1c', '#a16207', '#0f766e', '#be185d'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

const NAV_ITEMS = ['problem', 'what', 'features', 'questions', 'roadmap'] as const;

function App() {
  useVisitTracker();

  const [waitlistCount, setWaitlistCount] = useState(0);
  const [roadmap, setRoadmap] = useState<TimelineEntry[]>([]);
  const [activeSection, setActiveSection] = useState('problem');
  const [toasts, setToasts] = useState<{ id: number; message: string }[]>([]);

  const [joinForm, setJoinForm] = useState({ name: '', email: '', role: 'student' });
  const [joinState, setJoinState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [joinError, setJoinError] = useState('');
  const [visitor, setVisitor] = useState(readVisitor());
  const [questions, setQuestions] = useState<Suggestion[]>([]);
  const [questionForm, setQuestionForm] = useState({ title: '', content: '' });
  const [questionState, setQuestionState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [qError, setQError] = useState('');
  const qScrollRef = useRef<HTMLDivElement>(null);

  const addToast = (msg: string) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message: msg }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4200);
  };

  useEffect(() => {
    const load = async () => {
      const [{ count }, rRes, qRes] = await Promise.all([
        supabase.from('waitlist').select('*', { count: 'exact', head: true }),
        supabase.from('timeline_entries').select('*').order('sort_order', { ascending: true }),
        supabase.from('suggestions').select('*').eq('is_public', true).order('is_featured', { ascending: false }).order('created_at', { ascending: true }).limit(50),
      ]);
      if (count != null) setWaitlistCount(count);
      if (rRes.data) setRoadmap(rRes.data as TimelineEntry[]);
      if (qRes.data) setQuestions(qRes.data as Suggestion[]);
    };
    load();

    const sub = supabase
      .channel('public-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'timeline_entries' }, () => load())
      .subscribe();

    return () => { supabase.removeChannel(sub); };
  }, []);

  useEffect(() => {
    if (qScrollRef.current) {
      qScrollRef.current.scrollTo({ top: qScrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [questions.length]);

  useEffect(() => {
    const nodes = document.querySelectorAll<HTMLElement>('.rv');
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
        });
      },
      { threshold: 0.11 },
    );
    nodes.forEach((el) => io.observe(el));
    return () => io.disconnect();
  });

  useEffect(() => {
    const sio = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActiveSection(e.target.id);
        });
      },
      { rootMargin: '-35% 0px -45% 0px', threshold: 0.15 },
    );
    NAV_ITEMS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) sio.observe(el);
    });
    return () => sio.disconnect();
  }, []);

  const handleJoin = async () => {
    const email = joinForm.email.trim().toLowerCase();
    const name = joinForm.name.trim() || email.split('@')[0];
    if (!email) return;
    setJoinState('loading');
    setJoinError('');

    const { error } = await supabase.from('waitlist').insert({
      name,
      email,
      role: joinForm.role,
    });

    if (error && error.code !== '23505') {
      setJoinState('error');
      setJoinError('Something went wrong. Try again.');
      return;
    }

    const v = { name, email, role: joinForm.role };
    writeVisitor(v);
    setVisitor(v);
    setJoinState('success');
    addToast("You're on the list! We'll be in touch.");
    setWaitlistCount((c) => c + 1);
  };

  const handleQuestionSubmit = async () => {
    if (!visitor) { goto('waitlist'); return; }
    const content = questionForm.content.trim();
    if (!content) return;
    setQuestionState('loading');
    setQError('');

    const { data, error } = await supabase.from('suggestions').insert({
      name: visitor.name,
      email: visitor.email.toLowerCase(),
      title: questionForm.title.trim() || null,
      content,
      type: 'question',
      status: 'open',
      is_public: true,
    }).select('*').single();

    if (error || !data) {
      setQuestionState('error');
      setQError('Failed to post. Try again.');
      return;
    }

    setQuestionState('success');
    setQuestions((prev) => [...prev, data as Suggestion]);
    setQuestionForm({ title: '', content: '' });
    addToast('Your question has been posted.');
    setTimeout(() => setQuestionState('idle'), 4000);
  };

  const statusCfg: Record<string, { spCls: string; label: string; cardCls: string; icon: string; iconColor: string; textColor: string; descColor: string; itemColor: string }> = {
    past: { spCls: 'done', label: 'Completed', cardCls: 'done', icon: '✓', iconColor: '#4ade80', textColor: 'rgba(255,255,255,.85)', descColor: 'rgba(255,255,255,.38)', itemColor: 'rgba(255,255,255,.45)' },
    present: { spCls: 'now', label: 'In Progress', cardCls: 'now', icon: '→', iconColor: 'var(--orange)', textColor: 'var(--orange)', descColor: 'rgba(255,255,255,.45)', itemColor: 'rgba(255,255,255,.55)' },
    future: { spCls: 'next', label: 'Planned', cardCls: 'future', icon: '○', iconColor: 'rgba(255,255,255,.25)', textColor: 'rgba(255,255,255,.70)', descColor: 'rgba(255,255,255,.30)', itemColor: 'rgba(255,255,255,.30)' },
  };

  return (
    <>
      <header className="nav-bar">
        <nav className="nav-inner wrap">
          <div className="nav-brand">
            <div className="nav-logomark" aria-hidden="true">
              <img src="/assets/logo-mark.jpg" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 9 }} />
            </div>
            <span className="nav-wordmark">LifeOS</span>
          </div>
          <div className="nav-links">
            {NAV_ITEMS.map((id) => (
              <button key={id} className={`nl ${activeSection === id ? 'on' : ''}`} onClick={() => goto(id)}>
                {id === 'problem' ? 'Problem' : id === 'what' ? 'What is it' : id === 'features' ? 'Features' : id === 'questions' ? 'Q&A' : 'Roadmap'}
              </button>
            ))}
          </div>
          <button className="nav-join" onClick={() => goto('waitlist')}>Join Waitlist</button>
        </nav>
      </header>

      <div className="toasts" id="toasts">
        {toasts.map((t) => (
          <div key={t.id} className="toast">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            <span>{t.message}</span>
          </div>
        ))}
      </div>

      <main className="page">
        {/* ═══ HERO ═══ */}
        <section className="hero" id="hero">
          <div className="tx-dots" style={{ opacity: 0.45, WebkitMaskImage: 'radial-gradient(ellipse 70% 60% at 30% 50%,black,transparent)', maskImage: 'radial-gradient(ellipse 70% 60% at 30% 50%,black,transparent)' }} />
          <div className="hero-bg-letter" aria-hidden="true">L</div>
          <svg style={{ position: 'absolute', right: '4%', top: '12%', width: 260, height: 260, opacity: 0.05, pointerEvents: 'none' }} viewBox="0 0 260 260" fill="none" aria-hidden="true">
            <circle cx="130" cy="130" r="120" stroke="#e8620a" strokeWidth="1" strokeDasharray="8 7" />
            <circle cx="130" cy="130" r="80" stroke="#e8620a" strokeWidth="0.7" strokeDasharray="4 9" />
            <circle cx="130" cy="10" r="6" fill="#e8620a" />
            <circle cx="250" cy="130" r="4" fill="#c4510a" />
          </svg>

          <div className="wrap">
            <div className="hero-inner">
              <div className="rv">
                <h1 className="t-display" style={{ marginBottom: 22 }}>
                  The operating system<br />for <em>your life.</em>
                </h1>
                <p className="t-body" style={{ maxWidth: 440, marginBottom: 36 }}>
                  From scattered goals to consistent execution. LifeOS helps you act, prove your work, earn growth, and return stronger — every single day.
                </p>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 44 }}>
                  <button className="btn btn-fill" onClick={() => goto('waitlist')}>
                    Get Early Access
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </button>
                  <button className="btn btn-line" onClick={() => goto('what')}>See how it works</button>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex' }}>
                    {['A', 'P', 'K', 'S'].map((letter, i) => (
                      <span key={letter} style={{
                        width: 29, height: 29, borderRadius: '50%',
                        background: ['#e8620a', '#166534', '#6d28d9', '#0369a1'][i],
                        border: '2px solid var(--paper)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 11, fontWeight: 600, color: '#fff',
                        marginRight: i < 3 ? -9 : 0, flexShrink: 0,
                        fontFamily: 'var(--sans)',
                      }}>{letter}</span>
                    ))}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }} id="hero-count">
                      {waitlistCount.toLocaleString()} people waiting
                    </div>
                    <div className="mono" style={{ color: 'var(--faint)' }}>Early access · Limited spots</div>
                  </div>
                </div>
              </div>

              <div className="hero-stat-block rv d2">
                <div className="stat-card">
                  <div className="stat-card-header">
                    <span className="stat-card-title">Your daily execution board</span>
                    <span className="stat-live"><span className="stat-live-dot" />Live</span>
                  </div>
                  <div className="stat-nums">
                    <div className="stat-num-cell">
                      <div className="stat-big accent">14</div>
                      <div className="stat-key">Day streak 🔥</div>
                    </div>
                    <div className="stat-num-cell">
                      <div className="stat-big">2,840</div>
                      <div className="stat-key">Growth Points</div>
                    </div>
                    <div className="stat-num-cell">
                      <div className="stat-big">94%</div>
                      <div className="stat-key">Consistency</div>
                    </div>
                  </div>
                  <div className="stat-progress">
                    <div className="stat-progress-label">
                      <span className="mono" style={{ color: 'var(--muted)' }}>Daily XP</span>
                      <span className="mono" style={{ color: 'var(--ink)' }}>620 / 1000</span>
                    </div>
                    <div className="stat-progress-track">
                      <div className="stat-progress-fill" />
                    </div>
                  </div>
                  <div className="stat-tasks">
                    {[
                      { label: 'Morning workout — 45 min', done: true, tag: 'verified', green: true },
                      { label: 'Read 30 pages', done: true, tag: 'verified', green: true },
                      { label: 'Deep work session — 2h', done: false, tag: 'due today', green: false },
                    ].map((task) => (
                      <div key={task.label} className="stat-task-row">
                        <div className={`task-check ${task.done ? 'done' : 'open'}`}>
                          {task.done && (
                            <svg width="9" height="9" viewBox="0 0 10 10" fill="none" stroke="#fff" strokeWidth="2"><path d="M1.5 5l2.5 2.5L8.5 2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                          )}
                        </div>
                        <span className={`task-label ${task.done ? 'done-txt' : ''}`}>{task.label}</span>
                        <span className={`task-tag ${task.green ? 'green' : ''}`}>{task.tag}</span>
                      </div>
                    ))}
                  </div>
                  <div className="stat-proof-banner">
                    <div className="stat-proof-icon">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </div>
                    <div>
                      <div className="stat-proof-text">Proof validated by AI</div>
                      <div className="stat-proof-sub">Morning workout · +150 GP awarded</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ TRUST MARQUEE ═══ */}
        <div className="trust-strip">
          <div className="trust-track">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="trust-item">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                {['AI-validated proof', 'Real streak accountability', 'Growth Points system', 'Social proof feed', 'EXIF anti-cheat validation', 'Permanent execution record'][i % 6]}
              </div>
            ))}
          </div>
        </div>

        {/* ═══ PROBLEM ═══ */}
        <section className="section" id="problem">
          <div className="tx-cross" style={{ opacity: 0.6, WebkitMaskImage: 'radial-gradient(ellipse 85% 70% at 25% 50%,black,transparent)', maskImage: 'radial-gradient(ellipse 85% 70% at 25% 50%,black,transparent)' }} />
          <svg style={{ position: 'absolute', right: -50, top: '50%', transform: 'translateY(-50%)', width: 380, height: 380, opacity: 0.04, pointerEvents: 'none', animation: 'spin-slow 90s linear infinite' }} viewBox="0 0 380 380" fill="none" aria-hidden="true">
            <circle cx="190" cy="190" r="180" stroke="#1c1410" strokeWidth="1" />
            <circle cx="190" cy="190" r="130" stroke="#1c1410" strokeWidth="1" strokeDasharray="7 6" />
            <circle cx="190" cy="190" r="88" stroke="#e8620a" strokeWidth="1.4" />
            <circle cx="190" cy="190" r="44" stroke="#1c1410" strokeWidth="1" />
            <circle cx="190" cy="190" r="10" fill="#e8620a" />
            <line x1="190" y1="10" x2="190" y2="370" stroke="#1c1410" strokeWidth="0.5" strokeDasharray="5 6" />
            <line x1="10" y1="190" x2="370" y2="190" stroke="#1c1410" strokeWidth="0.5" strokeDasharray="5 6" />
          </svg>

          <div className="wrap" style={{ position: 'relative', zIndex: 1 }}>
            <div className="rv" style={{ marginBottom: 52 }}>
              <span className="t-label">The Problem</span>
              <h2 className="t-h2">You don't need another app.<br /><em>You need a system.</em></h2>
            </div>
            <div className="pain-grid">
              {[
                { num: '01', title: '12 apps. Zero clarity.', body: 'Notes in one place, tasks in another, goals in a journal you haven\'t opened in months. Everything is somewhere. Nothing is actionable.' },
                { num: '02', title: 'Planning feels productive. It isn\'t.', body: 'You spend Sunday color-coding categories. Monday arrives. The gap between plan and reality is exactly the same as it was.' },
                { num: '03', title: 'No proof you\'re growing.', body: 'Motivation fades because you can\'t see progress. Without a system that tracks reality — not intention — every goal quietly dies.' },
              ].map((card, i) => (
                <article key={card.num} className={`pain-card rv d${i + 1}`}>
                  <div className="pain-num">{card.num}</div>
                  <div className="pain-icon">
                    <svg width="21" height="21" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.5">
                      {i === 0 ? (
                        <>
                          <rect x="2" y="2" width="8" height="8" rx="2" /><rect x="12" y="2" width="8" height="8" rx="2" /><rect x="2" y="12" width="8" height="8" rx="2" /><rect x="12" y="12" width="8" height="8" rx="2" />
                        </>
                      ) : i === 1 ? (
                        <>
                          <circle cx="11" cy="11" r="8.5" /><path d="M11 7v4l3 3" strokeLinecap="round" />
                        </>
                      ) : (
                        <>
                          <path d="M4 17l4-5 3 3 4-6 4 4" strokeLinecap="round" strokeLinejoin="round" /><path d="M4 20h14" strokeLinecap="round" />
                        </>
                      )}
                    </svg>
                  </div>
                  <h3 className="t-h3" style={{ marginBottom: 10 }}>{card.title}</h3>
                  <p className="t-sm">{card.body}</p>
                  <div className="pain-rule" />
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ QUOTE BREAK ═══ */}
        <div className="quote-break">
          <div className="quote-mark-bg" aria-hidden="true">"</div>
          <div className="wrap rv">
            <blockquote>If one task gets completed and the user returns tomorrow, <em>the system is working.</em></blockquote>
            <p className="quote-attr">— LifeOS core principle</p>
          </div>
        </div>

        {/* ═══ WHAT ═══ */}
        <section className="section section-alt" id="what">
          <div className="tx-rules" style={{ opacity: 0.75, WebkitMaskImage: 'radial-gradient(ellipse 100% 80% at 50% 50%,black,transparent)', maskImage: 'radial-gradient(ellipse 100% 80% at 50% 50%,black,transparent)' }} />
          <div className="wrap" style={{ position: 'relative', zIndex: 1 }}>
            <div className="what-grid">
              <div className="rv">
                <span className="t-label">What is LifeOS</span>
                <h2 className="t-h2" style={{ marginBottom: 0 }}>Not another productivity tool.<br /><em>A system for your life.</em></h2>
                <div className="what-pull">
                  <p>LifeOS is a single place to set goals, execute tasks, submit proof of completion, earn recognition for your discipline, and watch your consistency compound into a permanent record of who you're becoming.</p>
                </div>
                <button className="btn btn-fill" onClick={() => goto('waitlist')}>Join the waitlist</button>
              </div>
              <div style={{ position: 'relative' }}>
                <div className="what-side-letter" aria-hidden="true">S</div>
                {[
                  { n: '01', title: 'One system, not twelve apps', body: 'Tasks, habits, goals, proof, community — all in one coherent place that works together.' },
                  { n: '02', title: 'Proof over intention', body: 'AI validates every completion. Your growth is visible, real, and fraud-resistant. No self-deception allowed.' },
                  { n: '03', title: 'Accountability built in', body: 'Streak, Growth Points, and consistency score compound automatically. You become accountable to data, not willpower.' },
                ].map((p, i) => (
                  <div key={p.n} className={`pillar rv d${i + 1}`}>
                    <div className="pillar-n">{p.n}</div>
                    <div>
                      <div className="pillar-title">{p.title}</div>
                      <p className="t-sm">{p.body}</p>
                    </div>
                  </div>
                ))}
                <div style={{ borderTop: '1px solid var(--rule)' }} />
              </div>
            </div>
          </div>
        </section>

        {/* ═══ FEATURES ═══ */}
        <section className="section" id="features">
          <div className="tx-dots" style={{ opacity: 0.35, WebkitMaskImage: 'radial-gradient(ellipse 90% 80% at 80% 50%,black,transparent)', maskImage: 'radial-gradient(ellipse 90% 80% at 80% 50%,black,transparent)' }} />
          <div className="wrap" style={{ position: 'relative', zIndex: 1 }}>
            <div className="rv" style={{ textAlign: 'center', maxWidth: 520, margin: '0 auto 52px' }}>
              <span className="t-label">Features</span>
              <h2 className="t-h2">Built for <em>real growth.</em></h2>
              <p className="t-body" style={{ marginTop: 14 }}>Every feature closes the gap between who you are and who you're trying to become.</p>
            </div>
            <div className="feat-grid">
              {[
                { hi: true, title: 'Everything in one view.', body: 'Streak, Growth Points, consistency score, active tasks — unified in a dashboard that loads in under a second.', stat: '1 screen · to see it all', label: 'Life Dashboard' },
                { hi: false, title: 'Goals become tasks become proof.', body: 'Set a goal. LifeOS breaks it into executable tasks. Complete them. Submit proof. AI validates. Points awarded.', stat: 'AI-validated · every completion', label: 'Goals Engine' },
                { hi: false, title: 'Your permanent record of discipline.', body: 'Every completed task, streak hit, and milestone is logged forever. The most honest portfolio you\'ve ever built.', stat: '∞ · history preserved', label: 'Timeline System' },
                { hi: false, title: 'Growth is more powerful witnessed.', body: 'Follow real people making real progress. Share proof posts. Join communities built around specific goals — not noise.', stat: 'Public proof · not just claims', label: 'Social Layer' },
                { hi: false, title: 'The most honest productivity app.', body: 'EXIF validation, duplicate detection, behavioral pattern analysis. You cannot fake your way to Growth Points.', stat: '0 fakes · allowed through', label: 'Anti-Cheat System' },
                { hi: false, title: 'Consistency that compounds.', body: '1 task minimum per day. 1 grace skip per 7 days. Miss it and the streak resets. Simple rules, real consequences.', stat: 'Daily · accountability', label: 'Streak Engine' },
              ].map((f, i) => (
                <article key={f.label} className={`feat-card ${f.hi ? 'hi' : ''} rv d${(i % 3) + 1}`}>
                  <div className="feat-icon" style={{
                    background: f.hi ? 'rgba(232,98,10,0.10)' : i === 1 ? 'var(--og-tint)' : i === 2 ? 'rgba(22,101,52,0.08)' : i === 3 ? 'rgba(109,40,217,0.08)' : i === 4 ? 'rgba(185,28,28,0.07)' : 'var(--og-tint)',
                    border: f.hi ? '1px solid rgba(232,98,10,0.18)' : '1px solid var(--og-rule)',
                  }}>
                    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke={f.hi ? '#e8620a' : i === 2 ? '#166534' : i === 3 ? '#6d28d9' : i === 4 ? '#b91c1c' : '#e8620a'} strokeWidth="1.8">
                      {i === 0 ? <><rect x="3" y="3" width="18" height="18" rx="3" /><path d="M3 9h18M9 21V9" strokeLinecap="round" /></>
                      : i === 1 ? <><circle cx="12" cy="12" r="9" /><path d="M12 8v4l3 3" strokeLinecap="round" /></>
                      : i === 2 ? <><path d="M4 17l4-5 3 3 4-6 4 4" strokeLinecap="round" strokeLinejoin="round" /><path d="M4 20h16" strokeLinecap="round" /></>
                      : i === 3 ? <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" strokeLinecap="round" /></>
                      : i === 4 ? <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" /></>
                      : <><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" strokeLinecap="round" strokeLinejoin="round" /></>}
                    </svg>
                  </div>
                  <span className="t-label" style={f.hi ? { color: 'var(--orange-2)' } : {}}>{f.label}</span>
                  <h3 className="t-h3" style={{ marginBottom: 9 }}>{f.title}</h3>
                  <p className="t-sm">{f.body}</p>
                  <div className="feat-stat">
                    <span className="feat-stat-val">{f.stat.split('·')[0].trim()}</span>
                    <span className="feat-stat-lab">· {f.stat.split('·')[1]?.trim()}</span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ QUESTIONS ═══ */}
        <section className="section section-alt" id="questions">
          <div className="tx-rules" style={{ opacity: 0.6, WebkitMaskImage: 'radial-gradient(ellipse 80% 70% at 50% 40%,black,transparent)', maskImage: 'radial-gradient(ellipse 80% 70% at 50% 40%,black,transparent)' }} />
          <svg className="q-illus" viewBox="0 0 200 200" fill="none" aria-hidden="true">
            <circle cx="100" cy="100" r="85" strokeWidth="0.8" strokeDasharray="6 7" />
            <circle cx="100" cy="100" r="55" strokeWidth="0.6" strokeDasharray="4 6" />
            <path d="M60 130c0-12 8-22 18-22h44c10 0 18 10 18 22v14c0 12-8 22-18 22H78c-10 0-18-10-18-22v-14z" strokeWidth="1.2" />
            <path d="M78 110c0-6 5-11 11-11h22c6 0 11 5 11 11" strokeWidth="1" />
            <circle cx="100" cy="80" r="4" fill="var(--orange)" opacity="0.3" />
            <circle cx="124" cy="86" r="2.5" fill="var(--orange)" opacity="0.2" />
            <circle cx="80" cy="120" r="2" fill="var(--orange)" opacity="0.15" />
            <path d="M52 52l12-4M148 52l12 4" strokeWidth="0.8" strokeDasharray="3 3" />
            <path d="M30 160l30 8M170 160l-30 8" strokeWidth="0.6" strokeDasharray="3 4" opacity="0.5" />
          </svg>
          <div className="wrap" style={{ position: 'relative', zIndex: 1 }}>
            <div className="rv" style={{ marginBottom: 48 }}>
              <span className="t-label">
                <span className="q-live-dot" />
                Questions & Feedback
              </span>
              <h2 className="t-h2">Ask <em>anything.</em></h2>
              <p className="t-body" style={{ marginTop: 10, maxWidth: 480 }}>Curious about a feature? Have a suggestion? Questions from the community get answered by the team — publicly.</p>
            </div>

            <div className="q-layout rv d2">
              <div className="q-box">
                <div className="q-box-scroll" ref={qScrollRef}>
                  {questions.length === 0 ? (
                    <div className="q-empty">
                      <div className="q-empty-icon">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" strokeLinecap="round" /></svg>
                      </div>
                      <p className="q-empty-text">No questions yet. Be the first to ask.</p>
                    </div>
                  ) : (
                    questions.map((q) => {
                      const initials = getInitials(q.author_name || q.name || q.email);
                      const color = getAvatarColor(q.author_name || q.name || q.email);
                      return (
                        <div key={q.id} className={`q-card${q.is_featured ? ' feat' : ''}`}>
                          <div className="q-card-meta">
                            <div className="q-av" style={{ background: color }}>{initials}</div>
                            <div>
                              <div className="q-auth">{q.author_name || q.name || 'User'}</div>
                              <div className="q-time">{formatRelativeDate(q.created_at)}</div>
                            </div>
                            {q.is_featured && <span className="q-badge">Featured</span>}
                          </div>
                          {q.title && <div className="q-card-title">{q.title}</div>}
                          <p className="q-card-body">{q.content}</p>
                          {q.admin_response && (
                            <div className="q-reply">
                              <div className="q-reply-hd">
                                <span className="q-reply-badge">Official</span>
                                <span className="q-reply-name">{q.admin_name || 'LifeOS Team'}</span>
                              </div>
                              <p className="q-reply-text">{q.admin_response}</p>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
                {questions.length > 3 && <div className="q-box-footer" />}
              </div>

              <div className="q-panel">
                {questionState === 'success' ? (
                  <div className="q-success">
                    <div className="q-succ-ring">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </div>
                    <div className="q-succ-title">Posted!</div>
                    <p className="q-succ-text">Your question is now on the wall. The team will respond publicly.</p>
                    <button className="btn btn-line" onClick={() => setQuestionState('idle')}>Ask another</button>
                  </div>
                ) : visitor ? (
                  <>
                    <div className="q-panel-title">Ask a question</div>
                    <div className="q-panel-sub">Clear questions get better answers from the team.</div>
                    <div className="q-field">
                      <label className="q-lbl">Your question</label>
                      <textarea className="q-ta" placeholder="e.g. When will the beta open? How does AI validation work?" rows={4} value={questionForm.content} onChange={(e) => setQuestionForm((p) => ({ ...p, content: e.target.value.substring(0, 300) }))} />
                      <div className="q-count">{questionForm.content.length}/300</div>
                    </div>
                    {questionState === 'error' && <p className="q-err">{qError}</p>}
                    <button className={`q-submit${questionState === 'loading' ? ' is-loading' : ''}`} disabled={questionState === 'loading' || !questionForm.content.trim()} onClick={handleQuestionSubmit}>
                      {questionState === 'loading' ? 'Posting…' : 'Post question'}
                    </button>
                  </>
                ) : (
                  <div className="q-locked">
                    <div className="q-locked-icon">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" strokeLinecap="round" strokeLinejoin="round" /><path d="M8 10h.01M12 10h.01M16 10h.01" strokeLinecap="round" /></svg>
                    </div>
                    <div className="q-locked-title">Join the conversation</div>
                    <p className="q-locked-text">Sign up for early access to ask questions, share feedback, and follow the product journey.</p>
                    <button className="q-locked-btn" onClick={() => goto('waitlist')}>Get early access</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ═══ ROADMAP ═══ */}
        <section className="section section-dark" id="roadmap" style={{ paddingBottom: 80 }}>
          <svg className="tx-dark" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} aria-hidden="true">
            <defs><pattern id="dg" width="48" height="48" patternUnits="userSpaceOnUse"><path d="M48 0H0v48" fill="none" stroke="white" strokeWidth="0.4" /></pattern></defs>
            <rect width="100%" height="100%" fill="url(#dg)" />
          </svg>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 75% 85% at 50% 50%,transparent 25%,var(--dark) 100%)', pointerEvents: 'none' }} />

          <div className="wrap" style={{ position: 'relative', zIndex: 2 }}>
            <div className="rv" style={{ textAlign: 'center', marginBottom: 52 }}>
              <span className="t-label" style={{ color: 'rgba(232,98,10,.70)' }}>Roadmap</span>
              <h2 className="t-h2" style={{ color: 'var(--white)' }}>Built <em style={{ color: 'rgba(232,98,10,.82)' }}>in the open.</em></h2>
              <p className="t-body" style={{ color: 'rgba(255,255,255,.42)', marginTop: 12, maxWidth: 480, marginLeft: 'auto', marginRight: 'auto' }}>Four phases, each one shipping real features. Watch it progress.</p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 22, marginTop: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}><div style={{ width: 7, height: 7, borderRadius: '50%', background: '#4ade80' }} /><span className="mono" style={{ color: 'rgba(255,255,255,.38)' }}>Completed</span></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}><div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--orange)' }} className="blink-dot" /><span className="mono" style={{ color: 'rgba(255,255,255,.38)' }}>In Progress</span></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}><div style={{ width: 7, height: 7, borderRadius: '50%', background: 'rgba(255,255,255,.22)' }} /><span className="mono" style={{ color: 'rgba(255,255,255,.38)' }}>Planned</span></div>
              </div>
            </div>

            <div className="roadmap-grid rv" id="roadmap-grid">
              {roadmap.length === 0
                ? Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="rm-card future">
                      <div className="sp next"><span className="sp-d" />Loading...</div>
                      <div className="rm-title" style={{ color: 'rgba(255,255,255,.70)' }}>—</div>
                    </div>
                  ))
                : roadmap.map((e) => {
                    const c = statusCfg[e.status] || statusCfg.future;
                    return (
                      <div key={e.id} className={`rm-card ${c.cardCls}`}>
                        <div className={`sp ${c.spCls}`}>
                          <span className={`sp-d${e.status === 'present' ? ' pulse' : ''}`} />
                          {c.label}
                        </div>
                        <div className="rm-title" style={{ color: c.textColor }}>{e.title}</div>
                        {e.description && <div className="rm-desc" style={{ color: c.descColor }}>{e.description}</div>}
                        {(e.items || []).map((it: string) => (
                          <div key={it} className="rm-item">
                            <span className="rm-item-icon" style={{ color: c.iconColor }}>{c.icon}</span>
                            <span className="rm-item-text" style={{ color: c.itemColor }}>{it}</span>
                          </div>
                        ))}
                      </div>
                    );
                  })}
            </div>
          </div>
        </section>

        {/* ═══ WAITLIST ═══ */}
        <section className="section section-dark" id="waitlist" style={{ padding: '96px 0' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 55% 70% at 15% 55%,rgba(232,98,10,.09),transparent 65%)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 40% 50% at 85% 30%,rgba(232,98,10,.05),transparent 65%)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', right: -20, bottom: -50, fontFamily: 'var(--serif)', fontSize: 360, fontWeight: 700, color: 'rgba(255,255,255,.018)', lineHeight: 1, pointerEvents: 'none', userSelect: 'none' }} aria-hidden="true">W</div>

          <div className="wrap" style={{ position: 'relative', zIndex: 2 }}>
            <div className="wl-wrap">
              <div className="rv">
                <span className="t-label" style={{ color: 'rgba(232,98,10,.70)' }}>Waitlist · Limited access</span>
                <h2 className="wl-title" id="wl-title">
                  {visitor ? <>You're <em>on the list.</em></> : <>Join before the<br /><em>public launch.</em></>}
                </h2>
                <p className="wl-body">
                  {visitor
                    ? "Your spot in the LifeOS ecosystem is reserved. We'll reach out with early access when it's ready."
                    : 'Early users help shape the execution system, the proof loop, and the social layer before LifeOS opens publicly. You\'ll get founding member status.'}
                </p>
                <p className="wl-note">No spam. Only product updates.</p>
                <div className="wl-perks">
                  <div className="wl-perk">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    Founding member status + legacy XP bonus
                  </div>
                  <div className="wl-perk">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    Direct access to the team for feedback
                  </div>
                  <div className="wl-perk">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    Priority invite when access opens
                  </div>
                </div>
              </div>
              <div className="rv d2">
                <div className="wl-card" id="wl-form-wrap">
                  {visitor ? (
                    <>
                      <div className="succ-ring">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6ee7b7" strokeWidth="2.5"><path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      </div>
                      <div className="succ-title">Welcome aboard</div>
                      <p className="succ-body">We'll reach out to <strong style={{ color: '#fff' }}>{visitor.email}</strong> with early access when it's ready.</p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                        <div className="succ-line"><div className="succ-dot" /><span>You're on the early access list</span></div>
                        <div className="succ-line"><div className="succ-dot" /><span>Founding member status reserved</span></div>
                        <div className="succ-line"><div className="succ-dot" /><span>Priority invite when access opens</span></div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="wl-card-title">Reserve your spot</div>
                      <div className="wl-card-sub">Join builders who want results, not reminders.</div>
                      <div className="wf">
                        <label className="wl">Name</label>
                        <input
                          className="wi"
                          placeholder="Your name"
                          autoComplete="name"
                          value={joinForm.name}
                          onChange={(e) => setJoinForm((p) => ({ ...p, name: e.target.value }))}
                        />
                      </div>
                      <div className="wf">
                        <label className="wl">Email</label>
                        <input
                          type="email"
                          className="wi"
                          placeholder="you@example.com"
                          autoComplete="email"
                          required
                          value={joinForm.email}
                          onChange={(e) => setJoinForm((p) => ({ ...p, email: e.target.value }))}
                        />
                      </div>

                      <button
                        className="wl-submit"
                        id="wl-btn"
                        disabled={joinState === 'loading'}
                        onClick={handleJoin}
                      >
                        {joinState === 'loading' ? 'Joining…' : 'Join the Waitlist'}
                      </button>
                      {joinState === 'error' && (
                        <p className="wl-err" style={{ display: 'block' }}>{joinError || 'Something went wrong. Try again.'}</p>
                      )}
                      <p className="mono" style={{ color: 'rgba(255,255,255,.20)', textAlign: 'center', marginTop: 12 }}>No spam · Unsubscribe anytime</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ FOOTER ═══ */}
        <footer className="footer">
          <div className="wrap footer-inner">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div className="nav-logomark">
                  <img src="/assets/logo-mark.jpg" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 9 }} />
                </div>
                <span className="footer-name">LifeOS</span>
              </div>
              <p className="footer-desc">Built for people who take action, prove progress, and return stronger.</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 12 }}>
              <div className="footer-icons">
                <a href="https://instagram.com/lifeossocial" target="_blank" rel="noreferrer" className="fi" title="Instagram" aria-label="Instagram">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg>
                </a>
                <a href="https://www.facebook.com/share/18KES85u5V/" target="_blank" rel="noreferrer" className="fi" title="Facebook" aria-label="Facebook">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>
                </a>
                <a href="mailto:lifeossocial01@gmail.com" className="fi" title="Email" aria-label="Email us">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
                </a>
              </div>
              <div className="mono" style={{ color: 'var(--faint)' }}>lifeossocial01@gmail.com</div>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}

export default App;
