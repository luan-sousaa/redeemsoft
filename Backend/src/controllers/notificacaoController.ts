import type { Request, Response } from 'express';
import { db } from '../db/db';
import { notificacao } from '../db/schema';
import { eq, desc } from 'drizzle-orm';

// ─── GET /notificacoes ────────────────────────────────────────────────────────
export const getNotificacoes = async (req: Request, res: Response) => {
  const idUsuario = req.user?.idUsuario;
  if (!idUsuario) return res.status(401).json({ mensagem: 'Não autorizado.' });

  try {
    const rows = await db
      .select()
      .from(notificacao)
      .where(eq(notificacao.idUsuario, idUsuario))
      .orderBy(desc(notificacao.idNotificacao))
      .limit(30);

    return res.status(200).json(rows);
  } catch {
    return res.status(500).json({ mensagem: 'Erro ao buscar notificações.' });
  }
};

// ─── PATCH /notificacoes/:id/lida ─────────────────────────────────────────────
export const marcarLida = async (req: Request, res: Response) => {
  const idUsuario = req.user?.idUsuario;
  const id = Number(req.params['id']);
  if (!idUsuario || isNaN(id)) return res.status(400).json({ mensagem: 'Parâmetros inválidos.' });

  try {
    await db.update(notificacao).set({ lida: 1 }).where(eq(notificacao.idNotificacao, id));
    return res.status(200).json({ ok: true });
  } catch {
    return res.status(500).json({ mensagem: 'Erro ao marcar notificação.' });
  }
};

// ─── PATCH /notificacoes/lidas ────────────────────────────────────────────────
export const marcarTodasLidas = async (req: Request, res: Response) => {
  const idUsuario = req.user?.idUsuario;
  if (!idUsuario) return res.status(401).json({ mensagem: 'Não autorizado.' });

  try {
    await db.update(notificacao).set({ lida: 1 }).where(eq(notificacao.idUsuario, idUsuario));
    return res.status(200).json({ ok: true });
  } catch {
    return res.status(500).json({ mensagem: 'Erro ao marcar notificações.' });
  }
};

// ─── DELETE /notificacoes/:id ─────────────────────────────────────────────────
export const deletarNotificacao = async (req: Request, res: Response) => {
  const id = Number(req.params['id']);
  if (isNaN(id)) return res.status(400).json({ mensagem: 'ID inválido.' });
  try {
    await db.delete(notificacao).where(eq(notificacao.idNotificacao, id));
    return res.status(204).send();
  } catch {
    return res.status(500).json({ mensagem: 'Erro ao deletar notificação.' });
  }
};
