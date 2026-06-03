import express from 'express';
import { encontrarProjeto, criarProjeto, deletarProjeto, atualizarProjeto} from '../controllers/projetoController';

const router = express.Router();

router.get('/projetos', encontrarProjeto);
router.post('/projetos', criarProjeto);
router.put('/projetos/:id', atualizarProjeto);
router.delete('/projetos/:id', deletarProjeto);
export default router;