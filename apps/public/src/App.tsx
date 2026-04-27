import { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  LayoutGrid,
  Menu,
  MessageSquareMore,
  ShieldCheck,
  Sparkles,
  Target,
  Trophy,
  UserRound,
  X,
} from 'lucide-react';
import { supabase, type SiteContent, type Suggestion, type TimelineEntry } from './lib/supabase';
import { useVisitTracker } from './hooks/useVisitTracker';

const DEFAULT_CONTENT = {
  nav_cta: 'Join the founding waitlist',
  hero_badge: 'LifeOS Social - premium launch',
  hero_title: 'The social operating system for people who want proof, progress, and momentum.',
  hero_subtext:
    'LifeOS turns daily action into visible growth. Plan your work, prove what you finished, earn momentum, and stay surrounded by people who are moving forward too.',
  hero_primary_cta: 'Join the waitlist',
  hero_secondary_cta: 'See the product story',
  problem_title: 'Why LifeOS exists',
  problem_body:
    'Most productivity apps help you plan. Most social apps help you escape. LifeOS is built to help you act, verify progress, and come back tomorrow stronger.',
  questions_title: 'Questions, ideas, and launch feedback',
  questions_body:
    'Visitors can ask questions, suggest improvements, and follow the product journey. Replies from the team stay visible to everyone.',
  waitlist_title: 'Get early access to LifeOS',
  waitlist_body:
    'Join the founding list for launch updates, beta access, and roadmap drops.',
  footer_tagline: 'Built for disciplined students, founders, creators, and builders.',
  brand_reply_name: 'LifeOS Team',
  reply_logo_url: '/assets/logo-mark.svg',
  brand_wordmark_url: '/assets/logo-wordmark.svg',
};

type ContentState = typeof DEFAULT_CONTENT;

const NAV_ITEMS = [
  { id: 'problem', label: 'Problem' },
  { id: 'story', label: 'How It Works' },
  { id: 'phases', label: 'Phases' },
  { id: 'questions', label: 'Community' },
];

const OUTCOMES = [
  {
    icon: Target,
    title: 'Action first',
    body: 'Every part of LifeOS is designed to move you from intention into execution.',
  },
  {
    icon: ShieldCheck,
    title: 'Proof and trust',
    body: 'Progress is not guessed. It is shown, reviewed, and turned into visible momentum.',
  },
  {
    icon: Trophy,
    title: 'Social motivation',
    body: 'You stay consistent because the system, your community, and your streaks keep pulling you back in.',
  },
];

const CORE_LOOP = [
  {
    title: 'Consume',
    body: 'See progress-driven content instead of endless distraction.',
  },
  {
    title: 'Act',
    body: 'Start the next meaningful task with AI-guided structure.',
  },
  {
    title: 'Prove',
    body: 'Upload proof so effort becomes visible, trusted, and rewarding.',
  },
  {
    title: 'Earn',
    body: 'Build streaks, points, and a public record of progress that compounds.',
  },
];

function mergeContent(content: SiteContent[]) {
  return content.reduce<ContentState>(
    (acc, item) => {
      (acc as Record<string, string>)[item.key] = item.value;
      return acc;
    },
    { ...DEFAULT_CONTENT } as ContentState,
  );
}

function sectionScroll(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

const VISITOR_COOKIE = 'lifeos_visitor';

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

function Background() {
  return (
    <>
      <div className="bg-base" />
      <div className="bg-ambient" />
      <div className="bg-grid" />
    </>
  );
}

function Navbar({
  activeSection,
  ctaLabel,
}: {
  activeSection: string;
  ctaLabel: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <header className="navbar-shell">
      <nav className="navbar">
        <a className="brand-lockup" href="#top" onClick={(event) => {
          event.preventDefault();
          sectionScroll('top');
        }}>
          <img className="brand-mark" src="/assets/logo-mark.svg" alt="LifeOS" />
          <img className="brand-wordmark" src="/assets/logo-wordmark.png" alt="LifeOS" />
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
          <button
            className="mobile-nav-toggle"
            aria-label="Open navigation"
            onClick={() => setOpen((current) => !current)}
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </nav>

      <div className={`mobile-nav ${open ? 'open' : ''}`}>
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            className="mobile-nav-link"
            onClick={() => {
              setOpen(false);
              sectionScroll(item.id);
            }}
          >
            {item.label}
          </button>
        ))}
        <button
          className="button button-primary"
          onClick={() => {
            setOpen(false);
            sectionScroll('waitlist');
          }}
        >
          {ctaLabel}
        </button>
      </div>
    </header>
  );
}

export default function App() {
  useVisitTracker();

  const [waitlistCount, setWaitlistCount] = useState(0);
  const [content, setContent] = useState<ContentState>(DEFAULT_CONTENT);
  const [phases, setPhases] = useState<TimelineEntry[]>([]);
  const [questions, setQuestions] = useState<Suggestion[]>([]);
  const [activeSection, setActiveSection] = useState('problem');

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
    type: 'question',
  });
  const [questionState, setQuestionState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  useEffect(() => {
    setRegisteredVisitor(readVisitorCookie());
  }, []);

  useEffect(() => {
    const load = async () => {
      const [{ count }, contentRes, phasesRes, questionsRes] = await Promise.all([
        supabase.from('waitlist').select('*', { count: 'exact', head: true }),
        supabase.from('site_content').select('*'),
        supabase.from('timeline_entries').select('*').order('sort_order', { ascending: true }),
        supabase
          .from('suggestions')
          .select('*')
          .eq('is_public', true)
          .order('is_featured', { ascending: false })
          .order('created_at', { ascending: false })
          .limit(12),
      ]);

      setWaitlistCount(count ?? 0);
      setContent(mergeContent((contentRes.data ?? []) as SiteContent[]));
      setPhases((phasesRes.data ?? []) as TimelineEntry[]);
      setQuestions((questionsRes.data ?? []) as Suggestion[]);
    };

    load();
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
      { rootMargin: '-35% 0px -45% 0px', threshold: 0.15 },
    );

    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [phases.length, questions.length]);

  useEffect(() => {
    const revealItems = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.16 },
    );

    revealItems.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [phases.length, questions.length]);

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
    const visitor = {
      name: payload.name,
      email: payload.email,
      role: payload.role,
    };
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
      type: questionForm.type,
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
    setQuestions((current) => [data as Suggestion, ...current].slice(0, 12));
    setQuestionForm({
      title: '',
      content: '',
      type: 'question',
    });
  };

  return (
    <div className="page-shell" id="top">
      <Background />
      <Navbar activeSection={activeSection} ctaLabel={content.nav_cta} />

      <main>
        <section className="hero-section">
          <div className="hero-grid">
            <div className="hero-copy" data-reveal>
              <div className="eyebrow">
                <Sparkles size={14} />
                <span>{content.hero_badge}</span>
              </div>
              <h1>{content.hero_title}</h1>
              <p>{content.hero_subtext}</p>
              <div className="hero-actions">
                <button className="button button-primary" onClick={() => sectionScroll('waitlist')}>
                  {content.hero_primary_cta}
                  <ChevronRight size={18} />
                </button>
                <button className="button button-secondary" onClick={() => sectionScroll('story')}>
                  {content.hero_secondary_cta}
                  <ChevronDown size={18} />
                </button>
              </div>
              <div className="hero-metrics">
                <div>
                  <strong>{waitlistCount.toLocaleString()}</strong>
                  <span>Founding members queued</span>
                </div>
                <div>
                  <strong>Mobile + desktop</strong>
                  <span>Fluid layout and responsive launch flow</span>
                </div>
                <div>
                  <strong>Q&A live</strong>
                  <span>Questions and admin replies visible to every visitor</span>
                </div>
              </div>
            </div>

            <div className="hero-visual" data-reveal>
              <div className="device-stage">
                <div className="device-chrome">
                  <span />
                  <span />
                  <span />
                </div>
                <div className="device-content">
                  <div className="mini-card">
                    <p className="mini-label">Today</p>
                    <h3>Consume - Act - Prove - Earn</h3>
                    <p className="mini-body">
                      The launch page now tells the real product story: disciplined action, social motivation, and proof-driven growth.
                    </p>
                  </div>
                  <div className="proof-list">
                    {CORE_LOOP.map((step, index) => (
                      <div className="proof-row" key={step.title} style={{ animationDelay: `${index * 120}ms` }}>
                        <span className="proof-index">0{index + 1}</span>
                        <div>
                          <strong>{step.title}</strong>
                          <p>{step.body}</p>
                        </div>
                        <ArrowRight size={16} />
                      </div>
                    ))}
                  </div>
                  <div className="mini-stat-row">
                    <div className="mini-stat">
                      <span>Trust</span>
                      <strong>Proof-based</strong>
                    </div>
                    <div className="mini-stat">
                      <span>Retention</span>
                      <strong>Streak logic</strong>
                    </div>
                    <div className="mini-stat">
                      <span>Signal</span>
                      <strong>Community feedback</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="problem" data-section="problem" className="content-section">
          <div className="section-heading" data-reveal>
            <span className="section-kicker">Problem clarity</span>
            <h2>{content.problem_title}</h2>
            <p>{content.problem_body}</p>
          </div>

          <div className="problem-grid">
            {OUTCOMES.map(({ icon: Icon, title, body }) => (
              <article className="surface-card" data-reveal key={title}>
                <div className="icon-badge">
                  <Icon size={18} />
                </div>
                <h3>{title}</h3>
                <p>{body}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="story" data-section="story" className="content-section">
          <div className="section-heading narrow" data-reveal>
            <span className="section-kicker">Product story</span>
            <h2>Built around the LifeOS core loop</h2>
            <p>
              The app is not another habit dashboard. It is a social productivity system where action becomes visible, verifiable, and rewarding.
            </p>
          </div>

          <div className="story-grid">
            {CORE_LOOP.map((step, index) => (
              <article className="story-card" data-reveal key={step.title}>
                <span className="story-index">0{index + 1}</span>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="phases" data-section="phases" className="content-section">
          <div className="section-heading" data-reveal>
            <span className="section-kicker">Launch phases</span>
            <h2>From foundation to public beta</h2>
            <p>
              The roadmap is now easier to understand, easier to edit from admin, and more aligned with the LifeOS Social PRD.
            </p>
          </div>

          <div className="phase-list">
            {phases.map((phase) => (
              <article className={`phase-card phase-${phase.status}`} data-reveal key={phase.id}>
                <div className="phase-topline">
                  <span className="phase-status">{phase.status}</span>
                  <span className="phase-order">{String(phase.sort_order).padStart(2, '0')}</span>
                </div>
                <h3>{phase.title}</h3>
                <p>{phase.description}</p>
                <div className="phase-tags">
                  {(phase.items ?? []).map((item) => (
                    <span key={item}>{item}</span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="questions" data-section="questions" className="content-section">
          <div className="section-heading" data-reveal>
            <span className="section-kicker">Public feedback wall</span>
            <h2>{content.questions_title}</h2>
            <p>{content.questions_body}</p>
          </div>

          <div className="questions-layout">
            <div className="surface-card feature-card" data-reveal>
              <div className="feature-card-header">
                <div>
                  <span className="section-kicker">Featured thread</span>
                  <h3>{featuredQuestion?.title || 'Ask what you want to know before launch'}</h3>
                </div>
                <MessageSquareMore size={18} />
              </div>
              {featuredQuestion ? (
                <>
                  <div className="thread-author">
                    <img src={featuredQuestion.author_avatar_url} alt={featuredQuestion.author_name} />
                    <div>
                      <strong>{featuredQuestion.author_name}</strong>
                      <span>{formatRelativeDate(featuredQuestion.created_at)}</span>
                    </div>
                  </div>
                  <p className="thread-body">{featuredQuestion.content}</p>
                  {featuredQuestion.admin_response ? (
                    <div className="reply-card">
                      <div className="thread-author">
                        <img
                          src={featuredQuestion.admin_avatar_url || content.reply_logo_url}
                          alt={featuredQuestion.admin_name || content.brand_reply_name}
                        />
                        <div>
                          <strong>{featuredQuestion.admin_name || content.brand_reply_name}</strong>
                          <span>Official reply</span>
                        </div>
                      </div>
                      <p>{featuredQuestion.admin_response}</p>
                    </div>
                  ) : (
                    <div className="pending-chip">Awaiting team reply</div>
                  )}
                </>
              ) : (
                <p className="thread-body">
                  The public Q&amp;A stream will appear here as soon as visitors start asking questions.
                </p>
              )}
            </div>

            <div className="question-column">
              <form className="surface-card question-form" data-reveal onSubmit={handleQuestionSubmit}>
                <div className="feature-card-header">
                  <div>
                    <span className="section-kicker">Ask publicly</span>
                    <h3>Questions, suggestions, launch feedback</h3>
                  </div>
                  <LayoutGrid size={18} />
                </div>

                {registeredVisitor ? (
                  <div className="registered-banner">
                    <div>
                      <strong>{registeredVisitor.name}</strong>
                      <span>{registeredVisitor.email}</span>
                    </div>
                    <p>Registered in this browser. You can post directly now.</p>
                  </div>
                ) : (
                  <div className="registration-banner">
                    <strong>Register once before posting</strong>
                    <p>Join the waitlist below and this browser will remember you for future questions and suggestions.</p>
                    <button className="button button-secondary button-compact" type="button" onClick={() => sectionScroll('waitlist')}>
                      Register this browser
                    </button>
                  </div>
                )}

                <div className="field-row">
                  <label>
                    <span>Type</span>
                    <select
                      value={questionForm.type}
                      onChange={(event) => setQuestionForm((current) => ({ ...current, type: event.target.value }))}
                    >
                      <option value="question">Question</option>
                      <option value="suggestion">Suggestion</option>
                      <option value="feedback">Feedback</option>
                    </select>
                  </label>
                  <label>
                    <span>Headline</span>
                    <input
                      value={questionForm.title}
                      onChange={(event) => setQuestionForm((current) => ({ ...current, title: event.target.value }))}
                      placeholder="What do you want to know?"
                    />
                  </label>
                </div>

                <label>
                  <span>Message</span>
                  <textarea
                    value={questionForm.content}
                    onChange={(event) => setQuestionForm((current) => ({ ...current, content: event.target.value }))}
                    placeholder="Ask a question, request a feature, or suggest an improvement."
                    rows={4}
                    required
                  />
                </label>

                <button className="button button-primary" type="submit" disabled={questionState === 'loading' || !registeredVisitor}>
                  {questionState === 'loading' ? 'Sending...' : 'Publish to the wall'}
                </button>
                {questionState === 'success' && <p className="success-text">Your post is now visible on the public wall.</p>}
                {questionState === 'error' && <p className="error-text">{registeredVisitor ? 'That could not be submitted right now. Please try again.' : 'Register first, then ask your question from this browser.'}</p>}
              </form>

              <div className="thread-list">
                {questions.map((question) => (
                  <article className="surface-card thread-card" data-reveal key={question.id}>
                    <div className="thread-author">
                      <img src={question.author_avatar_url} alt={question.author_name} />
                      <div>
                        <strong>{question.author_name}</strong>
                        <span>{question.type} · {formatRelativeDate(question.created_at)}</span>
                      </div>
                    </div>
                    {question.title && <h3>{question.title}</h3>}
                    <p className="thread-body">{question.content}</p>
                    {question.admin_response && (
                      <div className="reply-card compact">
                        <div className="thread-author">
                          <img
                            src={question.admin_avatar_url || content.reply_logo_url}
                            alt={question.admin_name || content.brand_reply_name}
                          />
                          <div>
                            <strong>{question.admin_name || content.brand_reply_name}</strong>
                            <span>{question.status}</span>
                          </div>
                        </div>
                        <p>{question.admin_response}</p>
                      </div>
                    )}
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="waitlist" className="content-section waitlist-band">
          <div className="waitlist-panel" data-reveal>
            <div className="waitlist-copy">
              <span className="section-kicker">Founding access</span>
              <h2>{content.waitlist_title}</h2>
              <p>{content.waitlist_body}</p>
            </div>

            <form className="waitlist-form" onSubmit={handleJoin}>
              <label>
                <span>Name</span>
                <input
                  value={joinForm.name}
                  onChange={(event) => setJoinForm((current) => ({ ...current, name: event.target.value }))}
                  placeholder="Your name"
                />
              </label>
              <label>
                <span>Email</span>
                <input
                  type="email"
                  value={joinForm.email}
                  onChange={(event) => setJoinForm((current) => ({ ...current, email: event.target.value }))}
                  placeholder="you@example.com"
                  required
                />
              </label>
              <label>
                <span>Role</span>
                <select
                  value={joinForm.role}
                  onChange={(event) => setJoinForm((current) => ({ ...current, role: event.target.value }))}
                >
                  <option value="student">Student</option>
                  <option value="founder">Founder</option>
                  <option value="creator">Creator</option>
                  <option value="operator">Operator</option>
                  <option value="professional">Professional</option>
                  <option value="other">Other</option>
                </select>
              </label>
              <button className="button button-primary" type="submit" disabled={joinState === 'loading'}>
                {joinState === 'loading' ? 'Joining...' : content.nav_cta}
              </button>
              {joinState === 'success' && (
                <p className="success-text">
                  You are in. We will reach out when the next LifeOS phase opens.
                </p>
              )}
              {joinState === 'error' && (
                <p className="error-text">
                  That signup did not go through. If you already joined, try a different email.
                </p>
              )}
            </form>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div>
          <img className="brand-wordmark footer-wordmark" src={content.brand_wordmark_url} alt="LifeOS" />
          <p>{content.footer_tagline}</p>
        </div>
        <button className="footer-link" onClick={() => sectionScroll('top')}>
          Back to top
          <UserRound size={16} />
        </button>
      </footer>
    </div>
  );
}
