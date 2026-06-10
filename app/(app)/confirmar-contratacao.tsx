// confirmar-contratacao.tsx
// Tela de confirmação antes do pagamento.
// Empresa vê o perfil completo do dev + resumo de preço com taxa de 10%,
// confirma, e só então o contrato (escrow) é criado e o pagamento iniciado.
// Regra: contrato só existe após esta confirmação; status do projeto/candidatura
// só muda quando o PIX for confirmado.

import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
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
import { authService } from '@/services/authService';
import { parseList } from '@/utils/parseList';
import { calcularValorTotal, formatarBRL } from '@/utils/pricing';

// ─── Componentes reutilizados do design system ────────────────────────────────

function SectionLabel({ title }: { title: string }) {
  return (
    <Text style={styles.sectionLabel}>{title}</Text>
  );
}

function SkillChip({ label }: { label: string }) {
  return (
    <View style={styles.chip}>
      <Text style={styles.chipText}>{label}</Text>
    </View>
  );
}

// ─── Tela ─────────────────────────────────────────────────────────────────────

export default function ConfirmarContratacaoScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const params = useLocalSearchParams<{
    devId: string;
    candidaturaId: string;
    projetoId: string;
    projetoNome: string;
    valorProjeto: string; // centavos
  }>();

  const { devId, candidaturaId, projetoId, projetoNome } = params;
  const valorProjeto = parseInt(params.valorProjeto ?? '0', 10);
  const pricing = calcularValorTotal(valorProjeto);

  const isNavigating = useRef(false);
  const [isLoading, setIsLoading] = useState(false);
  const [devLoading, setDevLoading] = useState(true);

  type DevData = {
    nome: string;
    precoPorHora: number | null;
    sobreMim: string | null;
    experiencia: string | null;
    habilidades: string[];
    certificacoes: string[];
    foto: string | null;
  };
  const [dev, setDev] = useState<DevData | null>(null);

  useEffect(() => {
    if (!devId) return;
    authService.getDevById(devId)
      .then((d) => {
        setDev({
          nome: d.nome,
          precoPorHora: d.precoPorHora,
          sobreMim: d.sobreMim,
          experiencia: d.experiencia,
          habilidades: parseList(d.habilidades),
          certificacoes: parseList(d.certificacoes),
          foto: d.foto ?? null,
        });
      })
      .catch(() => {
        Toast.show({ type: 'error', text1: 'Erro ao carregar perfil do desenvolvedor.' });
      })
      .finally(() => setDevLoading(false));
  }, [devId]);

  async function handleConfirmar() {
    if (isNavigating.current) return;
    if (!user?.idCliente) {
      Toast.show({ type: 'error', text1: 'Apenas empresas podem contratar.' });
      return;
    }
    isNavigating.current = true;
    setIsLoading(true);
    try {
      const contrato = await authService.criarContrato({
        candidaturaId: Number(candidaturaId),
        projetoId:     Number(projetoId),
        devId:         Number(devId),
        valorProjeto,  // centavos
      });

      // Navega para checkout; amount = valorProjeto (centavos) para que
      // checkout recalcule a taxa e exiba o breakdown corretamente.
      router.replace({
        pathname: '/(app)/checkout',
        params: {
          contratoId:  String(contrato.id),
          amount:      String(contrato.valorProjeto),
          description: projetoNome ?? '',
          projetoNome: projetoNome ?? '',
          devNome:     dev?.nome ?? '',
          projetoId:   projetoId ?? '',
          candidaturaId: candidaturaId ?? '',
        },
      });
    } catch (err) {
      isNavigating.current = false;
      Toast.show({
        type: 'error',
        text1: 'Erro ao criar contrato',
        text2: err instanceof Error ? err.message : 'Tente novamente.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Confirmar Contratação</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Perfil do dev */}
        <View style={styles.section}>
          <SectionLabel title="Desenvolvedor" />

          {devLoading ? (
            <View style={styles.devLoadingBox}>
              <ActivityIndicator color={Colors.primary} />
            </View>
          ) : dev ? (
            <View style={styles.devCard}>
              {/* Avatar + nome */}
              <View style={styles.devHeader}>
                <View style={styles.avatar}>
                  {dev.foto ? (
                    <Image
                      source={{ uri: dev.foto }}
                      style={{ width: 52, height: 52, borderRadius: 26 }}
                      contentFit="cover"
                    />
                  ) : (
                    <Ionicons name="person-circle-outline" size={36} color={Colors.textSecondary} />
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.devNome}>{dev.nome}</Text>
                  {dev.precoPorHora != null && (
                    <Text style={styles.devPreco}>
                      {dev.precoPorHora.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 })}/h
                    </Text>
                  )}
                </View>
              </View>

              {/* Bio */}
              {dev.sobreMim ? (
                <Text style={styles.devBio} numberOfLines={3}>{dev.sobreMim}</Text>
              ) : null}

              {/* Habilidades */}
              {dev.habilidades.length > 0 && (
                <View style={styles.chipsWrap}>
                  {dev.habilidades.slice(0, 5).map((h) => (
                    <SkillChip key={h} label={h} />
                  ))}
                </View>
              )}
            </View>
          ) : (
            <Text style={styles.erroText}>Não foi possível carregar o perfil.</Text>
          )}
        </View>

        {/* Resumo de preço */}
        <View style={styles.section}>
          <SectionLabel title="Resumo do pagamento" />
          <View style={styles.pricingCard}>
            {projetoNome ? (
              <View style={styles.pricingRow}>
                <Ionicons name="briefcase-outline" size={14} color={Colors.textSecondary} />
                <Text style={styles.pricingProjeto} numberOfLines={1}>{projetoNome}</Text>
              </View>
            ) : null}

            <View style={styles.divider} />

            <View style={styles.pricingRow}>
              <Text style={styles.pricingLabel}>Valor do projeto</Text>
              <Text style={styles.pricingValue}>{formatarBRL(pricing.valorProjeto)}</Text>
            </View>
            <View style={styles.pricingRow}>
              <Text style={styles.pricingLabelMuted}>Taxa da plataforma (10%)</Text>
              <Text style={styles.pricingValueMuted}>{formatarBRL(pricing.taxaPlataforma)}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.pricingRow}>
              <Text style={styles.totalLabel}>Total a pagar</Text>
              <Text style={styles.totalValue}>{formatarBRL(pricing.valorTotal)}</Text>
            </View>
          </View>
        </View>

        {/* Aviso escrow */}
        <View style={styles.escrowNotice}>
          <Ionicons name="shield-checkmark-outline" size={18} color={Colors.primary} />
          <Text style={styles.escrowText}>
            O pagamento fica retido na plataforma até ambas as partes confirmarem a entrega.
          </Text>
        </View>

        {/* Espaço para os botões fixos */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Botões fixos no rodapé */}
      <View style={styles.footer}>
        <Pressable style={styles.cancelarBtn} onPress={() => router.back()} disabled={isLoading}>
          <Text style={styles.cancelarText}>Cancelar</Text>
        </Pressable>
        <Pressable
          style={[styles.confirmarBtn, isLoading && styles.btnDisabled]}
          onPress={handleConfirmar}
          disabled={isLoading || devLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={Colors.text} size="small" />
          ) : (
            <>
              <Ionicons name="checkmark-circle-outline" size={18} color={Colors.text} />
              <Text style={styles.confirmarText}>Confirmar e Pagar</Text>
            </>
          )}
        </Pressable>
      </View>
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
  headerTitle: { flex: 1, fontSize: 18, fontWeight: '800', color: Colors.text, textAlign: 'center' },

  scroll: { paddingBottom: 16 },

  section: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 4,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 12,
  },

  // Dev card
  devLoadingBox: {
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  devCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    gap: 12,
  },
  devHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.surfaceHighlight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  devNome: { fontSize: 16, fontWeight: '700', color: Colors.text },
  devPreco: { fontSize: 12, color: Colors.primary, fontWeight: '600', marginTop: 2 },
  devBio: { fontSize: 13, color: Colors.textSecondary, lineHeight: 20 },
  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: {
    backgroundColor: Colors.surfaceHighlight,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipText: { fontSize: 11, color: Colors.primary, fontWeight: '600' },

  erroText: { fontSize: 13, color: Colors.textSecondary, fontStyle: 'italic' },

  // Pricing
  pricingCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    gap: 8,
  },
  pricingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  pricingProjeto: { flex: 1, fontSize: 13, color: Colors.textSecondary },
  pricingLabel: { fontSize: 13, color: Colors.textSecondary },
  pricingValue: { fontSize: 13, color: Colors.text, fontWeight: '600' },
  pricingLabelMuted: { fontSize: 11, color: Colors.textSecondary, opacity: 0.7 },
  pricingValueMuted: { fontSize: 11, color: Colors.textSecondary, opacity: 0.7 },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: 4 },
  totalLabel: { fontSize: 14, fontWeight: '700', color: Colors.text },
  totalValue: { fontSize: 16, fontWeight: '800', color: Colors.primary },

  // Aviso escrow
  escrowNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginHorizontal: 20,
    marginTop: 16,
    backgroundColor: 'rgba(79,110,247,0.08)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(79,110,247,0.2)',
    padding: 14,
  },
  escrowText: { flex: 1, fontSize: 12, color: Colors.textSecondary, lineHeight: 18 },

  // Footer
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.background,
  },
  cancelarBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelarText: { fontSize: 14, fontWeight: '700', color: Colors.textSecondary },
  confirmarBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: Colors.primary,
  },
  confirmarText: { fontSize: 14, fontWeight: '700', color: Colors.text },
  btnDisabled: { opacity: 0.5 },
});
