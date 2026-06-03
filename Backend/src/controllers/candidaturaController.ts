import { Request, Response } from 'express';
import { db } from '../db/db';
import { aplicacao, desenvolvedor, novoProjeto } from '../db/schema';
import { eq, and } from 'drizzle-orm';

export const criarCandidatura = async (req: Request, res: Response) => {
    const { idUsuario, idProjeto, proposta } = req.body;

    if (!idUsuario || !idProjeto) {
        return res.status(400).json({ mensagem: "idUsuario e idProjeto são obrigatórios." });
    }

    try {
        const [dev] = await db.select().from(desenvolvedor).where(eq(desenvolvedor.idUsuario, Number(idUsuario)));
        if (!dev) {
            return res.status(404).json({ mensagem: "Perfil de desenvolvedor não encontrado para este usuário." });
        }

        const existente = await db.select().from(aplicacao)
            .where(and(eq(aplicacao.idDev, dev.idDev), eq(aplicacao.idProjeto, Number(idProjeto))));
        if (existente.length > 0) {
            return res.status(409).json({ mensagem: "Você já se candidatou a este projeto." });
        }

        const [nova] = await db.insert(aplicacao).values({
            idDev: dev.idDev,
            idProjeto: Number(idProjeto),
            proposta: proposta ? Number(proposta) : null,
            status: 'pendente',
        }).returning();

        return res.status(201).json(nova);
    } catch (error) {
        console.error("Erro ao criar candidatura:", error);
        return res.status(500).json({ mensagem: "Erro ao criar candidatura.", error });
    }
};

export const buscarMinhasCandidaturas = async (req: Request, res: Response) => {
    const { idUsuario } = req.query;

    if (!idUsuario) {
        return res.status(400).json({ mensagem: "idUsuario é obrigatório." });
    }

    try {
        const [dev] = await db.select().from(desenvolvedor).where(eq(desenvolvedor.idUsuario, Number(idUsuario)));
        if (!dev) {
            return res.status(200).json([]);
        }

        const candidaturas = await db.select({
            aplicacao,
            projeto: novoProjeto,
        })
            .from(aplicacao)
            .innerJoin(novoProjeto, eq(aplicacao.idProjeto, novoProjeto.idProjeto))
            .where(eq(aplicacao.idDev, dev.idDev));

        const formatadas = candidaturas.map(({ aplicacao: ap, projeto }) => ({
            candidaturaId: ap.idAplicacao,
            projetoId: ap.idProjeto,
            titulo: projeto.titulo,
            stack: projeto.stack,
            preco: ap.proposta ?? 0,
            prazo: String(projeto.prazo),
            status: ap.status,
            dataEnvio: new Date(),
        }));

        return res.status(200).json(formatadas);
    } catch (error) {
        console.error("Erro ao buscar candidaturas:", error);
        return res.status(500).json({ mensagem: "Erro ao buscar candidaturas.", error });
    }
};

export const checarCandidatura = async (req: Request, res: Response) => {
    const { projetoId } = req.params;
    const { idUsuario } = req.query;

    if (!idUsuario) {
        return res.status(200).json({ jaCandidatou: false });
    }

    try {
        const [dev] = await db.select().from(desenvolvedor).where(eq(desenvolvedor.idUsuario, Number(idUsuario)));
        if (!dev) {
            return res.status(200).json({ jaCandidatou: false });
        }

        const existente = await db.select().from(aplicacao)
            .where(and(eq(aplicacao.idDev, dev.idDev), eq(aplicacao.idProjeto, Number(projetoId))));

        return res.status(200).json({ jaCandidatou: existente.length > 0 });
    } catch (error) {
        console.error("Erro ao checar candidatura:", error);
        return res.status(500).json({ mensagem: "Erro ao checar candidatura.", error });
    }
};

export const atualizarStatusCandidatura = async (req: Request, res: Response) => {
    const { candidaturaId } = req.params;
    const { status } = req.body;

    if (!['pendente', 'aceito', 'recusado'].includes(status)) {
        return res.status(400).json({ mensagem: "Status inválido." });
    }

    try {
        const [atualizada] = await db.update(aplicacao)
            .set({ status })
            .where(eq(aplicacao.idAplicacao, Number(candidaturaId)))
            .returning();

        if (!atualizada) {
            return res.status(404).json({ mensagem: "Candidatura não encontrada." });
        }

        return res.status(200).json(atualizada);
    } catch (error) {
        console.error("Erro ao atualizar status:", error);
        return res.status(500).json({ mensagem: "Erro ao atualizar status.", error });
    }
};
