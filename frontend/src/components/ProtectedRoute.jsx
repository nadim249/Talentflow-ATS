// src/components/ProtectedRoute.jsx
// Protects recruiter-only routes. Redirects unauthenticated visitors to /login.

import { Navigate, useLocation, Outlet } from 'react-router';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner text="Checking authorization..." />;
  }

  // Preserve the intended destination in router state so Login can redirect back
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children ? children : <Outlet />;
}