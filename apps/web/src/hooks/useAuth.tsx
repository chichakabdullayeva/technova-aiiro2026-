import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

interface User { id: string; email: string; name: string; role: string; }
interface AuthContext { user: User | null; token: string | null; login: (email: string, password: string) => Promise<void>; signup: (data: { email: string; password: string; name: string }) => Promise<void>; logout: () => void; isAuthenticated: boolean; }

const AuthCtx = createContext<AuthContext>(null!);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser({ id: payload.sub, email: payload.email, name: payload.name, role: payload.role });
      } catch { setToken(null); localStorage.removeItem('token'); }
    }
  }, [token]);

  const login = async (email: string, password: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password })
    });
    if (!res.ok) { const err = await res.json(); throw new Error(err.detail || 'Login failed'); }
    const data = await res.json();
    localStorage.setItem('token', data.token);
    setToken(data.token);
    toast.success('Xoş gəldiniz!');
  };

  const signup = async (data: { email: string; password: string; name: string }) => {
    const res = await fetch('/api/auth/signup', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    if (!res.ok) { const err = await res.json(); throw new Error(err.detail || 'Signup failed'); }
    toast.success('Qeydiyyat uğurlu! Daxil olun.');
  };

  const logout = () => { localStorage.removeItem('token'); setToken(null); setUser(null); };

  return <AuthCtx.Provider value={{ user, token, login, signup, logout, isAuthenticated: !!token }}>{children}</AuthCtx.Provider>;
}

export const useAuth = () => useContext(AuthCtx);
