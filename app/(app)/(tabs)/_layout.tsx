import { MaterialIcons } from '@expo/vector-icons';
import { Tabs, usePathname } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';

import { Colors } from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/services/api';

function useUnreadMessages(isAuthenticated: boolean) {
  const [count, setCount] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pathname = usePathname();

  const fetch = async () => {
    try {
      const data = await api.get<any[]>('/chat/conversas');
      const total = data.reduce((sum: number, c: any) => sum + (c.naoLidas ?? 0), 0);
      setCount(total);
    } catch {
      // silently ignore — badge just won't update
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    fetch();
    timerRef.current = setInterval(fetch, 30_000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isAuthenticated]);

  // Re-fetch when leaving the chat tab (user may have read messages)
  useEffect(() => {
    if (!isAuthenticated) return;
    fetch();
  }, [pathname]);

  return count;
}

export default function TabsLayout() {
  const { user } = useAuth();
  const isEmpresa = user?.type === 'client';
  const unreadCount = useUnreadMessages(!!user);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor: Colors.border,
          borderTopWidth: 1,
          height: 64,
          paddingBottom: 10,
          paddingTop: 8,
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textSecondary,
        tabBarLabelPosition: 'below-icon',
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Início',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="projetos"
        options={{
          title: isEmpresa ? 'Solicitações' : 'Projetos',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name={isEmpresa ? 'list-alt' : 'work-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="mensagens"
        options={{
          title: 'Mensagens',
          tabBarBadge: unreadCount > 0 ? (unreadCount > 99 ? '99+' : unreadCount) : undefined,
          tabBarBadgeStyle: {
            backgroundColor: Colors.error,
            fontSize: 10,
            fontWeight: '800',
            minWidth: 18,
            height: 18,
            lineHeight: 18,
          },
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="chat-bubble-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
