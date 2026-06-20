import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors } from '@/constants/colors';
import { api } from '@/services/api';

// ─── Tipos ────────────────────────────────────────────────────────────────────

type Notificacao = {
  id: number;
  tipo: 'candidatura_recebida' | 'candidatura_aceita' | 'candidatura_recusada';
  titulo: string;
  mensagem: string;
  nomeEnvolvido: string;
  lida: boolean;
  criadaEm: string | null;
};

// ─── Utils ────────────────────────────────────────────────────────────────────

function formatarTempo(data: string | null): string {
  if (!data) return '';
  const diff = Date.now() - new Date(data).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'Agora';
  if (min < 60) return `há ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `há ${h}h`;
  const d = Math.floor(h / 24);
  if (d === 1) return 'Ontem';
  return `há ${d} dias`;
}

function iconePorTipo(tipo: Notificacao['tipo']) {
  switch (tipo) {
    case 'candidatura_recebida': return { name: 'person-add-outline' as const, color: Colors.primary };
    case 'candidatura_aceita':   return { name: 'checkmark-circle-outline' as const, color: '#4CAF50' };
    case 'candidatura_recusada': return { name: 'close-circle-outline' as const, color: Colors.error };
  }
}

// ─── Card de notificação ──────────────────────────────────────────────────────

function NotifCard({
  notif,
  onDelete,
  onMarcarLida,
}: {
  notif: Notificacao;
  onDelete: (id: number) => void;
  onMarcarLida: (id: number) => void;
}) {
  const icone = iconePorTipo(notif.tipo);

  return (
    <Pressable
      style={[styles.card, !notif.lida && styles.cardNaoLida]}
      onPress={() => !notif.lida && onMarcarLida(notif.id)}
    >
      <View style={[styles.iconContainer, { backgroundColor: icone.color + '22' }]}>
        <Ionicons name={icone.name} size={22} color={icone.color} />
      </View>

      <View style={styles.content}>
        <View style={styles.cardTopRow}>
          <Text style={styles.cardTitle}>{notif.titulo}</Text>
          {!notif.lida && <View style={styles.dotNaoLida} />}
        </View>

        <Text style={styles.cardText}>
          <Text style={styles.nomeEnvolvido}>{notif.nomeEnvolvido} </Text>
          {notif.mensagem}
        </Text>

        <Text style={styles.time}>{formatarTempo(notif.criadaEm)}</Text>
      </View>

      <Pressable
        onPress={() => onDelete(notif.id)}
        style={styles.deleteButton}
        hitSlop={8}
      >
        <Ionicons name="trash-outline" size={18} color={Colors.error} />
      </Pressable>
    </Pressable>
  );
}

// ─── Tela principal ───────────────────────────────────────────────────────────

export default function NotificacoesScreen() {
  const router = useRouter();
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const carregar = useCallback(async () => {
    try {
      const data = await api.get<any[]>('/notificacoes');
      setNotificacoes(
        data.map(n => ({
          id: n.id,
          tipo: n.tipo,
          titulo: n.titulo,
          mensagem: n.mensagem,
          nomeEnvolvido: n.nomeEnvolvido,
          lida: Boolean(n.lida),
          criadaEm: n.criadaEm,
        }))
      );
    } catch {
      // falha silenciosa — mantém lista vazia
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  async function handleMarcarLida(id: number) {
    try {
      await api.patch(`/notificacoes/${id}/lida`, {});
      setNotificacoes(prev => prev.map(n => n.id === id ? { ...n, lida: true } : n));
    } catch {}
  }

  async function handleDelete(id: number) {
    try {
      await api.delete(`/notificacoes/${id}`);
      setNotificacoes(prev => prev.filter(n => n.id !== id));
    } catch {}
  }

  function confirmarLimparTodas() {
    if (notificacoes.length === 0) return;
    Alert.alert('Limpar notificações', 'Remover todas as notificações?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Limpar tudo',
        style: 'destructive',
        onPress: async () => {
          await Promise.all(notificacoes.map(n => api.delete(`/notificacoes/${n.id}`).catch(() => {})));
          setNotificacoes([]);
        },
      },
    ]);
  }

  const naoLidas = notificacoes.filter(n => !n.lida).length;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={Colors.text} />
        </Pressable>

        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Notificações</Text>
          {naoLidas > 0 && (
            <Text style={styles.subtitle}>{naoLidas} não lida{naoLidas !== 1 ? 's' : ''}</Text>
          )}
        </View>

        {notificacoes.length > 0 && (
          <Pressable onPress={confirmarLimparTodas} style={styles.clearBtn} hitSlop={8}>
            <Ionicons name="trash-outline" size={20} color={Colors.textSecondary} />
          </Pressable>
        )}
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : notificacoes.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="notifications-off-outline" size={70} color={Colors.textSecondary} />
          <Text style={styles.emptyTitle}>Nenhuma notificação</Text>
          <Text style={styles.emptyText}>Você ainda não possui notificações.</Text>
        </View>
      ) : (
        <FlatList
          data={notificacoes}
          keyExtractor={item => String(item.id)}
          contentContainerStyle={styles.lista}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); carregar(); }}
              tintColor={Colors.primary}
            />
          }
          renderItem={({ item }) => (
            <NotifCard
              notif={item}
              onDelete={handleDelete}
              onMarcarLida={handleMarcarLida}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: Colors.surface,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.border,
  },
  title: { fontSize: 22, fontWeight: '800', color: Colors.text },
  subtitle: { fontSize: 12, color: Colors.primary, fontWeight: '600', marginTop: 1 },
  clearBtn: { padding: 8 },

  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  lista: { padding: 16, paddingBottom: 40 },

  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  cardNaoLida: {
    borderColor: Colors.primary + '44',
    backgroundColor: Colors.surfaceHighlight,
  },
  iconContainer: {
    width: 46, height: 46, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  content: { flex: 1, gap: 4 },
  cardTopRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: Colors.text, flex: 1 },
  dotNaoLida: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  nomeEnvolvido: { fontWeight: '700', color: Colors.text },
  cardText: { fontSize: 13, color: Colors.textSecondary, lineHeight: 20 },
  time: { fontSize: 11, color: Colors.textSecondary, marginTop: 2 },
  deleteButton: { padding: 4 },

  emptyContainer: {
    flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10,
  },
  emptyTitle: { color: Colors.text, fontSize: 20, fontWeight: '700' },
  emptyText: { color: Colors.textSecondary, fontSize: 14, textAlign: 'center' },
});
