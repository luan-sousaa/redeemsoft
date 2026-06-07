import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
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
import { useProfile } from '@/contexts/ProfileContext';

export default function EditarCertificadosScreen() {
  const router = useRouter();
  const { profile, updateProfile } = useProfile();
  const inputRef = useRef<TextInput>(null);

  const [certificados, setCertificados] = useState<string[]>(() => profile.certificados);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const isFetching = false;

  function addCertificado() {
    const trimmed = input.trim();
    if (!trimmed) return;
    if (certificados.map((c) => c.toLowerCase()).includes(trimmed.toLowerCase())) {
      setInput('');
      return;
    }
    setCertificados((prev) => [...prev, trimmed]);
    setInput('');
    inputRef.current?.focus();
  }

  function removeCertificado(index: number) {
    setCertificados((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSalvar() {
    setIsLoading(true);
    try {
      await updateProfile({ certificados });
      Toast.show({ type: 'success', text1: 'Certificados salvos!' });
      router.back();
    } catch {
      Toast.show({ type: 'error', text1: 'Erro ao salvar', text2: 'Tente novamente.' });
    } finally {
      setIsLoading(false);
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
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </Pressable>
          <Text style={styles.headerTitle}>Certificados</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.label}>Adicionar certificado</Text>

          <View style={styles.inputRow}>
            <TextInput
              ref={inputRef}
              style={styles.input}
              value={input}
              onChangeText={setInput}
              placeholder="Ex: AWS Certified Developer..."
              placeholderTextColor={Colors.textSecondary}
              onSubmitEditing={addCertificado}
              returnKeyType="done"
              selectionColor={Colors.primary}
              autoCapitalize="words"
            />
            <Pressable
              style={[styles.addBtn, !input.trim() && styles.addBtnDisabled]}
              onPress={addCertificado}
              disabled={!input.trim()}
            >
              <Ionicons name="add" size={22} color={Colors.text} />
            </Pressable>
          </View>

          {isFetching ? null : certificados.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="ribbon-outline" size={48} color={Colors.surfaceHighlight} />
              <Text style={styles.emptyText}>Nenhum certificado adicionado</Text>
              <Text style={styles.emptySubtext}>Digite o nome do certificado acima e pressione Enter</Text>
            </View>
          ) : (
            <>
              <Text style={styles.countLabel}>
                {certificados.length} certificado{certificados.length !== 1 ? 's' : ''}
              </Text>
              <View style={styles.lista}>
                {certificados.map((cert, i) => (
                  <View key={i} style={styles.certRow}>
                    <View style={styles.certIcon}>
                      <Ionicons name="ribbon-outline" size={18} color={Colors.primary} />
                    </View>
                    <Text style={styles.certText} numberOfLines={2}>{cert}</Text>
                    <Pressable style={styles.removeBtn} onPress={() => removeCertificado(i)}>
                      <Ionicons name="trash-outline" size={18} color={Colors.error} />
                    </Pressable>
                  </View>
                ))}
              </View>
            </>
          )}
        </ScrollView>

        <View style={styles.footer}>
          <Button title="Salvar certificados" onPress={handleSalvar} isLoading={isLoading} />
        </View>
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
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
    textAlign: 'center',
  },
  scroll: { padding: 24, paddingBottom: 40 },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  inputRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  input: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: Colors.text,
  },
  addBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnDisabled: { backgroundColor: Colors.surfaceHighlight },
  countLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600',
    marginBottom: 12,
  },
  lista: { gap: 10 },
  certRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 12,
  },
  certIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(79,110,247,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  certText: { flex: 1, fontSize: 14, color: Colors.text, fontWeight: '500', lineHeight: 20 },
  removeBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(232,69,96,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: { alignItems: 'center', paddingTop: 48, gap: 10 },
  emptyText: { fontSize: 15, fontWeight: '700', color: Colors.text },
  emptySubtext: { fontSize: 13, color: Colors.textSecondary, textAlign: 'center' },
  footer: { paddingHorizontal: 24, paddingBottom: 24, paddingTop: 8 },
});
