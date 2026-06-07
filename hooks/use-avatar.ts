import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useState } from 'react';

const avatarKey = (idUsuario: number) => `@redeemsoft:avatar:${idUsuario}`;

export function useAvatar(idUsuario?: number) {
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [isPickerLoading, setIsPickerLoading] = useState(false);

  useEffect(() => {
    if (!idUsuario) return;
    setAvatarUri(null);
    AsyncStorage.getItem(avatarKey(idUsuario)).then((uri) => {
      if (uri) setAvatarUri(uri);
    });
  }, [idUsuario]);

  async function pickAvatar() {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') return;

      setIsPickerLoading(true);
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0] && idUsuario) {
        const uri = result.assets[0].uri;
        setAvatarUri(uri);
        await AsyncStorage.setItem(avatarKey(idUsuario), uri);
      }
    } catch (e) {
      console.error('Erro ao abrir galeria:', e);
    } finally {
      setIsPickerLoading(false);
    }
  }

  return { avatarUri, pickAvatar, isPickerLoading };
}
