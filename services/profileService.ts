import { api } from './api';

export type DevProfile = {
  sobreMim: string;
  habilidades: string[];
  certificados: string[];
  fotoUri: string | null;
  projetoFotos: (string | null)[];
};

// Cache local para refletir edições antes de novo fetch
let cache: DevProfile | null = null;

function parseList(value: string | null | undefined): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed;
  } catch {}
  return value.split(',').map((s) => s.trim()).filter(Boolean);
}

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
    } catch {
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
