import type { Request, Response } from 'express';
import { db } from '../db/db';
import { aplicacao, desenvolvedor, novoProjeto } from '../db/schema';
import { eq, and } from 'drizzle-orm';

export const criarCandidatura = async (req: Request, res: Response) => {
  const { idProjeto, proposta } = req.body;
  const idDev = req.user?.idDev;

  if (!idDev) {
    return res.status(403).json({ mensagem: 'Apenas desenvolvedores podem se candidatar.' });
  }

  if (!idProjeto) {
    return res.status(400).json({ mensagem: 'idProjeto é obrigatório.' });
  }

  try {
    const existente = await db
      .select()
      .from(aplicacao)
      .where(and(eq(aplicacao.idDev, idDev), eq(aplicacao.idProjeto, Number(idProjeto))));

    if (existente.length > 0) {
      return res.status(409).json({ mensagem: 'Você já se candidatou a este projeto.' });
    }

    const [nova] = await db
      .insert(aplicacao)
      .values({ idDev, idProjeto: Number(idProjeto), proposta: proposta ? Number(proposta) : null, status: 'pendente' })
      .returning();

    return res.status(201).json(nova);
  } catch (error) {
    console.error('Erro ao criar candidatura:', error);
    return res.status(500).json({ mensagem: 'Erro ao criar candidatura.', error });
  }
};

export const buscarMinhasCandidaturas = async (req: Request, res: Response) => {
  const idDev = req.user?.idDev;

  if (!idDev) {
    return res.status(200).json([]);
  }

  try {
    const candidaturas = await db
      .select({ aplicacao, projeto: novoProjeto })
      .from(aplicacao)
      .innerJoin(novoProjeto, eq(aplicacao.idProjeto, novoProjeto.idProjeto))
      .where(eq(aplicacao.idDev, idDev));

    const formatadas = candidaturas.map(({ aplicacao: ap, projeto }) => ({
      candidaturaId: ap.idAplicacao,
      projetoId: ap.idProjeto,
      titulo: projeto.titulo,
      stack: projeto.stack,
      preco: ap.proposta ?? 0,
      prazo: `${projeto.prazo} dias`,
      status: ap.status,
      dataEnvio: new Date().toISOString(),
    }));

    return res.status(200).json(formatadas);
  } catch (error) {
    console.error('Erro ao buscar candidaturas:', error);
    return res.status(500).json({ mensagem: 'Erro ao buscar candidaturas.', error });
  }
};

export const checarCandidatura = async (req: Request, res: Response) => {
  const { projetoId } = req.params;
  const idDev = req.user?.idDev;

  if (!idDev) return res.status(200).json({ jaCandidatou: false });

  try {
    const existente = await db
      .select()
      .from(aplicacao)
      .where(and(eq(aplicacao.idDev, idDev), eq(aplicacao.idProjeto, Number(projetoId))));

    return res.status(200).json({ jaCandidatou: existente.length > 0 });
  } catch (error) {
    return res.status(500).json({ mensagem: 'Erro ao checar candidatura.', error });
  }
};

export const atualizarStatusCandidatura = async (req: Request, res: Response) => {
  const { candidaturaId } = req.params;
  const { status } = req.body;

  if (!['pendente', 'aceito', 'recusado'].includes(status)) {
    return res.status(400).json({ mensagem: 'Status inválido.' });
  }

  try {
    const [atualizada] = await db
      .update(aplicacao)
      .set({ status })
      .where(eq(aplicacao.idAplicacao, Number(candidaturaId)))
      .returning();

    if (!atualizada) return res.status(404).json({ mensagem: 'Candidatura não encontrada.' });
    return res.status(200).json(atualizada);
  } catch (error) {
    return res.status(500).json({ mensagem: 'Erro ao atualizar status.', error });
  }
};
