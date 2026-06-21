import { Ionicons } from '@expo/vector-icons';
import { useRouter, type Href } from 'expo-router';
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
import { useAuth } from '@/contexts/AuthContext';
import { authService, type MinhaCandidatura, type ProjetoEmpresa } from '@/services/authService';

// ─── View para desenvolvedor ──────────────────────────────────────────────────

const STATUS_CONFIG = {
  pendente: { label: 'Aguardando', color: Colors.textSecondary, bg: Colors.surfaceHighlight, icon: 'time-outline' as const },
  aceito:   { label: 'Aceito',     color: '#4CAF50',            bg: 'rgba(76,175,80,0.12)',   icon: 'checkmark-circle-outline' as const },
  recusado: { label: 'Recusado',   color: Colors.error,         bg: 'rgba(232,69,96,0.12)',   icon: 'close-circle-outline' as const },
};

function DevCandidaturasView() {
  const router = useRouter();
  const [lista, setLista] = useState<MinhaCandidatura[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const carregar = useCallback(async () => {
    try {
      const data = await authService.getMinhaCandidaturas();
      setLista(data);
    } catch {
      // silencioso
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  if (isLoading) {
    return <View style={styles.center}><ActivityIndicator size="large" color={Colors.primary} /></View>;
  }

  return (
    <FlatList
      data={lista}
      keyExtractor={item => item.candidaturaId}
      contentContainerStyle={lista.length === 0 ? styles.emptyContainer : styles.lista}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); carregar(); }} tintColor={Colors.primary} />
      }
      ListEmptyComponent={
        <View style={styles.emptyInner}>
          <Ionicons name="document-text-outline" size={60} color={Colors.textSecondary} />
          <Text style={styles.emptyTitle}>Nenhuma candidatura ainda</Text>
          <Text style={styles.emptyText}>Candidate-se a projetos no Marketplace</Text>
          <Pressable style={styles.cta} onPress={() => router.push('/(app)/marketplace' as Href)}>
            <Text style={styles.ctaText}>Ver Marketplace</Text>
          </Pressable>
        </View>
      }
      renderItem={({ item }) => {
        const cfg = STATUS_CONFIG[item.status];
        return (
          <View style={styles.card}>
            <View style={styles.cardTop}>
              <Text style={styles.cardTitulo} numberOfLines={2}>{item.titulo}</Text>
              <View style={[styles.badge, { backgroundColor: cfg.bg }]}>
                <Ionicons name={cfg.icon} size={12} color={cfg.color} />
                <Text style={[styles.badgeText, { color: cfg.color }]}>{cfg.label}</Text>
              </View>
            </View>
            <View style={styles.row}>
              <Ionicons name="code-slash-outline" size={12} color={Colors.primary} />
              <Text style={styles.stackText} numberOfLines={1}>{item.stack}</Text>
            </View>
            <View style={styles.row}>
              <Ionicons name="cash-outline" size={12} color={Colors.textSecondary} />
              <Text style={styles.metaText}>
                {item.preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 })}
              </Text>
              <Text style={styles.metaDot}>·</Text>
              <Ionicons name="calendar-outline" size={12} color={Colors.textSecondary} />
              <Text style={styles.metaText}>
                {item.dataEnvio.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
              </Text>
            </View>
          </View>
        );
      }}
    />
  );
}

// ─── View para empresa ────────────────────────────────────────────────────────

function EmpresaProjetosView() {
  const router = useRouter();
  const [lista, setLista] = useState<ProjetoEmpresa[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();

  const carregar = useCallback(async () => {
    if (!user?.id) return;
    try {
      const data = await authService.getProjetosEmpresa(user.id);
      setLista(data);
    } catch {
      // silencioso
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [user?.id]);

  useEffect(() => { carregar(); }, [carregar]);

  if (isLoading) {
    return <View style={styles.center}><ActivityIndicator size="large" color={Colors.primary} /></View>;
  }

  const STATUS_PROJ: Record<string, { label: string; color: string }> = {
    ativo:        { label: 'Ativo',       color: Colors.primary },
    em_andamento: { label: 'Em andamento', color: '#F5A623' },
    concluido:    { label: 'Concluído',    color: '#4CAF50' },
  };

  return (
    <FlatList
      data={lista}
      keyExtractor={item => item.id}
      contentContainerStyle={lista.length === 0 ? styles.emptyContainer : styles.lista}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); carregar(); }} tintColor={Colors.primary} />
      }
      ListEmptyComponent={
        <View style={styles.emptyInner}>
          <Ionicons name="briefcase-outline" size={60} color={Colors.textSecondary} />
          <Text style={styles.emptyTitle}>Nenhum projeto publicado</Text>
          <Text style={styles.emptyText}>Crie um projeto para encontrar desenvolvedores</Text>
          <Pressable style={styles.cta} onPress={() => router.push('/(app)/criar-projeto' as Href)}>
            <Text style={styles.ctaText}>Criar Projeto</Text>
          </Pressable>
        </View>
      }
      renderItem={({ item }) => {
        const st = STATUS_PROJ[item.status] ?? { label: item.status, color: Colors.textSecondary };
        return (
          <Pressable
            style={styles.card}
            onPress={() => router.push('/(app)/meus-projetos' as any)}
          >
            <View style={styles.cardTop}>
              <Text style={styles.cardTitulo} numberOfLines={2}>{item.titulo}</Text>
              <Text style={[styles.statusLabel, { color: st.color }]}>{st.label}</Text>
            </View>
            <View style={styles.row}>
              <Ionicons name="code-slash-outline" size={12} color={Colors.primary} />
              <Text style={styles.stackText} numberOfLines={1}>{item.stack}</Text>
            </View>
            <View style={styles.row}>
              <Ionicons name="cash-outline" size={12} color={Colors.textSecondary} />
              <Text style={styles.metaText}>
                {item.orcamento.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 })}
              </Text>
              <Text style={styles.metaDot}>·</Text>
              <Ionicons name="people-outline" size={12} color={Colors.textSecondary} />
              <Text style={styles.metaText}>{item.candidaturas?.length ?? 0} candidato(s)</Text>
            </View>
          </Pressable>
        );
      }}
    />
  );
}

// ─── Tela principal ───────────────────────────────────────────────────────────

export default function CandidaturasTab() {
  const { user } = useAuth();
  const isDev = user?.type === 'developer';

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{isDev ? 'Minhas Candidaturas' : 'Meus Projetos'}</Text>
      </View>
      {isDev ? <DevCandidaturasView /> : <EmpresaProjetosView />}
    </SafeAreaView>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
    paddingHorizontal: 20, paddingVertical: 16,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  headerTitle: { fontSize: 22, fontWeight: '800', color: Colors.text },

  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  lista: { padding: 16, gap: 12 },
  emptyContainer: { flex: 1 },
  emptyInner: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    gap: 10, paddingHorizontal: 32,
  },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: Colors.text, textAlign: 'center' },
  emptyText: { fontSize: 13, color: Colors.textSecondary, textAlign: 'center' },
  cta: {
    backgroundColor: Colors.primary, borderRadius: 12,
    paddingHorizontal: 24, paddingVertical: 10, marginTop: 4,
  },
  ctaText: { color: '#fff', fontWeight: '700', fontSize: 14 },

  card: {
    backgroundColor: Colors.surface, borderRadius: 14,
    borderWidth: 1, borderColor: Colors.border,
    padding: 14, gap: 8,
  },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  cardTitulo: { flex: 1, fontSize: 15, fontWeight: '700', color: Colors.text, lineHeight: 20 },
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4,
  },
  badgeText: { fontSize: 11, fontWeight: '600' },
  statusLabel: { fontSize: 12, fontWeight: '700' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  stackText: { flex: 1, fontSize: 12, color: Colors.primary, fontWeight: '600' },
  metaText: { fontSize: 12, color: Colors.textSecondary },
  metaDot: { fontSize: 12, color: Colors.textSecondary, marginHorizontal: 2 },
});
