import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
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
import { Input } from '@/components/ui/Input';
import { Colors } from '@/constants/colors';
import { authService } from '@/services/authService';

type Modalidade = 'P' | 'SP' | 'H';

const MODALIDADES: { key: Modalidade; label: string; desc: string }[] = [
  { key: 'P', label: 'P', desc: 'Presencial' },
  { key: 'SP', label: 'SP', desc: 'Semi-presencial' },
  { key: 'H', label: 'H', desc: 'Home Office' },
];

export default function CriarProjetoScreen() {
  const router = useRouter();

  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [orcamento, setOrcamento] = useState('');
  const [prazo, setPrazo] = useState('');
  const [stack, setStack] = useState('');
  const [modalidades, setModalidades] = useState<Modalidade[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  type Errors = { titulo?: string; descricao?: string; orcamento?: string; prazo?: string; stack?: string; modalidades?: string };
  const [errors, setErrors] = useState<Errors>({});

  function toggleModalidade(m: Modalidade) {
    setModalidades((prev) =>
      prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]
    );
  }

  function validate(): boolean {
    const e: Errors = {};
    if (!titulo.trim()) e.titulo = 'Título é obrigatório';
    if (!descricao.trim() || descricao.trim().length < 20) e.descricao = 'Descreva o projeto com pelo menos 20 caracteres';
    const orc = Number(orcamento.replace(/\D/g, ''));
    if (!orcamento || orc <= 0) e.orcamento = 'Informe um orçamento válido';
    if (!prazo.trim()) e.prazo = 'Informe o prazo estimado';
    if (!stack.trim()) e.stack = 'Informe a stack envolvida';
    if (modalidades.length === 0) e.modalidades = 'Selecione ao menos uma modalidade';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleCriar() {
    setHasSubmitted(true);
    if (!validate()) return;

    setIsLoading(true);
    try {
      await authService.criarProjeto({
        titulo: titulo.trim(),
        descricao: descricao.trim(),
        orcamento: Number(orcamento.replace(/\D/g, '')),
        prazo: prazo.trim(),
        stack: stack.trim(),
        modalidades,
      });
      Toast.show({
        type: 'success',
        text1: 'Projeto publicado!',
        text2: 'Seu projeto já está visível no marketplace.',
      });
      router.back();
    } catch {
      Toast.show({ type: 'error', text1: 'Erro ao publicar', text2: 'Tente novamente.' });
    } finally {
      setIsLoading(false);
    }
  }

  const e = hasSubmitted ? errors : {};

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </Pressable>
          <Text style={styles.headerTitle}>Novo Projeto</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Seção: Informações básicas */}
          <Text style={styles.sectionTitle}>Informações do projeto</Text>

          <Input
            label="Título do projeto"
            value={titulo}
            onChangeText={setTitulo}
            placeholder="Ex: Migração de ERP legado em Delphi"
            error={e.titulo}
          />

          {/* Descrição manual (Input não suporta multiline bem) */}
          <View style={styles.textAreaWrapper}>
            <Text style={styles.inputLabel}>Descrição</Text>
            <View style={[
              styles.textAreaContainer,
              e.descricao ? { borderColor: Colors.error } : {},
            ]}>
              <TextInput
                style={styles.textArea}
                value={descricao}
                onChangeText={setDescricao}
                placeholder="Descreva o problema, o sistema atual, o que precisa ser feito e o contexto do negócio..."
                placeholderTextColor={Colors.textSecondary}
                multiline
                numberOfLines={5}
                textAlignVertical="top"
                selectionColor={Colors.primary}
              />
            </View>
            {e.descricao && <Text style={styles.errorText}>{e.descricao}</Text>}
          </View>

          {/* Orçamento e Prazo lado a lado */}
          <View style={styles.row}>
            <View style={styles.rowItem}>
              <Input
                label="Orçamento (R$)"
                value={orcamento}
                onChangeText={(v) => setOrcamento(v.replace(/\D/g, ''))}
                placeholder="Ex: 8000"
                keyboardType="numeric"
                error={e.orcamento}
              />
            </View>
            <View style={styles.rowItem}>
              <Input
                label="Prazo estimado"
                value={prazo}
                onChangeText={setPrazo}
                placeholder="Ex: 30 dias"
                error={e.prazo}
              />
            </View>
          </View>

          <Input
            label="Stack / Tecnologias"
            value={stack}
            onChangeText={setStack}
            placeholder="Ex: Delphi → Node.js + React"
            error={e.stack}
          />

          {/* Modalidade */}
          <Text style={styles.inputLabel}>Modalidade de trabalho</Text>
          <View style={styles.chipsRow}>
            {MODALIDADES.map((m) => {
              const ativo = modalidades.includes(m.key);
              return (
                <Pressable
                  key={m.key}
                  style={[styles.chip, ativo && styles.chipAtivo]}
                  onPress={() => toggleModalidade(m.key)}
                >
                  <Text style={[styles.chipLabel, ativo && styles.chipLabelAtivo]}>{m.label}</Text>
                  <Text style={[styles.chipDesc, ativo && styles.chipDescAtivo]}>{m.desc}</Text>
                </Pressable>
              );
            })}
          </View>
          {e.modalidades && <Text style={styles.errorText}>{e.modalidades}</Text>}

          {/* Dica */}
          <View style={styles.dica}>
            <Ionicons name="information-circle-outline" size={16} color={Colors.primary} />
            <Text style={styles.dicaText}>
              Após publicar, desenvolvedores poderão se candidatar. Você verá as propostas em "Meus Projetos".
            </Text>
          </View>

          <Button
            title="Publicar Projeto"
            onPress={handleCriar}
            isLoading={isLoading}
          />
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
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, fontSize: 18, fontWeight: '800', color: Colors.text, textAlign: 'center' },

  scroll: { padding: 24, paddingBottom: 48 },

  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 16,
  },

  inputLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
    marginBottom: 8,
  },

  textAreaWrapper: { width: '100%', marginBottom: 16 },
  textAreaContainer: {
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 120,
  },
  textArea: {
    fontSize: 15,
    color: Colors.text,
    lineHeight: 22,
    minHeight: 100,
  },
  errorText: {
    fontSize: 12,
    color: Colors.error,
    marginTop: 4,
  },

  row: { flexDirection: 'row', gap: 12 },
  rowItem: { flex: 1 },

  chipsRow: { flexDirection: 'row', gap: 10, marginBottom: 8, flexWrap: 'wrap' },
  chip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    gap: 4,
    minWidth: 80,
  },
  chipAtivo: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textSecondary,
  },
  chipLabelAtivo: { color: Colors.text },
  chipDesc: {
    fontSize: 10,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  chipDescAtivo: { color: 'rgba(255,255,255,0.8)' },

  dica: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: Colors.surface,
    borderRadius: 10,
    padding: 14,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'flex-start',
  },
  dicaText: {
    flex: 1,
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
});
