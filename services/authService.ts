export type User = {
  idUsuario: number;
    nome: string;
    email: string;
    senha: string;
    type: "client" | "developer";
    cidade?: string;
    estado?: string;
    cpfCnpj?: string;
};

export type RegisterData = {
    nome: string;
    email: string;
    senha: string;
    type: "client" | "developer";
    cidade?: string;
    estado?: string;
    cpfCnpj?: string;
};

export type Candidatura = {
  id: string;
  desenvolvedorId: string;
  experiencia: string;
  proposta: number;
  prazo: string;
  status: 'pendente' | 'aceito' | 'recusado';
};

export type ProjetoEmpresa = {
  id: string;
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


const API_URL = 'http://localhost:3000'; 

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Ocorreu um erro na requisição.');
  }
  return response.json();
}


export const authService = {
  
  // ─── Autenticação ───

  async login(email: string, senha: string): Promise<User> {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, senha }),
    });
    return handleResponse<User>(response);
  },

  async loginWithGoogle(token: string): Promise<User> {
    const response = await fetch(`${API_URL}/login/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });
    return handleResponse<User>(response);
  },

  async register(data: RegisterData): Promise<User> {
    const response = await fetch(`${API_URL}/usuarios`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<User>(response);
  },

  async forgotPassword(email: string): Promise<void> {
    const response = await fetch(`${API_URL}/password/forgot`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    return handleResponse<void>(response);
  },

  async verifyCode(email: string, code: string): Promise<void> {
    const response = await fetch(`${API_URL}/password/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code }),
    });
    return handleResponse<void>(response);
  },

  async resetPassword(email: string, code: string, newPassword: string): Promise<void> {
    const response = await fetch(`${API_URL}/password/reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code, newPassword }),
    });
    return handleResponse<void>(response);
  },


  async jaCandidatou(projetoId: string): Promise<boolean> {
    const response = await fetch(`${API_URL}/candidaturas/check/${projetoId}`);
    const data = await handleResponse<{ jaCandidatou: boolean }>(response);
    return data.jaCandidatou;
  },

  async candidatar(data: Omit<MinhaCandidatura, 'status' | 'dataEnvio' | 'candidaturaId'>): Promise<void> {
    const response = await fetch(`${API_URL}/candidaturas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<void>(response);
  },

  async getMinhaCandidaturas(): Promise<MinhaCandidatura[]> {
    const response = await fetch(`${API_URL}/candidaturas/minhas`);
    return handleResponse<MinhaCandidatura[]>(response);
  },

  // ─── Empresa ───

  async getProjetosEmpresa(): Promise<ProjetoEmpresa[]> {
    const response = await fetch(`${API_URL}/projetos`);
    return handleResponse<ProjetoEmpresa[]>(response);
  },

  async criarProjeto(data: NovoProjeto): Promise<ProjetoEmpresa> {
    const response = await fetch(`${API_URL}/projetos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<ProjetoEmpresa>(response);
  },

  async atualizarStatusCandidatura(
    projetoId: string,
    candidaturaId: string,
    status: 'aceito' | 'recusado'
  ): Promise<void> {
    const response = await fetch(`${API_URL}/projetos/${projetoId}/candidaturas/${candidaturaId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    return handleResponse<void>(response);
  },


  async getDesenvolvedores(): Promise<Desenvolvedor[]> {
    const response = await fetch(`${API_URL}/desenvolvedores`);
    return handleResponse<Desenvolvedor[]>(response);
  },

  async getDesenvolvedorById(id: string): Promise<Desenvolvedor> {
    const response = await fetch(`${API_URL}/desenvolvedores/${id}`);
    return handleResponse<Desenvolvedor>(response);
  },

  async getStoredUser(): Promise<User | null> {
    return null;
  },
};