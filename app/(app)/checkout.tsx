import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

import { Colors } from '@/constants/colors';
import { paymentService } from '@/services/paymentService';
import { Button } from '@/components/ui/Button';
import { calcularValorTotal, formatarBRL } from '@/utils/pricing';

export default function CheckoutScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    contratoId?: string;   // ID do contrato criado em confirmar-contratacao
    amount?: string;
    description?: string;
    projetoNome?: string;
    devNome?: string;
    projetoId?: string;
    candidaturaId?: string;
  }>();
  const [isLoading, setIsLoading] = useState(false);

  const amountCents = params.amount ? parseInt(params.amount, 10) : 10000;
  const description = params.description ?? 'Pagamento RedeemSoft';
  const projetoNome = params.projetoNome;
  const devNome = params.devNome;

  // Calcula taxa de 10% — empresa paga valorTotal, dev recebe valorProjeto
  const pricing = calcularValorTotal(amountCents);

  async function handleGerarPix() {
    setIsLoading(true);
    try {
      // Envia valorTotal (projeto + taxa) para a AbacatePay
      const payment = await paymentService.createPixPayment(pricing.valorTotal, description);
      // replace para remover checkout da pilha — usuário não volta para cá após pagar
      router.replace({
        pathname: '/(app)/pagamento-pix',
        params: {
          id: payment.id,
          brCode: payment.brCode,
          brCodeBase64: payment.brCodeBase64,
          expiresAt: payment.expiresAt,
          ...(params.contratoId   && { contratoId: params.contratoId }),
          ...(params.projetoId    && { projetoId: params.projetoId }),
          ...(params.candidaturaId && { candidaturaId: params.candidaturaId }),
          ...(projetoNome && { projetoNome }),
          ...(devNome     && { devNome }),
        },
      });
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Erro ao gerar QR Code',
        text2: err instanceof Error ? err.message : 'Tente novamente.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={Colors.text} />
        </Pressable>
        <Text style={styles.title}>Checkout</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.body}>
        <View style={styles.content}>
          <View style={styles.card}>
            <View style={styles.iconWrap}>
              <Ionicons name="pricetag-outline" size={32} color={Colors.primary} />
            </View>
            <Text style={styles.cardTitle}>Resumo do pagamento</Text>

            {/* Projeto e desenvolvedor */}
            {projetoNome ? (
              <View style={styles.summaryRows}>
                <View style={styles.summaryRow}>
                  <Ionicons name="briefcase-outline" size={14} color={Colors.textSecondary} />
                  <Text style={styles.summaryText} numberOfLines={1}>{projetoNome}</Text>
                </View>
                {devNome ? (
                  <View style={styles.summaryRow}>
                    <Ionicons name="person-outline" size={14} color={Colors.textSecondary} />
                    <Text style={styles.summaryText} numberOfLines={1}>{devNome}</Text>
                  </View>
                ) : null}
              </View>
            ) : (
              <Text style={styles.desc} numberOfLines={2}>{description}</Text>
            )}

            {/* Breakdown de valores */}
            <View style={styles.divider} />
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Valor do projeto</Text>
              <Text style={styles.breakdownValue}>{formatarBRL(pricing.valorProjeto)}</Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabelMuted}>Taxa da plataforma (10%)</Text>
              <Text style={styles.breakdownValueMuted}>{formatarBRL(pricing.taxaPlataforma)}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.breakdownRow}>
              <Text style={styles.totalLabel}>Total a pagar</Text>
              <Text style={styles.totalValue}>{formatarBRL(pricing.valorTotal)}</Text>
            </View>
          </View>

          <View style={styles.pixInfo}>
            <Ionicons name="qr-code-outline" size={20} color={Colors.primary} />
            <Text style={styles.pixText}>
              Pague via PIX — o QR Code expira em 1 hora
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          {isLoading ? (
            <ActivityIndicator color={Colors.primary} />
          ) : (
            <Button
              title="Gerar QR Code PIX"
              onPress={handleGerarPix}
              style={styles.button}
            />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    marginBottom: 32,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
  },
  body: {
    flex: 1,
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
  },
  footer: {
    paddingBottom: 16,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 28,
    alignItems: 'center',
    marginBottom: 24,
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: Colors.surfaceHighlight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 12,
  },
  label: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  amount: {
    fontSize: 25,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 8,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    alignSelf: 'stretch',
    marginVertical: 12,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignSelf: 'stretch',
    marginBottom: 6,
  },
  breakdownLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  breakdownValue: {
    fontSize: 13,
    color: Colors.text,
    fontWeight: '600',
  },
  breakdownLabelMuted: {
    fontSize: 11,
    color: Colors.textSecondary,
    opacity: 0.7,
  },
  breakdownValueMuted: {
    fontSize: 11,
    color: Colors.textSecondary,
    opacity: 0.7,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.primary,
  },
  desc: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  summaryRows: {
    gap: 6,
    marginTop: 4,
    alignSelf: 'stretch',
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  summaryText: {
    fontSize: 13,
    color: Colors.textSecondary,
    flex: 1,
  },
  pixInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
    marginBottom: 16,
  },
  pixText: {
    flex: 1,
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  button: {
    width: '100%',
  },
});
