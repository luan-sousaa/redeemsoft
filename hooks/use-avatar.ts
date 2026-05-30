import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useState } from 'react';

import { useAuth } from '@/contexts/AuthContext';

function avatarKey(userId: string) {
  return `@redeemsoft:avatar:${userId}`;
}

export function useAvatar() {
  const { user } = useAuth();
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [isPickerLoading, setIsPickerLoading] = useState(false);

  useEffect(() => {
    if (!user?.id) { setAvatarUri(null); return; }
    AsyncStorage.getItem(avatarKey(user.id)).then((uri) => {
      setAvatarUri(uri ?? null);
    });
  }, [user?.id]);

  async function pickAvatar() {
    if (!user?.id) return;
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return;

    setIsPickerLoading(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const uri = result.assets[0].uri;
        setAvatarUri(uri);
        await AsyncStorage.setItem(avatarKey(user.id), uri);
      }
    } finally {
      setIsPickerLoading(false);
    }
  }

  return { avatarUri, pickAvatar, isPickerLoading };
}
