import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
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
import Head from 'expo-router/head';
import { Colors } from '@/constants/colors';

// ─── Tipos ─────────────────────────────────────────────────────────────────────

type Message = {
  id: string;
  text: string;
  sender: 'me' | 'other';
  time: string;
  status?: 'sent' | 'read';
};

// ─── Dados mock ────────────────────────────────────────────────────────────────

const MESSAGES_MOCK: Message[] = [
  { id: '1', text: 'Oi! Vi sua candidatura pro projeto de app mobile 👋', sender: 'other', time: '14:02' },
  { id: '2', text: 'Oi João! Sim, tenho experiência justamente com React Native', sender: 'me', time: '14:03', status: 'read' },
  { id: '3', text: 'Que ótimo. Você conseguiria começar semana que vem?', sender: 'other', time: '14:04' },
  { id: '4', text: 'Sim, consigo! Qual seria a stack completa?', sender: 'me', time: '14:05', status: 'read' },
  { id: '5', text: 'React Native + Node.js no backend. Temos um prazo de 3 meses', sender: 'other', time: '14:07' },
  { id: '6', text: 'Perfeito, estou disponível. Podemos agendar uma call para alinhar os detalhes?', sender: 'me', time: '14:08', status: 'read' },
  { id: '7', text: 'Claro! Que tal amanhã às 14h?', sender: 'other', time: '14:09' },
  { id: '8', text: 'Combinado! Te mando o link do Meet agora 🙌', sender: 'me', time: '14:10', status: 'sent' },
];

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

function MessageBubble({ message, index }: { message: Message; index: number }) {
  const isMe = message.sender === 'me';

  return (
    <Animated.View
      entering={FadeInUp.delay(index * 40).duration(280)}
      style={[styles.bubbleRow, isMe ? styles.bubbleRowMe : styles.bubbleRowOther]}
    >
      {!isMe && (
        <View style={styles.avatarSmall}>
          <Text style={styles.avatarSmallText}>J</Text>
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
              name={message.status === 'read' ? 'checkmark-done' : 'checkmark'}
              size={14}
              color={message.status === 'read' ? '#A8C8FF' : 'rgba(255,255,255,0.5)'}
              style={{ marginLeft: 3 }}
            />
          )}
        </View>
      </View>
    </Animated.View>
  );
}

// ─── Header ────────────────────────────────────────────────────────────────────

function ChatHeader({ onBack }: { onBack: () => void }) {
  return (
    <View style={styles.header}>
      <Pressable onPress={onBack} style={styles.headerBack} hitSlop={12}>
        <Ionicons name="chevron-back" size={26} color={Colors.text} />
      </Pressable>

      <View style={styles.headerAvatar}>
        <Text style={styles.headerAvatarText}>JM</Text>
      </View>

      <View style={styles.headerInfo}>
        <Text style={styles.headerName}>João Mendes</Text>
        <View style={styles.headerStatus}>
          <View style={styles.onlineDot} />
          <Text style={styles.headerStatusText}>online</Text>
        </View>
      </View>

      <Pressable style={styles.headerAction} hitSlop={12}>
        <Ionicons name="call-outline" size={22} color={Colors.textSecondary} />
      </Pressable>

      <Pressable style={styles.headerAction} hitSlop={12}>
        <Ionicons name="ellipsis-vertical" size={20} color={Colors.textSecondary} />
      </Pressable>
    </View>
  );
}

// ─── Barra de input ─────────────────────────────────────────────────────────────

function InputBar({
  value,
  onChangeText,
  onSend,
}: {
  value: string;
  onChangeText: (t: string) => void;
  onSend: () => void;
}) {
  const hasText = value.trim().length > 0;

  return (
    <View style={styles.inputBar}>
      <Pressable style={styles.inputBarIcon} hitSlop={10}>
        <Ionicons name="happy-outline" size={24} color={Colors.textSecondary} />
      </Pressable>

      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder="Mensagem..."
        placeholderTextColor={Colors.textSecondary}
        multiline
        maxLength={500}
      />

      {!hasText ? (
        <Pressable style={styles.inputBarIcon} hitSlop={10}>
          <Ionicons name="attach-outline" size={24} color={Colors.textSecondary} />
        </Pressable>
      ) : null}

      <Pressable
        style={[styles.sendBtn, hasText && styles.sendBtnActive]}
        onPress={hasText ? onSend : undefined}
        hitSlop={8}
      >
        <Ionicons
          name="send"
          size={18}
          color={hasText ? '#FFFFFF' : Colors.textSecondary}
        />
      </Pressable>
    </View>
  );
}

// ─── Tela principal ─────────────────────────────────────────────────────────────

export default function ChatConversaScreen() {
  const router = useRouter();
  const listRef = useRef<FlatList>(null);
  const [messages, setMessages] = useState<Message[]>(MESSAGES_MOCK);
  const [inputText, setInputText] = useState('');

  function handleSend() {
    const text = inputText.trim();
    if (!text) return;

    const newMsg: Message = {
      id: String(Date.now()),
      text,
      sender: 'me',
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      status: 'sent',
    };

    setMessages(prev => [...prev, newMsg]);
    setInputText('');
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 80);
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>

       <Head>
                    <title> Chat | RedeemSoft</title>
                    <meta name="description" content="Veja suas candidaturas no RedeemSoft" />
                  </Head>
      <ChatHeader onBack={() => router.back()} />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.messageList}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
          ListHeaderComponent={<DateSeparator label="Hoje" />}
          renderItem={({ item, index }) => (
            <MessageBubble message={item} index={index} />
          )}
        />

        <SafeAreaView edges={['bottom']} style={styles.inputSafe}>
          <InputBar
            value={inputText}
            onChangeText={setInputText}
            onSend={handleSend}
          />
        </SafeAreaView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Estilos ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  flex: {
    flex: 1,
  },

  // ── Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.background,
    gap: 10,
  },
  headerBack: {
    padding: 4,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerAvatarText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  headerInfo: {
    flex: 1,
    gap: 2,
  },
  headerName: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  headerStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#4ADE80',
  },
  headerStatusText: {
    color: '#4ADE80',
    fontSize: 12,
    fontWeight: '500',
  },
  headerAction: {
    padding: 6,
  },

  // ── Lista de mensagens
  messageList: {
    paddingHorizontal: 14,
    paddingTop: 16,
    paddingBottom: 8,
    gap: 6,
  },

  // ── Separador de data
  dateSeparator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
    gap: 8,
  },
  dateLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.surfaceHighlight,
  },
  dateLabel: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '500',
  },

  // ── Bolhas
  bubbleRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    marginVertical: 3,
  },
  bubbleRowMe: {
    justifyContent: 'flex-end',
  },
  bubbleRowOther: {
    justifyContent: 'flex-start',
  },
  avatarSmall: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.surfaceHighlight,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarSmallText: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '700',
  },
  bubble: {
    maxWidth: '75%',
    paddingVertical: 9,
    paddingHorizontal: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  bubbleMe: {
    backgroundColor: Colors.primary,
    borderRadius: 18,
    borderBottomRightRadius: 4,
  },
  bubbleOther: {
    backgroundColor: Colors.surfaceHighlight,
    borderRadius: 18,
    borderBottomLeftRadius: 4,
  },
  bubbleText: {
    fontSize: 15,
    lineHeight: 22,
  },
  bubbleTextMe: {
    color: '#FFFFFF',
  },
  bubbleTextOther: {
    color: Colors.text,
  },
  bubbleMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
    gap: 2,
  },
  bubbleTime: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  bubbleTimeMe: {
    color: 'rgba(255,255,255,0.6)',
  },

  // ── Input
  inputSafe: {
    backgroundColor: Colors.background,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: 10,
  },
  inputBarIcon: {
    paddingBottom: 6,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    fontSize: 15,
    color: Colors.text,
    maxHeight: 110,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceHighlight,
  },
  sendBtnActive: {
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 4,
  },
});
