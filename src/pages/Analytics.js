import React, { useState, useEffect } from "react";
import { dashboardAPI } from "../services/api";
import { formatCurrency, capitalize, CHART_COLORS } from "../utils/helpers";
import toast from "react-hot-toast";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line
} from "recharts";

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#1e293b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "10px 14px", fontSize: 12 }}>
      <p style={{ color: "#94a3b8", marginBottom: 6 }}>{label}</p>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color || "#f1f5f9", display: "flex", gap: 8, justifyContent: "space-between" }}>
          <span>{p.name}:</span><span style={{ fontWeight: 600 }}>{formatCurrency(p.value)}</span>
        </div>
      ))}
    </div>
  );
};

export default function Analytics() {
  const [trends, setTrends] = useState([]);
  const [categories, setCategories] = useState(null);
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [groupBy, setGroupBy] = useState("month");
  const [catType, setCatType] = useState("expense");

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const [tRes, cRes, bRes] = await Promise.all([
          dashboardAPI.getTrends({ groupBy, months: 6 }),
          dashboardAPI.getCategories({ type: catType }),
          dashboardAPI.getBalance(),
        ]);
        setTrends(tRes.data.data.data || []);
        setCategories(cRes.data.data);
        setBalance(bRes.data.data);
      } catch { toast.error("Failed to load analytics"); }
      finally { setLoading(false); }
    };
    fetch();
  }, [groupBy, catType]);

  const trendData = trends.map(d => ({ name: d.period?.slice(0, 7), Income: d.income, Expense: d.expense, Net: d.net }));

  const catData = (categories?.[catType] || []).slice(0, 8).map((c, i) => ({
    name: capitalize(c.category), value: c.total, pct: c.percentage, color: CHART_COLORS[i % CHART_COLORS.length],
  }));

  if (loading) return <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 300 }}><div className="spinner-border text-primary" /></div>;

  return (
    <div>
      <div className="mb-4">
        <h1 className="fin-page-title">Analytics</h1>
        <p className="fin-page-sub mb-0">Deep-dive into your financial data</p>
      </div>

      {/* Balance summary cards */}
      {balance && (
        <div className="row g-3 mb-4">
          {[
            { label: "Total Income (All Time)", value: balance.totalIncome, color: "#10b981" },
            { label: "Total Expense (All Time)", value: balance.totalExpense, color: "#ef4444" },
            { label: "Net Balance", value: balance.netBalance, color: balance.netBalance >= 0 ? "#10b981" : "#ef4444" },
            { label: "Savings Rate", value: `${balance.savingsRate}%`, color: "#3b82f6", raw: true },
          ].map((s, i) => (
            <div key={i} className="col-6 col-lg-3">
              <div className="fin-metric-card">
                <div className="fin-metric-label mb-2">{s.label}</div>
                <div className="fin-metric-value" style={{ color: s.color, fontSize: 20 }}>
                  {s.raw ? s.value : formatCurrency(s.value)}
                </div>
                <div style={{ fontSize: 10, color: "#334155", marginTop: 6 }}>
                  {balance.status === "surplus" ? "Surplus period" : "Deficit period"}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Line chart — Trends */}
      <div className="fin-card mb-4">
        <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
          <h6 className="fw-600 mb-0" style={{ fontSize: 14 }}>Income vs Expense Trend</h6>
          <div className="d-flex gap-2">
            {["month", "week"].map(g => (
              <button key={g} onClick={() => setGroupBy(g)}
                className={groupBy === g ? "fin-btn-primary" : "fin-btn-ghost"}
                style={{ fontSize: 11, padding: "5px 12px", borderRadius: 7 }}>
                By {g.charAt(0).toUpperCase() + g.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={trendData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#64748b" }} />
            <YAxis tick={{ fontSize: 11, fill: "#64748b" }} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 12, color: "#94a3b8", paddingTop: 12 }} />
            <Line type="monotone" dataKey="Income" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4, fill: "#10b981" }} />
            <Line type="monotone" dataKey="Expense" stroke="#ef4444" strokeWidth={2.5} dot={{ r: 4, fill: "#ef4444" }} />
            <Line type="monotone" dataKey="Net" stroke="#3b82f6" strokeWidth={2} strokeDasharray="5 5" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Category breakdown */}
      <div className="row g-3">
        <div className="col-12 col-lg-5">
          <div className="fin-card h-100">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h6 className="fw-600 mb-0" style={{ fontSize: 14 }}>Category Breakdown</h6>
              <div className="d-flex gap-1">
                {["income", "expense"].map(t => (
                  <button key={t} onClick={() => setCatType(t)}
                    className={catType === t ? "fin-btn-primary" : "fin-btn-ghost"}
                    style={{ fontSize: 11, padding: "4px 10px", borderRadius: 6 }}>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            {catData.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={catData} cx="50%" cy="50%" outerRadius={100} innerRadius={55} paddingAngle={3} dataKey="value">
                    {catData.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip formatter={v => formatCurrency(v)} contentStyle={{ background: "#1e293b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : <div style={{ color: "#64748b", fontSize: 13, padding: "40px 0", textAlign: "center" }}>No data available</div>}
          </div>
        </div>

        <div className="col-12 col-lg-7">
          <div className="fin-card h-100">
            <h6 className="fw-600 mb-3" style={{ fontSize: 14 }}>Category Amounts</h6>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={catData} layout="vertical" margin={{ top: 0, right: 10, left: 60, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: "#64748b" }} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "#94a3b8" }} width={70} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" name="Amount" radius={[0, 6, 6, 0]}>
                  {catData.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Category table */}
      <div className="fin-card mt-4">
        <h6 className="fw-600 mb-3" style={{ fontSize: 14 }}>Detailed Category Table — {catType.charAt(0).toUpperCase() + catType.slice(1)}</h6>
        <div className="table-responsive">
          <table className="fin-table">
            <thead>
              <tr>
                <th>Category</th>
                <th style={{ textAlign: "right" }}>Total</th>
                <th style={{ textAlign: "right" }}>Count</th>
                <th style={{ textAlign: "right" }}>Avg Amount</th>
                <th style={{ textAlign: "right" }}>% Share</th>
              </tr>
            </thead>
            <tbody>
              {(categories?.[catType] || []).map((c, i) => (
                <tr key={i}>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <div style={{ width: 8, height: 8, borderRadius: 2, background: CHART_COLORS[i % CHART_COLORS.length], flexShrink: 0 }} />
                      {capitalize(c.category)}
                    </div>
                  </td>
                  <td style={{ textAlign: "right", fontFamily: "JetBrains Mono", fontSize: 13 }}>{formatCurrency(c.total)}</td>
                  <td style={{ textAlign: "right", color: "#64748b", fontSize: 12 }}>{c.count}</td>
                  <td style={{ textAlign: "right", color: "#94a3b8", fontSize: 12 }}>{formatCurrency(c.average)}</td>
                  <td style={{ textAlign: "right" }}>
                    <div className="d-flex align-items-center justify-content-end gap-2">
                      <div style={{ width: 60, height: 4, background: "rgba(255,255,255,0.08)", borderRadius: 2, overflow: "hidden" }}>
                        <div style={{ width: `${c.percentage}%`, height: "100%", background: CHART_COLORS[i % CHART_COLORS.length], borderRadius: 2 }} />
                      </div>
                      <span style={{ fontSize: 11, color: "#94a3b8", minWidth: 32 }}>{c.percentage}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
