// contratoController.ts
// Implementa o fluxo de escrow da RedeemSoft:
//   1. POST /contrato — empresa cria contrato após confirmar contratação
//   2. PATCH /contrato/:id/pagamento — após PIX confirmado, dinheiro fica "retido" e projeto vai para em_andamento
//   3. PATCH /contrato/:id/confirmar-entrega — ambas as partes confirmam; libera pagamento ao dev
//   4. GET /contrato/:id — detalhes do contrato (usado pelo chat)
//   5. GET /contrato/projeto/:projetoId — contrato pelo projeto (usado para abrir o chat)
//   6. POST /contrato/:id/mensagem — envia mensagem no chat (só após pagamento retido)
//   7. GET /contrato/:id/mensagens — lista mensagens em ordem cronológica

import type { Request, Response } from 'express';
import { eq, asc, and, ne } from 'drizzle-orm';
import { db } from '../db/db';
import {
  contrato,
  mensagem,
  novoProjeto,
  aplicacao,
  usuario,
  desenvolvedor,
  cliente,
} from '../db/schema';

// ─── POST /contrato ───────────────────────────────────────────────────────────
export const criarContrato = async (req: Request, res: Response) => {
  const empresaId = req.user?.idCliente;
  if (!empresaId) {
    return res.status(403).json({ mensagem: 'Apenas empresas podem criar contratos.' });
  }

  const { candidaturaId, projetoId, devId, valorProjeto } = req.body;
  if (!candidaturaId || !projetoId || !devId || valorProjeto == null) {
    return res.status(400).json({ mensagem: 'Campos obrigatórios: candidaturaId, projetoId, devId, valorProjeto.' });
  }

  const vp = Number(valorProjeto);
  const taxaPlataforma = Math.round(vp * 0.10);
  const valorTotal = vp + taxaPlataforma;

  try {
    const [novo] = await db.insert(contrato).values({
      candidaturaId: Number(candidaturaId),
      projetoId:     Number(projetoId),
      empresaId,
      devId:         Number(devId),
      valorProjeto:  vp,
      taxaPlataforma,
      valorTotal,
      statusPagamento: 'pendente',
    }).returning();

    return res.status(201).json(novo);
  } catch (err) {
    console.error('[contrato] criarContrato:', err);
    return res.status(500).json({ mensagem: 'Erro ao criar contrato.' });
  }
};

// ─── GET /contrato/:id ────────────────────────────────────────────────────────
export const buscarContratoPorId = async (req: Request, res: Response) => {
  const id = Number(req.params['id']);
  if (isNaN(id)) return res.status(400).json({ mensagem: 'ID inválido.' });

  try {
    const rows = await db
      .select({
        c:          contrato,
        nomeDev:    usuario.nome,
        nomeEmpresa: cliente.empresa,
        tituloProjeto: novoProjeto.titulo,
      })
      .from(contrato)
      .innerJoin(desenvolvedor, eq(contrato.devId, desenvolvedor.idDev))
      .innerJoin(usuario,       eq(desenvolvedor.idUsuario, usuario.idUsuario))
      .leftJoin(cliente,        eq(contrato.empresaId, cliente.idCliente))
      .leftJoin(novoProjeto,    eq(contrato.projetoId,  novoProjeto.idProjeto))
      .where(eq(contrato.idContrato, id));

    if (!rows.length) return res.status(404).json({ mensagem: 'Contrato não encontrado.' });

    const r = rows[0]!;
    return res.status(200).json({ ...r.c, nomeDev: r.nomeDev, nomeEmpresa: r.nomeEmpresa, tituloProjeto: r.tituloProjeto });
  } catch (err) {
    console.error('[contrato] buscarContratoPorId:', err);
    return res.status(500).json({ mensagem: 'Erro ao buscar contrato.' });
  }
};

// ─── GET /contrato/projeto/:projetoId ─────────────────────────────────────────
export const buscarContratoPorProjeto = async (req: Request, res: Response) => {
  const projetoId = Number(req.params['projetoId']);
  if (isNaN(projetoId)) return res.status(400).json({ mensagem: 'projetoId inválido.' });

  try {
    const rows = await db
      .select({
        c:          contrato,
        nomeDev:    usuario.nome,
        nomeEmpresa: cliente.empresa,
        tituloProjeto: novoProjeto.titulo,
      })
      .from(contrato)
      .innerJoin(desenvolvedor, eq(contrato.devId, desenvolvedor.idDev))
      .innerJoin(usuario,       eq(desenvolvedor.idUsuario, usuario.idUsuario))
      .leftJoin(cliente,        eq(contrato.empresaId, cliente.idCliente))
      .leftJoin(novoProjeto,    eq(contrato.projetoId,  novoProjeto.idProjeto))
      .where(eq(contrato.projetoId, projetoId));

    if (!rows.length) return res.status(404).json({ mensagem: 'Contrato não encontrado para este projeto.' });

    const r = rows[0]!;
    return res.status(200).json({ ...r.c, nomeDev: r.nomeDev, nomeEmpresa: r.nomeEmpresa, tituloProjeto: r.tituloProjeto });
  } catch (err) {
    console.error('[contrato] buscarContratoPorProjeto:', err);
    return res.status(500).json({ mensagem: 'Erro ao buscar contrato.' });
  }
};

// ─── PATCH /contrato/:id/pagamento ────────────────────────────────────────────
// Chamado pelo frontend após PIX confirmado; move dinheiro para escrow ("retido")
export const atualizarPagamento = async (req: Request, res: Response) => {
  const id = Number(req.params['id']);
  const { pixId } = req.body;
  if (isNaN(id)) return res.status(400).json({ mensagem: 'ID inválido.' });

  try {
    const [atual] = await db.select().from(contrato).where(eq(contrato.idContrato, id));
    if (!atual) return res.status(404).json({ mensagem: 'Contrato não encontrado.' });

    const [atualizado] = await db.update(contrato)
      .set({ statusPagamento: 'retido', pixId: pixId ?? null })
      .where(eq(contrato.idContrato, id))
      .returning();

    // Projeto passa para em_andamento
    await db.update(novoProjeto)
      .set({ status: 'em_andamento' })
      .where(eq(novoProjeto.idProjeto, atual.projetoId));

    // Garante candidatura marcada como aceita
    await db.update(aplicacao)
      .set({ status: 'aceito' })
      .where(eq(aplicacao.idAplicacao, atual.candidaturaId));

    return res.status(200).json(atualizado);
  } catch (err) {
    console.error('[contrato] atualizarPagamento:', err);
    return res.status(500).json({ mensagem: 'Erro ao atualizar pagamento.' });
  }
};

// ─── PATCH /contrato/:id/confirmar-entrega ────────────────────────────────────
// Ambas as partes confirmam; quando as duas confirmam, pagamento é "liberado"
export const confirmarEntrega = async (req: Request, res: Response) => {
  const id = Number(req.params['id']);
  const { tipo } = req.body as { tipo: 'empresa' | 'dev' };
  if (isNaN(id)) return res.status(400).json({ mensagem: 'ID inválido.' });
  if (!['empresa', 'dev'].includes(tipo)) return res.status(400).json({ mensagem: 'tipo deve ser "empresa" ou "dev".' });

  try {
    const [atual] = await db.select().from(contrato).where(eq(contrato.idContrato, id));
    if (!atual) return res.status(404).json({ mensagem: 'Contrato não encontrado.' });

    const novoConfirmaEmpresa = tipo === 'empresa' ? 1 : atual.confirmaEmpresa;
    const novoConfirmaDev    = tipo === 'dev'     ? 1 : atual.confirmaDev;
    const ambosConfirmaram   = novoConfirmaEmpresa === 1 && novoConfirmaDev === 1;

    let atualizado;
    if (ambosConfirmaram) {
      [atualizado] = await db.update(contrato)
        .set({
          ...(tipo === 'empresa' ? { confirmaEmpresa: 1 } : { confirmaDev: 1 }),
          statusPagamento: 'liberado',
          concluidoEm: new Date().toISOString(),
        })
        .where(eq(contrato.idContrato, id))
        .returning();
      // Projeto conclui
      await db.update(novoProjeto)
        .set({ status: 'concluido' })
        .where(eq(novoProjeto.idProjeto, atual.projetoId));
    } else {
      [atualizado] = await db.update(contrato)
        .set(tipo === 'empresa' ? { confirmaEmpresa: 1 } : { confirmaDev: 1 })
        .where(eq(contrato.idContrato, id))
        .returning();
    }

    return res.status(200).json({ contrato: atualizado, ambosConfirmaram });
  } catch (err) {
    console.error('[contrato] confirmarEntrega:', err);
    return res.status(500).json({ mensagem: 'Erro ao confirmar entrega.' });
  }
};

// ─── POST /contrato/:id/mensagem ──────────────────────────────────────────────
// Chat disponível apenas após pagamento retido ou liberado
export const enviarMensagem = async (req: Request, res: Response) => {
  const contratoId = Number(req.params['id']);
  const { autorId, autorTipo, texto } = req.body;
  if (isNaN(contratoId)) return res.status(400).json({ mensagem: 'ID inválido.' });
  if (!texto?.trim() || !autorId || !autorTipo) {
    return res.status(400).json({ mensagem: 'Campos obrigatórios: autorId, autorTipo, texto.' });
  }

  try {
    const [c] = await db.select().from(contrato).where(eq(contrato.idContrato, contratoId));
    if (!c) return res.status(404).json({ mensagem: 'Contrato não encontrado.' });
    if (!['retido', 'liberado'].includes(c.statusPagamento)) {
      return res.status(403).json({ mensagem: 'Chat disponível apenas após pagamento confirmado.' });
    }

    const [nova] = await db.insert(mensagem).values({
      contratoId,
      autorId:   Number(autorId),
      autorTipo,
      texto:     texto.trim(),
    }).returning();

    return res.status(201).json(nova);
  } catch (err) {
    console.error('[contrato] enviarMensagem:', err);
    return res.status(500).json({ mensagem: 'Erro ao enviar mensagem.' });
  }
};

// ─── GET /contrato/:id/mensagens ──────────────────────────────────────────────
export const buscarMensagens = async (req: Request, res: Response) => {
  const contratoId = Number(req.params['id']);
  if (isNaN(contratoId)) return res.status(400).json({ mensagem: 'ID inválido.' });

  try {
    const msgs = await db
      .select()
      .from(mensagem)
      .where(eq(mensagem.contratoId, contratoId))
      .orderBy(asc(mensagem.criadoEm));

    return res.status(200).json(msgs);
  } catch (err) {
    console.error('[contrato] buscarMensagens:', err);
    return res.status(500).json({ mensagem: 'Erro ao buscar mensagens.' });
  }
};

// ─── PATCH /contrato/:id/mensagens/lidas — marca todas como lidas para o usuário atual ──
export const marcarMensagensLidas = async (req: Request, res: Response) => {
  const contratoId = Number(req.params['id']);
  if (isNaN(contratoId)) return res.status(400).json({ mensagem: 'ID inválido.' });

  const { type } = req.user ?? {};
  const autorTipoRemetente: 'empresa' | 'dev' = type === 'client' ? 'dev' : 'empresa';

  try {
    await db.update(mensagem)
      .set({ lida: 1 })
      .where(and(
        eq(mensagem.contratoId, contratoId),
        eq(mensagem.autorTipo, autorTipoRemetente),
        ne(mensagem.lida, 1),
      ));
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('[contrato] marcarMensagensLidas:', err);
    return res.status(500).json({ mensagem: 'Erro ao marcar mensagens como lidas.' });
  }
};
