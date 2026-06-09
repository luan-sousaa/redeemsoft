import { Router } from 'express';
import {
  criarContrato,
  buscarContratoPorId,
  buscarContratoPorProjeto,
  atualizarPagamento,
  confirmarEntrega,
  enviarMensagem,
  buscarMensagens,
} from '../controllers/contratoController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// A rota estática /contrato/projeto/:projetoId DEVE vir antes de /contrato/:id
// para que "projeto" não seja interpretado como um ID numérico.
router.get('/contrato/projeto/:projetoId', authMiddleware, buscarContratoPorProjeto);

router.post('/contrato',                           authMiddleware, criarContrato);
router.get('/contrato/:id',                        authMiddleware, buscarContratoPorId);
router.patch('/contrato/:id/pagamento',            authMiddleware, atualizarPagamento);
router.patch('/contrato/:id/confirmar-entrega',    authMiddleware, confirmarEntrega);
router.post('/contrato/:id/mensagem',              authMiddleware, enviarMensagem);
router.get('/contrato/:id/mensagens',              authMiddleware, buscarMensagens);

export default router;
