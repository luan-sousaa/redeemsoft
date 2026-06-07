import type { Request, Response } from 'express';
import { db } from '../db/db';
import { usuario, cliente, desenvolvedor } from '../db/schema';
import { eq } from 'drizzle-orm';
import { signToken } from '../middleware/auth';

export const encontrarUsuario = async (req: Request, res: Response) => {
  try {
    const lista = await db.select().from(usuario);
    return res.status(200).json(lista);
  } catch (error) {
    return res.status(500).json({ mensagem: 'Erro ao listar usuários.', error });
  }
};

export const criarUsuario = async (req: Request, res: Response) => {
  const { nome, email, senha, type, cidade, estado, cpfCnpj } = req.body;

  try {
    const [novoUsuario] = await db
      .insert(usuario)
      .values({ nome, email, senha, type, cidade, estado, cpfCnpj })
      .returning();

    if (!novoUsuario) {
      return res.status(400).json({ mensagem: 'Falha ao registrar usuário.' });
    }

    let idDev: number | null = null;
    let idCliente: number | null = null;

    if (type === 'client') {
      const [c] = await db.insert(cliente).values({ idUsuario: novoUsuario.idUsuario }).returning();
      idCliente = c?.idCliente ?? null;
    } else if (type === 'developer') {
      const [d] = await db.insert(desenvolvedor).values({ idUsuario: novoUsuario.idUsuario }).returning();
      idDev = d?.idDev ?? null;
    }

    const token = signToken({ idUsuario: novoUsuario.idUsuario, type, idDev, idCliente });

    return res.status(201).json({
      token,
      user: { idUsuario: novoUsuario.idUsuario, nome: novoUsuario.nome, email: novoUsuario.email, type },
    });
  } catch (error) {
    console.error('ERRO AO CRIAR USUÁRIO:', error);
    return res.status(500).json({ mensagem: 'Erro ao criar usuário.', erroReal: String(error) });
  }
};

export const atualizarUsuario = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { nome, email, senha, cidade, estado, cpfCnpj } = req.body;

  if (req.user?.idUsuario !== Number(id)) {
    return res.status(403).json({ mensagem: 'Sem permissão para atualizar este usuário.' });
  }

  try {
    const [atualizado] = await db
      .update(usuario)
      .set({ nome, email, senha, cidade, estado, cpfCnpj })
      .where(eq(usuario.idUsuario, Number(id)))
      .returning();

    if (!atualizado) return res.status(404).json({ mensagem: 'Usuário não encontrado.' });
    return res.status(200).json(atualizado);
  } catch (error) {
    return res.status(500).json({ mensagem: 'Erro ao atualizar usuário.', error });
  }
};

export const deletarUsuario = async (req: Request, res: Response) => {
  const id = parseInt(req.params['id'] as string);

  if (req.user?.idUsuario !== id) {
    return res.status(403).json({ mensagem: 'Sem permissão para deletar este usuário.' });
  }

  try {
    await db.delete(cliente).where(eq(cliente.idUsuario, id));
    await db.delete(desenvolvedor).where(eq(desenvolvedor.idUsuario, id));
    const resultado = await db.delete(usuario).where(eq(usuario.idUsuario, id)).returning();

    if (resultado.length === 0) return res.status(404).json({ mensagem: 'Usuário não encontrado.' });
    return res.status(200).json({ mensagem: 'Usuário deletado com sucesso!' });
  } catch (error) {
    return res.status(500).json({ mensagem: 'Erro ao deletar usuário.', error });
  }
};

export const fazerLogin = async (req: Request, res: Response) => {
  const { email, senha } = req.body;

  try {
    const [userEncontrado] = await db.select().from(usuario).where(eq(usuario.email, email));

    if (!userEncontrado) return res.status(404).json({ mensagem: 'Usuário não encontrado.' });
    if (userEncontrado.senha !== senha) return res.status(401).json({ mensagem: 'Senha incorreta.' });

    let idDev: number | null = null;
    let idCliente: number | null = null;

    if (userEncontrado.type === 'developer') {
      const [d] = await db.select().from(desenvolvedor).where(eq(desenvolvedor.idUsuario, userEncontrado.idUsuario));
      idDev = d?.idDev ?? null;
    } else if (userEncontrado.type === 'client') {
      const [c] = await db.select().from(cliente).where(eq(cliente.idUsuario, userEncontrado.idUsuario));
      idCliente = c?.idCliente ?? null;
    }

    const token = signToken({
      idUsuario: userEncontrado.idUsuario,
      type: userEncontrado.type,
      idDev,
      idCliente,
    });

    return res.status(200).json({
      token,
      user: {
        idUsuario: userEncontrado.idUsuario,
        nome: userEncontrado.nome,
        email: userEncontrado.email,
        type: userEncontrado.type,
      },
    });
  } catch (error) {
    return res.status(500).json({ mensagem: 'Erro ao realizar login.', error });
  }
};
