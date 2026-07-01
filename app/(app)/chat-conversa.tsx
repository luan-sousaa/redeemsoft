import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
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
import Animated, { FadeInUp } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors } from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/services/api';

// ─── Tipos ─────────────────────────────────────────────────────────────────────

type Message = {
  id: string;
  text: string;
  sender: 'me' | 'other';
  time: string;
};

type RawMsg = {
  idMensagem: number;
  contratoId: number;
  autorId: number;
  autorTipo: 'empresa' | 'dev';
  texto: string;
  criadoEm: string;
};

// ─── Utils ──────────────────────────────────────────────────────────────────────

function formatTime(iso: string): string {
  try {
    const d = new Date(iso.replace(' ', 'T') + 'Z');
    return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

// ─── Separador de data ──────────────────────────────────────────────────────────

function DateSeparator({ label }: { label: string }) {
  return (
    <View style={styles.dateSeparator}>
      <View style={styles.dateLine} />
      <Text style={styles.dateLabel}>{label}</Text>
      <View style={styles.dateLine} />
    </View>
  );
}

// ─── Bolha de mensagem ─────────────────────────────────────────────────────────

function MessageBubble({ message, index, avatarLetter }: { message: Message; index: number; avatarLetter: string }) {
  const isMe = message.sender === 'me';

  return (
    <Animated.View
      entering={FadeInUp.delay(index < 20 ? index * 30 : 0).duration(240)}
      style={[styles.bubbleRow, isMe ? styles.bubbleRowMe : styles.bubbleRowOther]}
    >
      {!isMe && (
        <View style={styles.avatarSmall}>
          <Text style={styles.avatarSmallText}>{avatarLetter}</Text>
        </View>
      )}

      <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleOther]}>
        <Text style={[styles.bubbleText, isMe ? styles.bubbleTextMe : styles.bubbleTextOther]}>
          {message.text}
        </Text>
        <View style={styles.bubbleMeta}>
          <Text style={[styles.bubbleTime, isMe && styles.bubbleTimeMe]}>
            {message.time}
          </Text>
          {isMe && (
            <Ionicons
              name="checkmark-done"
              size={14}
              color="rgba(255,255,255,0.5)"
              style={{ marginLeft: 3 }}
            />
          )}
        </View>
      </View>
    </Animated.View>
  );
}

// ─── Header ────────────────────────────────────────────────────────────────────

function ChatHeader({
  onBack,
  nome,
  projetoTitulo,
  projetoValor,
}: {
  onBack: () => void;
  nome: string;
  projetoTitulo: string;
  projetoValor: number;
}) {
  const iniciais = nome.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase();
  const valorFormatado = projetoValor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 });

  return (
    <View style={styles.header}>
      <Pressable onPress={onBack} style={styles.headerBack} hitSlop={12}>
        <Ionicons name="chevron-back" size={26} color={Colors.text} />
      </Pressable>

      <View style={styles.headerAvatar}>
        <Text style={styles.headerAvatarText}>{iniciais}</Text>
      </View>

      <View style={styles.headerInfo}>
        <Text style={styles.headerName} numberOfLines={1}>{nome || 'Chat'}</Text>
        {projetoTitulo ? (
          <View style={styles.projetoInfoRow}>
            <Ionicons name="briefcase-outline" size={11} color={Colors.primary} />
            <Text style={styles.projetoInfoText} numberOfLines={1}>
              {projetoTitulo} · {valorFormatado}
            </Text>
          </View>
        ) : null}
      </View>

      <View style={styles.headerAction} />
    </View>
  );
}

// ─── Barra de input ─────────────────────────────────────────────────────────────

function InputBar({
  value,
  onChangeText,
  onSend,
  disabled,
}: {
  value: string;
  onChangeText: (t: string) => void;
  onSend: () => void;
  disabled?: boolean;
}) {
  const hasText = value.trim().length > 0;

  return (
    <View style={[styles.inputBar, disabled && styles.inputBarDisabled]}>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={disabled ? 'Chat indisponível' : 'Mensagem...'}
        placeholderTextColor={Colors.textSecondary}
        multiline
        maxLength={500}
        editable={!disabled}
      />
      <Pressable
        style={[styles.sendBtn, hasText && !disabled && styles.sendBtnActive]}
        onPress={hasText && !disabled ? onSend : undefined}
        hitSlop={8}
      >
        <Ionicons
          name="send"
          size={18}
          color={hasText && !disabled ? '#FFFFFF' : Colors.textSecondary}
        />
      </Pressable>
    </View>
  );
}

// ─── Tela principal ─────────────────────────────────────────────────────────────

export default function ChatConversaScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const params = useLocalSearchParams<{
    nomeContato?: string;
    fotoContato?: string;
    projetoTitulo?: string;
    projetoValor?: string;
    contratoId?: string;
  }>();

  const nomeContato = params.nomeContato ?? 'Chat';
  const projetoTitulo = params.projetoTitulo ?? '';
  const projetoValor = Number(params.projetoValor ?? 0);
  const contratoId = params.contratoId ? Number(params.contratoId) : null;
  const avatarLetter = nomeContato.charAt(0).toUpperCase();

  const myId = Number(user?.id ?? 0);
  const autorTipo: 'dev' | 'empresa' = user?.type === 'developer' ? 'dev' : 'empresa';

  const listRef = useRef<FlatList>(null);
  const lastIdRef = useRef<number>(0);

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [sending, setSending] = useState(false);

  function rawToMessage(m: RawMsg): Message {
    return {
      id: String(m.idMensagem),
      text: m.texto,
      sender: m.autorId === myId ? 'me' : 'other',
      time: formatTime(m.criadoEm),
    };
  }

  const fetchMessages = useCallback(async () => {
    if (!contratoId) return;
    try {
      const data = await api.get<RawMsg[]>(`/contrato/${contratoId}/mensagens`);
      const novas = data.filter(m => m.idMensagem > lastIdRef.current);
      if (novas.length > 0) {
        lastIdRef.current = data[data.length - 1]?.idMensagem ?? lastIdRef.current;
        setMessages(prev => [...prev, ...novas.map(rawToMessage)]);
        setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 80);
      }
    } catch {
      // silencioso — polling continua
    }
  }, [contratoId, myId]);

  // Carga inicial + marca mensagens como lidas
  useEffect(() => {
    if (!contratoId) { setIsLoading(false); return; }
    (async () => {
      try {
        const data = await api.get<RawMsg[]>(`/contrato/${contratoId}/mensagens`);
        lastIdRef.current = data[data.length - 1]?.idMensagem ?? 0;
        setMessages(data.map(rawToMessage));
        setTimeout(() => listRef.current?.scrollToEnd({ animated: false }), 100);
        // Marca mensagens do outro lado como lidas (atualiza badge)
        api.patch(`/contrato/${contratoId}/mensagens/lidas`, {}).catch(() => {});
      } catch {
        // silencioso
      } finally {
        setIsLoading(false);
      }
    })();
  }, [contratoId]);

  // Polling a cada 5s
  useEffect(() => {
    if (!contratoId) return;
    const timer = setInterval(fetchMessages, 5000);
    return () => clearInterval(timer);
  }, [fetchMessages, contratoId]);

  async function handleSend() {
    const text = inputText.trim();
    if (!text || !contratoId || sending) return;
    setSending(true);
    setInputText('');

    const optimistic: Message = {
      id: `opt-${Date.now()}`,
      text,
      sender: 'me',
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages(prev => [...prev, optimistic]);
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 80);

    try {
      const saved = await api.post<RawMsg>(`/contrato/${contratoId}/mensagem`, {
        autorId: myId,
        autorTipo,
        texto: text,
      });
      lastIdRef.current = saved.idMensagem;
      setMessages(prev => prev.map(m => m.id === optimistic.id ? rawToMessage(saved) : m));
    } catch {
      // Mantém mensagem otimista na tela — não remove para não confundir
    } finally {
      setSending(false);
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ChatHeader
        onBack={() => router.back()}
        nome={nomeContato}
        projetoTitulo={projetoTitulo}
        projetoValor={projetoValor}
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        {isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : !contratoId ? (
          <View style={styles.center}>
            <Ionicons name="lock-closed-outline" size={48} color={Colors.textSecondary} />
            <Text style={styles.emptyTitle}>Contrato não iniciado</Text>
            <Text style={styles.emptyText}>
              Aguarde a empresa confirmar o pagamento para liberar o chat.
            </Text>
          </View>
        ) : (
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.messageList}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
            ListHeaderComponent={<DateSeparator label="Hoje" />}
            ListEmptyComponent={
              <View style={styles.center}>
                <Ionicons name="chatbubble-outline" size={48} color={Colors.textSecondary} />
                <Text style={styles.emptyText}>Nenhuma mensagem ainda. Diga olá!</Text>
              </View>
            }
            renderItem={({ item, index }) => (
              <MessageBubble message={item} index={index} avatarLetter={avatarLetter} />
            )}
          />
        )}

        <SafeAreaView edges={['bottom']} style={styles.inputSafe}>
          <InputBar
            value={inputText}
            onChangeText={setInputText}
            onSend={handleSend}
            disabled={!contratoId}
          />
        </SafeAreaView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Estilos ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  flex: { flex: 1 },

  center: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    gap: 12, paddingHorizontal: 32,
  },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: Colors.text, textAlign: 'center' },
  emptyText: { fontSize: 13, color: Colors.textSecondary, textAlign: 'center', lineHeight: 20 },

  // ── Header
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 12, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
    backgroundColor: Colors.background, gap: 10,
  },
  headerBack: { padding: 4 },
  headerAvatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  headerAvatarText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  headerInfo: { flex: 1, gap: 2 },
  headerName: { color: Colors.text, fontSize: 16, fontWeight: '700' },
  headerAction: { width: 36 },
  projetoInfoRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  projetoInfoText: { color: Colors.primary, fontSize: 12, fontWeight: '600', flex: 1 },

  // ── Lista
  messageList: {
    paddingHorizontal: 14, paddingTop: 16, paddingBottom: 8, gap: 6, flexGrow: 1,
  },

  // ── Separador de data
  dateSeparator: {
    flexDirection: 'row', alignItems: 'center', marginVertical: 12, gap: 8,
  },
  dateLine: { flex: 1, height: 1, backgroundColor: Colors.surfaceHighlight },
  dateLabel: { color: Colors.textSecondary, fontSize: 12, fontWeight: '500' },

  // ── Bolhas
  bubbleRow: {
    flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginVertical: 3,
  },
  bubbleRowMe: { justifyContent: 'flex-end' },
  bubbleRowOther: { justifyContent: 'flex-start' },
  avatarSmall: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: Colors.surfaceHighlight,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  avatarSmallText: { color: Colors.textSecondary, fontSize: 13, fontWeight: '700' },
  bubble: {
    maxWidth: '75%', paddingVertical: 9, paddingHorizontal: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15, shadowRadius: 3, elevation: 2,
  },
  bubbleMe: { backgroundColor: Colors.primary, borderRadius: 18, borderBottomRightRadius: 4 },
  bubbleOther: { backgroundColor: Colors.surfaceHighlight, borderRadius: 18, borderBottomLeftRadius: 4 },
  bubbleText: { fontSize: 15, lineHeight: 22 },
  bubbleTextMe: { color: '#FFFFFF' },
  bubbleTextOther: { color: Colors.text },
  bubbleMeta: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginTop: 4, gap: 2,
  },
  bubbleTime: { fontSize: 11, color: Colors.textSecondary },
  bubbleTimeMe: { color: 'rgba(255,255,255,0.6)' },

  // ── Input
  inputSafe: { backgroundColor: Colors.background },
  inputBar: {
    flexDirection: 'row', alignItems: 'flex-end',
    paddingHorizontal: 12, paddingVertical: 10,
    borderTopWidth: 1, borderTopColor: Colors.border, gap: 10,
  },
  inputBarDisabled: { opacity: 0.5 },
  input: {
    flex: 1, backgroundColor: Colors.surface, borderRadius: 24,
    paddingHorizontal: 16, paddingTop: 10, paddingBottom: 10,
    fontSize: 15, color: Colors.text, maxHeight: 110,
    borderWidth: 1, borderColor: Colors.border,
  },
  sendBtn: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.surfaceHighlight,
  },
  sendBtnActive: {
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4, shadowRadius: 6, elevation: 4,
  },
});
