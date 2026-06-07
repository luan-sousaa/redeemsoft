// sobre-mim.tsx — Prévia pública do perfil do desenvolvedor (somente leitura).
// Exibe foto, nome, bio, habilidades (chips), certificações (lista) e projetos (grid).
// Dados vêm de ProfileContext (AsyncStorage + API) e AuthContext.
// Acessível via DrawerMenu ("Meu Perfil") e configuracoes ("Ver prévia do perfil").

import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors } from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/contexts/ProfileContext';

const { width } = Dimensions.get('window');
const GRID_GAP = 12;
const GRID_PADDING = 20;
const CARD_SIZE = (width - GRID_PADDING * 2 - GRID_GAP) / 2;

// ─── Componentes auxiliares ───────────────────────────────────────────────────

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

function ProjetoCard({ uri, index }: { uri: string; index: number }) {
  return (
    <View style={styles.projetoCard}>
      <Image source={{ uri }} style={styles.projetoImage} contentFit="cover" />
      <View style={styles.projetoLabelRow}>
        <Ionicons name="briefcase-outline" size={11} color={Colors.primary} />
        <Text style={styles.projetoLabelText}>Projeto {index + 1}</Text>
      </View>
    </View>
  );
}

function EmptyHint({ text }: { text: string }) {
  return <Text style={styles.emptyHint}>{text}</Text>;
}

// ─── Tela ─────────────────────────────────────────────────────────────────────

export default function SobreMimScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { profile } = useProfile();

  const { sobreMim, habilidades, certificados, fotoUri, projetoFotos } = profile;
  const projetosComFoto = projetoFotos.filter((uri): uri is string => !!uri);

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

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Hero: foto + nome + badge */}
        <View style={styles.heroSection}>
          <View style={styles.avatarWrap}>
            {fotoUri ? (
              <Image source={{ uri: fotoUri }} style={styles.avatarImage} contentFit="cover" />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={48} color={Colors.textSecondary} />
              </View>
            )}
          </View>
          <Text style={styles.nome}>{user?.name ?? 'Desenvolvedor'}</Text>
          <View style={styles.typeBadge}>
            <Ionicons name="code-slash-outline" size={12} color={Colors.primary} />
            <Text style={styles.typeBadgeText}>Desenvolvedor</Text>
          </View>
        </View>

        {/* Sobre Mim */}
        <View style={styles.section}>
          <SectionHeader title="Sobre Mim" />
          <View style={styles.textCard}>
            {sobreMim ? (
              <Text style={styles.bioText}>{sobreMim}</Text>
            ) : (
              <EmptyHint text="Nenhuma bio cadastrada ainda." />
            )}
          </View>
        </View>

        {/* Habilidades */}
        <View style={styles.section}>
          <SectionHeader title="Habilidades" />
          {habilidades.length > 0 ? (
            <View style={styles.chipsWrap}>
              {habilidades.map((h) => (
                <SkillChip key={h} label={h} />
              ))}
            </View>
          ) : (
            <EmptyHint text="Nenhuma habilidade cadastrada ainda." />
          )}
        </View>

        {/* Certificações */}
        <View style={styles.section}>
          <SectionHeader title="Certificações" />
          {certificados.length > 0 ? (
            <View style={styles.certList}>
              {certificados.map((c) => (
                <CertRow key={c} label={c} />
              ))}
            </View>
          ) : (
            <EmptyHint text="Nenhum certificado cadastrado ainda." />
          )}
        </View>

        {/* Projetos */}
        <View style={styles.section}>
          <SectionHeader title="Projetos" />
          {projetosComFoto.length > 0 ? (
            <View style={styles.projetosGrid}>
              {projetosComFoto.map((uri, i) => (
                <ProjetoCard key={i} uri={uri} index={i} />
              ))}
            </View>
          ) : (
            <EmptyHint text="Nenhum projeto adicionado ainda." />
          )}
        </View>

      </ScrollView>
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

  scroll: { paddingBottom: 48 },

  // Hero
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
  avatarImage: { width: 96, height: 96 },
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

  // Seção genérica
  section: {
    paddingHorizontal: GRID_PADDING,
    paddingTop: 24,
    paddingBottom: 8,
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
  bioText: {
    fontSize: 15,
    color: Colors.text,
    lineHeight: 24,
  },

  // Chips de habilidade
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    backgroundColor: Colors.surfaceHighlight,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipText: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '600',
  },

  // Lista de certificações
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

  // Grid de projetos
  projetosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GRID_GAP,
  },
  projetoCard: {
    width: CARD_SIZE,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  projetoImage: {
    width: CARD_SIZE,
    height: CARD_SIZE,
  },
  projetoLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  projetoLabelText: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '600',
  },

  // Placeholder de seção vazia
  emptyHint: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    paddingVertical: 4,
  },
});
