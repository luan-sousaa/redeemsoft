import express from 'express';
import {criarPerfilDev, encontrarDesenvolvedores, atualizarPerfilDev, deletarPerfilDev} from '../controllers/devController';
import { atualizarProjeto, deletarProjeto } from '../controllers/projetoController';

const router = express.Router();

router.get('/desenvolvedores', encontrarDesenvolvedores);
router.post('/desenvolvedores', criarPerfilDev);    
router.put('/desenvolvedores/:id', atualizarPerfilDev);
router.delete('/desenvolvedores/:id', deletarPerfilDev);
export default router;