import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Spinner } from "react-bootstrap";

export const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "var(--bg-page)" }}>
      <Spinner animation="border" variant="primary" />
    </div>
  );

  // Not logged in → go to landing page (which has login modal)
  if (!user) return <Navigate to="/" replace />;

  // Role check
  if (requiredRole === "admin"   && user.role !== "admin") return <Navigate to="/dashboard" replace />;
  if (requiredRole === "analyst" && !["admin","analyst"].includes(user.role)) return <Navigate to="/dashboard" replace />;

  return children;
};

export const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:"100vh" }}><Spinner animation="border" variant="primary" /></div>;
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
};
