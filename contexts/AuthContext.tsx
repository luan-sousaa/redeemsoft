import React, { createContext, useContext, useReducer } from 'react';
import { authService, type RegisterData, type User } from '@/services/authService';
import { tokenStorage } from '@/services/api';
import { profileService } from '@/services/profileService';

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
      return { ...state, user: action.payload, isAuthenticated: action.payload !== null, isLoading: false };
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
  verifyCode: (email: string, code: string) => Promise<void>;
  resetPassword: (email: string, code: string, newPassword: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    isLoading: false,
    isAuthenticated: false,
  });

  function setUser(token: string, user: User) {
    tokenStorage.save(token);
    dispatch({ type: 'SET_USER', payload: user });
  }

  async function login(email: string, password: string) {
    const { token, user } = await authService.login(email, password);
    profileService.clearCache();
    setUser(token, user);
  }

  async function loginWithGoogle(_token: string) {
    throw new Error('Google Sign-In ainda não configurado.');
  }

  async function register(data: RegisterData) {
    const { token, user } = await authService.register(data);
    profileService.clearCache();
    setUser(token, user);
  }

  function logout() {
    tokenStorage.remove();
    profileService.clearCache();
    dispatch({ type: 'SET_USER', payload: null });
  }

  async function forgotPassword(email: string) {
    await authService.forgotPassword(email);
  }

  async function verifyCode(email: string, code: string) {
    await authService.verifyCode(email, code);
  }

  async function resetPassword(email: string, code: string, newPassword: string) {
    await authService.resetPassword(email, code, newPassword);
  }

  return (
    <AuthContext.Provider value={{ ...state, login, loginWithGoogle, register, logout, forgotPassword, verifyCode, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
