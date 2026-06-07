import type { Request, Response } from 'express';
import { db } from '../db/db';
import { desenvolvedor, usuario } from '../db/schema';
import { eq } from 'drizzle-orm';

export const buscarDesenvolvedorPorId = async (req: Request, res: Response) => {
  const id = Number(req.params['id']);
  if (isNaN(id)) return res.status(400).json({ mensagem: 'ID inválido.' });

  try {
    const [dev] = await db
      .select({
        idDev: desenvolvedor.idDev,
        idUsuario: desenvolvedor.idUsuario,
        nome: usuario.nome,
        precoPorHora: desenvolvedor.precoPorHora,
        sobreMim: desenvolvedor.sobreMim,
        habilidades: desenvolvedor.habilidades,
        certificacoes: desenvolvedor.certificacoes,
        experiencia: desenvolvedor.experiencia,
      })
      .from(desenvolvedor)
      .innerJoin(usuario, eq(desenvolvedor.idUsuario, usuario.idUsuario))
      .where(eq(desenvolvedor.idDev, id));

    if (!dev) return res.status(404).json({ mensagem: 'Desenvolvedor não encontrado.' });
    return res.status(200).json(dev);
  } catch (error) {
    return res.status(500).json({ mensagem: 'Erro ao buscar desenvolvedor.', error });
  }
};

export const encontrarDesenvolvedores = async (req: Request, res: Response) => {
  try {
    const devs = await db
      .select({
        idDev: desenvolvedor.idDev,
        idUsuario: desenvolvedor.idUsuario,
        precoPorHora: desenvolvedor.precoPorHora,
        sobreMim: desenvolvedor.sobreMim,
        habilidades: desenvolvedor.habilidades,
        certificacoes: desenvolvedor.certificacoes,
        experiencia: desenvolvedor.experiencia,
        nome: usuario.nome,
        email: usuario.email,
        cidade: usuario.cidade,
        estado: usuario.estado,
      })
      .from(desenvolvedor)
      .innerJoin(usuario, eq(desenvolvedor.idUsuario, usuario.idUsuario));

    return res.status(200).json(devs);
  } catch (error) {
    console.error('ERRO AO BUSCAR DESENVOLVEDORES:', error);
    return res.status(500).json({ mensagem: 'Erro ao listar desenvolvedores.' });
  }
};

export const buscarPerfilMeu = async (req: Request, res: Response) => {
  const idDev = req.user?.idDev;
  if (!idDev) return res.status(403).json({ mensagem: 'Apenas desenvolvedores podem acessar esta rota.' });

  try {
    const [perfil] = await db.select().from(desenvolvedor).where(eq(desenvolvedor.idDev, idDev));
    if (!perfil) return res.status(404).json({ mensagem: 'Perfil não encontrado.' });
    return res.status(200).json(perfil);
  } catch (error) {
    return res.status(500).json({ mensagem: 'Erro ao buscar perfil.', error });
  }
};

export const atualizarPerfilMeu = async (req: Request, res: Response) => {
  const idDev = req.user?.idDev;
  if (!idDev) return res.status(403).json({ mensagem: 'Apenas desenvolvedores podem acessar esta rota.' });

  const { precoPorHora, sobreMim, habilidades, certificacoes, experiencia } = req.body;

  try {
    const [atualizado] = await db
      .update(desenvolvedor)
      .set({
        precoPorHora: precoPorHora ? Number(precoPorHora) : undefined,
        sobreMim,
        habilidades,
        certificacoes,
        experiencia,
      })
      .where(eq(desenvolvedor.idDev, idDev))
      .returning();

    if (!atualizado) return res.status(404).json({ mensagem: 'Perfil não encontrado.' });
    return res.status(200).json(atualizado);
  } catch (error) {
    console.error('ERRO AO ATUALIZAR PERFIL:', error);
    return res.status(500).json({ mensagem: 'Erro ao atualizar perfil.', error });
  }
};

export const criarPerfilDev = async (req: Request, res: Response) => {
  const { idUsuario, precoPorHora, sobreMim, habilidades, certificacoes, experiencia } = req.body;
  if (!idUsuario) return res.status(401).json({ mensagem: 'ID do usuário não informado.' });

  try {
    const [existente] = await db.select().from(desenvolvedor).where(eq(desenvolvedor.idUsuario, Number(idUsuario)));
    if (existente) return res.status(400).json({ mensagem: 'Perfil de desenvolvedor já existe.' });

    const [novo] = await db
      .insert(desenvolvedor)
      .values({ idUsuario: Number(idUsuario), precoPorHora, sobreMim, habilidades, certificacoes, experiencia })
      .returning();

    return res.status(201).json(novo);
  } catch (error) {
    return res.status(500).json({ mensagem: 'Erro ao criar perfil.', error });
  }
};

export const atualizarPerfilDev = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { precoPorHora, sobreMim, habilidades, certificacoes, experiencia } = req.body;

  try {
    const [atualizado] = await db
      .update(desenvolvedor)
      .set({ precoPorHora: precoPorHora ? Number(precoPorHora) : undefined, sobreMim, habilidades, certificacoes, experiencia })
      .where(eq(desenvolvedor.idDev, Number(id)))
      .returning();

    if (!atualizado) return res.status(404).json({ mensagem: 'Perfil não encontrado.' });
    return res.status(200).json(atualizado);
  } catch (error) {
    return res.status(500).json({ mensagem: 'Erro ao atualizar perfil.', error });
  }
};

export const deletarPerfilDev = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const [deletado] = await db.delete(desenvolvedor).where(eq(desenvolvedor.idDev, Number(id))).returning();
    return res.status(200).json(deletado);
  } catch (error) {
    return res.status(500).json({ mensagem: 'Erro ao deletar perfil.', error });
  }
};
