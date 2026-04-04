// Format number as Indian Rupees
export const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount || 0);

// Format date nicely
export const formatDate = (date) =>
  new Date(date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

// Format month label from "2024-04" → "Apr 2024"
export const formatMonth = (str) => {
  if (!str) return str;
  const [year, month] = str.split("-");
  return new Date(year, parseInt(month) - 1).toLocaleDateString("en-IN", { month: "short", year: "numeric" });
};

// Capitalize first letter
export const capitalize = (str) => str ? str.charAt(0).toUpperCase() + str.slice(1).replace(/_/g, " ") : "";

// Get role badge color
export const roleBadgeColor = (role) => {
  const map = { admin: "danger", analyst: "primary", viewer: "secondary" };
  return map[role] || "secondary";
};

// Get status badge color
export const statusColor = (status) => status === "active" ? "success" : "secondary";

// Get category color for charts
export const CATEGORY_COLORS = {
  salary: "#0d6efd", freelance: "#6f42c1", investment: "#20c997",
  business: "#0dcaf0", rental: "#fd7e14", other_income: "#6610f2",
  food: "#dc3545", housing: "#fd7e14", transport: "#ffc107",
  utilities: "#20c997", healthcare: "#d63384", education: "#0d6efd",
  entertainment: "#6f42c1", shopping: "#dc3545", travel: "#0dcaf0",
  other_expense: "#6c757d",
};

export const CHART_COLORS = ["#0d6efd", "#20c997", "#fd7e14", "#dc3545", "#6f42c1", "#0dcaf0", "#ffc107", "#d63384"];

// Truncate text
export const truncate = (str, n = 30) => str?.length > n ? str.slice(0, n) + "..." : str;
