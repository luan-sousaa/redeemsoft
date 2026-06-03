import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useState } from 'react';

const AVATAR_KEY = '@redeemsoft:avatar';

export function useAvatar() {
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [isPickerLoading, setIsPickerLoading] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(AVATAR_KEY).then((uri) => {
      if (uri) setAvatarUri(uri);
    });
  }, []);

  async function pickAvatar() {
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
        await AsyncStorage.setItem(AVATAR_KEY, uri);
      }
    } finally {
      setIsPickerLoading(false);
    }
  }

  return { avatarUri, pickAvatar, isPickerLoading };
}