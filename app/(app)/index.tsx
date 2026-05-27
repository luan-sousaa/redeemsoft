import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import type { Href } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Logo } from '@/components/Logo';
import { DrawerMenu } from '@/components/DrawerMenu';
import { Colors } from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';

// ─── Quick-access card ────────────────────────────────────────────────────────

function AcessoCard({
  icon,
  title,
  description,
  onPress,
  highlight,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  title: string;
  description: string;
  onPress: () => void;
  highlight?: boolean;
}) {
  return (
    <Pressable
      style={[styles.accessCard, highlight && styles.accessCardHighlight]}
      onPress={onPress}
    >
      <View style={[styles.accessIcon, highlight && styles.accessIconHighlight]}>
        <Ionicons name={icon} size={26} color={Colors.primary} />
      </View>
      <View style={styles.accessText}>
        <Text style={styles.accessTitle}>{title}</Text>
        <Text style={styles.accessDesc}>{description}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={Colors.primary} />
    </Pressable>
  );
}

// ─── Home Desenvolvedor ───────────────────────────────────────────────────────

function HomeDev() {
  const router = useRouter();
  return (
    <>
      <Animated.View entering={FadeInUp.delay(0).duration(350)}>
        <View style={styles.sectionHeader}>
          <Ionicons name="flash-outline" size={16} color={Colors.primary} />
          <Text style={styles.sectionTitle}>Acesso rápido</Text>
        </View>
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(80).duration(350)}>
        <AcessoCard
          icon="storefront-outline"
          title="Marketplace"
          description="Encontre projetos legados e vibecodados para trabalhar"
          onPress={() => router.push('/(app)/marketplace' as Href)}
          highlight
        />
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(160).duration(350)}>
        <AcessoCard
          icon="document-text-outline"
          title="Minhas Candidaturas"
          description="Acompanhe o status das suas propostas enviadas"
          onPress={() => router.push('/(app)/minhas-candidaturas' as Href)}
        />
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(240).duration(350)}>
        <View style={styles.tipCard}>
          <Ionicons name="bulb-outline" size={20} color={Colors.primary} />
          <View style={{ flex: 1 }}>
            <Text style={styles.tipTitle}>Como funciona para devs</Text>
            <Text style={styles.tipText}>
              Navegue pelo marketplace, escolha projetos com a sua stack, envie sua proposta com prazo e valor. A empresa avalia e entra em contato.
            </Text>
          </View>
        </View>
      </Animated.View>
    </>
  );
}

// ─── Home Empresa ─────────────────────────────────────────────────────────────

function HomeEmpresa() {
  const router = useRouter();
  return (
    <>
      <Animated.View entering={FadeInUp.delay(0).duration(350)}>
        <View style={styles.sectionHeader}>
          <Ionicons name="flash-outline" size={16} color={Colors.primary} />
          <Text style={styles.sectionTitle}>Acesso rápido</Text>
        </View>
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(80).duration(350)}>
        <AcessoCard
          icon="search-outline"
          title="Buscar Desenvolvedores"
          description="Encontre devs especializados em sistemas legados e vibecodados"
          onPress={() => router.push('/(app)/buscar-desenvolvedores' as Href)}
          highlight
        />
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(160).duration(350)}>
        <AcessoCard
          icon="document-text-outline"
          title="Minhas Solicitações"
          description="Veja candidatos e gerencie os projetos que você publicou"
          onPress={() => router.push('/(app)/meus-projetos' as Href)}
        />
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(240).duration(350)}>
        <AcessoCard
          icon="add-circle-outline"
          title="Nova Solicitação"
          description="Publique um sistema legado e encontre o dev certo"
          onPress={() => router.push('/(app)/criar-projeto' as Href)}
        />
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(320).duration(350)}>
        <View style={styles.tipCard}>
          <Ionicons name="bulb-outline" size={20} color={Colors.primary} />
          <View style={{ flex: 1 }}>
            <Text style={styles.tipTitle}>Como funciona para empresas</Text>
            <Text style={styles.tipText}>
              Publique um projeto descrevendo seu sistema, orçamento e prazo. Desenvolvedores se candidatam e você escolhe o melhor perfil.
            </Text>
          </View>
        </View>
      </Animated.View>
    </>
  );
}

// ─── Tela principal ───────────────────────────────────────────────────────────

export default function HomeScreen() {
  const { user, logout } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const isDev = user?.type === 'developer';
  const typeLabel = isDev ? 'Desenvolvedor' : 'Empresa';
  const avatarLetter = user?.name?.charAt(0).toUpperCase() ?? '?';

  return (
    <SafeAreaView style={styles.safe}>
      {/* Drawer menu (empresa) */}
      {!isDev && (
        <DrawerMenu
          visible={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          activeScreen="home"
        />
      )}

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Top bar */}
        <View style={styles.topBar}>
          {/* Botão sanduiche apenas para empresa */}
          {isDev ? (
            <Logo size="sm" />
          ) : (
            <Pressable style={styles.menuBtn} onPress={() => setDrawerOpen(true)}>
              <Ionicons name="menu-outline" size={28} color={Colors.text} />
            </Pressable>
          )}
          <Pressable style={styles.logoutButton} onPress={logout}>
            <Ionicons name="log-out-outline" size={24} color={Colors.textSecondary} />
          </Pressable>
        </View>

        {/* Perfil */}
        <View style={styles.profileSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarLetter}>{avatarLetter}</Text>
          </View>
          <Text style={styles.userName}>Olá, {user?.name}</Text>
          <View style={[styles.typeBadge, isDev ? styles.typeBadgeDev : styles.typeBadgeEmpresa]}>
            <Ionicons
              name={isDev ? 'code-slash-outline' : 'business-outline'}
              size={12}
              color={Colors.primary}
            />
            <Text style={styles.typeBadgeText}>{typeLabel}</Text>
          </View>
          <Text style={styles.userEmail}>{user?.email}</Text>
        </View>

        {/* Conteúdo por tipo */}
        {isDev ? <HomeDev /> : <HomeEmpresa />}

      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 16, paddingBottom: 40 },

  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  logoutButton: { padding: 8 },
  menuBtn: { padding: 4 },

  profileSection: { alignItems: 'center', marginBottom: 32 },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatarLetter: { fontSize: 34, fontWeight: '800', color: Colors.white },
  userName: { fontSize: 24, fontWeight: '800', color: Colors.text, marginBottom: 8 },
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
    marginBottom: 8,
  },
  typeBadgeDev: { borderColor: Colors.primary },
  typeBadgeEmpresa: { borderColor: '#F5A623' },
  typeBadgeText: { fontSize: 12, color: Colors.primary, fontWeight: '600' },
  userEmail: { fontSize: 13, color: Colors.textSecondary },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },

  accessCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 14,
  },
  accessCardHighlight: {
    borderColor: Colors.primary,
  },
  accessIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.surfaceHighlight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accessIconHighlight: {
    backgroundColor: 'rgba(79,110,247,0.15)',
  },
  accessText: { flex: 1 },
  accessTitle: { fontSize: 15, fontWeight: '700', color: Colors.text, marginBottom: 4 },
  accessDesc: { fontSize: 13, color: Colors.textSecondary, lineHeight: 18 },

  tipCard: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginTop: 4,
    alignItems: 'flex-start',
  },
  tipTitle: { fontSize: 13, fontWeight: '700', color: Colors.text, marginBottom: 6 },
  tipText: { fontSize: 13, color: Colors.textSecondary, lineHeight: 20 },
});
