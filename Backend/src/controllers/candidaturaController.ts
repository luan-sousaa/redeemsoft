import type { Request, Response } from 'express';
import { db } from '../db/db';
import { aplicacao, novoProjeto } from '../db/schema';
import { eq, and } from 'drizzle-orm';

export const criarCandidatura = async (req: Request, res: Response) => {
  const idDev = req.user?.idDev;
  if (!idDev) return res.status(403).json({ mensagem: 'Apenas desenvolvedores podem se candidatar.' });

  const idProjeto = Number(req.body.idProjeto);
  const proposta = req.body.proposta ? Number(req.body.proposta) : null;

  if (!idProjeto || isNaN(idProjeto)) {
    return res.status(400).json({ mensagem: 'idProjeto inválido.' });
  }

  try {
    const existente = await db
      .select({ id: aplicacao.idAplicacao })
      .from(aplicacao)
      .where(and(eq(aplicacao.idDev, idDev), eq(aplicacao.idProjeto, idProjeto)));

    if (existente.length > 0) {
      return res.status(409).json({ mensagem: 'Você já se candidatou a este projeto.' });
    }

    const [nova] = await db
      .insert(aplicacao)
      .values({ idDev, idProjeto, proposta, status: 'pendente' })
      .returning();

    return res.status(201).json(nova);
  } catch {
    return res.status(500).json({ mensagem: 'Erro ao criar candidatura.' });
  }
};

export const buscarMinhasCandidaturas = async (req: Request, res: Response) => {
  const idDev = req.user?.idDev;
  if (!idDev) return res.status(403).json({ mensagem: 'Apenas desenvolvedores podem acessar esta rota.' });

  try {
    const candidaturas = await db
      .select({ ap: aplicacao, projeto: novoProjeto })
      .from(aplicacao)
      .innerJoin(novoProjeto, eq(aplicacao.idProjeto, novoProjeto.idProjeto))
      .where(eq(aplicacao.idDev, idDev));

    return res.status(200).json(
      candidaturas.map(({ ap, projeto }) => ({
        candidaturaId: ap.idAplicacao,
        projetoId: ap.idProjeto,
        titulo: projeto.titulo,
        stack: projeto.stack,
        preco: ap.proposta ?? 0,
        prazo: `${projeto.prazo} dias`,
        status: ap.status,
      }))
    );
  } catch {
    return res.status(500).json({ mensagem: 'Erro ao buscar candidaturas.' });
  }
};

export const checarCandidatura = async (req: Request, res: Response) => {
  const idDev = req.user?.idDev;
  if (!idDev) return res.status(200).json({ jaCandidatou: false });

  const idProjeto = Number(req.params['projetoId']);
  if (isNaN(idProjeto)) return res.status(400).json({ mensagem: 'projetoId inválido.' });

  try {
    const existente = await db
      .select({ id: aplicacao.idAplicacao })
      .from(aplicacao)
      .where(and(eq(aplicacao.idDev, idDev), eq(aplicacao.idProjeto, idProjeto)));

    return res.status(200).json({ jaCandidatou: existente.length > 0 });
  } catch {
    return res.status(500).json({ mensagem: 'Erro ao checar candidatura.' });
  }
};

export const atualizarStatusCandidatura = async (req: Request, res: Response) => {
  const idCliente = req.user?.idCliente;
  if (!idCliente) return res.status(403).json({ mensagem: 'Apenas empresas podem aceitar ou recusar candidatos.' });

  const candidaturaId = Number(req.params['candidaturaId']);
  const projetoId = Number(req.params['projetoId']);
  if (isNaN(candidaturaId) || isNaN(projetoId)) {
    return res.status(400).json({ mensagem: 'IDs inválidos.' });
  }

  const { status } = req.body;
  if (!['pendente', 'aceito', 'recusado'].includes(status)) {
    return res.status(400).json({ mensagem: 'Status inválido.' });
  }

  try {
    // Verifica que o projeto pertence ao cliente autenticado
    const [projeto] = await db
      .select({ idCliente: novoProjeto.idCliente })
      .from(novoProjeto)
      .where(eq(novoProjeto.idProjeto, projetoId));

    if (!projeto || projeto.idCliente !== idCliente) {
      return res.status(403).json({ mensagem: 'Sem permissão para atualizar candidatos deste projeto.' });
    }

    const [atualizada] = await db
      .update(aplicacao)
      .set({ status })
      .where(and(eq(aplicacao.idAplicacao, candidaturaId), eq(aplicacao.idProjeto, projetoId)))
      .returning();

    if (!atualizada) return res.status(404).json({ mensagem: 'Candidatura não encontrada.' });
    return res.status(200).json(atualizada);
  } catch {
    return res.status(500).json({ mensagem: 'Erro ao atualizar status.' });
  }
};
