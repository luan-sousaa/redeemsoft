import type { Request, Response } from 'express';
import { db } from '../db/db';
import { cliente, usuario, novoProjeto } from '../db/schema';
import { eq } from 'drizzle-orm';

export const buscarClientePorId = async (req: Request, res: Response) => {
  const id = Number(req.params['id']);
  if (isNaN(id)) return res.status(400).json({ mensagem: 'ID inválido.' });

  try {
    const [perfil] = await db
      .select({
        idCliente: cliente.idCliente,
        idUsuario: cliente.idUsuario,
        empresa: cliente.empresa,
        descricao: cliente.descricao,
        segmento: cliente.segmento,
        tamanho: cliente.tamanho,
        site: cliente.site,
        anoFundacao: cliente.anoFundacao,
        cidade: cliente.cidade,
        estado: cliente.estado,
        modalidadePreferida: cliente.modalidadePreferida,
        nome: usuario.nome,
        email: usuario.email,
      })
      .from(cliente)
      .innerJoin(usuario, eq(cliente.idUsuario, usuario.idUsuario))
      .where(eq(cliente.idCliente, id));

    if (!perfil) return res.status(404).json({ mensagem: 'Empresa não encontrada.' });

    const projetos = await db
      .select({
        titulo: novoProjeto.titulo,
        stack: novoProjeto.stack,
        status: novoProjeto.status,
      })
      .from(novoProjeto)
      .where(eq(novoProjeto.idCliente, id));

    const totalProjetos = projetos.length;
    const projetosAtivos = projetos.filter((p) => p.status === 'ativo').length;
    const tecnologiasBuscadas = [...new Set(
      projetos.map((p) => p.stack).filter(Boolean)
    )];

    return res.status(200).json({
      ...perfil,
      totalProjetos,
      projetosAtivos,
      tecnologiasBuscadas,
    });
  } catch (error) {
    return res.status(500).json({ mensagem: 'Erro ao buscar perfil da empresa.', error });
  }
};

export const atualizarCliente = async (req: Request, res: Response) => {
  const id = Number(req.params['id']);
  if (isNaN(id)) return res.status(400).json({ mensagem: 'ID inválido.' });

  if (req.user?.idCliente !== id) {
    return res.status(403).json({ mensagem: 'Sem permissão para atualizar este perfil.' });
  }

  const { descricao, segmento, tamanho, site, anoFundacao, cidade, estado, modalidadePreferida, empresa } = req.body;

  try {
    const [atualizado] = await db
      .update(cliente)
      .set({ descricao, segmento, tamanho, site, anoFundacao, cidade, estado, modalidadePreferida, empresa })
      .where(eq(cliente.idCliente, id))
      .returning();

    if (!atualizado) return res.status(404).json({ mensagem: 'Empresa não encontrada.' });
    return res.status(200).json(atualizado);
  } catch (error) {
    return res.status(500).json({ mensagem: 'Erro ao atualizar perfil da empresa.', error });
  }
};
