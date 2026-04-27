import { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Facebook,
  Flame,
  Instagram,
  Mail,
  Menu,
  Heart,
  MessageCircle,
  MessageSquareText,
  ShieldCheck,
  Sparkles,
  Target,
  Trophy,
  X,
} from 'lucide-react';
import { supabase, type Suggestion } from './lib/supabase';
import { useVisitTracker } from './hooks/useVisitTracker';

const NAV_ITEMS = [
  { id: 'why', label: 'Why LifeOS' },
  { id: 'loop', label: 'Core Loop' },
  { id: 'roadmap', label: 'Roadmap' },
  { id: 'questions', label: 'Questions' },
];

const PRODUCT_COPY = {
  navCta: 'Join the waitlist',
  heroBadge: 'Execution-driven social productivity',
  heroTitle: 'LifeOS turns action into visible progress.',
  heroBody:
    'Plan less. Execute more. LifeOS helps users act, prove their work, earn growth, and return the next day with momentum.',
  heroPrimary: 'Get early access',
  heroSecondary: 'Read the system',
  problemTitle: 'Why LifeOS exists',
  problemBody:
    'Most productivity apps help you plan without pressure. Most social platforms keep you busy without progress. LifeOS connects execution, proof, and social accountability in one system.',
  loopTitle: 'The LifeOS core loop',
  loopBody:
    'Action becomes visible, proof is validated, and progress compounds through streaks, XP, and public momentum.',
  roadmapTitle: 'Roadmap built from the product system',
  roadmapBody:
    'The rollout follows the actual PRD: task execution first, validation and integrity next, then the full social layer around proof and growth.',
  questionsTitle: 'Questions and product feedback',
  questionsBody:
    'Users can ask practical product questions or suggest improvements. Every reply stays visible so the launch page becomes a shared source of product clarity.',
  ctaTitle: 'Join before the public launch',
  ctaBody:
    'Early users help shape the execution system, the proof loop, and the social layer before LifeOS opens publicly.',
  ctaTrust: 'No spam. Only product updates.',
  footer: 'Built for people who take action, prove progress, and return stronger.',
};

const PROBLEM_CARDS = [
  {
    icon: Target,
    label: 'Execution',
    title: 'Action-first system',
    body: 'LifeOS is built around tasks getting done, not lists getting longer.',
  },
  {
    icon: ShieldCheck,
    label: 'Proof',
    title: 'Proof-based progress',
    body: 'Work must be visible and verifiable before it becomes growth.',
  },
  {
    icon: Trophy,
    label: 'Social',
    title: 'Social accountability',
    body: 'Consistency is reinforced through community, streaks, and public progress.',
  },
];

const LOOP_CARDS = [
  {
    step: '01',
    title: 'Consume',
    body: 'See progress-driven content, not distraction.',
  },
  {
    step: '02',
    title: 'Act',
    body: 'Start meaningful tasks with structure and intent.',
  },
  {
    step: '03',
    title: 'Prove',
    body: 'Upload proof so AI can validate the effort.',
  },
  {
    step: '04',
    title: 'Earn',
    body: 'Gain XP, streaks, and visible progress that compounds.',
  },
];

const ROADMAP_CARDS = [
  {
    status: 'Past',
    title: 'Foundation',
    body: 'Core infrastructure, waitlist flow, and the first task-driven product direction.',
    points: ['Task system', 'Realtime data layer', 'Launch-ready web stack'],
  },
  {
    status: 'Past',
    title: 'Security and integrity',
    body: 'Validation rules, anti-cheat thinking, and system safety before scale.',
    points: ['Proof review model', 'Integrity controls', 'Safer admin operations'],
  },
  {
    status: 'Present',
    title: 'AI proof system',
    body: 'The current focus: make completed work visible, reviewable, and trusted.',
    points: ['Proof submission', 'Confidence checks', 'Verified progress'],
  },
  {
    status: 'Future',
    title: 'Gamification and social layer',
    body: 'Expand into streaks, XP, community pressure, and the public beta network.',
    points: ['XP and streak engine', 'Communities and sharing', 'Public beta launch'],
  },
];

const VISITOR_COOKIE = 'lifeos_visitor';

function sectionScroll(id: string) {
  if (id === 'top') {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }
  
  const target = document.getElementById(id);
  if (target) {
    target.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  }
}

function writeVisitorCookie(value: { name: string; email: string; role?: string }) {
  const encoded = encodeURIComponent(JSON.stringify(value));
  document.cookie = `${VISITOR_COOKIE}=${encoded}; path=/; max-age=${60 * 60 * 24 * 180}; samesite=lax`;
  localStorage.setItem(VISITOR_COOKIE, JSON.stringify(value));
}

function readVisitorCookie() {
  const cookieValue = document.cookie
    .split('; ')
    .find((item) => item.startsWith(`${VISITOR_COOKIE}=`))
    ?.split('=')[1];

  if (cookieValue) {
    try {
      return JSON.parse(decodeURIComponent(cookieValue)) as { name: string; email: string; role?: string };
    } catch {
      return null;
    }
  }

  const localValue = localStorage.getItem(VISITOR_COOKIE);
  if (!localValue) return null;

  try {
    return JSON.parse(localValue) as { name: string; email: string; role?: string };
  } catch {
    return null;
  }
}

function formatRelativeDate(date: string) {
  const delta = Date.now() - new Date(date).getTime();
  const minutes = Math.max(1, Math.floor(delta / 60000));
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function Navbar({
  activeSection,
  ctaLabel,
  compact,
}: {
  activeSection: string;
  ctaLabel: string;
  compact: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <header className={`navbar-shell ${compact ? 'compact' : ''}`}>
      <nav className="navbar">
        <a
          className="brand-lockup"
          href="#top"
          onClick={(event) => {
            event.preventDefault();
            sectionScroll('top');
          }}
        >
          <img className="brand-mark" src="/assets/logo-mark.jpg" alt="LifeOS" />
          <img className="brand-wordmark" src="/assets/logo-wordmark.svg" alt="LifeOS" />
        </a>

        <div className="nav-center">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              className={`nav-link ${activeSection === item.id ? 'active' : ''}`}
              onClick={() => sectionScroll(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="nav-actions">
          <button className="button button-primary button-small" onClick={() => sectionScroll('waitlist')}>
            {ctaLabel}
          </button>
          <button className={`menu-button ${open ? 'active' : ''}`} aria-label="Toggle navigation" onClick={() => setOpen((current) => !current)}>
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      <div className={`mobile-backdrop ${open ? 'show' : ''}`} onClick={() => setOpen(false)} />

      <aside className={`mobile-menu ${open ? 'open' : ''}`}>
        <div className="mobile-menu-header">
           <img className="brand-mark" src="/assets/logo-mark.jpg" alt="LifeOS" />
           <button className="close-button" onClick={() => setOpen(false)}>
             <X size={24} />
           </button>
        </div>

        <div className="mobile-menu-links">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              className="mobile-menu-link"
              onClick={() => {
                setOpen(false);
                sectionScroll(item.id);
              }}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="mobile-menu-footer">
          <button
            className="button button-primary button-full"
            onClick={() => {
              setOpen(false);
              sectionScroll('waitlist');
            }}
          >
            {ctaLabel}
          </button>
        </div>
      </aside>
    </header>
  );
}

function App() {
  useVisitTracker();

  const [waitlistCount, setWaitlistCount] = useState(0);
  const [questions, setQuestions] = useState<Suggestion[]>([]);
  const [isRoleOpen, setIsRoleOpen] = useState(false);

  const ROLES = [
    { value: 'student', label: 'Student' },
    { value: 'founder', label: 'Founder' },
    { value: 'creator', label: 'Creator' },
    { value: 'operator', label: 'Operator' },
    { value: 'professional', label: 'Professional' },
    { value: 'other', label: 'Other' },
  ];
  
  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a');
      
      if (anchor && anchor.hash && anchor.origin === window.location.origin) {
        const id = anchor.hash.replace('#', '');
        if (id) {
          e.preventDefault();
          sectionScroll(id);
        }
      }
    };

    document.addEventListener('click', handleAnchorClick);
    return () => document.removeEventListener('click', handleAnchorClick);
  }, []);

  const [activeSection, setActiveSection] = useState('problem');
  const [navCompact, setNavCompact] = useState(false);

  const [joinForm, setJoinForm] = useState({
    name: '',
    email: '',
    role: 'student',
  });
  const [joinState, setJoinState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [registeredVisitor, setRegisteredVisitor] = useState<{ name: string; email: string; role?: string } | null>(null);

  const [questionForm, setQuestionForm] = useState({
    title: '',
    content: '',
  });
  const [questionState, setQuestionState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  useEffect(() => {
    setRegisteredVisitor(readVisitorCookie());
  }, []);

  useEffect(() => {
    const load = async () => {
      const [{ count }, questionsRes] = await Promise.all([
        supabase.from('waitlist').select('*', { count: 'exact', head: true }),
        supabase
          .from('suggestions')
          .select('*')
          .eq('is_public', true)
          .order('is_featured', { ascending: false })
          .order('created_at', { ascending: false })
          .limit(6),
      ]);

      setWaitlistCount(count ?? 0);
      setQuestions((questionsRes.data ?? []) as Suggestion[]);
    };

    load();
  }, []);

  useEffect(() => {
    const onScroll = () => setNavCompact(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll<HTMLElement>('section[data-section]'));
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection((entry.target as HTMLElement).dataset.section ?? 'problem');
          }
        });
      },
      { rootMargin: '-35% 0px -45% 0px', threshold: 0.18 },
    );

    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [questions.length]);

  const featuredQuestion = useMemo(
    () => questions.find((item) => item.is_featured) ?? questions[0],
    [questions],
  );

  const handleJoin = async (event: React.FormEvent) => {
    event.preventDefault();
    setJoinState('loading');

    const payload = {
      name: joinForm.name.trim() || joinForm.email.split('@')[0],
      email: joinForm.email.trim().toLowerCase(),
      role: joinForm.role,
      interest_level: 'high',
    };

    const { error } = await supabase.from('waitlist').insert(payload);

    if (error) {
      setJoinState('error');
      return;
    }

    setJoinState('success');
    setWaitlistCount((current) => current + 1);
    const visitor = { name: payload.name, email: payload.email, role: payload.role };
    writeVisitorCookie(visitor);
    setRegisteredVisitor(visitor);
    setJoinForm({ name: '', email: '', role: 'student' });
  };

  const handleQuestionSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!registeredVisitor) {
      setQuestionState('error');
      sectionScroll('waitlist');
      return;
    }

    setQuestionState('loading');

    const payload = {
      name: registeredVisitor.name.trim() || null,
      email: registeredVisitor.email.trim().toLowerCase(),
      title: questionForm.title.trim() || null,
      content: questionForm.content.trim(),
      type: 'question',
      status: 'open',
      author_avatar_url: '/assets/default-avatar.svg',
      is_public: true,
    };

    const { data, error } = await supabase.from('suggestions').insert(payload).select('*').single();

    if (error || !data) {
      setQuestionState('error');
      return;
    }

    setQuestionState('success');
    setQuestions((current) => [data as Suggestion, ...current].slice(0, 6));
    setQuestionForm({ title: '', content: '' });
  };

  return (
    <div className="page-shell" id="top">
      <Navbar activeSection={activeSection} ctaLabel={PRODUCT_COPY.navCta} compact={navCompact} />

      <main className="page-main">
        <section className="hero-section">
          <div className="hero-layout">
            <div className="hero-copy">
              <span className="eyebrow">
                <Sparkles size={14} />
                {PRODUCT_COPY.heroBadge}
              </span>
              <h1 className="hero-title">
                LifeOS turns action into visible progress.
              </h1>
              <p className="hero-subtext">{PRODUCT_COPY.heroBody}</p>
              <div className="hero-actions">
                <button className="button button-primary" onClick={() => sectionScroll('waitlist')}>
                  {PRODUCT_COPY.heroPrimary}
                  <ChevronRight size={16} />
                </button>
                <button className="button button-secondary" onClick={() => sectionScroll('loop')}>
                  {PRODUCT_COPY.heroSecondary}
                </button>
              </div>
            </div>

            <aside className="hero-system-card">
              <div className="system-label">Core truth</div>
              <h2>If one task gets completed and the user returns tomorrow, the system is working.</h2>
              <div className="system-list">
                <div className="system-row">
                  <CheckCircle2 size={16} />
                  <span>{waitlistCount.toLocaleString()} people waiting for launch access</span>
                </div>
                <div className="system-row">
                  <Flame size={16} />
                  <span>Proof, streaks, and XP are tied to visible action</span>
                </div>
                <div className="system-row">
                  <MessageSquareText size={16} />
                  <span>Public feedback stays attached to the product story</span>
                </div>
              </div>
            </aside>
          </div>
        </section>

        <section id="why" data-section="why" className="page-section">
          <div className="section-header">
            <span className="section-label">Problem</span>
            <h2>{PRODUCT_COPY.problemTitle}</h2>
            <p>{PRODUCT_COPY.problemBody}</p>
          </div>
          <div className="card-grid card-grid-3">
            {PROBLEM_CARDS.map(({ icon: Icon, label, title, body }) => (
              <article className="product-card" key={title}>
                <div className="card-topline">
                  <div className="icon-chip"><Icon size={16} /></div>
                  <span>{label}</span>
                </div>
                <h3>{title}</h3>
                <p>{body}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="loop" data-section="loop" className="page-section section-alt">
          <div className="section-header">
            <span className="section-label">System</span>
            <h2>{PRODUCT_COPY.loopTitle}</h2>
            <p>{PRODUCT_COPY.loopBody}</p>
          </div>
          <div className="card-grid card-grid-4 coreloop-grid">
            {LOOP_CARDS.map((item) => (
              <article className="product-card loop-card" key={item.step}>
                <span className="step-number">{item.step}</span>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="roadmap" data-section="roadmap" className="page-section">
          <div className="section-header">
            <span className="section-label">Roadmap</span>
            <h2>{PRODUCT_COPY.roadmapTitle}</h2>
            <p>{PRODUCT_COPY.roadmapBody}</p>
          </div>
          <div className="card-grid card-grid-2 roadmap-grid">
            {ROADMAP_CARDS.map((item, index) => (
              <article className="product-card roadmap-card" key={item.title}>
                <span className="step-number">0{index + 1}</span>
                <div className="card-topline">
                  <span className={`status-chip status-${item.status.toLowerCase()}`}>{item.status}</span>
                  <span className="status-meaning">
                    {item.status === 'Past' ? 'Shipped' : item.status === 'Present' ? 'In progress' : 'Planned'}
                  </span>
                </div>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
                <div className="point-list">
                  {item.points.map((point) => (
                    <span key={point}>{point}</span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="questions" data-section="questions" className="page-section section-alt">
          <div className="section-header">
            <span className="section-label">Feedback</span>
            <h2>{PRODUCT_COPY.questionsTitle}</h2>
            <p>{PRODUCT_COPY.questionsBody}</p>
          </div>

          <div className="questions-layout">
            <div className="question-column">
              <article className="product-card featured-card">
                <div className="card-topline">
                  <span>Featured thread</span>
                  <MessageSquareText size={16} />
                </div>
                <h3>{featuredQuestion?.title || 'Public product questions will appear here.'}</h3>
                {featuredQuestion ? (
                  <>
                    <div className="thread-meta">
                      <img src={featuredQuestion.author_avatar_url} alt={featuredQuestion.author_name} />
                      <div>
                        <strong>{featuredQuestion.author_name}</strong>
                        <span>{formatRelativeDate(featuredQuestion.created_at)}</span>
                      </div>
                    </div>
                    <p>{featuredQuestion.content}</p>
                    {featuredQuestion.admin_response && (
                      <div className="reply-box">
                        <div className="thread-meta">
                          <img src={featuredQuestion.admin_avatar_url || '/assets/logo-mark.jpg'} alt="LifeOS Team" />
                          <div>
                            <strong>LifeOS Team</strong>
                            <span>Official reply</span>
                          </div>
                        </div>
                        <p>{featuredQuestion.admin_response}</p>
                      </div>
                    )}
                  </>
                ) : (
                  <p>Visitors will see the clearest questions and product replies without leaving the landing page.</p>
                )}

                <div className="mobile-social-actions">
                  <div className="question-actions">
                    <button className="action-btn" onClick={() => sectionScroll('waitlist')}>
                      <Heart size={18} />
                      <span>Like</span>
                    </button>
                    <button className="action-btn" onClick={() => sectionScroll('waitlist')}>
                      <MessageCircle size={18} />
                      <span>Comment</span>
                    </button>
                  </div>
                  <div className="comment-input-trigger" onClick={() => sectionScroll('waitlist')}>
                    <input type="text" placeholder="Add a comment..." readOnly />
                  </div>
                </div>
              </article>

              <div className="thread-stack">
                {questions
                  .filter((q) => q.id !== featuredQuestion?.id)
                  .slice(0, 3)
                  .map((question) => (
                    <article className="product-card thread-card" key={question.id}>
                    <h3>{question.title || 'Question'}</h3>
                    <p>{question.content}</p>
                    
                    <div className="mobile-social-actions">
                      <div className="question-actions">
                        <button className="action-btn" onClick={() => sectionScroll('waitlist')}>
                          <Heart size={16} />
                        </button>
                        <button className="action-btn" onClick={() => sectionScroll('waitlist')}>
                          <MessageCircle size={16} />
                        </button>
                      </div>
                      <div className="comment-input-trigger" onClick={() => sectionScroll('waitlist')}>
                        <input type="text" placeholder="Add a comment..." readOnly />
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <form className="product-card composer-card" onSubmit={handleQuestionSubmit}>
              <div className="card-topline">
                <span>Post a question</span>
              </div>
              {registeredVisitor ? (
                <div className="visitor-banner">
                  <strong>{registeredVisitor.name}</strong>
                  <span>{registeredVisitor.email}</span>
                </div>
              ) : (
                <div className="visitor-banner muted">
                  <strong>Register once before posting</strong>
                  <span>Join the waitlist below and this browser will remember you.</span>
                  <button className="button button-secondary button-inline" type="button" onClick={() => sectionScroll('waitlist')}>
                    Register this browser
                  </button>
                </div>
              )}

              <label className="field">
                <span>Optional title</span>
                <input
                  value={questionForm.title}
                  onChange={(event) => setQuestionForm((current) => ({ ...current, title: event.target.value }))}
                  placeholder="Example: Daily streak support"
                />
              </label>

              <label className="field">
                <span>Message</span>
                <textarea
                  value={questionForm.content}
                  onChange={(event) => setQuestionForm((current) => ({ ...current, content: event.target.value }))}
                  placeholder="Ask a question or suggest something..."
                  rows={5}
                  required
                />
              </label>

              <p className="helper-text">Example: Can I track my daily streak?</p>

              <button className="button button-primary button-full" type="submit" disabled={questionState === 'loading' || !registeredVisitor}>
                {questionState === 'loading' ? 'Posting...' : 'Post to the wall'}
              </button>

              {questionState === 'success' && <p className="feedback success">Your question is now visible on the wall.</p>}
              {questionState === 'error' && (
                <p className="feedback error">
                  {registeredVisitor ? 'Could not post right now. Please try again.' : 'Join the waitlist first, then post from this browser.'}
                </p>
              )}
            </form>
          </div>
        </section>

        <section id="waitlist" className="page-section">
          <div className="waitlist-layout">
            <div className="waitlist-content">
              <span className="section-label">Waitlist</span>
              <h2 className="waitlist-title">{PRODUCT_COPY.ctaTitle}</h2>
              <p className="waitlist-desc">{PRODUCT_COPY.ctaBody}</p>
              <p className="waitlist-note">{PRODUCT_COPY.ctaTrust}</p>
            </div>

            <div className="waitlist-form">
              <form className="form-container" onSubmit={handleJoin}>
                <label className="field">
                  <span>Name</span>
                  <input
                    value={joinForm.name}
                    onChange={(event) => setJoinForm((current) => ({ ...current, name: event.target.value }))}
                    placeholder="Your name"
                  />
                </label>
                <label className="field">
                  <span>Email</span>
                  <input
                    type="email"
                    value={joinForm.email}
                    onChange={(event) => setJoinForm((current) => ({ ...current, email: event.target.value }))}
                    placeholder="you@example.com"
                    required
                  />
                </label>
                <div className="field custom-select">
                  <span>Role</span>
                  <div className="custom-select-wrapper">
                    <button
                      type="button"
                      className={`custom-select-trigger ${isRoleOpen ? 'open' : ''}`}
                      onClick={() => setIsRoleOpen((prev) => !prev)}
                    >
                      <span className="selected-value">
                        {ROLES.find(r => r.value === joinForm.role)?.label || 'Select your role'}
                      </span>
                      <ChevronDown size={16} className="trigger-arrow" />
                    </button>

                    {/* Unified Dropdown for Desktop & Mobile */}
                    <div className={`custom-select-dropdown ${isRoleOpen ? 'show' : ''}`}>
                      {ROLES.map((role) => (
                        <button
                          key={role.value}
                          type="button"
                          className={`dropdown-option ${joinForm.role === role.value ? 'selected' : ''}`}
                          onClick={() => {
                            setJoinForm(prev => ({ ...prev, role: role.value }));
                            setIsRoleOpen(false);
                          }}
                        >
                          {role.label}
                        </button>
                      ))}
                    </div>
                    <div 
                      className={`custom-select-overlay ${isRoleOpen ? 'show' : ''}`} 
                      onClick={() => setIsRoleOpen(false)} 
                    />
                  </div>
                </div>
                <button className="button button-primary button-full" type="submit" disabled={joinState === 'loading'}>
                  {joinState === 'loading' ? 'Joining...' : PRODUCT_COPY.navCta}
                </button>
                {joinState === 'success' && <p className="feedback success">You are in. This browser is now ready for questions too.</p>}
                {joinState === 'error' && <p className="feedback error">That signup failed. If you already joined, try another email.</p>}
              </form>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="footer-left">
          <div className="footer-brand">
            <img src="/assets/logo-mark.jpg" alt="LifeOS" className="footer-logo" />
            <img src="/assets/logo-wordmark.svg" alt="LifeOS" className="footer-wordmark-svg" />
          </div>
        </div>

        <div className="footer-right">
          <p className="footer-desc">
            {PRODUCT_COPY.footer}
          </p>

          <div className="footer-icons">
            <a href="https://instagram.com/lifeossocial" target="_blank" rel="noreferrer" title="Instagram">
              <Instagram size={20} />
            </a>
            <a href="https://www.facebook.com/share/18KES85u5V/" target="_blank" rel="noreferrer" title="Facebook">
              <Facebook size={20} />
            </a>
            <a href="mailto:lifeossocial01@gmail.com" title="Email">
              <Mail size={20} />
            </a>
          </div>

          <div className="footer-links">
            Privacy Policy • Terms • Contact
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
