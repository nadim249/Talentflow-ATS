// src/context/AuthContext.jsx
// Holds the authenticated user + token, persisted to localStorage.
import { createContext, useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount, hydrate from token if present.
  useEffect(() => {
    const token = localStorage.getItem('tf_token');
    if (!token) { setLoading(false); return; }
    authAPI.me()
      .then((u) => setUser(u))
      .catch(() => localStorage.removeItem('tf_token'))
      .finally(() => setLoading(false));
  }, []);

  async function login(credentials) {
    const { token, user } = await authAPI.login(credentials);
    localStorage.setItem('tf_token', token);
    setUser(user);
    return user;
  }

  async function register(payload) {
    const { token, user } = await authAPI.register(payload);
    localStorage.setItem('tf_token', token);
    setUser(user);
    return user;
  }

  function logout() {
    localStorage.removeItem('tf_token');
    setUser(null);
    toast.success('Logged out');
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);