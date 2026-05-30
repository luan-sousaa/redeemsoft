import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Href, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors } from '@/constants/colors';
import { authService, Desenvolvedor } from '@/services/authService';

// ─── Card do desenvolvedor ────────────────────────────────────────────────────

function DevCard({
  dev,
  onPress,
}: {
  dev: Desenvolvedor;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.card} onPress={onPress} android_ripple={{ color: Colors.border }}>
      {/* Linha superior: avatar + nome + preço */}
      <View style={styles.cardHeader}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={22} color={Colors.textSecondary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardNome}>{dev.nome}</Text>
          <Text style={styles.cardPreco}>R$ {dev.precoPorHora}/h</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={Colors.textSecondary} />
      </View>

      {/* Descrição resumida */}
      <Text style={styles.cardDesc} numberOfLines={2}>
        {dev.descricao}
      </Text>

      {/* Habilidades (primeiras 3) */}
      <View style={styles.chips}>
        {dev.habilidades
          .split(',')
          .slice(0, 3)
          .map((h) => (
            <View key={h.trim()} style={styles.chip}>
              <Text style={styles.chipText}>{h.trim()}</Text>
            </View>
          ))}
      </View>
    </Pressable>
  );
}

// ─── Tela principal ───────────────────────────────────────────────────────────

export default function BuscarDesenvolvedoresScreen() {
  const router = useRouter();
  const [devs, setDevs] = useState<Desenvolvedor[]>([]);
  const [filtrado, setFiltrado] = useState<Desenvolvedor[]>([]);
  const [busca, setBusca] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authService.getDesenvolvedores().then((data) => {
      setDevs(data);
      setFiltrado(data);
      setLoading(false);
    });
  }, []);

  const handleBusca = useCallback(
    (text: string) => {
      setBusca(text);
      if (!text.trim()) {
        setFiltrado(devs);
        return;
      }
      const q = text.toLowerCase();
      setFiltrado(
        devs.filter(
          (d) =>
            d.nome.toLowerCase().includes(q) ||
            d.habilidades.toLowerCase().includes(q) ||
            d.descricao.toLowerCase().includes(q)
        )
      );
    },
    [devs]
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={Colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Buscar Desenvolvedores</Text>
      </View>

      {/* Busca */}
      <View style={styles.searchRow}>
        <Ionicons name="search-outline" size={18} color={Colors.textSecondary} style={{ marginRight: 8 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por nome ou habilidade..."
          placeholderTextColor={Colors.textSecondary}
          value={busca}
          onChangeText={handleBusca}
          returnKeyType="search"
        />
        {busca.length > 0 && (
          <Pressable onPress={() => handleBusca('')}>
            <Ionicons name="close-circle" size={18} color={Colors.textSecondary} />
          </Pressable>
        )}
      </View>

      {/* Label */}
      <Text style={styles.label}>
        Desenvolvedores:{filtrado.length > 0 ? ` ${filtrado.length} disponíveis` : ''}
      </Text>

      {/* Lista */}
      {loading ? (
        <ActivityIndicator color={Colors.primary} style={{ marginTop: 40 }} />
      ) : filtrado.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="people-outline" size={48} color={Colors.textSecondary} />
          <Text style={styles.emptyText}>Nenhum desenvolvedor encontrado</Text>
        </View>
      ) : (
        <FlatList
          data={filtrado}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <DevCard
              dev={item}
              onPress={() =>
                router.push({
                  pathname: '/(app)/desenvolvedor-detalhe',
                  params: {
                    id: item.id,
                    nome: item.nome,
                    precoPorHora: String(item.precoPorHora),
                    descricao: item.descricao,
                    sobreMim: item.sobreMim,
                    habilidades: item.habilidades,
                    certificacoes: item.certificacoes,
                    projetos: JSON.stringify(item.projetos),
                  },
                } as Href)
              }
            />
          )}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        />
      )}

      {/* Botão inferior */}
      <Pressable
        style={styles.criarBtn}
        onPress={() => router.push('/(app)/criar-projeto' as Href)}
      >
        <Text style={styles.criarBtnText}>Criar Solicitação</Text>
        <Ionicons name="add" size={22} color={Colors.text} />
      </Pressable>
    </SafeAreaView>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 8,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    marginHorizontal: 20,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    color: Colors.text,
    fontSize: 14,
    paddingVertical: 0,
  },
  label: {
    color: Colors.textSecondary,
    fontSize: 13,
    marginHorizontal: 20,
    marginBottom: 12,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  emptyText: {
    color: Colors.textSecondary,
    fontSize: 15,
  },
  // Card
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.surfaceHighlight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardNome: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  cardPreco: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
  cardDesc: {
    color: Colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 10,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chip: {
    backgroundColor: Colors.surfaceHighlight,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  chipText: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontWeight: '500',
  },
  // Botão inferior
  criarBtn: {
    position: 'absolute',
    bottom: 28,
    left: 20,
    right: 20,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  criarBtnText: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
});
