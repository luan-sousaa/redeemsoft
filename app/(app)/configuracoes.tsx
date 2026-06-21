import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import type { Href } from 'expo-router';
import React, { useEffect } from 'react';
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
import { useProfile } from '@/contexts/ProfileContext';

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

export default function ConfiguracoesScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { profile } = useProfile();

  // Empresas têm tela própria
  useEffect(() => {
    if (user?.type === 'client') {
      router.replace('/(app)/configuracoes-empresa' as Href);
    }
  }, [user?.type]);

  const items: ConfigItem[] = [
    {
      label: 'Trocar Senha',
      icon: 'lock-closed-outline',
      onPress: () => router.push('/(auth)/forgot-password' as Href),
    },
    {
      label: 'Sair da conta',
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

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Card de perfil — somente exibição */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            {profile.fotoUri ? (
              <Image source={{ uri: profile.fotoUri }} style={styles.avatarImage} contentFit="cover" />
            ) : (
              <Text style={styles.avatarLetter}>
                {user?.name?.charAt(0).toUpperCase() ?? '?'}
              </Text>
            )}
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.name}</Text>
            <Text style={styles.profileEmail}>{user?.email}</Text>
          </View>
        </View>

        {/* Conta */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Minha Conta</Text>
        </View>
        <View style={styles.sectionCard}>
          {items.map((item, i) => (
            <View key={item.label}>
              <ConfigRow item={item} />
              {i < items.length - 1 && <View style={styles.separator} />}
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, fontSize: 20, fontWeight: '800', color: Colors.text, textAlign: 'center' },

  scroll: { padding: 20, paddingBottom: 48, gap: 16 },

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
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: { width: 56, height: 56, borderRadius: 28 },
  avatarLetter: { fontSize: 22, fontWeight: '800', color: '#fff' },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 15, fontWeight: '700', color: Colors.text, marginBottom: 3 },
  profileEmail: { fontSize: 12, color: Colors.textSecondary },

  sectionHeader: { paddingHorizontal: 4 },
  sectionTitle: {
    fontSize: 13, fontWeight: '700', color: Colors.textSecondary,
    textTransform: 'uppercase', letterSpacing: 0.8,
  },
  sectionCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 15, gap: 14,
  },
  rowPressed: { backgroundColor: Colors.surfaceHighlight },
  rowIcon: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: 'rgba(79,110,247,0.12)',
    alignItems: 'center', justifyContent: 'center',
  },
  rowIconDanger: { backgroundColor: 'rgba(232,69,96,0.10)' },
  rowLabel: { flex: 1, fontSize: 15, fontWeight: '600', color: Colors.text },
  rowLabelDanger: { color: Colors.error },
  separator: { height: 1, backgroundColor: Colors.border, marginLeft: 66 },
});
