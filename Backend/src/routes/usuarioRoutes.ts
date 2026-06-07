// Adicionado: rotas POST /usuario/forgot-password, /usuario/verify-code, /usuario/reset-password
// para o fluxo de recuperação de senha. Sem autenticação (rotas públicas).
import express from 'express';
import {
  encontrarUsuario,
  criarUsuario,
  deletarUsuario,
  atualizarUsuario,
  fazerLogin,
  esqueceuSenha,
  verificarCodigo,
  redefinirSenha,
} from '../controllers/usuarioController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.post('/login', fazerLogin);
router.post('/usuarios', criarUsuario);
router.get('/usuarios', authMiddleware, encontrarUsuario);
router.put('/usuarios/:id', authMiddleware, atualizarUsuario);
router.delete('/usuarios/:id', authMiddleware, deletarUsuario);

router.post('/usuario/forgot-password', esqueceuSenha);
router.post('/usuario/verify-code', verificarCodigo);
router.post('/usuario/reset-password', redefinirSenha);

export default router;
