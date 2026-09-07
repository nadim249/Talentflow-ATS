// src/components/RootRedirect.jsx

import { Navigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

export default function RootRedirect() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner text="Redirecting..." />;
  }

  return <Navigate to={user ? '/dashboard' : '/jobs-board'} replace />;
}