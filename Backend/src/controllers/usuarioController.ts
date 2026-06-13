import bcrypt from 'bcrypt';
import type { Request, Response } from 'express';
import { db } from '../db/db';
import { usuario, cliente, desenvolvedor } from '../db/schema';
import { eq } from 'drizzle-orm';
import { signToken } from '../middleware/auth';

const SALT_ROUNDS = 10;

function isEmailValid(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export const encontrarUsuario = async (req: Request, res: Response) => {
  try {
    const lista = await db
      .select({
        idUsuario: usuario.idUsuario,
        nome: usuario.nome,
        email: usuario.email,
        type: usuario.type,
        cidade: usuario.cidade,
        estado: usuario.estado,
      })
      .from(usuario);
    return res.status(200).json(lista);
  } catch {
    return res.status(500).json({ mensagem: 'Erro ao listar usuários.' });
  }
};

export const criarUsuario = async (req: Request, res: Response) => {
  const { nome, email, senha, type, cidade, estado, cpfCnpj } = req.body;

  if (!nome?.trim() || !email || !senha || !type) {
    return res.status(400).json({ mensagem: 'nome, email, senha e type são obrigatórios.' });
  }
  if (!isEmailValid(email)) {
    return res.status(400).json({ mensagem: 'E-mail inválido.' });
  }
  if (senha.length < 8) {
    return res.status(400).json({ mensagem: 'Senha deve ter ao menos 8 caracteres.' });
  }
  if (!['client', 'developer'].includes(type)) {
    return res.status(400).json({ mensagem: 'type deve ser client ou developer.' });
  }

  try {
    const [existente] = await db.select().from(usuario).where(eq(usuario.email, email));
    if (existente) {
      return res.status(409).json({ mensagem: 'E-mail já cadastrado.' });
    }

    const senhaHash = await bcrypt.hash(senha, SALT_ROUNDS);

    const [novoUsuario] = await db
      .insert(usuario)
      .values({ nome: nome.trim(), email, senha: senhaHash, type, cidade, estado, cpfCnpj })
      .returning();

    if (!novoUsuario) {
      return res.status(500).json({ mensagem: 'Falha ao registrar usuário.' });
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
    return res.status(500).json({ mensagem: 'Erro ao criar usuário.', erroReal: String(error) });
  }
};

export const atualizarUsuario = async (req: Request, res: Response) => {
  const id = Number(req.params['id']);
  if (isNaN(id)) return res.status(400).json({ mensagem: 'ID inválido.' });

  const { nome, email, senha, cidade, estado, cpfCnpj } = req.body;

  if (req.user?.idUsuario !== id) {
    return res.status(403).json({ mensagem: 'Sem permissão para atualizar este usuário.' });
  }

  try {
    const updates: Partial<typeof usuario.$inferInsert> = {};
    if (nome) updates.nome = nome.trim();
    if (email) {
      if (!isEmailValid(email)) return res.status(400).json({ mensagem: 'E-mail inválido.' });
      updates.email = email;
    }
    if (senha) {
      if (senha.length < 8) return res.status(400).json({ mensagem: 'Senha deve ter ao menos 8 caracteres.' });
      updates.senha = await bcrypt.hash(senha, SALT_ROUNDS);
    }
    if (cidade !== undefined) updates.cidade = cidade;
    if (estado !== undefined) updates.estado = estado;
    if (cpfCnpj !== undefined) updates.cpfCnpj = cpfCnpj;

    const [atualizado] = await db.update(usuario).set(updates).where(eq(usuario.idUsuario, id)).returning();
    if (!atualizado) return res.status(404).json({ mensagem: 'Usuário não encontrado.' });

    return res.status(200).json({
      idUsuario: atualizado.idUsuario,
      nome: atualizado.nome,
      email: atualizado.email,
      type: atualizado.type,
      cidade: atualizado.cidade,
      estado: atualizado.estado,
    });
  } catch {
    return res.status(500).json({ mensagem: 'Erro ao atualizar usuário.' });
  }
};

export const deletarUsuario = async (req: Request, res: Response) => {
  const id = Number(req.params['id']);
  if (isNaN(id)) return res.status(400).json({ mensagem: 'ID inválido.' });

  if (req.user?.idUsuario !== id) {
    return res.status(403).json({ mensagem: 'Sem permissão para deletar este usuário.' });
  }

  try {
    await db.delete(cliente).where(eq(cliente.idUsuario, id));
    await db.delete(desenvolvedor).where(eq(desenvolvedor.idUsuario, id));
    const resultado = await db.delete(usuario).where(eq(usuario.idUsuario, id)).returning();
    if (resultado.length === 0) return res.status(404).json({ mensagem: 'Usuário não encontrado.' });
    return res.status(200).json({ mensagem: 'Usuário deletado com sucesso.' });
  } catch {
    return res.status(500).json({ mensagem: 'Erro ao deletar usuário.' });
  }
};

export const fazerLogin = async (req: Request, res: Response) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ mensagem: 'email e senha são obrigatórios.' });
  }

  try {
    const [encontrado] = await db.select().from(usuario).where(eq(usuario.email, email));
    if (!encontrado) return res.status(404).json({ mensagem: 'Usuário não encontrado.' });

    // Migração transparente: senhas antigas em plaintext são comparadas e depois atualizadas para hash
    let senhaValida = await bcrypt.compare(senha, encontrado.senha).catch(() => false);
    if (!senhaValida && !encontrado.senha.startsWith('$2')) {
      senhaValida = encontrado.senha === senha;
      if (senhaValida) {
        const novoHash = await bcrypt.hash(senha, SALT_ROUNDS);
        await db.update(usuario).set({ senha: novoHash }).where(eq(usuario.idUsuario, encontrado.idUsuario));
      }
    }

    if (!senhaValida) return res.status(401).json({ mensagem: 'Senha incorreta.' });

    let idDev: number | null = null;
    let idCliente: number | null = null;

    if (encontrado.type === 'developer') {
      const [d] = await db.select().from(desenvolvedor).where(eq(desenvolvedor.idUsuario, encontrado.idUsuario));
      idDev = d?.idDev ?? null;
    } else if (encontrado.type === 'client') {
      const clienteRows = await db.select().from(cliente).where(eq(cliente.idUsuario, encontrado.idUsuario));
      let c = clienteRows[0];
      if (!c) {
        const inserted = await db.insert(cliente).values({ idUsuario: encontrado.idUsuario }).returning();
        c = inserted[0];
      }
      idCliente = c?.idCliente ?? null;
    }

    const token = signToken({ idUsuario: encontrado.idUsuario, type: encontrado.type, idDev, idCliente });

    return res.status(200).json({
      token,
      user: { idUsuario: encontrado.idUsuario, nome: encontrado.nome, email: encontrado.email, type: encontrado.type },
    });
  } catch {
    return res.status(500).json({ mensagem: 'Erro ao realizar login.' });
  }
};

export const esqueceuSenha = async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ mensagem: 'email é obrigatório.' });

  try {
    const [encontrado] = await db.select().from(usuario).where(eq(usuario.email, email));
    if (!encontrado) {
      return res.status(200).json({ mensagem: 'Se o e-mail estiver cadastrado, você receberá um código.' });
    }

    const code = Math.floor(1000 + Math.random() * 9000).toString();
    const expiry = Date.now() + 15 * 60 * 1000;

    await db.update(usuario).set({ resetToken: code, resetTokenExpiry: expiry }).where(eq(usuario.email, email));

    return res.status(200).json({ mensagem: 'Código gerado com sucesso.', code });
  } catch {
    return res.status(500).json({ mensagem: 'Ocorreu um erro. Tente novamente.' });
  }
};

export const verificarCodigo = async (req: Request, res: Response) => {
  const { email, code } = req.body;
  if (!email || !code) return res.status(400).json({ mensagem: 'email e code são obrigatórios.' });

  try {
    const [encontrado] = await db.select().from(usuario).where(eq(usuario.email, email));
    if (!encontrado) return res.status(404).json({ mensagem: 'Usuário não encontrado.' });
    if (encontrado.resetToken !== code) return res.status(400).json({ mensagem: 'Código inválido.' });
    if (!encontrado.resetTokenExpiry || encontrado.resetTokenExpiry < Date.now()) {
      return res.status(400).json({ mensagem: 'Código expirado. Solicite um novo.' });
    }
    return res.status(200).json({ mensagem: 'Código válido.', email });
  } catch {
    return res.status(500).json({ mensagem: 'Ocorreu um erro. Tente novamente.' });
  }
};

export const redefinirSenha = async (req: Request, res: Response) => {
  const { email, novaSenha } = req.body;
  if (!email || !novaSenha) return res.status(400).json({ mensagem: 'email e novaSenha são obrigatórios.' });
  if (novaSenha.length < 8) return res.status(400).json({ mensagem: 'Senha deve ter ao menos 8 caracteres.' });

  try {
    const [encontrado] = await db.select().from(usuario).where(eq(usuario.email, email));
    if (!encontrado) return res.status(404).json({ mensagem: 'Usuário não encontrado.' });

    const senhaHash = await bcrypt.hash(novaSenha, SALT_ROUNDS);
    await db.update(usuario).set({ senha: senhaHash, resetToken: null, resetTokenExpiry: null }).where(eq(usuario.email, email));

    return res.status(200).json({ mensagem: 'Senha alterada com sucesso.' });
  } catch {
    return res.status(500).json({ mensagem: 'Ocorreu um erro. Tente novamente.' });
  }
};
