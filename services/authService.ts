export type User = {
  id: string;
  email: string;
  name: string;
  type: 'client' | 'developer';
};

export type RegisterData = {
  name: string;
  email: string;
  password: string;
  type: 'client' | 'developer';
};

const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export const authService = {
  async login(email: string, password: string): Promise<User> {
    await delay(1200);
    if (email === 'test@redeemsoft.com' && password === 'password123') {
      return { id: '1', email, name: 'Usuário Teste', type: 'client' };
    }
    throw new Error('Credenciais inválidas. Verifique seu e-mail e senha.');
  },

  async loginWithGoogle(token: string): Promise<User> {
    await delay(800);
    // Mock: any token succeeds in development
    void token;
    return { id: 'g-1', email: 'google@redeemsoft.com', name: 'Usuário Google', type: 'client' };
  },

  async register(data: RegisterData): Promise<User> {
    await delay(1500);
    return { id: '2', email: data.email, name: data.name, type: data.type };
  },

  async forgotPassword(email: string): Promise<void> {
    await delay(1000);
    void email;
    // Mock: always succeeds
  },

  async getStoredUser(): Promise<User | null> {
    // MVP: no persistence — session resets on app restart
    // Future: read from SecureStore/AsyncStorage
    return null;
  },
};
