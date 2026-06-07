import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import type { Href } from 'expo-router';
import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors } from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';

// ─── Item de configuração ─────────────────────────────────────────────────────

type ConfigItem = {
  label: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  onPress: () => void;
  danger?: boolean;
};

function ConfigRow({ item }: { item: ConfigItem }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
      onPress={item.onPress}
    >
      <View style={[styles.rowIcon, item.danger && styles.rowIconDanger]}>
        <Ionicons
          name={item.icon}
          size={20}
          color={item.danger ? Colors.error : Colors.primary}
        />
      </View>
      <Text style={[styles.rowLabel, item.danger && styles.rowLabelDanger]}>
        {item.label}
      </Text>
      {!item.danger && (
        <Ionicons name="chevron-forward" size={18} color={Colors.textSecondary} />
      )}
    </Pressable>
  );
}

// ─── Seção ────────────────────────────────────────────────────────────────────

function Section({
  title,
  titleIcon,
  items,
}: {
  title: string;
  titleIcon?: React.ComponentProps<typeof Ionicons>['name'];
  items: ConfigItem[];
}) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {titleIcon && (
          <Ionicons name={titleIcon} size={16} color={Colors.textSecondary} />
        )}
      </View>
      <View style={styles.sectionCard}>
        {items.map((item, index) => (
          <View key={item.label}>
            <ConfigRow item={item} />
            {index < items.length - 1 && <View style={styles.separator} />}
          </View>
        ))}
      </View>
    </View>
  );
}

// ─── Tela ─────────────────────────────────────────────────────────────────────

export default function ConfiguracoesScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const editarPerfilItems: ConfigItem[] = [
    {
      label: 'Sobre mim',
      icon: 'person-outline',
      onPress: () => router.push('/(app)/sobre-mim' as Href),
    },
    {
      label: 'Habilidades',
      icon: 'code-slash-outline',
      onPress: () => router.push('/(app)/editar-habilidades' as Href),
    },
    {
      label: 'Certificados',
      icon: 'ribbon-outline',
      onPress: () => router.push('/(app)/editar-certificados' as Href),
    },
    {
      label: 'Projetos',
      icon: 'briefcase-outline',
      onPress: () => router.push('/(app)/sobre-mim' as Href),
    },
  ];

  const minhaContaItems: ConfigItem[] = [
    {
      label: 'Trocar Senha',
      icon: 'lock-closed-outline',
      onPress: () => router.push('/(auth)/forgot-password' as Href),
    },
    {
      label: 'Sair',
      icon: 'log-out-outline',
      onPress: logout,
      danger: true,
    },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Configurações</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar resumido */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarLetter}>
              {user?.name?.charAt(0).toUpperCase() ?? '?'}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.name}</Text>
            <Text style={styles.profileEmail}>{user?.email}</Text>
          </View>
          <Pressable
            style={styles.editAvatarBtn}
            onPress={() => router.push('/(app)/sobre-mim' as Href)}
          >
            <Ionicons name="create-outline" size={20} color={Colors.primary} />
          </Pressable>
        </View>

        {/* Editar Perfil */}
        <Section
          title="Editar Perfil"
          titleIcon="create-outline"
          items={editarPerfilItems}
        />

        {/* Minha Conta */}
        <Section
          title="Minha Conta"
          items={minhaContaItems}
        />
      </ScrollView>
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
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
    textAlign: 'center',
  },

  scroll: {
    padding: 20,
    paddingBottom: 48,
    gap: 20,
  },

  // Card de perfil
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 14,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.white,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 3,
  },
  profileEmail: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  editAvatarBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surfaceHighlight,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Seção
  section: {
    gap: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  sectionCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },

  // Linha
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 15,
    gap: 14,
  },
  rowPressed: {
    backgroundColor: Colors.surfaceHighlight,
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(79,110,247,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowIconDanger: {
    backgroundColor: 'rgba(232,69,96,0.10)',
  },
  rowLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
  },
  rowLabelDanger: {
    color: Colors.error,
  },
  separator: {
    height: 1,
    backgroundColor: Colors.border,
    marginLeft: 66,
  },
});
