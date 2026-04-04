import React, { useState, useEffect, useCallback } from "react";
import { transactionsAPI } from "../services/api";
import { formatCurrency, formatDate, capitalize } from "../utils/helpers";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { Modal } from "react-bootstrap";
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiFilter, FiRefreshCw, FiChevronLeft, FiChevronRight } from "react-icons/fi";

const CATEGORIES_INCOME = ["salary","freelance","investment","business","rental","other_income"];
const CATEGORIES_EXPENSE = ["food","housing","transport","utilities","healthcare","education","entertainment","shopping","travel","other_expense"];

const EMPTY_FORM = { title: "", amount: "", type: "income", category: "salary", date: new Date().toISOString().split("T")[0], notes: "" };

export default function Transactions() {
  const { isAdmin } = useAuth();
  const [txns, setTxns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [filters, setFilters] = useState({ type: "", category: "", startDate: "", endDate: "", search: "", sortBy: "date", sortOrder: "desc" });
  const [showModal, setShowModal] = useState(false);
  const [editTxn, setEditTxn] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  const fetchTxns = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = { ...filters, page, limit: pagination.limit };
      // Remove empty params
      Object.keys(params).forEach(k => !params[k] && delete params[k]);
      const res = await transactionsAPI.getAll(params);
      setTxns(res.data.data || []);
      setPagination(p => ({ ...p, ...res.data.meta?.pagination, page }));
    } catch {
      toast.error("Failed to load transactions");
    } finally { setLoading(false); }
  }, [filters, pagination.limit]);

  useEffect(() => { fetchTxns(1); }, [filters]);

  const openCreate = () => { setEditTxn(null); setForm(EMPTY_FORM); setErrors({}); setShowModal(true); };
  const openEdit = (t) => {
    setEditTxn(t);
    setForm({ title: t.title, amount: t.amount, type: t.type, category: t.category, date: t.date?.split("T")[0], notes: t.notes || "" });
    setErrors({});
    setShowModal(true);
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = "Title is required";
    if (!form.amount || parseFloat(form.amount) <= 0) e.amount = "Enter a valid amount";
    if (!form.date) e.date = "Date is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = { ...form, amount: parseFloat(form.amount) };
      if (editTxn) {
        await transactionsAPI.update(editTxn._id, payload);
        toast.success("Transaction updated!");
      } else {
        await transactionsAPI.create(payload);
        toast.success("Transaction created!");
      }
      setShowModal(false);
      fetchTxns(pagination.page);
    } catch (err) {
      const msg = err.response?.data?.message || "Operation failed";
      const apiErrors = err.response?.data?.errors;
      if (apiErrors) {
        const e = {};
        apiErrors.forEach(er => { e[er.field] = er.message; });
        setErrors(e);
      } else { toast.error(msg); }
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this transaction?")) return;
    try {
      await transactionsAPI.delete(id);
      toast.success("Transaction deleted!");
      fetchTxns(pagination.page);
    } catch { toast.error("Failed to delete"); }
  };

  const categoryOptions = form.type === "income" ? CATEGORIES_INCOME : CATEGORIES_EXPENSE;

  return (
    <div>
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
        <div>
          <h1 className="fin-page-title">Transactions</h1>
          <p className="fin-page-sub mb-0">{pagination.total} total records</p>
        </div>
        {isAdmin && (
          <button className="fin-btn-primary" onClick={openCreate}>
            <FiPlus size={15} /> Add Transaction
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="fin-card mb-3 p-3">
        <div className="row g-2 align-items-end">
          <div className="col-12 col-sm-6 col-md-3">
            <label className="fin-label"><FiSearch size={11} className="me-1" />Search</label>
            <input className="fin-input w-100" placeholder="Search title or notes..." value={filters.search}
              onChange={e => setFilters(f => ({ ...f, search: e.target.value }))} />
          </div>
          <div className="col-6 col-md-2">
            <label className="fin-label">Type</label>
            <select className="fin-input w-100" value={filters.type} onChange={e => setFilters(f => ({ ...f, type: e.target.value, category: "" }))}>
              <option value="">All Types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>
          <div className="col-6 col-md-2">
            <label className="fin-label">Category</label>
            <select className="fin-input w-100" value={filters.category} onChange={e => setFilters(f => ({ ...f, category: e.target.value }))}>
              <option value="">All</option>
              {(filters.type === "expense" ? CATEGORIES_EXPENSE : filters.type === "income" ? CATEGORIES_INCOME : [...CATEGORIES_INCOME, ...CATEGORIES_EXPENSE]).map(c => (
                <option key={c} value={c}>{capitalize(c)}</option>
              ))}
            </select>
          </div>
          <div className="col-6 col-md-2">
            <label className="fin-label">From</label>
            <input type="date" className="fin-input w-100" value={filters.startDate} onChange={e => setFilters(f => ({ ...f, startDate: e.target.value }))} />
          </div>
          <div className="col-6 col-md-2">
            <label className="fin-label">To</label>
            <input type="date" className="fin-input w-100" value={filters.endDate} onChange={e => setFilters(f => ({ ...f, endDate: e.target.value }))} />
          </div>
          <div className="col-auto">
            <button className="fin-btn-ghost" onClick={() => setFilters({ type: "", category: "", startDate: "", endDate: "", search: "", sortBy: "date", sortOrder: "desc" })}>
              <FiRefreshCw size={13} /> Reset
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="fin-card p-0" style={{ overflow: "hidden" }}>
        <div className="table-responsive">
          <table className="fin-table">
            <thead>
              <tr>
                <th style={{ paddingLeft: 20 }}>Title</th>
                <th>Type</th>
                <th>Category</th>
                <th>Date</th>
                <th style={{ textAlign: "right" }}>Amount</th>
                {isAdmin && <th style={{ textAlign: "center" }}>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center py-5"><div className="spinner-border spinner-border-sm text-primary" /></td></tr>
              ) : txns.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-5" style={{ color: "#64748b", fontSize: 13 }}>No transactions found</td></tr>
              ) : txns.map(t => (
                <tr key={t._id}>
                  <td style={{ paddingLeft: 20 }}>
                    <div style={{ fontSize: 13 }}>{t.title}</div>
                    {t.notes && <div style={{ fontSize: 11, color: "#64748b" }}>{t.notes.slice(0, 40)}{t.notes.length > 40 ? "..." : ""}</div>}
                  </td>
                  <td><span className={`fin-badge badge-${t.type}`}>{t.type}</span></td>
                  <td style={{ color: "#94a3b8", fontSize: 12 }}>{capitalize(t.category)}</td>
                  <td style={{ color: "#64748b", fontSize: 12 }}>{formatDate(t.date)}</td>
                  <td style={{ textAlign: "right", fontFamily: "JetBrains Mono", fontSize: 13, fontWeight: 600, color: t.type === "income" ? "#34d399" : "#f87171" }}>
                    {t.type === "income" ? "+" : "-"}{formatCurrency(t.amount)}
                  </td>
                  {isAdmin && (
                    <td style={{ textAlign: "center" }}>
                      <div className="d-flex gap-2 justify-content-center">
                        <button onClick={() => openEdit(t)} style={{ background: "rgba(59,130,246,0.1)", border: "none", color: "#60a5fa", borderRadius: 7, padding: "5px 9px", cursor: "pointer" }}>
                          <FiEdit2 size={13} />
                        </button>
                        <button onClick={() => handleDelete(t._id)} style={{ background: "rgba(239,68,68,0.1)", border: "none", color: "#f87171", borderRadius: 7, padding: "5px 9px", cursor: "pointer" }}>
                          <FiTrash2 size={13} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="d-flex align-items-center justify-content-between px-4 py-3" style={{ borderTop: "1px solid var(--border)" }}>
            <span style={{ fontSize: 12, color: "#64748b" }}>Page {pagination.page} of {pagination.totalPages}</span>
            <div className="d-flex gap-2">
              <button className="fin-btn-ghost py-1 px-2" style={{ fontSize: 12 }} disabled={pagination.page <= 1} onClick={() => fetchTxns(pagination.page - 1)}>
                <FiChevronLeft size={14} />
              </button>
              <button className="fin-btn-ghost py-1 px-2" style={{ fontSize: 12 }} disabled={pagination.page >= pagination.totalPages} onClick={() => fetchTxns(pagination.page + 1)}>
                <FiChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title style={{ fontSize: 16, fontWeight: 600 }}>{editTxn ? "Edit Transaction" : "New Transaction"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="row g-3">
            <div className="col-12">
              <label className="fin-label">Title *</label>
              <input className="fin-input w-100" placeholder="e.g. Monthly Salary" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
              {errors.title && <div style={{ fontSize: 11, color: "#f87171", marginTop: 4 }}>{errors.title}</div>}
            </div>
            <div className="col-6">
              <label className="fin-label">Type *</label>
              <select className="fin-input w-100" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value, category: e.target.value === "income" ? "salary" : "food" }))}>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </div>
            <div className="col-6">
              <label className="fin-label">Amount (₹) *</label>
              <input type="number" min="0.01" step="0.01" className="fin-input w-100" placeholder="0.00" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} />
              {errors.amount && <div style={{ fontSize: 11, color: "#f87171", marginTop: 4 }}>{errors.amount}</div>}
            </div>
            <div className="col-6">
              <label className="fin-label">Category *</label>
              <select className="fin-input w-100" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                {categoryOptions.map(c => <option key={c} value={c}>{capitalize(c)}</option>)}
              </select>
            </div>
            <div className="col-6">
              <label className="fin-label">Date *</label>
              <input type="date" className="fin-input w-100" value={form.date} max={new Date().toISOString().split("T")[0]} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
              {errors.date && <div style={{ fontSize: 11, color: "#f87171", marginTop: 4 }}>{errors.date}</div>}
            </div>
            <div className="col-12">
              <label className="fin-label">Notes (optional)</label>
              <textarea className="fin-input w-100" rows={2} placeholder="Additional notes..." value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} style={{ resize: "none" }} />
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <button className="fin-btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
          <button className="fin-btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? <span className="spinner-border spinner-border-sm" /> : (editTxn ? "Save Changes" : "Create")}
          </button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
