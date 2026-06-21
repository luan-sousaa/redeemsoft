/**
 * Aba "Projetos" / "Candidaturas"
 * - Empresa (client): Meus Projetos publicados + atalho para Nova Solicitação
 * - Dev (developer): Minhas Candidaturas
 */
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import type { Href } from 'expo-router';
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
import { authService } from '@/services/authService';
import type { MinhaCandidatura, ProjetoEmpresa, User } from '@/services/authService';

// ─── Status chip ──────────────────────────────────────────────────────────────

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  pendente:  { label: 'Pendente',  color: '#F5A623' },
  aceito:    { label: 'Aceito',    color: '#4CAF50' },
  recusado:  { label: 'Recusado', color: Colors.error },
};

function StatusChip({ status }: { status: string }) {
  const s = STATUS_MAP[status] ?? { label: status, color: Colors.textSecondary };
  return (
    <View style={[styles.chip, { borderColor: s.color + '44', backgroundColor: s.color + '22' }]}>
      <Text style={[styles.chipText, { color: s.color }]}>{s.label}</Text>
    </View>
  );
}

// ─── Card candidatura (dev) ───────────────────────────────────────────────────

function CandidaturaCard({ item }: { item: MinhaCandidatura }) {
  const router = useRouter();
  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={() => router.push({
        pathname: '/(app)/projeto-detalhe',
        params: { id: String(item.projetoId) },
      } as Href)}
    >
      <View style={styles.cardRow}>
        <Text style={styles.cardTitle} numberOfLines={2}>{item.titulo}</Text>
        <StatusChip status={item.status} />
      </View>
      <View style={styles.cardRow}>
        <View style={[styles.chip, { borderColor: Colors.primary + '44', backgroundColor: Colors.primary + '22' }]}>
          <Text style={[styles.chipText, { color: Colors.primary }]}>
            {Number(item.preco).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 })}
          </Text>
        </View>
        <View style={[styles.chip, { borderColor: Colors.border, backgroundColor: Colors.surfaceHighlight }]}>
          <Ionicons name="time-outline" size={11} color={Colors.textSecondary} />
          <Text style={[styles.chipText, { color: Colors.textSecondary, marginLeft: 3 }]}>{item.prazo}</Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color={Colors.textSecondary} style={{ marginLeft: 'auto' }} />
      </View>
    </Pressable>
  );
}

// ─── Card projeto empresa ─────────────────────────────────────────────────────

function ProjetoCard({ projeto, onPress }: { projeto: ProjetoEmpresa; onPress: () => void }) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.cardRow}>
        <Text style={styles.cardTitle} numberOfLines={2}>{projeto.titulo}</Text>
        <View style={[styles.chip, { borderColor: Colors.primary + '44', backgroundColor: Colors.primary + '22' }]}>
          <Text style={[styles.chipText, { color: Colors.primary }]}>
            {projeto.orcamento.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 })}
          </Text>
        </View>
      </View>
      <Text style={styles.cardDesc} numberOfLines={2}>{projeto.descricao}</Text>
      <View style={styles.cardRow}>
        {(typeof projeto.stack === 'string'
          ? projeto.stack.split(',').map(s => s.trim()).filter(Boolean)
          : (projeto.stack ?? [])
        ).slice(0, 3).map((s, i) => (
          <View key={i} style={[styles.chip, { borderColor: Colors.border, backgroundColor: Colors.surfaceHighlight }]}>
            <Text style={[styles.chipText, { color: Colors.textSecondary }]}>{s}</Text>
          </View>
        ))}
        <Ionicons name="chevron-forward" size={16} color={Colors.textSecondary} style={{ marginLeft: 'auto' }} />
      </View>
    </Pressable>
  );
}

// ─── View Empresa ─────────────────────────────────────────────────────────────

function ProjetosEmpresa() {
  const router = useRouter();
  const [projetos, setProjetos] = useState<ProjetoEmpresa[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const { user } = useAuth();

  const carregar = useCallback(async () => {
    try {
      const data = await authService.getProjetosEmpresa(String(user?.idCliente ?? ''));
      setProjetos(data);
    } catch {}
    finally { setLoading(false); setRefreshing(false); }
  }, [user]);

  useEffect(() => { carregar(); }, [carregar]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Minhas Solicitações</Text>
        <Pressable
          style={styles.addBtn}
          onPress={() => router.push('/(app)/criar-projeto' as Href)}
        >
          <Ionicons name="add" size={20} color={Colors.text} />
          <Text style={styles.addBtnText}>Nova</Text>
        </Pressable>
      </View>

      {loading ? (
        <ActivityIndicator color={Colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={projetos}
          keyExtractor={item => String(item.id)}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); carregar(); }}
              tintColor={Colors.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="folder-open-outline" size={56} color={Colors.textSecondary} />
              <Text style={styles.emptyTitle}>Nenhum projeto publicado</Text>
              <Text style={styles.emptyText}>Crie sua primeira solicitação e encontre um dev</Text>
              <Pressable
                style={styles.emptyBtn}
                onPress={() => router.push('/(app)/criar-projeto' as Href)}
              >
                <Text style={styles.emptyBtnText}>Criar Solicitação</Text>
              </Pressable>
            </View>
          }
          renderItem={({ item }) => (
            <ProjetoCard
              projeto={item}
              onPress={() => router.push({
                pathname: '/(app)/meus-projetos',
                params: { projetoId: item.id },
              } as Href)}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}

// ─── View Dev ─────────────────────────────────────────────────────────────────

function CandidaturasDev() {
  const [candidaturas, setCandidaturas] = useState<MinhaCandidatura[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const carregar = useCallback(async () => {
    try {
      const data = await authService.getMinhaCandidaturas();
      // Apenas projetos em que foi aceito (participando ativamente)
      setCandidaturas(data.filter(c => c.status === 'aceito'));
    } catch {}
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Meus Projetos</Text>
      </View>

      {loading ? (
        <ActivityIndicator color={Colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={candidaturas}
          keyExtractor={item => String(item.candidaturaId)}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); carregar(); }}
              tintColor={Colors.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="document-text-outline" size={56} color={Colors.textSecondary} />
              <Text style={styles.emptyTitle}>Nenhum projeto ainda</Text>
              <Text style={styles.emptyText}>Candidate-se a projetos no marketplace e aguarde a aprovação</Text>
            </View>
          }
          renderItem={({ item }) => <CandidaturaCard item={item} />}
        />
      )}
    </SafeAreaView>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function ProjetosTab() {
  const { user } = useAuth();
  return user?.type === 'client' ? <ProjetosEmpresa /> : <CandidaturasDev />;
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerTitle: { fontSize: 26, fontWeight: '800', color: Colors.text },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  addBtnText: { fontSize: 13, fontWeight: '700', color: Colors.text },

  listContent: { paddingHorizontal: 16, paddingBottom: 20 },

  card: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 10,
  },
  cardPressed: { opacity: 0.75 },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  cardTitle: { flex: 1, fontSize: 15, fontWeight: '700', color: Colors.text },
  cardDesc: { fontSize: 13, color: Colors.textSecondary, lineHeight: 18 },

  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  chipText: { fontSize: 11, fontWeight: '600' },

  empty: { alignItems: 'center', paddingTop: 80, gap: 10, paddingHorizontal: 32 },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: Colors.text },
  emptyText: { fontSize: 13, color: Colors.textSecondary, textAlign: 'center' },
  emptyBtn: {
    marginTop: 8,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  emptyBtnText: { fontSize: 14, fontWeight: '700', color: Colors.text },
});
