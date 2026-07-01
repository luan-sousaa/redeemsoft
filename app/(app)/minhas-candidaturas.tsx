import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import type { Href } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  Pressable,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors } from '@/constants/colors';
import { authService } from '@/services/authService';
import { useAuth } from '@/contexts/AuthContext';
import Toast from 'react-native-toast-message';
import { MinhaCandidatura } from '@/types';


// ─── Config de status ─────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  MinhaCandidatura['status'],
  { label: string; color: string; bg: string; icon: React.ComponentProps<typeof Ionicons>['name'] }
> = {
  pendente: {
    label: 'Aguardando',
    color: Colors.textSecondary,
    bg: Colors.surfaceHighlight,
    icon: 'time-outline',
  },
  aceito: {
    label: 'Aceito',
    color: '#4CAF50',
    bg: 'rgba(76,175,80,0.12)',
    icon: 'checkmark-circle-outline',
  },
  recusado: {
    label: 'Recusado',
    color: Colors.error,
    bg: 'rgba(232,69,96,0.12)',
    icon: 'close-circle-outline',
  },
};

// ─── Card de candidatura ──────────────────────────────────────────────────────

function CandidaturaCard({ item, onOpenChat }: { item: MinhaCandidatura; onOpenChat?: () => void }) {
  const cfg = STATUS_CONFIG[item.status];

  const precoFormatado = item.preco.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
  });

  const dataFormatada = item.dataEnvio.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  return (
    <View style={styles.card}>
      {/* Título + status */}
      <View style={styles.cardTop}>
        <Text style={styles.cardTitulo} numberOfLines={2}>{item.titulo}</Text>
        <View style={[styles.statusBadge, { backgroundColor: cfg.bg }]}>
          <Ionicons name={cfg.icon} size={13} color={cfg.color} />
          <Text style={[styles.statusText, { color: cfg.color }]}>{cfg.label}</Text>
        </View>
      </View>

      {/* Stack */}
      <View style={styles.stackRow}>
        <Ionicons name="code-slash-outline" size={13} color={Colors.primary} />
        <Text style={styles.stackText} numberOfLines={1}>{item.stack}</Text>
      </View>

      {/* Rodapé: preço, prazo, data */}
      <View style={styles.cardFooter}>
        <View style={styles.footerItem}>
          <Ionicons name="cash-outline" size={13} color={Colors.textSecondary} />
          <Text style={styles.footerText}>{precoFormatado}</Text>
        </View>
        <View style={styles.dot} />
        <View style={styles.footerItem}>
          <Ionicons name="time-outline" size={13} color={Colors.textSecondary} />
          <Text style={styles.footerText}>{item.prazo}</Text>
        </View>
        <View style={styles.dot} />
        <Text style={styles.footerDate}>{dataFormatada}</Text>
      </View>

      {/* Botão de chat — visível apenas para candidaturas aceitas */}
      {item.status === 'aceito' && onOpenChat && (
        <Pressable style={styles.chatBtn} onPress={onOpenChat}>
          <Ionicons name="chatbubbles-outline" size={15} color={Colors.primary} />
          <Text style={styles.chatBtnText}>Abrir Chat do Projeto</Text>
        </Pressable>
      )}
    </View>
  );
}

// ─── Tela ─────────────────────────────────────────────────────────────────────

export default function MinhasCandidaturasScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [candidaturas, setCandidaturas] = useState<MinhaCandidatura[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const handleOpenChat = useCallback(async (cand: MinhaCandidatura) => {
    try {
      const c = await authService.getContratoPorProjeto(cand.projetoId);
      router.push({
        pathname: '/(app)/chat-conversa' as Href,
        params: { contratoId: String(c.id), projetoNome: cand.titulo, devNome: user?.name ?? '' },
      });
    } catch {
      Toast.show({ type: 'error', text1: 'Contrato não encontrado.' });
    }
  }, [router, user]);

  const carregar = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const data = await authService.getMinhaCandidaturas();
      setCandidaturas(data);
    } catch (e) {
      console.error('[MinhasCandidaturas] Erro ao carregar candidaturas:', e);
      setCandidaturas([]);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => { carregar(); }, [carregar]);

  const pendentes = candidaturas.filter((c) => c.status === 'pendente').length;
  const aceitas = candidaturas.filter((c) => c.status === 'aceito').length;

  return (
    <SafeAreaView style={styles.safe}>

      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Minhas Candidaturas</Text>
          {candidaturas.length > 0 && (
            <Text style={styles.headerSub}>
              {candidaturas.length} candidatura{candidaturas.length !== 1 ? 's' : ''} · {pendentes} aguardando · {aceitas} aceita{aceitas !== 1 ? 's' : ''}
            </Text>
          )}
        </View>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={candidaturas}
          keyExtractor={(item) => item.candidaturaId}
          contentContainerStyle={styles.lista}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          onRefresh={carregar}
          refreshing={isLoading}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="document-text-outline" size={56} color={Colors.surfaceHighlight} />
              <Text style={styles.emptyTitle}>Nenhuma candidatura ainda</Text>
              <Text style={styles.emptySub}>
                Explore o marketplace e candidate-se a projetos que combinam com sua stack.
              </Text>
              <Pressable
                style={styles.emptyBtn}
                onPress={() => router.push('/(app)/marketplace' as Href)}
              >
                <Ionicons name="storefront-outline" size={16} color={Colors.primary} />
                <Text style={styles.emptyBtnText}>Ver Marketplace</Text>
              </Pressable>
            </View>
          }
          renderItem={({ item }) => (
            <CandidaturaCard
              item={item}
              onOpenChat={item.status === 'aceito' ? () => handleOpenChat(item) : undefined}
            />
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '800', color: Colors.text },
  headerSub: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },

  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  lista: { padding: 16, paddingBottom: 40 },

  card: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 10,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    justifyContent: 'space-between',
  },
  cardTitulo: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
    lineHeight: 22,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignSelf: 'flex-start',
  },
  statusText: { fontSize: 12, fontWeight: '700' },

  stackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  stackText: { fontSize: 13, color: Colors.primary, fontWeight: '600', flex: 1 },

  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  footerItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  footerText: { fontSize: 12, color: Colors.textSecondary, fontWeight: '500' },
  dot: { width: 3, height: 3, borderRadius: 2, backgroundColor: Colors.border },
  footerDate: { fontSize: 11, color: Colors.textSecondary, marginLeft: 'auto' },
  chatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    backgroundColor: 'rgba(79,110,247,0.06)',
  },
  chatBtnText: { fontSize: 13, fontWeight: '700', color: Colors.primary },

  emptyContainer: {
    alignItems: 'center',
    paddingTop: 80,
    paddingHorizontal: 32,
    gap: 12,
  },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: Colors.text },
  emptySub: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  emptyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  emptyBtnText: { fontSize: 14, color: Colors.primary, fontWeight: '600' },
});
