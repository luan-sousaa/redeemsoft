import { api } from './api';
import { parseList } from '@/utils/parseList';

function ensureArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === 'string') return parseList(value);
  return [];
}

export type DevProfile = {
  sobreMim: string;
  habilidades: string[];
  certificados: string[];
  fotoUri: string | null;
  foto: string | null;
  projetoFotos: (string | null)[];
};

// Cache local para refletir edições antes de novo fetch
let cache: DevProfile | null = null;

const EMPTY: DevProfile = { sobreMim: '', habilidades: [], certificados: [], fotoUri: null, foto: null, projetoFotos: [null, null, null, null] };

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
        foto: data.foto ?? null,
        projetoFotos: [null, null, null, null],
      };
    } catch (err) {
      console.warn('[profileService] Falha ao buscar perfil da API:', err);
      cache = { ...EMPTY };
    }

    return { ...cache!, projetoFotos: [...cache!.projetoFotos] };
  },

  async update(data: Partial<DevProfile>): Promise<void> {
    const current = cache ?? { ...EMPTY };
    cache = { ...current, ...data };

    await api.put('/desenvolvedores/meu', {
      sobreMim: cache.sobreMim,
      habilidades: serializeList(ensureArray(cache.habilidades)),
      certificacoes: serializeList(ensureArray(cache.certificados)),
      experiencia: cache.sobreMim,
      ...(cache.foto !== undefined ? { foto: cache.foto } : {}),
    });
  },

  clearCache() {
    cache = null;
  },
};
