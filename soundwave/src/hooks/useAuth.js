import { useState, useCallback } from 'react';
import { getCurrentUser } from '../api/services/authService';

export function useAuth() {
  const [user, setUser] = useState(() => getCurrentUser());

  const login  = useCallback((u) => {
    if (u) localStorage.setItem('sw_user', JSON.stringify(u));
    setUser(u);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('sw_user');
    localStorage.removeItem('sw_token');
    localStorage.removeItem('sw_refresh');
    setUser(null);
  }, []);

  return { user, login, logout, isLoggedIn: !!user };
}
