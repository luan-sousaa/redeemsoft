/**
 * Aba "Início"
 * - Empresa (client): banner hero + lista de desenvolvedores para contratar
 * - Dev (developer): marketplace de projetos
 */
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import type { Href } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  ListRenderItem,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors } from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { authService } from '@/services/authService';
import { api } from '@/services/api';
import { parseList } from '@/utils/parseList';
import type { ProjetoEmpresa } from '@/services/authService';

// ─── Tipos ────────────────────────────────────────────────────────────────────

type Desenvolvedor = {
  id: string;
  nome: string;
  precoPorHora: number;
  descricao: string;
  sobreMim: string;
  habilidades: string;
  certificacoes: string;
  foto: string | null;
  projetos: any[];
};

// ─── Card de desenvolvedor ────────────────────────────────────────────────────

function DevCard({ dev, onPress }: { dev: Desenvolvedor; onPress: () => void }) {
  const skills = parseList(dev.habilidades).slice(0, 3);
  return (
    <Pressable style={styles.card} onPress={onPress} android_ripple={{ color: Colors.border }}>
      <View style={styles.cardHeader}>
        <View style={styles.devAvatar}>
          {dev.foto ? (
            <Image source={{ uri: dev.foto }} style={styles.devAvatarImg} contentFit="cover" />
          ) : (
            <Ionicons name="person-circle-outline" size={32} color={Colors.textSecondary} />
          )}
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardNome}>{dev.nome}</Text>
          <Text style={styles.cardPreco}>R$ {dev.precoPorHora}/h</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={Colors.textSecondary} />
      </View>
      <Text style={styles.cardDesc} numberOfLines={2}>{dev.descricao || dev.sobreMim}</Text>
      <View style={styles.chips}>
        {skills.length > 0 ? skills.map((s, i) => (
          <View key={i} style={styles.chip}><Text style={styles.chipText}>{s}</Text></View>
        )) : (
          <View style={styles.chip}><Text style={styles.chipText}>Não informado</Text></View>
        )}
      </View>
    </Pressable>
  );
}

// ─── Card de projeto (marketplace) ───────────────────────────────────────────

function ProjetoCard({ projeto, onPress }: { projeto: ProjetoEmpresa; onPress: () => void }) {
  return (
    <Pressable style={styles.card} onPress={onPress} android_ripple={{ color: Colors.border }}>
      <View style={[styles.cardHeader, { justifyContent: 'space-between' }]}>
        <Text style={[styles.cardNome, { flex: 1 }]} numberOfLines={2}>{projeto.titulo}</Text>
        <View style={styles.precoTag}>
          <Text style={styles.precoText}>
            {projeto.orcamento.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 })}
          </Text>
        </View>
      </View>
      <Text style={styles.cardDesc} numberOfLines={2}>{projeto.descricao}</Text>
      <View style={styles.chips}>
        {projeto.stack?.slice(0, 3).map((s, i) => (
          <View key={i} style={styles.chip}><Text style={styles.chipText}>{s}</Text></View>
        ))}
        <View style={[styles.chip, { backgroundColor: Colors.surfaceHighlight }]}>
          <Ionicons name="time-outline" size={11} color={Colors.textSecondary} />
          <Text style={[styles.chipText, { color: Colors.textSecondary }]}> {projeto.prazo} dias</Text>
        </View>
      </View>
    </Pressable>
  );
}

// ─── Tela empresa: banner + buscar devs ──────────────────────────────────────

function HomeEmpresa() {
  const router = useRouter();
  const [devs, setDevs] = useState<Desenvolvedor[]>([]);
  const [busca, setBusca] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const carregar = useCallback(async () => {
    try {
      const data = await authService.getDesenvolvedores();
      setDevs(data);
    } catch {}
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  const filtrado = useMemo(() => {
    if (!busca.trim()) return devs;
    const q = busca.toLowerCase();
    return devs.filter(d =>
      d.nome.toLowerCase().includes(q) ||
      d.habilidades.toLowerCase().includes(q)
    );
  }, [devs, busca]);

  const header = (
    <>
      {/* Barra de busca */}
      <View style={styles.searchRow}>
        <Ionicons name="search-outline" size={18} color={Colors.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por nome ou habilidade..."
          placeholderTextColor={Colors.textSecondary}
          value={busca}
          onChangeText={setBusca}
          returnKeyType="search"
        />
        {busca.length > 0 && (
          <Pressable onPress={() => setBusca('')} hitSlop={8}>
            <Ionicons name="close-circle" size={18} color={Colors.textSecondary} />
          </Pressable>
        )}
      </View>

      {/* Banner hero — abaixo da busca */}
      <Image
        source={require('@/assets/images/banner-empresa.jpg')}
        style={styles.banner}
        contentFit="contain"
      />

      <Text style={styles.sectionLabel}>
        {filtrado.length > 0 ? `${filtrado.length} desenvolvedor${filtrado.length > 1 ? 'es' : ''} disponíve${filtrado.length > 1 ? 'is' : 'l'}` : 'Nenhum resultado'}
      </Text>
    </>
  );

  const renderDev: ListRenderItem<Desenvolvedor> = ({ item }) => (
    <DevCard
      dev={item}
      onPress={() => router.push({
        pathname: '/(app)/desenvolvedor-detalhe',
        params: {
          id: item.id,
          nome: item.nome,
          precoPorHora: String(item.precoPorHora),
          descricao: item.descricao,
          sobreMim: item.sobreMim,
          habilidades: item.habilidades,
          certificacoes: item.certificacoes,
          projetos: JSON.stringify(item.projetos),
        },
      } as Href)}
    />
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        {header}
        <ActivityIndicator color={Colors.primary} style={{ marginTop: 40 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <FlatList
        data={filtrado}
        keyExtractor={item => item.id}
        ListHeaderComponent={header}
        renderItem={renderDev}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); carregar(); }}
            tintColor={Colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="people-outline" size={48} color={Colors.textSecondary} />
            <Text style={styles.emptyText}>Nenhum desenvolvedor encontrado</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

// ─── Tela dev: marketplace ────────────────────────────────────────────────────

function HomeDev() {
  const router = useRouter();
  const [projetos, setProjetos] = useState<ProjetoEmpresa[]>([]);
  const [busca, setBusca] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const carregar = useCallback(async () => {
    try {
      const raw = await api.get<any[]>('/projetos');
      const data: ProjetoEmpresa[] = raw.map(p => ({
        id: String(p.idProjeto),
        empresaId: String(p.idCliente),
        titulo: p.titulo,
        descricao: p.descricao,
        orcamento: p.orcamento,
        prazo: p.prazo,
        modalidades: [p.modalidade ?? 'H'],
        stack: typeof p.stack === 'string' ? JSON.parse(p.stack) : (p.stack ?? []),
        status: p.status ?? 'ativo',
        candidaturas: [],
        dataCriacao: new Date(p.dataCriacao ?? Date.now()),
      }));
      setProjetos(data as ProjetoEmpresa[]);
    } catch {}
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  const filtrado = useMemo(() => {
    if (!busca.trim()) return projetos;
    const q = busca.toLowerCase();
    return projetos.filter(p =>
      p.titulo.toLowerCase().includes(q) ||
      p.descricao?.toLowerCase().includes(q) ||
      p.stack?.some(s => s.toLowerCase().includes(q))
    );
  }, [projetos, busca]);

  const header = (
    <>
      <View style={styles.topHeader}>
        <Text style={styles.topTitle}>Marketplace</Text>
        <Text style={styles.topSubtitle}>Encontre projetos para trabalhar</Text>
      </View>

      <View style={styles.searchRow}>
        <Ionicons name="search-outline" size={18} color={Colors.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar projetos, stack..."
          placeholderTextColor={Colors.textSecondary}
          value={busca}
          onChangeText={setBusca}
          returnKeyType="search"
        />
        {busca.length > 0 && (
          <Pressable onPress={() => setBusca('')} hitSlop={8}>
            <Ionicons name="close-circle" size={18} color={Colors.textSecondary} />
          </Pressable>
        )}
      </View>

      <Text style={styles.sectionLabel}>
        {filtrado.length > 0 ? `${filtrado.length} projeto${filtrado.length > 1 ? 's' : ''} disponíve${filtrado.length > 1 ? 'is' : 'l'}` : ''}
      </Text>
    </>
  );

  const renderProjeto: ListRenderItem<ProjetoEmpresa> = ({ item }) => (
    <ProjetoCard
      projeto={item}
      onPress={() => router.push({
        pathname: '/(app)/projeto-detalhe',
        params: { id: item.id },
      } as Href)}
    />
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        {header}
        <ActivityIndicator color={Colors.primary} style={{ marginTop: 40 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <FlatList
        data={filtrado}
        keyExtractor={item => String(item.id)}
        ListHeaderComponent={header}
        renderItem={renderProjeto}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); carregar(); }}
            tintColor={Colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="briefcase-outline" size={48} color={Colors.textSecondary} />
            <Text style={styles.emptyText}>Nenhum projeto no momento</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function InicioTab() {
  const { user } = useAuth();
  return user?.type === 'client' ? <HomeEmpresa /> : <HomeDev />;
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },

  banner: {
    width: '80%',
    aspectRatio: 2400 / 1792, // proporção real da imagem
    borderRadius: 28,
    alignSelf: 'center',
    marginVertical: 12,
    overflow: 'hidden',
  },

  topHeader: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  topTitle: { fontSize: 26, fontWeight: '800', color: Colors.text },
  topSubtitle: { fontSize: 14, color: Colors.textSecondary, marginTop: 2 },

  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  searchInput: { flex: 1, fontSize: 15, color: Colors.text },

  sectionLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600',
    marginHorizontal: 20,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },

  listContent: { paddingHorizontal: 16, paddingBottom: 20 },

  card: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 8,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  devAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surfaceHighlight,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  devAvatarImg: { width: 44, height: 44, borderRadius: 22 },
  cardNome: { fontSize: 15, fontWeight: '700', color: Colors.text },
  cardPreco: { fontSize: 13, color: Colors.primary, fontWeight: '600', marginTop: 2 },
  cardDesc: { fontSize: 13, color: Colors.textSecondary, lineHeight: 18 },

  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary + '22',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  chipText: { fontSize: 11, color: Colors.primary, fontWeight: '600' },

  precoTag: {
    backgroundColor: Colors.primary + '22',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    flexShrink: 0,
  },
  precoText: { fontSize: 12, fontWeight: '700', color: Colors.primary },

  empty: { alignItems: 'center', justifyContent: 'center', paddingTop: 60, gap: 12 },
  emptyText: { fontSize: 15, color: Colors.textSecondary },
});
