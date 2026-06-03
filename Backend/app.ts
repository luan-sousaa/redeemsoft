import express, {Request, Response} from 'express';
import { usuario, novoProjeto } from '../backend/src/db/schema';
import usuarioRoutes from './src/routes/usuarioRoutes';
import projetoRoutes from './src/routes/projetoRoutes';
import devRoutes from './src/routes/devRoutes';
import cors from 'cors';

const app = express()

const PORT = Number(process.env.PORT) || 3000;

app.use(cors());
app.use(express.json());

app.use('/', usuarioRoutes);
app.use('/', projetoRoutes);
app.use('/', devRoutes);

app.listen(PORT,'0.0.0.0',()=>{
    console.log(`Servidor rodando com sucesso na porta ${PORT}!`);
})