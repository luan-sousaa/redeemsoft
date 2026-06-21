import { MaterialIcons } from '@expo/vector-icons';
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
  tipo: string;
  titulo: string;
  mensagem: string;
  lida: boolean;
  criadaEm: string | null;
};

// ─── Utils ────────────────────────────────────────────────────────────────────

function formatarTempo(data: string | null): string {
  if (!data) return '';
  const diff = Date.now() - new Date(data).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'Agora';
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  if (d === 1) return 'Ontem';
  return `${d}d`;
}

function grupoData(data: string | null): string {
  if (!data) return 'Mais antigas';
  const diff = Date.now() - new Date(data).getTime();
  const d = Math.floor(diff / 86400000);
  if (d === 0) return 'Hoje';
  if (d === 1) return 'Ontem';
  return 'Mais antigas';
}

type IconeConfig = {
  icon: React.ComponentProps<typeof MaterialIcons>['name'];
  bg: string;
};

function iconePorTipo(tipo: string): IconeConfig {
  switch (tipo) {
    case 'nova_candidatura':    return { icon: 'person-add',   bg: '#4F6EF7' };
    case 'candidatura_aceita':  return { icon: 'check-circle', bg: '#4CAF50' };
    case 'candidatura_recusada':return { icon: 'cancel',       bg: '#E84560' };
    case 'mensagem':            return { icon: 'chat-bubble',  bg: '#FF9800' };
    default:                    return { icon: 'notifications', bg: Colors.primary };
  }
}

// ─── Separador de grupo ───────────────────────────────────────────────────────

function GrupoHeader({ label }: { label: string }) {
  return <Text style={styles.grupoLabel}>{label}</Text>;
}

// ─── Card estilo iFood ────────────────────────────────────────────────────────

function NotifCard({
  notif,
  onDelete,
  onMarcarLida,
}: {
  notif: Notificacao;
  onDelete: (id: number) => void;
  onMarcarLida: (id: number) => void;
}) {
  const { icon, bg } = iconePorTipo(notif.tipo);

  return (
    <Pressable
      style={[styles.card, !notif.lida && styles.cardNaoLida]}
      onPress={() => !notif.lida && onMarcarLida(notif.id)}
    >
      {/* Barra lateral de não lida */}
      {!notif.lida && <View style={styles.unreadBar} />}

      {/* Ícone circular */}
      <View style={[styles.iconCircle, { backgroundColor: bg }]}>
        <MaterialIcons name={icon} size={20} color="#fff" />
      </View>

      {/* Texto */}
      <View style={styles.cardContent}>
        <View style={styles.cardTopRow}>
          <Text
            style={[styles.cardTitle, !notif.lida && styles.cardTitleUnread]}
            numberOfLines={1}
          >
            {notif.titulo}
          </Text>
          <Text style={styles.cardTime}>{formatarTempo(notif.criadaEm)}</Text>
        </View>
        <Text style={styles.cardText} numberOfLines={2}>
          {notif.mensagem}
        </Text>
      </View>

      {/* X para deletar */}
      <Pressable onPress={() => onDelete(notif.id)} style={styles.deleteBtn} hitSlop={10}>
        <MaterialIcons name="close" size={16} color={Colors.textSecondary} />
      </Pressable>
    </Pressable>
  );
}

// ─── Tela principal ───────────────────────────────────────────────────────────

type ListItem =
  | { type: 'header'; label: string; key: string }
  | { type: 'notif'; data: Notificacao; key: string };

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
          id: n.idNotificacao ?? n.id,
          tipo: n.tipo,
          titulo: n.titulo,
          mensagem: n.corpo ?? n.mensagem ?? '',
          lida: Boolean(n.lida),
          criadaEm: n.criadoEm ?? n.criadaEm ?? null,
        }))
      );
    } catch {}
    finally { setIsLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  async function handleMarcarLida(id: number) {
    try {
      await api.patch(`/notificacoes/${id}/lida`, {});
      setNotificacoes(prev => prev.map(n => n.id === id ? { ...n, lida: true } : n));
    } catch {}
  }

  async function handleMarcarTodas() {
    try {
      await api.patch('/notificacoes/lidas', {});
      setNotificacoes(prev => prev.map(n => ({ ...n, lida: true })));
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

  // Montar lista com separadores por grupo de data
  const listItems: ListItem[] = [];
  let ultimoGrupo = '';
  for (const n of notificacoes) {
    const grupo = grupoData(n.criadaEm);
    if (grupo !== ultimoGrupo) {
      ultimoGrupo = grupo;
      listItems.push({ type: 'header', label: grupo, key: `header-${grupo}` });
    }
    listItems.push({ type: 'notif', data: n, key: `notif-${n.id}` });
  }

  const naoLidas = notificacoes.filter(n => !n.lida).length;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={24} color={Colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Notificações</Text>
        {notificacoes.length > 0 && (
          <Pressable onPress={confirmarLimparTodas} hitSlop={8}>
            <Text style={styles.limparText}>Limpar</Text>
          </Pressable>
        )}
      </View>

      {/* Linha de badge + marcar todas */}
      {naoLidas > 0 && (
        <View style={styles.badgeRow}>
          <View style={styles.badge}>
            <MaterialIcons name="notifications" size={13} color={Colors.primary} />
            <Text style={styles.badgeText}>
              {naoLidas} não lida{naoLidas !== 1 ? 's' : ''}
            </Text>
          </View>
          <Pressable onPress={handleMarcarTodas} hitSlop={8}>
            <Text style={styles.marcarTodasText}>Marcar todas como lidas</Text>
          </Pressable>
        </View>
      )}

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : notificacoes.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}>
            <MaterialIcons name="notifications-none" size={40} color={Colors.textSecondary} />
          </View>
          <Text style={styles.emptyTitle}>Tudo em dia!</Text>
          <Text style={styles.emptyText}>Você não tem notificações no momento.</Text>
        </View>
      ) : (
        <FlatList
          data={listItems}
          keyExtractor={item => item.key}
          contentContainerStyle={styles.lista}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); carregar(); }}
              tintColor={Colors.primary}
            />
          }
          renderItem={({ item }) => {
            if (item.type === 'header') return <GrupoHeader label={item.label} />;
            return (
              <NotifCard
                notif={item.data}
                onDelete={handleDelete}
                onMarcarLida={handleMarcarLida}
              />
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  backBtn: { padding: 4 },
  headerTitle: { flex: 1, fontSize: 20, fontWeight: '800', color: Colors.text },
  limparText: { fontSize: 14, color: Colors.primary, fontWeight: '600' },

  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Colors.primary + '18',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: { fontSize: 12, color: Colors.primary, fontWeight: '700' },
  marcarTodasText: { fontSize: 12, color: Colors.primary, fontWeight: '600' },

  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  lista: { paddingHorizontal: 16, paddingBottom: 40 },

  grupoLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: 20,
    marginBottom: 8,
  },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 8,
    paddingVertical: 14,
    paddingRight: 12,
    paddingLeft: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardNaoLida: {
    backgroundColor: Colors.primary + '0D',
    borderColor: Colors.primary + '33',
  },
  unreadBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    backgroundColor: Colors.primary,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  cardContent: { flex: 1, gap: 3 },
  cardTopRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardTitle: { flex: 1, fontSize: 14, fontWeight: '600', color: Colors.textSecondary },
  cardTitleUnread: { fontWeight: '700', color: Colors.text },
  cardTime: { fontSize: 11, color: Colors.textSecondary, flexShrink: 0 },
  cardText: { fontSize: 13, color: Colors.textSecondary, lineHeight: 18 },
  deleteBtn: { padding: 4 },

  emptyContainer: {
    flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12,
  },
  emptyIconCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: Colors.surface,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.border,
    marginBottom: 4,
  },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: Colors.text },
  emptyText: { fontSize: 13, color: Colors.textSecondary, textAlign: 'center' },
});
