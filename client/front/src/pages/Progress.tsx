import React, { useEffect, useMemo, useState } from "react";
import {
  Calendar,
  Bell,
  Droplets,
  Activity,
  UtensilsCrossed,
  Clock,
} from "lucide-react";
import { format, subDays } from "date-fns";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import SharedSidebar from "../components/SharedSidebar";

type FoodLog = {
  _id?: string;
  calories?: number;
  carbs?: number;
  protein?: number;
  fat?: number;
  foodName?: string;
  quantity?: number;
  unit?: string;
  size?: string;
  createdAt?: string;
};

const T = {
  bg: "#0a0a0b",
  surface: "rgba(255,255,255,0.03)",
  surfaceHover: "rgba(255,255,255,0.055)",
  border: "rgba(255,255,255,0.07)",
  amber: "#f5b35c",
  amberLight: "#f4e7d1",
  text: "#f4f1ea",
  textSub: "rgba(255,255,255,0.45)",
  textMuted: "rgba(255,255,255,0.24)",
};

// SVG Donut Ring component
function DonutRing({
  ratio,
  color,
  size = 90,
}: {
  ratio: number;
  color: string;
  size?: number;
}) {
  const r = 36;
  const circ = 2 * Math.PI * r;
  const offset = circ - (Math.min(ratio, 100) / 100) * circ;
  return (
    <svg width={size} height={size} viewBox="0 0 80 80">
      <circle cx="40" cy="40" r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="7" />
      <circle
        cx="40" cy="40" r={r}
        fill="none"
        stroke={color}
        strokeWidth="7"
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        transform="rotate(-90 40 40)"
        style={{ transition: "stroke-dashoffset 0.6s ease" }}
      />
    </svg>
  );
}

// Sparkline SVG
function Sparkline({ progress }: { progress: number }) {
  const points = useMemo(() => {
    const base = [0.25, 0.3, 0.22, 0.35, 0.28, 0.4, 0.36, 0.45, 0.5, 0.55, 0.48, 0.6, 0.65, 0.72, progress / 100];
    return base.map((v, i) => `${(i / (base.length - 1)) * 260},${60 - v * 48}`).join(" ");
  }, [progress]);
  const dotX = 260;
  const dotY = 60 - (progress / 100) * 48;

  return (
    <svg viewBox="0 0 260 64" style={{ width: "100%", height: "64px", overflow: "visible" }}>
      <polyline
        points={points}
        fill="none"
        stroke="#7dd3fc"
        strokeWidth="1.8"
        strokeLinejoin="round"
        strokeLinecap="round"
        opacity="0.7"
      />
      {points.split(" ").map((pt, i) => {
        const [x, y] = pt.split(",").map(Number);
        return <circle key={i} cx={x} cy={y} r="2.5" fill="#7dd3fc" opacity="0.5" />;
      })}
      <circle cx={dotX} cy={dotY} r="4" fill="#7dd3fc" />
      <circle cx={dotX} cy={dotY} r="8" fill="#7dd3fc" opacity="0.18" />
    </svg>
  );
}

export default function Progress() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [logs, setLogs] = useState<FoodLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const targets = {
    calories: user?.targetCalories || 2000,
    carbs: user?.targetCarbs || 250,
    protein: user?.targetProtein || 150,
    fat: user?.targetFat || 70,
  };

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!authLoading && !user) navigate("/login");
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    const fetchLogs = async () => {
      setLoadingLogs(true);
      try {
        const res = await fetch("/api/food/log", {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch food logs");
        const data = await res.json();
        setLogs(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setLogs([]);
      } finally {
        setLoadingLogs(false);
      }
    };
    fetchLogs();
  }, [user]);

  const todayKey = format(new Date(), "yyyy-MM-dd");
  const todayLogs = logs.filter((log) => log.createdAt && format(new Date(log.createdAt), "yyyy-MM-dd") === todayKey);
  const eatenCalories = Math.round(todayLogs.reduce((total, log) => total + (log.calories ?? 0), 0));
  const eatenCarbs = +todayLogs.reduce((total, log) => total + (log.carbs ?? 0), 0).toFixed(1);
  const eatenProtein = +todayLogs.reduce((total, log) => total + (log.protein ?? 0), 0).toFixed(1);
  const eatenFat = +todayLogs.reduce((total, log) => total + (log.fat ?? 0), 0).toFixed(1);
  const remainingCalories = Math.max(targets.calories - eatenCalories, 0);
  const caloriesProgress = Math.min((eatenCalories / targets.calories) * 100, 100);

  const weeklyTotals = useMemo(() => {
    const dailyMap: Record<string, { calories: number; carbs: number; protein: number; fat: number }> = {};
    logs.forEach((log) => {
      if (!log.createdAt) return;
      const dateKey = format(new Date(log.createdAt), "yyyy-MM-dd");
      if (!dailyMap[dateKey]) dailyMap[dateKey] = { calories: 0, carbs: 0, protein: 0, fat: 0 };
      dailyMap[dateKey].calories += log.calories ?? 0;
      dailyMap[dateKey].carbs += log.carbs ?? 0;
      dailyMap[dateKey].protein += log.protein ?? 0;
      dailyMap[dateKey].fat += log.fat ?? 0;
    });
    return Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), 6 - i);
      const key = format(date, "yyyy-MM-dd");
      const totals = dailyMap[key] || { calories: 0, carbs: 0, protein: 0, fat: 0 };
      return { date, ...totals };
    });
  }, [logs]);

  const recentMeals = useMemo(
    () =>
      [...logs]
        .filter((log) => !!log.createdAt)
        .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())
        .slice(0, 5),
    [logs],
  );

  const waterGoal = 2800;
  const waterIntake = Math.min(waterGoal, Math.max(400, Math.round((eatenCalories / Math.max(1, targets.calories)) * 2100 + 600)));
  const hydrationProgress = Math.min(100, Math.round((waterIntake / waterGoal) * 100));
  const consistencyScore = Math.round((weeklyTotals.reduce((sum, day) => sum + Math.min(day.calories / targets.calories, 1), 0) / 7) * 100);
  const goalCompletion = Math.round((weeklyTotals.filter((day) => day.calories >= targets.calories).length / 7) * 100);
  const streakDays = weeklyTotals.filter((day) => day.calories >= targets.calories * 0.85).length;
  const activityMinutes = Math.max(22, Math.min(68, Math.round(30 + caloriesProgress * 0.16 * 40)));
  const macroBalance = Math.round(
    ((Math.min(eatenCarbs / Math.max(1, targets.carbs), 1) + Math.min(eatenProtein / Math.max(1, targets.protein), 1) + Math.min(eatenFat / Math.max(1, targets.fat), 1)) / 3) * 100,
  );
  const nutritionScore = Math.max(42, Math.min(98, Math.round(74 + macroBalance * 0.18 - Math.abs(caloriesProgress - 82) * 0.28)));
  const mealTiming = todayLogs.reduce(
    (acc, log) => {
      if (!log.createdAt) return acc;
      const hour = new Date(log.createdAt).getHours();
      if (hour < 11) acc.morning += 1;
      else if (hour < 15) acc.afternoon += 1;
      else acc.evening += 1;
      return acc;
    },
    { morning: 0, afternoon: 0, evening: 0 },
  );
  const bestTiming = Object.entries(mealTiming).sort((a, b) => b[1] - a[1])[0];
  const timingLabel = bestTiming && bestTiming[1] > 0 ? `${bestTiming[0][0].toUpperCase()}${bestTiming[0].slice(1)}` : "Balanced";

  // Weekly chart scale
  const chartMax = Math.max(...weeklyTotals.map((d) => d.calories), targets.calories, 1);
  const yTicks = [0, Math.round(chartMax * 0.25), Math.round(chartMax * 0.5), Math.round(chartMax * 0.75), Math.round(chartMax)];
  const goalLineY = (1 - targets.calories / chartMax) * 100;

  const macros = [
    { label: "Carbs", eaten: eatenCarbs, target: targets.carbs, ratio: Math.min(100, Math.round((eatenCarbs / Math.max(1, targets.carbs)) * 100)), color: T.amber },
    { label: "Protein", eaten: eatenProtein, target: targets.protein, ratio: Math.min(100, Math.round((eatenProtein / Math.max(1, targets.protein)) * 100)), color: "#f97316" },
    { label: "Fat", eaten: eatenFat, target: targets.fat, ratio: Math.min(100, Math.round((eatenFat / Math.max(1, targets.fat)) * 100)), color: "#7dd3fc" },
  ];

  return (
    <div className="progress-root">
      {isMobile && sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", zIndex: 90 }} />
      )}

      <SharedSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} isMobile={isMobile} activePage="progress" />

      <main className="progress-main">
        <header className="progress-header">
          <div className="header-left">
            {isMobile && (
              <button onClick={() => setSidebarOpen(true)} className="mobile-menu-btn">
                <div style={{ width: "18px", display: "flex", flexDirection: "column", gap: "4px" }}>
                  {[0, 1, 2].map((i) => (
                    <div key={i} style={{ height: "2px", background: T.textSub, borderRadius: "2px" }} />
                  ))}
                </div>
              </button>
            )}
            <div>
              <p className="subheading">Progress</p>
              <h1 className="header-title">Nutrition summary</h1>
              <p className="header-sub">Track today's calories and macros, then compare your intake across the last 7 days.</p>
            </div>
          </div>
          <div className="header-right">
            <div className="date-pill">
              <Calendar style={{ width: "13px", height: "13px", color: T.amber }} />
              <span>{format(new Date(), "EEE, MMM do")}</span>
            </div>
            <button className="icon-btn" style={{ position: "relative" }}>
              <Bell style={{ width: "15px", height: "15px", color: T.textSub }} />
              <span className="notif-dot" />
            </button>
          </div>
        </header>

        <div className="progress-grid">
          {/* HERO CARD */}
          <section className="hero-card">
            <div className="hero-head">
              <div>
                <p className="small-label">Today</p>
                <h2 className="hero-title">Nutrition pulse</h2>
                <p className="hero-copy">A focused view of your energy, macros, and momentum for the day.</p>
              </div>
              <div className="hero-badge">{loadingLogs ? "Loading…" : `${todayLogs.length} logged item${todayLogs.length === 1 ? "" : "s"}`}</div>
            </div>

            {/* Energy + Momentum row */}
            <div className="hero-stat-grid">
              <div className="hero-metric-card">
                <div className="hero-metric-head">
                  <div>
                    <p className="hero-metric-label">Remaining energy</p>
                    <h1>{remainingCalories} kcal</h1>
                  </div>
                  <div className="hero-pill">
                    <span className="small-label">Score</span>
                    <strong>{nutritionScore}</strong>
                  </div>
                </div>
                <p className="hero-metric-note">{eatenCalories} / {targets.calories} kcal consumed · {macroBalance}% balance</p>
                <div className="hero-bar">
                  <div className="hero-bar-fill" style={{ width: `${caloriesProgress}%` }} />
                </div>
                <div className="hero-bar-meta">
                  <span>{caloriesProgress.toFixed(0)}% of goal</span>
                  <span>{remainingCalories} kcal left</span>
                </div>
              </div>

              <div className="hero-side-card">
                <p className="small-label">Today's momentum</p>
                <div className="hero-side-row">
                  <div className="momentum-item">
                    <UtensilsCrossed style={{ width: "16px", height: "16px", color: T.amber, marginBottom: "4px" }} />
                    <strong>{todayLogs.length}</strong>
                    <p className="hero-side-label">Entries</p>
                  </div>
                  <div className="momentum-item">
                    <Clock style={{ width: "16px", height: "16px", color: T.amber, marginBottom: "4px" }} />
                    <strong>{timingLabel}</strong>
                    <p className="hero-side-label">Meal timing</p>
                  </div>
                </div>
                <p className="hero-note">Focus on a simple rhythm: steady energy, balanced macros, and hydration flow.</p>
              </div>
            </div>

            {/* Macro donut rings */}
            <div className="macro-donuts">
              {macros.map((macro) => (
                <div key={macro.label} className="macro-donut-card">
                  <div className="donut-wrap">
                    <DonutRing ratio={macro.ratio} color={macro.color} size={90} />
                    <div className="donut-center">
                      <strong style={{ color: macro.color }}>{macro.ratio}%</strong>
                    </div>
                  </div>
                  <p className="macro-donut-label">{macro.label}</p>
                  <p className="macro-donut-sub">{macro.eaten}g / {macro.target}g</p>
                </div>
              ))}
            </div>
          </section>

          {/* SUPPORT COLUMN */}
          <aside className="support-column">
            {/* Hydration */}
            <div className="support-card">
              <div className="support-card-head">
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div className="card-icon-wrap blue">
                    <Droplets style={{ width: "16px", height: "16px", color: "#7dd3fc" }} />
                  </div>
                  <div>
                    <p className="small-label">Hydration overview</p>
                    <h3>{waterIntake} ml</h3>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p className="small-label">Target</p>
                  <strong style={{ fontSize: "1rem" }}>{waterGoal} ml</strong>
                </div>
              </div>
              <p className="support-note">{hydrationProgress}% of hydration goal</p>
              <div className="support-pill-bar">
                <div className="pill-fill" style={{ width: `${hydrationProgress}%`, background: "linear-gradient(90deg,#38bdf8,#7dd3fc)" }} />
              </div>
              {/* Sparkline */}
              <div style={{ marginTop: "0.75rem" }}>
                <Sparkline progress={hydrationProgress} />
              </div>
              {/* Tip */}
              <div className="hydration-tip">
                <div className="tip-icon">
                  <Droplets style={{ width: "14px", height: "14px", color: "#7dd3fc" }} />
                </div>
                <div>
                  <p className="tip-title">You're on pace!</p>
                  <p className="tip-sub">Keep sipping to hit your goal.</p>
                </div>
              </div>
            </div>

            {/* Activity Insight */}
            <div className="support-card highlight-card">
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "0.5rem" }}>
                <div className="card-icon-wrap amber">
                  <Activity style={{ width: "16px", height: "16px", color: T.amber }} />
                </div>
                <p className="small-label" style={{ margin: 0 }}>Activity insight</p>
              </div>
              <h3>{activityMinutes} min</h3>
              <p className="support-note">Estimated recovery window based on today's intake.</p>
              <div className="insight-row">
                <div>
                  <p className="small-label">Meal timing</p>
                  <strong>{timingLabel}</strong>
                </div>
                <div>
                  <p className="small-label">Today's load</p>
                  <strong>{todayLogs.length} entries</strong>
                </div>
              </div>
            </div>
          </aside>

          {/* WEEKLY CHART */}
          <section className="weekly-card">
            <div className="section-header">
              <div>
                <h2>Weekly trend</h2>
                <p className="section-sub">Calories over the last 7 days in one clean visual.</p>
              </div>
            </div>

            <div className="weekly-chart-wrap">
              {/* Y axis labels */}
              <div className="y-axis">
                {[...yTicks].reverse().map((v) => (
                  <span key={v}>{v}</span>
                ))}
              </div>

              {/* Bars area */}
              <div className="bars-area" style={{ position: "relative" }}>
                {/* Goal dashed line */}
                <div
                  className="goal-line"
                  style={{ bottom: `${(targets.calories / chartMax) * 100}%` }}
                >
                  <span className="goal-label">Goal {targets.calories} kcal</span>
                </div>

                <div className="weekly-bars">
                  {weeklyTotals.map((day) => {
                    const pct = chartMax > 0 ? Math.max(2, (day.calories / chartMax) * 100) : 2;
                    const isToday = format(day.date, "yyyy-MM-dd") === todayKey;
                    return (
                      <div key={format(day.date, "yyyy-MM-dd")} className="weekly-bar-col">
                        <div className="weekly-bar-frame">
                          <div
                            className="weekly-fill"
                            style={{
                              height: `${pct}%`,
                              background: isToday
                                ? "linear-gradient(180deg,#fb923c,#f5b35c)"
                                : "linear-gradient(180deg,#f5b35c,#f59e0b88)",
                            }}
                          />
                        </div>
                        <span className="bar-label">{format(day.date, "EEE")}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="weekly-summary">
              <div>
                <p className="small-label">Average</p>
                <strong>{Math.round(weeklyTotals.reduce((s, d) => s + d.calories, 0) / 7)} kcal</strong>
              </div>
              <div>
                <p className="small-label">Peak</p>
                <strong>{Math.max(...weeklyTotals.map((d) => d.calories))} kcal</strong>
              </div>
              <div>
                <p className="small-label">Target cadence</p>
                <strong>{goalCompletion}%</strong>
              </div>
            </div>
          </section>

          {/* RECENT MEALS */}
          <section className="recent-card">
            <div className="section-header">
              <h2>Recent meals</h2>
            </div>
            {loadingLogs ? (
              <p className="empty-state">Loading recent meals...</p>
            ) : recentMeals.length === 0 ? (
              <p className="empty-state">No meals logged yet for today.</p>
            ) : (
              <div className="recent-list">
                {recentMeals.map((meal) => (
                  <div key={meal._id ?? `${meal.foodName}-${meal.createdAt}`} className="recent-item">
                    <div>
                      <p className="recent-title">{meal.foodName || "Meal"}</p>
                      <p className="recent-sub">{meal.quantity ?? ""} {meal.unit ?? meal.size ?? ""}</p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <p className="recent-title">{meal.calories ?? 0} kcal</p>
                      <p className="recent-sub">{meal.createdAt ? format(new Date(meal.createdAt), "hh:mm a") : "Unknown"}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      <style>{`
        * { box-sizing: border-box; }
        .progress-root { min-height: 100vh; background: ${T.bg}; font-family: Inter, sans-serif; color: ${T.text}; }
        .progress-main { margin-left: 72px; max-width: 1320px; margin-right: auto; padding: 1.75rem 1.5rem 3rem; transition: margin-left 0.3s; }
        .progress-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.75rem; gap: 16px; }
        .header-left { display: flex; align-items: flex-start; gap: 16px; min-width: 0; }
        .subheading { margin: 0; text-transform: uppercase; letter-spacing: 0.18em; font-size: 0.8rem; color: ${T.textMuted}; }
        .header-title { margin: 0.35rem 0 0; font-size: 2.3rem; font-weight: 700; color: ${T.text}; }
        .header-sub { margin: 0.75rem 0 0; max-width: 700px; color: rgba(244,241,234,0.75); line-height: 1.7; }
        .header-right { display: flex; gap: 10px; align-items: center; flex-shrink: 0; }
        .date-pill { display: flex; align-items: center; gap: 7px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 14px; padding: 10px 14px; font-size: 11px; font-weight: 600; color: rgba(255,255,255,0.45); white-space: nowrap; }
        .notif-dot { width: 7px; height: 7px; background: #ef4444; border-radius: 50%; position: absolute; top: 9px; right: 9px; border: 1.5px solid ${T.bg}; }
        .icon-btn { width: 38px; height: 38px; border-radius: 12px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); display: flex; align-items: center; justify-content: center; cursor: pointer; position: relative; transition: background 0.15s; }
        .icon-btn:hover { background: rgba(255,255,255,0.06); }
        .mobile-menu-btn { width: 38px; height: 38px; border-radius: 12px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0; }
        .small-label { margin: 0; text-transform: uppercase; letter-spacing: 0.1em; font-size: 0.75rem; color: ${T.textMuted}; }

        .progress-grid { display: grid; gap: 20px; grid-template-columns: 1fr; grid-template-areas: "hero" "insight" "weekly" "recent"; max-width: 1240px; margin: 0 auto; }

        /* HERO */
        .hero-card { grid-area: hero; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 28px; padding: 1.75rem; display: grid; gap: 1.5rem; box-shadow: 0 18px 40px rgba(0,0,0,0.22); }
        .hero-head { display: flex; justify-content: space-between; gap: 18px; align-items: flex-start; flex-wrap: wrap; }
        .hero-title { margin: 0.55rem 0 0; font-size: 2rem; line-height: 1.05; }
        .hero-copy { margin: 0.85rem 0 0; color: rgba(244,241,234,0.72); max-width: 560px; line-height: 1.75; }
        .hero-badge { align-self: flex-start; background: rgba(245,179,92,0.12); border: 1px solid rgba(245,179,92,0.22); border-radius: 18px; color: ${T.amberLight}; padding: 12px 16px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; font-size: 0.75rem; white-space: nowrap; }

        .hero-stat-grid { display: grid; gap: 16px; }
        .hero-metric-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 22px; padding: 1.5rem; display: grid; gap: 1rem; }
        .hero-metric-head { display: flex; justify-content: space-between; gap: 16px; align-items: flex-start; flex-wrap: wrap; }
        .hero-metric-label { margin: 0; color: ${T.textMuted}; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.12em; }
        .hero-metric-card h1 { margin: 0.65rem 0 0; font-size: 3rem; line-height: 0.95; letter-spacing: -0.04em; }
        .hero-metric-note { margin: 0; color: rgba(244,241,234,0.65); font-size: 0.88rem; }
        .hero-pill { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 10px 14px; display: inline-grid; gap: 4px; text-align: right; }
        .hero-pill strong { font-size: 1.4rem; line-height: 1; }
        .hero-bar { height: 10px; border-radius: 999px; background: rgba(255,255,255,0.07); overflow: hidden; }
        .hero-bar-fill { height: 100%; background: linear-gradient(90deg, #f5b35c, #fb923c); transition: width 0.5s ease; border-radius: 999px; }
        .hero-bar-meta { display: flex; justify-content: space-between; color: ${T.textMuted}; font-size: 0.82rem; }

        .hero-side-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 22px; padding: 1.4rem; display: grid; gap: 1rem; }
        .hero-side-row { display: grid; gap: 14px; grid-template-columns: repeat(2, minmax(0, 1fr)); }
        .momentum-item { display: flex; flex-direction: column; gap: 2px; }
        .hero-side-label { margin: 0.2rem 0 0; color: ${T.textMuted}; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.08em; }
        .hero-note { margin: 0; color: rgba(244,241,234,0.65); font-size: 0.9rem; line-height: 1.7; }

        /* Macro donuts */
        .macro-donuts { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
        .macro-donut-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 20px; padding: 1.2rem 1rem; display: flex; flex-direction: column; align-items: center; gap: 0.5rem; }
        .donut-wrap { position: relative; display: flex; align-items: center; justify-content: center; }
        .donut-center { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center; }
        .donut-center strong { font-size: 0.95rem; font-weight: 700; }
        .macro-donut-label { margin: 0; font-size: 0.9rem; font-weight: 600; color: ${T.text}; }
        .macro-donut-sub { margin: 0; font-size: 0.78rem; color: ${T.textMuted}; }

        /* SUPPORT COLUMN */
        .support-column { grid-area: insight; display: grid; gap: 18px; }
        .support-card { background: rgba(255,255,255,0.035); border: 1px solid rgba(255,255,255,0.08); border-radius: 24px; padding: 1.4rem; display: grid; gap: 0.85rem; }
        .support-card-head { display: flex; justify-content: space-between; gap: 12px; align-items: flex-start; flex-wrap: wrap; }
        .support-card h3 { margin: 0.4rem 0 0; font-size: 1.9rem; font-weight: 700; }
        .highlight-card { background: rgba(255,255,255,0.045); border-color: rgba(255,255,255,0.1); }
        .support-note { margin: 0; color: rgba(244,241,234,0.65); line-height: 1.6; font-size: 0.9rem; }
        .support-pill-bar { height: 7px; border-radius: 999px; background: rgba(255,255,255,0.06); overflow: hidden; }
        .pill-fill { height: 100%; border-radius: 999px; transition: width 0.5s ease; }
        .insight-row { display: grid; gap: 14px; grid-template-columns: repeat(2, minmax(0, 1fr)); padding-top: 0.8rem; border-top: 1px solid rgba(255,255,255,0.06); }

        /* Icon wraps */
        .card-icon-wrap { width: 34px; height: 34px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .card-icon-wrap.blue { background: rgba(125,211,252,0.12); }
        .card-icon-wrap.amber { background: rgba(245,179,92,0.12); }

        /* Hydration tip */
        .hydration-tip { display: flex; align-items: center; gap: 10px; background: rgba(125,211,252,0.07); border: 1px solid rgba(125,211,252,0.15); border-radius: 14px; padding: 0.8rem 1rem; }
        .tip-icon { width: 30px; height: 30px; border-radius: 50%; background: rgba(125,211,252,0.15); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .tip-title { margin: 0; font-size: 0.85rem; font-weight: 700; color: ${T.text}; }
        .tip-sub { margin: 0.15rem 0 0; font-size: 0.78rem; color: ${T.textMuted}; }

        /* WEEKLY CHART */
        .weekly-card { grid-area: weekly; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 28px; padding: 1.5rem; box-shadow: 0 20px 40px rgba(0,0,0,0.14); }
        .section-header { margin-bottom: 1.25rem; }
        .section-header h2 { margin: 0; font-size: 1.2rem; font-weight: 700; }
        .section-sub { margin: 0.35rem 0 0; color: ${T.textMuted}; font-size: 0.85rem; }

        .weekly-chart-wrap { display: flex; gap: 12px; align-items: stretch; }
        .y-axis { display: flex; flex-direction: column; justify-content: space-between; min-width: 38px; text-align: right; padding-bottom: 24px; }
        .y-axis span { font-size: 0.7rem; color: ${T.textMuted}; }
        .bars-area { flex: 1; position: relative; min-height: 180px; }

        .goal-line { position: absolute; left: 0; right: 0; border-top: 1.5px dashed rgba(245,179,92,0.5); z-index: 2; }
        .goal-label { position: absolute; right: 0; top: -18px; font-size: 0.7rem; color: ${T.amber}; font-weight: 600; white-space: nowrap; }

        .weekly-bars { display: grid; grid-auto-flow: column; grid-auto-columns: 1fr; gap: 10px; height: 100%; align-items: end; padding-bottom: 24px; }
        .weekly-bar-col { display: flex; flex-direction: column; align-items: center; gap: 8px; height: 100%; justify-content: flex-end; }
        .weekly-bar-frame { width: 100%; flex: 1; background: rgba(255,255,255,0.05); border-radius: 8px; overflow: hidden; position: relative; min-height: 4px; display: flex; align-items: flex-end; }
        .weekly-fill { width: 100%; border-radius: 8px; transition: height 0.5s ease; }
        .bar-label { font-size: 0.75rem; color: ${T.textMuted}; white-space: nowrap; }

        .weekly-summary { display: grid; gap: 12px; grid-template-columns: repeat(3, minmax(0, 1fr)); margin-top: 1.25rem; }
        .weekly-summary > div { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 18px; padding: 0.9rem 1rem; }
        .weekly-summary strong { display: block; margin-top: 0.45rem; font-size: 1.15rem; }

        /* RECENT MEALS */
        .recent-card { grid-area: recent; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 28px; padding: 1.5rem; box-shadow: 0 20px 40px rgba(0,0,0,0.14); }
        .recent-list { display: grid; gap: 0.75rem; }
        .recent-item { display: flex; justify-content: space-between; gap: 1rem; align-items: center; padding: 0.95rem 1.1rem; border-radius: 16px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); transition: background 0.2s ease; }
        .recent-item:hover { background: rgba(255,255,255,0.055); }
        .recent-title { margin: 0; font-size: 0.9rem; font-weight: 600; color: ${T.text}; }
        .recent-sub { margin: 0.2rem 0 0; font-size: 0.78rem; color: ${T.textMuted}; }
        .empty-state { color: ${T.textMuted}; font-size: 0.9rem; }

        @media (min-width: 768px) {
          .progress-main { margin-left: 72px; padding: 2rem 2rem 3rem; }
          .progress-grid { grid-template-columns: 1.75fr 0.95fr; grid-template-areas: "hero insight" "weekly recent"; }
          .hero-stat-grid { grid-template-columns: 1.4fr 0.85fr; align-items: start; }
          .hero-side-card { padding: 1.5rem; }
          .bars-area { min-height: 210px; }
        }

        @media (min-width: 1200px) {
          .progress-main { margin-left: 72px; padding: 2rem 2.5rem 3rem; }
          .header-title { font-size: 2.6rem; }
          .hero-stat-grid { grid-template-columns: 1.5fr 0.8fr; gap: 20px; }
        }
      `}</style>
    </div>
  );
}