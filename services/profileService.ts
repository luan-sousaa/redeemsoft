import { api } from './api';
import { parseList } from '@/utils/parseList';

export type DevProfile = {
  sobreMim: string;
  habilidades: string[];
  certificados: string[];
  fotoUri: string | null;
  projetoFotos: (string | null)[];
};

// Cache local para refletir edições antes de novo fetch
let cache: DevProfile | null = null;

function serializeList(list: string[]): string {
  return JSON.stringify(list);
}

export const profileService = {
  async get(): Promise<DevProfile> {
    if (cache) return { ...cache, projetoFotos: [...cache.projetoFotos] };

    try {
      const data = await api.get<any>('/desenvolvedores/meu');
      cache = {
        sobreMim: data.sobreMim ?? '',
        habilidades: parseList(data.habilidades),
        certificados: parseList(data.certificacoes),
        fotoUri: null,
        projetoFotos: [null, null, null, null],
      };
    } catch (err) {
      console.warn('[profileService] Falha ao buscar perfil da API:', err);
      cache = { sobreMim: '', habilidades: [], certificados: [], fotoUri: null, projetoFotos: [null, null, null, null] };
    }

    return { ...cache, projetoFotos: [...cache.projetoFotos] };
  },

  async update(data: Partial<DevProfile>): Promise<void> {
    const current = cache ?? { sobreMim: '', habilidades: [], certificados: [], fotoUri: null, projetoFotos: [null, null, null, null] };
    cache = { ...current, ...data };

    await api.put('/desenvolvedores/meu', {
      sobreMim: cache.sobreMim,
      habilidades: serializeList(cache.habilidades),
      certificacoes: serializeList(cache.certificados),
      experiencia: cache.sobreMim,
    });
  },

  clearCache() {
    cache = null;
  },
};
