import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import type { Href } from 'expo-router';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
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

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { email, code } = useLocalSearchParams<{ email: string; code: string }>();
  const { resetPassword, isAuthenticated } = useAuth();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [errors, setErrors] = useState<{ newPassword?: string; confirmPassword?: string }>({});

  function validate(): boolean {
    const newErrors: typeof errors = {};

    if (!newPassword) {
      newErrors.newPassword = 'A nova senha é obrigatória';
    } else if (newPassword.length < 6) {
      newErrors.newPassword = 'A senha deve ter pelo menos 6 caracteres';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Confirme a nova senha';
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'As senhas não coincidem';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleReset() {
    setHasSubmitted(true);
    if (!validate()) return;

    setIsLoading(true);
    try {
      await resetPassword(email ?? '', code ?? '', newPassword);
      Toast.show({
        type: 'success',
        text1: 'Senha alterada!',
        text2: 'Sua senha foi redefinida com sucesso.',
      });
      // Usuário autenticado (veio das configurações) volta pro app; senão vai pro login
      router.replace((isAuthenticated ? '/(app)' : '/(auth)/login') as Href);
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
          {/* Logo */}
          <View style={styles.logoContainer}>
            <Logo size="md" />
          </View>

          {/* Título */}
          <Text style={styles.title}>Nova senha</Text>
          <Text style={styles.subtitle}>
            Crie uma senha forte para proteger sua conta.
          </Text>

          {/* Campo Nova Senha */}
          <Input
            label="Nova senha:"
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder="Crie sua senha"
            secureTextEntry={!showNew}
            autoCapitalize="none"
            autoCorrect={false}
            error={hasSubmitted ? errors.newPassword : undefined}
            rightIcon={
              <Ionicons
                name={showNew ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color={Colors.textSecondary}
                onPress={() => setShowNew((v) => !v)}
              />
            }
          />

          {/* Campo Confirmação */}
          <Input
            label="Confirmação da senha"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Digite a senha criada"
            secureTextEntry={!showConfirm}
            autoCapitalize="none"
            autoCorrect={false}
            error={hasSubmitted ? errors.confirmPassword : undefined}
            rightIcon={
              <Ionicons
                name={showConfirm ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color={Colors.textSecondary}
                onPress={() => setShowConfirm((v) => !v)}
              />
            }
          />

          {/* Botões */}
          <View style={styles.buttonsContainer}>
            <View style={styles.buttonHalf}>
              <Button
                title="Voltar ao início"
                variant="outline"
                onPress={() => router.replace('/(auth)/login' as Href)}
              />
            </View>
            <View style={styles.buttonHalf}>
              <Button
                title="Mudar senha"
                variant="primary"
                onPress={handleReset}
                isLoading={isLoading}
              />
            </View>
          </View>
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
  logoContainer: {
    alignItems: 'center',
    marginTop: 16,
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
  buttonsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 32,
  },
  buttonHalf: {
    flex: 1,
  },
});
