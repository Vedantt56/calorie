import React from "react";
import { Flame, LogOut, Home, Utensils, TrendingUp, Calendar, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

type SideNavItemProps = {
  icon: React.ReactElement<any>;
  label: string;
  active?: boolean;
  expanded: boolean;
  onClick?: () => void;
};

const SideNavItem: React.FC<SideNavItemProps> = ({ icon, label, active, expanded, onClick }) => (
  <button
    onClick={onClick}
    style={{
      width: "100%",
      display: "flex",
      alignItems: "center",
      gap: "12px",
      padding: "12px 16px",
      borderRadius: "12px",
      border: active ? "1px solid rgba(245,179,92,0.25)" : "1px solid transparent",
      background: active ? "rgba(245,179,92,0.08)" : "transparent",
      color: active ? "#f5b35c" : "rgba(255,255,255,0.45)",
      fontSize: "13px",
      fontWeight: 600,
      cursor: "pointer",
      transition: "all 0.2s",
      overflow: "hidden",
      whiteSpace: "nowrap",
    }}
  >
    {React.cloneElement(icon, {
      style: { width: "16px", height: "16px", flexShrink: 0 },
    })}
    <span
      style={{
        opacity: expanded ? 1 : 0,
        transform: expanded ? "translateX(0)" : "translateX(-8px)",
        transition: "opacity 0.2s, transform 0.2s",
      }}
    >
      {label}
    </span>
  </button>
);

interface SharedSidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  isMobile: boolean;
  activePage?: "dashboard" | "meals" | "progress" | "history";
  onSettingsClick?: () => void;
}

export default function SharedSidebar({
  sidebarOpen,
  setSidebarOpen,
  isMobile,
  activePage,
  onSettingsClick,
}: SharedSidebarProps) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const navItems = [
    { icon: <Home />, label: "Dashboard", id: "dashboard", onClick: () => navigate("/dashboard") },
    { icon: <Utensils />, label: "My Meals", id: "meals", onClick: () => navigate("/my-meals") },
    { icon: <TrendingUp />, label: "Progress", id: "progress", onClick: () => navigate("/progress") },
    { icon: <Calendar />, label: "History", id: "history", onClick: () => navigate("/history") },
  ];

  return (
    <aside
      className="shared-sidebar"
      style={{
        position: "fixed",
        left: 0,
        top: 0,
        bottom: 0,
        width: sidebarOpen ? "224px" : "72px",
        background: "rgba(8,8,10,0.96)",
        borderRight: "1px solid rgba(255,255,255,0.07)",
        backdropFilter: "blur(24px)",
        display: "flex",
        flexDirection: "column",
        padding: "1.5rem 0",
        transition: "width 0.3s cubic-bezier(0.4,0,0.2,1)",
        zIndex: 95,
        overflow: "hidden",
      }}
      onMouseEnter={() => !isMobile && setSidebarOpen(true)}
      onMouseLeave={() => !isMobile && setSidebarOpen(false)}
    >
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "0 16px", marginBottom: "2.5rem", overflow: "hidden" }}>
        <div
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "12px",
            background: "rgba(245,235,185,0.9)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            border: "1px solid rgba(245,179,92,0.25)",
            boxShadow: "0 8px 24px rgba(245,196,123,0.18)",
          }}
        >
          <Flame style={{ width: "18px", height: "18px", color: "#000" }} />
        </div>
        <span
          style={{
            fontSize: "15px",
            fontWeight: 700,
            color: "#f4f1ea",
            whiteSpace: "nowrap",
            opacity: sidebarOpen ? 1 : 0,
            transform: sidebarOpen ? "translateX(0)" : "translateX(-8px)",
            transition: "opacity 0.2s, transform 0.2s",
          }}
        >
          CalTrack
        </span>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: "4px", padding: "0 8px" }}>
        {navItems.map((item) => (
          <SideNavItem
            key={item.id}
            icon={item.icon}
            label={item.label}
            active={activePage === item.id}
            expanded={sidebarOpen}
            onClick={item.onClick}
          />
        ))}
        <div style={{ height: "1px", background: "rgba(255,255,255,0.07)", margin: "8px 8px" }} />
        <SideNavItem
          icon={<Settings />}
          label="Settings"
          expanded={sidebarOpen}
          onClick={onSettingsClick || (() => navigate("/dashboard", { state: { openSettings: true } }))}
        />
      </nav>

      {/* User */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          padding: "0 16px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            background: "rgba(245,179,92,0.15)",
            border: "1px solid rgba(245,179,92,0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            fontSize: "13px",
            fontWeight: 700,
            color: "#f5b35c",
          }}
        >
          {(user?.name || "G")[0].toUpperCase()}
        </div>
        <div
          style={{
            overflow: "hidden",
            opacity: sidebarOpen ? 1 : 0,
            transform: sidebarOpen ? "translateX(0)" : "translateX(-8px)",
            transition: "opacity 0.2s, transform 0.2s",
            whiteSpace: "nowrap",
            flex: 1,
          }}
        >
          <p style={{ fontSize: "13px", fontWeight: 600, color: "#f4f1ea", margin: "0 0 2px" }}>
            {user?.name || "Guest"}
          </p>
          <p
            style={{
              fontSize: "10px",
              fontWeight: 600,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "#f5b35c",
              opacity: 0.7,
              margin: 0,
            }}
          >
            Premium
          </p>
        </div>
        {sidebarOpen && (
          <LogOut
            onClick={logout}
            style={{
              width: "15px",
              height: "15px",
              color: "rgba(255,255,255,0.24)",
              cursor: "pointer",
              flexShrink: 0,
              marginLeft: "auto",
            }}
          />
        )}
      </div>
    </aside>
  );
}
