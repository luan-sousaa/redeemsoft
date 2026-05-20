import express from 'express';
import { encontrarUsuario, criarUsuario, deletarUsuario, atualizarUsuario, fazerLogin } from '../controllers/usuarioController.js';

const router = express.Router();

router.get('/usuarios', encontrarUsuario);
router.post('/usuarios', criarUsuario);
router.put('/usuarios/:id', atualizarUsuario);
router.delete('/usuarios/:id', deletarUsuario);
router.post('/login', fazerLogin);
export default router;