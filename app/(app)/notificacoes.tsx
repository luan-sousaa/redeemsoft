import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors } from '@/constants/colors';
import { authService, type Notificacao } from '@/services/authService';

const TIPO_ICON: Record<string, React.ComponentProps<typeof Ionicons>['name']> = {
  nova_candidatura: 'person-add-outline',
  candidatura_aceita: 'checkmark-circle-outline',
  candidatura_recusada: 'close-circle-outline',
  novo_projeto: 'briefcase-outline',
};

const TIPO_COLOR: Record<string, string> = {
  nova_candidatura: Colors.primary,
  candidatura_aceita: '#4CAF50',
  candidatura_recusada: Colors.error,
  novo_projeto: '#F5A623',
};

function formatTempo(iso: string): string {
  try {
    const d = new Date(iso);
    const agora = new Date();
    const diffMin = Math.floor((agora.getTime() - d.getTime()) / 60000);
    if (diffMin < 1) return 'Agora';
    if (diffMin < 60) return `há ${diffMin} min`;
    const diffH = Math.floor(diffMin / 60);
    if (diffH < 24 && d.toDateString() === agora.toDateString()) return `há ${diffH}h`;
    const ontem = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate() - 1).toDateString();
    if (d.toDateString() === ontem) return 'Ontem';
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  } catch {
    return '';
  }
}

function NotificacaoCard({ notif, onMarcarLida }: { notif: Notificacao; onMarcarLida: (id: number) => void }) {
  const icon = TIPO_ICON[notif.tipo] ?? 'notifications-outline';
  const color = TIPO_COLOR[notif.tipo] ?? Colors.primary;

  return (
    <Pressable
      style={[styles.card, notif.lida && styles.cardLida]}
      onPress={() => !notif.lida && onMarcarLida(notif.id)}
    >
      <View style={[styles.iconContainer, { backgroundColor: `${color}18` }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>

      <View style={styles.content}>
        <Text style={[styles.cardTitle, notif.lida && styles.cardTitleLida]}>{notif.titulo}</Text>
        <Text style={styles.cardText}>{notif.corpo}</Text>
        <Text style={styles.time}>{formatTempo(notif.criadoEm)}</Text>
      </View>

      {!notif.lida && <View style={styles.unreadDot} />}
    </Pressable>
  );
}

export default function NotificacoesScreen() {
  const router = useRouter();
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const carregar = useCallback(async () => {
    try {
      const data = await authService.getNotificacoes();
      setNotificacoes(data);
    } catch {
      // silencioso
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await carregar();
    setRefreshing(false);
  }, [carregar]);

  const handleMarcarLida = useCallback(async (id: number) => {
    setNotificacoes((prev) => prev.map((n) => n.id === id ? { ...n, lida: true } : n));
    authService.marcarNotificacaoLida(id).catch(() => {});
  }, []);

  const handleMarcarTodas = useCallback(async () => {
    setNotificacoes((prev) => prev.map((n) => ({ ...n, lida: true })));
    authService.marcarTodasNotificacoesLidas().catch(() => {});
  }, []);

  const naoLidas = notificacoes.filter((n) => !n.lida).length;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={Colors.text} />
        </Pressable>

        <Text style={styles.title}>Notificações</Text>

        {naoLidas > 0 ? (
          <Pressable onPress={handleMarcarTodas} style={styles.marcarBtn}>
            <Text style={styles.marcarBtnText}>Marcar lidas</Text>
          </Pressable>
        ) : (
          <View style={{ width: 80 }} />
        )}
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={notificacoes}
          keyExtractor={(item) => String(item.id)}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={Colors.primary} />}
          contentContainerStyle={notificacoes.length === 0 ? styles.emptyContent : styles.listContent}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="notifications-off-outline" size={70} color={Colors.surfaceHighlight} />
              <Text style={styles.emptyTitle}>Nenhuma notificação</Text>
              <Text style={styles.emptyText}>Você ainda não possui notificações.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <NotificacaoCard notif={item} onMarcarLida={handleMarcarLida} />
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },

  title: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
  },

  marcarBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: Colors.surfaceHighlight,
    borderRadius: 20,
  },
  marcarBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
  },

  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  listContent: {
    padding: 16,
    paddingBottom: 40,
  },

  emptyContent: {
    flex: 1,
  },

  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },

  cardLida: {
    opacity: 0.6,
  },

  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  content: {
    flex: 1,
    gap: 4,
  },

  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
  },

  cardTitleLida: {
    fontWeight: '500',
  },

  cardText: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },

  time: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },

  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
    marginTop: 4,
    flexShrink: 0,
  },

  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingTop: 80,
  },

  emptyTitle: {
    color: Colors.text,
    fontSize: 20,
    fontWeight: '700',
  },

  emptyText: {
    color: Colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
  },
});
