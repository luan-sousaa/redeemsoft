/**
 * Aba "Perfil" — hub de navegação que substitui o DrawerMenu
 * Mostra avatar, nome, e links para: editar perfil, notificações, configurações, sair
 */
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import type { Href } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors } from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/contexts/ProfileContext';

type MenuItem = {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  onPress: () => void;
  danger?: boolean;
};

function MenuRow({ item }: { item: MenuItem }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.menuRow, pressed && styles.menuRowPressed]}
      onPress={item.onPress}
    >
      <View style={[styles.menuIcon, item.danger && styles.menuIconDanger]}>
        <Ionicons
          name={item.icon}
          size={20}
          color={item.danger ? Colors.error : Colors.primary}
        />
      </View>
      <Text style={[styles.menuLabel, item.danger && styles.menuLabelDanger]}>
        {item.label}
      </Text>
      {!item.danger && (
        <Ionicons name="chevron-forward" size={16} color={Colors.textSecondary} />
      )}
    </Pressable>
  );
}

export default function PerfilTab() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { profile } = useProfile();

  const isEmpresa = user?.type === 'client';
  const avatarUri = profile.fotoUri;
  const avatarLetter = user?.name?.charAt(0).toUpperCase() ?? '?';
  const typeLabel = isEmpresa ? 'Empresa' : 'Desenvolvedor';

  const menuItens: MenuItem[] = isEmpresa
    ? [
        {
          icon: 'business-outline',
          label: 'Meu Perfil Empresa',
          onPress: () => router.push('/(app)/perfil-empresa' as Href),
        },
        {
          icon: 'folder-open-outline',
          label: 'Minhas Solicitações',
          onPress: () => router.push('/(app)/meus-projetos' as Href),
        },
        {
          icon: 'notifications-outline',
          label: 'Notificações',
          onPress: () => router.push('/(app)/notificacoes' as Href),
        },
        {
          icon: 'settings-outline',
          label: 'Configurações',
          onPress: () => router.push('/(app)/configuracoes-empresa' as Href),
        },
      ]
    : [
        {
          icon: 'person-outline',
          label: 'Meu Perfil',
          onPress: () => router.push('/(app)/sobre-mim' as Href),
        },
        {
          icon: 'notifications-outline',
          label: 'Notificações',
          onPress: () => router.push('/(app)/notificacoes' as Href),
        },
        {
          icon: 'settings-outline',
          label: 'Configurações',
          onPress: () => router.push('/(app)/configuracoes' as Href),
        },
      ];

  const sairItem: MenuItem = {
    icon: 'log-out-outline',
    label: 'Sair da conta',
    onPress: logout,
    danger: true,
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Cabeçalho com avatar */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarWrap}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatarImg} contentFit="cover" />
            ) : (
              <Text style={styles.avatarLetter}>{avatarLetter}</Text>
            )}
          </View>
          <Text style={styles.userName}>{user?.name}</Text>
          <View style={[styles.typeBadge, isEmpresa && styles.typeBadgeEmpresa]}>
            <Ionicons
              name={isEmpresa ? 'business-outline' : 'code-slash-outline'}
              size={12}
              color={isEmpresa ? '#F5A623' : Colors.primary}
            />
            <Text style={[styles.typeBadgeText, isEmpresa && styles.typeBadgeTextEmpresa]}>
              {typeLabel}
            </Text>
          </View>
          <Text style={styles.userEmail}>{user?.email}</Text>
        </View>

        {/* Menu de opções */}
        <View style={styles.menuSection}>
          {menuItens.map((item, i) => (
            <View key={i}>
              <MenuRow item={item} />
              {i < menuItens.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </View>

        {/* Sair */}
        <View style={[styles.menuSection, { marginTop: 16 }]}>
          <MenuRow item={sairItem} />
        </View>

        <Text style={styles.version}>RedeemSoft v1.0</Text>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingHorizontal: 20, paddingBottom: 40 },

  profileHeader: {
    alignItems: 'center',
    paddingTop: 24,
    paddingBottom: 32,
  },
  avatarWrap: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: Colors.primary + '66',
  },
  avatarImg: { width: 88, height: 88, borderRadius: 44 },
  avatarLetter: { fontSize: 36, fontWeight: '800', color: '#fff' },
  userName: { fontSize: 22, fontWeight: '800', color: Colors.text, marginBottom: 8 },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Colors.primary + '22',
    borderWidth: 1,
    borderColor: Colors.primary + '55',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginBottom: 8,
  },
  typeBadgeEmpresa: {
    backgroundColor: '#F5A62322',
    borderColor: '#F5A62355',
  },
  typeBadgeText: { fontSize: 12, color: Colors.primary, fontWeight: '600' },
  typeBadgeTextEmpresa: { color: '#F5A623' },
  userEmail: { fontSize: 13, color: Colors.textSecondary },

  menuSection: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  menuRowPressed: { backgroundColor: Colors.surfaceHighlight },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.primary + '22',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuIconDanger: { backgroundColor: Colors.error + '22' },
  menuLabel: { flex: 1, fontSize: 15, fontWeight: '600', color: Colors.text },
  menuLabelDanger: { color: Colors.error },
  divider: { height: 1, backgroundColor: Colors.border, marginLeft: 66 },

  version: {
    textAlign: 'center',
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 32,
  },
});
