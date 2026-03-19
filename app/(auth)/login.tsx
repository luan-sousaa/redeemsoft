import { Ionicons } from '@expo/vector-icons';
import * as Google from 'expo-auth-session/providers/google';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import type { Href } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import React, { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
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

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const router = useRouter();
  const { login, loginWithGoogle } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const [, response, promptAsync] = Google.useAuthRequest({
    webClientId: Constants.expoConfig?.extra?.googleWebClientId,
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const token = response.authentication?.accessToken;
      if (token) handleGoogleToken(token);
      else setIsGoogleLoading(false);
    } else if (response?.type === 'error') {
      Toast.show({
        type: 'error',
        text1: 'Erro no Google Sign-In',
        text2: 'Não foi possível autenticar com o Google.',
      });
      setIsGoogleLoading(false);
    } else if (response?.type === 'dismiss' || response?.type === 'cancel') {
      setIsGoogleLoading(false);
    }
  }, [response]);

  function validate(): boolean {
    const newErrors: typeof errors = {};
    if (!email) newErrors.email = 'E-mail é obrigatório';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = 'E-mail inválido';
    if (!password) newErrors.password = 'Senha é obrigatória';
    else if (password.length < 6) newErrors.password = 'Senha deve ter ao menos 6 caracteres';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleLogin() {
    setHasSubmitted(true);
    if (!validate()) return;
    setIsLoading(true);
    try {
      await login(email, password);
    } catch (e: unknown) {
      Toast.show({
        type: 'error',
        text1: 'Erro ao entrar',
        text2: e instanceof Error ? e.message : 'Tente novamente.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleGoogleLogin() {
    setIsGoogleLoading(true);
    try {
      await promptAsync();
    } catch {
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'Falha ao abrir autenticação Google.',
      });
      setIsGoogleLoading(false);
    }
  }

  async function handleGoogleToken(token: string) {
    try {
      await loginWithGoogle(token);
    } catch (e: unknown) {
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: e instanceof Error ? e.message : 'Tente novamente.',
      });
    } finally {
      setIsGoogleLoading(false);
    }
  }

  const emailError = hasSubmitted ? errors.email : undefined;
  const passwordError = hasSubmitted ? errors.password : undefined;

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.logoContainer}>
            <Logo size="lg" />
          </View>

          <Text style={styles.title}>Bem-vindo de volta</Text>
          <Text style={styles.subtitle}>Entre na sua conta</Text>

          <View style={styles.form}>
            <Input
              label="E-mail"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              placeholder="seu@email.com"
              error={emailError}
            />

            <Input
              label="Senha"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              placeholder="••••••••"
              error={passwordError}
              rightIcon={
                <Pressable onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={22}
                    color={Colors.textSecondary}
                  />
                </Pressable>
              }
            />
          </View>

          <Pressable
            style={styles.forgotLink}
            onPress={() => router.push('/(auth)/forgot-password' as Href)}
          >
            <Text style={styles.linkText}>Esqueci minha senha</Text>
          </Pressable>

          <Button
            title="Entrar"
            onPress={handleLogin}
            isLoading={isLoading}
            style={styles.mainButton}
          />

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>ou</Text>
            <View style={styles.dividerLine} />
          </View>

          <Button
            title="Continuar com Google"
            onPress={handleGoogleLogin}
            isLoading={isGoogleLoading}
            variant="outline"
            leftIcon={
              <Ionicons name="logo-google" size={20} color={Colors.primary} />
            }
          />

          <View style={styles.signupRow}>
            <Text style={styles.signupText}>Não tem uma conta? </Text>
            <Pressable onPress={() => router.push('/(auth)/register' as Href)}>
              <Text style={styles.linkText}>Criar conta</Text>
            </Pressable>
          </View>
        </ScrollView>
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
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
  },
  form: {
    width: '100%',
  },
  forgotLink: {
    alignSelf: 'flex-end',
    marginBottom: 24,
    marginTop: -4,
  },
  mainButton: {
    marginBottom: 0,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  signupRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
  },
  signupText: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  linkText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
});
