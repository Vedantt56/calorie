import React, { useState, useEffect } from "react";
import {
  Calendar, TrendingUp, TrendingDown, Flame, Loader2
} from "lucide-react";
import { format, subDays } from "date-fns";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import SharedSidebar from "../components/SharedSidebar";

type DailyLog = {
  date: string;
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
  meals: number;
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

export default function History() {
  const { user, logout, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [loading, setLoading] = useState(true);
  const [dailyLogs, setDailyLogs] = useState<DailyLog[]>([]);
  const [dateRange, setDateRange] = useState<"7days" | "30days" | "90days">("30days");

  const daysToFetch = dateRange === "7days" ? 7 : dateRange === "30days" ? 30 : 90;

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!authLoading && !user) navigate("/login");
  }, [user, authLoading, navigate]);

  useEffect(() => {
    fetchHistory();
  }, [dateRange, user]);

  const fetchHistory = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const historyData: DailyLog[] = [];

      for (let i = daysToFetch - 1; i >= 0; i--) {
        const date = subDays(new Date(), i);
        const dateStr = format(date, "yyyy-MM-dd");

        const res = await fetch(`/api/food/log?date=${dateStr}`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });

        if (res.ok) {
          const logs = await res.json();
          const daily = {
            date: dateStr,
            calories: 0,
            carbs: 0,
            protein: 0,
            fat: 0,
            meals: logs.length,
          };

          logs.forEach((log: any) => {
            daily.calories += log.calories || 0;
            daily.carbs += log.carbs || 0;
            daily.protein += log.protein || 0;
            daily.fat += log.fat || 0;
          });

          historyData.push(daily);
        }
      }

      setDailyLogs(historyData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    avgCalories: Math.round(dailyLogs.reduce((a, l) => a + l.calories, 0) / (dailyLogs.length || 1)),
    avgProtein: +(dailyLogs.reduce((a, l) => a + l.protein, 0) / (dailyLogs.length || 1)).toFixed(1),
    avgCarbs: +(dailyLogs.reduce((a, l) => a + l.carbs, 0) / (dailyLogs.length || 1)).toFixed(1),
    avgFat: +(dailyLogs.reduce((a, l) => a + l.fat, 0) / (dailyLogs.length || 1)).toFixed(1),
    maxCalories: Math.max(...dailyLogs.map(l => l.calories), 0),
    minCalories: Math.min(...dailyLogs.filter(l => l.calories > 0).map(l => l.calories), 0),
  };

  const getCalorieStatus = (cal: number) => {
    const target = user?.targetCalories || 2000;
    if (cal === 0) return "empty";
    if (cal < target - 200) return "low";
    if (cal > target + 200) return "high";
    return "good";
  };

  return (
    <div className="dash-root" style={{ background: T.bg }}>
      {isMobile && sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(4px)",
            zIndex: 90,
          }}
        />
      )}

      {/* SHARED SIDEBAR */}
      <SharedSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} isMobile={isMobile} activePage="history" />

      {/* MAIN CONTENT */}
      <main className="dash-main">
        <header className="dash-header">
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
              <h1 className="header-title">History</h1>
              <p className="header-sub">Track your nutrition journey over time.</p>
            </div>
          </div>
        </header>

        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
            <Loader2 style={{ width: "24px", height: "24px", color: T.amber, animation: "spin 1s linear infinite" }} />
          </div>
        ) : (
          <div style={{ display: "grid", gap: "20px" }}>
            {/* Range Selector */}
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {(["7days", "30days", "90days"] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setDateRange(range)}
                  style={{
                    padding: "8px 14px",
                    borderRadius: "10px",
                    border: "1px solid " + (dateRange === range ? T.amber : T.border),
                    background: dateRange === range ? "rgba(245,179,92,0.1)" : T.surface,
                    color: dateRange === range ? T.amber : T.textSub,
                    fontSize: "12px",
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  {range === "7days" ? "7 Days" : range === "30days" ? "30 Days" : "90 Days"}
                </button>
              ))}
            </div>

            {/* Stats Summary */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                gap: "12px",
              }}
            >
              <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: "16px", padding: "16px" }}>
                <div style={{ fontSize: "11px", color: T.textMuted, textTransform: "uppercase", fontWeight: 600, marginBottom: "8px" }}>Avg Daily</div>
                <div style={{ fontSize: "24px", fontWeight: 700, color: T.amberLight }}>{stats.avgCalories}</div>
                <div style={{ fontSize: "9px", color: T.textMuted, marginTop: "4px" }}>kcal/day</div>
              </div>

              <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: "16px", padding: "16px" }}>
                <div style={{ fontSize: "11px", color: T.textMuted, textTransform: "uppercase", fontWeight: 600, marginBottom: "8px" }}>Avg Protein</div>
                <div style={{ fontSize: "24px", fontWeight: 700, color: "#f97316" }}>{stats.avgProtein}g</div>
              </div>

              <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: "16px", padding: "16px" }}>
                <div style={{ fontSize: "11px", color: T.textMuted, textTransform: "uppercase", fontWeight: 600, marginBottom: "8px" }}>Avg Carbs</div>
                <div style={{ fontSize: "24px", fontWeight: 700, color: T.amber }}>{stats.avgCarbs}g</div>
              </div>

              <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: "16px", padding: "16px" }}>
                <div style={{ fontSize: "11px", color: T.textMuted, textTransform: "uppercase", fontWeight: 600, marginBottom: "8px" }}>Avg Fat</div>
                <div style={{ fontSize: "24px", fontWeight: 700, color: "#69b8cc" }}>{stats.avgFat}g</div>
              </div>
            </div>

            {/* Daily Log Table */}
            <div
              style={{
                background: T.surface,
                border: `1px solid ${T.border}`,
                borderRadius: "16px",
                overflow: "hidden",
              }}
            >
              <div style={{ padding: "16px", borderBottom: `1px solid ${T.border}` }}>
                <h3 style={{ fontSize: "14px", fontWeight: 600, color: T.text, margin: 0 }}>Daily Breakdown</h3>
              </div>

              <div style={{ maxHeight: "500px", overflowY: "auto" }}>
                {dailyLogs.length === 0 ? (
                  <div style={{ padding: "32px 16px", textAlign: "center", color: T.textMuted }}>
                    No data available
                  </div>
                ) : (
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ background: "rgba(255,255,255,0.02)", borderBottom: `1px solid ${T.border}` }}>
                        <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "11px", fontWeight: 600, color: T.textMuted, textTransform: "uppercase" }}>Date</th>
                        <th style={{ padding: "12px 16px", textAlign: "right", fontSize: "11px", fontWeight: 600, color: T.textMuted, textTransform: "uppercase" }}>Calories</th>
                        <th style={{ padding: "12px 16px", textAlign: "right", fontSize: "11px", fontWeight: 600, color: T.textMuted, textTransform: "uppercase" }}>Protein</th>
                        <th style={{ padding: "12px 16px", textAlign: "right", fontSize: "11px", fontWeight: 600, color: T.textMuted, textTransform: "uppercase" }}>Carbs</th>
                        <th style={{ padding: "12px 16px", textAlign: "right", fontSize: "11px", fontWeight: 600, color: T.textMuted, textTransform: "uppercase" }}>Fat</th>
                        <th style={{ padding: "12px 16px", textAlign: "right", fontSize: "11px", fontWeight: 600, color: T.textMuted, textTransform: "uppercase" }}>Meals</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...dailyLogs].reverse().map((log, idx) => {
                        const status = getCalorieStatus(log.calories);
                        return (
                          <tr
                            key={log.date}
                            style={{
                              borderBottom: `1px solid ${T.border}`,
                              background: idx % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)",
                            }}
                          >
                            <td style={{ padding: "12px 16px", fontSize: "12px", fontWeight: 500 }}>
                              {format(new Date(log.date), "EEE, MMM d")}
                            </td>
                            <td
                              style={{
                                padding: "12px 16px",
                                textAlign: "right",
                                fontSize: "12px",
                                fontWeight: 600,
                                color:
                                  status === "empty"
                                    ? T.textMuted
                                    : status === "low"
                                      ? "#fbbf24"
                                      : status === "high"
                                        ? "#f87171"
                                        : T.amberLight,
                              }}
                            >
                              {log.calories}
                            </td>
                            <td style={{ padding: "12px 16px", textAlign: "right", fontSize: "12px", fontWeight: 500, color: "#f97316" }}>
                              {log.protein.toFixed(0)}g
                            </td>
                            <td style={{ padding: "12px 16px", textAlign: "right", fontSize: "12px", fontWeight: 500, color: T.amber }}>
                              {log.carbs.toFixed(0)}g
                            </td>
                            <td style={{ padding: "12px 16px", textAlign: "right", fontSize: "12px", fontWeight: 500, color: "#69b8cc" }}>
                              {log.fat.toFixed(0)}g
                            </td>
                            <td style={{ padding: "12px 16px", textAlign: "right", fontSize: "12px", fontWeight: 500, color: T.textSub }}>
                              {log.meals}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {/* Insights */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "12px",
              }}
            >
              <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: "16px", padding: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                  <TrendingUp style={{ width: "14px", height: "14px", color: T.amber }} />
                  <span style={{ fontSize: "11px", fontWeight: 600, color: T.textMuted, textTransform: "uppercase" }}>Peak Day</span>
                </div>
                <div style={{ fontSize: "18px", fontWeight: 700, color: T.amberLight }}>{stats.maxCalories}</div>
                <div style={{ fontSize: "9px", color: T.textMuted, marginTop: "4px" }}>kcal</div>
              </div>

              <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: "16px", padding: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                  <TrendingDown style={{ width: "14px", height: "14px", color: "#fbbf24" }} />
                  <span style={{ fontSize: "11px", fontWeight: 600, color: T.textMuted, textTransform: "uppercase" }}>Lowest Day</span>
                </div>
                <div style={{ fontSize: "18px", fontWeight: 700, color: "#fbbf24" }}>
                  {stats.minCalories || "N/A"}
                </div>
                <div style={{ fontSize: "9px", color: T.textMuted, marginTop: "4px" }}>kcal</div>
              </div>

              <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: "16px", padding: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                  <Flame style={{ width: "14px", height: "14px", color: "#f97316" }} />
                  <span style={{ fontSize: "11px", fontWeight: 600, color: T.textMuted, textTransform: "uppercase" }}>Logged Days</span>
                </div>
                <div style={{ fontSize: "18px", fontWeight: 700, color: "#f97316" }}>
                  {dailyLogs.filter((l) => l.meals > 0).length}/{dailyLogs.length}
                </div>
                <div style={{ fontSize: "9px", color: T.textMuted, marginTop: "4px" }}>days</div>
              </div>
            </div>
          </div>
        )}
      </main>

      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 99px; }

        .dash-root { min-height: 100vh; background: #050506; font-family: Inter, sans-serif; color: #f4f1ea; }

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

        .dash-main { margin-left: 72px; padding: 1.75rem 1.5rem 6rem; transition: margin-left 0.3s; }

        .dash-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem; gap: 12px; }
        .header-left { display: flex; align-items: flex-start; gap: 12px; min-width: 0; }
        .header-title { font-size: 20px; font-weight: 700; color: #f4f1ea; letter-spacing: -0.01em; }
        .header-sub { font-size: 12px; color: rgba(255,255,255,0.4); margin-top: 3px; }
        .mobile-menu-btn { width: 36px; height: 36px; border-radius: 10px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0; }

        @media (max-width: 768px) {
          .dash-main { margin-left: 0; padding: 1.25rem; }
          table { font-size: 10px; }
          td, th { padding: 8px 8px !important; }
        }
      `}</style>
    </div>
  );
}
