import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Logo } from '@/components/Logo';
import { Colors } from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';

export default function HomeScreen() {
  const { user, logout } = useAuth();

  const avatarLetter = user?.name?.charAt(0).toUpperCase() ?? '?';
  const typeLabel = user?.type === 'developer' ? 'Desenvolvedor' : 'Cliente';

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.topBar}>
          <Logo size="sm" />
          <Pressable style={styles.logoutButton} onPress={logout}>
            <Ionicons name="log-out-outline" size={24} color={Colors.textSecondary} />
          </Pressable>
        </View>

        {/* User profile */}
        <View style={styles.profileSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarLetter}>{avatarLetter}</Text>
          </View>
          <Text style={styles.userName}>Olá, {user?.name}</Text>
          <View style={styles.typeBadge}>
            <Text style={styles.typeBadgeText}>{typeLabel}</Text>
          </View>
          <Text style={styles.userEmail}>{user?.email}</Text>
        </View>

        {/* Welcome card */}
        <View style={styles.card}>
          <View style={styles.cardIconRow}>
            <Ionicons name="rocket-outline" size={24} color={Colors.primary} />
          </View>
          <Text style={styles.cardTitle}>Bem-vindo à RedeemSoft</Text>
          <Text style={styles.cardText}>
            A marketplace para manutenção e modernização de software. Conectamos clientes com
            desenvolvedores especializados para transformar seu legado em soluções modernas.
          </Text>
        </View>

        {/* Coming soon card */}
        <View style={[styles.card, styles.cardCentered]}>
          <Ionicons name="construct-outline" size={36} color={Colors.primary} />
          <Text style={styles.comingSoonTitle}>Funcionalidades em breve</Text>
          <Text style={styles.comingSoonText}>
            Estamos construindo algo incrível para você.{'\n'}Fique ligado!
          </Text>
        </View>

        {/* Stats placeholder */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Ionicons name="briefcase-outline" size={22} color={Colors.primary} />
            <Text style={styles.statValue}>—</Text>
            <Text style={styles.statLabel}>Projetos</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="star-outline" size={22} color={Colors.primary} />
            <Text style={styles.statValue}>—</Text>
            <Text style={styles.statLabel}>Avaliações</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="checkmark-circle-outline" size={22} color={Colors.primary} />
            <Text style={styles.statValue}>—</Text>
            <Text style={styles.statLabel}>Concluídos</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 40,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 40,
  },
  logoutButton: {
    padding: 8,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 36,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatarLetter: {
    fontSize: 34,
    fontWeight: '800',
    color: Colors.white,
  },
  userName: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 8,
  },
  typeBadge: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 4,
    marginBottom: 8,
  },
  typeBadgeText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
  },
  userEmail: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 20,
    marginBottom: 16,
  },
  cardCentered: {
    alignItems: 'center',
  },
  cardIconRow: {
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  cardText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  comingSoonTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 12,
    marginBottom: 6,
  },
  comingSoonText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    gap: 6,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
});
