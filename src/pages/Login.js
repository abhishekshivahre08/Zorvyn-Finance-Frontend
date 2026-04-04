import { Navigate } from "react-router-dom";
// Login is now handled via the Landing page modal
export default function Login() { return <Navigate to="/" replace />; }
