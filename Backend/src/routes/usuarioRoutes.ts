import express from 'express';
import { encontrarUsuario, criarUsuario, deletarUsuario, atualizarUsuario, fazerLogin } from '../controllers/usuarioController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.post('/login', fazerLogin);
router.post('/usuarios', criarUsuario);
router.get('/usuarios', authMiddleware, encontrarUsuario);
router.put('/usuarios/:id', authMiddleware, atualizarUsuario);
router.delete('/usuarios/:id', authMiddleware, deletarUsuario);

export default router;
