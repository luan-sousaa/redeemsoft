import axios from 'axios';

const API_URL = 'http://192.168.1.17:3000/'; 

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
  criarProjeto: async (data: ProjetoData) => {
    try {
      const response = await api.post('/projetos', data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.mensagem || 'Erro ao criar projeto');
    }
  },

  
};