import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors } from '@/constants/colors';
import { authService } from '@/services/authService';
import { parseList } from '@/utils/parseList';

const GRID_PADDING = 20;

// ─── Componentes auxiliares (mesmo estilo de sobre-mim.tsx) ───────────────────

function SectionHeader({ title }: { title: string }) {
  return (
    <View style={styles.sectionHeaderRow}>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );
}

function SkillChip({ label }: { label: string }) {
  return (
    <View style={styles.chip}>
      <Text style={styles.chipText}>{label}</Text>
    </View>
  );
}

function CertRow({ label }: { label: string }) {
  return (
    <View style={styles.certRow}>
      <View style={styles.certIconWrap}>
        <Ionicons name="ribbon-outline" size={18} color={Colors.primary} />
      </View>
      <Text style={styles.certText} numberOfLines={2}>{label}</Text>
    </View>
  );
}

function EmptyHint({ text }: { text: string }) {
  return <Text style={styles.emptyHint}>{text}</Text>;
}

// ─── Tela ─────────────────────────────────────────────────────────────────────

export default function DesenvolvedorDetalheScreen() {
  const router = useRouter();
  const { id: rawId } = useLocalSearchParams();
  // Captura o ID uma única vez no mount via ref — evita loop causado por
  // re-renders do Modal/pageSheet que recria o objeto de params a cada render
  const devIdRef = useRef(Array.isArray(rawId) ? rawId[0] : rawId);

  type DevData = {
    nome: string;
    precoPorHora: number | null;
    sobreMim: string | null;
    experiencia: string | null;
    habilidades: string[];
    certificacoes: string[];
    foto: string | null;
    projetos: { titulo: string; stack: string }[];
  };

  const [dev, setDev] = useState<DevData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [erro, setErro] = useState(false);

  async function tentarNovamente() {
    const devId = devIdRef.current;
    if (!devId) return;
    setErro(false);
    setIsLoading(true);
    try {
      const data = await authService.getDevById(devId);
      setDev({
        nome: data.nome,
        precoPorHora: data.precoPorHora,
        sobreMim: data.sobreMim,
        experiencia: data.experiencia,
        habilidades: parseList(data.habilidades),
        certificacoes: parseList(data.certificacoes),
        foto: data.foto ?? null,
        projetos: data.projetos ?? [],
      });
    } catch {
      setErro(true);
    } finally {
      setIsLoading(false);
    }
  }

  // Deps [] → roda apenas no mount. devIdRef.current nunca muda.
  useEffect(() => {
    tentarNovamente();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Perfil do Desenvolvedor</Text>
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
          <Pressable style={styles.retryBtn} onPress={tentarNovamente}>
            <Text style={styles.retryText}>Tentar novamente</Text>
          </Pressable>
        </View>
      ) : dev ? (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

          {/* Hero */}
          <View style={styles.heroSection}>
            <View style={styles.avatarWrap}>
              {dev.foto ? (
                <Image
                  source={{ uri: dev.foto }}
                  style={{ width: 96, height: 96, borderRadius: 48 }}
                  contentFit="cover"
                />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Ionicons name="person-circle-outline" size={56} color={Colors.textSecondary} />
                </View>
              )}
            </View>
            <Text style={styles.nome}>{dev.nome}</Text>
            <View style={styles.typeBadge}>
              <Ionicons name="code-slash-outline" size={12} color={Colors.primary} />
              <Text style={styles.typeBadgeText}>Desenvolvedor</Text>
            </View>
            {dev.precoPorHora != null && (
              <View style={styles.precoBadge}>
                <Text style={styles.precoText}>
                  {dev.precoPorHora.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 })}/h
                </Text>
              </View>
            )}
          </View>

          {/* Sobre Mim */}
          <View style={styles.section}>
            <SectionHeader title="Sobre Mim" />
            <View style={styles.textCard}>
              {dev.sobreMim ? (
                <Text style={styles.bioText}>{dev.sobreMim}</Text>
              ) : (
                <EmptyHint text="Nenhuma descrição cadastrada." />
              )}
            </View>
          </View>

          {/* Experiência */}
          {dev.experiencia && dev.experiencia !== dev.sobreMim ? (
            <View style={styles.section}>
              <SectionHeader title="Experiência" />
              <View style={styles.textCard}>
                <Text style={styles.bioText}>{dev.experiencia}</Text>
              </View>
            </View>
          ) : null}

          {/* Habilidades */}
          <View style={styles.section}>
            <SectionHeader title="Habilidades" />
            {dev.habilidades.length > 0 ? (
              <View style={styles.chipsWrap}>
                {dev.habilidades.map((h) => (
                  <SkillChip key={h} label={h} />
                ))}
              </View>
            ) : (
              <EmptyHint text="Nenhuma habilidade cadastrada." />
            )}
          </View>

          {/* Certificações */}
          <View style={styles.section}>
            <SectionHeader title="Certificações" />
            {dev.certificacoes.length > 0 ? (
              <View style={styles.certList}>
                {dev.certificacoes.map((c) => (
                  <CertRow key={c} label={c} />
                ))}
              </View>
            ) : (
              <EmptyHint text="Nenhuma certificação cadastrada." />
            )}
          </View>

          {/* Projetos em que o dev foi aceito */}
          <View style={styles.section}>
            <SectionHeader title="Projetos" />
            {dev.projetos.length > 0 ? (
              <View style={styles.projetosGrid}>
                {dev.projetos.map((p, i) => (
                  <View key={i} style={styles.projetoCard}>
                    <Ionicons name="briefcase-outline" size={18} color={Colors.primary} />
                    <Text style={styles.projetoTitulo} numberOfLines={2}>{p.titulo}</Text>
                    <Text style={styles.projetoStack} numberOfLines={1}>{p.stack}</Text>
                  </View>
                ))}
              </View>
            ) : (
              <EmptyHint text="Nenhum projeto cadastrado." />
            )}
          </View>

        </ScrollView>
      ) : null}
    </SafeAreaView>
  );
}

// ─── Estilos (espelham sobre-mim.tsx) ─────────────────────────────────────────

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
    fontSize: 18,
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

  heroSection: {
    alignItems: 'center',
    paddingVertical: 28,
    paddingHorizontal: GRID_PADDING,
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
  },
  avatarPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nome: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
    textAlign: 'center',
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  typeBadgeText: { fontSize: 12, color: Colors.primary, fontWeight: '600' },
  precoBadge: {
    backgroundColor: Colors.surfaceHighlight,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  precoText: { fontSize: 13, color: Colors.text, fontWeight: '700' },

  section: {
    paddingHorizontal: GRID_PADDING,
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

  textCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
  },
  bioText: { fontSize: 15, color: Colors.text, lineHeight: 24 },

  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    backgroundColor: Colors.surfaceHighlight,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipText: { fontSize: 13, color: Colors.primary, fontWeight: '600' },

  certList: { gap: 10 },
  certRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 12,
  },
  certIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(79,110,247,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  certText: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
    lineHeight: 20,
  },

  emptyHint: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    paddingVertical: 4,
  },

  projetosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  projetoCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
    width: '47%',
    gap: 8,
  },
  projetoTitulo: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text,
    lineHeight: 18,
  },
  projetoStack: {
    fontSize: 11,
    color: Colors.primary,
    fontWeight: '600',
  },
});
