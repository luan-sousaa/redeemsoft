import { api } from './api';

export type User = {
  id: string;
  email: string;
  name: string;
  type: 'client' | 'developer';
  idDev?: number | null;
  idCliente?: number | null;
};

export type RegisterData = {
  name: string;
  email: string;
  password: string;
  type: 'client' | 'developer';
  city: string;
  state: string;
  cpfCnpj?: string;
};

export type Candidatura = {
  id: string;
  desenvolvedorId: string;
  nomeDesenvolvedor: string;
  experiencia: string;
  proposta: number;
  prazo: string;
  status: 'pendente' | 'aceito' | 'recusado';
};

export type ProjetoEmpresa = {
  id: string;
  empresaId: string;
  titulo: string;
  descricao: string;
  orcamento: number;
  prazo: string;
  modalidades: string[];
  stack: string;
  status: 'ativo' | 'em_andamento' | 'concluido';
  candidaturas: Candidatura[];
  dataCriacao: Date;
};

export type NovoProjeto = {
  titulo: string;
  descricao: string;
  orcamento: number;
  prazo: string;
  modalidades: string[];
  stack: string;
  empresaId: string;
};

export type Desenvolvedor = {
  id: string;
  userId: string;
  nome: string;
  precoPorHora: number;
  descricao: string;
  sobreMim: string;
  habilidades: string;
  certificacoes: string;
  projetos: string[];
};

export type MinhaCandidatura = {
  candidaturaId: string;
  projetoId: string;
  titulo: string;
  stack: string;
  preco: number;
  prazo: string;
  status: 'pendente' | 'aceito' | 'recusado';
  dataEnvio: Date;
};

type LoginResponse = { token: string; user: { idUsuario: number; nome: string; email: string; type: string } };

function mapUser(raw: LoginResponse['user'], payload: { idDev?: number | null; idCliente?: number | null }): User {
  return {
    id: String(raw.idUsuario),
    email: raw.email,
    name: raw.nome,
    type: raw.type as 'client' | 'developer',
    idDev: payload.idDev ?? null,
    idCliente: payload.idCliente ?? null,
  };
}

function parseJwtPayload(token: string): { idDev?: number | null; idCliente?: number | null } {
  try {
    const payload = JSON.parse(atob(token.split('.')[1] ?? ''));
    return { idDev: payload.idDev ?? null, idCliente: payload.idCliente ?? null };
  } catch {
    return {};
  }
}

export const authService = {
  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    const res = await api.post<LoginResponse>('/login', { email, senha: password });
    return { token: res.token, user: mapUser(res.user, parseJwtPayload(res.token)) };
  },

  async register(data: RegisterData): Promise<{ token: string; user: User }> {
    const res = await api.post<LoginResponse>('/usuarios', {
      nome: data.name,
      email: data.email,
      senha: data.password,
      type: data.type,
      cidade: data.city,
      estado: data.state,
      cpfCnpj: data.cpfCnpj,
    });
    return { token: res.token, user: mapUser(res.user, parseJwtPayload(res.token)) };
  },

  // Conectado ao backend: POST /usuario/forgot-password — gera OTP de 4 dígitos e retorna no body para testes.
  async forgotPassword(email: string): Promise<void> {
    await api.post<{ mensagem: string; code?: string }>('/usuario/forgot-password', { email });
  },

  // Conectado ao backend: POST /usuario/verify-code — valida o OTP enviado pelo usuário.
  async verifyCode(email: string, code: string): Promise<void> {
    await api.post<{ mensagem: string; email: string }>('/usuario/verify-code', { email, code });
  },

  // Conectado ao backend: POST /usuario/reset-password — atualiza a senha e limpa o token.
  async resetPassword(email: string, _code: string, newPassword: string): Promise<void> {
    await api.post<{ mensagem: string }>('/usuario/reset-password', { email, novaSenha: newPassword });
  },

  async getProjetosEmpresa(_empresaId: string): Promise<ProjetoEmpresa[]> {
    const data = await api.get<any[]>('/projetos/meus');
    return data.map((p) => ({
      id: String(p.idProjeto),
      empresaId: String(p.idCliente),
      titulo: p.titulo,
      descricao: p.descricao,
      orcamento: p.orcamento,
      prazo: `${p.prazo} dias`,
      modalidades: [p.modalidade ?? 'H'],
      stack: p.stack,
      status: p.status ?? 'ativo',
      candidaturas: (p.candidaturas ?? []).map((c: any) => ({
        id: String(c.idAplicacao),
        desenvolvedorId: String(c.idDev),
        nomeDesenvolvedor: c.desenvolvedor?.nome ?? '',
        experiencia: c.desenvolvedor?.experiencia ?? '',
        proposta: c.proposta ?? 0,
        prazo: `${p.prazo} dias`,
        status: c.status,
      })),
      dataCriacao: new Date(p.dataCriacao ?? Date.now()),
    }));
  },

  async criarProjeto(data: NovoProjeto): Promise<ProjetoEmpresa> {
    const res = await api.post<any>('/projetos', {
      titulo: data.titulo,
      descricao: data.descricao,
      orcamento: data.orcamento,
      prazo: parseInt(data.prazo) || 30,
      modalidades: data.modalidades,
      stack: data.stack,
    });
    return {
      id: String(res.idProjeto),
      empresaId: String(res.idCliente),
      titulo: res.titulo,
      descricao: res.descricao,
      orcamento: res.orcamento,
      prazo: `${res.prazo} dias`,
      modalidades: data.modalidades,
      stack: res.stack,
      status: res.status ?? 'ativo',
      candidaturas: [],
      dataCriacao: new Date(),
    };
  },

  async atualizarStatusCandidatura(projetoId: string, candidaturaId: string, status: 'aceito' | 'recusado'): Promise<void> {
    await api.patch(`/projetos/${projetoId}/candidaturas/${candidaturaId}`, { status });
  },

  async getDesenvolvedores(): Promise<Desenvolvedor[]> {
    const data = await api.get<any[]>('/desenvolvedores');
    return data.map((d) => ({
      id: String(d.idDev),
      userId: String(d.idUsuario),
      nome: d.nome,
      precoPorHora: d.precoPorHora ?? 0,
      descricao: d.experiencia ?? '',
      sobreMim: d.sobreMim ?? '',
      habilidades: d.habilidades ?? '',
      certificacoes: d.certificacoes ?? '',
      projetos: [],
    }));
  },

  getDesenvolvedorById(_id: string): Desenvolvedor | undefined {
    return undefined;
  },

  async getDevById(id: string | number): Promise<{
    idDev: number;
    nome: string;
    precoPorHora: number | null;
    sobreMim: string | null;
    habilidades: string | null;
    certificacoes: string | null;
    experiencia: string | null;
  }> {
    return api.get(`/desenvolvedores/${id}`);
  },

  jaCandidatou(_projetoId: string): boolean {
    return false;
  },

  async jaCandidatouAsync(projetoId: string): Promise<boolean> {
    try {
      const res = await api.get<{ jaCandidatou: boolean }>(`/candidaturas/check/${projetoId}`);
      return res.jaCandidatou === true;
    } catch {
      return false;
    }
  },

  async candidatar(data: Omit<MinhaCandidatura, 'status' | 'dataEnvio' | 'candidaturaId'>): Promise<void> {
    await api.post('/candidaturas', { idProjeto: data.projetoId, proposta: data.preco });
  },

  async getMinhaCandidaturas(): Promise<MinhaCandidatura[]> {
    const data = await api.get<any[]>('/candidaturas/minhas');
    return data.map((c) => ({
      candidaturaId: String(c.candidaturaId),
      projetoId: String(c.projetoId),
      titulo: c.titulo,
      stack: c.stack,
      preco: c.preco ?? 0,
      prazo: c.prazo,
      status: c.status,
      dataEnvio: new Date(c.dataEnvio ?? Date.now()),
    }));
  },

  async getStoredUser(): Promise<User | null> {
    return null;
  },
};
