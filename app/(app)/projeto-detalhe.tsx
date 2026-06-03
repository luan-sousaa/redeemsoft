import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { Colors } from '@/constants/colors';
import { authService } from '@/services/authService';
import { useAuth } from '@/contexts/AuthContext';
// ─── Campo somente-leitura (estilo do protótipo) ──────────────────────────────

function ReadonlyField({
  label,
  value,
  placeholder,
  multiline,
  isLink,
}: {
  label: string;
  value?: string;
  placeholder?: string;
  multiline?: boolean;
  isLink?: boolean;
}) {
  function handlePress() {
    if (isLink && value) {
      const url = value.startsWith('http') ? value : `https://${value}`;
      Linking.openURL(url).catch(() =>
        Toast.show({ type: 'error', text1: 'Não foi possível abrir o link.' })
      );
    }
  }

  return (
    <View style={styles.fieldWrapper}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Pressable
        style={[styles.fieldBox, multiline && styles.fieldBoxMultiline]}
        onPress={isLink ? handlePress : undefined}
      >
        {value ? (
          <Text
            style={[
              styles.fieldValue,
              isLink && styles.fieldValueLink,
            ]}
            numberOfLines={multiline ? undefined : 1}
          >
            {value}
          </Text>
        ) : (
          <Text style={styles.fieldPlaceholder}>{placeholder}</Text>
        )}
        {isLink && value ? (
          <Ionicons name="open-outline" size={14} color={Colors.primary} />
        ) : null}
      </Pressable>
    </View>
  );
}

// ─── Tela de detalhe ──────────────────────────────────────────────────────────

export default function ProjetoDetalheScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    id: string;
    titulo: string;
    descricao: string;
    preco: string;
    prazo: string;
    stack: string;
    modalidades: string;
    linkRepositorio?: string;
  }>();
  const { user } = useAuth();

  const [candidatando, setCandidatando] = useState(false);
  const [aceito, setAceito] = useState(false);

  // Check on mount whether the developer already applied
  useEffect(() => {
    async function checkCandidatura() {
      if (!params.id || !user?.idUsuario) return;
      try {
        const resultado = await authService.jaCandidatou(params.id, user.idUsuario);
        setAceito(resultado);
      } catch {
        setAceito(false);
      }
    }

    checkCandidatura();
  }, [params.id, user?.idUsuario]);

  const precoFormatado = params.preco
    ? Number(params.preco).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 0,
      })
    : 'R$ 0';

  const modalidades: string[] = params.modalidades
    ? JSON.parse(params.modalidades)
    : [];

  const modalidadeLabel: Record<string, string> = {
    P: 'Presencial',
    SP: 'Semi-presencial',
    H: 'Home Office',
  };

  async function handleAceitarProjeto() {
    setCandidatando(true);
    try {
      await authService.candidatar({
        idUsuario: user!.idUsuario,
        projetoId: params.id,
        titulo: params.titulo,
        stack: params.stack ?? '',
        preco: Number(params.preco ?? 0),
        prazo: params.prazo ?? '',
      });
      setAceito(true);
      Toast.show({
        type: 'success',
        text1: 'Candidatura enviada!',
        text2: 'A empresa receberá sua proposta em breve.',
      });
      setTimeout(() => router.back(), 1500);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao enviar candidatura.';
      Toast.show({ type: 'error', text1: message });
    } finally {
      setCandidatando(false);
    }
  }

  function handleChat() {
    Toast.show({
      type: 'info',
      text1: 'Chat',
      text2: 'Funcionalidade em breve.',
    });
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* ── Header ── */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Pressable onPress={() => router.back()} style={styles.backBtn}>
              <Ionicons name="arrow-back-circle-outline" size={30} color={Colors.text} />
            </Pressable>
            <Text style={styles.titulo} numberOfLines={2}>
              {params.titulo}
            </Text>
          </View>

          <View style={styles.orcamentoBox}>
            <Text style={styles.orcamentoLabel}>Orçamento:</Text>
            <Text style={styles.orcamentoValue}>{precoFormatado}</Text>
          </View>
        </View>

        {/* ── Conteúdo ── */}
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Modalidades */}
          {modalidades.length > 0 && (
            <View style={styles.modalidadesRow}>
              {modalidades.map((m) => (
                <View key={m} style={styles.modalidadeChip}>
                  <Text style={styles.modalidadeChipText}>
                    {modalidadeLabel[m] ?? m}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Descrição */}
          <ReadonlyField
            label="descrição:"
            value={params.descricao}
            placeholder="Sem descrição"
            multiline
          />

          {/* Tecnologias */}
          <ReadonlyField
            label="tecnologias usadas no projeto:"
            value={params.stack}
            placeholder="Não informado"
            multiline
          />

          {/* Link repositório */}
          <ReadonlyField
            label="Link repositório:"
            value={params.linkRepositorio}
            placeholder="Link"
            isLink
          />

          {/* Data de entrega */}
          <ReadonlyField
            label="Data de entrega:"
            value={params.prazo}
            placeholder="00/00/0000"
          />

          {/* Botão Chat */}
          <View style={styles.chatRow}>
            <Pressable style={styles.chatBtn} onPress={handleChat}>
              <Ionicons name="chatbubble-outline" size={16} color={Colors.text} />
              <Text style={styles.chatBtnText}>chat</Text>
            </Pressable>
          </View>

          {/* Botão Aceitar Projeto */}
          <Pressable
            style={[styles.aceitarBtn, (candidatando || aceito) && styles.aceitarBtnDisabled]}
            onPress={handleAceitarProjeto}
            disabled={candidatando || aceito}
          >
            {candidatando ? (
              <Text style={styles.aceitarBtnText}>Enviando...</Text>
            ) : aceito ? (
              <>
                <Ionicons name="checkmark-circle" size={20} color={Colors.text} />
                <Text style={styles.aceitarBtnText}>Candidatura enviada</Text>
              </>
            ) : (
              <Text style={styles.aceitarBtnText}>Aceitar Projeto</Text>
            )}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  flex: { flex: 1 },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  backBtn: {
    marginTop: 2,
  },
  titulo: {
    flex: 1,
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
    lineHeight: 28,
  },
  orcamentoBox: {
    alignItems: 'flex-end',
    paddingTop: 4,
  },
  orcamentoLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '500',
    marginBottom: 4,
  },
  orcamentoValue: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
    overflow: 'hidden',
  },

  // Scroll
  scroll: {
    padding: 20,
    paddingBottom: 48,
    gap: 20,
  },

  // Chips de modalidade
  modalidadesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  modalidadeChip: {
    backgroundColor: Colors.surfaceHighlight,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modalidadeChipText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600',
  },

  // Campo
  fieldWrapper: {
    gap: 8,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  fieldBox: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  fieldBoxMultiline: {
    minHeight: 90,
    alignItems: 'flex-start',
  },
  fieldValue: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
    lineHeight: 22,
  },
  fieldValueLink: {
    color: Colors.primary,
    textDecorationLine: 'underline',
  },
  fieldPlaceholder: {
    fontSize: 14,
    color: Colors.textSecondary,
  },

  // Chat
  chatRow: {
    alignItems: 'center',
    marginTop: 4,
  },
  chatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.surface,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingHorizontal: 28,
    paddingVertical: 10,
  },
  chatBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },

  // Aceitar
  aceitarBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    borderRadius: 28,
    height: 56,
    paddingHorizontal: 24,
  },
  aceitarBtnDisabled: {
    opacity: 0.6,
  },
  aceitarBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
});
