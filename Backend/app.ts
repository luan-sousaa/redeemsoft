import express from 'express';
import cors from 'cors';
import { migrate } from 'drizzle-orm/libsql/migrator';
import { sql } from 'drizzle-orm';
import { db } from './src/db/db.js';
import usuarioRoutes from './src/routes/usuarioRoutes.js';
import projetoRoutes from './src/routes/projetoRoutes.js';
import devRoutes from './src/routes/devRoutes.js';
import candidaturaRoutes from './src/routes/candidaturaRoutes.js';
import clienteRoutes from './src/routes/clienteRoutes.js';
import contratoRoutes from './src/routes/contratoRoutes.js';
import notificacaoRoutes from './src/routes/notificacaoRoutes.js';

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
app.use('/', notificacaoRoutes);

(async () => {
  try {
    await migrate(db, { migrationsFolder: './drizzle' });
  } catch (err) {
    // Migrações frequentemente precisam ser aplicadas manualmente no Turso —
    // apenas loga o aviso e continua subindo o servidor.
    console.warn('[migrate] Aviso (migration pode já ter sido aplicada manualmente):', (err as Error).message);
  }

  // Criação direta da tabela notificacao — evita problemas do migrator com Turso
  try {
    await db.run(sql`
      CREATE TABLE IF NOT EXISTS notificacao (
        id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        idUsuario INTEGER NOT NULL,
        tipo TEXT NOT NULL,
        titulo TEXT NOT NULL,
        corpo TEXT NOT NULL,
        lida INTEGER NOT NULL DEFAULT 0,
        criadoEm TEXT NOT NULL DEFAULT (datetime('now'))
      )
    `);
  } catch (err) {
    console.warn('[startup] Aviso ao criar tabela notificacao:', (err as Error).message);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor rodando na porta ${PORT}`);
  });
})();
