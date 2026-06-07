import { Router } from 'express';
import { criarCandidatura, buscarMinhasCandidaturas, checarCandidatura, atualizarStatusCandidatura } from '../controllers/candidaturaController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.post('/candidaturas', authMiddleware, criarCandidatura);
router.get('/candidaturas/minhas', authMiddleware, buscarMinhasCandidaturas);
router.get('/candidaturas/check/:projetoId', authMiddleware, checarCandidatura);
router.patch('/projetos/:projetoId/candidaturas/:candidaturaId', authMiddleware, atualizarStatusCandidatura);

export default router;
