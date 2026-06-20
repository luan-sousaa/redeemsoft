// editar-perfil.tsx — Tela de edição de bio, foto e projetos do desenvolvedor.
// Movido de sobre-mim.tsx (que agora é somente visualização).
// Salva via ProfileContext.updateProfile() → AsyncStorage + API (PUT /desenvolvedores/meu).

import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActionSheetIOS,
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

import { Button } from '@/components/ui/Button';
import { Colors } from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/contexts/ProfileContext';

const { width } = Dimensions.get('window');
const GRID_GAP = 12;
const GRID_PADDING = 24;
const CELL_SIZE = (width - GRID_PADDING * 2 - GRID_GAP) / 2;

type PickResult = { uri: string; base64: string };

async function pickFromGallery(): Promise<PickResult | null> {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert('Permissão necessária', 'Permita o acesso à galeria nas configurações do dispositivo.');
    return null;
  }
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8,
    base64: true,
  });
  if (result.canceled) return null;
  const asset = result.assets[0];
  if (!asset.base64) return null;
  return { uri: asset.uri, base64: `data:image/jpeg;base64,${asset.base64}` };
}

async function pickFromCamera(): Promise<PickResult | null> {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert('Permissão necessária', 'Permita o acesso à câmera nas configurações do dispositivo.');
    return null;
  }
  const result = await ImagePicker.launchCameraAsync({
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8,
    base64: true,
  });
  if (result.canceled) return null;
  const asset = result.assets[0];
  if (!asset.base64) return null;
  return { uri: asset.uri, base64: `data:image/jpeg;base64,${asset.base64}` };
}

function showImageSourcePicker(onPick: (result: PickResult | null) => void) {
  if (Platform.OS === 'ios') {
    ActionSheetIOS.showActionSheetWithOptions(
      { options: ['Cancelar', 'Câmera', 'Galeria'], cancelButtonIndex: 0 },
      async (idx) => {
        if (idx === 1) onPick(await pickFromCamera());
        else if (idx === 2) onPick(await pickFromGallery());
      }
    );
  } else {
    Alert.alert('Foto de perfil', 'Escolha a origem', [
      { text: 'Cancelar', style: 'cancel', onPress: () => onPick(null) },
      { text: 'Câmera', onPress: async () => onPick(await pickFromCamera()) },
      { text: 'Galeria', onPress: async () => onPick(await pickFromGallery()) },
    ]);
  }
}

// ─── Célula de projeto ────────────────────────────────────────────────────────

function ProjetoCell({ uri, onPress }: { uri: string | null; onPress: () => void }) {
  return (
    <Pressable style={styles.projetoCell} onPress={onPress}>
      {uri ? (
        <Image source={{ uri }} style={styles.projetoCellImage} contentFit="cover" />
      ) : (
        <View style={styles.projetoCellEmpty}>
          <Ionicons name="add-outline" size={28} color={Colors.textSecondary} />
          <Text style={styles.projetoCellLabel}>Adicionar</Text>
        </View>
      )}
    </Pressable>
  );
}

// ─── Tela ─────────────────────────────────────────────────────────────────────

export default function EditarPerfilScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { profile, isLoading: isProfileLoading, updateProfile } = useProfile();

  const [sobre, setSobre] = useState(() => profile.sobreMim);
  const [precoPorHora, setPrecoPorHora] = useState(() => String(profile.precoPorHora ?? ''));
  const [fotoUri, setFotoUri] = useState<string | null>(() => profile.fotoUri ?? profile.foto);
  const [fotoBase64, setFotoBase64] = useState<string | null>(() => profile.foto ?? null);
  const [projetoFotos, setProjetoFotos] = useState<(string | null)[]>(() =>
    profile.projetoFotos.length === 4 ? [...profile.projetoFotos] : [null, null, null, null]
  );
  const [isSaving, setIsSaving] = useState(false);
  const hasInitialized = React.useRef(false);

  useEffect(() => {
    if (!hasInitialized.current && !isProfileLoading) {
      hasInitialized.current = true;
      setSobre(profile.sobreMim);
      setPrecoPorHora(String(profile.precoPorHora ?? ''));
      setFotoUri(profile.fotoUri ?? profile.foto);
      setFotoBase64(profile.foto ?? null);
      setProjetoFotos(profile.projetoFotos.length === 4 ? [...profile.projetoFotos] : [null, null, null, null]);
    }
  }, [profile, isProfileLoading]);

  function handleFotoPress() {
    showImageSourcePicker((result) => {
      if (result) {
        setFotoUri(result.uri);
        setFotoBase64(result.base64);
      }
    });
  }

  async function handleProjetoCellPress(index: number) {
    const result = await pickFromGallery();
    if (result) {
      setProjetoFotos((prev) => {
        const next = [...prev];
        next[index] = result.uri;
        return next;
      });
    }
  }

  async function handleSalvar() {
    setIsSaving(true);
    try {
      const preco = parseFloat(precoPorHora.replace(',', '.'));
      await updateProfile({ sobreMim: sobre, fotoUri, foto: fotoBase64, projetoFotos, precoPorHora: isNaN(preco) ? 0 : preco });
      Toast.show({
        type: 'success',
        text1: 'Perfil atualizado com sucesso!',
        text2: 'Suas informações foram salvas.',
      });
      router.back();
    } catch {
      Toast.show({ type: 'error', text1: 'Erro ao salvar', text2: 'Tente novamente.' });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back-circle-outline" size={30} color={Colors.text} />
          </Pressable>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {user?.name ?? 'Editar Perfil'}
          </Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Foto de perfil */}
          <View style={styles.photoSection}>
            <Pressable style={styles.photoContainer} onPress={handleFotoPress}>
              {fotoUri ? (
                <Image source={{ uri: fotoUri }} style={styles.photoImage} contentFit="cover" />
              ) : (
                <View style={styles.photoPlaceholder}>
                  <Ionicons name="camera-outline" size={32} color={Colors.textSecondary} />
                  <Text style={styles.photoLabel}>Foto</Text>
                </View>
              )}
              <View style={styles.cameraOverlay}>
                <Ionicons name="camera" size={14} color={Colors.text} />
              </View>
            </Pressable>
          </View>

          {/* Preço por hora */}
          <View style={styles.precoContainer}>
            <Text style={styles.precoLabel}>Preço por hora (R$)</Text>
            <View style={styles.precoInputRow}>
              <Text style={styles.precoPrefix}>R$</Text>
              <TextInput
                style={styles.precoInput}
                value={precoPorHora}
                onChangeText={setPrecoPorHora}
                placeholder="0"
                placeholderTextColor={Colors.textSecondary}
                keyboardType="decimal-pad"
                selectionColor={Colors.primary}
              />
              <Text style={styles.precoSuffix}>/h</Text>
            </View>
          </View>

          {/* Sobre */}
          <View style={styles.sobreContainer}>
            <TextInput
              style={styles.sobreInput}
              value={sobre}
              onChangeText={(t) => setSobre(t.slice(0, 500))}
              placeholder="Sobre mim:"
              placeholderTextColor={Colors.textSecondary}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
              selectionColor={Colors.primary}
            />
            <Text style={[styles.charCounter, sobre.length >= 480 && styles.charCounterWarn]}>
              {sobre.length}/500
            </Text>
          </View>

          {/* Projetos */}
          <Text style={styles.projetosLabel}>Projetos:</Text>
          <View style={styles.projetosGrid}>
            {projetoFotos.map((uri, i) => (
              <ProjetoCell key={i} uri={uri} onPress={() => handleProjetoCellPress(i)} />
            ))}
          </View>

          <View style={styles.saveContainer}>
            <Button title="Salvar alterações" onPress={handleSalvar} isLoading={isSaving} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: { alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, fontSize: 20, fontWeight: '800', color: Colors.text },
  scroll: { padding: GRID_PADDING, paddingBottom: 48 },

  photoSection: { alignItems: 'center', marginBottom: 24 },
  photoContainer: {
    width: 120,
    height: 120,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderStyle: 'dashed',
  },
  photoImage: { width: '100%', height: '100%' },
  photoPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 6 },
  photoLabel: { fontSize: 14, color: Colors.textSecondary, fontWeight: '500' },
  cameraOverlay: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  precoContainer: {
    marginBottom: 20,
  },
  precoLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  precoInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 6,
  },
  precoPrefix: { fontSize: 16, fontWeight: '700', color: Colors.textSecondary },
  precoInput: { flex: 1, fontSize: 18, fontWeight: '700', color: Colors.text, paddingVertical: 0 },
  precoSuffix: { fontSize: 14, fontWeight: '600', color: Colors.textSecondary },

  sobreContainer: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 24,
    minHeight: 120,
  },
  sobreInput: { fontSize: 15, color: Colors.text, lineHeight: 22, minHeight: 96 },
  charCounter: { fontSize: 11, color: Colors.textSecondary, textAlign: 'right', marginTop: 6 },
  charCounterWarn: { color: Colors.error },

  projetosLabel: { fontSize: 15, fontWeight: '600', color: Colors.text, marginBottom: 12 },
  projetosGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: GRID_GAP, marginBottom: 32 },
  projetoCell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  projetoCellImage: { width: '100%', height: '100%' },
  projetoCellEmpty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 6 },
  projetoCellLabel: { fontSize: 12, color: Colors.textSecondary, fontWeight: '500' },
  saveContainer: { marginTop: 8 },
});
