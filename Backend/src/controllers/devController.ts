import { Request, Response } from 'express';
import { db } from '../db/db';
import { desenvolvedor, usuario, aplicacao, novoProjeto } from '../db/schema';
import { eq } from 'drizzle-orm';

export const encontrarDesenvolvedores = async (req: Request, res: Response) => {
    try {
        const devsQuery = await db
            .select({
                perfil: desenvolvedor,
                usuario: {
                    nome: usuario.nome,
                    email: usuario.email,
                    cidade: usuario.cidade,
                    estado: usuario.estado
                }
            })
            .from(desenvolvedor)
            .innerJoin(usuario, eq(desenvolvedor.idUsuario, usuario.idUsuario));

        res.status(200).json(devsQuery);

    } catch (error) {
        console.error("🚨 ERRO AO BUSCAR DESENVOLVEDORES:", error);
        res.status(500).json({ mensagem: "Erro ao listar desenvolvedores." });
    }
};

export const criarPerfilDev = async (req: Request, res: Response) => {
    const { idUsuario, precoPorHora, sobreMim, habilidades, certificacoes, experiencia } = req.body;

    if (!idUsuario) {
        return res.status(401).json({ 
            mensagem: "ID do usuário não informado. É necessário um usuário válido para criar o perfil." 
        });
    }

    try {

        const [usuarioEncontrado] = await db.select()
            .from(usuario)
            .where(eq(usuario.idUsuario, Number(idUsuario)));

        if (!usuarioEncontrado) {
            return res.status(404).json({ mensagem: "Usuário não encontrado no sistema." });
        }

        const [perfilExistente] = await db.select()
            .from(desenvolvedor)
            .where(eq(desenvolvedor.idUsuario, Number(idUsuario)));

        if (perfilExistente) {
            return res.status(400).json({ mensagem: "Este usuário já possui um perfil de desenvolvedor ativo." });
        }

        const [novoDev] = await db.insert(desenvolvedor).values({
            idUsuario: Number(idUsuario),
            precoPorHora: precoPorHora ? Number(precoPorHora) : null,
            sobreMim,
            habilidades,
            certificacoes,
            experiencia
        }).returning();
        
        return res.status(201).json(novoDev);
        
    } catch (error) {
        console.error("🚨 ERRO AO CRIAR PERFIL DE DESENVOLVEDOR:", error); 
        return res.status(500).json({ mensagem: "Erro ao criar perfil de desenvolvedor." });
    }
};

export const atualizarPerfilDev = async (req: Request, res: Response) => {
    const { id } = req.params; // ID do desenvolvedor (idDev)
    
    const { 
        precoPorHora, 
        sobreMim, 
        habilidades, 
        certificacoes, 
        experiencia 
    } = req.body;  

    try {
        const perfilAtualizado = await db.update(desenvolvedor)
            .set({ 
                precoPorHora: precoPorHora ? Number(precoPorHora) : undefined,
                sobreMim,
                habilidades,
                certificacoes,
                experiencia
            })
            .where(eq(desenvolvedor.idDev, Number(id)))
            .returning();

        if (perfilAtualizado.length === 0) {
            return res.status(404).json({ mensagem: "Perfil de desenvolvedor não encontrado." });
        }
            
        res.status(200).json(perfilAtualizado);

    } catch (error) {
        console.error("🚨 ERRO AO ATUALIZAR PERFIL DE DESENVOLVEDOR:", error);
        res.status(500).json({ mensagem: "Erro ao atualizar perfil." });
    }
};

export const deletarPerfilDev = async (req: Request, res: Response) => {
    const { id } = req.params; // ID do desenvolvedor (idDev)
    
    try {
        const perfilDeletado = await db.delete(desenvolvedor)
            .where(eq(desenvolvedor.idDev, Number(id)))
            .returning();
            
        res.status(200).json(perfilDeletado);

    } catch (error) {
        console.error("🚨 ERRO AO DELETAR PERFIL DE DESENVOLVEDOR:", error);
        res.status(500).json({ mensagem: "Erro ao deletar perfil." });
    }
};

export const buscarCandidaturasDoDev = async (req: Request, res: Response) => {
    const { idDev } = req.params;

    try {
        const candidaturas = await db
            .select({
                aplicacao: aplicacao,
                projeto: novoProjeto,
            })
            .from(aplicacao)
            .innerJoin(novoProjeto, eq(aplicacao.idProjeto, novoProjeto.idProjeto))
            .where(eq(aplicacao.idDev, Number(idDev)));

        res.status(200).json(candidaturas);

    } catch (error) {
        console.error("🚨 ERRO AO BUSCAR CANDIDATURAS DO DEV:", error);
        res.status(500).json({ mensagem: "Erro ao buscar candidaturas." });
    }
};