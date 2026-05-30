import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

import { Colors } from '@/constants/colors';
import { paymentService } from '@/services/paymentService';
import { Button } from '@/components/ui/Button';

export default function CheckoutScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ amount?: string; description?: string; projetoId?: string; candidaturaId?: string }>();
  const [isLoading, setIsLoading] = useState(false);

  // amount em centavos — padrão R$ 100,00 para teste
  const amountCents = params.amount ? parseInt(params.amount, 10) : 10000;
  const description = params.description ?? 'Pagamento RedeemSoft';

  const amountFormatted = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(amountCents / 100);

  async function handleGerarPix() {
    setIsLoading(true);
    try {
      const payment = await paymentService.createPixPayment(amountCents, description);
      router.push({
        pathname: '/(app)/pagamento-pix',
        params: {
          id: payment.id,
          brCode: payment.brCode,
          brCodeBase64: payment.brCodeBase64,
          expiresAt: payment.expiresAt,
          ...(params.projetoId && { projetoId: params.projetoId }),
          ...(params.candidaturaId && { candidaturaId: params.candidaturaId }),
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
            <Text style={styles.label}>Total a pagar</Text>
            <Text style={styles.amount}>{amountFormatted}</Text>
            <Text style={styles.desc} numberOfLines={2}>{description}</Text>
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
  label: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  amount: {
    fontSize: 36,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 8,
  },
  desc: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
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
