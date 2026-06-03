import React, { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

import { Colors } from '@/constants/colors';

// ─── Campo somente-leitura ────────────────────────────────────────────────────

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.fieldBox}>
        <Text style={styles.fieldValue}>{value}</Text>
      </View>
    </View>
  );
}

// ─── Tela ─────────────────────────────────────────────────────────────────────

export default function DesenvolvedorDetalheScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    id: string;
    nome: string;
    precoPorHora: string;
    descricao: string;
    sobreMim: string;
    habilidades: string;
    certificacoes: string;
    projetos: string;
  }>();

  const [contratando, setContratando] = useState(false);

  const projetos: string[] = params.projetos ? JSON.parse(params.projetos) : [];

  async function handleContratar() {
    setContratando(true);
    await new Promise((r) => setTimeout(r, 900));
    setContratando(false);
    Toast.show({
      type: 'success',
      text1: 'Solicitação enviada!',
      text2: `${params.nome} receberá sua proposta em breve.`,
    });
    setTimeout(() => router.back(), 1500);
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Header: voltar + nome + preço */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back-circle-outline" size={32} color={Colors.text} />
          </Pressable>
          <Text style={styles.nome} numberOfLines={2}>{params.nome}</Text>
          <View style={styles.precoBadge}>
            <Text style={styles.precoLabel}>Preço por hora:</Text>
            <Text style={styles.precoValue}>R$ {params.precoPorHora},00</Text>
          </View>
        </View>

        {/* Foto (placeholder) */}
        <View style={styles.fotoContainer}>
          <View style={styles.foto}>
            <Ionicons name="person" size={48} color={Colors.textSecondary} />
          </View>
        </View>

        {/* Campos */}
        <View style={styles.fields}>
          <InfoField label="Sobre mim:" value={params.sobreMim ?? ''} />
          <InfoField label="Habilidades:" value={params.habilidades ?? ''} />
          <InfoField label="Certificações:" value={params.certificacoes ?? ''} />
        </View>

        {/* Projetos */}
        <View style={styles.fieldWrap}>
          <Text style={styles.fieldLabel}>Projetos:</Text>
          <View style={styles.projetosGrid}>
            {projetos.map((p, i) => (
              <View key={i} style={styles.projetoCard}>
                <Ionicons name="briefcase-outline" size={20} color={Colors.primary} />
                <Text style={styles.projetoText} numberOfLines={3}>{p}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Botão Chat */}
        <View style={styles.chatRow}>
          <Pressable style={styles.chatBtn} onPress={() => {}}>
            <Ionicons name="chatbubble-outline" size={18} color={Colors.text} />
            <Text style={styles.chatBtnText}>chat</Text>
          </Pressable>
        </View>

        {/* Botão Contratar */}
        <Pressable
          style={[styles.contratarBtn, contratando && { opacity: 0.7 }]}
          onPress={handleContratar}
          disabled={contratando}
        >
          <Text style={styles.contratarText}>
            {contratando ? 'Enviando...' : 'Contratar'}
          </Text>
        </Pressable>

      </ScrollView>
      <Toast />
    </SafeAreaView>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 10,
  },
  backBtn: {
    padding: 2,
  },
  nome: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
  },
  precoBadge: {
    backgroundColor: Colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: 'center',
  },
  precoLabel: {
    color: Colors.textSecondary,
    fontSize: 10,
  },
  precoValue: {
    color: Colors.text,
    fontSize: 13,
    fontWeight: '700',
  },
  fotoContainer: {
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  foto: {
    width: 90,
    height: 90,
    borderRadius: 12,
    backgroundColor: Colors.surfaceHighlight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  fields: {
    gap: 14,
    marginBottom: 14,
  },
  fieldWrap: {
    marginBottom: 14,
  },
  fieldLabel: {
    color: Colors.textSecondary,
    fontSize: 13,
    marginBottom: 6,
    fontWeight: '500',
  },
  fieldBox: {
    backgroundColor: Colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 12,
  },
  fieldValue: {
    color: Colors.text,
    fontSize: 14,
    lineHeight: 20,
  },
  projetosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  projetoCard: {
    backgroundColor: Colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 12,
    width: '47%',
    gap: 8,
  },
  projetoText: {
    color: Colors.textSecondary,
    fontSize: 12,
    lineHeight: 17,
  },
  chatRow: {
    alignItems: 'center',
    marginVertical: 20,
  },
  chatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 28,
    paddingVertical: 10,
  },
  chatBtnText: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '500',
  },
  contratarBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  contratarText: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
});