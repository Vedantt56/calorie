import React, { useState, useEffect } from "react";
import {
  Calendar, ChevronDown, ChevronLeft, ChevronRight,
  Clock, Flame, Filter, Home, Loader2, Search, Settings,
  Trash2, TrendingUp, Utensils,
} from "lucide-react";
import { format, addDays, subDays, startOfDay } from "date-fns";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import SharedSidebar from "../components/SharedSidebar";
import { getMealTimeOfDay, getMealTypeLabel, getMealTypeColor, type MealType } from "../utils/mealTime";

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
  sidebar: "rgba(8,8,10,0.96)",
};

export default function MyMeals() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [allLogs, setAllLogs] = useState<FoodLog[]>([]);
  const [selectedMealType, setSelectedMealType] = useState<MealType | "all">("all");
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [expandedMeals, setExpandedMeals] = useState<Set<string>>(new Set());

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

  useEffect(() => {
    fetchLogs();
  }, [currentDate, user]);

  const fetchLogs = async () => {
    if (!user) return;
    try {
      setLoadingLogs(true);
      const res = await fetch("/api/food/log", {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch logs");
      const data = await res.json();
      setAllLogs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setAllLogs([]);
    } finally {
      setLoadingLogs(false);
    }
  };

  const handleDeleteLog = async (id: string) => {
    if (!user) return;
    try {
      const res = await fetch(`/api/food/log/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${user.token}` },
      });
      if (!res.ok) throw new Error("Delete failed");
      fetchLogs();
    } catch (err) {
      console.error(err);
    }
  };

  // Filter logs by selected date and meal type
  const filteredLogs = allLogs.filter((log) => {
    if (!log.createdAt) return false;
    const logDate = new Date(log.createdAt);
    const logDay = startOfDay(logDate);
    const selectedDay = startOfDay(currentDate);

    if (logDay.getTime() !== selectedDay.getTime()) return false;

    if (selectedMealType === "all") return true;

    const mealType = getMealTimeOfDay(logDate.getHours());
    return mealType === selectedMealType;
  });

  // Search filter
  const searchedLogs = filteredLogs.filter((log) =>
    (log.foodName || "").toLowerCase().includes(searchText.toLowerCase())
  );

  // Group logs by meal session (within 30 mins of each other)
  const groupedMeals = React.useMemo(() => {
    const groups: Array<{ id: string; time: Date; items: FoodLog[]; totalCalories: number; totalCarbs: number; totalProtein: number; totalFat: number }> = [];
    const sortedLogs = [...searchedLogs].sort((a, b) => {
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return timeB - timeA;
    });

    for (const log of sortedLogs) {
      const logTime = log.createdAt ? new Date(log.createdAt) : new Date();
      const lastGroup = groups[groups.length - 1];

      // Check if this log is within 30 mins of the last group
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
  }, [searchedLogs]);

  const toggleMealExpanded = (mealId: string) => {
    setExpandedMeals((prev) => {
      const newSet = new Set(prev);
      newSet.has(mealId) ? newSet.delete(mealId) : newSet.add(mealId);
      return newSet;
    });
  };

  const mealTypes: (MealType | "all")[] = ["breakfast", "lunch", "snacks", "dinner", "all"];

  return (
    <div className="my-meals-root">
      {/* SIDEBAR OVERLAY */}
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
      <SharedSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} isMobile={isMobile} activePage="meals" />

      {/* MAIN */}
      <main className="my-meals-main">
        <header className="my-meals-header">
          <div className="header-left">
            {isMobile && (
              <button onClick={() => setSidebarOpen(true)} className="mobile-menu-btn">
                <div style={{ width: "18px", display: "flex", flexDirection: "column", gap: "4px" }}>
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      style={{ height: "2px", background: T.textSub, borderRadius: "2px" }}
                    />
                  ))}
                </div>
              </button>
            )}
            <div>
              <h1 className="header-title">My Meals</h1>
              <p className="header-sub">Browse and manage all your logged meals</p>
            </div>
          </div>
          <div className="header-right">
            <div className="date-pill">
              <Calendar style={{ width: "13px", height: "13px", color: T.amber }} />
              <span>{format(currentDate, "EEE, MMM do")}</span>
            </div>
          </div>
        </header>

        {/* DATE NAVIGATION */}
        <div className="date-nav">
          <button onClick={() => setCurrentDate(subDays(currentDate, 1))} className="nav-btn">
            <ChevronLeft style={{ width: "16px", height: "16px" }} />
          </button>
          <span className="date-display">{format(currentDate, "MMM d, yyyy")}</span>
          <button onClick={() => setCurrentDate(addDays(currentDate, 1))} className="nav-btn">
            <ChevronRight style={{ width: "16px", height: "16px" }} />
          </button>
        </div>

        {/* MEAL TYPE FILTERS */}
        <div className="meal-filters">
          {mealTypes.map((type) => (
            <button
              key={type}
              onClick={() => setSelectedMealType(type)}
              className={`filter-btn ${selectedMealType === type ? "active" : ""}`}
              style={{
                background:
                  selectedMealType === type
                    ? type === "all"
                      ? T.amber + "20"
                      : getMealTypeColor(type as MealType) + "20"
                    : "transparent",
                borderColor:
                  selectedMealType === type
                    ? type === "all"
                      ? T.amber
                      : getMealTypeColor(type as MealType)
                    : T.border,
              }}
            >
              {type === "all" ? "All Meals" : getMealTypeLabel(type as MealType)}
            </button>
          ))}
        </div>

        {/* SEARCH */}
        <div className="search-container">
          <Search style={{ width: "16px", height: "16px", color: T.textMuted }} />
          <input
            type="text"
            placeholder="Search meals..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="search-input"
          />
        </div>

        {/* MEALS LIST */}
        <div className="meals-container">
          {loadingLogs ? (
            <div style={{ display: "flex", justifyContent: "center", padding: "3rem 0" }}>
              <Loader2
                style={{
                  width: "28px",
                  height: "28px",
                  color: T.amber,
                  animation: "spin 1s linear infinite",
                }}
              />
            </div>
          ) : searchedLogs.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "3rem 1.5rem",
                color: T.textMuted,
                background: T.surface,
                borderRadius: "16px",
                border: `1px dashed ${T.border}`,
              }}
            >
              <Utensils style={{ width: "32px", height: "32px", margin: "0 auto 12px", opacity: 0.3 }} />
              <p style={{ fontSize: "14px", fontWeight: 500, margin: "0 0 4px" }}>
                No meals found for this filter.
              </p>
              <p style={{ fontSize: "12px", margin: 0 }}>
                {selectedMealType === "all"
                  ? "Try selecting a different date or meal type."
                  : "Try adjusting your search or meal type filter."}
              </p>
            </div>
          ) : (
            <div className="meals-list">
              {groupedMeals.map((mealGroup, idx) => {
                const isExpanded = expandedMeals.has(mealGroup.id);
                const mealType = getMealTimeOfDay(mealGroup.time.getHours());
                const mealColor = getMealTypeColor(mealType);
                return (
                  <div key={mealGroup.id}>
                    {/* MEAL GROUP HEADER - ALWAYS VISIBLE */}
                    <div
                      onClick={() => toggleMealExpanded(mealGroup.id)}
                      className="meal-group-header"
                      style={{
                        background: T.surface,
                        border: `1px solid ${T.border}`,
                        borderRadius: isExpanded ? "14px 14px 0 0" : "14px",
                        padding: "12px 14px",
                        cursor: "pointer",
                        transition: "background 0.15s",
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                      }}
                      onMouseOver={(e) => {
                        (e.currentTarget as HTMLElement).style.background = T.surfaceHover;
                      }}
                      onMouseOut={(e) => {
                        (e.currentTarget as HTMLElement).style.background = T.surface;
                      }}
                    >
                      <ChevronDown
                        style={{
                          width: "18px",
                          height: "18px",
                          color: T.textSub,
                          flexShrink: 0,
                          transition: "transform 0.2s",
                          transform: isExpanded ? "rotate(0deg)" : "rotate(-90deg)",
                        }}
                      />

                      <div
                        style={{
                          width: "40px",
                          height: "40px",
                          borderRadius: "12px",
                          background: `${mealColor}15`,
                          border: `1px solid ${mealColor}28`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <Utensils style={{ width: "18px", height: "18px", color: mealColor }} />
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "3px" }}>
                          <p
                            style={{
                              fontSize: "14px",
                              fontWeight: 600,
                              color: T.text,
                              margin: 0,
                            }}
                          >
                            Meal {idx + 1}
                          </p>
                          <span
                            style={{
                              fontSize: "10px",
                              fontWeight: 700,
                              color: mealColor,
                              textTransform: "uppercase",
                              letterSpacing: "0.1em",
                              flexShrink: 0,
                            }}
                          >
                            {getMealTypeLabel(mealType)}
                          </span>
                        </div>
                        <p style={{ fontSize: "11px", color: T.textMuted, margin: 0 }}>
                          {mealGroup.items.length} item{mealGroup.items.length !== 1 ? "s" : ""} · {format(mealGroup.time, "HH:mm")}
                        </p>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "12px", flexShrink: 0 }}>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontSize: "15px", fontWeight: 700, color: T.amberLight }}>
                            {Math.round(mealGroup.totalCalories)}
                          </div>
                          <div style={{ fontSize: "9px", color: T.textMuted, fontWeight: 600, textTransform: "uppercase" }}>
                            kcal
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* EXPANDED ITEMS */}
                    {isExpanded && (
                      <div
                        style={{
                          background: "rgba(255,255,255,0.015)",
                          border: `1px solid ${T.border}`,
                          borderTop: "none",
                          borderRadius: "0 0 14px 14px",
                          overflow: "hidden",
                          marginBottom: "8px",
                        }}
                      >
                        <div style={{ padding: "0" }}>
                          {mealGroup.items.map((item, itemIdx) => (
                            <div
                              key={item._id || itemIdx}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "12px",
                                padding: "10px 14px",
                                borderTop: itemIdx > 0 ? `1px solid ${T.border}` : "none",
                                background: "transparent",
                              }}
                            >
                              <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0, flex: 1 }}>
                                <div
                                  style={{
                                    width: "32px",
                                    height: "32px",
                                    borderRadius: "8px",
                                    background: `${mealColor}15`,
                                    border: `1px solid ${mealColor}28`,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    flexShrink: 0,
                                  }}
                                >
                                  <Utensils style={{ width: "14px", height: "14px", color: mealColor }} />
                                </div>
                                <div style={{ minWidth: 0, flex: 1 }}>
                                  <p
                                    style={{
                                      fontSize: "13px",
                                      fontWeight: 600,
                                      color: T.text,
                                      margin: 0,
                                      textTransform: "capitalize",
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                      whiteSpace: "nowrap",
                                    }}
                                  >
                                    {item.foodName}
                                  </p>
                                  <p style={{ fontSize: "10px", color: T.textMuted, margin: 0 }}>
                                    {item.quantity} {item.unit}
                                    {item.size ? ` · ${item.size}` : ""}
                                  </p>
                                </div>
                              </div>

                              <div style={{ display: "flex", alignItems: "center", gap: "12px", flexShrink: 0 }}>
                                <div style={{ textAlign: "right", minWidth: "50px" }}>
                                  <div style={{ fontSize: "13px", fontWeight: 700, color: T.amberLight }}>
                                    {item.calories}
                                  </div>
                                  <div style={{ fontSize: "8px", color: T.textMuted, fontWeight: 600, textTransform: "uppercase" }}>
                                    kcal
                                  </div>
                                </div>
                              </div>

                              <button
                                className="del-btn"
                                onClick={() => item._id && handleDeleteLog(item._id)}
                                style={{
                                  background: "rgba(239,68,68,0.1)",
                                  border: "1px solid rgba(239,68,68,0.2)",
                                  borderRadius: "6px",
                                  padding: "6px",
                                  cursor: "pointer",
                                  display: "flex",
                                  transition: "opacity 0.15s",
                                  flexShrink: 0,
                                }}
                              >
                                <Trash2 style={{ width: "12px", height: "12px", color: "#ef4444" }} />
                              </button>
                            </div>
                          ))}
                        </div>

                        {/* MEAL BREAKDOWN FOOTER */}
                        <div
                          style={{
                            padding: "12px 14px",
                            background: "rgba(255,255,255,0.02)",
                            borderTop: `1px solid ${T.border}`,
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr 1fr 1fr",
                            gap: "8px",
                          }}
                        >
                          <div style={{ textAlign: "center" }}>
                            <div style={{ fontSize: "12px", fontWeight: 700, color: T.amberLight }}>
                              {Math.round(mealGroup.totalCalories)}
                            </div>
                            <div style={{ fontSize: "8px", color: T.textMuted, fontWeight: 600, textTransform: "uppercase", marginTop: "2px" }}>
                              Kcal
                            </div>
                          </div>
                          <div style={{ textAlign: "center" }}>
                            <div style={{ fontSize: "12px", fontWeight: 700, color: "#fbbf24" }}>
                              {mealGroup.totalCarbs.toFixed(1)}g
                            </div>
                            <div style={{ fontSize: "8px", color: T.textMuted, fontWeight: 600, textTransform: "uppercase", marginTop: "2px" }}>
                              Carbs
                            </div>
                          </div>
                          <div style={{ textAlign: "center" }}>
                            <div style={{ fontSize: "12px", fontWeight: 700, color: "#f97316" }}>
                              {mealGroup.totalProtein.toFixed(1)}g
                            </div>
                            <div style={{ fontSize: "8px", color: T.textMuted, fontWeight: 600, textTransform: "uppercase", marginTop: "2px" }}>
                              Protein
                            </div>
                          </div>
                          <div style={{ textAlign: "center" }}>
                            <div style={{ fontSize: "12px", fontWeight: 700, color: "#69b8cc" }}>
                              {mealGroup.totalFat.toFixed(1)}g
                            </div>
                            <div style={{ fontSize: "8px", color: T.textMuted, fontWeight: 600, textTransform: "uppercase", marginTop: "2px" }}>
                              Fat
                            </div>
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
      </main>

      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 99px; }

        .my-meals-root {
          min-height: 100vh;
          background: #050506;
          font-family: Inter, sans-serif;
          color: #f4f1ea;
        }

        /* SIDEBAR */
        .my-meals-sidebar {
          position: fixed;
          left: 0;
          top: 0;
          bottom: 0;
          width: 72px;
          background: rgba(8, 8, 10, 0.96);
          border-right: 1px solid rgba(255, 255, 255, 0.07);
          backdrop-filter: blur(24px);
          display: flex;
          flex-direction: column;
          padding: 1.5rem 0;
          transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 95;
          overflow: hidden;
        }
        .my-meals-sidebar.sidebar-open { width: 224px; }

        .sidebar-logo {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 0 16px;
          margin-bottom: 2.5rem;
          overflow: hidden;
        }
        .logo-icon {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          background: rgba(245, 235, 185, 0.9);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          border: 1px solid rgba(245, 179, 92, 0.25);
          box-shadow: 0 8px 24px rgba(245, 196, 123, 0.18);
        }
        .logo-text {
          font-size: 15px;
          font-weight: 700;
          color: #f4f1ea;
          white-space: nowrap;
          opacity: 0;
          transform: translateX(-8px);
          transition: opacity 0.2s, transform 0.2s;
        }
        .logo-text.visible { opacity: 1; transform: translateX(0); }

        .sidebar-nav {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 4px;
          padding: 0 8px;
        }
        .sidebar-divider {
          height: 1px;
          background: rgba(255, 255, 255, 0.07);
          margin: 8px 8px;
        }

        .sidebar-user {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 0 16px;
          overflow: hidden;
        }
        .user-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: rgba(245, 179, 92, 0.15);
          border: 1px solid rgba(245, 179, 92, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          font-size: 13px;
          font-weight: 700;
          color: #f5b35c;
        }
        .user-info {
          overflow: hidden;
          opacity: 0;
          transform: translateX(-8px);
          transition: opacity 0.2s, transform 0.2s;
          white-space: nowrap;
          flex: 1;
        }
        .user-info.visible { opacity: 1; transform: translateX(0); }
        .user-name { font-size: 13px; font-weight: 600; color: #f4f1ea; margin: 0; }
        .user-plan {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #f5b35c;
          opacity: 0.7;
          margin: 0;
        }

        /* MAIN */
        .my-meals-main {
          margin-left: 72px;
          padding: 1.75rem 1.5rem 3rem;
          transition: margin-left 0.3s;
        }

        /* HEADER */
        .my-meals-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1.5rem;
          gap: 12px;
        }
        .header-left {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          min-width: 0;
        }
        .header-title {
          font-size: 24px;
          font-weight: 700;
          color: #f4f1ea;
          letter-spacing: -0.01em;
          margin: 0;
        }
        .header-sub {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.4);
          margin-top: 3px;
        }
        .header-right {
          display: flex;
          gap: 8px;
          align-items: center;
          flex-shrink: 0;
        }
        .date-pill {
          display: flex;
          align-items: center;
          gap: 7px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: 12px;
          padding: 8px 12px;
          font-size: 11px;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.45);
          white-space: nowrap;
        }
        .mobile-menu-btn {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.07);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          flex-shrink: 0;
        }

        /* DATE NAVIGATION */
        .date-nav {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          margin-bottom: 1.5rem;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: 16px;
        }
        .nav-btn {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.07);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 0.15s;
          color: rgba(255, 255, 255, 0.45);
        }
        .nav-btn:hover { background: rgba(255, 255, 255, 0.06); }
        .date-display {
          font-size: 14px;
          font-weight: 600;
          color: #f4f1ea;
          min-width: 140px;
          text-align: center;
        }

        /* MEAL FILTERS */
        .meal-filters {
          display: flex;
          gap: 8px;
          margin-bottom: 1.5rem;
          overflow-x: auto;
          padding-bottom: 4px;
        }
        .filter-btn {
          padding: 8px 14px;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.07);
          background: transparent;
          font-size: 12px;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.45);
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.2s;
        }
        .filter-btn.active {
          color: #f4f1ea;
        }
        .filter-btn:hover {
          background: rgba(255, 255, 255, 0.04);
        }

        /* SEARCH */
        .search-container {
          display: flex;
          align-items: center;
          gap: 10px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: 14px;
          padding: 10px 14px;
          margin-bottom: 1.5rem;
        }
        .search-input {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          color: #f4f1ea;
          font-size: 13px;
          font-family: Inter, sans-serif;
        }
        .search-input::placeholder {
          color: rgba(255, 255, 255, 0.2);
        }

        /* MEALS LIST */
        .meals-container {
          display: flex;
          flex-direction: column;
          gap: 1px;
        }
        .meals-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .meal-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 14px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: 14px;
          transition: background 0.15s;
        }
        .del-btn {
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: opacity 0.15s;
        }

        /* TABLET */
        @media (min-width: 768px) {
          .my-meals-main { margin-left: 72px; padding: 2rem 2rem 3rem; }
          .header-title { font-size: 26px; }
          .meal-filters { overflow-x: visible; }
        }

        /* DESKTOP */
        @media (min-width: 1200px) {
          .my-meals-main { margin-left: 72px; padding: 2rem 2.5rem 3rem; }
          .header-title { font-size: 28px; }
          .meals-list { gap: 10px; }
        }
      `}</style>
    </div>
  );
}


