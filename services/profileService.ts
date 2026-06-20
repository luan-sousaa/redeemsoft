import { api } from './api';
import { parseList } from '@/utils/parseList';

function ensureArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === 'string') return parseList(value);
  return [];
}

export type ProjetoDev = {
  id: string;
  titulo: string;
  stack: string[];
  foto: string | null;
};

export type DevProfile = {
  sobreMim: string;
  habilidades: string[];
  certificados: string[];
  fotoUri: string | null;
  foto: string | null;
  projetos: ProjetoDev[];
  precoPorHora?: number;
};

// Cache local para refletir edições antes de novo fetch
let cache: DevProfile | null = null;

const EMPTY: DevProfile = { sobreMim: '', habilidades: [], certificados: [], fotoUri: null, foto: null, projetos: [], precoPorHora: 0 };

function serializeList(list: string[]): string {
  return JSON.stringify(list);
}

function parseProjetos(value: unknown): ProjetoDev[] {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    try { return JSON.parse(value); } catch {}
  }
  return [];
}

export const profileService = {
  async get(): Promise<DevProfile> {
    if (cache) return { ...cache, projetos: [...cache.projetos] };

    try {
      const data = await api.get<any>('/desenvolvedores/meu');
      cache = {
        sobreMim: data.sobreMim ?? '',
        habilidades: parseList(data.habilidades),
        certificados: parseList(data.certificacoes),
        fotoUri: data.foto ?? null,
        foto: data.foto ?? null,
        projetos: parseProjetos(data.projetos),
        precoPorHora: data.precoPorHora ?? 0,
      };
    } catch (err) {
      console.warn('[profileService] Falha ao buscar perfil da API:', err);
      cache = { ...EMPTY };
    }

    return { ...cache!, projetos: [...cache!.projetos] };
  },

  async update(data: Partial<DevProfile>): Promise<void> {
    const current = cache ?? { ...EMPTY };
    cache = { ...current, ...data };

    await api.put('/desenvolvedores/meu', {
      sobreMim: cache.sobreMim,
      habilidades: serializeList(ensureArray(cache.habilidades)),
      certificacoes: serializeList(ensureArray(cache.certificados)),
      experiencia: cache.sobreMim,
      ...(cache.precoPorHora !== undefined ? { precoPorHora: cache.precoPorHora } : {}),
      ...(data.foto !== undefined ? { foto: data.foto } : {}),
      projetos: JSON.stringify(cache.projetos),
    });
  },

  clearCache() {
    cache = null;
  },
};
