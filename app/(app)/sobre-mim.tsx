import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActionSheetIOS,
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
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
import { ProjetoCard } from '@/components/ProjetoCard';
import { Colors } from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { profileService, type ProjetoDev } from '@/services/profileService';

const GRID_GAP = 12;
const GRID_PADDING = 24;

// ─── Utils ────────────────────────────────────────────────────────────────────

async function pickFromGallery(): Promise<string | null> {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert('Permissão necessária', 'Permita o acesso à galeria nas configurações.');
    return null;
  }
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [4, 3],
    quality: 0.8,
  });
  if (result.canceled) return null;
  return result.assets[0].uri;
}

async function pickFromCamera(): Promise<string | null> {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert('Permissão necessária', 'Permita o acesso à câmera nas configurações.');
    return null;
  }
  const result = await ImagePicker.launchCameraAsync({
    allowsEditing: true,
    aspect: [4, 3],
    quality: 0.8,
  });
  if (result.canceled) return null;
  return result.assets[0].uri;
}

function showImageSourcePicker(onPick: (uri: string | null) => void) {
  if (Platform.OS === 'ios') {
    ActionSheetIOS.showActionSheetWithOptions(
      { options: ['Cancelar', 'Câmera', 'Galeria'], cancelButtonIndex: 0 },
      async (idx) => {
        if (idx === 1) onPick(await pickFromCamera());
        else if (idx === 2) onPick(await pickFromGallery());
      }
    );
  } else {
    Alert.alert('Imagem do projeto', 'Escolha a origem', [
      { text: 'Cancelar', style: 'cancel', onPress: () => onPick(null) },
      { text: 'Câmera', onPress: async () => onPick(await pickFromCamera()) },
      { text: 'Galeria', onPress: async () => onPick(await pickFromGallery()) },
    ]);
  }
}

// ─── Modal de adicionar/editar projeto ───────────────────────────────────────

type ProjetoModalProps = {
  visible: boolean;
  projeto: Partial<ProjetoDev> | null;
  onClose: () => void;
  onSave: (p: ProjetoDev) => void;
};

const STACK_SUGERIDAS = ['React', 'React Native', 'Node.js', 'TypeScript', 'Python', 'Flutter', 'Vue', 'Angular', 'Django', 'Laravel'];

function ProjetoModal({ visible, projeto, onClose, onSave }: ProjetoModalProps) {
  const [titulo, setTitulo] = useState('');
  const [stack, setStack] = useState<string[]>([]);
  const [stackInput, setStackInput] = useState('');
  const [foto, setFoto] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      setTitulo(projeto?.titulo ?? '');
      setStack(projeto?.stack ?? []);
      setStackInput('');
      setFoto(projeto?.foto ?? null);
    }
  }, [visible, projeto]);

  function addStack(tag: string) {
    const t = tag.trim();
    if (t && !stack.includes(t)) setStack(prev => [...prev, t]);
    setStackInput('');
  }

  function removeStack(tag: string) {
    setStack(prev => prev.filter(s => s !== tag));
  }

  function handleSave() {
    if (!titulo.trim()) {
      Toast.show({ type: 'error', text1: 'Informe o título do projeto' });
      return;
    }
    onSave({
      id: projeto?.id ?? String(Date.now()),
      titulo: titulo.trim(),
      stack,
      foto,
    });
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={modal.safe}>
        <View style={modal.header}>
          <Pressable onPress={onClose} style={modal.closeBtn}>
            <Ionicons name="chevron-down" size={24} color={Colors.textSecondary} />
          </Pressable>
          <Text style={modal.headerTitle}>{projeto?.id ? 'Editar Projeto' : 'Novo Projeto'}</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={modal.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {/* Imagem */}
          <Pressable style={modal.photoArea} onPress={() => showImageSourcePicker(uri => { if (uri) setFoto(uri); })}>
            {foto ? (
              <Image source={{ uri: foto }} style={modal.photoImage} />
            ) : (
              <View style={modal.photoEmpty}>
                <Ionicons name="image-outline" size={36} color={Colors.textSecondary} />
                <Text style={modal.photoEmptyText}>Toque para adicionar imagem</Text>
              </View>
            )}
            <View style={modal.cameraChip}>
              <Ionicons name="camera" size={14} color="#fff" />
              <Text style={modal.cameraChipText}>Alterar foto</Text>
            </View>
          </Pressable>

          {/* Título */}
          <Text style={modal.label}>Título do projeto *</Text>
          <View style={modal.inputContainer}>
            <TextInput
              style={modal.input}
              value={titulo}
              onChangeText={setTitulo}
              placeholder="Ex: Portal de licitações com IA"
              placeholderTextColor={Colors.textSecondary}
              maxLength={80}
            />
          </View>

          {/* Stack */}
          <Text style={modal.label}>Tecnologias utilizadas</Text>
          <View style={modal.inputContainer}>
            <TextInput
              style={modal.input}
              value={stackInput}
              onChangeText={setStackInput}
              placeholder="Digite e pressione +"
              placeholderTextColor={Colors.textSecondary}
              onSubmitEditing={() => addStack(stackInput)}
              returnKeyType="done"
            />
            <Pressable style={modal.addTagBtn} onPress={() => addStack(stackInput)}>
              <Ionicons name="add" size={20} color={Colors.primary} />
            </Pressable>
          </View>

          {/* Chips stack adicionadas */}
          {stack.length > 0 && (
            <View style={modal.chipsRow}>
              {stack.map(s => (
                <Pressable key={s} style={modal.chip} onPress={() => removeStack(s)}>
                  <Text style={modal.chipText}>{s}</Text>
                  <Ionicons name="close" size={12} color={Colors.primary} />
                </Pressable>
              ))}
            </View>
          )}

          {/* Sugestões */}
          <Text style={modal.subLabel}>Sugestões</Text>
          <View style={modal.chipsRow}>
            {STACK_SUGERIDAS.filter(s => !stack.includes(s)).map(s => (
              <Pressable key={s} style={modal.chipSugerida} onPress={() => addStack(s)}>
                <Text style={modal.chipSugeridaText}>{s}</Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>

        <View style={modal.footer}>
          <Button title="Salvar Projeto" onPress={handleSave} />
        </View>
      </SafeAreaView>
    </Modal>
  );
}

// ─── Tela principal ───────────────────────────────────────────────────────────

export default function SobreMimScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [sobre, setSobre] = useState('');
  const [fotoUri, setFotoUri] = useState<string | null>(null);
  const [projetos, setProjetos] = useState<ProjetoDev[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [projetoEditando, setProjetoEditando] = useState<Partial<ProjetoDev> | null>(null);

  useEffect(() => {
    profileService.get().then((p) => {
      setSobre(p.sobreMim);
      setFotoUri(p.fotoUri);
      setProjetos(p.projetos);
    });
  }, []);

  function handleFotoPress() {
    showImageSourcePicker((uri) => { if (uri) setFotoUri(uri); });
  }

  function abrirModal(projeto?: ProjetoDev) {
    setProjetoEditando(projeto ?? null);
    setModalVisible(true);
  }

  function salvarProjeto(p: ProjetoDev) {
    setProjetos(prev => {
      const idx = prev.findIndex(x => x.id === p.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = p;
        return next;
      }
      return [...prev, p];
    });
    setModalVisible(false);
  }

  function confirmarDeletar(id: string) {
    Alert.alert('Remover projeto', 'Tem certeza que deseja remover este projeto?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Remover',
        style: 'destructive',
        onPress: () => setProjetos(prev => prev.filter(p => p.id !== id)),
      },
    ]);
  }

  async function handleSalvar() {
    setIsLoading(true);
    try {
      await profileService.update({ sobreMim: sobre, fotoUri, projetos });
      Toast.show({ type: 'success', text1: 'Perfil atualizado!', text2: 'Suas informações foram salvas.' });
      router.back();
    } catch {
      Toast.show({ type: 'error', text1: 'Erro ao salvar', text2: 'Tente novamente.' });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back-circle-outline" size={30} color={Colors.text} />
          </Pressable>
          <Text style={styles.headerTitle} numberOfLines={1}>{user?.name ?? 'Meu Perfil'}</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {/* Foto de perfil */}
          <View style={styles.photoSection}>
            <Pressable style={styles.photoContainer} onPress={handleFotoPress}>
              {fotoUri ? (
                <Image source={{ uri: fotoUri }} style={styles.photoImage} />
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

          {/* Sobre */}
          <Text style={styles.sectionLabel}>Sobre mim</Text>
          <View style={styles.sobreContainer}>
            <TextInput
              style={styles.sobreInput}
              value={sobre}
              onChangeText={setSobre}
              placeholder="Fale sobre você, suas experiências e o que você faz de melhor..."
              placeholderTextColor={Colors.textSecondary}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
              selectionColor={Colors.primary}
              maxLength={500}
            />
            <Text style={styles.charCount}>{sobre.length}/500</Text>
          </View>

          {/* Projetos */}
          <View style={styles.projetosHeader}>
            <Text style={styles.sectionLabel}>Meus Projetos</Text>
            <Pressable style={styles.addProjetoBtn} onPress={() => abrirModal()}>
              <Ionicons name="add" size={18} color={Colors.primary} />
              <Text style={styles.addProjetoBtnText}>Adicionar</Text>
            </Pressable>
          </View>

          {projetos.length === 0 ? (
            <Pressable style={styles.projetosEmpty} onPress={() => abrirModal()}>
              <Ionicons name="briefcase-outline" size={36} color={Colors.textSecondary} />
              <Text style={styles.projetosEmptyText}>Nenhum projeto adicionado ainda</Text>
              <Text style={styles.projetosEmptySubtext}>Adicione projetos para mostrar seu portfólio</Text>
            </Pressable>
          ) : (
            <View style={styles.projetosGrid}>
              {projetos.map(p => (
                <ProjetoCard
                  key={p.id}
                  projeto={p}
                  editable
                  onEdit={() => abrirModal(p)}
                  onDelete={() => confirmarDeletar(p.id)}
                />
              ))}
            </View>
          )}

          <View style={styles.saveContainer}>
            <Button title="Salvar alterações" onPress={handleSalvar} isLoading={isLoading} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <ProjetoModal
        visible={modalVisible}
        projeto={projetoEditando}
        onClose={() => setModalVisible(false)}
        onSave={salvarProjeto}
      />
    </SafeAreaView>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

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

  photoSection: { alignItems: 'center', marginBottom: 28 },
  photoContainer: {
    width: 120, height: 120, borderRadius: 16,
    overflow: 'hidden', backgroundColor: Colors.surface,
    borderWidth: 1.5, borderColor: Colors.border, borderStyle: 'dashed',
  },
  photoImage: { width: '100%', height: '100%' },
  photoPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 6 },
  photoLabel: { fontSize: 14, color: Colors.textSecondary, fontWeight: '500' },
  cameraOverlay: {
    position: 'absolute', bottom: 6, right: 6,
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },

  sectionLabel: { fontSize: 15, fontWeight: '700', color: Colors.text, marginBottom: 10 },

  sobreContainer: {
    backgroundColor: Colors.surface, borderRadius: 14,
    borderWidth: 1.5, borderColor: Colors.border,
    paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8,
    marginBottom: 28,
  },
  sobreInput: { fontSize: 15, color: Colors.text, lineHeight: 22, minHeight: 96 },
  charCount: { fontSize: 11, color: Colors.textSecondary, textAlign: 'right', marginTop: 4 },

  projetosHeader: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 14,
  },
  addProjetoBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.surfaceHighlight,
    borderWidth: 1, borderColor: Colors.primary,
    borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6,
  },
  addProjetoBtnText: { fontSize: 13, color: Colors.primary, fontWeight: '600' },

  projetosEmpty: {
    alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: Colors.surface, borderRadius: 14,
    borderWidth: 1.5, borderColor: Colors.border, borderStyle: 'dashed',
    paddingVertical: 36, marginBottom: 28,
  },
  projetosEmptyText: { fontSize: 14, fontWeight: '600', color: Colors.text },
  projetosEmptySubtext: { fontSize: 12, color: Colors.textSecondary, textAlign: 'center', paddingHorizontal: 20 },

  projetosGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: GRID_GAP, marginBottom: 28,
  },

  saveContainer: { marginTop: 8 },
});

const modal = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  closeBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, fontSize: 17, fontWeight: '700', color: Colors.text, textAlign: 'center' },
  scroll: { padding: 20, paddingBottom: 8, gap: 16 },

  photoArea: {
    width: '100%', height: 180,
    borderRadius: 14, overflow: 'hidden',
    backgroundColor: Colors.surface,
    borderWidth: 1.5, borderColor: Colors.border,
    borderStyle: 'dashed',
  },
  photoImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  photoEmpty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  photoEmptyText: { fontSize: 13, color: Colors.textSecondary },
  cameraChip: {
    position: 'absolute', bottom: 8, right: 8,
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: Colors.primary,
    borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5,
  },
  cameraChipText: { fontSize: 12, color: '#fff', fontWeight: '600' },

  label: { fontSize: 14, fontWeight: '600', color: Colors.text },
  subLabel: { fontSize: 12, color: Colors.textSecondary, fontWeight: '500' },

  inputContainer: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12, borderWidth: 1.5, borderColor: Colors.border,
    paddingHorizontal: 14,
  },
  input: { flex: 1, fontSize: 15, color: Colors.text, paddingVertical: 12 },
  addTagBtn: { padding: 6 },

  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.surfaceHighlight,
    borderWidth: 1, borderColor: Colors.primary,
    borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5,
  },
  chipText: { fontSize: 13, color: Colors.primary, fontWeight: '600' },
  chipSugerida: {
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
    borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5,
  },
  chipSugeridaText: { fontSize: 12, color: Colors.textSecondary },

  footer: { padding: 20, borderTopWidth: 1, borderTopColor: Colors.border },
});
