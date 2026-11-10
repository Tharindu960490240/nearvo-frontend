import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api, TOKEN_KEY } from '../api.js';

const AuthContext = createContext(null);

// Everyone lands on their dashboard (AFC style); new tradies go straight to finishing their profile.
export const homeFor = (user) =>
  !user ? '/' : user.role === 'tradie' && !user.profile_complete ? '/tradie/profile' : '/dashboard';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(
    () => api('/auth/me').then((d) => { setUser(d.user); return d.user; }),
    []
  );

  useEffect(() => {
    if (!localStorage.getItem(TOKEN_KEY)) { setLoading(false); return; }
    refresh().catch(() => localStorage.removeItem(TOKEN_KEY)).finally(() => setLoading(false));
  }, [refresh]);

  const handleAuth = ({ token, user: u }) => {
    localStorage.setItem(TOKEN_KEY, token);
    setUser(u);
    return u;
  };

  const login = (email, password) => api('/auth/login', { method: 'POST', body: { email, password } }).then(handleAuth);
  const register = (data) => api('/auth/register', { method: 'POST', body: data }).then(handleAuth);
  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, loading, login, register, logout, refresh }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
