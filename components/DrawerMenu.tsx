import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import type { Href } from 'expo-router';
import React from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors } from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';

// ─── Tipos ────────────────────────────────────────────────────────────────────

type DrawerNavItem = {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  onPress: () => void;
  active?: boolean;
};

// ─── Linha de nav item ────────────────────────────────────────────────────────

function NavItem({ item }: { item: DrawerNavItem }) {
  return (
    <Pressable
      style={[styles.drawerItem, item.active && styles.drawerItemActive]}
      onPress={item.onPress}
    >
      <Ionicons
        name={item.icon}
        size={22}
        color={item.active ? Colors.primary : Colors.text}
      />
      <Text style={[styles.drawerItemText, item.active && styles.drawerItemTextActive]}>
        {item.label}
      </Text>
    </Pressable>
  );
}

// ─── Drawer principal ─────────────────────────────────────────────────────────

export function DrawerMenu({
  visible,
  onClose,
  activeScreen,
}: {
  visible: boolean;
  onClose: () => void;
  activeScreen?: string;
}) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const isDev = user?.type === 'developer';
  const firstName = user?.name?.split(' ')[0] ?? 'Usuário';

  const devItems: DrawerNavItem[] = [
    {
      icon: 'home-outline',
      label: 'Home',
      onPress: () => { onClose(); router.push('/(app)' as Href); },
      active: activeScreen === 'home',
    },
    {
      icon: 'person-outline',
      label: 'Perfil',
      onPress: () => { onClose(); },
      active: activeScreen === 'perfil',
    },
    {
      icon: 'chatbubble-outline',
      label: 'Chat',
      onPress: () => { onClose(); router.push('/(app)/chat-conversa' as Href); },
      active: activeScreen === 'chat',
    },
    {
      icon: 'search-outline',
      label: 'Buscar',
      onPress: () => { onClose(); router.push('/(app)/marketplace' as Href); },
      active: activeScreen === 'marketplace',
    },
    {
      icon: 'briefcase-outline',
      label: 'Minhas Candidaturas',
      onPress: () => { onClose(); router.push('/(app)/minhas-candidaturas' as Href); },
      active: activeScreen === 'minhas-candidaturas',
    },

    {
      icon: 'notifications-outline',
      label: 'Notificações',
      onPress: () => {
        onClose();
        router.push('/(app)/notificacoes');
      },
      active: activeScreen === 'notificacoes',
    },
    
    {
      icon: 'settings-outline',
      label: 'Configurações',
      onPress: () => { onClose(); router.push('/(app)/configuracoes' as Href); },
      active: activeScreen === 'configuracoes',
    },
  ];

  const empresaItems: DrawerNavItem[] = [
    {
      icon: 'home-outline',
      label: 'Home',
      onPress: () => { onClose(); router.push('/(app)' as Href); },
      active: activeScreen === 'home',
    },
    {
      icon: 'person-outline',
      label: 'Perfil',
      onPress: () => { onClose(); },
      active: activeScreen === 'perfil',
    },
    {
      icon: 'chatbubble-outline',
      label: 'Chat',
      onPress: () => { onClose(); router.push('/(app)/chat-conversa' as Href); },
      active: activeScreen === 'chat',
    },
    {
      icon: 'search-outline',
      label: 'Buscar',
      onPress: () => { onClose(); router.push('/(app)/buscar-desenvolvedores' as Href); },
      active: activeScreen === 'buscar-desenvolvedores',
    },
    {
      icon: 'document-text-outline',
      label: 'Minhas Solicitações',
      onPress: () => { onClose(); router.push('/(app)/meus-projetos' as Href); },
      active: activeScreen === 'meus-projetos',
    },
    {
      icon: 'add-circle-outline',
      label: 'Nova Solicitação',
      onPress: () => { onClose(); router.push('/(app)/criar-projeto' as Href); },
      active: activeScreen === 'criar-projeto',
    },
    {
    icon: 'notifications-outline',
    label: 'Notificações',
    onPress: () => {
      onClose();
      router.push('/(app)/notificacoes');
    },
    active: activeScreen === 'notificacoes',
    },
    
    
    {
      icon: 'settings-outline',
      label: 'Configurações',
      onPress: () => { onClose(); router.push('/(app)/configuracoes' as Href); },
      active: activeScreen === 'configuracoes',
    },
  ];

  const items = isDev ? devItems : empresaItems;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.drawerOverlay} />
      </TouchableWithoutFeedback>

      <View style={styles.drawer}>
        <SafeAreaView style={styles.drawerSafe}>

          {/* Botão fechar (chevron esquerdo) */}
          <Pressable onPress={onClose} style={styles.drawerCloseBtn}>
            <Ionicons name="chevron-back" size={24} color={Colors.textSecondary} />
          </Pressable>

          {/* Saudação */}
          <Text style={styles.drawerGreeting}>Olá, {firstName}!</Text>

          {/* Avatar */}
          <View style={styles.drawerAvatarContainer}>
            <View style={styles.drawerAvatar}>
              <Text style={styles.drawerAvatarLetter}>
                {user?.name?.charAt(0).toUpperCase() ?? '?'}
              </Text>
            </View>
          </View>

          {/* Três pontos */}
          <Pressable style={styles.drawerMoreBtn}>
            <Ionicons name="ellipsis-horizontal" size={20} color={Colors.textSecondary} />
          </Pressable>

          {/* Navegação */}
          <ScrollView
            style={styles.drawerNav}
            showsVerticalScrollIndicator={false}
          >
            {items.map((item) => (
              <NavItem key={item.label} item={item} />
            ))}
          </ScrollView>

          {/* Sair no rodapé */}
          <Pressable
            style={styles.drawerLogout}
            onPress={() => { onClose(); logout(); }}
          >
            <Ionicons name="log-out-outline" size={20} color={Colors.error} />
            <Text style={styles.drawerLogoutText}>Sair</Text>
          </Pressable>

        </SafeAreaView>
      </View>
    </Modal>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  drawerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  drawer: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: '75%',
    backgroundColor: Colors.background,
    borderRightWidth: 1,
    borderRightColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 6, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 24,
  },
  drawerSafe: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 4,
    paddingBottom: 16,
  },
  drawerCloseBtn: {
    alignSelf: 'flex-end',
    padding: 8,
    marginBottom: 4,
  },
  drawerGreeting: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 20,
  },
  drawerAvatarContainer: {
    marginBottom: 16,
  },
  drawerAvatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  drawerAvatarLetter: {
    fontSize: 30,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  drawerMoreBtn: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 2,
    marginBottom: 20,
  },
  drawerNav: {
    flex: 1,
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginBottom: 2,
  },
  drawerItemActive: {
    backgroundColor: Colors.surfaceHighlight,
  },
  drawerItemText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  drawerItemTextActive: {
    color: Colors.primary,
  },
  drawerLogout: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    marginTop: 8,
  },
  drawerLogoutText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.error,
  },
});
