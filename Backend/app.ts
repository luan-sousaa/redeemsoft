import express, {Request, Response} from 'express';
import { usuario, novoProjeto } from '../Backend/src/db/schema';
import usuarioRoutes from './src/routes/usuarioRoutes';
import projetoRoutes from './src/routes/projetoRoutes';
import cors from 'cors';

const app = express()

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/', usuarioRoutes);

app.use('/', projetoRoutes);
app.listen(PORT, ()=>{
    console.log(`Servidor rodando com sucesso na porta ${PORT}!`);
})