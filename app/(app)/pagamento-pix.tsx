import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

import { Colors } from '@/constants/colors';
import { authService } from '@/services/authService';
import { paymentService } from '@/services/paymentService';
import { Button } from '@/components/ui/Button';

function useCountdown(expiresAt: string) {
  const [secondsLeft, setSecondsLeft] = useState(() =>
    Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000))
  );

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setInterval(() => {
      setSecondsLeft((s) => Math.max(0, s - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [secondsLeft]);

  const mins = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const secs = String(secondsLeft % 60).padStart(2, '0');
  return { label: `${mins}:${secs}`, expired: secondsLeft === 0 };
}

export default function PagamentoPixScreen() {
  const router = useRouter();
  const { id, brCode, brCodeBase64, expiresAt, contratoId, projetoId, candidaturaId, projetoNome, devNome } =
    useLocalSearchParams<{
      id: string;
      brCode: string;
      brCodeBase64: string;
      expiresAt: string;
      contratoId?: string;
      projetoId?: string;
      candidaturaId?: string;
      projetoNome?: string;
      devNome?: string;
    }>();

  const { label: countdown, expired } = useCountdown(expiresAt);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isPaid, setIsPaid] = useState(false);

  async function handleCopiar() {
    await Clipboard.setStringAsync(brCode);
    Toast.show({ type: 'success', text1: 'Código copiado!', visibilityTime: 2000 });
  }

  async function handleSimular() {
    setIsSimulating(true);
    try {
      await paymentService.simulatePayment(id);

      // Atualiza contrato: dinheiro fica "retido" e projeto vai para em_andamento
      if (contratoId) {
        await authService.atualizarPagamentoContrato(contratoId, id);
      } else if (projetoId && candidaturaId) {
        // Fallback: fluxo legado sem contrato
        await authService.atualizarStatusCandidatura(projetoId, candidaturaId, 'aceito');
      }

      setIsPaid(true);
      Toast.show({
        type: 'success',
        text1: 'Pagamento realizado!',
        text2: 'Projeto em andamento. Chat desbloqueado.',
      });
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Erro ao simular pagamento',
        text2: err instanceof Error ? err.message : 'Tente novamente.',
      });
    } finally {
      setIsSimulating(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color={Colors.text} />
          </Pressable>
          <Text style={styles.title}>Pagar via PIX</Text>
          <View style={{ width: 40 }} />
        </View>

        {isPaid ? (
          <View style={styles.paidContainer}>
            <View style={styles.paidIcon}>
              <Ionicons name="checkmark-circle" size={72} color="#4CAF50" />
            </View>
            <Text style={styles.paidTitle}>Pagamento confirmado!</Text>
            <Text style={styles.paidText}>Sua transação foi processada com sucesso.</Text>
            {/* Abre o chat se tiver contratoId, senão vai para meus-projetos */}
            {contratoId ? (
              <Button
                title="Abrir Chat do Projeto"
                onPress={() => router.replace({
                  pathname: '/(app)/chat',
                  params: { contratoId, projetoNome: projetoNome ?? '', devNome: devNome ?? '' },
                })}
                style={styles.button}
              />
            ) : (
              <Button
                title="Voltar ao início"
                onPress={() => router.replace('/(app)/meus-projetos')}
                style={styles.button}
              />
            )}
          </View>
        ) : (
          <>
            {/* Timer */}
            <View style={[styles.timerRow, expired && styles.timerExpired]}>
              <Ionicons
                name="time-outline"
                size={18}
                color={expired ? Colors.error : Colors.textSecondary}
              />
              <Text style={[styles.timerText, expired && styles.timerTextExpired]}>
                {expired ? 'QR Code expirado' : `Expira em ${countdown}`}
              </Text>
            </View>

            {/* QR Code */}
            <View style={styles.qrCard}>
              {brCodeBase64 ? (
                <Image
                  source={{ uri: brCodeBase64 }}
                  style={styles.qrImage}
                  resizeMode="contain"
                />
              ) : (
                <View style={styles.qrPlaceholder}>
                  <Ionicons name="qr-code-outline" size={80} color={Colors.textSecondary} />
                </View>
              )}
            </View>

            {/* Copia e cola */}
            <Text style={styles.sectionLabel}>PIX Copia e Cola</Text>
            <Pressable style={styles.copyRow} onPress={handleCopiar}>
              <Text style={styles.copyCode} numberOfLines={2}>{brCode}</Text>
              <Ionicons name="copy-outline" size={20} color={Colors.primary} />
            </Pressable>

            {/* Simular pagamento (sandbox) */}
            <View style={styles.sandboxBadge}>
              <Ionicons name="flask-outline" size={14} color={Colors.primary} />
              <Text style={styles.sandboxText}>Modo Sandbox</Text>
            </View>

            <Button
              title="Simular Pagamento"
              onPress={handleSimular}
              isLoading={isSimulating}
              disabled={expired || isSimulating}
              style={styles.button}
            />
          </>
        )}
      </ScrollView>
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
    marginBottom: 24,
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
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    justifyContent: 'center',
    marginBottom: 20,
  },
  timerExpired: { opacity: 0.7 },
  timerText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  timerTextExpired: { color: Colors.error },
  qrCard: {
    backgroundColor: Colors.surface,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 20,
    alignItems: 'center',
    marginBottom: 24,
  },
  qrImage: {
    width: 220,
    height: 220,
  },
  qrPlaceholder: {
    width: 220,
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  copyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
    marginBottom: 24,
  },
  copyCode: {
    flex: 1,
    fontSize: 12,
    color: Colors.textSecondary,
    fontFamily: 'monospace',
    lineHeight: 18,
  },
  sandboxBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    justifyContent: 'center',
    marginBottom: 12,
  },
  sandboxText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
  },
  button: {
    width: '100%',
    marginBottom: 32,
  },
  paidContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  paidIcon: {
    marginBottom: 24,
  },
  paidTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  paidText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 40,
  },
});
