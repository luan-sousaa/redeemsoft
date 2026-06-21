import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter, type Href } from 'expo-router';
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
import { useProfile } from '@/contexts/ProfileContext';

type MenuItem = {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  href: Href;
  color?: string;
};

export default function PerfilTab() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { profile } = useProfile();

  const isDev = user?.type === 'developer';
  const avatarLetter = user?.name?.charAt(0).toUpperCase() ?? '?';
  const avatarUri = profile.fotoUri;

  const menuDev: MenuItem[] = [
    { icon: 'person-outline',       label: 'Sobre mim & Projetos',   href: '/(app)/sobre-mim' as Href },
    { icon: 'build-outline',        label: 'Habilidades',             href: '/(app)/editar-habilidades' as Href },
    { icon: 'ribbon-outline',       label: 'Certificados',            href: '/(app)/editar-certificados' as Href },
    { icon: 'create-outline',       label: 'Editar Perfil',           href: '/(app)/editar-perfil' as Href },
    { icon: 'settings-outline',     label: 'Configurações',           href: '/(app)/configuracoes' as Href },
    { icon: 'notifications-outline',label: 'Notificações',            href: '/(app)/notificacoes' as Href },
  ];

  const menuEmpresa: MenuItem[] = [
    { icon: 'business-outline',     label: 'Perfil da Empresa',      href: '/(app)/perfil-empresa' as Href },
    { icon: 'settings-outline',     label: 'Configurações',          href: '/(app)/configuracoes-empresa' as Href },
    { icon: 'notifications-outline',label: 'Notificações',           href: '/(app)/notificacoes' as Href },
  ];

  const menu = isDev ? menuDev : menuEmpresa;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Avatar + nome */}
        <View style={styles.heroSection}>
          <View style={styles.avatarWrap}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatarImg} contentFit="cover" />
            ) : (
              <Text style={styles.avatarLetter}>{avatarLetter}</Text>
            )}
          </View>
          <Text style={styles.nome}>{user?.name}</Text>
          <View style={styles.typeBadge}>
            <Ionicons
              name={isDev ? 'code-slash-outline' : 'business-outline'}
              size={12}
              color={Colors.primary}
            />
            <Text style={styles.typeBadgeText}>{isDev ? 'Desenvolvedor' : 'Empresa'}</Text>
          </View>
          <Text style={styles.email}>{user?.email}</Text>
        </View>

        {/* Menu */}
        <View style={styles.menuSection}>
          {menu.map(item => (
            <Pressable
              key={item.label}
              style={styles.menuItem}
              onPress={() => router.push(item.href)}
            >
              <View style={styles.menuIcon}>
                <Ionicons name={item.icon} size={20} color={item.color ?? Colors.primary} />
              </View>
              <Text style={[styles.menuLabel, item.color ? { color: item.color } : null]}>
                {item.label}
              </Text>
              <Ionicons name="chevron-forward" size={16} color={Colors.textSecondary} />
            </Pressable>
          ))}
        </View>

        {/* Sair */}
        <Pressable style={styles.logoutBtn} onPress={logout}>
          <Ionicons name="log-out-outline" size={20} color={Colors.error} />
          <Text style={styles.logoutText}>Sair da conta</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingBottom: 40 },

  heroSection: {
    alignItems: 'center', paddingVertical: 28, paddingHorizontal: 24,
    borderBottomWidth: 1, borderBottomColor: Colors.border, gap: 8,
  },
  avatarWrap: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: Colors.surfaceHighlight,
    overflow: 'hidden', marginBottom: 4,
  },
  avatarImg: { width: 88, height: 88 },
  avatarLetter: { fontSize: 36, fontWeight: '800', color: '#fff' },
  nome: { fontSize: 20, fontWeight: '800', color: Colors.text },
  typeBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: Colors.surface,
    borderWidth: 1, borderColor: Colors.primary,
    borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4,
  },
  typeBadgeText: { fontSize: 12, color: Colors.primary, fontWeight: '600' },
  email: { fontSize: 13, color: Colors.textSecondary },

  menuSection: { paddingHorizontal: 16, paddingTop: 12 },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 14, paddingHorizontal: 4,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  menuIcon: {
    width: 38, height: 38, borderRadius: 10,
    backgroundColor: Colors.surface,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.border,
  },
  menuLabel: { flex: 1, fontSize: 15, fontWeight: '600', color: Colors.text },

  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    marginHorizontal: 16, marginTop: 24,
    padding: 14, borderRadius: 12,
    backgroundColor: 'rgba(232,69,96,0.08)',
    borderWidth: 1, borderColor: 'rgba(232,69,96,0.2)',
  },
  logoutText: { fontSize: 15, fontWeight: '600', color: Colors.error },
});
