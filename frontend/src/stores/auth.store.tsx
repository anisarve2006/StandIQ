import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { authApi } from '../services/authApi';
import type { User } from '../services/authApi';
import { setAccessToken } from '../services/api';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthContextType extends AuthState {
  login: (credentials: any) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  const checkAuth = async () => {
    try {
      // 1. Try to refresh token (will use HttpOnly cookie)
      const refreshRes = await authApi.refresh();
      setAccessToken(refreshRes.access_token);
      
      // 2. Fetch current user
      const user = await authApi.getCurrentUser();
      
      setState({
        user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      // Refresh failed or no cookie
      setAccessToken(null);
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  };

  useEffect(() => {
    checkAuth();

    // Listen for global auth failures (e.g. 401s that can't be refreshed)
    const handleAuthFailure = () => {
      setState(prev => ({ ...prev, user: null, isAuthenticated: false }));
    };
    window.addEventListener('auth:unauthorized', handleAuthFailure);
    return () => window.removeEventListener('auth:unauthorized', handleAuthFailure);
  }, []);

  const login = async (credentials: any) => {
    const res = await authApi.login(credentials);
    setAccessToken(res.access_token);
    setState({
      user: res.user,
      isAuthenticated: true,
      isLoading: false,
    });
  };

  const register = async (userData: any) => {
    await authApi.register(userData);
    // After registration, depending on backend we either login or require explicit login
    // Phase 4 register returns User, not tokens. So we login after.
    await login({ email: userData.email, password: userData.password });
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (e) {
      // Ignore errors during logout
    } finally {
      setAccessToken(null);
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  };

  if (state.isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500 font-medium">Initializing session...</p>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
