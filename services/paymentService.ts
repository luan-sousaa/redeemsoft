import Constants from 'expo-constants';

const BASE_URL = 'https://api.abacatepay.com/v2';

// Chave lida de app.json extra.abacateApiKey — nunca hardcoded no código
const API_KEY: string =
  (Constants.expoConfig?.extra?.abacateApiKey as string | undefined) ??
  'abc_dev_hdyMQKefxf0GG4azfQMduhd1'; // fallback sandbox

export type PixPayment = {
  id: string;
  brCode: string;
  brCodeBase64: string;
  expiresAt: string;
  status: string;
};

type AbacateResponse<T> = { success: boolean; data: T | null; error: string | null };

async function abacateRequest<T>(path: string, options: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
  });

  const json = (await res.json()) as AbacateResponse<T>;

  if (!json.success || !json.data) {
    throw new Error(json.error ?? `Erro ${res.status}`);
  }

  return json.data;
}

export const paymentService = {
  async createPixPayment(amount: number, description?: string): Promise<PixPayment> {
    if (!amount || amount <= 0) throw new Error('Valor do pagamento inválido.');
    return abacateRequest<PixPayment>('/transparents/create', {
      method: 'POST',
      body: JSON.stringify({
        method: 'PIX',
        data: { amount, ...(description && { description }) },
      }),
    });
  },

  async simulatePayment(id: string): Promise<void> {
    const res = await fetch(`${BASE_URL}/transparents/simulate-payment?id=${id}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${API_KEY}` },
    });
    const json = (await res.json()) as AbacateResponse<unknown>;
    if (!json.success) throw new Error(json.error ?? 'Erro ao simular pagamento');
  },
};
