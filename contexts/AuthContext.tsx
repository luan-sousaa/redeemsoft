import React, { createContext, useContext, useEffect, useReducer } from 'react';
import { authService } from '@/services/authService';

type User = Record<string, unknown>;

export interface Usuario {
  idUsuario: number;
  nome: string;
  email: string;
  senha: string;
  type: 'client' | 'developer';
  cidade?: string | null;
  estado?: string | null;
  cpfCnpj?: string | null;
}

export type RegisterData = {
  idUsuario?: number;
  nome: string;
  email: string;
  senha: string;
  type: "client" | "developer";
  cidade?: string;
  estado?: string;
  cpfCnpj?: string;
};
interface LoginResponse {
  mensagem: string;
  user: Usuario;
};
type AuthState = {
  user: Usuario | null;
  isLoading: boolean;
  isAuthenticated: boolean;
};

type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: Usuario | null };

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
    (async () => {
      try {
        
        if (typeof (authService as any).getStoredUser === 'function') {
          const user = await (authService as any).getStoredUser();
          dispatch({ type: 'SET_USER', payload: user });
        } else if (typeof (authService as any).getUser === 'function') {
          const user = await (authService as any).getUser();
          dispatch({ type: 'SET_USER', payload: user });
        } else {

          dispatch({ type: 'SET_LOADING', payload: false });
        }
      } catch (err) {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    })();
  }, []);

  async function login(email: string, password: string) {

    const response = (await authService.login(email, password)) as unknown as LoginResponse;
    
    const userData = response.user;
    dispatch({ type: 'SET_USER', payload: response.user });
  }

  async function loginWithGoogle(token: string) {
    if (typeof (authService as any).loginWithGoogle === 'function') {
      const user = await (authService as any).loginWithGoogle(token);
      dispatch({ type: 'SET_USER', payload: user });
    } else {
      throw new Error('authService.loginWithGoogle is not implemented');
    }
  }

  async function register(data: RegisterData) {
    const user = await authService.register(data);
    dispatch({ type: 'SET_USER', payload: user });
  }

  function logout() {
    dispatch({ type: 'SET_USER', payload: null });
  }

  async function forgotPassword(email: string) {
    if (typeof (authService as any).forgotPassword === 'function') {
      await (authService as any).forgotPassword(email);
    } else {
      throw new Error('authService.forgotPassword is not implemented');
    }
  }

  async function verifyCode(email: string, code: string) {
    if (typeof (authService as any).verifyCode === 'function') {
      await (authService as any).verifyCode(email, code);
    } else {
      throw new Error('authService.verifyCode is not implemented');
    }
  }

  async function resetPassword(email: string, code: string, newPassword: string) {
    if (typeof (authService as any).resetPassword === 'function') {
      await (authService as any).resetPassword(email, code, newPassword);
    } else {
      throw new Error('authService.resetPassword is not implemented');
    }
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
