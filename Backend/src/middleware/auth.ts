import jwt from 'jsonwebtoken';
import type { Request, Response, NextFunction } from 'express';

const envSecret = process.env['JWT_SECRET'];
if (!envSecret) {
  console.warn('[SECURITY] JWT_SECRET não definido — usando segredo de desenvolvimento. NUNCA use em produção.');
}
export const JWT_SECRET = envSecret ?? 'redeemsoft-dev-secret-2024';

export type JwtPayload = {
  idUsuario: number;
  type: 'client' | 'developer';
  idDev: number | null;
  idCliente: number | null;
};

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) {
    res.status(401).json({ mensagem: 'Token não fornecido.' });
    return;
  }
  try {
    const token = auth.slice(7);
    req.user = jwt.verify(token, JWT_SECRET) as JwtPayload;
    next();
  } catch {
    res.status(401).json({ mensagem: 'Token inválido ou expirado.' });
  }
}
