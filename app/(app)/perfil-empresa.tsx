// perfil-empresa.tsx — Prévia pública do perfil da empresa (somente leitura).
// Exibe dados da empresa buscados via GET /clientes/:idCliente.
// Segue o mesmo estilo visual de sobre-mim.tsx.

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors } from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/services/api';

// ─── Tipos ────────────────────────────────────────────────────────────────────

type EmpresaData = {
  empresa: string | null;
  descricao: string | null;
  segmento: string | null;
  tamanho: string | null;
  site: string | null;
  anoFundacao: string | null;
  cidade: string | null;
  estado: string | null;
  modalidadePreferida: string | null;
  nome: string;
  totalProjetos: number;
  projetosAtivos: number;
  tecnologiasBuscadas: string[];
};

// ─── Componentes auxiliares ───────────────────────────────────────────────────

function SectionHeader({ title }: { title: string }) {
  return (
    <View style={styles.sectionHeaderRow}>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );
}

function Chip({ label }: { label: string }) {
  return (
    <View style={styles.chip}>
      <Text style={styles.chipText}>{label}</Text>
    </View>
  );
}

function InfoRow({
  icon,
  label,
  value,
  onPress,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  value: string;
  onPress?: () => void;
}) {
  return (
    <Pressable style={styles.infoRow} onPress={onPress} disabled={!onPress}>
      <View style={styles.infoIconWrap}>
        <Ionicons name={icon} size={18} color={Colors.primary} />
      </View>
      <View style={styles.infoTextWrap}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={[styles.infoValue, onPress && styles.infoValueLink]}>{value}</Text>
      </View>
      {onPress && <Ionicons name="open-outline" size={14} color={Colors.textSecondary} />}
    </Pressable>
  );
}

function EmptyHint({ text }: { text: string }) {
  return <Text style={styles.emptyHint}>{text}</Text>;
}

// ─── Tela ─────────────────────────────────────────────────────────────────────

export default function PerfilEmpresaScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const idCliente = user?.idCliente;

  const [empresa, setEmpresa] = useState<EmpresaData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [erro, setErro] = useState(false);
  const hasFetched = useRef(false);

  async function carregar() {
    if (!idCliente) { setIsLoading(false); return; }
    setErro(false);
    setIsLoading(true);
    try {
      const data = await api.get<EmpresaData>(`/clientes/${idCliente}`);
      setEmpresa(data);
    } catch {
      setErro(true);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    carregar();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const displayName = empresa?.empresa || empresa?.nome || user?.name || 'Empresa';

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Meu Perfil</Text>
        <View style={{ width: 40 }} />
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : erro ? (
        <View style={styles.center}>
          <Ionicons name="alert-circle-outline" size={48} color={Colors.error} />
          <Text style={styles.erroText}>Erro ao carregar perfil. Tente novamente.</Text>
          <Pressable style={styles.retryBtn} onPress={carregar}>
            <Text style={styles.retryText}>Tentar novamente</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

          {/* Hero */}
          <View style={styles.heroSection}>
            <View style={styles.avatarWrap}>
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="business-outline" size={48} color={Colors.textSecondary} />
              </View>
            </View>
            <Text style={styles.nome}>{displayName}</Text>
            <View style={styles.tagsRow}>
              {empresa?.segmento ? <Chip label={empresa.segmento} /> : null}
              {empresa?.tamanho ? <Chip label={`${empresa.tamanho} pessoas`} /> : null}
            </View>
          </View>

          {/* Sobre a empresa */}
          <View style={styles.section}>
            <SectionHeader title="Sobre a Empresa" />
            <View style={styles.textCard}>
              {empresa?.descricao ? (
                <Text style={styles.bioText}>{empresa.descricao}</Text>
              ) : (
                <EmptyHint text="Nenhuma descrição cadastrada ainda." />
              )}
            </View>
          </View>

          {/* Localização */}
          <View style={styles.section}>
            <SectionHeader title="Localização" />
            {empresa?.cidade || empresa?.estado ? (
              <View style={styles.locRow}>
                <Ionicons name="location-outline" size={16} color={Colors.primary} />
                <Text style={styles.locText}>
                  {[empresa.cidade, empresa.estado].filter(Boolean).join(', ')}
                </Text>
              </View>
            ) : (
              <EmptyHint text="Localização não informada." />
            )}
          </View>

          {/* Informações */}
          {(empresa?.site || empresa?.anoFundacao || empresa?.modalidadePreferida) ? (
            <View style={styles.section}>
              <SectionHeader title="Informações" />
              <View style={styles.infoCard}>
                {empresa?.site ? (
                  <InfoRow
                    icon="globe-outline"
                    label="Site"
                    value={empresa.site}
                    onPress={() => Linking.openURL(empresa.site!)}
                  />
                ) : null}
                {empresa?.anoFundacao ? (
                  <InfoRow icon="calendar-outline" label="Fundada em" value={empresa.anoFundacao} />
                ) : null}
                {empresa?.modalidadePreferida ? (
                  <InfoRow icon="briefcase-outline" label="Modalidade" value={empresa.modalidadePreferida} />
                ) : null}
              </View>
            </View>
          ) : null}

          {/* Na plataforma */}
          <View style={styles.section}>
            <SectionHeader title="Na Plataforma" />
            {(empresa?.totalProjetos ?? 0) > 0 ? (
              <View style={styles.statsCard}>
                <View style={styles.statsRow}>
                  <View style={styles.statItem}>
                    <Text style={styles.statNumber}>{empresa?.totalProjetos ?? 0}</Text>
                    <Text style={styles.statLabel}>projetos publicados</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statItem}>
                    <Text style={styles.statNumber}>{empresa?.projetosAtivos ?? 0}</Text>
                    <Text style={styles.statLabel}>projetos ativos</Text>
                  </View>
                </View>
                {(empresa?.tecnologiasBuscadas?.length ?? 0) > 0 && (
                  <View style={styles.techSection}>
                    <Text style={styles.techLabel}>Tecnologias mais buscadas</Text>
                    <View style={styles.chipsWrap}>
                      {empresa!.tecnologiasBuscadas.map((t) => (
                        <Chip key={t} label={t} />
                      ))}
                    </View>
                  </View>
                )}
              </View>
            ) : (
              <EmptyHint text="Nenhum projeto publicado ainda." />
            )}
          </View>

        </ScrollView>
      )}
    </SafeAreaView>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const PADDING = 20;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
    textAlign: 'center',
  },

  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24 },
  erroText: { fontSize: 15, color: Colors.textSecondary, textAlign: 'center' },
  retryBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  retryText: { color: Colors.text, fontWeight: '700', fontSize: 14 },

  scroll: { paddingBottom: 48 },

  // Hero
  heroSection: {
    alignItems: 'center',
    paddingVertical: 28,
    paddingHorizontal: PADDING,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 10,
  },
  avatarWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    overflow: 'hidden',
    backgroundColor: Colors.surfaceHighlight,
    borderWidth: 2,
    borderColor: Colors.primary,
    marginBottom: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  nome: { fontSize: 22, fontWeight: '800', color: Colors.text, textAlign: 'center' },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },

  // Seções
  section: {
    paddingHorizontal: PADDING,
    paddingTop: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  sectionHeaderRow: { marginBottom: 14 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },

  // Bio
  textCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
  },
  bioText: { fontSize: 15, color: Colors.text, lineHeight: 24 },

  // Localização
  locRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  locText: { fontSize: 15, color: Colors.text, fontWeight: '500' },

  // InfoRows
  infoCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  infoIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(79,110,247,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoTextWrap: { flex: 1 },
  infoLabel: { fontSize: 11, color: Colors.textSecondary, fontWeight: '600', marginBottom: 2 },
  infoValue: { fontSize: 14, color: Colors.text, fontWeight: '500' },
  infoValueLink: { color: Colors.primary },

  // Stats
  statsCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  statsRow: {
    flexDirection: 'row',
    padding: 20,
  },
  statItem: { flex: 1, alignItems: 'center', gap: 4 },
  statNumber: { fontSize: 28, fontWeight: '800', color: Colors.primary },
  statLabel: { fontSize: 12, color: Colors.textSecondary, textAlign: 'center' },
  statDivider: { width: 1, backgroundColor: Colors.border, marginVertical: 4 },
  techSection: { padding: 16, borderTopWidth: 1, borderTopColor: Colors.border, gap: 12 },
  techLabel: { fontSize: 12, fontWeight: '700', color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.6 },
  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },

  // Chips
  chip: {
    backgroundColor: Colors.surfaceHighlight,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipText: { fontSize: 13, color: Colors.primary, fontWeight: '600' },

  emptyHint: { fontSize: 13, color: Colors.textSecondary, fontStyle: 'italic', paddingVertical: 4 },
});
