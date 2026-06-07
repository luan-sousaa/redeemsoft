import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { profileService, type DevProfile } from '@/services/profileService';
import { useAuth } from './AuthContext';

const FOTO_KEY = (userId: string) => `@redeemsoft:foto:${userId}`;
const PROJETOS_KEY = (userId: string) => `@redeemsoft:projetos:${userId}`;
// Habilidades e certificados também vão para AsyncStorage — mesmo padrão dos projetos,
// pois a persistência apenas via API estava perdendo os dados entre sessões.
const HABILIDADES_KEY = (userId: string) => `@redeemsoft:habilidades:${userId}`;
const CERTIFICADOS_KEY = (userId: string) => `@redeemsoft:certificados:${userId}`;

const defaultProfile: DevProfile = {
  sobreMim: '',
  habilidades: [],
  certificados: [],
  fotoUri: null,
  projetoFotos: [null, null, null, null],
};

type ProfileContextValue = {
  profile: DevProfile;
  isLoading: boolean;
  updateProfile: (data: Partial<DevProfile>) => Promise<void>;
};

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [profile, setProfile] = useState<DevProfile>(defaultProfile);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      setProfile(defaultProfile);
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    Promise.all([
      profileService.get(),
      AsyncStorage.getItem(FOTO_KEY(user.id)),
      AsyncStorage.getItem(PROJETOS_KEY(user.id)),
      AsyncStorage.getItem(HABILIDADES_KEY(user.id)),
      AsyncStorage.getItem(CERTIFICADOS_KEY(user.id)),
    ])
      .then(([apiProfile, storedFoto, storedProjetos, storedHabilidades, storedCertificados]) => {
        if (cancelled) return;
        setProfile({
          ...apiProfile,
          fotoUri: storedFoto ?? apiProfile.fotoUri,
          projetoFotos: storedProjetos
            ? (JSON.parse(storedProjetos) as (string | null)[])
            : apiProfile.projetoFotos,
          // AsyncStorage tem prioridade sobre a API — mesmo padrão dos projetos/foto
          habilidades: storedHabilidades
            ? (JSON.parse(storedHabilidades) as string[])
            : apiProfile.habilidades,
          certificados: storedCertificados
            ? (JSON.parse(storedCertificados) as string[])
            : apiProfile.certificados,
        });
      })
      .catch((e) => {
        if (!cancelled) console.error('[ProfileContext] Erro ao carregar perfil:', e);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => { cancelled = true; };
  }, [isAuthenticated, user?.id]);

  const updateProfile = useCallback(
    async (data: Partial<DevProfile>) => {
      if (!user) return;
      setProfile((prev) => ({ ...prev, ...data }));

      const saves: Promise<unknown>[] = [profileService.update(data)];

      if ('fotoUri' in data) {
        saves.push(
          data.fotoUri
            ? AsyncStorage.setItem(FOTO_KEY(user.id), data.fotoUri)
            : AsyncStorage.removeItem(FOTO_KEY(user.id))
        );
      }
      if ('projetoFotos' in data && data.projetoFotos) {
        saves.push(
          AsyncStorage.setItem(PROJETOS_KEY(user.id), JSON.stringify(data.projetoFotos))
        );
      }
      // Persiste habilidades e certificados no AsyncStorage — corrige bug onde os dados
      // sumiam entre sessões por depender apenas da API (que retornava "[]").
      if ('habilidades' in data && data.habilidades) {
        saves.push(
          AsyncStorage.setItem(HABILIDADES_KEY(user.id), JSON.stringify(data.habilidades))
        );
      }
      if ('certificados' in data && data.certificados) {
        saves.push(
          AsyncStorage.setItem(CERTIFICADOS_KEY(user.id), JSON.stringify(data.certificados))
        );
      }

      await Promise.all(saves);
    },
    [user?.id]
  );

  return (
    <ProfileContext.Provider value={{ profile, isLoading, updateProfile }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfile must be used within ProfileProvider');
  return ctx;
}
