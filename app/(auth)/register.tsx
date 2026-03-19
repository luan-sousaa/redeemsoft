import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
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

type UserType = 'client' | 'developer';

type FormErrors = {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
};

export default function RegisterScreen() {
  const router = useRouter();
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [userType, setUserType] = useState<UserType>('client');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  function validate(): boolean {
    const newErrors: FormErrors = {};
    if (!name.trim() || name.trim().length < 2)
      newErrors.name = 'Nome deve ter ao menos 2 caracteres';
    if (!email) newErrors.email = 'E-mail é obrigatório';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = 'E-mail inválido';
    if (!password) newErrors.password = 'Senha é obrigatória';
    else if (password.length < 8) newErrors.password = 'Senha deve ter ao menos 8 caracteres';
    if (!confirmPassword) newErrors.confirmPassword = 'Confirme sua senha';
    else if (confirmPassword !== password) newErrors.confirmPassword = 'As senhas não coincidem';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleRegister() {
    setHasSubmitted(true);
    if (!validate()) return;
    if (!termsAccepted) {
      Toast.show({
        type: 'error',
        text1: 'Termos de uso',
        text2: 'Você precisa aceitar os termos de uso para continuar.',
      });
      return;
    }
    setIsLoading(true);
    try {
      await register({ name: name.trim(), email, password, type: userType });
    } catch (e: unknown) {
      Toast.show({
        type: 'error',
        text1: 'Erro ao criar conta',
        text2: e instanceof Error ? e.message : 'Tente novamente.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  const e = hasSubmitted ? errors : {};

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
          <View style={styles.header}>
            <Pressable style={styles.backButton} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color={Colors.text} />
            </Pressable>
          </View>

          <View style={styles.logoContainer}>
            <Logo size="md" />
          </View>

          <Text style={styles.title}>Criar sua conta</Text>
          <Text style={styles.subtitle}>Junte-se à RedeemSoft</Text>

          <Input
            label="Nome completo"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            placeholder="João Silva"
            error={e.name}
          />

          <Input
            label="E-mail"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="seu@email.com"
            error={e.email}
          />

          <Input
            label="Senha"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            placeholder="Mínimo 8 caracteres"
            error={e.password}
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

          <Input
            label="Confirmar senha"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showConfirmPassword}
            placeholder="Repita sua senha"
            error={e.confirmPassword}
            rightIcon={
              <Pressable onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                <Ionicons
                  name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={22}
                  color={Colors.textSecondary}
                />
              </Pressable>
            }
          />

          <Text style={styles.typeLabel}>Tipo de conta</Text>
          <View style={styles.typeRow}>
            <Pressable
              style={[styles.typeButton, userType === 'client' && styles.typeButtonSelected]}
              onPress={() => setUserType('client')}
            >
              <Ionicons
                name="person-outline"
                size={18}
                color={userType === 'client' ? Colors.white : Colors.textSecondary}
              />
              <Text
                style={[styles.typeText, userType === 'client' && styles.typeTextSelected]}
              >
                Cliente
              </Text>
            </Pressable>
            <Pressable
              style={[styles.typeButton, userType === 'developer' && styles.typeButtonSelected]}
              onPress={() => setUserType('developer')}
            >
              <Ionicons
                name="code-slash-outline"
                size={18}
                color={userType === 'developer' ? Colors.white : Colors.textSecondary}
              />
              <Text
                style={[styles.typeText, userType === 'developer' && styles.typeTextSelected]}
              >
                Desenvolvedor
              </Text>
            </Pressable>
          </View>

          <Pressable style={styles.termsRow} onPress={() => setTermsAccepted(!termsAccepted)}>
            <Ionicons
              name={termsAccepted ? 'checkbox' : 'square-outline'}
              size={24}
              color={termsAccepted ? Colors.primary : Colors.textSecondary}
            />
            <Text style={styles.termsText}>
              Aceito os{' '}
              <Text style={styles.termsLink}>Termos de Uso</Text>
              {' '}e a{' '}
              <Text style={styles.termsLink}>Política de Privacidade</Text>
            </Text>
          </Pressable>

          <Button
            title="Criar conta"
            onPress={handleRegister}
            isLoading={isLoading}
            style={styles.mainButton}
          />

          <View style={styles.loginRow}>
            <Text style={styles.loginText}>Já tem uma conta? </Text>
            <Pressable onPress={() => router.back()}>
              <Text style={styles.linkText}>Entrar</Text>
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
    marginBottom: 28,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 28,
  },
  typeLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
    marginBottom: 10,
    marginTop: 4,
  },
  typeRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  typeButton: {
    flex: 1,
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  typeButtonSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  typeText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  typeTextSelected: {
    color: Colors.white,
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 24,
  },
  termsText: {
    flex: 1,
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  termsLink: {
    color: Colors.primary,
    fontWeight: '600',
  },
  mainButton: {},
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  loginText: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  linkText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
});
