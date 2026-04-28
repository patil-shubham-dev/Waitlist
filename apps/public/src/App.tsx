import { useEffect, useMemo, useRef, useState } from 'react';
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
  Send,
} from 'lucide-react';
import { supabase, type Suggestion, type TimelineEntry } from './lib/supabase';
import { useVisitTracker } from './hooks/useVisitTracker';

function formatRelativeDate(date: string) {
  const delta = Date.now() - new Date(date).getTime();
  const minutes = Math.floor(delta / 1000 / 60);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function formatDisplayName(email?: string, name?: string) {
  if (name && name.trim() && name.trim() !== 'Anonymous') return name;
  if (!email) return 'User';
  try {
    const handle = email.split('@')[0];
    const cleaned = handle.replace(/[0-9]/g, '').replace(/[._-]/g, ' ').trim();
    if (!cleaned) return 'User';
    return cleaned
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  } catch {
    return 'User';
  }
}

function getInitials(name: string) {
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function getAvatarColor(name: string) {
  const colors = [
    '#F97316', '#EA580C', '#16794b', '#2563eb', 
    '#7c3aed', '#db2777', '#059669', '#d97706'
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}


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
  const [roadmap, setRoadmap] = useState<TimelineEntry[]>([]);
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
  const feedRef = useRef<HTMLDivElement>(null);



  // Smart auto-scroll logic
  useEffect(() => {
    if (feedRef.current) {
      const container = feedRef.current;
      const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;
      
      if (isNearBottom || questions.length <= 1) {
        container.scrollTop = container.scrollHeight;
      }
    }
  }, [questions]);

  useEffect(() => {
    setRegisteredVisitor(readVisitorCookie());
  }, []);

  useEffect(() => {
    const load = async () => {
      const [{ count }, questionsRes, roadmapRes] = await Promise.all([
        supabase.from('waitlist').select('*', { count: 'exact', head: true }),
        supabase
          .from('suggestions')
          .select('*')
          .eq('is_public', true)
          .order('created_at', { ascending: true })
          .limit(50),
        supabase
          .from('timeline_entries')
          .select('*')
          .order('sort_order', { ascending: true })
      ]);

      setWaitlistCount(count ?? 0);
      setQuestions((questionsRes.data ?? []) as Suggestion[]);
      setRoadmap((roadmapRes.data ?? []) as TimelineEntry[]);
    };

    load();

    const roadmapSub = supabase
      .channel('public-roadmap')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'timeline_entries' }, () => {
        load();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(roadmapSub);
    };
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
    
    // Delay setting registered visitor to allow 'animate-form-out' to play
    setTimeout(() => {
      setRegisteredVisitor(visitor);
      setJoinForm({ name: '', email: '', role: 'student' });
    }, 500);
  };

  const handleQuestionSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!registeredVisitor) {
      setQuestionState('error');
      sectionScroll('waitlist');
      return;
    }

    setQuestionState('loading');

    const derivedName = formatDisplayName(registeredVisitor.email, registeredVisitor.name);
    const payload = {
      author_name: derivedName,
      author_email: registeredVisitor.email,
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
    setQuestions((current) => [...current, data as Suggestion]);
    setQuestionForm({ title: '', content: '' });
    
    // Auto-hide success message after 5 seconds to allow more comments
    setTimeout(() => {
      if (questionState === 'success') setQuestionState('idle');
    }, 5000);
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
            {roadmap.map((item, index) => (
              <article className="product-card roadmap-card" key={item.id}>
                <div className="roadmap-header">
                  <span className="step-number">STEP 0{index + 1}</span>
                  <span className={`status-badge status-${item.status}`}>
                    {item.status === 'past' ? 'Completed' : item.status === 'present' ? 'In Progress' : 'Upcoming'}
                  </span>
                </div>
                <h3 className="roadmap-title">{item.title}</h3>
                <p className="roadmap-desc">{item.description}</p>
                <div className="point-list roadmap-tags">
                  {item.items?.map((point: string) => (
                    <span key={point}>{point}</span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="questions" data-section="questions" className="page-section section-alt questions-section">
          <div className="section-header">
            <span className="section-label">Feedback</span>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2>{PRODUCT_COPY.questionsTitle}</h2>
              <div className="live-pill">
                <span className="live-dot" />
                Live
              </div>
            </div>
            <p>{PRODUCT_COPY.questionsBody}</p>
          </div>

          <div className="questions-container-unified">
            <div className="questions-dual-pane questions-layout">
              <div className="comment-window" ref={feedRef}>
                {questions.length === 0 ? (
                  <div className="feed-empty-state">
                    <MessageSquareText size={48} strokeWidth={1} />
                    <p>No questions yet. Be the first to start the conversation.</p>
                  </div>
                ) : (
                  <div className="feed-list">
                    {questions.map((q) => {
                      const name = formatDisplayName(q.email, q.author_name || q.name || undefined);
                      return (
                        <div key={q.id} className={`comment-card ${q.is_featured ? 'featured-item' : ''} animate-message-in`}>
                          <div className="feed-user-meta">
                            <div className="avatar" style={{ backgroundColor: getAvatarColor(name) }}>
                              {getInitials(name)}
                            </div>
                            <div className="feed-user-details">
                              <div className="feed-header-line">
                                <span className="feed-author">{name}</span>
                                <span className="feed-dot-separator">·</span>
                                <span className="feed-time">{formatRelativeDate(q.created_at)}</span>
                              </div>
                            </div>
                            {q.is_featured && <span className="feed-badge-featured">Featured</span>}
                          </div>
                          
                          <div className="feed-bubble">
                            {q.title && <h3 className="feed-bubble-title">{q.title}</h3>}
                            <p className="feed-bubble-content">{q.content}</p>
                          </div>

                          {q.admin_response && (
                            <div className="feed-admin-reply">
                              <div className="feed-user-meta min">
                                <img 
                                  src="/favicon.svg" 
                                  alt="official avatar" 
                                  className="avatar-logo" 
                                />
                                <div className="feed-user-details">
                                  <div className="feed-header-line">
                                    <span className="feed-author">LifeOS Team</span>
                                    <span className="feed-badge-official">Official Reply</span>
                                  </div>
                                </div>
                              </div>
                              <p className="feed-reply-content">{q.admin_response}</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="input-panel">
                <div className="pane-inner">
                  {questionState === 'success' ? (
                    <div className="feed-post-confirmation">
                      <div className="conf-icon">✓</div>
                      <span>Posted to the wall</span>
                      <button className="text-btn" onClick={() => setQuestionState('idle')}>Ask another</button>
                    </div>
                  ) : (
                    <div className="feed-input-flex">
                      {!registeredVisitor ? (
                        <div className="feed-input-locked" onClick={() => sectionScroll('waitlist')}>
                          <h4 className="pane-status-title">Members only</h4>
                          <p className="pane-helper-text">Register to start asking questions and join the conversation.</p>
                          <div className="lock-btn-full">Register to post</div>
                        </div>
                      ) : (
                        <div className="feed-input-composer question-box">
                          <div className="feed-user-identity">
                            <span className="identity-label">Posting as</span>
                            <div className="identity-card">
                              <div className="avatar" style={{ backgroundColor: getAvatarColor(registeredVisitor.name) }}>
                                {getInitials(registeredVisitor.name)}
                              </div>
                              <span className="identity-name">{registeredVisitor.name}</span>
                            </div>
                          </div>

                          <form className="feed-form-full" onSubmit={handleQuestionSubmit}>
                            <div className="input-header">
                              <h3>Ask a question or share feedback</h3>
                              <p>Be specific. Clear questions get better answers.</p>
                            </div>
                            <input
                              className="feed-field-minimal"
                              value={questionForm.title}
                              onChange={(e) => setQuestionForm(prev => ({ ...prev, title: e.target.value.substring(0, 50) }))}
                              placeholder="Topic (optional)"
                              autoComplete="off"
                            />
                            <div className="textarea-wrapper">
                              <textarea
                                className="feed-textarea-minimal"
                                value={questionForm.content}
                                onChange={(e) => setQuestionForm(prev => ({ ...prev, content: e.target.value.substring(0, 280) }))}
                                placeholder="Your question or feedback..."
                                required
                                rows={6}
                              />
                              <span className={`char-counter ${questionForm.content.length >= 280 ? 'limit' : ''}`}>
                                {questionForm.content.length}/280
                              </span>
                            </div>
                            <div className="feed-form-actions">
                              <button 
                                type="submit" 
                                className="button button-primary button-full" 
                                disabled={questionState === 'loading' || !questionForm.content.trim()}
                              >
                                {questionState === 'loading' ? (
                                  <>
                                    <div className="spinner-mini" />
                                    Posting...
                                  </>
                                ) : (
                                  <>
                                    Post to the wall
                                    <Send size={16} />
                                  </>
                                )}
                              </button>
                            </div>
                          </form>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="waitlist" className="page-section waitlist-section">
          <div className="waitlist-layout">
            <div className="waitlist-content">
              <span className="section-label">Waitlist</span>
              <h2 className="waitlist-title">
                {registeredVisitor ? "You're on the list" : PRODUCT_COPY.ctaTitle}
              </h2>
              <p className="waitlist-desc">
                {registeredVisitor 
                  ? "Your spot in the LifeOS ecosystem is reserved." 
                  : PRODUCT_COPY.ctaBody
                }
              </p>
              {registeredVisitor && (
                <p className="waitlist-subtext desktop-only">
                  Start building your proof system early.<br/>
                  LifeOS rewards execution — not intentions.
                </p>
              )}
              {!registeredVisitor && <p className="waitlist-note">{PRODUCT_COPY.ctaTrust}</p>}
            </div>

            <div className="waitlist-form-container">
              {registeredVisitor ? (
                <div className="registration-reward-block animate-reward-in">
                  <div className="reward-icon-shell">
                    <CheckCircle2 size={32} className="reward-icon" />
                    <Sparkles size={16} className="reward-sparkle" />
                  </div>
                  
                  <div className="reward-content">
                    <h3 className="reward-title">Welcome aboard 🔥</h3>
                    <p className="reward-main-msg">
                      We’ll send you an email shortly to complete your registration and unlock access.
                    </p>
                    
                    <div className="reward-supporting-lines">
                      <div className="reward-line">
                        <div className="reward-dot" />
                        <span>You’re now on the early access list.</span>
                      </div>
                      <div className="reward-line">
                        <div className="reward-dot" />
                        <span>We’ll notify you as soon as your access is ready.</span>
                      </div>
                      <div className="reward-line">
                        <div className="reward-dot" />
                        <span>No spam. Only important updates.</span>
                      </div>
                      <div className="reward-line">
                        <div className="reward-dot" />
                        <span>Get ready to experience LifeOS before everyone else.</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className={`waitlist-form ${joinState === 'success' ? 'animate-form-out' : ''}`}>
                  <form className="form-container" onSubmit={handleJoin}>
                    <label className="field">
                      <span>Name</span>
                      <input
                        value={joinForm.name}
                        onChange={(event) => setJoinForm((current) => ({ ...current, name: event.target.value }))}
                        placeholder="Your name"
                        required
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
                    {joinState === 'error' && <p className="feedback error">That signup failed. If you already joined, try another email.</p>}
                  </form>
                </div>
              )}
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
