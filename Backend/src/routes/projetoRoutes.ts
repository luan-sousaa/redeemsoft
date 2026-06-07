import express from 'express';
import { encontrarProjeto, encontrarProjetosMeus, criarProjeto, deletarProjeto, atualizarProjeto } from '../controllers/projetoController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.get('/projetos', encontrarProjeto);
router.get('/projetos/meus', authMiddleware, encontrarProjetosMeus);
router.post('/projetos', authMiddleware, criarProjeto);
router.put('/projetos/:id', authMiddleware, atualizarProjeto);
router.delete('/projetos/:id', authMiddleware, deletarProjeto);

export default router;
