import React, { useState, useEffect, useCallback } from "react";
import { usersAPI } from "../services/api";
import { formatDate, roleBadgeColor, capitalize } from "../utils/helpers";
import toast from "react-hot-toast";
import { Modal } from "react-bootstrap";
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiRefreshCw, FiUsers } from "react-icons/fi";

const EMPTY_FORM = { name: "", email: "", password: "", role: "viewer", status: "active" };

export default function Users() {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 1 });
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  const fetchUsers = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (search) params.search = search;
      if (roleFilter) params.role = roleFilter;
      if (statusFilter) params.status = statusFilter;
      const [uRes, sRes] = await Promise.all([usersAPI.getAll(params), usersAPI.getStats()]);
      setUsers(uRes.data.data || []);
      setPagination(p => ({ ...p, ...uRes.data.meta?.pagination, page }));
      setStats(sRes.data.data);
    } catch { toast.error("Failed to load users"); }
    finally { setLoading(false); }
  }, [search, roleFilter, statusFilter]);

  useEffect(() => { fetchUsers(1); }, [search, roleFilter, statusFilter]);

  const openCreate = () => { setEditUser(null); setForm(EMPTY_FORM); setErrors({}); setShowModal(true); };
  const openEdit = (u) => {
    setEditUser(u);
    setForm({ name: u.name, email: u.email, password: "", role: u.role, status: u.status });
    setErrors({});
    setShowModal(true);
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.email.trim()) e.email = "Email is required";
    if (!editUser && !form.password) e.password = "Password is required for new users";
    if (!editUser && form.password && form.password.length < 6) e.password = "Min 6 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = { ...form };
      if (editUser && !payload.password) delete payload.password;
      if (editUser) {
        await usersAPI.update(editUser._id, payload);
        toast.success("User updated!");
      } else {
        await usersAPI.create(payload);
        toast.success("User created!");
      }
      setShowModal(false);
      fetchUsers(pagination.page);
    } catch (err) {
      const apiErrors = err.response?.data?.errors;
      if (apiErrors) {
        const e = {};
        apiErrors.forEach(er => { e[er.field] = er.message; });
        setErrors(e);
      } else { toast.error(err.response?.data?.message || "Failed"); }
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Deactivate this user?")) return;
    try { await usersAPI.delete(id); toast.success("User deactivated"); fetchUsers(pagination.page); }
    catch (err) { toast.error(err.response?.data?.message || "Failed"); }
  };

  const roleColors = { admin: "#ef4444", analyst: "#3b82f6", viewer: "#64748b" };

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
        <div>
          <h1 className="fin-page-title">User Management</h1>
          <p className="fin-page-sub mb-0">{pagination.total} total users</p>
        </div>
        <button className="fin-btn-primary" onClick={openCreate}><FiPlus size={15} /> Add User</button>
      </div>

      {/* Stats row */}
      {stats && (
        <div className="row g-3 mb-4">
          {[
            { label: "Total Users", value: stats.total, icon: <FiUsers />, color: "#3b82f6" },
            { label: "Active", value: stats.active, color: "#10b981" },
            { label: "Admins", value: stats.admins, color: "#ef4444" },
            { label: "Analysts", value: stats.analysts, color: "#3b82f6" },
          ].map((s, i) => (
            <div key={i} className="col-6 col-lg-3">
              <div className="fin-metric-card">
                <div className="fin-metric-label mb-1">{s.label}</div>
                <div className="fin-metric-value" style={{ fontSize: 28, color: s.color }}>{s.value}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="fin-card mb-3 p-3">
        <div className="row g-2 align-items-end">
          <div className="col-12 col-sm-5">
            <label className="fin-label"><FiSearch size={11} className="me-1" />Search</label>
            <input className="fin-input w-100" placeholder="Name or email..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="col-6 col-sm-3">
            <label className="fin-label">Role</label>
            <select className="fin-input w-100" value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="analyst">Analyst</option>
              <option value="viewer">Viewer</option>
            </select>
          </div>
          <div className="col-6 col-sm-3">
            <label className="fin-label">Status</label>
            <select className="fin-input w-100" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="">All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div className="col-auto">
            <button className="fin-btn-ghost" onClick={() => { setSearch(""); setRoleFilter(""); setStatusFilter(""); }}>
              <FiRefreshCw size={13} />
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
                <th style={{ paddingLeft: 20 }}>User</th>
                <th>Role</th>
                <th>Status</th>
                <th>Last Login</th>
                <th>Joined</th>
                <th style={{ textAlign: "center" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center py-5"><div className="spinner-border spinner-border-sm text-primary" /></td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-5" style={{ color: "#64748b" }}>No users found</td></tr>
              ) : users.map(u => (
                <tr key={u._id}>
                  <td style={{ paddingLeft: 20 }}>
                    <div className="d-flex align-items-center gap-2">
                      <div style={{ width: 32, height: 32, borderRadius: "50%", background: `${roleColors[u.role]}20`, color: roleColors[u.role], display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 600, flexShrink: 0 }}>
                        {u.name?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 500 }}>{u.name}</div>
                        <div style={{ fontSize: 11, color: "#64748b" }}>{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="fin-badge" style={{ background: `${roleColors[u.role]}18`, color: roleColors[u.role], border: `1px solid ${roleColors[u.role]}30` }}>
                      {u.role}
                    </span>
                  </td>
                  <td>
                    <span className={`fin-badge badge-${u.status}`}>{u.status}</span>
                  </td>
                  <td style={{ fontSize: 12, color: "#64748b" }}>{u.lastLogin ? formatDate(u.lastLogin) : "Never"}</td>
                  <td style={{ fontSize: 12, color: "#64748b" }}>{formatDate(u.createdAt)}</td>
                  <td style={{ textAlign: "center" }}>
                    <div className="d-flex gap-2 justify-content-center">
                      <button onClick={() => openEdit(u)} style={{ background: "rgba(59,130,246,0.1)", border: "none", color: "#60a5fa", borderRadius: 7, padding: "5px 9px", cursor: "pointer" }}>
                        <FiEdit2 size={13} />
                      </button>
                      <button onClick={() => handleDelete(u._id)} style={{ background: "rgba(239,68,68,0.1)", border: "none", color: "#f87171", borderRadius: 7, padding: "5px 9px", cursor: "pointer" }}>
                        <FiTrash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {pagination.totalPages > 1 && (
          <div className="d-flex align-items-center justify-content-between px-4 py-3" style={{ borderTop: "1px solid var(--border)" }}>
            <span style={{ fontSize: 12, color: "#64748b" }}>Page {pagination.page} of {pagination.totalPages}</span>
            <div className="d-flex gap-2">
              <button className="fin-btn-ghost py-1 px-2" disabled={pagination.page <= 1} onClick={() => fetchUsers(pagination.page - 1)}>‹</button>
              <button className="fin-btn-ghost py-1 px-2" disabled={pagination.page >= pagination.totalPages} onClick={() => fetchUsers(pagination.page + 1)}>›</button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title style={{ fontSize: 16, fontWeight: 600 }}>{editUser ? "Edit User" : "Create User"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="row g-3">
            <div className="col-12">
              <label className="fin-label">Full Name *</label>
              <input className="fin-input w-100" placeholder="John Doe" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              {errors.name && <div style={{ fontSize: 11, color: "#f87171", marginTop: 4 }}>{errors.name}</div>}
            </div>
            <div className="col-12">
              <label className="fin-label">Email *</label>
              <input type="email" className="fin-input w-100" placeholder="john@example.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
              {errors.email && <div style={{ fontSize: 11, color: "#f87171", marginTop: 4 }}>{errors.email}</div>}
            </div>
            <div className="col-12">
              <label className="fin-label">{editUser ? "New Password (leave blank to keep)" : "Password *"}</label>
              <input type="password" className="fin-input w-100" placeholder={editUser ? "Leave blank to keep current" : "Min 6 characters"} value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
              {errors.password && <div style={{ fontSize: 11, color: "#f87171", marginTop: 4 }}>{errors.password}</div>}
            </div>
            <div className="col-6">
              <label className="fin-label">Role</label>
              <select className="fin-input w-100" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                <option value="viewer">Viewer</option>
                <option value="analyst">Analyst</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="col-6">
              <label className="fin-label">Status</label>
              <select className="fin-input w-100" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <button className="fin-btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
          <button className="fin-btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? <span className="spinner-border spinner-border-sm" /> : (editUser ? "Save Changes" : "Create User")}
          </button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
