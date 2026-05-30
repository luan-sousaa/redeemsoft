const BASE_URL = 'http://localhost:3333';

export type PixPayment = {
  id: string;
  brCode: string;
  brCodeBase64: string;
  expiresAt: string;
  status: string;
};

async function request<T>(path: string, options: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers ?? {}) },
  });

  const json = await res.json() as T & { error?: string };

  if (!res.ok) {
    throw new Error((json as { error?: string }).error ?? `Erro ${res.status}`);
  }

  return json;
}

export const paymentService = {
  createPixPayment(amount: number, description?: string): Promise<PixPayment> {
    return request<PixPayment>('/payments/create', {
      method: 'POST',
      body: JSON.stringify({ amount, description }),
    });
  },

  simulatePayment(id: string): Promise<void> {
    return request<void>(`/payments/${id}/simulate`, { method: 'POST' });
  },
};
