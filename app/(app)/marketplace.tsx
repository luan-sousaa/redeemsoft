import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import type { Href } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Logo } from '@/components/Logo';
import { DrawerMenu } from '@/components/DrawerMenu';
import { Colors } from '@/constants/colors';
import {ProjetoEmpresa} from '../../services/authService'

// Modalidades disponíveis (chaves usadas em ProjetoEmpresa.modalidades)
const MODALIDADES: { key: string; label: string }[] = [
  { key: 'remoto', label: 'Remoto' },
  { key: 'presencial', label: 'Presencial' },
  { key: 'hibrido', label: 'Híbrido' },
];

// ─── Componente de Card ───────────────────────────────────────────────────────

function ProjetoCard({ projeto, onPress }: { projeto: ProjetoEmpresa; onPress: () => void }) {
  return (
    <Pressable
      style={styles.card}
      onPress={onPress}
      android_ripple={{ color: Colors.surfaceHighlight }}
    >
      <View style={styles.cardRow}>
        <View style={styles.cardLeft}>
          <Text style={styles.cardTitulo} numberOfLines={2}>
            {projeto.titulo}
          </Text>
        </View>
        <View style={styles.precoTag}>
          <Text style={styles.precoText}>
            {projeto.orcamento.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 })}
          </Text>
        </View>
      </View>

      <View style={styles.cardRow}>
        <Text style={styles.cardDescricao} numberOfLines={2}>
          {projeto.descricao}
        </Text>
        <View style={styles.prazoTag}>
          <Ionicons name="time-outline" size={11} color={Colors.textSecondary} />
          <Text style={styles.prazoText}>{projeto.prazo}</Text>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <View style={styles.stackBadge}>
          <Ionicons name="code-slash-outline" size={12} color={Colors.primary} />
          <Text style={styles.stackText}>{projeto.stack}</Text>
        </View>
        <View style={styles.modalidadesRow}>
          {projeto.modalidades.map((m) => (
            <View key={m} style={styles.modalidadeChipSmall}>
              <Text style={styles.modalidadeChipSmallText}>{m}</Text>
            </View>
          ))}
        </View>
        <Ionicons name="chevron-forward" size={16} color={Colors.textSecondary} />
      </View>
    </Pressable>
  );
}

// ─── Tela principal ───────────────────────────────────────────────────────────

export default function MarketplaceScreen() {
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [busca, setBusca] = useState('');
  const [filtroModalidade, setFiltroModalidade] = useState<ProjetoEmpresa['modalidades']>([]);
  const [filtroData, setFiltroData] = useState<'recente' | 'antigo' | null>(null);

  function toggleModalidade(m: ProjetoEmpresa['modalidades'][number]) {
    setFiltroModalidade((prev) =>
      prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]
    );
  }

  function toggleData() {
    setFiltroData((prev) => {
      if (prev === null) return 'recente';
      if (prev === 'recente') return 'antigo';
      return null;
    });
  }

  const projetosFiltrados = useMemo(() => {
    let lista = [] as ProjetoEmpresa[];

    if (busca.trim()) {
      const termo = busca.toLowerCase();
      lista = lista.filter(
        (p) =>
          p.titulo.toLowerCase().includes(termo) ||
          p.descricao.toLowerCase().includes(termo) ||
          p.stack.toLowerCase().includes(termo)
      );
    }

    if (filtroModalidade.length > 0) {
      lista = lista.filter((p) =>
        filtroModalidade.some((m) => p.modalidades.includes(m))
      );
    }

    if (filtroData === 'recente') {
      lista.sort((a, b) => b.dataCriacao.getTime() - a.dataCriacao.getTime());
    } else if (filtroData === 'antigo') {
      lista.sort((a, b) => a.dataCriacao.getTime() - b.dataCriacao.getTime());
    }

    return lista;
  }, [busca, filtroModalidade, filtroData]);

  const dataLabel =
    filtroData === 'recente' ? '↓ Recente' : filtroData === 'antigo' ? '↑ Antigo' : 'Data';

  return (
    <SafeAreaView style={styles.safe}>
      <DrawerMenu visible={drawerOpen} onClose={() => setDrawerOpen(false)} activeScreen="marketplace" />

      {/* ── Top bar ── */}
      <View style={styles.topBar}>
        <Pressable style={styles.menuBtn} onPress={() => setDrawerOpen(true)}>
          <Ionicons name="menu" size={28} color={Colors.text} />
        </Pressable>

        {/* Barra de busca */}
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={18} color={Colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar Projetos"
            placeholderTextColor={Colors.textSecondary}
            value={busca}
            onChangeText={setBusca}
            selectionColor={Colors.primary}
            returnKeyType="search"
          />
          {busca.length > 0 && (
            <Pressable onPress={() => setBusca('')}>
              <Ionicons name="close-circle" size={18} color={Colors.textSecondary} />
            </Pressable>
          )}
        </View>
      </View>

      {/* ── Filtros ── */}
      <View style={styles.filtrosContainer}>
        <View style={styles.filtrosLeft}>
          <Text style={styles.filtrosLabel}>Modalidade de trabalho</Text>
          <View style={styles.chipsRow}>
            {MODALIDADES.map((m) => {
              const ativo = filtroModalidade.includes(m.key);
              return (
                <Pressable
                  key={m.key}
                  style={[styles.chip, ativo && styles.chipAtivo]}
                  onPress={() => toggleModalidade(m.key)}
                >
                  <Text style={[styles.chipText, ativo && styles.chipTextAtivo]}>
                    {m.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.filtrosRight}>
          <Text style={styles.filtrosLabel}>Data</Text>
          <Pressable
            style={[styles.chip, filtroData !== null && styles.chipAtivo]}
            onPress={toggleData}
          >
            <Ionicons
              name="calendar-outline"
              size={14}
              color={filtroData !== null ? Colors.text : Colors.textSecondary}
            />
            {filtroData !== null && (
              <Text style={[styles.chipText, styles.chipTextAtivo]}>
                {dataLabel}
              </Text>
            )}
          </Pressable>
        </View>
      </View>

      {/* ── Lista de projetos ── */}
      <FlatList
        data={projetosFiltrados}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.lista}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="search-circle-outline" size={56} color={Colors.surfaceHighlight} />
            <Text style={styles.emptyText}>Nenhum projeto encontrado</Text>
            <Text style={styles.emptySubtext}>Tente outros termos ou remova os filtros</Text>
          </View>
        }
        renderItem={({ item }) => (
          <ProjetoCard
            projeto={item}
            onPress={() =>
              router.push({
                pathname: '/(app)/projeto-detalhe',
                params: {
                  id: item.id,
                  titulo: item.titulo,
                  descricao: item.descricao,
                  preco: String(item.orcamento),
                  prazo: item.prazo,
                  stack: item.stack,
                  modalidades: JSON.stringify(item.modalidades),
                },
              } as Href)
            }
          />
        )}
      />
    </SafeAreaView>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  // Top bar
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    gap: 10,
  },
  menuBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 28,
    paddingHorizontal: 14,
    height: 48,
    borderWidth: 1.5,
    borderColor: Colors.border,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.text,
    height: '100%',
  },

  // Filtros
  filtrosContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 16,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 16,
  },
  filtrosLeft: {
    flex: 1,
  },
  filtrosRight: {
    alignItems: 'flex-start',
  },
  filtrosLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '600',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: Colors.surfaceHighlight,
    borderWidth: 1.5,
    borderColor: Colors.border,
    minWidth: 44,
    justifyContent: 'center',
    gap: 6,
  },
  chipAtivo: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  chipTextAtivo: {
    color: Colors.text,
  },

  // Lista
  lista: {
    padding: 16,
    paddingBottom: 40,
  },

  // Card de projeto
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 8,
    gap: 10,
  },
  cardLeft: {
    flex: 1,
  },
  cardTitulo: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    lineHeight: 22,
  },
  cardDescricao: {
    flex: 1,
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  precoTag: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  precoText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text,
  },
  prazoTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceHighlight,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
    alignSelf: 'flex-start',
    marginLeft: 8,
  },
  prazoText: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  stackBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  stackText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
  },
  modalidadesRow: {
    flexDirection: 'row',
    gap: 6,
  },
  modalidadeChipSmall: {
    backgroundColor: Colors.surfaceHighlight,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  modalidadeChipSmallText: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '700',
  },

  // Empty state
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 60,
    gap: 10,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  emptySubtext: {
    fontSize: 13,
    color: Colors.textSecondary,
  },

});
