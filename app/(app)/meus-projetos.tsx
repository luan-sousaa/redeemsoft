import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter, useLocalSearchParams } from 'expo-router';
import type { Href } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

import { Colors } from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { authService, type Candidatura, type Desenvolvedor, type ProjetoEmpresa } from '@/services/authService';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  ativo:        { label: 'Ativo',        color: Colors.primary, icon: 'radio-button-on-outline' as const },
  em_andamento: { label: 'Em andamento', color: '#F5A623',      icon: 'construct-outline' as const },
  concluido:    { label: 'Concluído',    color: '#4CAF50',      icon: 'checkmark-circle-outline' as const },
};

const CAND_STATUS_CONFIG = {
  pendente: { label: 'Pendente', color: Colors.textSecondary, bg: Colors.surfaceHighlight },
  aceito:   { label: 'Aceito',   color: '#4CAF50',            bg: 'rgba(76,175,80,0.12)' },
  recusado: { label: 'Recusado', color: Colors.error,         bg: 'rgba(232,69,96,0.12)' },
};

const AVATAR_COLORS = ['#4F6EF7', '#E84560', '#F5A623', '#4CAF50', '#9C27B0', '#00BCD4'];
function nameToColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

// ─── Card do candidato (inline) ───────────────────────────────────────────────

function CandidatoCard({
  cand,
  dev,
  projetoId,
  projetoTitulo,
  projetoOrcamento,
  onRecusar,
  onVerDev,
  onContratar,
}: {
  cand: Candidatura;
  dev: Desenvolvedor | undefined;
  projetoId: string;
  projetoTitulo: string;
  projetoOrcamento: number;
  onRecusar: (cand: Candidatura) => void;
  onVerDev: (devId: string) => void;
  onContratar: (cand: Candidatura) => void;
}) {
  const cfg = CAND_STATUS_CONFIG[cand.status];
  const nome = dev?.nome ?? cand.nomeDesenvolvedor ?? 'Desenvolvedor';

  return (
    <View style={styles.candCard}>
      {/* Topo: avatar + nome + status */}
      <Pressable style={styles.candHeader} onPress={() => onVerDev(String(cand.desenvolvedorId))}>
        <View style={[styles.avatar, { backgroundColor: nameToColor(nome) }]}>
          {cand.foto ? (
            <Image source={{ uri: cand.foto }} style={styles.avatarImg} contentFit="cover" />
          ) : (
            <Text style={styles.avatarLetter}>{nome.charAt(0).toUpperCase()}</Text>
          )}
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.candNome}>{nome}</Text>
          {dev?.descricao ? (
            <Text style={styles.candDesc} numberOfLines={1}>{dev.descricao}</Text>
          ) : null}
        </View>

        <View style={[styles.statusBadge, { backgroundColor: cfg.bg }]}>
          <Text style={[styles.statusText, { color: cfg.color }]}>{cfg.label}</Text>
        </View>

        <Ionicons name="chevron-forward" size={16} color={Colors.textSecondary} />
      </Pressable>

      {/* Proposta + prazo */}
      <View style={styles.candDetails}>
        <View style={styles.detailItem}>
          <Ionicons name="cash-outline" size={14} color={Colors.primary} />
          <Text style={styles.detailText}>
            {cand.proposta.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 })}
          </Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="time-outline" size={14} color={Colors.primary} />
          <Text style={styles.detailText}>{cand.prazo}</Text>
        </View>
      </View>

      {/* Ações (apenas pendente) */}
      {cand.status === 'pendente' && (
        <View style={styles.candActions}>
          <Pressable style={[styles.actionBtn, styles.actionRecusar]} onPress={() => onRecusar(cand)}>
            <Ionicons name="close" size={15} color={Colors.error} />
            <Text style={[styles.actionText, { color: Colors.error }]}>Recusar</Text>
          </Pressable>
          <Pressable style={[styles.actionBtn, styles.actionContratar]} onPress={() => onContratar(cand)}>
            <Ionicons name="checkmark" size={15} color={Colors.text} />
            <Text style={styles.actionText}>Contratar</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

// ─── Tela principal ───────────────────────────────────────────────────────────

export default function MeusProjetosScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { projetoId } = useLocalSearchParams<{ projetoId: string }>();
  const navegandoRef = useRef(false);

  const [projeto, setProjeto] = useState<ProjetoEmpresa | null>(null);
  const [desenvolvedores, setDesenvolvedores] = useState<Desenvolvedor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const carregar = useCallback(async () => {
    if (!user) return;
    try {
      const [todos, devs] = await Promise.all([
        authService.getProjetosEmpresa(user.id),
        authService.getDesenvolvedores(),
      ]);
      const encontrado = projetoId
        ? todos.find(p => String(p.id) === String(projetoId)) ?? todos[0] ?? null
        : todos[0] ?? null;
      setProjeto(encontrado);
      setDesenvolvedores(devs);
    } catch {
      Toast.show({ type: 'error', text1: 'Erro ao carregar projeto' });
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [user, projetoId]);

  useEffect(() => { carregar(); }, [carregar]);

  const devMap = Object.fromEntries(desenvolvedores.map(d => [d.id, d]));

  function handleRecusar(cand: Candidatura) {
    const dev = devMap[cand.desenvolvedorId];
    Alert.alert(
      'Recusar candidatura',
      `Tem certeza que deseja recusar ${dev?.nome ?? 'este candidato'}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Recusar',
          style: 'destructive',
          onPress: () => {
            authService.atualizarStatusCandidatura(projeto!.id, cand.id, 'recusado')
              .then(() => {
                Toast.show({ type: 'success', text1: 'Candidato recusado' });
                carregar();
              })
              .catch(() => Toast.show({ type: 'error', text1: 'Erro', text2: 'Tente novamente.' }));
          },
        },
      ]
    );
  }

  function handleVerDev(devId: string) {
    if (navegandoRef.current) return;
    navegandoRef.current = true;
    setTimeout(() => {
      router.push({ pathname: '/(app)/desenvolvedor-detalhe', params: { id: devId } });
      navegandoRef.current = false;
    }, 100);
  }

  function handleContratar(cand: Candidatura) {
    if (!projeto || navegandoRef.current) return;
    navegandoRef.current = true;
    setTimeout(() => {
      router.push({
        pathname: '/(app)/confirmar-contratacao',
        params: {
          devId: String(cand.desenvolvedorId),
          candidaturaId: String(cand.id),
          projetoId: String(projeto.id),
          projetoNome: projeto.titulo,
          valorProjeto: String(Math.round((cand.proposta || projeto.orcamento) * 100)),
        },
      });
      navegandoRef.current = false;
    }, 100);
  }

  const pendentes = projeto?.candidaturas.filter(c => c.status === 'pendente').length ?? 0;
  const cfg = projeto ? STATUS_CONFIG[projeto.status] : null;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>

      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Candidaturas</Text>
          {pendentes > 0 && (
            <Text style={styles.headerSub}>
              {pendentes} pendente{pendentes !== 1 ? 's' : ''}
            </Text>
          )}
        </View>
        <Pressable style={styles.addBtn} onPress={() => router.push('/(app)/criar-projeto' as Href)}>
          <Ionicons name="add" size={22} color={Colors.text} />
        </Pressable>
      </View>

      {isLoading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : !projeto ? (
        <View style={styles.empty}>
          <Ionicons name="briefcase-outline" size={56} color={Colors.textSecondary} />
          <Text style={styles.emptyTitle}>Projeto não encontrado</Text>
          <Pressable style={styles.emptyBtn} onPress={() => router.back()}>
            <Text style={styles.emptyBtnText}>Voltar</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); carregar(); }} tintColor={Colors.primary} />
          }
        >
          {/* Card do projeto */}
          <View style={styles.projetoCard}>
            <View style={styles.projetoTop}>
              <Text style={styles.projetoTitulo}>{projeto.titulo}</Text>
              <View style={styles.orcamentoTag}>
                <Text style={styles.orcamentoText}>
                  {projeto.orcamento.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 })}
                </Text>
              </View>
            </View>

            {cfg && (
              <View style={[styles.projetoStatus, { borderColor: cfg.color }]}>
                <Ionicons name={cfg.icon} size={11} color={cfg.color} />
                <Text style={[styles.projetoStatusText, { color: cfg.color }]}>{cfg.label}</Text>
              </View>
            )}

            <Text style={styles.projetoDesc}>{projeto.descricao}</Text>

            {/* Tecnologias */}
            <View style={styles.metaItem}>
              <Ionicons name="code-slash-outline" size={13} color={Colors.textSecondary} />
              <Text style={styles.metaText}>{projeto.stack}</Text>
            </View>

            {/* Prazo */}
            <View style={styles.metaItem}>
              <Ionicons name="calendar-outline" size={13} color={Colors.textSecondary} />
              <Text style={styles.metaText}>Entrega: {projeto.prazo}</Text>
            </View>

            {/* Modalidades */}
            {projeto.modalidades && projeto.modalidades.length > 0 && (
              <View style={styles.modalidadesRow}>
                {projeto.modalidades.map(m => (
                  <View key={m} style={styles.modalidadeChip}>
                    <Text style={styles.modalidadeChipText}>
                      {m === 'P' ? 'Presencial' : m === 'SP' ? 'Semi-presencial' : m === 'H' ? 'Home Office' : m}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {/* Data de criação */}
            {projeto.dataCriacao && (
              <View style={styles.metaItem}>
                <Ionicons name="time-outline" size={13} color={Colors.textSecondary} />
                <Text style={styles.metaText}>
                  Publicado em {new Date(projeto.dataCriacao).toLocaleDateString('pt-BR')}
                </Text>
              </View>
            )}

            {/* Botão de chat se em andamento */}
            {projeto.status === 'em_andamento' && (
              <Pressable
                style={styles.chatBtn}
                onPress={async () => {
                  try {
                    const c = await authService.getContratoPorProjeto(projeto.id);
                    router.push({
                      pathname: '/(app)/chat-conversa' as Href,
                      params: { contratoId: String(c.id), projetoTitulo: projeto.titulo },
                    });
                  } catch {
                    Toast.show({ type: 'error', text1: 'Contrato não encontrado.' });
                  }
                }}
              >
                <Ionicons name="chatbubbles-outline" size={16} color={Colors.text} />
                <Text style={styles.chatBtnText}>Abrir Chat</Text>
              </Pressable>
            )}
          </View>

          {/* Seção de candidatos */}
          <View style={styles.secaoHeader}>
            <Text style={styles.secaoTitulo}>
              Candidatos · {projeto.candidaturas.length}
            </Text>
          </View>

          {projeto.candidaturas.length === 0 ? (
            <View style={styles.semCandidatos}>
              <Ionicons name="people-outline" size={44} color={Colors.textSecondary} />
              <Text style={styles.semCandidatosText}>Nenhum candidato ainda</Text>
              <Text style={styles.semCandidatosSubtext}>Os devs interessados aparecerão aqui</Text>
            </View>
          ) : (
            projeto.candidaturas.map(cand => (
              <CandidatoCard
                key={cand.id}
                cand={cand}
                dev={devMap[cand.desenvolvedorId]}
                projetoId={String(projeto.id)}
                projetoTitulo={projeto.titulo}
                projetoOrcamento={projeto.orcamento}
                onRecusar={handleRecusar}
                onVerDev={handleVerDev}
                onContratar={handleContratar}
              />
            ))
          )}
        </ScrollView>
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
  headerSub: { fontSize: 12, color: Colors.primary, fontWeight: '600', marginTop: 2 },
  addBtn: {
    width: 40, height: 40,
    backgroundColor: Colors.primary,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },

  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll: { padding: 16, paddingBottom: 48 },

  // ─── Projeto ───────────────────────────────────────────────────────────────
  projetoCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 20,
    gap: 10,
  },
  projetoTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  projetoTitulo: { flex: 1, fontSize: 17, fontWeight: '800', color: Colors.text },
  orcamentoTag: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  orcamentoText: { fontSize: 13, fontWeight: '700', color: Colors.text },
  projetoStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  projetoStatusText: { fontSize: 11, fontWeight: '600' },
  projetoDesc: { fontSize: 13, color: Colors.textSecondary, lineHeight: 20 },
  projetoMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 12, color: Colors.textSecondary },
  metaDot: { width: 3, height: 3, borderRadius: 2, backgroundColor: Colors.border },

  modalidadesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  modalidadeChip: {
    backgroundColor: Colors.surfaceHighlight,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modalidadeChipText: { fontSize: 11, fontWeight: '600', color: Colors.textSecondary },
  chatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: Colors.primary,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginTop: 4,
  },
  chatBtnText: { fontSize: 13, fontWeight: '700', color: Colors.text },

  // ─── Seção candidatos ──────────────────────────────────────────────────────
  secaoHeader: { marginBottom: 12 },
  secaoTitulo: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },

  semCandidatos: { alignItems: 'center', paddingVertical: 48, gap: 10 },
  semCandidatosText: { fontSize: 16, fontWeight: '700', color: Colors.text },
  semCandidatosSubtext: { fontSize: 13, color: Colors.textSecondary },

  // ─── Card candidato ────────────────────────────────────────────────────────
  candCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 10,
    gap: 10,
  },
  candHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden', flexShrink: 0,
  },
  avatarImg: { width: 44, height: 44, borderRadius: 22 },
  avatarLetter: { fontSize: 18, fontWeight: '800', color: '#fff' },
  candNome: { fontSize: 14, fontWeight: '700', color: Colors.text },
  candDesc: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  statusBadge: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  statusText: { fontSize: 11, fontWeight: '700' },

  candDetails: { flexDirection: 'row', gap: 16 },
  detailItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  detailText: { fontSize: 13, fontWeight: '600', color: Colors.text },

  candActions: { flexDirection: 'row', gap: 10 },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
  },
  actionRecusar: { borderColor: Colors.error, backgroundColor: 'rgba(232,69,96,0.08)' },
  actionContratar: { borderColor: Colors.primary, backgroundColor: Colors.primary },
  actionText: { fontSize: 13, fontWeight: '700', color: Colors.text },

  // ─── Empty ─────────────────────────────────────────────────────────────────
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: Colors.text },
  emptyBtn: { backgroundColor: Colors.primary, borderRadius: 12, paddingHorizontal: 24, paddingVertical: 10 },
  emptyBtnText: { fontSize: 14, fontWeight: '700', color: Colors.text },
});
