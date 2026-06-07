import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import type { Href } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
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

// ─── Status labels ─────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  ativo: { label: 'Ativo', color: Colors.primary, icon: 'radio-button-on-outline' as const },
  em_andamento: { label: 'Em andamento', color: '#F5A623', icon: 'construct-outline' as const },
  concluido: { label: 'Concluído', color: '#4CAF50', icon: 'checkmark-circle-outline' as const },
};

const CAND_STATUS_CONFIG = {
  pendente: { label: 'Pendente', color: Colors.textSecondary, bg: Colors.surfaceHighlight },
  aceito: { label: 'Aceito', color: '#4CAF50', bg: 'rgba(76,175,80,0.12)' },
  recusado: { label: 'Recusado', color: Colors.error, bg: 'rgba(232,69,96,0.12)' },
};

// ─── Modal de candidatos ────────────────────────────────────────────────────────

function CandidatosModal({
  projeto,
  desenvolvedores,
  onClose,
  onUpdate,
}: {
  projeto: ProjetoEmpresa;
  desenvolvedores: Desenvolvedor[];
  onClose: () => void;
  onUpdate: () => void;
}) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const devMap = Object.fromEntries(desenvolvedores.map((d) => [d.id, d]));

  async function handleStatus(cand: Candidatura, status: 'aceito' | 'recusado') {
    setLoadingId(cand.id);
    const dev = devMap[cand.desenvolvedorId];
    try {
      await authService.atualizarStatusCandidatura(projeto.id, cand.id, status);
      if (status === 'aceito') {
        // Navega para checkout para iniciar o pagamento
        router.push({
          pathname: '/(app)/checkout',
          params: {
            amount: String(Math.round((cand.proposta || projeto.orcamento) * 100)),
            description: projeto.titulo,
            projetoNome: projeto.titulo,
            devNome: dev?.nome ?? cand.nomeDesenvolvedor ?? 'Desenvolvedor',
            projetoId: projeto.id,
            candidaturaId: cand.id,
          },
        });
      } else {
        Toast.show({
          type: 'success',
          text1: 'Candidato recusado',
          text2: `${dev?.nome ?? 'Desenvolvedor'} foi recusado com sucesso.`,
        });
        onUpdate();
      }
    } catch {
      Toast.show({ type: 'error', text1: 'Erro', text2: 'Tente novamente.' });
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <Modal visible animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={modal.safe}>
        {/* Header */}
        <View style={modal.header}>
          <Pressable onPress={onClose} style={modal.closeBtn}>
            <Ionicons name="chevron-down" size={24} color={Colors.textSecondary} />
          </Pressable>
          <Text style={modal.title} numberOfLines={1}>{projeto.titulo}</Text>
          <View style={{ width: 40 }} />
        </View>

        <Text style={modal.subtitle}>
          {projeto.candidaturas.length} candidato{projeto.candidaturas.length !== 1 ? 's' : ''}
        </Text>

        {projeto.candidaturas.length === 0 ? (
          <View style={modal.empty}>
            <Ionicons name="people-outline" size={52} color={Colors.surfaceHighlight} />
            <Text style={modal.emptyText}>Nenhum candidato ainda</Text>
            <Text style={modal.emptySubtext}>Os devs interessados aparecerão aqui</Text>
          </View>
        ) : (
          <ScrollView contentContainerStyle={modal.list} showsVerticalScrollIndicator={false}>
            {projeto.candidaturas.map((cand) => {
              const cfg = CAND_STATUS_CONFIG[cand.status];
              const isLoading = loadingId === cand.id;
              const dev = devMap[cand.desenvolvedorId];
              return (
                <View key={cand.id} style={modal.card}>
                  {/* Toque abre o perfil completo do desenvolvedor */}
                  <Pressable
                    style={modal.cardTappable}
                    onPress={() => router.push({
                      pathname: '/(app)/desenvolvedor-detalhe',
                      params: {
                        id: cand.desenvolvedorId,
                        candidaturaId: cand.id,
                        projetoId: projeto.id,
                      },
                    })}
                  >
                    <View style={modal.cardHeader}>
                      <View style={modal.avatar}>
                        <Text style={modal.avatarLetter}>{dev?.nome.charAt(0) ?? '?'}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={modal.candName}>{dev?.nome ?? cand.nomeDesenvolvedor || 'Desconhecido'}</Text>
                        <Text style={modal.candEmail}>{dev?.descricao ?? ''}</Text>
                      </View>
                      <View style={[modal.statusBadge, { backgroundColor: cfg.bg }]}>
                        <Text style={[modal.statusText, { color: cfg.color }]}>{cfg.label}</Text>
                      </View>
                      <Ionicons name="chevron-forward-outline" size={16} color={Colors.textSecondary} />
                    </View>

                    {/* Detalhes */}
                    <Text style={modal.experiencia}>{cand.experiencia}</Text>

                  <View style={modal.detailsRow}>
                    <View style={modal.detail}>
                      <Ionicons name="cash-outline" size={14} color={Colors.primary} />
                      <Text style={modal.detailText}>
                        {cand.proposta.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 })}
                      </Text>
                    </View>
                    <View style={modal.detail}>
                      <Ionicons name="time-outline" size={14} color={Colors.primary} />
                      <Text style={modal.detailText}>{cand.prazo}</Text>
                    </View>
                  </View>
                  </Pressable>

                  {/* Ações fora do Pressable para não acionar navegação */}
                  {cand.status === 'pendente' && (
                    <View style={modal.actions}>
                      {isLoading ? (
                        <ActivityIndicator color={Colors.primary} />
                      ) : (
                        <>
                          <Pressable
                            style={[modal.actionBtn, modal.actionRecusar]}
                            onPress={() => handleStatus(cand, 'recusado')}
                          >
                            <Ionicons name="close" size={16} color={Colors.error} />
                            <Text style={[modal.actionText, { color: Colors.error }]}>Recusar</Text>
                          </Pressable>
                          <Pressable
                            style={[modal.actionBtn, modal.actionAceitar]}
                            onPress={() => handleStatus(cand, 'aceito')}
                          >
                            <Ionicons name="checkmark" size={16} color={Colors.text} />
                            <Text style={modal.actionText}>Contratar</Text>
                          </Pressable>
                        </>
                      )}
                    </View>
                  )}
                </View>
              );
            })}
          </ScrollView>
        )}
      </SafeAreaView>
    </Modal>
  );
}

// ─── Card de projeto ────────────────────────────────────────────────────────────

function ProjetoCard({
  projeto,
  onVerCandidatos,
}: {
  projeto: ProjetoEmpresa;
  onVerCandidatos: () => void;
}) {
  const cfg = STATUS_CONFIG[projeto.status];
  const pendentes = projeto.candidaturas.filter((c) => c.status === 'pendente').length;

  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitulo} numberOfLines={2}>{projeto.titulo}</Text>
          <View style={[styles.statusBadge, { borderColor: cfg.color }]}>
            <Ionicons name={cfg.icon} size={11} color={cfg.color} />
            <Text style={[styles.statusText, { color: cfg.color }]}>{cfg.label}</Text>
          </View>
        </View>
        <View style={styles.orcamentoTag}>
          <Text style={styles.orcamentoText}>
            {projeto.orcamento.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 })}
          </Text>
        </View>
      </View>

      <Text style={styles.cardDesc} numberOfLines={2}>{projeto.descricao}</Text>

      <View style={styles.cardFooter}>
        <View style={styles.footerInfo}>
          <Ionicons name="time-outline" size={13} color={Colors.textSecondary} />
          <Text style={styles.footerText}>{projeto.prazo}</Text>
          <View style={styles.dot} />
          <Ionicons name="code-slash-outline" size={13} color={Colors.textSecondary} />
          <Text style={styles.footerText} numberOfLines={1}>{projeto.stack}</Text>
        </View>

        <Pressable style={styles.candBtn} onPress={onVerCandidatos}>
          {pendentes > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{pendentes}</Text>
            </View>
          )}
          <Ionicons name="people-outline" size={16} color={Colors.primary} />
          <Text style={styles.candBtnText}>
            {projeto.candidaturas.length} candidato{projeto.candidaturas.length !== 1 ? 's' : ''}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

// ─── Tela principal ─────────────────────────────────────────────────────────────

export default function MeusProjetosScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [projetos, setProjetos] = useState<ProjetoEmpresa[]>([]);
  const [desenvolvedores, setDesenvolvedores] = useState<Desenvolvedor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [projetoSelecionado, setProjetoSelecionado] = useState<ProjetoEmpresa | null>(null);

  const carregar = useCallback(async () => {
    if (!user) return;
    try {
      const [data, devs] = await Promise.all([
        authService.getProjetosEmpresa(user.id),
        authService.getDesenvolvedores(),
      ]);
      setProjetos(data);
      setDesenvolvedores(devs);
    } catch {
      Toast.show({ type: 'error', text1: 'Erro ao carregar projetos' });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { carregar(); }, [carregar, user]);

  const totalCandPendentes = projetos.reduce(
    (acc, p) => acc + p.candidaturas.filter((c) => c.status === 'pendente').length,
    0
  );

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Candidaturas</Text>
          {totalCandPendentes > 0 && (
            <Text style={styles.headerSub}>
              {totalCandPendentes} candidatura{totalCandPendentes !== 1 ? 's' : ''} pendente{totalCandPendentes !== 1 ? 's' : ''}
            </Text>
          )}
        </View>
        <Pressable
          style={styles.criarBtn}
          onPress={() => router.push('/(app)/criar-projeto' as Href)}
        >
          <Ionicons name="add" size={22} color={Colors.text} />
        </Pressable>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={projetos}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.lista}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="briefcase-outline" size={56} color={Colors.surfaceHighlight} />
              <Text style={styles.emptyText}>Nenhum projeto criado</Text>
              <Pressable
                style={styles.criarEmptyBtn}
                onPress={() => router.push('/(app)/criar-projeto' as Href)}
              >
                <Ionicons name="add-circle-outline" size={18} color={Colors.primary} />
                <Text style={styles.criarEmptyText}>Criar primeiro projeto</Text>
              </Pressable>
            </View>
          }
          renderItem={({ item }) => (
            <ProjetoCard
              projeto={item}
              onVerCandidatos={() => setProjetoSelecionado(item)}
            />
          )}
        />
      )}

      {projetoSelecionado && (
        <CandidatosModal
          projeto={projetoSelecionado}
          desenvolvedores={desenvolvedores}
          onClose={() => setProjetoSelecionado(null)}
          onUpdate={() => { carregar(); setProjetoSelecionado(null); }}
        />
      )}
    </SafeAreaView>
  );
}

// ─── Estilos ────────────────────────────────────────────────────────────────────

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
  criarBtn: {
    width: 40, height: 40,
    backgroundColor: Colors.primary,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  lista: { padding: 16, paddingBottom: 40 },

  card: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardTop: { flexDirection: 'row', gap: 12, marginBottom: 10 },
  cardTitulo: { fontSize: 15, fontWeight: '700', color: Colors.text, marginBottom: 8 },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  statusText: { fontSize: 11, fontWeight: '600' },
  orcamentoTag: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  orcamentoText: { fontSize: 13, fontWeight: '700', color: Colors.text },
  cardDesc: { fontSize: 13, color: Colors.textSecondary, lineHeight: 20, marginBottom: 12 },
  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  footerInfo: { flexDirection: 'row', alignItems: 'center', gap: 5, flex: 1 },
  footerText: { fontSize: 12, color: Colors.textSecondary, flexShrink: 1 },
  dot: { width: 3, height: 3, borderRadius: 2, backgroundColor: Colors.border },
  candBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.surfaceHighlight,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  candBtnText: { fontSize: 12, color: Colors.primary, fontWeight: '600' },
  badge: {
    backgroundColor: Colors.error,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: { fontSize: 10, fontWeight: '800', color: Colors.text },

  emptyContainer: { alignItems: 'center', paddingTop: 80, gap: 12 },
  emptyText: { fontSize: 16, fontWeight: '700', color: Colors.text },
  criarEmptyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  criarEmptyText: { fontSize: 14, color: Colors.primary, fontWeight: '600' },
});

const modal = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  closeBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  title: { flex: 1, fontSize: 16, fontWeight: '700', color: Colors.text, textAlign: 'center' },
  subtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    fontWeight: '500',
  },
  list: { padding: 16, paddingBottom: 40, gap: 12 },
  empty: { alignItems: 'center', paddingTop: 80, gap: 10 },
  emptyText: { fontSize: 16, fontWeight: '700', color: Colors.text },
  emptySubtext: { fontSize: 13, color: Colors.textSecondary },

  card: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 10,
  },
  cardTappable: { gap: 10 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: { fontSize: 18, fontWeight: '800', color: Colors.white },
  candName: { fontSize: 14, fontWeight: '700', color: Colors.text },
  candEmail: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  statusBadge: {
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  statusText: { fontSize: 11, fontWeight: '700' },
  experiencia: { fontSize: 13, color: Colors.textSecondary, lineHeight: 20 },
  detailsRow: { flexDirection: 'row', gap: 16 },
  detail: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  detailText: { fontSize: 13, color: Colors.text, fontWeight: '600' },
  actions: { flexDirection: 'row', gap: 10, paddingTop: 4 },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
  },
  actionRecusar: { borderColor: Colors.error, backgroundColor: 'rgba(232,69,96,0.08)' },
  actionAceitar: { borderColor: Colors.primary, backgroundColor: Colors.primary },
  actionText: { fontSize: 13, fontWeight: '700', color: Colors.text },
});
