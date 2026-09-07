// src/components/GuestRoute.jsx
// If user is already authenticated, redirects them directly to the dashboard.
import { Navigate, Outlet } from 'react-router';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

export default function GuestRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner text="Checking session..." />;
  }

  // If already logged in, redirect away from login/register
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return children ? children : <Outlet />;
}
