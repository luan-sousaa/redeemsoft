import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useReducer } from 'react';
import { authService, type RegisterData, type User } from '@/services/authService';
import { api, tokenStorage } from '@/services/api';
import { profileService } from '@/services/profileService';

const USER_KEY = '@redeemsoft:user';

type AuthState = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
};

type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'UPDATE_USER'; payload: Partial<User> };

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_USER':
      return { ...state, user: action.payload, isAuthenticated: action.payload !== null, isLoading: false };
    case 'UPDATE_USER':
      return { ...state, user: state.user ? { ...state.user, ...action.payload } : state.user };
    default:
      return state;
  }
}

type AuthContextValue = AuthState & {
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: (token: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
  forgotPassword: (email: string) => Promise<void>;
  verifyCode: (email: string, code: string) => Promise<void>;
  resetPassword: (email: string, code: string, newPassword: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });

  useEffect(() => {
    async function initAuth() {
      try {
        const token = await tokenStorage.loadFromStorage();
        if (!token) { dispatch({ type: 'SET_USER', payload: null }); return; }

        const raw = await AsyncStorage.getItem(USER_KEY);
        if (!raw) { tokenStorage.remove(); dispatch({ type: 'SET_USER', payload: null }); return; }

        await api.get('/me');
        dispatch({ type: 'SET_USER', payload: JSON.parse(raw) as User });
      } catch {
        tokenStorage.remove();
        AsyncStorage.removeItem(USER_KEY).catch(() => {});
        dispatch({ type: 'SET_USER', payload: null });
      }
    }
    initAuth();
  }, []);

  function setUser(token: string, user: User) {
    tokenStorage.save(token);
    AsyncStorage.setItem(USER_KEY, JSON.stringify(user)).catch(() => {});
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

  function updateUser(data: Partial<User>) {
    dispatch({ type: 'UPDATE_USER', payload: data });
  }

  function logout() {
    tokenStorage.remove();
    AsyncStorage.removeItem(USER_KEY).catch(() => {});
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
    <AuthContext.Provider value={{ ...state, login, loginWithGoogle, register, logout, updateUser, forgotPassword, verifyCode, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
