import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react';
import { getMe, logout as apiLogout } from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      setUser(await getMe());
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const signIn = useCallback(() => {
    const base = import.meta.env.VITE_API_BASE ?? '/api';
    window.location.href = `${base}/auth/google`;
  }, []);

  const signOut = useCallback(async () => {
    try {
      await apiLogout();
    } catch {
      /* ignore */
    }
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
