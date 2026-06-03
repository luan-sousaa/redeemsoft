import {Request, Response} from 'express';
import { db } from '../db/db';
import {novoProjeto, cliente, usuario, aplicacao, desenvolvedor} from '../db/schema';
import { eq } from 'drizzle-orm';



export const encontrarProjeto = async (req: Request, res: Response) => {
    try {

        const projetosQuery = await db
            .select({
                projeto: novoProjeto,
                cliente: cliente,
                dono: usuario
            })
            .from(novoProjeto)
            .innerJoin(cliente, eq(novoProjeto.idCliente, cliente.idCliente))
            .innerJoin(usuario, eq(cliente.idUsuario, usuario.idUsuario));

            const aplicacoesQuery = await db
            .select({
                aplicacao: aplicacao,
                dev: desenvolvedor,
                nomeDev: usuario.nome,
                emailDev: usuario.email
            })
            .from(aplicacao)
            .innerJoin(desenvolvedor, eq(aplicacao.idDev, desenvolvedor.idDev))
            .innerJoin(usuario, eq(desenvolvedor.idUsuario, usuario.idUsuario));

        const projetosFormatados = projetosQuery.map((row) => {
            
            const candidaturasDoProjeto = aplicacoesQuery
                .filter((app) => app.aplicacao.idProjeto === row.projeto.idProjeto)
                .map((app) => ({
                    idAplicacao: app.aplicacao.idAplicacao,
                    idDev: app.aplicacao.idDev,
                    proposta: app.aplicacao.proposta,
                    status: app.aplicacao.status,

                    projeto: {
                        titulo: row.projeto.titulo,
                        prazo: row.projeto.prazo,
                    },
                    desenvolvedor: {
                        nome: app.nomeDev,
                        email: app.emailDev,
                        experiencia: app.dev.experiencia,
                    },
                }));

            return {
                ...row.projeto,
                nomeCliente: row.dono.nome,
                empresa: row.cliente.empresa,
                candidaturas: candidaturasDoProjeto,
            };
        });

        res.status(200).json(projetosFormatados);

    } catch (error) {
        console.error("🚨 ERRO AO BUSCAR PROJETOS:", error);
        res.status(500).json({ mensagem: "Erro ao encontrar projetos. Contate o administrador." });
    }
};

export const criarProjeto = async (req: Request, res: Response) => {

    const { titulo, descricao, orcamento, prazo, modalidades, stack, idUsuario } = req.body;

    if (!idUsuario) {
        return res.status(401).json({ 
            mensagem: "Acesso Negado: ID do usuário não informado. Faça login para criar um projeto." 
        });
    }

    let modalidadeFormatada = modalidades;
    if (Array.isArray(modalidades)) {
        modalidadeFormatada = modalidades[0];
    }
    if (modalidadeFormatada === 'SP') modalidadeFormatada = 'híbrido';
    if (modalidadeFormatada === 'P') modalidadeFormatada = 'presencial';
    if (modalidadeFormatada === 'H') modalidadeFormatada = 'remoto';

    try {

        const [clienteEncontrado] = await db.select()
            .from(cliente)
            .where(eq(cliente.idUsuario, Number(idUsuario)));

        if (!clienteEncontrado) {
            return res.status(404).json({ mensagem: "Perfil de cliente não encontrado para este usuário." });
        }

        const [novoProjetoCriado] = await db.insert(novoProjeto).values({
            idCliente: clienteEncontrado.idCliente, 
            titulo,
            descricao,
            orcamento: Number(orcamento),
            prazo: Number(prazo), 
            modalidade: modalidadeFormatada, 
            stack
        }).returning();
        
        return res.status(201).json(novoProjetoCriado);
        
    } catch (error) {
        console.error("🚨 ERRO FATAL AO SALVAR PROJETO NO BANCO:", error); 
        return res.status(500).json({ mensagem: "Erro ao criar projeto.", erroReal: error });
    }
};

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