import express from 'express';
import { criarPerfilDev, encontrarDesenvolvedores, atualizarPerfilDev, deletarPerfilDev, buscarPerfilMeu, atualizarPerfilMeu, buscarDesenvolvedorPorId } from '../controllers/devController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.get('/desenvolvedores', encontrarDesenvolvedores);
router.get('/desenvolvedores/meu', authMiddleware, buscarPerfilMeu);
router.get('/desenvolvedores/:id', buscarDesenvolvedorPorId);
router.put('/desenvolvedores/meu', authMiddleware, atualizarPerfilMeu);
router.post('/desenvolvedores', criarPerfilDev);
router.put('/desenvolvedores/:id', authMiddleware, atualizarPerfilDev);
router.delete('/desenvolvedores/:id', authMiddleware, deletarPerfilDev);

export default router;
