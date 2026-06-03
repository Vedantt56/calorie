import React, { useState, useEffect } from "react";
import {
  Home, Utensils, Plus, Activity, TrendingUp, Bell,
  Droplet, Flame, Scale, Heart, ChevronLeft, ChevronRight,
  Pencil, Lock, Loader2, Trash2, Settings, LogOut, Calendar, Zap, ChevronDown,
} from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import { format, addDays, subDays } from "date-fns";
import { useAuth } from "../context/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
import OnboardingModal from "../components/OnboardingModal";
import SharedSidebar from "../components/SharedSidebar";
import { getCurrentMealTime, getMealTimeOfDay, getMealTypeLabel, getMealTypeColor, type MealType } from "../utils/mealTime";

type FoodLog = {
  _id?: string; calories?: number; carbs?: number;
  protein?: number; fat?: number; foodName?: string;
  quantity?: number; unit?: string; size?: string; createdAt?: string;
  mealType?: MealType;
};

const T = {
  bg: "#050506", surface: "rgba(255,255,255,0.03)",
  surfaceHover: "rgba(255,255,255,0.055)", border: "rgba(255,255,255,0.07)",
  amber: "#f5b35c", amberLight: "#f4e7d1", text: "#f4f1ea",
  textSub: "rgba(255,255,255,0.45)", textMuted: "rgba(255,255,255,0.24)",
  sidebar: "rgba(8,8,10,0.96)",
};

export default function Dashboard() {
  const { user, logout, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [logs, setLogs] = useState<FoodLog[]>([]);
  const [isLogging, setIsLogging] = useState(false);
  const [inputText, setInputText] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState<MealType>(getCurrentMealTime());
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [expandedMeals, setExpandedMeals] = useState<Set<string>>(new Set());

  const [waterIntake, setWaterIntake] = useState(0);
  const [waterGoal, setWaterGoal] = useState(3000);
  const [waterHistory, setWaterHistory] = useState<{ date: string; amount: number }[]>([]);
  const [waterTimeline, setWaterTimeline] = useState<{ id: string; time: string; amount: number }[]>([]);
  const [waterOpen, setWaterOpen] = useState(false);
  const [goalEditOpen, setGoalEditOpen] = useState(false);
  const [newGoalInput, setNewGoalInput] = useState("3000");
  const [customAmount, setCustomAmount] = useState("250");
  const [remindersEnabled, setRemindersEnabled] = useState(true);
  const [quietHours, setQuietHours] = useState("22:00 - 07:00");

  const targets = {
    calories: user?.targetCalories || 2000,
    carbs: user?.targetCarbs || 250,
    protein: user?.targetProtein || 150,
    fat: user?.targetFat || 70,
    weight: user?.weight || 70,
  };

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!authLoading && !user) navigate("/login");
    if (!authLoading && user && !user.height) setIsOnboardingOpen(true);
  }, [user, authLoading, navigate]);

  useEffect(() => { if (user) fetchLogs(); }, [currentDate, user]);

  useEffect(() => {
    if (location.state?.openSettings) {
      setIsSettingsOpen(true);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.pathname, location.state, navigate]);

  useEffect(() => {
    if (waterOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [waterOpen]);

  const fetchLogs = async () => {
    if (!user) return;
    try {
      setLoadingLogs(true);
      const res = await fetch("/api/food/log", { headers: { Authorization: `Bearer ${user.token}` } });
      const ct = res.headers.get("content-type") || "";
      if (!res.ok) throw new Error(await res.text());
      if (!ct.includes("application/json")) throw new Error("Expected JSON");
      const data = await res.json();
      setLogs(Array.isArray(data) ? data : []);
    } catch (err) { console.error(err); setLogs([]); }
    finally { setLoadingLogs(false); }
  };

  const handleSmartLog = async () => {
    if (!inputText.trim() || !user) return;
    setIsLogging(true);
    try {
      const res = await fetch("/api/food/log-text", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${user.token}` },
        body: JSON.stringify({ text: inputText, mealType: selectedMealType }),
      });
      if (!res.ok) throw new Error(await res.text());
      setInputText(""); setIsModalOpen(false); fetchLogs();
    } catch (err) { console.error(err); }
    finally { setIsLogging(false); }
  };

  const handleDeleteLog = async (id: string) => {
    if (!user) return;
    try {
      const res = await fetch(`/api/food/log/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${user.token}` } });
      if (!res.ok) throw new Error("Delete failed");
      fetchLogs();
    } catch (err) { console.error(err); }
  };

  const hydrationStorageKey = (key: string) => `calorie-hydration-${user?.email || "guest"}-${key}`;

  useEffect(() => {
    if (!user) return;
    const savedGoal = localStorage.getItem(hydrationStorageKey("goal"));
    const savedHistory = localStorage.getItem(hydrationStorageKey("history"));
    const savedTimeline = localStorage.getItem(hydrationStorageKey("timeline"));
    const history = savedHistory ? JSON.parse(savedHistory) as { date: string; amount: number }[] : [];
    const timeline = savedTimeline ? JSON.parse(savedTimeline) as { id: string; time: string; amount: number }[] : [];
    setWaterGoal(savedGoal ? Number(savedGoal) : 3000);
    setNewGoalInput(savedGoal ? String(Number(savedGoal)) : "3000");
    setWaterHistory(history);
    setWaterTimeline(timeline.slice(0, 6));
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const today = format(currentDate, "yyyy-MM-dd");
    const todayEntry = waterHistory.find((entry) => entry.date === today);
    setWaterIntake(todayEntry?.amount ?? 0);
  }, [currentDate, user, waterHistory]);

  const persistHydrationState = (goal: number, history: { date: string; amount: number }[], timeline: { id: string; time: string; amount: number }[]) => {
    localStorage.setItem(hydrationStorageKey("goal"), String(goal));
    localStorage.setItem(hydrationStorageKey("history"), JSON.stringify(history));
    localStorage.setItem(hydrationStorageKey("timeline"), JSON.stringify(timeline));
  };

  const updateGoal = () => {
    const value = Math.max(500, Math.min(5000, Number(newGoalInput) || 3000));
    setWaterGoal(value);
    setNewGoalInput(String(value));
    setGoalEditOpen(false);
    persistHydrationState(value, waterHistory, waterTimeline);
  };

  const addWater = (amount: number) => {
    const now = new Date();
    const time = format(now, "HH:mm");
    const today = format(currentDate, "yyyy-MM-dd");
    const entry = { id: `${Date.now()}`, time, amount };
    const updatedHistory = [...waterHistory];
    const todayIndex = updatedHistory.findIndex((item) => item.date === today);
    if (todayIndex >= 0) {
      updatedHistory[todayIndex] = { ...updatedHistory[todayIndex], amount: updatedHistory[todayIndex].amount + amount };
    } else {
      updatedHistory.unshift({ date: today, amount });
    }
    const updatedTimeline = [entry, ...waterTimeline].slice(0, 8);
    const nextIntake = (waterIntake || 0) + amount;
    setWaterHistory(updatedHistory.slice(0, 30));
    setWaterTimeline(updatedTimeline);
    setWaterIntake(nextIntake);
    persistHydrationState(waterGoal, updatedHistory.slice(0, 30), updatedTimeline);
  };

  const hydrationPercent = Math.min((waterIntake / waterGoal) * 100, 100);
  const hydrationRemaining = Math.max(waterGoal - waterIntake, 0);
  const averageWeekly = waterHistory.slice(0, 7).reduce((sum, item) => sum + item.amount, 0) / Math.max(waterHistory.slice(0, 7).length, 1);
  const bestHydrationDay = waterHistory.reduce((max, item) => Math.max(max, item.amount), waterIntake);
  const goalCompleteRate = waterHistory.length ? Math.round((waterHistory.filter((item) => item.amount >= waterGoal).length / waterHistory.length) * 100) : 0;
  const streakCount = waterHistory.slice(0, 14).reduce((streak, item, idx, arr) => {
    if (idx === 0) return item.amount >= waterGoal ? 1 : 0;
    const prev = arr[idx - 1];
    const currDate = new Date(item.date);
    const prevDate = new Date(prev.date);
    const diffDays = Math.round((prevDate.getTime() - currDate.getTime()) / (1000 * 60 * 60 * 24));
    return prev.amount >= waterGoal && diffDays === 1 && item.amount >= waterGoal ? streak + 1 : streak;
  }, 0);

  const hydrationMessage = hydrationPercent >= 100
    ? "Goal reached! Time to celebrate with a splash."
    : hydrationPercent >= 75
      ? "Almost there — keep your rhythm flowing."
      : hydrationPercent >= 45
        ? "Nice pace, a few more sips will keep the momentum."
        : "Start strong: every glass brings calm focus.";

  const hydrationTrend = [...waterHistory].slice(0, 7).reverse();
  const hydrationTrendMax = Math.max(...hydrationTrend.map((item) => item.amount), waterGoal, 1);
  const hydrationTrendPath = hydrationTrend.length
    ? hydrationTrend
      .map((item, index) => {
        const x = 12 + index * (120 / Math.max(hydrationTrend.length - 1, 1));
        const y = 52 - (item.amount / hydrationTrendMax) * 36;
        return `${index === 0 ? "M" : "L"} ${x} ${y}`;
      })
      .join(" ")
    : "";

  const currentMealTime = getCurrentMealTime();
  const eatenCalories = Math.round(logs.reduce((a, l) => a + (l.calories ?? 0), 0));
  const eatenCarbs = +logs.reduce((a, l) => a + (l.carbs ?? 0), 0).toFixed(1);
  const eatenProtein = +logs.reduce((a, l) => a + (l.protein ?? 0), 0).toFixed(1);
  const eatenFat = +logs.reduce((a, l) => a + (l.fat ?? 0), 0).toFixed(1);
  const remaining = Math.max(targets.calories - eatenCalories, 0);
  const calPct = Math.min((eatenCalories / targets.calories) * 100, 100);

  const todayLogs = logs.filter((log) => {
    if (!log.createdAt) return false;
    const logDate = new Date(log.createdAt);
    return (
      logDate.getFullYear() === currentDate.getFullYear() &&
      logDate.getMonth() === currentDate.getMonth() &&
      logDate.getDate() === currentDate.getDate()
    );
  });

  // Group today's logs by meal session (within 30 mins of each other)
  const groupedMeals = React.useMemo(() => {
    const groups: Array<{ id: string; time: Date; items: FoodLog[]; totalCalories: number; totalCarbs: number; totalProtein: number; totalFat: number }> = [];
    const sortedLogs = [...todayLogs].sort((a, b) => {
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return timeB - timeA;
    });

    for (const log of sortedLogs) {
      const logTime = log.createdAt ? new Date(log.createdAt) : new Date();
      const lastGroup = groups[groups.length - 1];

      if (lastGroup && Math.abs(logTime.getTime() - lastGroup.time.getTime()) < 30 * 60 * 1000) {
        lastGroup.items.push(log);
        lastGroup.totalCalories += log.calories || 0;
        lastGroup.totalCarbs += log.carbs || 0;
        lastGroup.totalProtein += log.protein || 0;
        lastGroup.totalFat += log.fat || 0;
      } else {
        groups.push({
          id: `meal-${groups.length + 1}-${logTime.getTime()}`,
          time: logTime,
          items: [log],
          totalCalories: log.calories || 0,
          totalCarbs: log.carbs || 0,
          totalProtein: log.protein || 0,
          totalFat: log.fat || 0,
        });
      }
    }

    return groups;
  }, [todayLogs]);

  const toggleMealExpanded = (mealId: string) => {
    setExpandedMeals((prev) => {
      const newSet = new Set(prev);
      newSet.has(mealId) ? newSet.delete(mealId) : newSet.add(mealId);
      return newSet;
    });
  };

  return (
    <div className="dash-root">

      {/* ── MOBILE OVERLAY ── */}
      {isMobile && sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", zIndex: 90 }} />
      )}

      {/* ── SHARED SIDEBAR ── */}
      <SharedSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        isMobile={isMobile}
        activePage="dashboard"
        onSettingsClick={() => {
          setSidebarOpen(false);
          setIsSettingsOpen(true);
        }}
      />

      {/* ── MAIN ── */}
      <main className="dash-main">

        {/* Header */}
        <header className="dash-header">
          <div className="header-left">
            {/* Mobile menu button */}
            {isMobile && (
              <button onClick={() => setSidebarOpen(true)} className="mobile-menu-btn">
                <div style={{ width: "18px", display: "flex", flexDirection: "column", gap: "4px" }}>
                  {[0, 1, 2].map(i => <div key={i} style={{ height: "2px", background: T.textSub, borderRadius: "2px" }} />)}
                </div>
              </button>
            )}
            <div>
              <h1 className="header-title">Welcome back, {user?.name?.split(" ")[0] || "Guest"} 👋</h1>
              <p className="header-sub">Here's your nutrition overview for today.</p>
            </div>
          </div>
          <div className="header-right">
            <div className="date-pill">
              <Calendar style={{ width: "13px", height: "13px", color: T.amber }} />
              <span>{format(currentDate, "EEE, MMM do")}</span>
            </div>
            <button className="icon-btn" style={{ position: "relative" }}>
              <Bell style={{ width: "15px", height: "15px", color: T.textSub }} />
              <span className="notif-dot" />
            </button>
          </div>
        </header>

        {/* ── CONTENT GRID ── */}
        <div className="dash-grid">

          {/* LEFT: Calorie Card */}
          <div className="card calorie-card">
            <div className="card-glow" />
            <div className="card-dots" />
            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.25rem" }}>
                <div>
                  <h2 style={{ fontSize: "14px", fontWeight: 600, color: T.text, margin: "0 0 3px" }}>Calorie Overview</h2>
                  <p style={{ fontSize: "11px", color: T.textMuted, margin: 0 }}>Daily target progress</p>
                </div>
                <button className="icon-btn">
                  <Pencil style={{ width: "13px", height: "13px", color: T.textSub }} />
                </button>
              </div>

              <div style={{ textAlign: "center", marginBottom: "1.25rem" }}>
                <div style={{ fontSize: "56px", fontWeight: 800, color: T.amberLight, letterSpacing: "-0.03em", lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>{remaining}</div>
                <div style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", color: T.textMuted, marginTop: "6px" }}>kcal remaining</div>
              </div>

              {/* Progress bar */}
              <div style={{ marginBottom: "1.5rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "7px" }}>
                  <span style={{ fontSize: "11px", color: T.textMuted }}>{eatenCalories} eaten</span>
                  <span style={{ fontSize: "11px", color: T.textMuted }}>{targets.calories} goal</span>
                </div>
                <div style={{ height: "6px", background: "rgba(255,255,255,0.06)", borderRadius: "99px", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${calPct}%`, background: `linear-gradient(90deg, ${T.amber}, #f4e7d1)`, borderRadius: "99px", transition: "width 0.8s ease" }} />
                </div>
              </div>

              {/* Macro rings */}
              <div style={{ display: "flex", justifyContent: "space-around" }}>
                <MacroRing label="Protein" eaten={eatenProtein} target={targets.protein} color="#f97316" />
                <MacroRing label="Carbs" eaten={eatenCarbs} target={targets.carbs} color={T.amber} />
                <MacroRing label="Fat" eaten={eatenFat} target={targets.fat} color="#69b8cc" />
              </div>
            </div>
          </div>

          <div className="hydration-card">
            <div className="hydration-glow" />
            <div className="hydration-header">
              <div>
                <h2 style={{ fontSize: "14px", fontWeight: 600, color: T.text, margin: "0 0 4px" }}>Hydration</h2>
                <p style={{ fontSize: "11px", color: T.textMuted, margin: 0 }}>Refresh pace for today</p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Droplet style={{ width: "14px", height: "14px", color: "#7dd3fc" }} />
                <span style={{ fontSize: "11px", fontWeight: 700, color: "#7dd3fc" }}>Water tracker</span>
              </div>
            </div>

            <div className="hydration-main">
              <div className="hydration-summary">
                <div>
                  <div style={{ fontSize: "42px", fontWeight: 800, color: "#f4f1ea", lineHeight: 1, marginBottom: "6px" }}>{waterIntake}</div>
                  <div style={{ fontSize: "12px", color: T.textMuted, letterSpacing: "0.14em", textTransform: "uppercase" }}>{waterGoal} ml goal</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "32px", fontWeight: 800, color: "#7dd3fc", lineHeight: 1 }}>{Math.round(hydrationPercent)}%</div>
                  <div style={{ fontSize: "11px", color: T.textMuted, marginTop: "4px" }}>of daily goal</div>
                </div>
              </div>

              <div className="hydration-progress-row">
                <div className="hydration-progress-track">
                  <div className="hydration-progress-fill" style={{ width: `${hydrationPercent}%` }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: T.textMuted, marginTop: "10px" }}>
                  <span>{waterIntake} ml</span>
                  <span>{waterGoal} ml</span>
                </div>
              </div>

              <div className="hydration-chart-card">
                <div className="hydration-chart-labels">
                  <span style={{ fontSize: "10px", color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.15em" }}>Trend</span>
                  <span style={{ fontSize: "12px", fontWeight: 700, color: "#f4f1ea" }}>7-day hydration line</span>
                </div>
                <div className="hydration-chart-shell">
                  {hydrationTrend.length ? (
                    <svg viewBox="0 0 140 60" className="hydration-sparkline">
                      <path d={hydrationTrendPath} fill="none" stroke="rgba(125, 211, 252, 0.24)" strokeWidth="10" strokeLinecap="round" />
                      <path d={hydrationTrendPath} fill="none" stroke="#7dd3fc" strokeWidth="2.5" strokeLinecap="round" />
                      {hydrationTrend.map((item, index) => {
                        const x = 12 + index * (120 / Math.max(hydrationTrend.length - 1, 1));
                        const y = 52 - (item.amount / hydrationTrendMax) * 36;
                        return <circle key={item.date} cx={x} cy={y} r="3" fill="#7dd3fc" opacity="0.95" />;
                      })}
                    </svg>
                  ) : (
                    <div style={{ minHeight: "60px", display: "grid", placeItems: "center", color: "rgba(244,241,234,0.28)", fontSize: "12px" }}>No hydration history yet</div>
                  )}
                </div>
              </div>

              <p className="hydration-message">{hydrationMessage}</p>
              <button className="hydration-open-btn" onClick={() => setWaterOpen(true)}>Open Water Tracker</button>
            </div>
          </div>

          {/* RIGHT: Today's Meals */}
          <div className="meals-panel">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <div>
                <h3 style={{ fontSize: "14px", fontWeight: 600, color: T.text, margin: "0 0 2px" }}>Today's Meals</h3>
                <p style={{ fontSize: "10px", color: T.textMuted, margin: 0 }}>View all in My Meals</p>
              </div>
              <div style={{ display: "flex", gap: "6px" }}>
                <button onClick={() => setCurrentDate(subDays(currentDate, 1))} className="icon-btn">
                  <ChevronLeft style={{ width: "13px", height: "13px", color: T.textSub }} />
                </button>
                <button onClick={() => setCurrentDate(addDays(currentDate, 1))} className="icon-btn">
                  <ChevronRight style={{ width: "13px", height: "13px", color: T.textSub }} />
                </button>
              </div>
            </div>

            {/* Macro pills */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", marginBottom: "1rem" }}>
              {[
                { label: "Carbs", val: `${eatenCarbs}g`, color: T.amber },
                { label: "Protein", val: `${eatenProtein}g`, color: "#f97316" },
                { label: "Fat", val: `${eatenFat}g`, color: "#69b8cc" },
              ].map(m => (
                <div key={m.label} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: "12px", padding: "10px 6px", textAlign: "center" }}>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: m.color }}>{m.val}</div>
                  <div style={{ fontSize: "9px", fontWeight: 600, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.1em", marginTop: "2px" }}>{m.label}</div>
                </div>
              ))}
            </div>

            {/* Log list */}
            <div className="log-list">
              {loadingLogs ? (
                <div style={{ display: "flex", justifyContent: "center", padding: "2.5rem 0" }}>
                  <Loader2 style={{ width: "24px", height: "24px", color: T.amber, animation: "spin 1s linear infinite" }} />
                </div>
              ) : todayLogs.length === 0 ? (
                <div className="meals-empty-state">
                  <div className="meals-empty-hero">
                    <Droplet style={{ width: "26px", height: "26px", color: "#7dd3fc" }} />
                  </div>
                  <p style={{ fontSize: "13px", fontWeight: 700, margin: "0 0 8px", color: T.text }}>No meals logged yet</p>
                  <p style={{ fontSize: "11px", color: T.textMuted, margin: 0, maxWidth: "220px" }}>Start your day with a calm, balanced meal. Log what you eat and keep your nutrition on track.</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {groupedMeals.map((mealGroup) => {
                    const isExpanded = expandedMeals.has(mealGroup.id);
                    const mealType = mealGroup.items[0].mealType || getMealTimeOfDay(mealGroup.time.getHours());
                    const mealColor = getMealTypeColor(mealType);
                    return (
                      <div key={mealGroup.id}>
                        <div
                          onClick={() => toggleMealExpanded(mealGroup.id)}
                          className="log-item"
                          style={{
                            background: T.surface,
                            border: `1px solid ${T.border}`,
                            borderRadius: isExpanded ? "13px 13px 0 0" : "13px",
                            cursor: "pointer",
                          }}
                          onMouseOver={e => { (e.currentTarget as HTMLElement).style.background = T.surfaceHover; }}
                          onMouseOut={e => { (e.currentTarget as HTMLElement).style.background = T.surface; }}
                        >
                          <ChevronDown
                            style={{
                              width: "14px",
                              height: "14px",
                              color: T.textSub,
                              flexShrink: 0,
                              transition: "transform 0.2s",
                              transform: isExpanded ? "rotate(0deg)" : "rotate(-90deg)",
                              marginRight: "4px",
                            }}
                          />
                          <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0, flex: 1 }}>
                            <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: `${mealColor}20`, border: `1px solid ${mealColor}40`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                              <Utensils style={{ width: "13px", height: "13px", color: mealColor }} />
                            </div>
                            <div style={{ minWidth: 0, flex: 1 }}>
                              <p style={{ fontSize: "12px", fontWeight: 600, color: T.text, margin: "0 0 2px" }}>{getMealTypeLabel(mealType)}</p>
                              <p style={{ fontSize: "9px", color: T.textMuted, margin: 0 }}>{mealGroup.items.length} item{mealGroup.items.length !== 1 ? "s" : ""} · {format(mealGroup.time, "HH:mm")}</p>
                            </div>
                          </div>
                          <div style={{ textAlign: "right", flexShrink: 0, paddingRight: "4px" }}>
                            <div style={{ fontSize: "12px", fontWeight: 700, color: T.amberLight }}>{Math.round(mealGroup.totalCalories)}</div>
                            <div style={{ fontSize: "8px", color: T.textMuted, fontWeight: 600, textTransform: "uppercase" }}>kcal</div>
                          </div>
                        </div>

                        {isExpanded && (
                          <div style={{ background: "rgba(255,255,255,0.015)", border: `1px solid ${T.border}`, borderTop: "none", borderRadius: "0 0 13px 13px", overflow: "hidden" }}>
                            {mealGroup.items.map((item, idx) => (
                              <div
                                key={item._id || idx}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "8px",
                                  padding: "8px 10px",
                                  borderTop: idx > 0 ? `1px solid ${T.border}` : "none",
                                }}
                              >
                                <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0, flex: 1 }}>
                                  <div style={{ width: "28px", height: "28px", borderRadius: "6px", background: "rgba(245,179,92,0.08)", border: "1px solid rgba(245,179,92,0.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                    <Utensils style={{ width: "11px", height: "11px", color: T.amber }} />
                                  </div>
                                  <div style={{ minWidth: 0, flex: 1 }}>
                                    <p style={{ fontSize: "11px", fontWeight: 600, color: T.text, margin: "0 0 1px", textTransform: "capitalize", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.foodName}</p>
                                    <p style={{ fontSize: "9px", color: T.textMuted, margin: 0 }}>{item.quantity} {item.unit}</p>
                                  </div>
                                </div>
                                <div style={{ textAlign: "right", flexShrink: 0 }}>
                                  <div style={{ fontSize: "11px", fontWeight: 700, color: T.amberLight }}>{item.calories}</div>
                                  <div style={{ fontSize: "8px", color: T.textMuted, fontWeight: 600 }}>kcal</div>
                                </div>
                                <button className="del-btn" onClick={(e) => { e.stopPropagation(); item._id && handleDeleteLog(item._id); }}
                                  style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "5px", padding: "4px", cursor: "pointer", display: "flex", flexShrink: 0 }}>
                                  <Trash2 style={{ width: "10px", height: "10px", color: "#ef4444" }} />
                                </button>
                              </div>
                            ))}
                            <div style={{ padding: "8px 10px", background: "rgba(255,255,255,0.02)", borderTop: `1px solid ${T.border}`, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "4px", fontSize: "9px" }}>
                              <div style={{ textAlign: "center" }}>
                                <div style={{ fontWeight: 700, color: T.amberLight }}>{mealGroup.totalCarbs.toFixed(0)}g</div>
                                <div style={{ color: T.textMuted, textTransform: "uppercase", marginTop: "1px" }}>Carbs</div>
                              </div>
                              <div style={{ textAlign: "center" }}>
                                <div style={{ fontWeight: 700, color: "#f97316" }}>{mealGroup.totalProtein.toFixed(0)}g</div>
                                <div style={{ color: T.textMuted, textTransform: "uppercase", marginTop: "1px" }}>Protein</div>
                              </div>
                              <div style={{ textAlign: "center" }}>
                                <div style={{ fontWeight: 700, color: "#69b8cc" }}>{mealGroup.totalFat.toFixed(0)}g</div>
                                <div style={{ color: T.textMuted, textTransform: "uppercase", marginTop: "1px" }}>Fat</div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <button onClick={() => setIsModalOpen(true)} className="log-btn">
              <Plus style={{ width: "16px", height: "16px" }} />
              Log New Meal
            </button>
          </div>

          {/* BOTTOM: Quick Actions */}
          <div className="quick-actions">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
              <h3 style={{ fontSize: "14px", fontWeight: 600, color: T.text, margin: 0 }}>Quick Actions</h3>
              <button style={{ fontSize: "11px", color: T.amber, background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>View All</button>
            </div>
            <div className="action-cards">
              <ActionCard color="#69b8cc" icon={<Droplet />} title="Water Tracker" sub="Stay Refreshed" onClick={() => setWaterOpen(true)} />
              <ActionCard color={T.amber} icon={<Utensils />} title="Meal Prepper" sub="Pro Feature" locked />
              <ActionCard color="#f97316" icon={<Settings />} title="Settings" sub="Edit Targets" onClick={() => setIsSettingsOpen(true)} />
            </div>
          </div>

        </div>
      </main>

      {waterOpen && (
        <div className="water-overlay" onClick={() => setWaterOpen(false)}>
          <div className="water-overlay-panel" onClick={(e) => e.stopPropagation()}>
            <div className="water-overlay-header">
              <div>
                <p className="water-card-label">Water Tracker</p>
                <h3 className="water-card-title">Hydration dashboard</h3>
              </div>
              <button className="water-close-btn" onClick={() => setWaterOpen(false)}>Close</button>
            </div>
            <div className="water-card">
              <div className="water-card-glow" />
              <div className="water-card-dots" />
              <div className="water-card-head">
                <div>
                  <p className="water-card-label">Hydration Flow</p>
                  <h3 className="water-card-title">Smart water tracking for your day</h3>
                </div>
                {goalEditOpen ? (
                  <div className="water-goal-edit-group">
                    <input type="number" min="500" step="100" value={newGoalInput} onChange={(e) => setNewGoalInput(e.target.value)} className="water-goal-input" />
                    <button onClick={updateGoal} className="water-goal-save">Save</button>
                    <button onClick={() => setGoalEditOpen(false)} className="water-goal-cancel">Cancel</button>
                  </div>
                ) : (
                  <button onClick={() => setGoalEditOpen(true)} className="water-goal-btn">
                    <Pencil style={{ width: "12px", height: "12px", color: "#f4f1ea" }} />
                    <span>Edit goal</span>
                  </button>
                )}
              </div>
              <div className="water-card-grid">
                <div className="water-main-panel">
                  <div className="water-ring-shell">
                    <svg viewBox="0 0 180 180" className="water-ring-svg">
                      <defs>
                        <linearGradient id="waterGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#60a5fa" />
                          <stop offset="100%" stopColor="#38bdf8" />
                        </linearGradient>
                      </defs>
                      <circle cx="90" cy="90" r="70" fill="rgba(255,255,255,0.04)" />
                      <circle cx="90" cy="90" r="70" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="16" />
                      <circle cx="90" cy="90" r="70" fill="none" stroke="url(#waterGradient)" strokeWidth="16"
                        strokeDasharray={`${2 * Math.PI * 70}`} strokeDashoffset={`${2 * Math.PI * 70 * (1 - hydrationPercent / 100)}`}
                        strokeLinecap="round" style={{ transition: "stroke-dashoffset 0.8s ease" }} />
                    </svg>
                    <div className="water-ring-center">
                      <span className="water-ring-number">{(waterIntake / 1000).toFixed(1)}L</span>
                      <span className="water-ring-sub">of {(waterGoal / 1000).toFixed(1)}L</span>
                    </div>
                  </div>
                  <div className="water-summary-row">
                    <div>
                      <div className="water-summary-number">{hydrationRemaining} ml</div>
                      <div className="water-summary-note">left to reach your goal</div>
                    </div>
                    <div className="water-summary-pill">{Math.round(hydrationPercent)}%</div>
                  </div>
                  <div className="water-meta-text">{hydrationMessage}</div>
                  <div className="water-buttons-row">
                    {[250, 500, 750].map((val) => (
                      <button key={val} className="water-action-btn" onClick={() => addWater(val)}>{`+${val} ml`}</button>
                    ))}
                    <div className="water-custom-wrap">
                      <input value={customAmount} onChange={(e) => setCustomAmount(e.target.value)} type="number" min="50" step="50" className="water-custom-input" />
                      <button className="water-action-btn water-action-primary" onClick={() => addWater(Number(customAmount) || 250)}>Add</button>
                    </div>
                  </div>
                </div>

                <div className="water-detail-panel">
                  <div className="water-detail-group">
                    <div className="water-detail-title">Hydration insights</div>
                    <div className="water-detail-grid">
                      <div className="water-metric-card">
                        <div className="water-metric-icon"><Flame style={{ width: "14px", height: "14px", color: "#f5b35c" }} /></div>
                        <div>
                          <div className="water-metric-value">{streakCount || 0} days</div>
                          <div className="water-metric-label">Current streak</div>
                        </div>
                      </div>
                      <div className="water-metric-card">
                        <div className="water-metric-icon"><Scale style={{ width: "14px", height: "14px", color: "#38bdf8" }} /></div>
                        <div>
                          <div className="water-metric-value">{Math.round(averageWeekly)} ml</div>
                          <div className="water-metric-label">Weekly average</div>
                        </div>
                      </div>
                      <div className="water-metric-card">
                        <div className="water-metric-icon"><Heart style={{ width: "14px", height: "14px", color: "#f472b6" }} /></div>
                        <div>
                          <div className="water-metric-value">{bestHydrationDay} ml</div>
                          <div className="water-metric-label">Best day</div>
                        </div>
                      </div>
                      <div className="water-metric-card">
                        <div className="water-metric-icon"><Activity style={{ width: "14px", height: "14px", color: "#a78bfa" }} /></div>
                        <div>
                          <div className="water-metric-value">{goalCompleteRate}%</div>
                          <div className="water-metric-label">Goal success</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="water-detail-group">
                    <div className="water-detail-title">Today’s intake timeline</div>
                    <div className="water-timeline-list">
                      {waterTimeline.length ? waterTimeline.map((item) => (
                        <div key={item.id} className="water-timeline-item">
                          <span>{item.time}</span>
                          <span>+{item.amount} ml</span>
                        </div>
                      )) : (
                        <div className="water-timeline-empty">No water additions yet. Tap a quick button.</div>
                      )}
                    </div>
                  </div>

                  <div className="water-detail-group">
                    <div className="water-detail-title">Reminder settings</div>
                    <div className="water-reminder-row">
                      <label className="water-toggle">
                        <input type="checkbox" checked={remindersEnabled} onChange={() => setRemindersEnabled(!remindersEnabled)} />
                        <span />
                        <span>Reminders</span>
                      </label>
                      <div className="water-quiet-hours">Quiet hours</div>
                    </div>
                    <div className="water-quiet-inputs">
                      <input type="text" value={quietHours} onChange={(e) => setQuietHours(e.target.value)} className="water-quiet-input" />
                      <button className="water-action-btn water-action-secondary">Save</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MOBILE BOTTOM NAV ── */}
      {isMobile && (
        <nav className="mobile-nav">
          {[
            { icon: <Home />, label: "Home", active: true, onClick: () => navigate("/dashboard") },
            { icon: <Utensils />, label: "Meals", onClick: () => navigate("/my-meals") },
            { icon: <Activity />, label: "Stats", onClick: () => navigate("/history") },
            { icon: <TrendingUp />, label: "Progress", onClick: () => navigate("/progress") },
            { icon: <Settings />, label: "Settings", onClick: () => setIsSettingsOpen(true) },
          ].map(item => (
            <button key={item.label} className={`mobile-nav-btn ${item.active ? "active" : ""}`} onClick={item.onClick}>
              {React.isValidElement(item.icon) && React.cloneElement(item.icon as React.ReactElement<any>, { style: { width: "20px", height: "20px" } })}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      )}

      {/* ── MOBILE FAB ── */}
      {isMobile && (
        <button onClick={() => setIsModalOpen(true)} className="mobile-fab">
          <Plus style={{ width: "22px", height: "22px" }} />
        </button>
      )}

      {/* ── LOG MODAL ── */}
      <Dialog.Root open={isModalOpen} onOpenChange={setIsModalOpen}>
        <Dialog.Portal>
          <Dialog.Overlay style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(12px)", zIndex: 100 }} />
          <Dialog.Content className="log-modal">
            <div className="modal-glow" />
            <div className="modal-dots" />
            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", marginBottom: "1.75rem" }}>
                <div style={{ width: "52px", height: "52px", borderRadius: "16px", background: "rgba(245,235,185,0.9)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem", border: "1px solid rgba(245,179,92,0.25)", boxShadow: "0 8px 32px rgba(245,196,123,0.25)" }}>
                  <Zap style={{ width: "22px", height: "22px", color: "#000" }} />
                </div>
                <Dialog.Title style={{ fontSize: "20px", fontWeight: 700, color: T.text, margin: "0 0 6px", letterSpacing: "-0.01em" }}>AI Food Logger</Dialog.Title>
                <Dialog.Description style={{ fontSize: "13px", color: T.textSub, margin: 0, lineHeight: 1.6 }}>
                  Describe your meal naturally.<br />
                  <span style={{ fontStyle: "italic", color: T.textMuted, fontSize: "12px" }}>"I had a large katori of dal and 2 rotis"</span>
                </Dialog.Description>
              </div>
              <textarea autoFocus placeholder="Describe your meal here..." value={inputText} onChange={e => setInputText(e.target.value)}
                style={{ width: "100%", minHeight: "120px", background: T.surface, border: `1px solid ${T.border}`, borderRadius: "16px", padding: "1rem 1.25rem", fontSize: "14px", color: T.text, outline: "none", resize: "none", fontFamily: "Inter, sans-serif", lineHeight: 1.6, boxSizing: "border-box", transition: "border-color 0.2s" }}
                onFocus={e => e.target.style.borderColor = "rgba(245,179,92,0.3)"}
                onBlur={e => e.target.style.borderColor = T.border}
              />
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", margin: "18px 0 8px" }}>
                {(["breakfast", "lunch", "snacks", "dinner"] as MealType[]).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setSelectedMealType(type)}
                    style={{
                      borderRadius: "12px",
                      padding: "10px 14px",
                      border: selectedMealType === type ? "1px solid rgba(245,179,92,0.85)" : `1px solid ${T.border}`,
                      background: selectedMealType === type ? "rgba(245,179,92,0.12)" : T.surface,
                      color: selectedMealType === type ? "#f5b35c" : T.text,
                      cursor: "pointer",
                      fontSize: "12px",
                      fontWeight: 700,
                    }}
                  >
                    {getMealTypeLabel(type)}
                  </button>
                ))}
              </div>
              <p style={{ fontSize: "10px", fontWeight: 600, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.15em", textAlign: "right", margin: "6px 0 1.25rem" }}>AI Powered</p>
              <div style={{ display: "flex", gap: "10px" }}>
                <Dialog.Close asChild>
                  <button style={{ flex: 1, padding: "13px", borderRadius: "14px", background: T.surface, border: `1px solid ${T.border}`, fontSize: "13px", fontWeight: 600, color: T.textSub, cursor: "pointer" }}>Cancel</button>
                </Dialog.Close>
                <button onClick={handleSmartLog} disabled={isLogging || !inputText.trim()}
                  style={{ flex: 2, padding: "13px", borderRadius: "14px", background: T.amberLight, border: "none", fontSize: "13px", fontWeight: 700, color: "#000", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", opacity: isLogging || !inputText.trim() ? 0.5 : 1, boxShadow: "0 8px 24px rgba(245,179,92,0.2)" }}>
                  {isLogging ? <><Loader2 style={{ width: "15px", height: "15px", animation: "spin 1s linear infinite" }} /> Processing...</> : <><Plus style={{ width: "15px", height: "15px" }} /> Add to Diary</>}
                </button>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <OnboardingModal open={isOnboardingOpen} onOpenChange={setIsOnboardingOpen} />
      <OnboardingModal open={isSettingsOpen} onOpenChange={setIsSettingsOpen} mode="settings" />

      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes waterOverlayFade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes waterPanelSlide { from { transform: translateY(20px) scale(0.98); opacity: 0; } to { transform: translateY(0) scale(1); opacity: 1; } }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 99px; }
        textarea::placeholder, input::placeholder { color: rgba(255,255,255,0.2); }

        .dash-root { min-height: 100vh; background: #050506; font-family: Inter, sans-serif; color: #f4f1ea; }

        /* ── SIDEBAR ── */
        .dash-sidebar {
          position: fixed; left: 0; top: 0; bottom: 0;
          width: 72px;
          background: rgba(8,8,10,0.96);
          border-right: 1px solid rgba(255,255,255,0.07);
          backdrop-filter: blur(24px);
          display: flex; flex-direction: column;
          padding: 1.5rem 0;
          transition: width 0.3s cubic-bezier(0.4,0,0.2,1);
          z-index: 95; overflow: hidden;
        }
        .dash-sidebar.sidebar-open { width: 224px; }

        .sidebar-logo { display: flex; align-items: center; gap: 12px; padding: 0 16px; margin-bottom: 2.5rem; overflow: hidden; }
        .logo-icon { width: 40px; height: 40px; border-radius: 12px; background: rgba(245,235,185,0.9); display: flex; align-items: center; justify-content: center; flex-shrink: 0; border: 1px solid rgba(245,179,92,0.25); box-shadow: 0 8px 24px rgba(245,196,123,0.18); }
        .logo-text { font-size: 15px; font-weight: 700; color: #f4f1ea; white-space: nowrap; opacity: 0; transform: translateX(-8px); transition: opacity 0.2s, transform 0.2s; }
        .logo-text.visible { opacity: 1; transform: translateX(0); }

        .sidebar-nav { flex: 1; display: flex; flex-direction: column; gap: 4px; padding: 0 8px; }
        .sidebar-divider { height: 1px; background: rgba(255,255,255,0.07); margin: 8px 8px; }

        .sidebar-user { display: flex; align-items: center; gap: 12px; padding: 0 16px; overflow: hidden; }
        .user-avatar { width: 36px; height: 36px; border-radius: 50%; background: rgba(245,179,92,0.15); border: 1px solid rgba(245,179,92,0.2); display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 13px; font-weight: 700; color: #f5b35c; }
        .user-info { overflow: hidden; opacity: 0; transform: translateX(-8px); transition: opacity 0.2s, transform 0.2s; white-space: nowrap; flex: 1; }
        .user-info.visible { opacity: 1; transform: translateX(0); }
        .user-name { font-size: 13px; font-weight: 600; color: #f4f1ea; }
        .user-plan { font-size: 10px; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: #f5b35c; opacity: 0.7; }

        /* ── MAIN ── */
        .dash-main { margin-left: 72px; padding: 1.75rem 1.5rem 6rem; transition: margin-left 0.3s; }

        /* ── HEADER ── */
        .dash-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem; gap: 12px; }
        .header-left { display: flex; align-items: flex-start; gap: 12px; min-width: 0; }
        .header-title { font-size: 20px; font-weight: 700; color: #f4f1ea; letter-spacing: -0.01em; }
        .header-sub { font-size: 12px; color: rgba(255,255,255,0.4); margin-top: 3px; }
        .header-right { display: flex; gap: 8px; align-items: center; flex-shrink: 0; }
        .date-pill { display: flex; align-items: center; gap: 7px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 12px; padding: 8px 12px; font-size: 11px; font-weight: 600; color: rgba(255,255,255,0.45); white-space: nowrap; }
        .notif-dot { width: 7px; height: 7px; background: #ef4444; border-radius: 50%; position: absolute; top: 9px; right: 9px; border: 1.5px solid #050506; }

        /* ── ICON BTN ── */
        .icon-btn { width: 36px; height: 36px; border-radius: 10px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); display: flex; align-items: center; justify-content: center; cursor: pointer; position: relative; transition: background 0.15s; }
        .icon-btn:hover { background: rgba(255,255,255,0.06); }
        .mobile-menu-btn { width: 36px; height: 36px; border-radius: 10px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0; }

        /* ── CONTENT GRID ── */
        .dash-grid {
          display: grid;
          gap: 14px;
          grid-template-columns: 1fr;
          grid-template-areas:
            "calorie"
            "hydrate"
            "meals"
            "actions";
        }
        .calorie-card  { grid-area: calorie; }
        .hydration-card { grid-area: hydrate; }
        .meals-panel   { grid-area: meals; }
        .quick-actions { grid-area: actions; }

        /* ── CARDS ── */
        .calorie-card {
          background: linear-gradient(145deg, #0e0b06, #0d0b05);
          border: 1px solid rgba(245,179,92,0.12);
          border-radius: 22px; padding: 1.5rem;
          position: relative; overflow: hidden;
        }
        .hydration-card {
          position: relative;
          background: linear-gradient(170deg, rgba(6,8,14,0.96), rgba(10,12,18,0.98));
          border: 1px solid rgba(56,189,248,0.18);
          border-radius: 26px; padding: 1.5rem;
          overflow: hidden;
        }
        .hydration-glow { position: absolute; right: -10%; top: -20%; width: 54%; height: 120%; border-radius: 50%; background: radial-gradient(circle, rgba(56,189,248,0.18), transparent 60%); filter: blur(50px); pointer-events: none; }
        .hydration-card::before {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: 26px;
          box-shadow: inset 0 0 0 1px rgba(255,255,255,0.035);
          pointer-events: none;
        }
        .hydration-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 14px; position: relative; z-index: 1; }
        .hydration-main { display: grid; gap: 1.2rem; position: relative; z-index: 1; }
        .hydration-summary { display: flex; justify-content: space-between; align-items: flex-end; gap: 14px; }
        .hydration-progress-row { display: grid; gap: 0.75rem; }
        .hydration-progress-track { height: 10px; border-radius: 999px; background: rgba(255,255,255,0.05); overflow: hidden; }
        .hydration-progress-fill { height: 100%; background: linear-gradient(90deg, #7dd3fc, #38bdf8); transition: width 0.8s ease; }
        .hydration-chart-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 22px; padding: 0.95rem 1rem 0.9rem; display: grid; gap: 0.8rem; }
        .hydration-chart-labels { display: flex; justify-content: space-between; align-items: center; gap: 10px; }
        .hydration-chart-shell { min-height: 86px; display: grid; place-items: center; }
        .hydration-sparkline { width: 100%; height: 100%; }
        .hydration-message { margin: 0; font-size: 12px; color: rgba(255,255,255,0.72); line-height: 1.6; }
        .hydration-open-btn { width: fit-content; margin-top: 0.2rem; padding: 12px 18px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1); background: rgba(56,189,248,0.12); color: #7dd3fc; font-size: 12px; font-weight: 700; cursor: pointer; transition: transform 0.2s, background 0.2s; }
        .hydration-open-btn:hover { transform: translateY(-1px); background: rgba(56,189,248,0.18); }

        .card-glow { position: absolute; left: -20%; top: -20%; width: 80%; height: 80%; border-radius: 50%; background: radial-gradient(ellipse, rgba(245,179,92,0.14), transparent 68%); filter: blur(40px); pointer-events: none; }
        .card-dots { position: absolute; inset: 0; opacity: 0.06; background-image: radial-gradient(circle, rgba(244,241,234,0.5) 0 1px, transparent 1.5px); background-size: 28px 28px; pointer-events: none; }

        .stats-grid { display: none; }

        .water-panel {
          position: relative;
        }
        .water-overlay {
          position: fixed;
          inset: 0;
          background: rgba(5,5,6,0.72);
          backdrop-filter: blur(12px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
          z-index: 110;
          animation: waterOverlayFade 0.24s ease;
        }
        .water-overlay-panel {
          width: min(1080px, 100%);
          max-height: min(95vh, 960px);
          overflow-y: auto;
          padding: 1rem;
          border-radius: 32px;
          background: rgba(9,9,11,0.96);
          border: 1px solid rgba(255,255,255,0.08);
          box-shadow: 0 40px 120px rgba(0,0,0,0.55);
          animation: waterPanelSlide 0.32s ease;
          position: relative;
        }
        .water-overlay-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 16px;
          margin-bottom: 1rem;
        }
        .water-close-btn {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 16px;
          color: #f4f1ea;
          padding: 10px 16px;
          cursor: pointer;
          transition: transform 0.2s, background 0.2s;
        }
        .water-close-btn:hover { transform: translateY(-1px); background: rgba(255,255,255,0.08); }
        .water-card {
          background: linear-gradient(145deg, rgba(10,10,12,0.98), rgba(10,10,12,0.92));
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 26px;
          padding: 1.5rem;
          overflow: hidden;
          position: relative;
          backdrop-filter: blur(18px);
        }
        .water-card-glow { position: absolute; right: -18%; top: -30%; width: 54%; height: 54%; border-radius: 50%; background: radial-gradient(circle, rgba(56,189,248,0.24), transparent 58%); filter: blur(40px); pointer-events: none; }
        .water-card-dots { position: absolute; inset: 0; opacity: 0.06; background-image: radial-gradient(circle, rgba(244,241,234,0.4) 0 1px, transparent 1.5px); background-size: 32px 32px; pointer-events: none; }
        .water-card-head { display: flex; justify-content: space-between; gap: 16px; align-items: flex-start; margin-bottom: 1.5rem; }
        .water-card-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.22em; color: rgba(255,255,255,0.4); margin: 0 0 6px; }
        .water-card-title { font-size: 18px; font-weight: 700; color: #f4f1ea; margin: 0; line-height: 1.15; }
        .water-goal-btn { display: inline-flex; align-items: center; gap: 8px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; color: #f4f1ea; padding: 10px 14px; font-size: 11px; font-weight: 700; cursor: pointer; transition: transform 0.2s, background 0.2s; }
        .water-goal-btn:hover { transform: translateY(-1px); background: rgba(255,255,255,0.08); }
        .water-goal-edit-group { display: inline-flex; align-items: center; gap: 8px; }
        .water-goal-input { width: 96px; min-width: 96px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); border-radius: 14px; padding: 10px 12px; color: #f4f1ea; font-size: 12px; outline: none; }
        .water-goal-save,
        .water-goal-cancel { border: none; border-radius: 14px; padding: 10px 12px; font-size: 11px; font-weight: 700; cursor: pointer; }
        .water-goal-save { background: #38bdf8; color: #050506; }
        .water-goal-cancel { background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.8); }
        .water-card-grid { display: grid; gap: 16px; grid-template-columns: 1fr; }
        .water-main-panel { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 24px; padding: 1.25rem; display: grid; gap: 1rem; }
        .water-ring-shell { position: relative; width: 180px; height: 180px; margin: 0 auto; }
        .water-ring-svg { width: 100%; height: 100%; }
        .water-ring-center { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #f4f1ea; }
        .water-ring-number { font-size: 28px; font-weight: 800; letter-spacing: -0.03em; }
        .water-ring-sub { font-size: 11px; color: rgba(255,255,255,0.45); margin-top: 4px; }
        .water-summary-row { display: flex; justify-content: space-between; align-items: center; gap: 10px; }
        .water-summary-number { font-size: 18px; font-weight: 700; color: #f4f1ea; }
        .water-summary-note { font-size: 11px; color: rgba(255,255,255,0.45); }
        .water-summary-pill { font-size: 12px; font-weight: 700; color: #38bdf8; background: rgba(56,189,248,0.12); border: 1px solid rgba(56,189,248,0.18); border-radius: 999px; padding: 8px 12px; }
        .water-meta-text { color: rgba(255,255,255,0.5); font-size: 12px; line-height: 1.6; }
        .water-buttons-row { display: grid; gap: 12px; }
        .water-action-btn { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 12px 14px; color: #f4f1ea; font-size: 12px; font-weight: 700; cursor: pointer; transition: transform 0.15s, background 0.2s; }
        .water-action-btn:hover { transform: translateY(-1px); background: rgba(255,255,255,0.08); }
        .water-action-primary { background: #38bdf8; color: #050506; border-color: rgba(56,189,248,0.4); }
        .water-action-secondary { background: rgba(255,255,255,0.06); }
        .water-custom-wrap { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
        .water-custom-input { width: 100%; min-width: 100px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 12px 14px; color: #f4f1ea; font-size: 12px; outline: none; }
        .water-detail-panel { display: grid; gap: 16px; }
        .water-detail-group { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 22px; padding: 1rem; }
        .water-detail-title { font-size: 12px; font-weight: 700; color: #f4f1ea; text-transform: uppercase; letter-spacing: 0.14em; margin-bottom: 0.9rem; }
        .water-detail-grid { display: grid; gap: 10px; }
        .water-metric-card { display: flex; align-items: center; gap: 12px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.08); border-radius: 18px; padding: 12px; }
        .water-metric-icon { width: 34px; height: 34px; border-radius: 14px; background: rgba(255,255,255,0.06); display: grid; place-items: center; }
        .water-metric-value { font-size: 14px; font-weight: 700; color: #f4f1ea; }
        .water-metric-label { font-size: 10px; color: rgba(255,255,255,0.45); text-transform: uppercase; letter-spacing: 0.12em; }
        .water-timeline-list { display: grid; gap: 10px; }
        .water-timeline-item { display: flex; justify-content: space-between; align-items: center; padding: 12px 14px; border-radius: 16px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); color: #f4f1ea; font-size: 12px; }
        .water-timeline-empty { font-size: 12px; color: rgba(255,255,255,0.45); padding: 12px 14px; border-radius: 16px; background: rgba(255,255,255,0.02); border: 1px dashed rgba(255,255,255,0.08); }
        .water-reminder-row { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; }
        .water-toggle { display: inline-flex; align-items: center; gap: 10px; cursor: pointer; font-size: 12px; color: #f4f1ea; }
        .water-toggle input { display: none; }
        .water-toggle span:first-child { width: 36px; height: 20px; border-radius: 999px; background: rgba(255,255,255,0.08); position: relative; display: inline-flex; align-items: center; padding: 3px; }
        .water-toggle span:first-child::after { content: ""; position: absolute; width: 14px; height: 14px; border-radius: 50%; background: #f4f1ea; top: 3px; left: 3px; transition: transform 0.2s ease; }
        .water-toggle input:checked + span::after { transform: translateX(16px); }
        .water-quiet-hours { font-size: 11px; color: rgba(255,255,255,0.55); }
        .water-quiet-inputs { display: grid; gap: 10px; }
        .water-quiet-input { width: 100%; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 12px 14px; color: #f4f1ea; font-size: 12px; outline: none; }

        .meals-panel {
          background: linear-gradient(180deg, rgba(3,4,7,0.98), rgba(6,7,10,0.98));
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 22px; padding: 1.25rem;
          backdrop-filter: blur(16px);
        }
        .meals-empty-state {
          display: grid;
          place-items: center;
          gap: 12px;
          min-height: 220px;
          padding: 1.6rem;
          border-radius: 22px;
          background: rgba(255,255,255,0.03);
          border: 1px dashed rgba(255,255,255,0.09);
          color: rgba(255,255,255,0.65);
        }
        .meals-empty-hero {
          width: 56px;
          height: 56px;
          display: grid;
          place-items: center;
          border-radius: 18px;
          background: rgba(56,189,248,0.14);
          border: 1px solid rgba(56,189,248,0.2);
        }
        .log-list { max-height: 280px; overflow-y: auto; display: flex; flex-direction: column; gap: 8px; padding-right: 2px; margin-bottom: 1rem; }
        .log-item { display: flex; align-items: center; gap: 8px; padding: 10px 10px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 13px; transition: background 0.15s; }
        .log-btn { width: 100%; background: #f4e7d1; border: none; border-radius: 13px; padding: 12px; font-size: 13px; font-weight: 700; color: #000; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; box-shadow: 0 8px 28px rgba(245,179,92,0.18); transition: background 0.2s, transform 0.1s; }
        .log-btn:hover { background: #fde68a; }
        .log-btn:active { transform: scale(0.98); }

        .quick-actions {
          display: grid;
          gap: 1rem;
          width: 100%;
        }
        .action-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 18px;
          align-items: stretch;
          width: 100%;
          grid-auto-rows: 1fr;
        }
        .action-cards > div {
          min-height: 160px;
        }

        @media (max-width: 1024px) {
          .action-cards {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }
        @media (max-width: 720px) {
          .action-cards {
            grid-template-columns: 1fr;
          }
        }

        /* ── MOBILE BOTTOM NAV ── */
        .mobile-nav {
          position: fixed; bottom: 0; left: 0; right: 0;
          background: rgba(8,8,10,0.96); border-top: 1px solid rgba(255,255,255,0.07);
          backdrop-filter: blur(24px);
          display: flex; z-index: 80;
          padding: 8px 0 max(8px, env(safe-area-inset-bottom));
        }
        .mobile-nav-btn { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px; background: none; border: none; cursor: pointer; color: rgba(255,255,255,0.35); font-size: 10px; font-weight: 600; padding: 6px 0; }
        .mobile-nav-btn.active { color: #f5b35c; }

        /* ── MOBILE FAB ── */
        .mobile-fab {
          position: fixed; bottom: 72px; right: 20px;
          width: 52px; height: 52px; border-radius: 16px;
          background: #f4e7d1; border: none;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 8px 28px rgba(245,179,92,0.35);
          cursor: pointer; z-index: 81; color: #000;
          transition: transform 0.15s, background 0.15s;
        }
        .mobile-fab:active { transform: scale(0.93); background: #fde68a; }

        /* ── LOG MODAL ── */
        .log-modal {
          position: fixed; left: 50%; top: 50%; transform: translate(-50%,-50%);
          background: rgba(10,10,12,0.98); border: 1px solid rgba(255,255,255,0.07);
          border-radius: 24px; padding: 2rem; z-index: 101;
          width: 92vw; max-width: 460px;
          backdrop-filter: blur(24px);
          box-shadow: 0 40px 120px rgba(0,0,0,0.8); outline: none;
          overflow: hidden;
        }
        .modal-glow { position: absolute; left: -20%; top: -20%; width: 70%; height: 70%; border-radius: 50%; background: radial-gradient(ellipse, rgba(245,179,92,0.12), transparent 68%); filter: blur(40px); pointer-events: none; }
        .modal-dots { position: absolute; inset: 0; opacity: 0.05; background-image: radial-gradient(circle, rgba(244,241,234,0.5) 0 1px, transparent 1.5px); background-size: 28px 28px; pointer-events: none; }

        /* ── TABLET: 768px+ ── */
        @media (min-width: 768px) {
          .dash-main { margin-left: 72px; padding: 2rem 2rem 3rem; }
          .header-title { font-size: 22px; }
          .dash-grid {
            grid-template-columns: 1.1fr 0.95fr;
            grid-template-areas:
              "calorie hydrate"
              "meals   meals"
              "actions actions";
          }
          .hydration-card { min-height: 340px; }
          .water-card-grid { grid-template-columns: 1.3fr 0.95fr; }
          .log-list { max-height: 320px; }
          .mobile-nav { display: none; }
          .mobile-fab { display: none; }
        }

        /* ── DESKTOP: 1200px+ ── */
        @media (min-width: 1200px) {
          .dash-main { margin-left: 72px; padding: 2rem 2.5rem 3rem; }
          .header-title { font-size: 22px; }
          .dash-grid {
            grid-template-columns: 1.2fr 0.95fr 340px;
            grid-template-rows: auto auto;
            grid-template-areas:
              "calorie hydrate meals"
              "actions actions meals";
            align-items: start;
          }
          .hydration-card { min-height: 400px; }
          .action-cards { grid-auto-rows: 1fr; }
          .meals-panel { position: sticky; top: 1.5rem; }
          .log-list { max-height: 360px; }
        }

        /* ── WIDE DESKTOP: 1500px+ ── */
        @media (min-width: 1500px) {
          .dash-grid {
            grid-template-columns: 1.25fr 1fr 380px;
          }
        }
      `}</style>
    </div>
  );
}


function MacroRing({ label, eaten, target, color }: { label: string; eaten: number; target: number; color: string }) {
  const r = 26; const circ = 2 * Math.PI * r;
  const pct = Math.min((eaten / target) * 100, 100) || 0;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "5px" }}>
      <div style={{ position: "relative", width: "64px", height: "64px", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg style={{ transform: "rotate(-90deg)", position: "absolute" }} width="64" height="64" viewBox="0 0 64 64">
          <circle cx="32" cy="32" r={r} stroke="rgba(255,255,255,0.06)" strokeWidth="5.5" fill="none" />
          <circle cx="32" cy="32" r={r} stroke={color} strokeWidth="5.5" fill="none" strokeDasharray={circ} strokeDashoffset={circ - (pct / 100) * circ} strokeLinecap="round" style={{ transition: "stroke-dashoffset 1s ease" }} />
        </svg>
        <span style={{ fontSize: "11px", fontWeight: 700, color: "rgba(255,255,255,0.8)", position: "relative" }}>{Math.round(pct)}%</span>
      </div>
      <span style={{ fontSize: "10px", fontWeight: 600, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.1em" }}>{label}</span>
      <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.22)" }}>{eaten}/{target}g</span>
    </div>
  );
}

function ActionCard({ color, icon, title, sub, locked, onClick }: { color: string; icon: React.ReactNode; title: string; sub: string; locked?: boolean; onClick?: () => void }) {
  return (
    <div style={{ borderRadius: "18px", padding: "1.3rem", background: `${color}12`, border: `1px solid ${color}22`, cursor: locked ? "default" : onClick ? "pointer" : "default", transition: "transform 0.2s", minHeight: "150px", display: "flex", flexDirection: "column", justifyContent: "space-between", position: "relative" }}
      onClick={locked ? undefined : onClick}
      onMouseOver={e => { if (!locked && onClick) (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)"; }}
      onMouseOut={e => { if (!locked && onClick) (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; }}
    >
      {locked && (
        <div style={{ position: "absolute", top: "10px", right: "10px", background: "rgba(245,179,92,0.12)", border: "1px solid rgba(245,179,92,0.2)", borderRadius: "6px", padding: "3px 7px", display: "flex", alignItems: "center", gap: "3px" }}>
          <Lock style={{ width: "9px", height: "9px", color: "#f5b35c" }} />
          <span style={{ fontSize: "8px", fontWeight: 700, color: "#f5b35c", textTransform: "uppercase", letterSpacing: "0.1em" }}>Pro</span>
        </div>
      )}
      <div style={{ width: "36px", height: "36px", borderRadius: "11px", background: `${color}18`, border: `1px solid ${color}28`, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {React.isValidElement(icon) && React.cloneElement(icon as React.ReactElement<any>, { style: { width: "17px", height: "17px", color } })}
      </div>
      <div>
        <h4 style={{ fontSize: "13px", fontWeight: 700, color: "#f4f1ea", margin: "0 0 3px", lineHeight: 1.2 }}>{title}</h4>
        <p style={{ fontSize: "9px", fontWeight: 600, color: `${color}99`, textTransform: "uppercase", letterSpacing: "0.1em", margin: 0 }}>{sub}</p>
      </div>
    </div>
  );
}
