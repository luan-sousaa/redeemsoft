import express from 'express';
import cors from 'cors';
import { migrate } from 'drizzle-orm/libsql/migrator';
import { db } from './src/db/db.js';
import usuarioRoutes from './src/routes/usuarioRoutes.js';
import projetoRoutes from './src/routes/projetoRoutes.js';
import devRoutes from './src/routes/devRoutes.js';
import candidaturaRoutes from './src/routes/candidaturaRoutes.js';
import clienteRoutes from './src/routes/clienteRoutes.js';
import contratoRoutes from './src/routes/contratoRoutes.js';

const app = express();
const PORT = Number(process.env['PORT']) || 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.get('/health', (_req, res) => res.json({ status: 'ok', version: '2.2.0', routes: ['contrato', 'mensagem', 'escrow', 'dev_foto'] }));

app.use('/', usuarioRoutes);
app.use('/', projetoRoutes);
app.use('/', devRoutes);
app.use('/', candidaturaRoutes);
app.use('/', clienteRoutes);
app.use('/', contratoRoutes);

(async () => {
  try {
    await migrate(db, { migrationsFolder: './drizzle' });
  } catch (err) {
    // Migrações frequentemente precisam ser aplicadas manualmente no Turso —
    // apenas loga o aviso e continua subindo o servidor.
    console.warn('[migrate] Aviso (migration pode já ter sido aplicada manualmente):', (err as Error).message);
  }
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor rodando na porta ${PORT}`);
  });
})();
