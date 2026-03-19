import React, { createContext, useContext, useEffect, useReducer } from 'react';
import { authService, type RegisterData, type User } from '@/services/authService';

type AuthState = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
};

type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: User | null };

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: action.payload !== null,
        isLoading: false,
      };
    default:
      return state;
  }
}

type AuthContextValue = AuthState & {
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: (token: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });

  useEffect(() => {
    authService.getStoredUser().then((user) => {
      dispatch({ type: 'SET_USER', payload: user });
    });
  }, []);

  async function login(email: string, password: string) {
    const user = await authService.login(email, password);
    dispatch({ type: 'SET_USER', payload: user });
  }

  async function loginWithGoogle(token: string) {
    const user = await authService.loginWithGoogle(token);
    dispatch({ type: 'SET_USER', payload: user });
  }

  async function register(data: RegisterData) {
    const user = await authService.register(data);
    dispatch({ type: 'SET_USER', payload: user });
  }

  function logout() {
    dispatch({ type: 'SET_USER', payload: null });
  }

  async function forgotPassword(email: string) {
    await authService.forgotPassword(email);
  }

  return (
    <AuthContext.Provider value={{ ...state, login, loginWithGoogle, register, logout, forgotPassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
