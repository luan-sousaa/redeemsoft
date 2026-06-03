import { Router, Request, Response } from 'express';

const router = Router();

const ABACATEPAY_BASE = 'https://api.abacatepay.com/v2';

function abacateHeaders() {
  const apiKey = process.env.ABACATEPAY_API_KEY;
  if (!apiKey) throw new Error('ABACATEPAY_API_KEY não configurada');
  return {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  };
}

// POST /payments/create
router.post('/create', async (req: Request, res: Response) => {
  const { amount, description } = req.body as { amount?: number; description?: string };

  if (!amount || amount <= 0) {
    res.status(400).json({ error: 'Campo "amount" é obrigatório e deve ser maior que zero (em centavos).' });
    return;
  }

  try {
    const response = await fetch(`${ABACATEPAY_BASE}/transparents/create`, {
      method: 'POST',
      headers: abacateHeaders(),
      body: JSON.stringify({
        method: 'PIX',
        data: {
          amount,
          ...(description && { description }),
        },
      }),
    });

    const json = await response.json() as {
      success: boolean;
      error: string | null;
      data: {
        id: string;
        brCode: string;
        brCodeBase64: string;
        expiresAt: string;
        status: string;
      } | null;
    };

    if (!json.success || !json.data) {
      res.status(502).json({ error: json.error ?? 'Erro ao criar cobrança no AbacatePay.' });
      return;
    }

    res.json({
      id: json.data.id,
      brCode: json.data.brCode,
      brCodeBase64: json.data.brCodeBase64,
      expiresAt: json.data.expiresAt,
      status: json.data.status,
    });
  } catch (err) {
    console.error('[payments/create]', err);
    res.status(500).json({ error: 'Erro interno ao criar cobrança.' });
  }
});

// POST /payments/:id/simulate  (apenas sandbox)
router.post('/:id/simulate', async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const response = await fetch(`${ABACATEPAY_BASE}/transparents/simulate-payment?id=${id}`, {
      method: 'POST',
      headers: abacateHeaders(),
    });

    const json = await response.json() as { success: boolean; error: string | null };

    if (!json.success) {
      res.status(502).json({ error: json.error ?? 'Erro ao simular pagamento.' });
      return;
    }

    res.json({ ok: true });
  } catch (err) {
    console.error('[payments/simulate]', err);
    res.status(500).json({ error: 'Erro interno ao simular pagamento.' });
  }
});

export { router as paymentsRouter };
