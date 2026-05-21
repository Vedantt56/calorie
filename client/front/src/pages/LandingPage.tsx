import { useEffect, useRef, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import {
  Activity,
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

const features = [
  {
    icon: Brain,
    title: 'AI Food Recognition',
    copy: 'Turn everyday meals into structured calories and macros with AI-assisted interpretation.',
    accent: 'from-amber-100 to-stone-200',
  },
  {
    icon: Sparkles,
    title: 'Natural Language Logging',
    copy: 'Write meals the way you speak. CalTrack translates rough portions into clean nutrition data.',
    accent: 'from-orange-100 to-stone-200',
  },
  {
    icon: BarChart3,
    title: 'Smart Macro Tracking',
    copy: 'Stay aligned with protein, carbs, fats, and calorie goals through live daily feedback.',
    accent: 'from-cyan-100 to-zinc-200',
  },
  {
    icon: Target,
    title: 'Personalized Goals',
    copy: 'Build calorie targets around your body, routine, pace, and nutrition preferences.',
    accent: 'from-rose-100 to-stone-200',
  },
  {
    icon: Timer,
    title: 'Fast Meal Tracking',
    copy: 'Log in seconds, reduce friction, and keep the habit alive without manual searching.',
    accent: 'from-yellow-100 to-zinc-200',
  },
  {
    icon: LineChart,
    title: 'Beautiful Analytics',
    copy: 'See patterns across meals, macros, calories, and streaks in a polished health dashboard.',
    accent: 'from-violet-100 to-stone-200',
  },
];

const macroCards = [
  { label: 'Calories', value: '542', unit: 'kcal', color: 'text-amber-100', width: '72%' },
  { label: 'Protein', value: '28', unit: 'g', color: 'text-stone-100', width: '64%' },
  { label: 'Carbs', value: '61', unit: 'g', color: 'text-amber-100', width: '78%' },
  { label: 'Fat', value: '18', unit: 'g', color: 'text-zinc-100', width: '46%' },
];

const stats = [
  { value: 2.4, suffix: 'M+', label: 'calories tracked' },
  { value: 184, suffix: 'K+', label: 'meals logged' },
  { value: 8, suffix: 'min', label: 'saved each day' },
  { value: 94, suffix: '%', label: 'macro confidence' },
];

export default function LandingPage() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;

    const lenis = new Lenis({
      duration: 1.12,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    const raf = (time: number) => {
      lenis.raf(time);
      requestAnimationFrame(raf);
    };
    const frame = requestAnimationFrame(raf);
    lenis.on('scroll', ScrollTrigger.update);

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.hero-word',
        { y: 72, opacity: 0, filter: 'blur(18px)' },
        { y: 0, opacity: 1, filter: 'blur(0px)', duration: 1.15, stagger: 0.08, ease: 'power4.out' },
      );

      gsap.to('.hero-scale', {
        scale: 0.72,
        y: -90,
        opacity: 0.28,
        ease: 'none',
        scrollTrigger: {
          trigger: '.landing-hero',
          start: 'top top',
          end: 'bottom top',
          scrub: 1,
        },
      });

      gsap.to('.hero-dashboard', {
        y: -120,
        rotateX: 0,
        scale: 1,
        opacity: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: '.landing-hero',
          start: '20% top',
          end: 'bottom top',
          scrub: 1,
        },
      });

      gsap.utils.toArray<HTMLElement>('.float-layer').forEach((layer, index) => {
        gsap.to(layer, {
          y: index % 2 === 0 ? -90 : 120,
          x: index % 2 === 0 ? 40 : -30,
          ease: 'none',
          scrollTrigger: {
            trigger: '.landing-hero',
            start: 'top top',
            end: 'bottom top',
            scrub: 1.4,
          },
        });
      });

      gsap.utils.toArray<HTMLElement>('.story-pin').forEach((section) => {
        ScrollTrigger.create({
          trigger: section,
          start: 'top top',
          end: '+=82%',
          pin: section.querySelector('.pin-stage'),
          scrub: 1.15,
        });
      });

      gsap.fromTo(
        '.typed-meal',
        { width: '0ch' },
        {
          width: '24ch',
          ease: 'steps(24)',
          scrollTrigger: {
            trigger: '.logging-section',
            start: 'top top',
            end: '35% top',
            scrub: 1,
          },
        },
      );

      gsap.fromTo(
        '.processing-line',
        { scaleX: 0, transformOrigin: 'left' },
        {
          scaleX: 1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '.logging-section',
            start: '18% top',
            end: '48% top',
            scrub: 1,
          },
        },
      );

      gsap.fromTo(
        '.macro-card',
        { y: 90, opacity: 0, scale: 0.9 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          stagger: 0.08,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.logging-section',
            start: '38% top',
            end: '82% top',
            scrub: 1,
          },
        },
      );

      gsap.to('.dashboard-strip', {
        xPercent: -32,
        ease: 'none',
        scrollTrigger: {
          trigger: '.dashboard-section',
          start: 'top top',
          end: '+=92%',
          scrub: 1.15,
        },
      });

      gsap.fromTo(
        '.dash-panel',
        { y: 80, opacity: 0, scale: 0.92 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          stagger: 0.12,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.dashboard-section',
            start: 'top 30%',
            end: '70% top',
            scrub: 1,
          },
        },
      );

      gsap.utils.toArray<HTMLElement>('.feature-card').forEach((card, index) => {
        gsap.fromTo(
          card,
          { y: 90 + index * 12, scale: 0.92, opacity: 0 },
          {
            y: 0,
            scale: 1,
            opacity: 1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: card,
              start: 'top 96%',
              end: 'top 68%',
              scrub: 1,
            },
          },
        );
      });

      gsap.utils.toArray<HTMLElement>('.stat-number').forEach((stat) => {
        const target = Number(stat.dataset.value || 0);
        const decimals = target % 1 === 0 ? 0 : 1;
        const counter = { value: 0 };
        gsap.to(counter, {
          value: target,
          duration: 1.4,
          ease: 'power2.out',
          onUpdate: () => {
            stat.textContent = counter.value.toFixed(decimals);
          },
          scrollTrigger: {
            trigger: stat,
            start: 'top 86%',
            once: true,
          },
        });
      });

      gsap.fromTo(
        '.final-cta-content',
        { y: 80, opacity: 0, scale: 0.95 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          ease: 'power4.out',
          scrollTrigger: {
            trigger: '.final-cta',
            start: 'top 55%',
            end: 'top 10%',
            scrub: 1,
          },
        },
      );
    }, rootRef);

    return () => {
      ctx.revert();
      lenis.destroy();
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <main ref={rootRef} className="caltrack-landing min-h-screen overflow-hidden bg-[#050506] text-[#f4f1ea] selection:bg-amber-200 selection:text-black">
      <HeroSection />
      <LoggingShowcase />
      <DashboardPreview />
      <FeatureHighlights />
      <ImpactSection />
      <FinalCta />
    </main>
  );
}

function HeroSection() {
  return (
    <section className="landing-hero relative min-h-[125svh] overflow-hidden px-5 pt-5 md:px-8">
      <Atmosphere intensity="hero" />
      <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-black/70 to-transparent" />

      <nav className="relative z-20 mx-auto flex max-w-6xl items-center justify-between rounded-full border border-white/[0.08] bg-black/20 px-3.5 py-2.5 backdrop-blur-2xl md:px-4">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-amber-100/25 bg-amber-100/85 text-black shadow-[0_10px_34px_rgba(245,196,123,0.16)]">
            <Flame className="h-4 w-4" />
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/82">CALTRACK</span>
        </Link>
        <div className="hidden items-center gap-7 text-xs font-medium text-white/45 md:flex">
          <a href="#ai-logging" className="transition hover:text-white">AI Logging</a>
          <a href="#dashboard" className="transition hover:text-white">Dashboard</a>
          <a href="#features" className="transition hover:text-white">Features</a>
        </div>
        <Link
          to="/login"
          className="rounded-full border border-white/10 bg-white/[0.08] px-4 py-2 text-xs font-semibold text-white/86 transition hover:bg-white/[0.14] hover:text-white"
        >
          Login
        </Link>
      </nav>

      <div className="hero-scale relative z-10 mx-auto flex min-h-[74svh] max-w-6xl flex-col items-start justify-center pt-10 text-left">
        <div className="scene-focal absolute left-1/2 top-1/2 -z-10 h-[38rem] w-[38rem] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-80 blur-3xl" />
        <HeroVisualSystem />
        <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.035] px-3.5 py-2 text-[10px] font-semibold uppercase tracking-[0.26em] text-amber-100/70 backdrop-blur-xl">
          <Sparkles className="h-3.5 w-3.5" />
          Intelligent nutrition system
        </div>
        <h1 className="max-w-4xl overflow-hidden text-4xl font-semibold leading-[1.02] tracking-normal text-[#f7f2e8] md:text-6xl lg:text-7xl">
          <span className="hero-word inline-block">Understand</span>{' '}
          <span className="hero-word inline-block">your body.</span>{' '}
          <span className="hero-word inline-block text-amber-100/90">Eat with precision.</span>
        </h1>
        <p className="hero-word mt-7 max-w-xl text-base font-normal leading-7 text-white/54 md:text-lg">
          CalTrack turns everyday meals into intelligent decisions, helping you build effortless habits,
          clearer energy, and a nutrition rhythm that actually fits modern life.
        </p>
        <div className="hero-word mt-9 flex flex-col gap-3 sm:flex-row">
          <Link
            to="/login"
            className="group inline-flex items-center justify-center gap-2 rounded-full bg-[#f4e7d1] px-6 py-3.5 text-sm font-semibold text-black shadow-[0_18px_60px_rgba(0,0,0,0.28)] transition hover:bg-amber-100"
          >
            Get Started
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
          </Link>
          <Link
            to="/register"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-white/[0.09] bg-white/[0.035] px-6 py-3.5 text-sm font-semibold text-white/78 backdrop-blur-xl transition hover:bg-white/[0.08] hover:text-white"
          >
            <Play className="h-4 w-4 fill-white/80" />
            Try Demo
          </Link>
        </div>
      </div>

      <div className="hero-dashboard pointer-events-none relative z-10 mx-auto -mt-24 grid max-w-5xl gap-4 opacity-0 [transform:perspective(1200px)_rotateX(24deg)_scale(.86)] md:grid-cols-[1.18fr_.82fr]">
        <div className="product-render rounded-[1.5rem] border border-white/[0.08] bg-white/[0.045] p-3 shadow-[0_34px_120px_rgba(0,0,0,0.55)] backdrop-blur-2xl">
          <DashboardMockup />
        </div>
        <div className="grid gap-4">
          <FloatingInsight title="Meal signal" value="2 eggs + rice" meta="Macro profile generated" icon={<Utensils className="h-5 w-5" />} />
          <FloatingInsight title="Body target" value="1,458 kcal left" meta="Adaptive pace for today" icon={<Target className="h-5 w-5" />} />
        </div>
      </div>

      <div className="float-layer absolute left-8 top-[35%] hidden rounded-2xl border border-white/[0.07] bg-white/[0.035] p-3 backdrop-blur-xl md:block">
        <div className="h-1.5 w-20 rounded-full bg-white/36" />
        <div className="mt-3 h-1.5 w-12 rounded-full bg-white/14" />
      </div>
      <div className="float-layer absolute right-10 top-[45%] hidden rounded-2xl border border-white/[0.08] bg-white/[0.04] p-4 backdrop-blur-xl lg:block">
        <Activity className="mb-4 h-5 w-5 text-amber-100/75" />
        <div className="text-xl font-semibold">94%</div>
        <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/38">accuracy</div>
      </div>
    </section>
  );
}

function Atmosphere({ intensity }: { intensity: 'hero' | 'soft' | 'deep' }) {
  return (
    <div className={`atmosphere atmosphere-${intensity}`} aria-hidden="true">
      <div className="mesh-field" />
      <div className="light-field light-field-a" />
      <div className="light-field light-field-b" />
      <div className="depth-fog" />
      <div className="ambient-particles" />
      <div className="cinematic-vignette" />
    </div>
  );
}

function HeroVisualSystem() {
  return (
    <div className="hero-visual-system" aria-hidden="true">
      <div className="nutrition-planet">
        <img src="/assets/img/healthy_meal_bowl.png" alt="" />
        <div className="scan-ring scan-ring-one" />
        <div className="scan-ring scan-ring-two" />
        <div className="scan-beam" />
      </div>
      <div className="energy-ribbon energy-ribbon-one" />
      <div className="energy-ribbon energy-ribbon-two" />
      <div className="data-constellation">
        <span />
        <span />
        <span />
        <span />
      </div>
    </div>
  );
}

function LoggingShowcase() {
  return (
    <section id="ai-logging" className="logging-section story-pin relative min-h-[185svh] bg-[#070807]">
      <div className="pin-stage flex min-h-screen items-center px-5 py-14 md:px-8">
        <Atmosphere intensity="soft" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-16 lg:grid-cols-[0.82fr_1.18fr]">
          <div className="self-start pt-12 lg:pt-20">
            <p className="mb-5 text-[11px] font-semibold uppercase tracking-[0.32em] text-amber-100/58">AI food logging</p>
            <h2 className="max-w-lg text-3xl font-semibold leading-[1.08] tracking-normal text-[#f6f0e6] md:text-5xl">
              Nutrition clarity, without the spreadsheet.
            </h2>
            <p className="mt-6 max-w-md text-base leading-7 text-white/48">
              Speak naturally. CalTrack interprets the meal, estimates the nutrition, and gives your day a
              sharper signal without forcing you into manual food databases.
            </p>
          </div>

          <div className="relative">
            <div className="nutrition-landscape" aria-hidden="true">
              <img src="/assets/img/fresh_ingredients.png" alt="" />
              <div className="landscape-scan" />
            </div>
            <img
              src="/assets/img/fresh_ingredients.png"
              alt=""
              className="absolute -right-12 -top-20 h-56 w-56 rounded-[1.5rem] object-cover opacity-10 blur-[2px] saturate-[0.72]"
            />
            <div className="product-render relative rounded-[1.5rem] border border-white/[0.08] bg-[#0d0f0e]/78 p-4 shadow-[0_30px_100px_rgba(0,0,0,0.45)] backdrop-blur-2xl md:p-6">
              <div className="mb-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-amber-100/25 bg-amber-100/85 text-black">
                    <Zap className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-white/86">Smart Logger</p>
                    <p className="text-xs font-medium text-white/36">Natural language input</p>
                  </div>
                </div>
                <span className="rounded-full border border-white/[0.08] bg-white/[0.035] px-3 py-1.5 text-[11px] font-medium text-white/46">Live</span>
              </div>

              <div className="rounded-[1.25rem] border border-white/[0.08] bg-black/20 p-5">
                <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/32">I ate</p>
                <div className="flex min-h-10 items-center overflow-hidden font-mono text-lg font-semibold text-white/90 md:text-xl">
                  <span className="typed-meal inline-block max-w-fit overflow-hidden whitespace-nowrap border-r border-amber-100/70 pr-1">
                    2 eggs and 1 bowl rice
                  </span>
                </div>
              </div>

              <div className="mt-4 rounded-[1.25rem] border border-white/[0.07] bg-white/[0.025] p-5">
                <div className="mb-3 flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.2em] text-white/38">
                  <span>AI processing</span>
                  <span>Macros found</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.08]">
                  <div className="processing-line h-full rounded-full bg-gradient-to-r from-amber-100/90 via-orange-100/75 to-cyan-100/58" />
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {macroCards.map((item) => (
                  <div key={item.label} className="macro-card rounded-[1.25rem] border border-white/[0.07] bg-white/[0.035] p-4 opacity-0">
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-sm font-semibold text-white/82">{item.label}</p>
                      <Check className={`h-4 w-4 ${item.color}`} />
                    </div>
                    <div className="flex items-end gap-1">
                      <span className={`text-3xl font-semibold ${item.color}`}>{item.value}</span>
                      <span className="pb-1 text-xs font-medium text-white/38">{item.unit}</span>
                    </div>
                    <div className="mt-4 h-1 overflow-hidden rounded-full bg-white/[0.08]">
                      <div className="h-full rounded-full bg-white/58" style={{ width: item.width }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function DashboardPreview() {
  return (
    <section id="dashboard" className="dashboard-section story-pin relative min-h-[195svh] bg-[#050606]">
      <div className="pin-stage flex min-h-screen flex-col justify-center overflow-hidden px-5 py-12 md:px-8">
        <Atmosphere intensity="deep" />
        <div className="mx-auto mb-7 w-full max-w-6xl">
          <p className="mb-5 text-[11px] font-semibold uppercase tracking-[0.32em] text-stone-200/48">Smart dashboard</p>
          <h2 className="max-w-3xl text-3xl font-semibold leading-[1.08] tracking-normal text-[#f6f0e6] md:text-5xl">
            A living model of your daily nutrition.
          </h2>
          <p className="mt-4 max-w-xl text-base leading-7 text-white/45">
            CalTrack converts meals, goals, and patterns into a clean feedback system for better decisions.
          </p>
        </div>
        <div className="dashboard-strip flex w-[180vw] gap-5 pl-[max(1.25rem,calc((100vw-72rem)/2))]">
          <div className="dash-panel product-render w-[74vw] max-w-3xl shrink-0 rounded-[1.5rem] border border-white/[0.08] bg-white/[0.04] p-4 shadow-[0_30px_100px_rgba(0,0,0,0.35)] backdrop-blur-2xl md:p-5">
            <DashboardMockup />
          </div>
          <div className="dash-panel product-render w-[70vw] max-w-lg shrink-0 rounded-[1.5rem] border border-white/[0.08] bg-[#0e1110] p-6 shadow-[0_30px_90px_rgba(0,0,0,0.35)]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-amber-100/52">Personal target</p>
            <div className="mt-8 text-6xl font-semibold tracking-normal text-white">2,180</div>
            <p className="mt-2 text-sm text-white/42">kcal daily goal calibrated from profile data</p>
            <div className="mt-8 space-y-3">
              {['Protein priority', 'Balanced carbs', 'Sustainable deficit'].map((item, index) => (
                <div key={item} className="flex items-center gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.035] p-4">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100/85 text-xs font-semibold text-black">
                    {index + 1}
                  </span>
                  <span className="text-sm font-medium text-white/72">{item}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="dash-panel product-render w-[70vw] max-w-lg shrink-0 overflow-hidden rounded-[1.5rem] border border-white/[0.08] bg-white/[0.04] p-5 backdrop-blur-2xl">
            <img src="/assets/img/healthy_meal_bowl.png" alt="" className="h-44 w-full rounded-[1.25rem] object-cover opacity-80 saturate-[0.82]" />
            <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.24em] text-amber-100/52">Meal history</p>
            <h3 className="mt-4 text-3xl font-semibold tracking-normal text-white">Patterns that get smarter each week.</h3>
            <p className="mt-4 text-sm leading-7 text-white/45">CalTrack learns from logged food to make future insights faster and more personal.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function FeatureHighlights() {
  return (
    <section id="features" className="relative bg-[#080908] px-5 py-20 md:px-8 md:py-24">
      <Atmosphere intensity="soft" />
      <div className="mx-auto max-w-6xl">
        <div className="mb-9 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="mb-5 text-[11px] font-semibold uppercase tracking-[0.32em] text-amber-100/52">Feature system</p>
            <h2 className="max-w-2xl text-3xl font-semibold leading-[1.08] tracking-normal text-[#f6f0e6] md:text-5xl">
              Built for the rituals that change you.
            </h2>
          </div>
          <p className="max-w-sm text-base leading-7 text-white/45">
            Less friction, more signal. A calmer way to understand what fuels you and what holds you back.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {features.map((feature) => (
            <article
              key={feature.title}
              className="feature-card group min-h-56 rounded-[1.35rem] border border-white/[0.075] bg-white/[0.032] p-6 opacity-0 backdrop-blur-xl transition duration-500 hover:-translate-y-1.5 hover:border-white/16 hover:bg-white/[0.052]"
            >
              <div className={`mb-6 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${feature.accent} text-black shadow-[0_16px_42px_rgba(0,0,0,0.22)]`}>
                <feature.icon className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-semibold tracking-normal text-white/90">{feature.title}</h3>
              <p className="mt-4 text-sm leading-7 text-white/43">{feature.copy}</p>
              <div className="mt-6 h-px w-full bg-gradient-to-r from-white/14 to-transparent" />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function ImpactSection() {
  return (
    <section className="relative overflow-hidden bg-[#050606] px-5 py-20 md:px-8 md:py-28">
      <Atmosphere intensity="deep" />
      <div className="relative mx-auto max-w-6xl">
        <p className="mb-5 text-[11px] font-semibold uppercase tracking-[0.32em] text-stone-200/48">Impact</p>
        <h2 className="max-w-3xl text-3xl font-semibold leading-[1.08] tracking-normal text-[#f6f0e6] md:text-5xl">
          Small choices become a more intelligent body.
        </h2>
        <div className="mt-10 grid gap-4 md:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-[1.35rem] border border-white/[0.075] bg-white/[0.032] p-6 backdrop-blur-xl">
              <div className="flex items-baseline gap-1">
                <span className="stat-number text-4xl font-semibold tracking-normal text-white" data-value={stat.value}>0</span>
                <span className="text-xl font-semibold text-amber-100/82">{stat.suffix}</span>
              </div>
              <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/36">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="final-cta relative flex min-h-screen items-center justify-center overflow-hidden bg-[#030303] px-5 py-24 text-center md:px-8">
      <Atmosphere intensity="hero" />
      <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-amber-100/[0.05] to-transparent" />
      <div className="final-cta-content relative mx-auto max-w-4xl">
        <div className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-full border border-amber-100/20 bg-amber-100/85 text-black shadow-[0_22px_80px_rgba(0,0,0,0.4)]">
          <ScanLine className="h-7 w-7" />
        </div>
        <h2 className="text-4xl font-semibold leading-[1.04] tracking-normal text-[#f6f0e6] md:text-6xl">
          Your nutrition, finally intelligent.
        </h2>
        <p className="mx-auto mt-7 max-w-xl text-base leading-7 text-white/48">
          Start with one meal. Build a system that understands your habits, your goals, and the future version of you.
        </p>
        <Link
          to="/login"
          className="mt-10 inline-flex items-center justify-center gap-2 rounded-full bg-[#f4e7d1] px-7 py-3.5 text-sm font-semibold text-black transition hover:bg-amber-100"
        >
          Start Tracking Today
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}

function DashboardMockup() {
  return (
    <div className="rounded-[1.25rem] border border-white/[0.055] bg-[#0b0d0c] p-4 md:p-5">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/30">Today</p>
          <h3 className="mt-2 text-xl font-semibold tracking-normal text-white/90">Nutrition Dashboard</h3>
        </div>
        <span className="rounded-full border border-amber-100/25 bg-amber-100/80 px-3 py-1.5 text-[10px] font-semibold text-black">AI Live</span>
      </div>
      <div className="grid gap-4 md:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-2xl border border-white/[0.055] bg-white/[0.035] p-5">
          <div className="relative mx-auto flex h-40 w-40 items-center justify-center rounded-full border-[14px] border-white/[0.08]">
            <div className="absolute inset-[-14px] rounded-full border-[14px] border-amber-100/80 border-b-transparent border-r-cyan-100/45" />
            <div className="text-center">
              <div className="text-4xl font-semibold tracking-normal text-white">742</div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/34">kcal left</div>
            </div>
          </div>
        </div>
        <div className="space-y-3">
          {[
            ['Protein', '96g', '68%', 'bg-stone-100/70'],
            ['Carbs', '148g', '54%', 'bg-amber-100/80'],
            ['Fat', '42g', '46%', 'bg-amber-100/65'],
          ].map(([label, value, width, color]) => (
            <div key={label} className="rounded-2xl border border-white/[0.045] bg-white/[0.035] p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-semibold text-white/82">{label}</span>
                <span className="text-xs font-medium text-white/48">{value}</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.08]">
                <div className={`h-full rounded-full ${color}`} style={{ width }} />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {['Breakfast parsed', 'Lunch optimized', 'Dinner target'].map((item) => (
          <div key={item} className="rounded-2xl border border-white/[0.045] bg-white/[0.025] p-4 text-left">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/28">{item}</p>
            <p className="mt-2 text-sm font-semibold text-white/82">On track</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function FloatingInsight({ title, value, meta, icon }: { title: string; value: string; meta: string; icon: ReactNode }) {
  return (
    <div className="rounded-[1.5rem] border border-white/[0.08] bg-white/[0.04] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-2xl">
      <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-xl bg-[#f4e7d1] text-black">{icon}</div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/32">{title}</p>
      <p className="mt-2 text-2xl font-semibold tracking-normal text-white/92">{value}</p>
      <p className="mt-2 text-xs font-medium text-amber-100/46">{meta}</p>
    </div>
  );
}
