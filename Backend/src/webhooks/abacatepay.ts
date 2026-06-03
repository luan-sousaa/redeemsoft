import crypto from 'crypto';
import { Router, Request, Response } from 'express';

const router = Router();

function verifySignature(rawBody: Buffer, signature: string, secret: string): boolean {
  const expected = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('base64');

  try {
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  } catch {
    return false;
  }
}

// POST /webhooks/abacatepay
router.post('/abacatepay', (req: Request, res: Response) => {
  const secret = process.env.ABACATEPAY_WEBHOOK_SECRET;
  const signature = req.headers['x-webhook-signature'] as string | undefined;

  if (secret && signature) {
    const rawBody = req.body as Buffer;
    if (!verifySignature(rawBody, signature, secret)) {
      res.status(401).json({ error: 'Assinatura inválida.' });
      return;
    }
  }

  const payload = JSON.parse((req.body as Buffer).toString()) as {
    event: string;
    devMode: boolean;
    data: { id: string; status: string; amount: number };
  };

  console.log(`[webhook] evento: ${payload.event} | id: ${payload.data.id} | status: ${payload.data.status} | devMode: ${payload.devMode}`);

  // Aqui você pode atualizar o banco de dados, notificar o app via socket, etc.

  res.json({ received: true });
});

export { router as webhooksRouter };
