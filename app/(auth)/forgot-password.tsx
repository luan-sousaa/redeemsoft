import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import type { Href } from 'expo-router';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Colors } from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { forgotPassword } = useAuth();

  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [error, setError] = useState<string | undefined>();

  function validate(): boolean {
    if (!email) {
      setError('E-mail é obrigatório');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('E-mail inválido');
      return false;
    }
    setError(undefined);
    return true;
  }

  async function handleForgot() {
    setHasSubmitted(true);
    if (!validate()) return;
    setIsLoading(true);
    try {
      await forgotPassword(email);
      setSent(true);
    } catch (e: unknown) {
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: e instanceof Error ? e.message : 'Tente novamente.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <Pressable style={styles.backButton} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color={Colors.text} />
            </Pressable>
          </View>

          <View style={styles.logoContainer}>
            <Logo size="md" />
          </View>

          {sent ? (
            <View style={styles.successContainer}>
              <Ionicons name="checkmark-circle" size={80} color={Colors.primary} />
              <Text style={styles.successTitle}>Link enviado!</Text>
              <Text style={styles.successText}>
                Verifique sua caixa de entrada em{'\n'}
                <Text style={styles.emailHighlight}>{email}</Text>
              </Text>
              <Button
                title="Voltar ao login"
                variant="outline"
                onPress={() => router.replace('/(auth)/login' as Href)}
                style={styles.backToLoginButton}
              />
            </View>
          ) : (
            <>
              <Text style={styles.title}>Recuperar senha</Text>
              <Text style={styles.subtitle}>
                Informe seu e-mail e enviaremos um link de recuperação.
              </Text>

              <Input
                label="E-mail"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                placeholder="seu@email.com"
                error={hasSubmitted ? error : undefined}
              />

              <Button
                title="Enviar link de recuperação"
                onPress={handleForgot}
                isLoading={isLoading}
              />
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: 28,
  },
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 60,
  },
  successTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.text,
    marginTop: 20,
    marginBottom: 12,
  },
  successText: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  emailHighlight: {
    color: Colors.primary,
    fontWeight: '600',
  },
  backToLoginButton: {
    marginTop: 36,
  },
});
