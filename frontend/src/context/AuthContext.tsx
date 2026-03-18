import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useReducer,
    type ReactNode,
} from 'react';
import { authApi } from '../services/api';
import type { AuthLoginPayload, AuthRegisterPayload, User } from '../types';

// ─── State ────────────────────────────────────────────────────────────────────

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;         // true while restoring session on mount
}

interface AuthContextValue extends AuthState {
  login: (p: AuthLoginPayload) => Promise<void>;
  register: (p: AuthRegisterPayload) => Promise<void>;
  logout: () => void;
}

// ─── Reducer ──────────────────────────────────────────────────────────────────

type Action =
  | { type: 'LOADING' }
  | { type: 'SET'; user: User; token: string }
  | { type: 'CLEAR' };

function reducer(state: AuthState, action: Action): AuthState {
  switch (action.type) {
    case 'LOADING': return { ...state, isLoading: true };
    case 'SET':     return { user: action.user, token: action.token, isAuthenticated: true, isLoading: false };
    case 'CLEAR':   return { user: null, token: null, isAuthenticated: false, isLoading: false };
    default:        return state;
  }
}

const initial: AuthState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  isLoading: true,
};

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initial);

  // Restore session on mount using stored token
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { dispatch({ type: 'CLEAR' }); return; }

    authApi.getMe()
      .then((res) => dispatch({ type: 'SET', user: res.data.user, token }))
      .catch(() => {
        localStorage.removeItem('token');
        dispatch({ type: 'CLEAR' });
      });
  }, []);

  const login = useCallback(async (payload: AuthLoginPayload) => {
    dispatch({ type: 'LOADING' });
    try {
      const res = await authApi.login(payload);
      localStorage.setItem('token', res.data.token);
      dispatch({ type: 'SET', user: res.data.user, token: res.data.token });
    } catch (err) {
      dispatch({ type: 'CLEAR' });
      throw err;
    }
  }, []);

  const register = useCallback(async (payload: AuthRegisterPayload) => {
    dispatch({ type: 'LOADING' });
    try {
      const res = await authApi.register(payload);
      localStorage.setItem('token', res.data.token);
      dispatch({ type: 'SET', user: res.data.user, token: res.data.token });
    } catch (err) {
      dispatch({ type: 'CLEAR' });
      throw err;
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    dispatch({ type: 'CLEAR' });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}