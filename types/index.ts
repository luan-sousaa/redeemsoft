export interface Usuario {
  idUsuario: number;
  nome: string;
  email: string;
  senha: string;
  type: 'client' | 'developer';
  cidade?: string | null;
  estado?: string | null;
  cpfCnpj?: string | null;
}

export interface Desenvolvedor {
  idDev: number;
  idUsuario: number;
  nome: string;
  precoPorHora?: number | null;
  sobreMim?: string | null;
  habilidades?: string | null;
  email?: string | null;
  experiencia?: string | null;
}

export interface Cliente {
  idCliente: number;
  idUsuario: number;
  empresa?: string | null;
}

export interface Aplicacao {
  idAplicacao: number;
  idDev: number;
  idProjeto: number;
  proposta?: number | null;
  status: 'pendente' | 'aceito' | 'recusado';
}

export interface ProjetoEmpresa {
  idProjeto: number;
  idCliente: number;
  titulo: string;
  descricao: string;
  orcamento: number;
  prazo: number;
  modalidade: 'presencial' | 'remoto' | 'híbrido';
  stack: string;
  status: 'ativo' | 'em_andamento' | 'concluido';
  dataCriacao: Date; 
  candidaturas: CandidaturaDetalhada[]; 
}

export interface CandidaturaDetalhada {
  idAplicacao: number;
  idDev: number;
  proposta?: number | null;
  status: 'pendente' | 'aceito' | 'recusado';

  projeto?: {
    titulo: string;
    prazo: number;
   
  };
  

  desenvolvedor?: {
    nome: string;
    email: string;
    experiencia?: string | null;    
  };
}
export interface MinhaCandidatura {
  candidaturaId: string;
  titulo: string;
  stack: string;
  prazo: string;
  preco: number;
  status: 'pendente' | 'aceito' | 'recusado';
  dataEnvio: Date;
};

