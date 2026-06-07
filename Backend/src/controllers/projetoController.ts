import type { Request, Response } from 'express';
import { db } from '../db/db';
import { novoProjeto, cliente, usuario, aplicacao, desenvolvedor } from '../db/schema';
import { eq } from 'drizzle-orm';

async function buildProjetosFormatados(projetos: typeof novoProjeto.$inferSelect[]) {
  if (projetos.length === 0) return [];

  const todasAplicacoes = await db
    .select({ aplicacao, dev: desenvolvedor, nomeDev: usuario.nome })
    .from(aplicacao)
    .innerJoin(desenvolvedor, eq(aplicacao.idDev, desenvolvedor.idDev))
    .innerJoin(usuario, eq(desenvolvedor.idUsuario, usuario.idUsuario));

  return projetos.map((p) => ({
    ...p,
    candidaturas: todasAplicacoes
      .filter((a) => a.aplicacao.idProjeto === p.idProjeto)
      .map((a) => ({
        idAplicacao: a.aplicacao.idAplicacao,
        idDev: a.aplicacao.idDev,
        proposta: a.aplicacao.proposta,
        status: a.aplicacao.status,
        desenvolvedor: { nome: a.nomeDev, experiencia: a.dev.experiencia },
      })),
  }));
}

export const encontrarProjeto = async (req: Request, res: Response) => {
  try {
    const rows = await db
      .select({ projeto: novoProjeto, nomeCliente: usuario.nome, empresa: cliente.empresa })
      .from(novoProjeto)
      .innerJoin(cliente, eq(novoProjeto.idCliente, cliente.idCliente))
      .innerJoin(usuario, eq(cliente.idUsuario, usuario.idUsuario));

    const projetos = rows.map((r) => r.projeto);
    const formatados = await buildProjetosFormatados(projetos);
    const comCliente = formatados.map((p, i) => ({
      ...p,
      nomeCliente: rows[i]?.nomeCliente,
      empresa: rows[i]?.empresa,
    }));

    return res.status(200).json(comCliente);
  } catch (error) {
    console.error('ERRO AO BUSCAR PROJETOS:', error);
    return res.status(500).json({ mensagem: 'Erro ao encontrar projetos.' });
  }
};

export const encontrarProjetosMeus = async (req: Request, res: Response) => {
  const idCliente = req.user?.idCliente;
  if (!idCliente) {
    return res.status(403).json({ mensagem: 'Apenas empresas podem acessar esta rota.' });
  }

  try {
    const rows = await db.select().from(novoProjeto).where(eq(novoProjeto.idCliente, idCliente));
    const formatados = await buildProjetosFormatados(rows);
    return res.status(200).json(formatados);
  } catch (error) {
    console.error('ERRO AO BUSCAR MEUS PROJETOS:', error);
    return res.status(500).json({ mensagem: 'Erro ao buscar seus projetos.' });
  }
};

export const criarProjeto = async (req: Request, res: Response) => {
  const { titulo, descricao, orcamento, prazo, modalidades, stack } = req.body;
  const idCliente = req.user?.idCliente;

  if (!idCliente) {
    return res.status(403).json({ mensagem: 'Apenas empresas podem criar projetos.' });
  }

  let modalidadeFormatada: 'presencial' | 'remoto' | 'híbrido' = 'remoto';
  const modalidade = Array.isArray(modalidades) ? modalidades[0] : modalidades;
  if (modalidade === 'P') modalidadeFormatada = 'presencial';
  else if (modalidade === 'SP') modalidadeFormatada = 'híbrido';
  else if (modalidade === 'H') modalidadeFormatada = 'remoto';

  try {
    const [novo] = await db
      .insert(novoProjeto)
      .values({
        idCliente,
        titulo,
        descricao,
        orcamento: Number(orcamento),
        prazo: parseInt(String(prazo)) || 0,
        modalidade: modalidadeFormatada,
        stack,
      })
      .returning();

    return res.status(201).json(novo);
  } catch (error) {
    console.error('ERRO AO SALVAR PROJETO:', error);
    return res.status(500).json({ mensagem: 'Erro ao criar projeto.', erroReal: String(error) });
  }
};

export const atualizarProjeto = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { titulo, descricao, orcamento, prazo, modalidade, stack } = req.body;

  try {
    const [atualizado] = await db
      .update(novoProjeto)
      .set({ titulo, descricao, orcamento, prazo, modalidade, stack })
      .where(eq(novoProjeto.idProjeto, Number(id)))
      .returning();

    return res.status(200).json(atualizado);
  } catch (error) {
    return res.status(500).json({ mensagem: 'Erro ao atualizar projeto.' });
  }
};

export const deletarProjeto = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const [deletado] = await db
      .delete(novoProjeto)
      .where(eq(novoProjeto.idProjeto, Number(id)))
      .returning();
    return res.status(200).json(deletado);
  } catch (error) {
    return res.status(500).json({ mensagem: 'Erro ao deletar projeto.' });
  }
};
