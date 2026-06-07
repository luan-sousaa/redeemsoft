import express from 'express';
import { buscarClientePorId, atualizarCliente } from '../controllers/clienteController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.get('/clientes/:id', buscarClientePorId);
router.put('/clientes/:id', authMiddleware, atualizarCliente);

export default router;
