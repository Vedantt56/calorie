import React, { useEffect, useMemo, useState } from "react";
import {
  TrendingUp,
  Flame,
  Loader2,
  Calendar,
  Bell,
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
  bg: "#050506",
  surface: "rgba(255,255,255,0.03)",
  surfaceHover: "rgba(255,255,255,0.055)",
  border: "rgba(255,255,255,0.07)",
  amber: "#f5b35c",
  amberLight: "#f4e7d1",
  text: "#f4f1ea",
  textSub: "rgba(255,255,255,0.45)",
  textMuted: "rgba(255,255,255,0.24)",
};

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
    if (!authLoading && !user) {
      navigate("/login");
    }
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

  return (
    <div className="progress-root">
      {isMobile && sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", zIndex: 90 }}
        />
      )}

      {/* SHARED SIDEBAR */}
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
              <p className="header-sub">Track today’s calories and macros, then compare your intake across the last 7 days.</p>
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
          <section className="summary-card">
            <div className="summary-top">
              <div>
                <p className="small-label">Today</p>
                <h2 className="summary-title">{format(new Date(), "EEEE, MMM d")}</h2>
              </div>
              <p className="small-label">{loadingLogs ? "Loading..." : `${todayLogs.length} logged item${todayLogs.length === 1 ? "" : "s"}`}</p>
            </div>

            <div className="summary-body">
              <div>
                <p className="small-label">Calories eaten</p>
                <h3>{eatenCalories} kcal</h3>
              </div>
              <div className="target-block">
                <p className="small-label">Target</p>
                <p className="target-value">{targets.calories} kcal</p>
              </div>
            </div>

            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${caloriesProgress}%` }} />
            </div>
            <div className="progress-meta">
              <span>{caloriesProgress.toFixed(0)}% of goal</span>
              <span>{remainingCalories} kcal left</span>
            </div>
          </section>

          <section className="macro-grid">
            {[
              { label: "Carbs", value: `${eatenCarbs}g`, target: `${targets.carbs}g`, color: T.amber },
              { label: "Protein", value: `${eatenProtein}g`, target: `${targets.protein}g`, color: "#f97316" },
              { label: "Fat", value: `${eatenFat}g`, target: `${targets.fat}g`, color: "#7dd3fc" },
              { label: "Remaining", value: `${remainingCalories} kcal`, target: `${targets.calories} kcal`, color: "#c084fc" },
            ].map((stat) => (
              <div key={stat.label} className="macro-card" style={{ borderColor: stat.color }}>
                <p className="small-label">{stat.label}</p>
                <p className="stat-value" style={{ color: stat.color }}>{stat.value}</p>
                <p className="stat-target">{stat.target}</p>
              </div>
            ))}
          </section>

          <section className="weekly-card">
            <div className="section-header">
              <div>
                <h2>Weekly calories</h2>
                <p className="section-sub">Last 7 days based on logged meals.</p>
              </div>
            </div>
            <div className="weekly-list">
              {weeklyTotals.map((day) => {
                const width = Math.min((day.calories / targets.calories) * 100, 100);
                return (
                  <div key={format(day.date, "yyyy-MM-dd")} className="weekly-row">
                    <span>{format(day.date, "EEE")}</span>
                    <span>{day.calories} kcal</span>
                    <div className="weekly-bar">
                      <div className="weekly-fill" style={{ width: `${width}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

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
        .progress-root { min-height: 100vh; background: ${T.bg}; font-family: Inter, sans-serif; color: ${T.text}; }
        .progress-main { margin-left: 72px; max-width: 1180px; margin-right: auto; padding: 1.75rem 1.5rem 3rem; transition: margin-left 0.3s; }
        .progress-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem; gap: 12px; }
        .header-left { display: flex; align-items: flex-start; gap: 12px; min-width: 0; }
        .subheading { margin: 0; text-transform: uppercase; letter-spacing: 0.16em; font-size: 0.8rem; color: ${T.textMuted}; }
        .header-title { margin: 0.35rem 0 0; font-size: 2.2rem; font-weight: 700; color: ${T.text}; }
        .header-sub { margin: 0.75rem 0 0; max-width: 700px; color: rgba(244,241,234,0.75); line-height: 1.7; }
        .header-right { display: flex; gap: 8px; align-items: center; flex-shrink: 0; }
        .date-pill { display: flex; align-items: center; gap: 7px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 12px; padding: 8px 12px; font-size: 11px; font-weight: 600; color: rgba(255,255,255,0.45); white-space: nowrap; }
        .notif-dot { width: 7px; height: 7px; background: #ef4444; border-radius: 50%; position: absolute; top: 9px; right: 9px; border: 1.5px solid ${T.bg}; }
        .icon-btn { width: 36px; height: 36px; border-radius: 10px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); display: flex; align-items: center; justify-content: center; cursor: pointer; position: relative; transition: background 0.15s; }
        .icon-btn:hover { background: rgba(255,255,255,0.06); }
        .mobile-menu-btn { width: 36px; height: 36px; border-radius: 10px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0; }
        .progress-grid { display: grid; gap: 14px; grid-template-columns: 1fr; grid-template-areas: "summary" "macros" "weekly" "recent"; max-width: 1040px; margin: 0 auto; }
        .summary-card, .macro-card, .weekly-card, .recent-card { background: ${T.surface}; border: 1px solid ${T.border}; border-radius: 22px; padding: 1.5rem; }
        .summary-top { display: flex; justify-content: space-between; gap: 1rem; align-items: center; }
        .summary-title { margin: 0.5rem 0 0; font-size: 1.6rem; }
        .summary-body { display: flex; justify-content: space-between; gap: 1rem; align-items: flex-end; margin-top: 1.5rem; flex-wrap: wrap; }
        .summary-body h3 { margin: 0; font-size: 2rem; }
        .target-block { text-align: right; }
        .target-value { margin: 0.25rem 0 0; font-size: 1.1rem; font-weight: 600; }
        .small-label { margin: 0; color: ${T.textMuted}; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.08em; }
        .progress-bar { margin-top: 1rem; height: 14px; border-radius: 999px; background: rgba(255,255,255,0.07); overflow: hidden; }
        .progress-fill { height: 100%; background: linear-gradient(90deg, #f5b35c, #fb923c); transition: width 0.3s ease; }
        .progress-meta { display: flex; justify-content: space-between; margin-top: 0.75rem; color: ${T.textMuted}; font-size: 0.85rem; }
        .macro-grid { display: grid; gap: 1rem; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); }
        .macro-card { padding: 1.25rem; border: 1px solid rgba(255,255,255,0.06); }
        .stat-value { margin: 0.65rem 0 0; font-size: 1.6rem; font-weight: 700; }
        .stat-target { margin: 0.45rem 0 0; color: rgba(244,241,234,0.6); font-size: 0.9rem; }
        .section-header { display: flex; justify-content: space-between; align-items: center; gap: 1rem; margin-bottom: 1rem; }
        .section-header h2 { margin: 0; font-size: 1.2rem; }
        .section-sub { margin: 0.5rem 0 0; color: ${T.textMuted}; }
        .weekly-list { display: grid; gap: 0.85rem; }
        .weekly-row { display: grid; gap: 0.5rem; }
        .weekly-row span { display: flex; justify-content: space-between; color: ${T.textMuted}; font-size: 0.85rem; }
        .weekly-bar { height: 10px; border-radius: 999px; background: rgba(255,255,255,0.07); overflow: hidden; }
        .weekly-fill { height: 100%; background: linear-gradient(90deg, #f5b35c, #fb923c); }
        .recent-list { display: grid; gap: 0.75rem; }
        .recent-item { display: flex; justify-content: space-between; gap: 1rem; align-items: center; padding: 1rem; border-radius: 16px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.06); }
        .recent-title { margin: 0; font-size: 0.98rem; font-weight: 700; color: ${T.text}; }
        .recent-sub { margin: 0.35rem 0 0; color: ${T.textMuted}; font-size: 0.82rem; }
        .empty-state { margin: 0; color: ${T.textMuted}; }

        @media (min-width: 768px) {
          .progress-main { margin-left: 72px; padding: 2rem 2rem 3rem; }
          .progress-grid { grid-template-columns: 1.5fr 0.85fr; grid-template-areas: "summary macros" "weekly recent"; }
          .summary-card { grid-area: summary; }
          .macro-grid { grid-area: macros; }
          .weekly-card { grid-area: weekly; }
          .recent-card { grid-area: recent; }
        }

        @media (min-width: 1200px) {
          .progress-main { margin-left: 72px; padding: 2rem 2.5rem 3rem; }
          .header-title { font-size: 2.4rem; }
        }
      `}</style>
    </div>
  );
}


