import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  ArrowRight,
  BarChart3,
  Brain,
  Check,
  Flame,
  LineChart,
  Play,
  ScanLine,
  Sparkles,
  Target,
  Timer,
  Utensils,
  Zap,
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

/* ─────────────────────────────────────────────
   DATA
───────────────────────────────────────────── */
const features = [
  { icon: Brain, title: 'AI Food Recognition', copy: 'Turn everyday meals into structured calories and macros with AI-assisted interpretation.', accent: '#f5b35c' },
  { icon: Sparkles, title: 'Natural Language Logging', copy: 'Write meals the way you speak. CalTrack translates rough portions into clean nutrition data.', accent: '#fb923c' },
  { icon: BarChart3, title: 'Smart Macro Tracking', copy: 'Stay aligned with protein, carbs, fats, and calorie goals through live daily feedback.', accent: '#7dd3fc' },
  { icon: Target, title: 'Personalized Goals', copy: 'Build calorie targets around your body, routine, pace, and nutrition preferences.', accent: '#f87171' },
  { icon: Timer, title: 'Fast Meal Tracking', copy: 'Log in seconds, reduce friction, and keep the habit alive without manual searching.', accent: '#fbbf24' },
  { icon: LineChart, title: 'Beautiful Analytics', copy: 'See patterns across meals, macros, calories, and streaks in a polished health dashboard.', accent: '#a78bfa' },
];

const macroCards = [
  { label: 'Calories', value: '542', unit: 'kcal', color: '#f5b35c', width: '72%' },
  { label: 'Protein', value: '28', unit: 'g', color: '#f0ebe1', width: '64%' },
  { label: 'Carbs', value: '61', unit: 'g', color: '#f5b35c', width: '78%' },
  { label: 'Fat', value: '18', unit: 'g', color: '#c8c4be', width: '46%' },
];

const stats = [
  { value: 2.4, suffix: 'M+', label: 'calories tracked' },
  { value: 184, suffix: 'K+', label: 'meals logged' },
  { value: 8, suffix: 'min', label: 'saved each day' },
  { value: 94, suffix: '%', label: 'macro confidence' },
];

const ticker = ['AI Nutrition', 'Smart Logging', 'Macro Tracking', 'Calorie Goals', 'Progress Analytics', 'Meal Patterns', 'Body Intelligence'];

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */
export default function LandingPage() {
  const rootRef = useRef<HTMLDivElement>(null);
  const typedMealRef = useRef<HTMLSpanElement>(null);
  const heroImgRef = useRef<HTMLDivElement>(null);
  const loggingImgRef = useRef<HTMLDivElement>(null);
  const typingTimeouts = useRef<number[]>([]);

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* Fallback: ensure visibility if GSAP fails */
    gsap.set(['.hero-word', '.hero-dashboard', '.hero-img-wrap'], { opacity: 1, y: 0, filter: 'blur(0px)' });

    if (reduceMotion) return;

    const ctx = gsap.context(() => {

      /* ── Hero entrance ── */
      gsap.fromTo('.hero-word',
        { y: 64, opacity: 0, filter: 'blur(20px)' },
        { y: 0, opacity: 1, filter: 'blur(0px)', duration: 1.15, stagger: 0.08, ease: 'power4.out', delay: 0.2 },
      );
      gsap.fromTo('.hero-img-wrap',
        { y: 50, opacity: 0, scale: 0.96 },
        { y: 0, opacity: 1, scale: 1, duration: 1.2, ease: 'power3.out', delay: 0.55 },
      );
      gsap.fromTo('.hero-dashboard',
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, ease: 'power3.out', delay: 0.75 },
      );
      gsap.fromTo('.float-layer',
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.9, stagger: 0.14, ease: 'power3.out', delay: 1.1 },
      );

      /* ── Hero image parallax on scroll ── */
      if (heroImgRef.current) {
        gsap.to(heroImgRef.current, {
          y: 80,
          ease: 'none',
          scrollTrigger: {
            trigger: '.hero-section',
            start: 'top top',
            end: 'bottom top',
            scrub: 1.4,
          },
        });
      }

      /* ── Logging image parallax ── */
      if (loggingImgRef.current) {
        gsap.fromTo(loggingImgRef.current,
          { y: 40, opacity: 0, scale: 0.94 },
          {
            y: 0, opacity: 1, scale: 1, duration: 1.1, ease: 'power3.out',
            scrollTrigger: { trigger: '.logging-img-scene', start: 'top 80%', once: true },
          },
        );
        gsap.to(loggingImgRef.current, {
          y: -30,
          ease: 'none',
          scrollTrigger: {
            trigger: '.logging-section',
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.2,
          },
        });
      }

      /* ── Section headings ── */
      gsap.utils.toArray<HTMLElement>('.reveal-up').forEach((el) => {
        gsap.fromTo(el,
          { y: 48, opacity: 0, filter: 'blur(8px)' },
          {
            y: 0, opacity: 1, filter: 'blur(0px)', duration: 1, ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 88%', once: true },
          },
        );
      });

      /* ── Processing line + macro cards ── */
      gsap.set('.processing-line', { scaleX: 0, transformOrigin: 'left' });
      gsap.set('.macro-card', { y: 40, opacity: 0 });

      const playProcessingReveal = () => {
        gsap.to('.processing-line', { scaleX: 1, duration: 1.1, ease: 'power2.inOut' });
        gsap.to('.macro-card', { y: 0, opacity: 1, stagger: 0.1, duration: 0.75, ease: 'power3.out', delay: 0.3 });
      };

      const typeText = () => {
        const node = typedMealRef.current;
        if (!node) return;
        const text = '2 eggs and 1 bowl rice';
        node.textContent = '';
        let index = 0;
        const intervalId = window.setInterval(() => {
          index += 1;
          if (!node) return;
          node.textContent = text.slice(0, index);
          if (index >= text.length) { window.clearInterval(intervalId); playProcessingReveal(); }
        }, 48);
        typingTimeouts.current.push(intervalId);
      };

      ScrollTrigger.create({
        trigger: '.logging-section', start: 'top 72%', once: true, onEnter: typeText,
      });

      /* ── Dash panels ── */
      gsap.utils.toArray<HTMLElement>('.dash-panel').forEach((panel) => {
        gsap.fromTo(panel,
          { y: 40, opacity: 0 },
          {
            y: 0, opacity: 1, duration: 0.95, ease: 'power3.out',
            scrollTrigger: { trigger: panel, start: 'top 90%', once: true }
          },
        );
      });

      /* ── Feature cards stagger ── */
      gsap.utils.toArray<HTMLElement>('.feature-card').forEach((card, i) => {
        gsap.fromTo(card,
          { y: 50, opacity: 0 },
          {
            y: 0, opacity: 1, duration: 0.85, ease: 'power3.out', delay: (i % 3) * 0.1,
            scrollTrigger: { trigger: card, start: 'top 93%', once: true }
          },
        );
      });

      /* ── Stat counters ── */
      gsap.utils.toArray<HTMLElement>('.stat-number').forEach((el) => {
        const target = Number(el.dataset.value || 0);
        const decimals = target % 1 === 0 ? 0 : 1;
        const counter = { value: 0 };
        gsap.to(counter, {
          value: target, duration: 1.6, ease: 'power2.out',
          onUpdate: () => { el.textContent = counter.value.toFixed(decimals); },
          scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        });
      });

      /* ── Stat cards stagger ── */
      gsap.fromTo('.stat-card',
        { y: 36, opacity: 0 },
        {
          y: 0, opacity: 1, stagger: 0.1, duration: 0.85, ease: 'power3.out',
          scrollTrigger: { trigger: '.impact-stats', start: 'top 88%', once: true }
        },
      );

      /* ── Final CTA ── */
      gsap.fromTo('.final-cta-content',
        { y: 64, opacity: 0, scale: 0.97 },
        {
          y: 0, opacity: 1, scale: 1, ease: 'power3.out', duration: 1.05,
          scrollTrigger: { trigger: '.final-cta', start: 'top 80%', once: true }
        },
      );

    }, rootRef);

    return () => {
      ctx.revert();
      typingTimeouts.current.forEach((id) => window.clearInterval(id));
    };
  }, []);

  return (
    <main ref={rootRef} style={{ minHeight: '100vh', overflowX: 'hidden', background: '#050506', color: '#f4f1ea' }}>
      <style>{CSS}</style>
      <div className="grain-overlay" aria-hidden="true" />

      {/* NAV */}
      <div style={{ position: 'relative', zIndex: 50, padding: '20px 20px 0' }}>
        <nav className="lp-nav">
          <Link to="/" className="nav-logo">
            <span className="nav-logo-icon"><Flame style={{ width: 15, height: 15 }} /></span>
            <span className="nav-wordmark">CALTRACK</span>
          </Link>
          <div className="nav-links">
            <a href="#ai-logging">AI Logging</a>
            <a href="#dashboard">Dashboard</a>
            <a href="#features">Features</a>
          </div>
          <Link to="/login" className="nav-cta">Login →</Link>
        </nav>
      </div>

      {/* ════════════ HERO ════════════ */}
      <section className="hero-section">
        <Atm variant="hero" />

        <div className="hero-inner">
          {/* Left: copy */}
          <div className="hero-copy-col">
            <div className="hero-badge hero-word">
              <Sparkles style={{ width: 12, height: 12 }} />
              Intelligent nutrition system
            </div>

            <h1 className="hero-h1">
              <span className="hero-word block">Understand</span>
              <span className="hero-word block">your body.</span>
              <em className="hero-word block">Eat smarter.</em>
            </h1>

            <p className="hero-sub hero-word">
              CalTrack turns everyday meals into intelligent decisions — helping you build
              effortless habits, clearer energy, and a nutrition rhythm that actually fits your life.
            </p>

            <div className="hero-ctas hero-word">
              <Link to="/login" className="btn-primary">
                Get Started <ArrowRight style={{ width: 15, height: 15 }} />
              </Link>
              <Link to="/register" className="btn-secondary">
                <Play style={{ width: 13, height: 13, fill: 'rgba(255,255,255,0.75)' }} />
                Try Demo
              </Link>
            </div>

            {/* Floating insight cards */}
            <div className="hero-insights hero-word">
              <div className="insight-chip float-layer">
                <Utensils style={{ width: 13, height: 13, color: '#f5b35c' }} />
                <span><strong>2 eggs + rice</strong> · 542 kcal</span>
              </div>
              <div className="insight-chip float-layer">
                <Target style={{ width: 13, height: 13, color: '#7dd3fc' }} />
                <span><strong>1,458 kcal</strong> remaining today</span>
              </div>
            </div>
          </div>

          {/* Right: hero image */}
          <div className="hero-img-col hero-img-wrap">
            <div ref={heroImgRef} className="hero-img-scene">
              <img
                src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=900&q=80&auto=format&fit=crop"
                alt="A beautifully arranged healthy meal bowl with vegetables and grains"
                className="hero-img"
              />
              <div className="hero-img-overlay" />
              {/* Floating stat badge on image */}
              <div className="hero-img-badge float-layer">
                <div className="hib-ring">
                  <svg viewBox="0 0 60 60" style={{ width: 60, height: 60 }}>
                    <circle cx="30" cy="30" r="24" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="6" />
                    <circle cx="30" cy="30" r="24" fill="none" stroke="#f5b35c" strokeWidth="6"
                      strokeDasharray="150.8" strokeDashoffset="45" strokeLinecap="round"
                      transform="rotate(-90 30 30)" />
                  </svg>
                  <span className="hib-pct">72%</span>
                </div>
                <div>
                  <p className="hib-label">Daily goal</p>
                  <p className="hib-val">On track</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard strip */}
        <div className="hero-dashboard">
          <div className="product-card">
            <DashboardMockup />
          </div>
        </div>
      </section>

      {/* ════════════ TICKER ════════════ */}
      <div className="ticker-wrap" aria-hidden="true">
        <div className="ticker-track">
          {[...ticker, ...ticker].map((t, i) => (
            <span key={i} className="ticker-item">
              <Flame style={{ width: 12, height: 12, color: '#f5b35c', flexShrink: 0 }} />
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* ════════════ LOGGING ════════════ */}
      <section id="ai-logging" className="logging-section">
        <Atm variant="soft" />
        <div className="logging-inner">
          {/* Left: image */}
          <div className="logging-img-scene" ref={loggingImgRef}>
            <img
              src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=700&q=80&auto=format&fit=crop"
              alt="Fresh healthy ingredients laid out on a wooden surface"
              className="logging-img"
            />
            <div className="logging-img-overlay" />
            <div className="logging-img-tag">
              <Zap style={{ width: 12, height: 12, color: '#f5b35c' }} />
              <span>AI scans in 0.3s</span>
            </div>
          </div>

          {/* Right: copy + logger card */}
          <div className="logging-right">
            <span className="section-eyebrow reveal-up">AI food logging</span>
            <h2 className="section-h2 reveal-up">Nutrition clarity,<br />without the spreadsheet.</h2>
            <p className="section-p reveal-up">
              Speak naturally. CalTrack interprets the meal, estimates the nutrition, and gives
              your day a sharper signal — without manual food databases.
            </p>

            <div className="logger-card reveal-up">
              <div className="logger-header">
                <div className="logger-title-row">
                  <div className="logger-icon"><Zap style={{ width: 15, height: 15 }} /></div>
                  <div>
                    <p className="logger-name">Smart Logger</p>
                    <p className="logger-sub">Natural language input</p>
                  </div>
                </div>
                <span className="logger-live-badge">Live</span>
              </div>

              <div className="logger-input-box">
                <p className="logger-input-label">I ate</p>
                <div className="logger-typed">
                  <span ref={typedMealRef} className="typed-cursor" />
                </div>
              </div>

              <div className="logger-process-box">
                <div className="logger-process-labels">
                  <span>AI processing</span><span>Macros found</span>
                </div>
                <div className="logger-bar-track">
                  <div className="processing-line" />
                </div>
              </div>

              <div className="macro-grid">
                {macroCards.map((m) => (
                  <div key={m.label} className="macro-card">
                    <div className="mc-top">
                      <span className="mc-label">{m.label}</span>
                      <Check style={{ width: 13, height: 13, color: m.color }} />
                    </div>
                    <div className="mc-val-row">
                      <span className="mc-val" style={{ color: m.color }}>{m.value}</span>
                      <span className="mc-unit">{m.unit}</span>
                    </div>
                    <div className="mc-bar"><div className="mc-fill" style={{ width: m.width }} /></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════ DASHBOARD ════════════ */}
      <section id="dashboard" className="dashboard-section">
        <Atm variant="deep" />
        <div className="dashboard-inner">
          <div className="dashboard-intro">
            <span className="section-eyebrow reveal-up">Smart dashboard</span>
            <h2 className="section-h2 reveal-up">A living model of your<br />daily nutrition.</h2>
            <p className="section-p reveal-up">
              CalTrack converts meals, goals, and patterns into a clean feedback system for better decisions.
            </p>
          </div>

          <div className="dashboard-grid">
            <div className="dash-panel product-card"><DashboardMockup /></div>

            <div className="dash-panel dash-goal-card">
              <span className="section-eyebrow">Personal target</span>
              <div className="dgc-num">2,180</div>
              <p className="dgc-sub">kcal daily goal calibrated from your profile</p>
              <div className="dgc-list">
                {['Protein priority', 'Balanced carbs', 'Sustainable deficit'].map((item, i) => (
                  <div key={item} className="dgc-item">
                    <span className="dgc-bullet">{i + 1}</span>
                    <span className="dgc-text">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="dash-panel dash-pattern-card">
              <div className="dpc-img-wrap">
                <img
                  src="https://images.unsplash.com/photo-1543362906-acfc16c67564?w=600&q=80&auto=format&fit=crop"
                  alt="Colourful salad bowl"
                  className="dpc-img"
                />
              </div>
              <span className="section-eyebrow" style={{ marginBottom: 0 }}>Meal history</span>
              <p className="dpc-title">Patterns that get smarter each week.</p>
              <p className="dpc-copy">CalTrack learns from your logs to make future insights faster and more personal.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════ FEATURES ════════════ */}
      <section id="features" className="features-section">
        <Atm variant="soft" />
        <div className="features-inner">
          <div className="features-head">
            <div>
              <span className="section-eyebrow reveal-up">Feature system</span>
              <h2 className="section-h2 reveal-up" style={{ maxWidth: 520 }}>Built for the rituals<br />that change you.</h2>
            </div>
            <p className="reveal-up" style={{ maxWidth: 300, fontSize: 14, lineHeight: 1.8, color: 'rgba(255,255,255,0.4)', margin: 0 }}>
              Less friction, more signal. A calmer way to understand what fuels you.
            </p>
          </div>
          <div className="features-grid">
            {features.map((f) => (
              <article key={f.title} className="feature-card">
                <div className="fc-icon" style={{ background: `${f.accent}1a`, color: f.accent }}>
                  <f.icon style={{ width: 20, height: 20 }} />
                </div>
                <h3 className="fc-title">{f.title}</h3>
                <p className="fc-copy">{f.copy}</p>
                <div className="fc-divider" />
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════ IMPACT ════════════ */}
      <section className="impact-section">
        <Atm variant="deep" />
        <div className="impact-inner">
          <span className="section-eyebrow reveal-up">Impact</span>
          <h2 className="section-h2 reveal-up" style={{ maxWidth: 580 }}>Small choices become<br />a more intelligent body.</h2>
          <div className="impact-stats">
            {stats.map((s) => (
              <div key={s.label} className="stat-card">
                <div className="stat-val-row">
                  <span className="stat-number" data-value={s.value}>0</span>
                  <span className="stat-suffix">{s.suffix}</span>
                </div>
                <p className="stat-label">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════ FINAL CTA ════════════ */}
      <section className="final-cta">
        <Atm variant="hero" />
        <div className="cta-glow" aria-hidden="true" />
        {/* Background food image */}
        <div className="cta-bg-img-wrap">
          <img
            src="https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=1400&q=60&auto=format&fit=crop"
            alt=""
            className="cta-bg-img"
            aria-hidden="true"
          />
        </div>
        <div className="final-cta-content">
          <div className="cta-icon-ring">
            <ScanLine style={{ width: 26, height: 26 }} />
          </div>
          <h2 className="cta-h2">Your nutrition,<br />finally intelligent.</h2>
          <p className="cta-p">
            Start with one meal. Build a system that understands your habits, your goals,
            and the future version of you.
          </p>
          <Link to="/login" className="btn-primary" style={{ marginTop: 40, display: 'inline-flex' }}>
            Start Tracking Today <ArrowRight style={{ width: 15, height: 15 }} />
          </Link>
        </div>
      </section>
    </main>
  );
}

/* ─────────────────────────────────────────────
   ATMOSPHERE
───────────────────────────────────────────── */
function Atm({ variant }: { variant: 'hero' | 'soft' | 'deep' }) {
  return (
    <div className={`atm atm-${variant}`} aria-hidden="true">
      <div className="atm-orb atm-orb-a" />
      <div className="atm-orb atm-orb-b" />
    </div>
  );
}

/* ─────────────────────────────────────────────
   DASHBOARD MOCKUP
───────────────────────────────────────────── */
function DashboardMockup() {
  return (
    <div className="dash-mockup">
      <div className="dm-head">
        <div>
          <p className="dm-eyebrow">Today</p>
          <h3 className="dm-title">Nutrition Dashboard</h3>
        </div>
        <span className="dm-live">AI Live</span>
      </div>
      <div className="dm-body">
        <div className="dm-ring-wrap">
          <div className="dm-ring">
            <div style={{ textAlign: 'center' }}>
              <div className="dm-ring-val">742</div>
              <div className="dm-ring-unit">kcal left</div>
            </div>
          </div>
        </div>
        <div className="dm-macros">
          {[
            { label: 'Protein', value: '96g', width: '68%', color: 'rgba(212,212,216,0.75)' },
            { label: 'Carbs', value: '148g', width: '54%', color: 'rgba(245,179,92,0.85)' },
            { label: 'Fat', value: '42g', width: '46%', color: 'rgba(245,179,92,0.5)' },
          ].map((m) => (
            <div key={m.label} className="dm-macro-row">
              <div className="dm-macro-top">
                <span className="dm-macro-name">{m.label}</span>
                <span className="dm-macro-val">{m.value}</span>
              </div>
              <div className="dm-bar">
                <div className="dm-bar-fill" style={{ width: m.width, background: m.color }} />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="dm-footer">
        {['Breakfast parsed', 'Lunch optimized', 'Dinner target'].map((item) => (
          <div key={item} className="dm-footer-cell">
            <p className="dm-footer-label">{item}</p>
            <p className="dm-footer-val">On track</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   CSS
───────────────────────────────────────────── */
const CSS = `
@import url('https://api.fontshare.com/v2/css?f[]=cabinet-grotesk@800,700,500,400&f[]=satoshi@700,500,400&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --amber: #f5b35c;
  --amber-lt: #f4e7d1;
  --blue:  #7dd3fc;
  --bg:    #050506;
  --text:  #f4f1ea;
  --sub:   rgba(244,241,234,0.48);
  --muted: rgba(244,241,234,0.26);
  --card:  rgba(255,255,255,0.04);
  --border: rgba(255,255,255,0.08);
  --font-display: 'Cabinet Grotesk', system-ui, sans-serif;
  --font-body:    'Satoshi', system-ui, sans-serif;
}

body { font-family: var(--font-body); }

/* grain */
.grain-overlay {
  position: fixed; inset: 0; pointer-events: none; z-index: 999; opacity: 0.03;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  background-size: 128px;
}

/* atmosphere */
.atm { position: absolute; inset: 0; pointer-events: none; overflow: hidden; z-index: 0; }
.atm-orb { position: absolute; border-radius: 50%; filter: blur(100px); }
.atm-hero  .atm-orb-a { width:700px;height:700px;left:-140px;top:-80px; background:radial-gradient(circle,rgba(245,179,92,.09) 0%,transparent 70%); }
.atm-hero  .atm-orb-b { width:500px;height:500px;right:-100px;top:15%; background:radial-gradient(circle,rgba(125,211,252,.06) 0%,transparent 70%); }
.atm-soft  .atm-orb-a { width:550px;height:550px;left:35%;top:-120px; background:radial-gradient(circle,rgba(245,179,92,.06) 0%,transparent 70%); }
.atm-soft  .atm-orb-b { width:400px;height:400px;right:-80px;bottom:0; background:radial-gradient(circle,rgba(125,211,252,.04) 0%,transparent 70%); }
.atm-deep  .atm-orb-a { width:640px;height:640px;right:-160px;bottom:-100px; background:radial-gradient(circle,rgba(125,211,252,.055) 0%,transparent 70%); }
.atm-deep  .atm-orb-b { width:400px;height:400px;left:-80px;top:0; background:radial-gradient(circle,rgba(245,179,92,.045) 0%,transparent 70%); }

/* ── NAV ── */
.lp-nav {
  display:flex;align-items:center;justify-content:space-between;
  max-width:1100px;margin:0 auto;
  padding:12px 18px;border-radius:999px;
  border:1px solid var(--border);
  background:rgba(0,0,0,0.3);
  backdrop-filter:blur(24px);
}
.nav-logo { display:flex;align-items:center;gap:10px;text-decoration:none;transition:transform .2s; }
.nav-logo:hover { transform:scale(1.04); }
.nav-logo-icon {
  width:30px;height:30px;border-radius:50%;
  background:rgba(244,231,209,.9);display:flex;align-items:center;justify-content:center;
  color:#000;border:1px solid rgba(245,179,92,.3);
  box-shadow:0 6px 22px rgba(245,196,123,.2);
}
.nav-wordmark { font-family:var(--font-display);font-size:11px;font-weight:800;letter-spacing:.22em;color:rgba(255,255,255,.7);text-transform:uppercase; }
.nav-links { display:flex;gap:26px; }
.nav-links a { font-family:var(--font-body);font-size:12px;font-weight:500;color:rgba(255,255,255,.4);text-decoration:none;transition:color .2s; }
.nav-links a:hover { color:rgba(255,255,255,.86); }
.nav-cta { font-family:var(--font-body);font-size:12px;font-weight:700;color:rgba(255,255,255,.78);padding:8px 18px;border-radius:999px;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.06);text-decoration:none;transition:all .2s; }
.nav-cta:hover { background:rgba(255,255,255,.12);color:#fff; }
@media(max-width:640px){.nav-links{display:none;}}

/* ── HERO ── */
.hero-section { position:relative;overflow:hidden;padding:40px 20px 80px; }
.hero-inner { position:relative;z-index:10;max-width:1100px;margin:0 auto;padding-top:64px;display:grid;gap:48px;align-items:center;grid-template-columns:1fr 1fr; }
@media(max-width:860px){.hero-inner{grid-template-columns:1fr;}.hero-img-col{display:none;}}

.hero-badge { display:inline-flex;align-items:center;gap:8px;padding:8px 16px;border-radius:999px;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.035);font-family:var(--font-body);font-size:10px;font-weight:700;letter-spacing:.28em;text-transform:uppercase;color:rgba(245,179,92,.72);margin-bottom:26px; }
.hero-h1 { font-family:var(--font-display);font-size:clamp(2.8rem,6.5vw,5.6rem);font-weight:800;line-height:1.0;letter-spacing:-.03em;color:#f7f2e8; }
.hero-h1 em { font-style:normal;color:rgba(245,179,92,.92); }
.hero-sub { margin-top:22px;font-size:15px;line-height:1.8;color:var(--sub);font-weight:400;max-width:460px; }
.hero-ctas { display:flex;gap:12px;margin-top:32px;flex-wrap:wrap; }
.hero-insights { display:flex;flex-direction:column;gap:10px;margin-top:28px; }
.insight-chip { display:inline-flex;align-items:center;gap:8px;padding:9px 16px;border-radius:14px;border:1px solid var(--border);background:rgba(255,255,255,.035);font-size:12px;font-weight:500;color:rgba(255,255,255,.72);backdrop-filter:blur(12px);width:fit-content; }
.insight-chip strong { color:var(--text); }

/* hero image */
.hero-img-col { position:relative;z-index:5; }
.hero-img-scene { position:relative;border-radius:28px;overflow:hidden;box-shadow:0 40px 120px rgba(0,0,0,.6);will-change:transform; }
.hero-img { width:100%;height:480px;object-fit:cover;display:block; }
.hero-img-overlay { position:absolute;inset:0;background:linear-gradient(160deg,rgba(5,5,6,.18) 0%,rgba(5,5,6,.08) 40%,rgba(5,5,6,.55) 100%); }
.hero-img-badge {
  position:absolute;bottom:22px;left:20px;
  display:flex;align-items:center;gap:14px;
  padding:14px 18px;border-radius:20px;
  border:1px solid rgba(255,255,255,.12);
  background:rgba(0,0,0,.52);backdrop-filter:blur(18px);
}
.hib-ring { position:relative;display:flex;align-items:center;justify-content:center; }
.hib-pct { position:absolute;font-family:var(--font-display);font-size:13px;font-weight:800;color:#fff; }
.hib-label { font-size:10px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:rgba(255,255,255,.38); }
.hib-val { font-family:var(--font-display);font-size:15px;font-weight:700;color:#fff;margin-top:3px; }

/* hero dashboard strip */
.hero-dashboard { position:relative;z-index:10;max-width:1100px;margin:52px auto 0;padding:0 20px; }
.product-card { border-radius:24px;border:1px solid var(--border);background:var(--card);backdrop-filter:blur(18px);box-shadow:0 30px 90px rgba(0,0,0,.5);padding:14px;overflow:hidden; }

/* buttons */
.btn-primary { display:inline-flex;align-items:center;gap:9px;padding:13px 26px;border-radius:999px;background:var(--amber-lt);color:#000;font-family:var(--font-body);font-size:13px;font-weight:700;text-decoration:none;transition:all .25s;box-shadow:0 14px 44px rgba(0,0,0,.3); }
.btn-primary:hover { background:#fde68a;box-shadow:0 20px 60px rgba(245,196,123,.35);transform:translateY(-2px); }
.btn-secondary { display:inline-flex;align-items:center;gap:9px;padding:13px 26px;border-radius:999px;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.04);color:rgba(255,255,255,.72);font-family:var(--font-body);font-size:13px;font-weight:600;text-decoration:none;transition:all .25s;backdrop-filter:blur(12px); }
.btn-secondary:hover { background:rgba(255,255,255,.09);color:#fff; }

/* ── TICKER ── */
.ticker-wrap { overflow:hidden;border-top:1px solid var(--border);border-bottom:1px solid var(--border);background:rgba(255,255,255,.018);padding:14px 0; }
.ticker-track { display:flex;gap:0;animation:ticker-scroll 28s linear infinite;width:max-content; }
.ticker-track:hover { animation-play-state:paused; }
.ticker-item { display:inline-flex;align-items:center;gap:10px;padding:0 36px;font-family:var(--font-display);font-size:12px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:rgba(255,255,255,.3);white-space:nowrap; }
@keyframes ticker-scroll { from{transform:translateX(0)} to{transform:translateX(-50%)} }

/* ── LOGGING ── */
.logging-section { position:relative;overflow:hidden;background:#070807;padding:100px 20px; }
.logging-inner { position:relative;z-index:1;max-width:1100px;margin:0 auto;display:grid;gap:60px;align-items:start;grid-template-columns:1fr 1.2fr; }
@media(max-width:860px){.logging-inner{grid-template-columns:1fr;}}

.logging-img-scene { position:relative;border-radius:24px;overflow:hidden;box-shadow:0 30px 80px rgba(0,0,0,.5);will-change:transform; }
.logging-img { width:100%;height:560px;object-fit:cover;display:block; }
.logging-img-overlay { position:absolute;inset:0;background:linear-gradient(to bottom,rgba(7,8,7,.1),rgba(7,8,7,.5)); }
.logging-img-tag { position:absolute;top:18px;left:18px;display:flex;align-items:center;gap:7px;padding:8px 14px;border-radius:10px;border:1px solid rgba(255,255,255,.1);background:rgba(0,0,0,.48);backdrop-filter:blur(12px);font-size:11px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:rgba(255,255,255,.55); }

.logging-right { display:flex;flex-direction:column;gap:0; }

/* ── SECTION SHARED ── */
.section-eyebrow { display:block;font-family:var(--font-body);font-size:10px;font-weight:700;letter-spacing:.32em;text-transform:uppercase;color:rgba(245,179,92,.55);margin-bottom:16px; }
.section-h2 { font-family:var(--font-display);font-size:clamp(1.9rem,4vw,3.2rem);font-weight:800;line-height:1.06;color:#f6f0e6; }
.section-p { margin-top:16px;max-width:440px;font-size:14px;line-height:1.8;color:var(--sub); }

/* ── LOGGER CARD ── */
.logger-card { margin-top:32px;border-radius:22px;border:1px solid var(--border);background:rgba(13,15,14,.85);padding:22px;backdrop-filter:blur(18px);box-shadow:0 24px 70px rgba(0,0,0,.4); }
.logger-header { display:flex;align-items:center;justify-content:space-between;margin-bottom:18px; }
.logger-title-row { display:flex;align-items:center;gap:11px; }
.logger-icon { width:34px;height:34px;border-radius:11px;background:rgba(244,231,209,.9);display:flex;align-items:center;justify-content:center;color:#000; }
.logger-name { font-family:var(--font-display);font-size:13px;font-weight:700;color:rgba(255,255,255,.85); }
.logger-sub { font-size:11px;color:rgba(255,255,255,.3);margin-top:2px; }
.logger-live-badge { font-size:10px;font-weight:700;padding:5px 12px;border-radius:999px;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.04);color:rgba(255,255,255,.42); }
.logger-input-box { border-radius:16px;border:1px solid rgba(255,255,255,.08);background:rgba(0,0,0,.22);padding:18px;margin-bottom:12px; }
.logger-input-label { font-size:10px;font-weight:700;letter-spacing:.22em;text-transform:uppercase;color:rgba(255,255,255,.26);margin-bottom:10px; }
.logger-typed { font-family:'DM Mono',monospace;font-size:16px;font-weight:600;color:rgba(255,255,255,.88);min-height:26px;display:flex;align-items:center; }
.typed-cursor { border-right:2px solid rgba(245,179,92,.75);padding-right:2px; }
.logger-process-box { border-radius:16px;border:1px solid rgba(255,255,255,.07);background:rgba(255,255,255,.025);padding:16px;margin-bottom:12px; }
.logger-process-labels { display:flex;justify-content:space-between;font-size:10px;font-weight:700;letter-spacing:.2em;text-transform:uppercase;color:rgba(255,255,255,.34);margin-bottom:10px; }
.logger-bar-track { height:5px;border-radius:999px;background:rgba(255,255,255,.07);overflow:hidden; }
.processing-line { height:100%;border-radius:999px;background:linear-gradient(90deg,rgba(245,179,92,.9),rgba(251,146,60,.75),rgba(125,211,252,.6)); }

.macro-grid { display:grid;grid-template-columns:repeat(2,1fr);gap:10px; }
.macro-card { border-radius:16px;border:1px solid rgba(255,255,255,.07);background:rgba(255,255,255,.035);padding:14px; }
.mc-top { display:flex;align-items:center;justify-content:space-between;margin-bottom:10px; }
.mc-label { font-size:11px;font-weight:600;color:rgba(255,255,255,.78); }
.mc-val-row { display:flex;align-items:baseline;gap:4px;margin-bottom:12px; }
.mc-val { font-family:var(--font-display);font-size:26px;font-weight:800; }
.mc-unit { font-size:11px;color:var(--muted); }
.mc-bar { height:4px;border-radius:999px;background:rgba(255,255,255,.08);overflow:hidden; }
.mc-fill { height:100%;border-radius:999px;background:rgba(255,255,255,.5); }

/* ── DASHBOARD SECTION ── */
.dashboard-section { position:relative;overflow:hidden;background:#050606;padding:100px 20px; }
.dashboard-inner { position:relative;z-index:1;max-width:1100px;margin:0 auto; }
.dashboard-intro { margin-bottom:40px; }
.dashboard-grid { display:grid;gap:16px;grid-template-columns:1.4fr .9fr .9fr; }
@media(max-width:900px){.dashboard-grid{grid-template-columns:1fr;}}

.dash-goal-card { border-radius:22px;border:1px solid var(--border);background:#0e1110;padding:26px; }
.dgc-num { font-family:var(--font-display);font-size:50px;font-weight:800;color:#fff;margin-top:20px; }
.dgc-sub { font-size:13px;color:rgba(255,255,255,.38);margin-top:8px;line-height:1.6; }
.dgc-list { margin-top:24px;display:flex;flex-direction:column;gap:10px; }
.dgc-item { display:flex;align-items:center;gap:12px;border-radius:16px;border:1px solid rgba(255,255,255,.06);background:rgba(255,255,255,.035);padding:12px 14px; }
.dgc-bullet { width:28px;height:28px;border-radius:50%;background:rgba(244,231,209,.9);display:flex;align-items:center;justify-content:center;font-family:var(--font-display);font-size:11px;font-weight:800;color:#000;flex-shrink:0; }
.dgc-text { font-size:13px;font-weight:500;color:rgba(255,255,255,.68); }

.dash-pattern-card { border-radius:22px;border:1px solid var(--border);background:var(--card);padding:0;overflow:hidden; }
.dpc-img-wrap { height:160px;overflow:hidden; }
.dpc-img { width:100%;height:100%;object-fit:cover;filter:saturate(.72);transition:transform .6s ease; }
.dash-pattern-card:hover .dpc-img { transform:scale(1.05); }
.dpc-title { font-family:var(--font-display);font-size:18px;font-weight:800;color:#fff;margin-top:14px;padding:0 20px; }
.dpc-copy { font-size:12px;line-height:1.7;color:rgba(255,255,255,.4);margin-top:10px;padding:0 20px 20px; }

/* ── DASHBOARD MOCKUP ── */
.dash-mockup { border-radius:18px;border:1px solid rgba(255,255,255,.055);background:#0b0d0c;padding:18px; }
.dm-head { display:flex;align-items:center;justify-content:space-between;margin-bottom:18px; }
.dm-eyebrow { font-size:9px;font-weight:700;letter-spacing:.24em;text-transform:uppercase;color:rgba(255,255,255,.26); }
.dm-title { margin-top:5px;font-family:var(--font-display);font-size:16px;font-weight:800;color:rgba(255,255,255,.9); }
.dm-live { font-size:9px;font-weight:700;letter-spacing:.14em;padding:5px 11px;border-radius:999px;background:rgba(245,179,92,.85);color:#000; }
.dm-body { display:grid;gap:12px;grid-template-columns:.9fr 1.1fr; }
@media(max-width:440px){.dm-body{grid-template-columns:1fr;}}
.dm-ring-wrap { border-radius:16px;border:1px solid rgba(255,255,255,.055);background:rgba(255,255,255,.03);padding:18px;display:flex;align-items:center;justify-content:center; }
.dm-ring { position:relative;width:120px;height:120px;border-radius:50%;border:12px solid rgba(255,255,255,.07);display:flex;align-items:center;justify-content:center; }
.dm-ring::after { content:'';position:absolute;inset:-12px;border-radius:50%;border:12px solid transparent;border-top-color:rgba(245,179,92,.9);border-right-color:rgba(245,179,92,.9);border-bottom-color:rgba(245,179,92,.38);transform:rotate(-8deg); }
.dm-ring-val { font-family:var(--font-display);font-size:30px;font-weight:800;color:#fff; }
.dm-ring-unit { font-size:9px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:rgba(255,255,255,.3); }
.dm-macros { display:flex;flex-direction:column;gap:9px; }
.dm-macro-row { border-radius:14px;border:1px solid rgba(255,255,255,.045);background:rgba(255,255,255,.03);padding:11px 13px; }
.dm-macro-top { display:flex;justify-content:space-between;margin-bottom:9px;font-size:11px; }
.dm-macro-name { font-weight:600;color:rgba(255,255,255,.8); }
.dm-macro-val { font-weight:500;color:rgba(255,255,255,.38); }
.dm-bar { height:4px;border-radius:999px;background:rgba(255,255,255,.07);overflow:hidden; }
.dm-bar-fill { height:100%;border-radius:999px; }
.dm-footer { display:grid;grid-template-columns:repeat(3,1fr);gap:9px;margin-top:12px; }
.dm-footer-cell { border-radius:13px;border:1px solid rgba(255,255,255,.045);background:rgba(255,255,255,.025);padding:11px; }
.dm-footer-label { font-size:9px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:rgba(255,255,255,.24); }
.dm-footer-val { margin-top:5px;font-family:var(--font-display);font-size:12px;font-weight:700;color:rgba(255,255,255,.78); }

/* ── FEATURES ── */
.features-section { position:relative;overflow:hidden;background:#080908;padding:100px 20px; }
.features-inner { position:relative;z-index:1;max-width:1100px;margin:0 auto; }
.features-head { display:flex;justify-content:space-between;align-items:flex-end;gap:24px;margin-bottom:40px;flex-wrap:wrap; }
.features-grid { display:grid;gap:14px;grid-template-columns:repeat(3,1fr); }
@media(max-width:860px){.features-grid{grid-template-columns:repeat(2,1fr);}}
@media(max-width:540px){.features-grid{grid-template-columns:1fr;}}

.feature-card { border-radius:20px;border:1px solid rgba(255,255,255,.075);background:rgba(255,255,255,.032);padding:24px;min-height:210px;backdrop-filter:blur(12px);transition:border-color .3s,background .3s,transform .3s,box-shadow .3s;cursor:default; }
.feature-card:hover { border-color:rgba(255,255,255,.14);background:rgba(255,255,255,.052);transform:translateY(-6px);box-shadow:0 18px 44px rgba(0,0,0,.3); }
.fc-icon { width:42px;height:42px;border-radius:13px;display:flex;align-items:center;justify-content:center;margin-bottom:20px;transition:transform .3s; }
.feature-card:hover .fc-icon { transform:scale(1.1) rotate(5deg); }
.fc-title { font-family:var(--font-display);font-size:16px;font-weight:800;color:rgba(255,255,255,.88); }
.fc-copy { margin-top:10px;font-size:13px;line-height:1.75;color:rgba(255,255,255,.4); }
.fc-divider { margin-top:20px;height:1px;background:linear-gradient(90deg,rgba(255,255,255,.1),transparent); }

/* ── IMPACT ── */
.impact-section { position:relative;overflow:hidden;background:#050606;padding:100px 20px; }
.impact-inner { position:relative;z-index:1;max-width:1100px;margin:0 auto; }
.impact-stats { display:grid;gap:14px;grid-template-columns:repeat(4,1fr);margin-top:44px; }
@media(max-width:660px){.impact-stats{grid-template-columns:repeat(2,1fr);}}
.stat-card { border-radius:20px;border:1px solid rgba(255,255,255,.075);background:rgba(255,255,255,.032);padding:24px;backdrop-filter:blur(12px); }
.stat-val-row { display:flex;align-items:baseline;gap:4px; }
.stat-number { font-family:var(--font-display);font-size:38px;font-weight:800;color:#fff; }
.stat-suffix { font-family:var(--font-display);font-size:20px;font-weight:800;color:rgba(245,179,92,.82); }
.stat-label { margin-top:12px;font-size:10px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:rgba(255,255,255,.32); }

/* ── FINAL CTA ── */
.final-cta { position:relative;overflow:hidden;background:#030303;min-height:75vh;display:flex;align-items:center;justify-content:center;padding:100px 20px;text-align:center; }
.cta-bg-img-wrap { position:absolute;inset:0;z-index:0; }
.cta-bg-img { width:100%;height:100%;object-fit:cover;opacity:.06;filter:saturate(.5); }
.cta-glow { position:absolute;inset-x:0;bottom:0;height:200px;background:linear-gradient(to top,rgba(245,179,92,.06),transparent);pointer-events:none;z-index:1; }
.final-cta-content { position:relative;z-index:2;max-width:680px;margin:0 auto; }
.cta-icon-ring { width:62px;height:62px;border-radius:50%;background:rgba(244,231,209,.9);display:flex;align-items:center;justify-content:center;color:#000;margin:0 auto 28px;box-shadow:0 18px 60px rgba(0,0,0,.4);border:1px solid rgba(245,179,92,.2); }
.cta-h2 { font-family:var(--font-display);font-size:clamp(2.2rem,5vw,4rem);font-weight:800;line-height:1.04;color:#f6f0e6; }
.cta-p { margin:20px auto 0;max-width:420px;font-size:15px;line-height:1.8;color:var(--sub); }
`;