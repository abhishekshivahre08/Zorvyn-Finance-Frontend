import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { ProtectedRoute } from "./components/common/ProtectedRoute";
import Layout from "./components/layout/Layout";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import Analytics from "./pages/Analytics";
import Users from "./pages/Users";
import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css";

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: "var(--bg-card, #1e293b)",
                color: "var(--text-1, #f1f5f9)",
                border: "1px solid var(--border-md, rgba(255,255,255,0.12))",
                fontSize: 13, borderRadius: 10,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              },
              success: { iconTheme: { primary: "#10b981", secondary: "#1e293b" } },
              error:   { iconTheme: { primary: "#ef4444", secondary: "#1e293b" } },
              duration: 3000,
            }}
          />
          <Routes>
            {/* Landing page — shown to unauthenticated users */}
            <Route path="/" element={<Landing />} />

            {/* Legacy routes — redirect to landing */}
            <Route path="/login"    element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected app routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>
            } />
            <Route path="/transactions" element={
              <ProtectedRoute><Layout><Transactions /></Layout></ProtectedRoute>
            } />
            <Route path="/analytics" element={
              <ProtectedRoute requiredRole="analyst"><Layout><Analytics /></Layout></ProtectedRoute>
            } />
            <Route path="/users" element={
              <ProtectedRoute requiredRole="admin"><Layout><Users /></Layout></ProtectedRoute>
            } />

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
