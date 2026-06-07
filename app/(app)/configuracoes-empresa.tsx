// configuracoes-empresa.tsx — Tela de edição de perfil para usuários do tipo empresa (client).
// Exibida quando user.type === 'client' acessa configurações.
// Busca e salva dados via GET/PUT /clientes/:idCliente.

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import type { Href } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

import { Colors } from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/services/api';

// ─── Tipos ────────────────────────────────────────────────────────────────────

type EmpresaProfile = {
  empresa: string;
  descricao: string;
  segmento: string;
  tamanho: string;
  site: string;
  anoFundacao: string;
  cidade: string;
  estado: string;
  modalidadePreferida: string;
};

const TAMANHOS = ['1-10', '11-50', '50-200', '200+'] as const;
const MODALIDADES = ['Remoto', 'Presencial', 'Híbrido'] as const;

// ─── Sub-componentes ──────────────────────────────────────────────────────────

function Label({ text }: { text: string }) {
  return <Text style={styles.label}>{text}</Text>;
}

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  multiline,
  keyboardType,
  maxLength,
  autoCapitalize,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  multiline?: boolean;
  keyboardType?: 'default' | 'url' | 'numeric';
  maxLength?: number;
  autoCapitalize?: 'none' | 'characters' | 'words' | 'sentences';
}) {
  return (
    <View style={styles.fieldWrap}>
      <Label text={label} />
      <TextInput
        style={[styles.input, multiline && styles.inputMultiline]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Colors.textSecondary}
        multiline={multiline}
        numberOfLines={multiline ? 4 : 1}
        keyboardType={keyboardType ?? 'default'}
        maxLength={maxLength}
        autoCapitalize={autoCapitalize ?? 'sentences'}
      />
      {multiline && maxLength && (
        <Text style={styles.charCount}>{value.length}/{maxLength}</Text>
      )}
    </View>
  );
}

function OptionSelector({
  label,
  options,
  value,
  onSelect,
}: {
  label: string;
  options: readonly string[];
  value: string;
  onSelect: (v: string) => void;
}) {
  return (
    <View style={styles.fieldWrap}>
      <Label text={label} />
      <View style={styles.optionsRow}>
        {options.map((opt) => (
          <Pressable
            key={opt}
            style={[styles.optionBtn, value === opt && styles.optionBtnSelected]}
            onPress={() => onSelect(opt)}
          >
            <Text style={[styles.optionText, value === opt && styles.optionTextSelected]}>
              {opt}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

// ─── Tela ─────────────────────────────────────────────────────────────────────

export default function ConfiguracoesEmpresaScreen() {
  const router = useRouter();
  const { user, updateUser, logout } = useAuth();
  const idCliente = user?.idCliente;

  const [form, setForm] = useState<EmpresaProfile>({
    empresa: '',
    descricao: '',
    segmento: '',
    tamanho: '',
    site: '',
    anoFundacao: '',
    cidade: '',
    estado: '',
    modalidadePreferida: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const hasFetched = useRef(false);

  function set(field: keyof EmpresaProfile) {
    return (value: string) => setForm((prev) => ({ ...prev, [field]: value }));
  }

  useEffect(() => {
    if (!idCliente || hasFetched.current) return;
    hasFetched.current = true;

    api.get<any>(`/clientes/${idCliente}`)
      .then((data) => {
        setForm({
          empresa: data.empresa ?? '',
          descricao: data.descricao ?? '',
          segmento: data.segmento ?? '',
          tamanho: data.tamanho ?? '',
          site: data.site ?? '',
          anoFundacao: data.anoFundacao ?? '',
          cidade: data.cidade ?? '',
          estado: data.estado ?? '',
          modalidadePreferida: data.modalidadePreferida ?? '',
        });
      })
      .catch(() => {
        Toast.show({ type: 'error', text1: 'Erro ao carregar perfil' });
      })
      .finally(() => setIsLoading(false));
  }, [idCliente]);

  async function handleSalvar() {
    if (!idCliente) return;
    setIsSaving(true);
    try {
      await api.put(`/clientes/${idCliente}`, form);
      updateUser({ name: form.empresa || user?.name });
      Toast.show({ type: 'success', text1: 'Perfil atualizado com sucesso!' });
    } catch (err: any) {
      Toast.show({ type: 'error', text1: 'Erro ao salvar', text2: err?.message });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Perfil da Empresa</Text>
        <View style={{ width: 40 }} />
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Card do usuário */}
          <View style={styles.profileCard}>
            <View style={styles.avatar}>
              <Ionicons name="business-outline" size={28} color={Colors.white} />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{form.empresa || user?.name}</Text>
              <Text style={styles.profileEmail}>{user?.email}</Text>
            </View>
          </View>

          {/* Botão ver prévia */}
          <Pressable
            style={({ pressed }) => [styles.previewBtn, pressed && styles.previewBtnPressed]}
            onPress={() => router.push('/(app)/perfil-empresa' as Href)}
          >
            <Ionicons name="eye-outline" size={18} color={Colors.primary} />
            <Text style={styles.previewBtnText}>Ver prévia do perfil</Text>
            <Ionicons name="chevron-forward" size={16} color={Colors.primary} />
          </Pressable>

          {/* Seção: Informações da empresa */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Informações da Empresa</Text>
              <Ionicons name="business-outline" size={16} color={Colors.textSecondary} />
            </View>
            <View style={styles.sectionCard}>
              <Field label="Nome da empresa" value={form.empresa} onChangeText={set('empresa')} placeholder="Ex: Acme Corp" />
              <View style={styles.separator} />
              <Field label="Segmento" value={form.segmento} onChangeText={set('segmento')} placeholder="Ex: Tecnologia, Saúde, Varejo..." />
              <View style={styles.separator} />
              <OptionSelector label="Tamanho da empresa" options={TAMANHOS} value={form.tamanho} onSelect={set('tamanho')} />
              <View style={styles.separator} />
              <Field
                label="Sobre a empresa"
                value={form.descricao}
                onChangeText={set('descricao')}
                placeholder="Descreva sua empresa, missão e o que vocês fazem..."
                multiline
                maxLength={500}
              />
            </View>
          </View>

          {/* Seção: Localização e contato */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Localização e Contato</Text>
              <Ionicons name="location-outline" size={16} color={Colors.textSecondary} />
            </View>
            <View style={styles.sectionCard}>
              <Field label="Site" value={form.site} onChangeText={set('site')} placeholder="https://suaempresa.com.br" keyboardType="url" autoCapitalize="none" />
              <View style={styles.separator} />
              <Field label="Ano de fundação" value={form.anoFundacao} onChangeText={set('anoFundacao')} placeholder="Ex: 2010" keyboardType="numeric" maxLength={4} />
              <View style={styles.separator} />
              <Field label="Cidade" value={form.cidade} onChangeText={set('cidade')} placeholder="Ex: Brasília" autoCapitalize="words" />
              <View style={styles.separator} />
              <Field label="Estado (UF)" value={form.estado} onChangeText={(v) => set('estado')(v.toUpperCase())} placeholder="Ex: DF" maxLength={2} autoCapitalize="characters" />
            </View>
          </View>

          {/* Seção: Preferências */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Preferências</Text>
              <Ionicons name="options-outline" size={16} color={Colors.textSecondary} />
            </View>
            <View style={styles.sectionCard}>
              <OptionSelector label="Modalidade preferida" options={MODALIDADES} value={form.modalidadePreferida} onSelect={set('modalidadePreferida')} />
            </View>
          </View>

          {/* Salvar */}
          <Pressable
            style={[styles.saveBtn, isSaving && { opacity: 0.7 }]}
            onPress={handleSalvar}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text style={styles.saveBtnText}>Salvar alterações</Text>
            )}
          </Pressable>

          {/* Minha conta */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Minha Conta</Text>
            </View>
            <View style={styles.sectionCard}>
              <Pressable
                style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
                onPress={() => router.push('/(auth)/forgot-password' as Href)}
              >
                <View style={styles.rowIcon}>
                  <Ionicons name="lock-closed-outline" size={20} color={Colors.primary} />
                </View>
                <Text style={styles.rowLabel}>Trocar Senha</Text>
                <Ionicons name="chevron-forward" size={18} color={Colors.textSecondary} />
              </Pressable>
              <View style={styles.separator} />
              <Pressable
                style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
                onPress={logout}
              >
                <View style={[styles.rowIcon, styles.rowIconDanger]}>
                  <Ionicons name="log-out-outline" size={20} color={Colors.error} />
                </View>
                <Text style={[styles.rowLabel, { color: Colors.error }]}>Sair</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },

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
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
    textAlign: 'center',
  },

  scroll: { padding: 20, paddingBottom: 60, gap: 20 },

  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 14,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 15, fontWeight: '700', color: Colors.text, marginBottom: 3 },
  profileEmail: { fontSize: 12, color: Colors.textSecondary },

  previewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  previewBtnPressed: { backgroundColor: Colors.surfaceHighlight },
  previewBtnText: { flex: 1, fontSize: 15, fontWeight: '600', color: Colors.primary },

  section: { gap: 10 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  sectionCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    padding: 16,
    gap: 0,
  },

  label: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  fieldWrap: { paddingVertical: 10 },
  input: {
    backgroundColor: Colors.surfaceHighlight,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: Colors.text,
  },
  inputMultiline: {
    height: 110,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 11,
    color: Colors.textSecondary,
    textAlign: 'right',
    marginTop: 4,
  },

  optionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  optionBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surfaceHighlight,
  },
  optionBtnSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  optionText: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  optionTextSelected: { color: Colors.white },

  separator: { height: 1, backgroundColor: Colors.border, marginVertical: 4 },

  saveBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveBtnText: { fontSize: 16, fontWeight: '700', color: Colors.white },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    gap: 14,
  },
  rowPressed: { backgroundColor: Colors.surfaceHighlight },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(79,110,247,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowIconDanger: { backgroundColor: 'rgba(232,69,96,0.10)' },
  rowLabel: { flex: 1, fontSize: 15, fontWeight: '600', color: Colors.text },
});
