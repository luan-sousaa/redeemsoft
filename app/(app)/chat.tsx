// chat.tsx
// Chat entre empresa e desenvolvedor para um contrato ativo.
// Regras de negócio:
//   - Chat só está disponível após pagamento retido (statusPagamento = 'retido' | 'liberado')
//   - Empresa e dev podem confirmar entrega independentemente
//   - Quando ambos confirmam: pagamento fica "liberado", projeto = "concluido"
//   - Polling a cada 10 s para novas mensagens (intervalo limpo no unmount)
//   - Optimistic update: mensagem aparece imediatamente na lista local

import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

import { Colors } from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { authService, type Contrato, type Mensagem } from '@/services/authService';

// ─── Utilitários ──────────────────────────────────────────────────────────────

function formatHora(iso: string): string {
  try {
    const d = new Date(iso);
    const agora = new Date();
    const diffMin = Math.floor((agora.getTime() - d.getTime()) / 60000);

    if (diffMin < 1) return 'Agora';
    if (diffMin < 60) return `há ${diffMin} min`;

    const hora = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const hoje = agora.toDateString();
    const ontem = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate() - 1).toDateString();

    if (d.toDateString() === hoje) return hora;
    if (d.toDateString() === ontem) return `Ontem ${hora}`;

    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  } catch {
    return '';
  }
}

// ─── Bolha de mensagem ────────────────────────────────────────────────────────

function MsgBubble({ msg, isOwn }: { msg: Mensagem; isOwn: boolean }) {
  return (
    <View style={[styles.bubbleWrap, isOwn ? styles.bubbleWrapRight : styles.bubbleWrapLeft]}>
      <View style={[styles.bubble, isOwn ? styles.bubbleOwn : styles.bubbleOther]}>
        <Text style={[styles.bubbleText, isOwn ? styles.bubbleTextOwn : styles.bubbleTextOther]}>
          {msg.texto}
        </Text>
        <Text style={[styles.bubbleTime, isOwn ? styles.bubbleTimeOwn : styles.bubbleTimeOther]}>
          {formatHora(msg.criadoEm)}
        </Text>
      </View>
    </View>
  );
}

// ─── Tela principal ───────────────────────────────────────────────────────────

export default function ChatScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const params = useLocalSearchParams<{
    contratoId: string;
    projetoNome?: string;
    devNome?: string;
  }>();

  const contratoId = params.contratoId;
  const userTipo: 'empresa' | 'dev' = user?.type === 'client' ? 'empresa' : 'dev';

  const [contrato, setContrato] = useState<Contrato | null>(null);
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [texto, setTexto] = useState('');
  const [isLoadingInit, setIsLoadingInit] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isConfirmando, setIsConfirmando] = useState(false);

  const listRef = useRef<FlatList>(null);
  const isNavigating = useRef(false);

  // ─── Carrega contrato ───────────────────────────────────────────────────────
  const carregarContrato = useCallback(async () => {
    if (!contratoId) return;
    try {
      const c = await authService.getContratoById(contratoId);
      setContrato(c);
    } catch {
      // silencia — pode tentar novamente no próximo poll
    }
  }, [contratoId]);

  // ─── Carrega mensagens ──────────────────────────────────────────────────────
  const carregarMensagens = useCallback(async () => {
    if (!contratoId) return;
    try {
      const msgs = await authService.getMensagens(contratoId);
      setMensagens(msgs);
    } catch {
      // silencia
    }
  }, [contratoId]);

  // Mount: carrega tudo e inicia polling
  useEffect(() => {
    async function init() {
      await Promise.all([carregarContrato(), carregarMensagens()]);
      setIsLoadingInit(false);
    }
    init();

    // Poll a cada 10 s para novas mensagens e status do contrato
    const timer = setInterval(() => {
      carregarMensagens();
      carregarContrato();
    }, 10_000);
    return () => clearInterval(timer);
  }, [carregarContrato, carregarMensagens]);

  // Scrolla para o fim quando mensagens são atualizadas
  useEffect(() => {
    if (mensagens.length > 0) {
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [mensagens.length]);

  // ─── Enviar mensagem ────────────────────────────────────────────────────────
  async function handleEnviar() {
    const txt = texto.trim();
    if (!txt || !user || isSending) return;

    // Optimistic update — aparece imediatamente
    const tempMsg: Mensagem = {
      id: Date.now(),
      contratoId: Number(contratoId),
      autorId: Number(user.id),
      autorTipo: userTipo,
      texto: txt,
      criadoEm: new Date().toISOString(),
    };
    setMensagens((prev) => [...prev, tempMsg]);
    setTexto('');
    setIsSending(true);

    try {
      const salva = await authService.enviarMensagem(contratoId, Number(user.id), userTipo, txt);
      // Substitui o temp pela mensagem real do servidor
      setMensagens((prev) => prev.map((m) => (m.id === tempMsg.id ? salva : m)));
    } catch {
      // Reverte optimistic update em caso de erro
      setMensagens((prev) => prev.filter((m) => m.id !== tempMsg.id));
      Toast.show({ type: 'error', text1: 'Erro ao enviar mensagem. Tente novamente.' });
    } finally {
      setIsSending(false);
    }
  }

  // ─── Confirmar entrega ──────────────────────────────────────────────────────
  async function handleConfirmarEntrega() {
    if (isConfirmando || !contratoId) return;
    setIsConfirmando(true);
    try {
      const { contrato: atualizado, ambosConfirmaram } = await authService.confirmarEntregaContrato(contratoId, userTipo);
      setContrato(atualizado);
      if (ambosConfirmaram) {
        Toast.show({
          type: 'success',
          text1: 'Entrega confirmada!',
          text2: 'Pagamento liberado para o desenvolvedor.',
        });
      } else {
        Toast.show({
          type: 'success',
          text1: 'Confirmação registrada',
          text2: 'Aguardando confirmação da outra parte.',
        });
      }
    } catch {
      Toast.show({ type: 'error', text1: 'Erro ao confirmar entrega. Tente novamente.' });
    } finally {
      setIsConfirmando(false);
    }
  }

  // ─── Estado do botão confirmar ──────────────────────────────────────────────
  const jáConfirmou = contrato
    ? (userTipo === 'empresa' ? contrato.confirmaEmpresa === 1 : contrato.confirmaDev === 1)
    : false;

  const statusPagamento = contrato?.statusPagamento ?? 'retido';
  const mostrarConfirmar = statusPagamento === 'retido'; // esconde após liberado

  // ─── Cabeçalho dinâmico ─────────────────────────────────────────────────────
  const nomeContraparte = userTipo === 'empresa'
    ? (contrato?.nomeDev ?? params.devNome ?? 'Desenvolvedor')
    : (contrato?.nomeEmpresa ?? 'Empresa');
  const tituloProjeto = contrato?.tituloProjeto ?? params.projetoNome ?? 'Projeto';

  if (isLoadingInit) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => {
          if (isNavigating.current) return;
          isNavigating.current = true;
          router.back();
        }}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle} numberOfLines={1}>{tituloProjeto}</Text>
          <Text style={styles.headerSub} numberOfLines={1}>{nomeContraparte}</Text>
        </View>
        {/* Badge de status */}
        <View style={[styles.statusBadge, statusPagamento === 'liberado' ? styles.badgeLiberado : styles.badgeRetido]}>
          <Text style={[styles.statusText, statusPagamento === 'liberado' ? styles.textLiberado : styles.textRetido]}>
            {statusPagamento === 'liberado' ? 'Concluído' : 'Em andamento'}
          </Text>
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        {/* Lista de mensagens */}
        <FlatList
          ref={listRef}
          data={mensagens}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.lista}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyChat}>
              <Ionicons name="chatbubbles-outline" size={48} color={Colors.surfaceHighlight} />
              <Text style={styles.emptyChatText}>Nenhuma mensagem ainda. Diga olá!</Text>
            </View>
          }
          renderItem={({ item }) => (
            <MsgBubble
              msg={item}
              isOwn={item.autorId === Number(user?.id)}
            />
          )}
        />

        {/* Área inferior: confirmar entrega + input */}
        <SafeAreaView edges={['bottom']} style={styles.inputArea}>
          {/* Botão confirmar entrega */}
          {mostrarConfirmar && (
            <Pressable
              style={[styles.confirmarBtn, jáConfirmou && styles.confirmarBtnDisabled]}
              onPress={jáConfirmou ? undefined : handleConfirmarEntrega}
              disabled={jáConfirmou || isConfirmando}
            >
              {isConfirmando ? (
                <ActivityIndicator size="small" color={Colors.text} />
              ) : (
                <>
                  <Ionicons
                    name={jáConfirmou ? 'time-outline' : 'checkmark-done-outline'}
                    size={16}
                    color={jáConfirmou ? Colors.textSecondary : Colors.text}
                  />
                  <Text style={[styles.confirmarText, jáConfirmou && styles.confirmarTextDisabled]}>
                    {jáConfirmou ? 'Aguardando confirmação da outra parte...' : 'Confirmar Entrega'}
                  </Text>
                </>
              )}
            </Pressable>
          )}

          {/* Input de mensagem */}
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="Digite uma mensagem..."
              placeholderTextColor={Colors.textSecondary}
              value={texto}
              onChangeText={setTexto}
              multiline
              maxLength={1000}
              returnKeyType="default"
            />
            <Pressable
              style={[styles.sendBtn, (!texto.trim() || isSending) && styles.sendBtnDisabled]}
              onPress={handleEnviar}
              disabled={!texto.trim() || isSending}
            >
              {isSending ? (
                <ActivityIndicator size="small" color={Colors.text} />
              ) : (
                <Ionicons name="send" size={18} color={Colors.text} />
              )}
            </Pressable>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
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
    gap: 12,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 15, fontWeight: '700', color: Colors.text },
  headerSub: { fontSize: 12, color: Colors.textSecondary, marginTop: 1 },
  statusBadge: {
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'center',
  },
  badgeRetido:  { backgroundColor: 'rgba(245,166,35,0.12)' },
  badgeLiberado:{ backgroundColor: 'rgba(76,175,80,0.12)' },
  statusText: { fontSize: 11, fontWeight: '700' },
  textRetido:   { color: '#F5A623' },
  textLiberado: { color: '#4CAF50' },

  lista: { padding: 16, paddingBottom: 8, gap: 4 },

  emptyChat: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyChatText: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center' },

  // Bubbles
  bubbleWrap: { marginVertical: 2 },
  bubbleWrapRight: { alignItems: 'flex-end' },
  bubbleWrapLeft:  { alignItems: 'flex-start' },
  bubble: {
    maxWidth: '78%',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 4,
  },
  bubbleOwn:   { backgroundColor: Colors.primary, borderBottomRightRadius: 4 },
  bubbleOther: { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderBottomLeftRadius: 4 },
  bubbleText: { fontSize: 14, lineHeight: 20 },
  bubbleTextOwn:   { color: Colors.text },
  bubbleTextOther: { color: Colors.text },
  bubbleTime: { fontSize: 10, alignSelf: 'flex-end' },
  bubbleTimeOwn:   { color: 'rgba(255,255,255,0.6)' },
  bubbleTimeOther: { color: Colors.textSecondary },

  // Área inferior
  inputArea: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.background,
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 8,
    gap: 8,
  },

  // Confirmar entrega
  confirmarBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: Colors.surfaceHighlight,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  confirmarBtnDisabled: {
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  confirmarText: { fontSize: 13, fontWeight: '700', color: Colors.text },
  confirmarTextDisabled: { color: Colors.textSecondary },

  // Input row
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: Colors.text,
    fontSize: 14,
    maxHeight: 100,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: { backgroundColor: Colors.surfaceHighlight },
});
