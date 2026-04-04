import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import {
  FiGrid, FiDollarSign, FiUsers, FiBarChart2,
  FiLogOut, FiMenu, FiX, FiShield, FiSun, FiMoon
} from "react-icons/fi";

const navItems = [
  { to: "/dashboard",    icon: <FiGrid size={16} />,      label: "Dashboard",    role: "viewer" },
  { to: "/transactions", icon: <FiDollarSign size={16} />, label: "Transactions", role: "viewer" },
  { to: "/analytics",    icon: <FiBarChart2 size={16} />,  label: "Analytics",    role: "analyst" },
  { to: "/users",        icon: <FiUsers size={16} />,      label: "Users",        role: "admin" },
];

export default function Layout({ children }) {
  const { user, logout, isAdmin, isAnalyst } = useAuth();
  const { toggleTheme, isDark } = useTheme();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => { logout(); navigate("/"); };
  const canAccess = (role) => {
    if (role === "viewer")  return true;
    if (role === "analyst") return isAnalyst;
    if (role === "admin")   return isAdmin;
    return false;
  };
  const roleColor = { admin: "#ef4444", analyst: "#3b82f6", viewer: "#64748b" };

  return (
    <div className="fin-app-layout">
      {sidebarOpen && <div className="fin-overlay d-lg-none" onClick={() => setSidebarOpen(false)} />}

      <aside className={`fin-sidebar-wrap ${sidebarOpen ? "open" : ""}`}>
        <div className="fin-sidebar">
          {/* Logo */}
          <div style={{ padding: "16px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div className="logo-icon-sm">₹</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "rgba(255,255,255,0.9)", lineHeight: 1.2 }}>FinanceApp</div>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.25)", letterSpacing: 1 }}>DASHBOARD</div>
              </div>
            </div>
          </div>

          {/* User card */}
          <div style={{ padding: "12px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: "10px 12px", display: "flex", alignItems: "center", gap: 10 }}>
              <div className="fin-avatar">{user?.name?.[0]?.toUpperCase()}</div>
              <div style={{ overflow: "hidden", flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.88)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user?.name}</div>
                <span style={{ fontSize: 10, padding: "1px 7px", borderRadius: 10, fontWeight: 600, background: `${roleColor[user?.role]}20`, color: roleColor[user?.role], border: `1px solid ${roleColor[user?.role]}30` }}>
                  {user?.role?.toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          {/* Nav */}
          <nav style={{ flex: 1, paddingTop: 8 }}>
            <div className="sb-label">Navigation</div>
            {navItems.filter(i => canAccess(i.role)).map(({ to, icon, label }) => (
              <NavLink key={to} to={to}
                className={({ isActive }) => `fin-nav-item${isActive ? " active" : ""}`}
                onClick={() => setSidebarOpen(false)}>
                <span className="nav-icon">{icon}</span>
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>

          {/* Logout */}
          <div style={{ padding: "12px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <button onClick={handleLogout} style={{ width: "100%", padding: "9px", borderRadius: 10, cursor: "pointer", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.18)", color: "#f87171", fontSize: 13, fontWeight: 500, fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}>
              <FiLogOut size={14} /> Sign Out
            </button>
          </div>
        </div>
      </aside>

      <div className="fin-main">
        {/* Topbar */}
        <header className="fin-topbar">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button className="d-lg-none" style={{ background: "none", border: "none", color: "var(--text-2)", cursor: "pointer" }} onClick={() => setSidebarOpen(!sidebarOpen)}>
              {sidebarOpen ? <FiX size={20} /> : <FiMenu size={20} />}
            </button>
            <span className="d-none d-lg-block" style={{ fontSize: 13, color: "var(--text-2)" }}>
              Welcome back, <span style={{ color: "var(--text-1)", fontWeight: 600 }}>{user?.name}</span>
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "var(--text-2)" }}>
              <FiShield size={13} />
              <span className="d-none d-sm-inline" style={{ textTransform: "capitalize" }}>{user?.role}</span>
            </div>
            <button onClick={toggleTheme} title={isDark ? "Light mode" : "Dark mode"} style={{ width: 32, height: 32, borderRadius: "50%", border: "1px solid var(--border-md)", background: "var(--bg-input)", color: "var(--text-2)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {isDark ? <FiSun size={14} /> : <FiMoon size={14} />}
            </button>
            <div className="fin-avatar-sm">{user?.name?.[0]?.toUpperCase()}</div>
          </div>
        </header>
        <main className="fin-content">{children}</main>
      </div>
    </div>
  );
}
