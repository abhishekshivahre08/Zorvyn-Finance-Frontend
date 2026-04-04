import React, { useState, useEffect } from "react";
import { dashboardAPI, transactionsAPI } from "../services/api";
import { formatCurrency, formatDate, CHART_COLORS, capitalize } from "../utils/helpers";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { FiTrendingUp, FiTrendingDown, FiDollarSign, FiActivity, FiArrowUpRight, FiArrowDownRight } from "react-icons/fi";

// ── Metric Card ──────────────────────────────────────────────────
const MetricCard = ({ label, value, delta, deltaUp, icon, accent }) => (
  <div className="fin-metric-card">
    <div className="d-flex align-items-start justify-content-between">
      <div>
        <div className="fin-metric-label mb-2">{label}</div>
        <div className="fin-metric-value" style={{ color: accent || "#f1f5f9" }}>{value}</div>
        {delta && (
          <div className={`fin-metric-delta d-flex align-items-center gap-1 mt-1 ${deltaUp ? "delta-up" : "delta-down"}`}>
            {deltaUp ? <FiArrowUpRight size={13} /> : <FiArrowDownRight size={13} />}
            {delta}
          </div>
        )}
      </div>
      <div style={{ width: 40, height: 40, borderRadius: 10, background: `${accent || "#3b82f6"}18`, display: "flex", alignItems: "center", justifyContent: "center", color: accent || "#3b82f6", fontSize: 18 }}>
        {icon}
      </div>
    </div>
  </div>
);

// Custom tooltip
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#1e293b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "10px 14px", fontSize: 12 }}>
      <p style={{ color: "#94a3b8", marginBottom: 6 }}>{label}</p>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color, display: "flex", gap: 8, justifyContent: "space-between" }}>
          <span>{p.name}:</span><span className="fw-500">{formatCurrency(p.value)}</span>
        </div>
      ))}
    </div>
  );
};

export default function Dashboard() {
  const { isAnalyst } = useAuth();
  const [summary, setSummary] = useState(null);
  const [trends, setTrends] = useState([]);
  const [categories, setCategories] = useState(null);
  const [recent, setRecent] = useState([]);
  const [period, setPeriod] = useState("month");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        if (isAnalyst) {
          const [sumRes, trendRes, catRes] = await Promise.all([
            dashboardAPI.getSummary(period),
            dashboardAPI.getTrends({ groupBy: "month", months: 6 }),
            dashboardAPI.getCategories(),
          ]);
          setSummary(sumRes.data.data);
          setTrends(trendRes.data.data.data || []);
          setCategories(catRes.data.data);
          setRecent(sumRes.data.data.recentActivity || []);
        } else {
          // Viewers can only see recent transactions
          const res = await transactionsAPI.getAll({ limit: 5, sortBy: "date", sortOrder: "desc" });
          setRecent(res.data.data || []);
        }
      } catch {
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [period, isAnalyst]);

  const ov = summary?.overview;

  // Category pie data
  const expensePie = categories?.expense?.slice(0, 6).map((c, i) => ({
    name: capitalize(c.category), value: c.total, color: CHART_COLORS[i % CHART_COLORS.length],
  })) || [];

  // Trend chart data
  const trendData = trends.map(d => ({
    name: d.period?.slice(0, 7),
    Income: d.income, Expense: d.expense, Net: d.net,
  }));

  if (loading) return (
    <div className="d-flex align-items-center justify-content-center" style={{ minHeight: 300 }}>
      <div className="spinner-border text-primary" />
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
        <div>
          <h1 className="fin-page-title">Dashboard</h1>
          <p className="fin-page-sub mb-0">Financial overview & analytics</p>
        </div>
        {isAnalyst && (
          <div className="d-flex gap-2">
            {["week", "month", "quarter", "year"].map(p => (
              <button key={p} onClick={() => setPeriod(p)}
                className={period === p ? "fin-btn-primary py-1 px-3" : "fin-btn-ghost py-1 px-3"}
                style={{ fontSize: 12, borderRadius: 8, padding: "6px 14px" }}>
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Metric Cards — Analyst/Admin only */}
      {isAnalyst && ov && (
        <div className="row g-3 mb-4">
          <div className="col-6 col-lg-3">
            <MetricCard label="Total Income" value={formatCurrency(ov.period.income.total)}
              delta={`${ov.period.income.count} transactions`} deltaUp icon={<FiTrendingUp />} accent="#10b981" />
          </div>
          <div className="col-6 col-lg-3">
            <MetricCard label="Total Expenses" value={formatCurrency(ov.period.expense.total)}
              delta={`${ov.period.expense.count} transactions`} icon={<FiTrendingDown />} accent="#ef4444" />
          </div>
          <div className="col-6 col-lg-3">
            <MetricCard label="Net Balance" value={formatCurrency(ov.period.netBalance)}
              delta={`${ov.period.savingsRate}% savings rate`} deltaUp={ov.period.netBalance >= 0}
              icon={<FiDollarSign />} accent={ov.period.netBalance >= 0 ? "#10b981" : "#ef4444"} />
          </div>
          <div className="col-6 col-lg-3">
            <MetricCard label="All-Time Balance" value={formatCurrency(ov.allTime.netBalance)}
              delta={`${ov.allTime.totalTransactions} total records`} deltaUp
              icon={<FiActivity />} accent="#3b82f6" />
          </div>
        </div>
      )}

      {/* Charts row */}
      {isAnalyst && trendData.length > 0 && (
        <div className="row g-3 mb-4">
          {/* Area Chart — Income vs Expense */}
          <div className="col-12 col-lg-8">
            <div className="fin-card h-100">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <h6 className="fw-600 mb-0" style={{ fontSize: 14 }}>Income vs Expenses</h6>
                <span style={{ fontSize: 11, color: "#64748b" }}>Last 6 months</span>
              </div>
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={trendData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#64748b" }} />
                  <YAxis tick={{ fontSize: 11, fill: "#64748b" }} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 12, color: "#94a3b8", paddingTop: 12 }} />
                  <Area type="monotone" dataKey="Income" stroke="#10b981" strokeWidth={2} fill="url(#incomeGrad)" />
                  <Area type="monotone" dataKey="Expense" stroke="#ef4444" strokeWidth={2} fill="url(#expenseGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pie Chart — Expense categories */}
          <div className="col-12 col-lg-4">
            <div className="fin-card h-100">
              <h6 className="fw-600 mb-3" style={{ fontSize: 14 }}>Expense Breakdown</h6>
              {expensePie.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie data={expensePie} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                        {expensePie.map((e, i) => <Cell key={i} fill={e.color} />)}
                      </Pie>
                      <Tooltip formatter={(v) => formatCurrency(v)} contentStyle={{ background: "#1e293b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="mt-2">
                    {expensePie.map((e, i) => (
                      <div key={i} className="d-flex align-items-center justify-content-between mb-1">
                        <div className="d-flex align-items-center gap-2">
                          <div style={{ width: 8, height: 8, borderRadius: 2, background: e.color, flexShrink: 0 }} />
                          <span style={{ fontSize: 11, color: "#94a3b8" }}>{e.name}</span>
                        </div>
                        <span style={{ fontSize: 11, color: "#f1f5f9", fontFamily: "JetBrains Mono" }}>{formatCurrency(e.value)}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : <div style={{ color: "#64748b", fontSize: 13 }}>No expense data</div>}
            </div>
          </div>
        </div>
      )}

      {/* Bar chart — Net per month */}
      {isAnalyst && trendData.length > 0 && (
        <div className="row g-3 mb-4">
          <div className="col-12">
            <div className="fin-card">
              <h6 className="fw-600 mb-3" style={{ fontSize: 14 }}>Monthly Net Balance</h6>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={trendData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#64748b" }} />
                  <YAxis tick={{ fontSize: 11, fill: "#64748b" }} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="Net" radius={[6, 6, 0, 0]}>
                    {trendData.map((d, i) => <Cell key={i} fill={d.Net >= 0 ? "#10b981" : "#ef4444"} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="fin-card">
        <h6 className="fw-600 mb-3" style={{ fontSize: 14 }}>Recent Transactions</h6>
        {recent.length === 0 ? (
          <p style={{ color: "#64748b", fontSize: 13 }}>No transactions found.</p>
        ) : (
          <div className="table-responsive">
            <table className="fin-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Type</th>
                  <th>Date</th>
                  <th style={{ textAlign: "right" }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((t) => (
                  <tr key={t._id}>
                    <td>{t.title}</td>
                    <td style={{ color: "#64748b" }}>{capitalize(t.category)}</td>
                    <td><span className={`fin-badge badge-${t.type}`}>{t.type}</span></td>
                    <td style={{ color: "#64748b", fontSize: 12 }}>{formatDate(t.date)}</td>
                    <td style={{ textAlign: "right", fontFamily: "JetBrains Mono", fontSize: 13, color: t.type === "income" ? "#34d399" : "#f87171" }}>
                      {t.type === "income" ? "+" : "-"}{formatCurrency(t.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
