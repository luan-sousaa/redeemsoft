import axios from 'axios';

const API_URL = 'https://photography-enhancements-reserved-gregory.trycloudflare.com';

const api = axios.create({
  baseURL: API_URL,
});

export type ProjetoData = {
  idCliente?: number;
  titulo: string;
  descricao: string;
  orcamento: number;
  prazo: string;
  stack: string;
  modalidades: any; 
};

export const projetoService = {
 criarProjeto: async (dadosProjeto: {
    titulo: string;
    descricao: string;
    orcamento: number;
    prazo: string;
    stack: string;
    modalidades: string[];
    idUsuario?: number; 
}) => {
    const response = await api.post('/projetos', dadosProjeto);
    return response.data;
},
  atualizarProjeto: async (id: number, dadosProjeto: ProjetoData) => {
    const response = await api.put(`/projetos/${id}`, dadosProjeto);
    return response.data;
  },
  atualizarStatusCandidatura: async (idProjeto: number, idAplicacao: number, status: 'pendente' | 'aceito' | 'recusado') => {
    try {

      const response = await api.patch(`/projetos/${idProjeto}/candidaturas/${idAplicacao}/status`, {
        status: status
      });
      return response.data;
    } catch (error) {
      console.error("Erro ao atualizar status da candidatura:", error);
      throw error;
    }
  },
  deletarProjeto: async (id: number) => {
    const response = await api.delete(`/projetos/${id}`);
    return response.data;
  
},  
  obterProjetos: async () => {
    const response = await api.get('/projetos');
    return response.data;
  }
};