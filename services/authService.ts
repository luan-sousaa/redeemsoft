import axios from 'axios';

export type User = {
  idUsuario?: number;
  nome: string;
  email: string;
  type: string;
  cidade?: string;
  estado?: string;
};

export type RegisterData = {
  nome: string;
  email: string;
  senha: string;
  type: string;
  cidade?: string;
  estado?: string;
};

const API_URL = 'http://192.168.1.17:3000'; 

const api = axios.create({
  baseURL: API_URL,
});

export const authService = {
  login: async (email: string, senha: string): Promise<User> => {
    try {
      const response = await api.post('/login', { email, senha });
      return response.data.user;
    } catch (error: any) {
      throw new Error(error.response?.data?.mensagem || 'Erro ao fazer login');
    }
  },

  register: async (data: RegisterData): Promise<User> => {
    try {
      const response = await api.post('/usuarios', data);
      
      return response.data; 
    } catch (error: any) {
      throw new Error(error.response?.data?.mensagem || 'Erro ao cadastrar usuário');
    }
  },

  getStoredUser: async (): Promise<User | null> => { return null; },
  loginWithGoogle: async (token: string) => { throw new Error('Não implementado'); },

  forgotPassword: async (email: string) => { throw new Error('Não implementado'); },
  verifyCode: async (email: string, code: string) => { throw new Error('Não implementado'); },
  resetPassword: async (email: string, code: string, newPassword: string) => { throw new Error('Não implementado'); }
};