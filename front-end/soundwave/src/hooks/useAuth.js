import { useState, useCallback, useEffect } from 'react';
import { getCurrentUser, getMe } from '../api/services/authService';
import { getToken, clearToken } from '../api/httpClient';

export function useAuth() {
  const [user,     setUser]     = useState(() => getCurrentUser());
  const [checking, setChecking] = useState(!!getToken());

  useEffect(() => {
    if (!getToken()) return;

    getMe()
      .then(data => {
        const updated = { ...getCurrentUser(), ...data };
        localStorage.setItem('sw_user', JSON.stringify(updated));
        setUser(updated);
      })
      .catch(() => {
        clearToken();
        localStorage.removeItem('sw_user');
        localStorage.removeItem('sw_refresh');
        setUser(null);
      })
      .finally(() => setChecking(false));
  }, []);

  const login = useCallback((u) => {
    if (u) localStorage.setItem('sw_user', JSON.stringify(u));
    setUser(u);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('sw_user');
    localStorage.removeItem('sw_token');
    localStorage.removeItem('sw_refresh');
    setUser(null);
  }, []);

  return { user, login, logout, checking, isLoggedIn: !!user };
}
