import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors } from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';

export default function NotificacoesScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const isDev = user?.type === 'developer';

  const [notification, setNotification] = useState({
    title: isDev
      ? 'Projeto atualizado'
      : 'Novo candidato interessado',

    message: isDev
      ? 'Uma empresa atualizou o status da sua candidatura.'
      : 'Um desenvolvedor demonstrou interesse no seu projeto.',

    time: 'Agora',
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons
            name="chevron-back"
            size={24}
            color={Colors.text}
          />
        </Pressable>

        <Text style={styles.title}>
          Notificações
        </Text>

        <View style={{ width: 40 }} />
      </View>

      {!notification ? (
        <View style={styles.emptyContainer}>
          <Ionicons
            name="notifications-off-outline"
            size={70}
            color={Colors.textSecondary}
          />

          <Text style={styles.emptyTitle}>
            Nenhuma notificação
          </Text>

          <Text style={styles.emptyText}>
            Você ainda não possui notificações.
          </Text>
        </View>
      ) : (
        <View style={styles.card}>
          <View style={styles.iconContainer}>
            <Ionicons
              name="notifications"
              size={22}
              color={Colors.primary}
            />
          </View>

          <View style={styles.content}>
            <Text style={styles.cardTitle}>
              {notification.title}
            </Text>

            <Text style={styles.cardText}>
              {notification.message}
            </Text>

            <Text style={styles.time}>
              {notification.time}
            </Text>
          </View>

          <Pressable
            onPress={() => setNotification(null as any)}
            style={styles.deleteButton}
          >
            <Ionicons
              name="trash-outline"
              size={20}
              color={Colors.error}
            />
          </Pressable>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: 20,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    marginBottom: 28,
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },

  title: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
  },

  card: {
    backgroundColor: Colors.surface,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: Colors.surfaceHighlight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },

  content: {
    flex: 1,
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 6,
  },

  cardText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 22,
  },

  time: {
    marginTop: 10,
    fontSize: 12,
    color: Colors.textSecondary,
  },

  deleteButton: {
    padding: 6,
    marginLeft: 10,
  },

  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyTitle: {
    color: Colors.text,
    fontSize: 20,
    fontWeight: '700',
    marginTop: 18,
  },

  emptyText: {
    color: Colors.textSecondary,
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
});