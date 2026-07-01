/**
 * Aba "Mensagens" — lista de conversas ativas
 */
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Image,
    Pressable,
    RefreshControl,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Colors } from "@/constants/colors";
import { api } from "@/services/api";

type Conversa = {
  id: string;
  nomeContato: string;
  fotoContato: string | null;
  projetoTitulo: string;
  projetoValor: number;
  tipo: "dev" | "empresa";
  contratoId?: number | null;
  naoLidas: number;
};

function AvatarConversa({ nome, foto }: { nome: string; foto: string | null }) {
  if (foto) return <Image source={{ uri: foto }} style={styles.avatar} />;
  const colors = [
    "#6C63FF",
    "#E84560",
    "#F5A623",
    "#4CAF50",
    "#00BCD4",
    "#9C27B0",
  ];
  const idx = nome.charCodeAt(0) % colors.length;
  return (
    <View style={[styles.avatar, { backgroundColor: colors[idx] }]}>
      <Text style={styles.avatarLetter}>{nome.charAt(0).toUpperCase()}</Text>
    </View>
  );
}

function ConversaCard({
  conversa,
  onPress,
}: {
  conversa: Conversa;
  onPress: () => void;
}) {
  const hasUnread = conversa.naoLidas > 0;
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.avatarWrapper}>
        <AvatarConversa nome={conversa.nomeContato} foto={conversa.fotoContato} />
        {hasUnread && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadText}>
              {conversa.naoLidas > 99 ? "99+" : String(conversa.naoLidas)}
            </Text>
          </View>
        )}
      </View>
      <View style={styles.cardContent}>
        <View style={styles.cardTopRow}>
          <Text style={[styles.nomeContato, hasUnread && styles.nomeContatoBold]} numberOfLines={1}>
            {conversa.nomeContato}
          </Text>
          <View style={styles.valorTag}>
            <Text style={styles.valorText}>
              {conversa.projetoValor.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
                minimumFractionDigits: 0,
              })}
            </Text>
          </View>
        </View>
        <View style={styles.projetoRow}>
          <Ionicons name="briefcase-outline" size={12} color={Colors.primary} />
          <Text style={styles.projetoTitulo} numberOfLines={1}>
            {conversa.projetoTitulo}
          </Text>
        </View>
        <Text style={[styles.hint, hasUnread && styles.hintUnread]} numberOfLines={1}>
          {hasUnread ? `${conversa.naoLidas} mensagem${conversa.naoLidas > 1 ? 'ns' : ''} não lida${conversa.naoLidas > 1 ? 's' : ''}` : 'Toque para abrir o chat'}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={Colors.textSecondary} />
    </Pressable>
  );
}

export default function MensagensTab() {
  const router = useRouter();
  const [conversas, setConversas] = useState<Conversa[]>([]);
  const [filtro, setFiltro] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const carregar = useCallback(async () => {
    try {
      const data = await api.get<any[]>("/chat/conversas");
      setConversas(
        data.map((c) => ({
          id: String(c.id),
          nomeContato: c.nomeContato,
          fotoContato: c.fotoContato ?? null,
          projetoTitulo: c.projetoTitulo,
          projetoValor: c.projetoValor,
          tipo: c.tipo,
          contratoId: c.contratoId ?? null,
          naoLidas: c.naoLidas ?? 0,
        })),
      );
    } catch {
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const filtradas = conversas.filter(
    (c) =>
      c.nomeContato.toLowerCase().includes(filtro.toLowerCase()) ||
      c.projetoTitulo.toLowerCase().includes(filtro.toLowerCase()),
  );

  function abrirConversa(c: Conversa) {
    router.push({
      pathname: "/(app)/chat-conversa" as any,
      params: {
        conversaId: c.id,
        nomeContato: c.nomeContato,
        fotoContato: c.fotoContato ?? "",
        projetoTitulo: c.projetoTitulo,
        projetoValor: String(c.projetoValor),
        contratoId: String(c.contratoId ?? ""),
      },
    });
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.title}>Mensagens</Text>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons
          name="search-outline"
          size={18}
          color={Colors.textSecondary}
        />
        <TextInput
          style={styles.searchInput}
          value={filtro}
          onChangeText={setFiltro}
          placeholder="Buscar conversa ou projeto..."
          placeholderTextColor={Colors.textSecondary}
        />
        {filtro.length > 0 && (
          <Pressable onPress={() => setFiltro("")} hitSlop={8}>
            <Ionicons
              name="close-circle"
              size={18}
              color={Colors.textSecondary}
            />
          </Pressable>
        )}
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : filtradas.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons
            name="chatbubbles-outline"
            size={70}
            color={Colors.textSecondary}
          />
          <Text style={styles.emptyTitle}>
            {filtro ? "Nenhuma conversa encontrada" : "Nenhuma conversa ainda"}
          </Text>
          <Text style={styles.emptyText}>
            {filtro
              ? "Tente buscar por outro nome ou projeto"
              : "As conversas aparecem aqui quando uma candidatura for aceita"}
          </Text>
          {!filtro && (
            <Pressable
              style={styles.emptyAction}
              onPress={() => router.push("/(app)/(tabs)/projetos" as any)}
            >
              <Ionicons
                name="briefcase-outline"
                size={20}
                color={Colors.primary}
              />
              <Text style={styles.emptyActionText}>
                Ver Projetos Disponíveis
              </Text>
            </Pressable>
          )}
        </View>
      ) : (
        <FlatList
          data={filtradas}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.lista}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                carregar();
              }}
              tintColor={Colors.primary}
            />
          }
          renderItem={({ item }) => (
            <ConversaCard conversa={item} onPress={() => abrirConversa(item)} />
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: { fontSize: 26, fontWeight: "800", color: Colors.text },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    marginHorizontal: 16,
    marginBottom: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  searchInput: { flex: 1, fontSize: 15, color: Colors.text },
  loadingContainer: { flex: 1, alignItems: "center", justifyContent: "center" },
  lista: { paddingHorizontal: 16, paddingBottom: 20 },
  separator: { height: 1, backgroundColor: Colors.border, marginLeft: 76 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
  },
  avatarWrapper: { position: "relative" },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  avatarLetter: { fontSize: 20, fontWeight: "800", color: "#fff" },
  unreadBadge: {
    position: "absolute",
    top: -2,
    right: -2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.error,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: Colors.background,
  },
  unreadText: { fontSize: 10, fontWeight: "800", color: "#fff" },
  cardContent: { flex: 1, gap: 3 },
  cardTopRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  nomeContato: { flex: 1, fontSize: 16, fontWeight: "600", color: Colors.text },
  nomeContatoBold: { fontWeight: "800" },
  valorTag: {
    backgroundColor: Colors.primary + "22",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  valorText: { fontSize: 12, fontWeight: "700", color: Colors.primary },
  projetoRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  projetoTitulo: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: "600",
    flex: 1,
  },
  hint: { fontSize: 13, color: Colors.textSecondary },
  hintUnread: { color: Colors.error, fontWeight: "600" },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text,
    textAlign: "center",
  },
  emptyText: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
  },
  emptyAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.primary + "22",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: Colors.primary + "44",
  },
  emptyActionText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.primary,
  },
});
