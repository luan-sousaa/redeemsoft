export const API_BASE_URL = 'https://redeemsoft-backend-production.up.railway.app';

let memoryToken: string | null = null;

export const tokenStorage = {
  save(token: string)        { memoryToken = token; },
  get(): string | null       { return memoryToken; },
  remove()                   { memoryToken = null; },
};

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

async function request<T>(method: HttpMethod, path: string, body?: unknown): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (memoryToken) headers['Authorization'] = `Bearer ${memoryToken}`;

  try {
    console.log(`[API] ${method} ${url}`);
    const response = await fetch(url, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    const text = await response.text();
    console.log(`[API] ${response.status} →`, text.slice(0, 120));
    const data = text ? JSON.parse(text) : null;
    if (!response.ok) throw new Error(data?.mensagem ?? `Erro ${response.status}`);
    return data as T;
  } catch (err: unknown) {
    const msg = err instanceof Error ? `${err.name}: ${err.message}` : String(err);
    console.error(`[API] FALHOU ${method} ${url} →`, msg);
    throw err;
  }
}

export const api = {
  get:    <T>(path: string)                => request<T>('GET',    path),
  post:   <T>(path: string, body: unknown) => request<T>('POST',   path, body),
  put:    <T>(path: string, body: unknown) => request<T>('PUT',    path, body),
  patch:  <T>(path: string, body: unknown) => request<T>('PATCH',  path, body),
  delete: <T>(path: string)                => request<T>('DELETE', path),
};
