import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import toast from "react-hot-toast";
import {
  FiBarChart2, FiShield, FiDollarSign, FiUsers,
  FiTrendingUp, FiLock, FiEye, FiEyeOff, FiX,
  FiSun, FiMoon, FiArrowRight, FiZap
} from "react-icons/fi";

// ── Auth Modal Component ───────────────────────────────────────
function AuthModal({ mode, role, onClose, onSuccess }) {
  const { login, register } = useAuth();
  const [tab, setTab] = useState(mode); // "login" | "register"
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(() => {
    // Pre-fill demo credentials based on selected role
    if (mode === "login") {
      const creds = {
        admin:   { email: "admin@finance.com",    password: "admin123" },
        analyst: { email: "analyst@finance.com",  password: "analyst123" },
        viewer:  { email: "viewer@finance.com",   password: "viewer123" },
      };
      return { ...creds[role] || {}, name: "", confirmPw: "", regRole: "viewer" };
    }
    return { name: "", email: "", password: "", confirmPw: "", regRole: role || "viewer" };
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) return toast.error("Fill in both fields");
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.name}!`);
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid email or password");
    } finally { setLoading(false); }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) return toast.error("Fill all required fields");
    if (form.password.length < 6) return toast.error("Password must be at least 6 characters");
    setLoading(true);
    try {
      const user = await register({ name: form.name, email: form.email, password: form.password, role: form.regRole });
      toast.success(`Welcome, ${user.name}!`);
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally { setLoading(false); }
  };

  const roleLabel = { admin: "Admin", analyst: "Analyst", viewer: "Viewer" };
  const roleColor = { admin: "#ef4444", analyst: "#3b82f6", viewer: "#64748b" };

  return (
    <div className="auth-overlay">
      <div className="auth-overlay-bg" onClick={onClose} />
      <div className="auth-modal">
        <button className="auth-modal-close" onClick={onClose}><FiX size={14} /></button>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ width: 48, height: 48, background: "linear-gradient(135deg,#3b82f6,#8b5cf6)", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 800, color: "white", margin: "0 auto 12px" }}>₹</div>
          <h4 style={{ fontSize: 18, fontWeight: 800, color: "var(--text-1)", marginBottom: 4 }}>
            {tab === "login" ? "Welcome back" : "Create account"}
          </h4>
          {role && (
            <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, background: `${roleColor[role]}18`, color: roleColor[role], border: `1px solid ${roleColor[role]}30`, fontWeight: 600 }}>
              {roleLabel[role]} Access
            </span>
          )}
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", background: "var(--bg-input)", borderRadius: 10, padding: 3, marginBottom: 22, border: "1px solid var(--border)" }}>
          {["login", "register"].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              flex: 1, padding: "8px", borderRadius: 8, border: "none", cursor: "pointer",
              background: tab === t ? "var(--accent)" : "transparent",
              color: tab === t ? "white" : "var(--text-2)",
              fontWeight: 600, fontSize: 13, transition: "all 0.2s",
              fontFamily: "inherit"
            }}>
              {t === "login" ? "Sign In" : "Sign Up"}
            </button>
          ))}
        </div>

        {/* Login Form */}
        {tab === "login" && (
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: 14 }}>
              <label className="fin-label">Email Address</label>
              <input className="fin-input" type="email" placeholder="you@example.com"
                value={form.email} onChange={e => set("email", e.target.value)} />
            </div>
            <div style={{ marginBottom: 20, position: "relative" }}>
              <label className="fin-label">Password</label>
              <input className="fin-input" type={showPw ? "text" : "password"} placeholder="••••••••"
                value={form.password} onChange={e => set("password", e.target.value)}
                style={{ paddingRight: 40 }} />
              <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: "absolute", right: 12, bottom: 10, background: "none", border: "none", color: "var(--text-3)", cursor: "pointer" }}>
                {showPw ? <FiEyeOff size={15} /> : <FiEye size={15} />}
              </button>
            </div>
            <button type="submit" className="fin-btn-primary" disabled={loading}
              style={{ width: "100%", justifyContent: "center", padding: "11px" }}>
              {loading ? <span className="spinner-border spinner-border-sm" /> : "Sign In →"}
            </button>
          </form>
        )}

        {/* Register Form */}
        {tab === "register" && (
          <form onSubmit={handleRegister}>
            <div style={{ marginBottom: 12 }}>
              <label className="fin-label">Full Name</label>
              <input className="fin-input" placeholder="Rahul Sharma"
                value={form.name} onChange={e => set("name", e.target.value)} />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label className="fin-label">Email Address</label>
              <input className="fin-input" type="email" placeholder="you@example.com"
                value={form.email} onChange={e => set("email", e.target.value)} />
            </div>
            <div style={{ marginBottom: 12, position: "relative" }}>
              <label className="fin-label">Password</label>
              <input className="fin-input" type={showPw ? "text" : "password"} placeholder="Min 6 characters"
                value={form.password} onChange={e => set("password", e.target.value)}
                style={{ paddingRight: 40 }} />
              <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: "absolute", right: 12, bottom: 10, background: "none", border: "none", color: "var(--text-3)", cursor: "pointer" }}>
                {showPw ? <FiEyeOff size={15} /> : <FiEye size={15} />}
              </button>
            </div>
            <div style={{ marginBottom: 20 }}>
              <label className="fin-label">Role</label>
              <select className="fin-input" value={form.regRole} onChange={e => set("regRole", e.target.value)}>
                <option value="viewer">Viewer — View records only</option>
                <option value="analyst">Analyst — View + Analytics</option>
                <option value="admin">Admin — Full access</option>
              </select>
            </div>
            <button type="submit" className="fin-btn-primary" disabled={loading}
              style={{ width: "100%", justifyContent: "center", padding: "11px" }}>
              {loading ? <span className="spinner-border spinner-border-sm" /> : "Create Account →"}
            </button>
          </form>
        )}

        {/* Demo hint for login */}
        {tab === "login" && (
          <div style={{ marginTop: 16, padding: "10px 12px", background: "rgba(59,130,246,0.07)", border: "1px solid rgba(59,130,246,0.15)", borderRadius: 10, fontSize: 11, color: "var(--text-2)", lineHeight: 1.6 }}>
            <span style={{ color: "var(--accent)", fontWeight: 600 }}>Demo credentials pre-filled</span> based on selected role. Click Sign In to proceed.
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Landing Page ──────────────────────────────────────────
export default function Landing() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const [selectedRole, setSelectedRole] = useState("viewer");
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState("login");

  // If already logged in, redirect
  if (user) { navigate("/dashboard"); return null; }

  const openAuth = (mode, role) => {
    setAuthMode(mode);
    if (role) setSelectedRole(role);
    setShowAuth(true);
  };

  const onAuthSuccess = () => {
    setShowAuth(false);
    navigate("/dashboard");
  };

  const features = [
    { icon: "📊", color: "#3b82f6", bg: "rgba(59,130,246,0.1)", title: "Real-time Analytics", desc: "Interactive charts showing income vs expenses, monthly trends, and category breakdowns with beautiful visualizations." },
    { icon: "🔐", color: "#8b5cf6", bg: "rgba(139,92,246,0.1)", title: "Role-Based Access", desc: "Three-tier access control — Admin, Analyst, and Viewer — each with precisely defined permissions." },
    { icon: "💸", color: "#10b981", bg: "rgba(16,185,129,0.1)", title: "Transaction Management", desc: "Full CRUD for financial records with filtering, search, pagination, and soft delete support." },
    { icon: "🧮", color: "#f59e0b", bg: "rgba(245,158,11,0.1)", title: "Smart Summaries", desc: "Instant net balance, savings rate, category totals, and period comparisons at a glance." },
    { icon: "📱", color: "#ec4899", bg: "rgba(236,72,153,0.1)", title: "Fully Responsive", desc: "Works beautifully on desktop, tablet, and mobile. Collapsible sidebar for small screens." },
    { icon: "🌙", color: "#64748b", bg: "rgba(100,116,139,0.1)", title: "Dark & Light Mode", desc: "Switch between dark and light themes. Your preference is saved across sessions." },
  ];

  const roles = [
    {
      label: "Admin", color: "#ef4444", icon: "👑",
      desc: "Full system control. Manage users, create records, and access all analytics.",
      perms: [
        { yes: true,  label: "View Dashboard" },
        { yes: true,  label: "View & Create Transactions" },
        { yes: true,  label: "Edit & Delete Records" },
        { yes: true,  label: "Access Analytics" },
        { yes: true,  label: "Manage Users" },
      ]
    },
    {
      label: "Analyst", color: "#3b82f6", icon: "📊",
      desc: "Read-only access to data plus full analytics and trend insights.",
      perms: [
        { yes: true,  label: "View Dashboard" },
        { yes: true,  label: "View Transactions" },
        { yes: false, label: "Create / Edit Records" },
        { yes: true,  label: "Access Analytics" },
        { yes: false, label: "Manage Users" },
      ]
    },
    {
      label: "Viewer", color: "#64748b", icon: "👁",
      desc: "Basic read access to transaction history. No analytics or management.",
      perms: [
        { yes: true,  label: "View Dashboard" },
        { yes: true,  label: "View Transactions" },
        { yes: false, label: "Create / Edit Records" },
        { yes: false, label: "Access Analytics" },
        { yes: false, label: "Manage Users" },
      ]
    },
  ];

  return (
    <div className="landing">
      {/* ── Top Navbar ── */}
      <nav className="land-nav">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div className="logo-icon">₹</div>
          <span className="logo-text">FinanceApp</span>
        </div>

        <div className="land-nav-right">
          {/* Role Switcher */}
          <div className="role-switcher" style={{ display: "flex" }}>
            <button className={`role-pill ${selectedRole === "admin" ? "r-admin" : ""}`}
              onClick={() => openAuth("login", "admin")}>
              👑 Admin
            </button>
            <button className={`role-pill ${selectedRole === "analyst" ? "r-analyst" : ""}`}
              onClick={() => openAuth("login", "analyst")}>
              📊 Analyst
            </button>
            <button className={`role-pill ${selectedRole === "viewer" ? "r-viewer" : ""}`}
              onClick={() => openAuth("login", "viewer")}>
              👁 Viewer
            </button>
          </div>

          {/* Theme Toggle */}
          <button className="theme-btn" onClick={toggleTheme} title="Toggle theme">
            {isDark ? <FiSun size={15} /> : <FiMoon size={15} />}
          </button>

          {/* Sign In button */}
          <button className="nav-signin-btn" onClick={() => openAuth("login", selectedRole)}>
            Sign In
          </button>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="land-hero">
        <div className="blob blob-1" /><div className="blob blob-2" /><div className="blob blob-3" />
        <div className="container" style={{ position: "relative", zIndex: 1 }}>
          <div className="hero-badge">
            <FiZap size={12} /> Finance Dashboard — Built for your assignment
          </div>
          <h1 className="hero-title">
            Manage your finances<br />
            <span className="grad">smarter, faster.</span>
          </h1>
          <p className="hero-sub">
            A complete finance management system with role-based access, real-time analytics, and beautiful charts. Sign in as Admin, Analyst, or Viewer to explore.
          </p>
          <div className="hero-btns">
            <button className="btn-hero-primary" onClick={() => openAuth("login", "admin")}>
              Get Started <FiArrowRight size={15} />
            </button>
            <button className="btn-hero-ghost" onClick={() => openAuth("register", "viewer")}>
              Create Account
            </button>
          </div>
          <div className="hero-stats">
            {[
              { val: "3", lab: "User Roles" },
              { val: "15+", lab: "Categories" },
              { val: "6", lab: "Chart Types" },
              { val: "100%", lab: "Responsive" },
            ].map((s, i) => (
              <div key={i} style={{ textAlign: "center" }}>
                <div className="hstat-val">{s.val}</div>
                <div className="hstat-lab">{s.lab}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="land-features">
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: 44 }}>
            <h2 className="sec-title">Everything you need</h2>
            <p className="sec-sub">Built with Node.js, Express, MongoDB, and React</p>
          </div>
          <div className="row g-3">
            {features.map((f, i) => (
              <div key={i} className="col-12 col-sm-6 col-lg-4">
                <div className="feat-card">
                  <div className="feat-icon" style={{ background: f.bg, color: f.color }}>{f.icon}</div>
                  <div className="feat-title">{f.title}</div>
                  <div className="feat-desc">{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Roles ── */}
      <section className="land-roles">
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: 44 }}>
            <h2 className="sec-title">Choose your role</h2>
            <p className="sec-sub">Click any role card to sign in with demo credentials</p>
          </div>
          <div className="row g-3 justify-content-center">
            {roles.map((r, i) => (
              <div key={i} className="col-12 col-md-4">
                <div className="role-card" onClick={() => openAuth("login", r.label.toLowerCase())}
                  style={{ cursor: "pointer", borderColor: selectedRole === r.label.toLowerCase() ? r.color : undefined }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: `${r.color}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>{r.icon}</div>
                    <div className="role-card-title" style={{ color: r.color }}>{r.label}</div>
                  </div>
                  <div className="role-card-desc">{r.desc}</div>
                  {r.perms.map((p, j) => (
                    <div key={j} className="ritem">
                      <span className={p.yes ? "r-yes" : "r-no"}>{p.yes ? "✓" : "✗"}</span>
                      {p.label}
                    </div>
                  ))}
                  <button style={{ marginTop: 12, width: "100%", padding: "8px", borderRadius: 8, border: `1px solid ${r.color}40`, background: `${r.color}10`, color: r.color, cursor: "pointer", fontSize: 12, fontWeight: 600, fontFamily: "inherit" }}>
                    Sign in as {r.label} →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ padding: "32px 0", borderTop: "1px solid var(--border)", textAlign: "center" }}>
        <div className="container">
          <p style={{ fontSize: 13, color: "var(--text-3)" }}>
            Finance Dashboard — Backend: Node.js + Express + MongoDB &nbsp;|&nbsp; Frontend: React + Bootstrap + Recharts
          </p>
          <p style={{ fontSize: 12, color: "var(--text-3)", marginTop: 6 }}>
            API: <code style={{ fontFamily: "monospace", color: "var(--accent)" }}>https://finances-dashboard.onrender.com</code>
          </p>
        </div>
      </footer>

      {/* ── Auth Modal ── */}
      {showAuth && (
        <AuthModal
          mode={authMode}
          role={selectedRole}
          onClose={() => setShowAuth(false)}
          onSuccess={onAuthSuccess}
        />
      )}
    </div>
  );
}
