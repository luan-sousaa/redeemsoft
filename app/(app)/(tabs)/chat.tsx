import { Ionicons } from '@expo/vector-icons';
import { useRouter, type Href } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors } from '@/constants/colors';
import { api } from '@/services/api';

// ─── Tipos ────────────────────────────────────────────────────────────────────

type Conversa = {
  id: string;
  nomeContato: string;
  fotoContato: string | null;
  projetoTitulo: string;
  projetoValor: number;
  tipo: 'dev' | 'empresa';
  contratoId: number | null;
};

// ─── Avatar ───────────────────────────────────────────────────────────────────

function AvatarConversa({ nome, foto }: { nome: string; foto: string | null }) {
  if (foto) {
    return <Image source={{ uri: foto }} style={styles.avatar} />;
  }
  // Cor gerada pelo nome
  const colors = ['#6C63FF', '#E84560', '#F5A623', '#4CAF50', '#00BCD4', '#9C27B0'];
  const idx = nome.charCodeAt(0) % colors.length;
  return (
    <View style={[styles.avatar, { backgroundColor: colors[idx] }]}>
      <Text style={styles.avatarLetter}>{nome.charAt(0).toUpperCase()}</Text>
    </View>
  );
}

// ─── Card de conversa ─────────────────────────────────────────────────────────

function ConversaCard({ conversa, onPress }: { conversa: Conversa; onPress: () => void }) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <AvatarConversa nome={conversa.nomeContato} foto={conversa.fotoContato} />

      <View style={styles.cardContent}>
        <View style={styles.cardTopRow}>
          <Text style={styles.nomeContato} numberOfLines={1}>{conversa.nomeContato}</Text>
          <View style={styles.valorTag}>
            <Text style={styles.valorText}>
              {conversa.projetoValor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 })}
            </Text>
          </View>
        </View>

        <View style={styles.projetoRow}>
          <Ionicons name="briefcase-outline" size={12} color={Colors.primary} />
          <Text style={styles.projetoTitulo} numberOfLines={1}>{conversa.projetoTitulo}</Text>
        </View>

        <Text style={styles.ultimaMensagem} numberOfLines={1}>
          Toque para abrir o chat
        </Text>
      </View>

      <Ionicons name="chevron-forward" size={18} color={Colors.textSecondary} />
    </Pressable>
  );
}

// ─── Tela principal ───────────────────────────────────────────────────────────

export default function ChatScreen() {
  const router = useRouter();
  const [conversas, setConversas] = useState<Conversa[]>([]);
  const [filtro, setFiltro] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const carregar = useCallback(async () => {
    try {
      const data = await api.get<any[]>('/chat/conversas');
      setConversas(
        data.map(c => ({
          id: c.id,
          nomeContato: c.nomeContato,
          fotoContato: c.fotoContato ?? null,
          projetoTitulo: c.projetoTitulo,
          projetoValor: c.projetoValor,
          tipo: c.tipo,
          contratoId: c.contratoId ?? null,
        }))
      );
    } catch {
      // silencioso
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  const conversasFiltradas = conversas.filter(c =>
    c.nomeContato.toLowerCase().includes(filtro.toLowerCase()) ||
    c.projetoTitulo.toLowerCase().includes(filtro.toLowerCase())
  );

  function abrirConversa(c: Conversa) {
    router.push({
      pathname: '/(app)/chat-conversa' as any,
      params: {
        conversaId: c.id,
        nomeContato: c.nomeContato,
        fotoContato: c.fotoContato ?? '',
        projetoTitulo: c.projetoTitulo,
        projetoValor: String(c.projetoValor),
        contratoId: c.contratoId != null ? String(c.contratoId) : '',
      },
    });
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Mensagens</Text>
      </View>

      {/* Barra de filtro */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={18} color={Colors.textSecondary} />
        <TextInput
          style={styles.searchInput}
          value={filtro}
          onChangeText={setFiltro}
          placeholder="Buscar conversa ou projeto..."
          placeholderTextColor={Colors.textSecondary}
        />
        {filtro.length > 0 && (
          <Pressable onPress={() => setFiltro('')} hitSlop={8}>
            <Ionicons name="close-circle" size={18} color={Colors.textSecondary} />
          </Pressable>
        )}
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : conversasFiltradas.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="chatbubbles-outline" size={70} color={Colors.textSecondary} />
          <Text style={styles.emptyTitle}>
            {filtro ? 'Nenhuma conversa encontrada' : 'Nenhuma conversa ainda'}
          </Text>
          <Text style={styles.emptyText}>
            {filtro
              ? 'Tente buscar por outro nome ou projeto'
              : 'As conversas aparecerão aqui quando uma candidatura for aceita'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={conversasFiltradas}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.lista}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); carregar(); }}
              tintColor={Colors.primary}
            />
          }
          renderItem={({ item }) => (
            <ConversaCard conversa={item} onPress={() => abrirConversa(item)} />
          )}
        />
      )}
    </SafeAreaView>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
    gap: 12,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: Colors.surface,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.border,
  },
  title: { flex: 1, fontSize: 22, fontWeight: '800', color: Colors.text, textAlign: 'center' },

  searchContainer: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: Colors.surface,
    borderRadius: 14, borderWidth: 1, borderColor: Colors.border,
    marginHorizontal: 16, marginVertical: 12,
    paddingHorizontal: 14, paddingVertical: 10,
  },
  searchInput: { flex: 1, fontSize: 15, color: Colors.text },

  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  lista: { paddingHorizontal: 16, paddingBottom: 40 },
  separator: { height: 1, backgroundColor: Colors.border, marginLeft: 76 },

  card: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 14,
  },
  avatar: {
    width: 52, height: 52, borderRadius: 26,
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  avatarLetter: { fontSize: 20, fontWeight: '800', color: '#fff' },

  cardContent: { flex: 1, gap: 3 },
  cardTopRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  nomeContato: { flex: 1, fontSize: 16, fontWeight: '700', color: Colors.text },
  valorTag: {
    backgroundColor: Colors.primary + '22',
    borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2,
  },
  valorText: { fontSize: 12, fontWeight: '700', color: Colors.primary },

  projetoRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  projetoTitulo: { fontSize: 12, color: Colors.primary, fontWeight: '600', flex: 1 },

  ultimaMensagem: { fontSize: 13, color: Colors.textSecondary },

  emptyContainer: {
    flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, paddingHorizontal: 32,
  },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: Colors.text, textAlign: 'center' },
  emptyText: { fontSize: 13, color: Colors.textSecondary, textAlign: 'center', lineHeight: 20 },
});
