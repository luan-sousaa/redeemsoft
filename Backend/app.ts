import express from 'express';
import cors from 'cors';
import { migrate } from 'drizzle-orm/libsql/migrator';
import { db } from './src/db/db.js';
import usuarioRoutes from './src/routes/usuarioRoutes.js';
import projetoRoutes from './src/routes/projetoRoutes.js';
import devRoutes from './src/routes/devRoutes.js';
import candidaturaRoutes from './src/routes/candidaturaRoutes.js';

const app = express();
const PORT = Number(process.env['PORT']) || 3000;

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => res.json({ status: 'ok', version: '2.0.0', routes: ['forgot-password', 'verify-code', 'reset-password'] }));

app.use('/', usuarioRoutes);
app.use('/', projetoRoutes);
app.use('/', devRoutes);
app.use('/', candidaturaRoutes);

// Executa migrações e só depois sobe o servidor
migrate(db, { migrationsFolder: './drizzle' })
  .then(() => {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Servidor rodando na porta ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Erro ao executar migrações:', err);
    process.exit(1);
  });
