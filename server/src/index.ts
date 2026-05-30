import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import { paymentsRouter } from './routes/payments';
import { webhooksRouter } from './webhooks/abacatepay';

dotenv.config();

const app = express();
const PORT = process.env.PORT ?? 3333;

app.use(cors({ origin: '*' }));

// Raw body para verificação de assinatura de webhooks
app.use('/webhooks', express.raw({ type: 'application/json' }));
app.use(express.json());

app.use('/payments', paymentsRouter);
app.use('/webhooks', webhooksRouter);

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`[server] rodando em http://0.0.0.0:${PORT}`);
});
