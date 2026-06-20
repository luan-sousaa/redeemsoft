import { Router } from 'express';
import { getNotificacoes, marcarLida, marcarTodasLidas } from '../controllers/notificacaoController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.get('/notificacoes', authMiddleware, getNotificacoes);
router.patch('/notificacoes/lidas', authMiddleware, marcarTodasLidas);
router.patch('/notificacoes/:id/lida', authMiddleware, marcarLida);

export default router;
