import { Router } from 'express';
import {
    criarCandidatura,
    buscarMinhasCandidaturas,
    checarCandidatura,
    atualizarStatusCandidatura,
} from '../controllers/candidaturaController';

const router = Router();

router.post('/candidaturas', criarCandidatura);
router.get('/candidaturas/minhas', buscarMinhasCandidaturas);
router.get('/candidaturas/check/:projetoId', checarCandidatura);
router.patch('/projetos/:projetoId/candidaturas/:candidaturaId', atualizarStatusCandidatura);
router.patch('/projetos/:projetoId/candidaturas/:candidaturaId/status', atualizarStatusCandidatura);

export default router;
