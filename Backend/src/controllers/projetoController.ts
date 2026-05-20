import {Request, Response} from 'express';
import { db } from '../db/db.js';
import {novoProjeto} from '../db/schema.js';
import { eq } from 'drizzle-orm';

interface Projeto{
    idProjeto: number;
    idCliente: number;
    titulo: string;
    descricao: string;
    orcamento: number;
    prazo: number;
    modalidade: "presencial" | "remoto" | "híbrido";
    stack: string;
    dataCriacao: Date;
}

export const encontrarProjeto = async (req: Request, res: Response) =>{

    try{

        const listaProjetos = await db.select().from(novoProjeto);
        res.json(listaProjetos);
    }catch(error){
        res.status(500).json({mensagem: "Erro ao encontrar projetos. Contate o administrador."})
    }
};

export const criarProjeto = async (req: Request, res: Response) => {
    const { titulo, descricao, orcamento, prazo, modalidades, stack, idCliente } = req.body;

    let modalidadeFormatada = modalidades;
    if (Array.isArray(modalidades)) {
        modalidadeFormatada = modalidades[0];
    }
    if (modalidadeFormatada === 'SP') modalidadeFormatada = 'híbrido';
    if (modalidadeFormatada === 'P') modalidadeFormatada = 'presencial';
    if (modalidadeFormatada === 'H') modalidadeFormatada = 'remoto';

    if (!idCliente) {
        return res.status(401).json({ 
            mensagem: "Acesso Negado: ID do cliente não informado. Faça login para criar um projeto." 
        });
    }

    try {
        const [novoProjetoCriado] = await db.insert(novoProjeto).values({
            idCliente: idCliente,
            titulo,
            descricao,
            orcamento,
            prazo: Number(prazo), 
            modalidade: modalidadeFormatada, 
            stack
        }).returning();
        
        res.status(201).json(novoProjetoCriado);
        
    } catch (error) {
        console.error("🚨 ERRO FATAL AO SALVAR PROJETO NO BANCO:", error); 
        res.status(500).json({ mensagem: "Erro ao criar projeto.", erroReal: error });
    }
}
export const atualizarProjeto = async (req: Request, res: Response)=> {
    
    const {id} = req.params;
    
    const {idCliente} = req.body;  
    const {titulo} = req.body;
    const {descricao} = req.body; 
    const {orcamento} = req.body;
    const {prazo} = req.body;
    const {modalidade} = req.body;
    const {stack} = req.body;

    try{

        const projetoAtualizado = await db.update(novoProjeto).set({idCliente, titulo, descricao, orcamento, prazo, modalidade, stack}).where(eq(novoProjeto.idProjeto, Number(id)))
        .returning();
        res.json(projetoAtualizado);
    }catch(error){
        res.status(500).json({mensagem: "Erro ao atualizar projeto. Contate o administrador."})
    }
}

export const deletarProjeto = async (req: Request, res: Response) => {

    const {id} = req.params;    
    try{
        const projetoDeletado = await db.delete(novoProjeto).where(eq(novoProjeto.idProjeto, Number(id)))
        .returning();
        res.json(projetoDeletado);
    }catch(error){
        res.status(500).json({mensagem: "Erro ao deletar projeto. Contate o administrador."})
    }
}