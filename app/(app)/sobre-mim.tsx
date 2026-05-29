import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
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
import { useAvatar } from '@/hooks/use-avatar';

const { width } = Dimensions.get('window');
const GRID_GAP = 12;
const GRID_PADDING = 24;
const CELL_SIZE = (width - GRID_PADDING * 2 - GRID_GAP) / 2;

// ─── Célula de projeto (imagem/placeholder) ───────────────────────────────────

function ProjetoCell({ index, imageUri }: { index: number; imageUri?: string }) {
  return (
    <Pressable style={styles.projetoCell}>
      {imageUri ? null : (
        <View style={styles.projetoCellEmpty}>
          <Ionicons name="add-outline" size={28} color={Colors.textSecondary} />
        </View>
      )}
    </Pressable>
  );
}

// ─── Tela ─────────────────────────────────────────────────────────────────────

export default function SobreMimScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { avatarUri, pickAvatar, isPickerLoading } = useAvatar();

  const [sobre, setSobre] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleSalvar() {
    setIsLoading(true);
    // Simula salvamento
    await new Promise((r) => setTimeout(r, 800));
    setIsLoading(false);
    Toast.show({
      type: 'success',
      text1: 'Perfil atualizado!',
      text2: 'Suas informações foram salvas.',
    });
    router.back();
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back-circle-outline" size={30} color={Colors.text} />
          </Pressable>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {user?.name ?? 'Nome Prestador'}
          </Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Foto */}
          <View style={styles.photoSection}>
            <Pressable style={styles.photoContainer} onPress={pickAvatar} disabled={isPickerLoading}>
              {avatarUri ? (
                <Image source={{ uri: avatarUri }} style={styles.photoImage} contentFit="cover" />
              ) : (
                <View style={styles.photoPlaceholder}>
                  <Ionicons name="camera-outline" size={32} color={Colors.textSecondary} />
                  <Text style={styles.photoLabel}>Foto</Text>
                </View>
              )}
              {isPickerLoading && (
                <View style={styles.photoOverlay}>
                  <ActivityIndicator color={Colors.primary} />
                </View>
              )}
            </Pressable>
            <Text style={styles.photoHint}>Toque para alterar</Text>
          </View>

          {/* Sobre */}
          <View style={styles.sobreContainer}>
            <TextInput
              style={styles.sobreInput}
              value={sobre}
              onChangeText={setSobre}
              placeholder="Sobre:"
              placeholderTextColor={Colors.textSecondary}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
              selectionColor={Colors.primary}
            />
          </View>

          {/* Projetos */}
          <Text style={styles.projetosLabel}>Projetos:</Text>
          <View style={styles.projetosGrid}>
            {[0, 1, 2, 3].map((i) => (
              <ProjetoCell key={i} index={i} />
            ))}
          </View>

          {/* Botão salvar */}
          <View style={styles.saveContainer}>
            <Button
              title="Salvar alterações"
              onPress={handleSalvar}
              isLoading={isLoading}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  flex: { flex: 1 },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
  },

  scroll: {
    padding: GRID_PADDING,
    paddingBottom: 48,
  },

  // Foto
  photoSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
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
  photoImage: {
    width: '100%',
    height: '100%',
  },
  photoPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  photoLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  photoOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoHint: {
    marginTop: 8,
    fontSize: 12,
    color: Colors.textSecondary,
  },

  // Sobre
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
  sobreInput: {
    fontSize: 15,
    color: Colors.text,
    lineHeight: 22,
    minHeight: 96,
  },

  // Projetos grid
  projetosLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  projetosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GRID_GAP,
    marginBottom: 32,
  },
  projetoCell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  projetoCellEmpty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  saveContainer: {
    marginTop: 8,
  },
});
