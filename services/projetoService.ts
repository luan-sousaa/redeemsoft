import { api } from './api';

export const projetoService = {
  obterProjetos: async () => {
    return api.get<any[]>('/projetos');
  },
};
