import AsyncStorage from '@react-native-async-storage/async-storage';

export const API_BASE_URL = 'https://redeemsoft-production.up.railway.app';

const TOKEN_KEY = '@redeemsoft:token';
let memoryToken: string | null = null;

export const tokenStorage = {
  save(token: string) {
    memoryToken = token;
    AsyncStorage.setItem(TOKEN_KEY, token).catch(() => {});
  },
  get(): string | null {
    return memoryToken;
  },
  remove() {
    memoryToken = null;
    AsyncStorage.removeItem(TOKEN_KEY).catch(() => {});
  },
  async loadFromStorage(): Promise<string | null> {
    try {
      const stored = await AsyncStorage.getItem(TOKEN_KEY);
      if (stored) memoryToken = stored;
      return stored;
    } catch {
      return null;
    }
  },
};

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

const TIMEOUT_MS = 15_000;

async function request<T>(method: HttpMethod, path: string, body?: unknown): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (memoryToken) headers['Authorization'] = `Bearer ${memoryToken}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    const text = await response.text();
    let data: Record<string, unknown> | null = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      throw new Error(`Erro ${response.status}: servidor retornou resposta inválida`);
    }

    if (!response.ok) throw new Error(data?.mensagem as string ?? `Erro ${response.status}`);
    return data as T;
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error('Tempo de resposta excedido. Verifique sua conexão.');
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

export const api = {
  get:    <T>(path: string)                => request<T>('GET',    path),
  post:   <T>(path: string, body: unknown) => request<T>('POST',   path, body),
  put:    <T>(path: string, body: unknown) => request<T>('PUT',    path, body),
  patch:  <T>(path: string, body: unknown) => request<T>('PATCH',  path, body),
  delete: <T>(path: string)                => request<T>('DELETE', path),
};
