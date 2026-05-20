<<<<<<< HEAD
import axios from 'axios';

export type User = {
  idUsuario?: number;
  nome: string;
  email: string;
  type: string;
  cidade?: string;
  estado?: string;
};

export type RegisterData = {
  nome: string;
  email: string;
  senha: string;
  type: string;
  cidade?: string;
  estado?: string;
};

const API_URL = 'http://192.168.1.17:3000'; 

const api = axios.create({
  baseURL: API_URL,
});

export const authService = {
  login: async (email: string, senha: string): Promise<User> => {
    try {
      const response = await api.post('/login', { email, senha });
      return response.data.user;
    } catch (error: any) {
      throw new Error(error.response?.data?.mensagem || 'Erro ao fazer login');
    }
  },

  register: async (data: RegisterData): Promise<User> => {
    try {
      const response = await api.post('/usuarios', data);
      
      return response.data; 
    } catch (error: any) {
      throw new Error(error.response?.data?.mensagem || 'Erro ao cadastrar usuário');
    }
  },

  getStoredUser: async (): Promise<User | null> => { return null; },
  loginWithGoogle: async (token: string) => { throw new Error('Não implementado'); },

  forgotPassword: async (email: string) => { throw new Error('Não implementado'); },
  verifyCode: async (email: string, code: string) => { throw new Error('Não implementado'); },
  resetPassword: async (email: string, code: string, newPassword: string) => { throw new Error('Não implementado'); }
};
=======
export type User = {
  id: string;
  email: string;
  name: string;
  type: 'client' | 'developer';
};

export type RegisterData = {
  name: string;
  email: string;
  password: string;
  type: 'client' | 'developer';
  city: string;
  state: string;
};

// Candidatura: aplicação de um Desenvolvedor a um ProjetoEmpresa.
// Não duplica nome/email — referencia o Desenvolvedor pelo id.
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

// ─── Tipos e mock de desenvolvedores ─────────────────────────────────────────

export type Desenvolvedor = {
  id: string;
  userId: string; // referência ao User autenticado
  nome: string;
  precoPorHora: number;
  descricao: string;
  sobreMim: string;
  habilidades: string;
  certificacoes: string;
  projetos: string[];
};

export const DESENVOLVEDORES_MOCK: Desenvolvedor[] = [
  {
    id: 'd1',
    userId: 'ext-d1',
    nome: 'Carlos Mendes',
    precoPorHora: 120,
    descricao: 'Especialista em migração de sistemas legados Delphi e COBOL',
    sobreMim: 'Desenvolvedor com 8 anos de experiência em modernização de sistemas legados. Já migrei mais de 12 projetos de Delphi para stack moderna.',
    habilidades: 'Delphi, Node.js, React, PostgreSQL, Docker',
    certificacoes: 'AWS Certified Developer, Microsoft Azure Fundamentals',
    projetos: ['ERP Industria Têxtil', 'Sistema Financeiro Banco Regional'],
  },
  {
    id: 'd2',
    userId: '2', // corresponde ao dev@redeemsoft.com (User.id = '2')
    nome: 'Ana Souza',
    precoPorHora: 95,
    descricao: 'Full-stack com foco em React Native e Node.js',
    sobreMim: 'Desenvolvedora full-stack apaixonada por código limpo e boas práticas. 5 anos com foco em aplicações mobile e APIs REST.',
    habilidades: 'React Native, Node.js, TypeScript, MongoDB, Firebase',
    certificacoes: 'Google Associate Android Developer',
    projetos: ['App de Delivery Regional', 'Plataforma de Telemedicina'],
  },
  {
    id: 'd3',
    userId: 'ext-d3',
    nome: 'Rafael Lima',
    precoPorHora: 85,
    descricao: 'Especialista PHP legacy e modernização de portais web',
    sobreMim: 'Trabalho com PHP há 10 anos, desde versões antigas até Laravel moderno. Tenho experiência em refatoração de projetos vibecodados.',
    habilidades: 'PHP, Laravel, Vue.js, MySQL, Linux',
    certificacoes: 'Zend PHP Engineer',
    projetos: ['Portal Governo Municipal', 'E-commerce Moda'],
  },
  {
    id: 'd4',
    userId: 'ext-d4',
    nome: 'Juliana Costa',
    precoPorHora: 110,
    descricao: 'Dev mobile especializada em React Native e integrações',
    sobreMim: 'Desenvolvedora mobile há 6 anos com foco em performance e UX. Especialista em debugging de apps vibecodados e resolução de crashes.',
    habilidades: 'React Native, Expo, Redux, REST API, Jest',
    certificacoes: 'Meta React Native Certificate',
    projetos: ['Super App Fintech', 'App de Logística Nacional'],
  },
  {
    id: 'd5',
    userId: 'ext-d5',
    nome: 'Marcos Oliveira',
    precoPorHora: 130,
    descricao: 'Arquiteto de software e especialista em sistemas distribuídos',
    sobreMim: 'Arquiteto com 12 anos de experiência. Já coordenei a modernização de sistemas críticos em bancos e seguradoras.',
    habilidades: 'Java, Spring Boot, Kubernetes, Kafka, Oracle DB',
    certificacoes: 'Java SE 17 Developer, CKA Kubernetes',
    projetos: ['Core Bancário Nacional', 'Sistema de Seguros Legado'],
  },
];

// ─── Mock de projetos da empresa ──────────────────────────────────────────────

const PROJETOS_EMPRESA_MOCK: ProjetoEmpresa[] = [
  {
    id: 'e1',
    titulo: 'Migração do nosso ERP legado',
    descricao: 'Sistema ERP em Delphi 2008 precisa ser migrado para stack moderna. Módulos: estoque, financeiro e RH.',
    orcamento: 18000,
    prazo: '60 dias',
    modalidades: ['SP', 'H'],
    stack: 'Delphi → Node.js + React',
    status: 'ativo',
    candidaturas: [
      { id: 'c1', desenvolvedorId: 'd1', experiencia: '8 anos em migração de sistemas legados', proposta: 16500, prazo: '55 dias', status: 'pendente' },
      { id: 'c2', desenvolvedorId: 'd2', experiencia: '5 anos com Node.js e React', proposta: 17800, prazo: '60 dias', status: 'aceito' },
      { id: 'c3', desenvolvedorId: 'd3', experiencia: '6 anos, especialista em Delphi', proposta: 15000, prazo: '70 dias', status: 'recusado' },
    ],
    dataCriacao: new Date('2025-03-15'),
  },
  {
    id: 'e2',
    titulo: 'Correção de bugs no app de delivery',
    descricao: 'App React Native vibecodado com IA apresenta crashes no checkout e falhas nas notificações push.',
    orcamento: 4500,
    prazo: '15 dias',
    modalidades: ['H'],
    stack: 'React Native',
    status: 'em_andamento',
    candidaturas: [
      { id: 'c4', desenvolvedorId: 'd4', experiencia: '4 anos em React Native', proposta: 4200, prazo: '12 dias', status: 'aceito' },
    ],
    dataCriacao: new Date('2025-03-28'),
  },
  {
    id: 'e3',
    titulo: 'Modernização do portal de clientes',
    descricao: 'Portal em PHP 5.6 precisa de atualização de segurança, integração com PIX e redesign completo.',
    orcamento: 7200,
    prazo: '30 dias',
    modalidades: ['P', 'SP', 'H'],
    stack: 'PHP 5.6 → Laravel + Vue',
    status: 'ativo',
    candidaturas: [],
    dataCriacao: new Date('2025-04-01'),
  },
];

// ─── Store de candidaturas do desenvolvedor ───────────────────────────────────

export type MinhaCandidatura = {
  candidaturaId: string; // referência à Candidatura no ProjetoEmpresa
  projetoId: string;
  titulo: string;
  stack: string;
  preco: number;
  prazo: string;
  status: 'pendente' | 'aceito' | 'recusado';
  dataEnvio: Date;
};

const MINHAS_CANDIDATURAS: MinhaCandidatura[] = [];

const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export const authService = {
  async login(email: string, password: string): Promise<User> {
    await delay(1200);
    if (email === 'test@redeemsoft.com' && password === 'password123') {
      return { id: '1', email, name: 'Usuário Teste', type: 'client' };
    }
    if (email === 'dev@redeemsoft.com' && password === 'password123') {
      return { id: '2', email, name: 'Dev Teste', type: 'developer' };
    }
    throw new Error('Credenciais inválidas. Verifique seu e-mail e senha.');
  },

  async loginWithGoogle(token: string): Promise<User> {
    await delay(800);
    void token;
    return { id: 'g-1', email: 'google@redeemsoft.com', name: 'Usuário Google', type: 'client' };
  },

  async register(data: RegisterData): Promise<User> {
    await delay(1500);
    return { id: '2', email: data.email, name: data.name, type: data.type };
  },

  async forgotPassword(email: string): Promise<void> {
    await delay(1000);
    void email;
  },

  async verifyCode(email: string, code: string): Promise<void> {
    await delay(800);
    void email;
    if (code !== '1234') {
      throw new Error('Código inválido ou expirado. Tente novamente.');
    }
  },

  async resetPassword(email: string, code: string, newPassword: string): Promise<void> {
    await delay(1000);
    void email;
    void code;
    void newPassword;
  },

  // ─── Candidaturas do desenvolvedor ─────────────────────────────────────────

  jaCandidatou(projetoId: string): boolean {
    return MINHAS_CANDIDATURAS.some((c) => c.projetoId === projetoId);
  },

  async candidatar(data: Omit<MinhaCandidatura, 'status' | 'dataEnvio' | 'candidaturaId'>): Promise<void> {
    await delay(800);
    if (this.jaCandidatou(data.projetoId)) {
      throw new Error('Você já se candidatou a este projeto.');
    }
    const candidaturaId = `c${Date.now()}`;

    // Adiciona à lista de candidaturas do projeto (usando dev d2 = dev@redeemsoft.com)
    const projeto = PROJETOS_EMPRESA_MOCK.find((p) => p.id === data.projetoId);
    if (projeto) {
      projeto.candidaturas.unshift({
        id: candidaturaId,
        desenvolvedorId: 'd2',
        experiencia: '',
        proposta: data.preco,
        prazo: data.prazo,
        status: 'pendente',
      });
    }

    MINHAS_CANDIDATURAS.unshift({
      ...data,
      candidaturaId,
      status: 'pendente',
      dataEnvio: new Date(),
    });
  },

  async getMinhaCandidaturas(): Promise<MinhaCandidatura[]> {
    await delay(400);
    return [...MINHAS_CANDIDATURAS];
  },

  // ─── Empresa ────────────────────────────────────────────────────────────────

  async getProjetosEmpresa(): Promise<ProjetoEmpresa[]> {
    await delay(600);
    return PROJETOS_EMPRESA_MOCK;
  },

  async criarProjeto(data: NovoProjeto): Promise<ProjetoEmpresa> {
    await delay(1000);
    const novo: ProjetoEmpresa = {
      id: `e${Date.now()}`,
      ...data,
      status: 'ativo',
      candidaturas: [],
      dataCriacao: new Date(),
    };
    PROJETOS_EMPRESA_MOCK.unshift(novo);
    return novo;
  },

  async atualizarStatusCandidatura(
    projetoId: string,
    candidaturaId: string,
    status: 'aceito' | 'recusado'
  ): Promise<void> {
    await delay(500);
    const projeto = PROJETOS_EMPRESA_MOCK.find((p) => p.id === projetoId);
    if (projeto) {
      const cand = projeto.candidaturas.find((c) => c.id === candidaturaId);
      if (cand) cand.status = status;
    }
  },

  // ─── Desenvolvedores ────────────────────────────────────────────────────────

  async getDesenvolvedores(): Promise<Desenvolvedor[]> {
    await delay(500);
    return DESENVOLVEDORES_MOCK;
  },

  getDesenvolvedorById(id: string): Desenvolvedor | undefined {
    return DESENVOLVEDORES_MOCK.find((d) => d.id === id);
  },

  async getStoredUser(): Promise<User | null> {
    return null;
  },
};
>>>>>>> 4c2393a725ff9ad656ee1181d1b82f594cd3dc4d
