import express from 'express';
import cors from 'cors';
import { migrate } from 'drizzle-orm/libsql/migrator';
import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
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

app.get('/health', (_req, res) => res.json({ status: 'ok', version: '2.3.0' }));

app.use('/', usuarioRoutes);
app.use('/', projetoRoutes);
app.use('/', devRoutes);
app.use('/', candidaturaRoutes);
app.use('/', clienteRoutes);
app.use('/', contratoRoutes);
app.use('/', notificacaoRoutes);

(async () => {
  // Usa cliente SEPARADO para o migrator — evita corromper o db principal
  // se a migration falhar (ex: coluna já existe no Turso)
  try {
    const url = process.env['TURSO_URL'] ?? 'file:src/db/news.db';
    const authToken = process.env['TURSO_TOKEN'];
    const migrateClient = createClient({ url, authToken });
    const migrateDb = drizzle(migrateClient);
    await migrate(migrateDb, { migrationsFolder: './drizzle' });
    // @ts-ignore — close existe no cliente HTTP mas não no tipo
    migrateClient.close?.();
  } catch (err) {
    console.warn('[migrate] Aviso:', (err as Error).message);
  }

  // Garante que a tabela notificacao existe (criação idempotente)
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
    console.log('[startup] Tabela notificacao OK');
  } catch (err) {
    console.warn('[startup] notificacao:', (err as Error).message);
  }

  // Garante a coluna projetos no desenvolvedor (idempotente)
  try {
    await db.run(sql`ALTER TABLE desenvolvedor ADD COLUMN projetos text`);
  } catch {
    // Ignorado — coluna já existe
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor rodando na porta ${PORT}`);
  });
})();
