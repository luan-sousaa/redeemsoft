import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Modal,
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
import Head from 'expo-router/head';

type UserType = 'client' | 'developer';

type FormErrors = {
  name?: string;
  email?: string;
  city?: string;
  state?: string;
  password?: string;
  confirmPassword?: string;
  cpfCnpj?: string;
};

function maskCPF(v: string): string {
  return v
    .replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
    .slice(0, 14);
}

function maskCNPJ(v: string): string {
  return v
    .replace(/\D/g, '')
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1/$2')
    .replace(/(\d{4})(\d{1,2})$/, '$1-$2')
    .slice(0, 18);
}

function validateCPF(cpf: string): boolean {
  const d = cpf.replace(/\D/g, '');
  if (d.length !== 11 || /^(\d)\1+$/.test(d)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(d[i]) * (10 - i);
  let rem = (sum * 10) % 11;
  if (rem === 10 || rem === 11) rem = 0;
  if (rem !== parseInt(d[9])) return false;
  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(d[i]) * (11 - i);
  rem = (sum * 10) % 11;
  if (rem === 10 || rem === 11) rem = 0;
  return rem === parseInt(d[10]);
}

function validateCNPJ(cnpj: string): boolean {
  const d = cnpj.replace(/\D/g, '');
  if (d.length !== 14 || /^(\d)\1+$/.test(d)) return false;
  const w1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  let sum = w1.reduce((acc, w, i) => acc + parseInt(d[i]) * w, 0);
  let rem = sum % 11;
  const dv1 = rem < 2 ? 0 : 11 - rem;
  if (dv1 !== parseInt(d[12])) return false;
  const w2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  sum = w2.reduce((acc, w, i) => acc + parseInt(d[i]) * w, 0);
  rem = sum % 11;
  const dv2 = rem < 2 ? 0 : 11 - rem;
  return dv2 === parseInt(d[13]);
}

const ESTADOS_BR = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO',
  'MA','MT','MS','MG','PA','PB','PR','PE','PI',
  'RJ','RN','RS','RO','RR','SC','SP','SE','TO',
];

export default function RegisterScreen() {
  const router = useRouter();
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [stateModalVisible, setStateModalVisible] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [cpfCnpj, setCpfCnpj] = useState('');
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
    if (!city.trim() || city.trim().length < 2)
      newErrors.city = 'Cidade deve ter ao menos 2 caracteres';
    if (!state) newErrors.state = 'Selecione um estado';
    if (!password) newErrors.password = 'Senha é obrigatória';
    else if (password.length < 8) newErrors.password = 'Senha deve ter ao menos 8 caracteres';
    if (!confirmPassword) newErrors.confirmPassword = 'Confirme sua senha';
    else if (confirmPassword !== password) newErrors.confirmPassword = 'As senhas não coincidem';
    if (!cpfCnpj) {
      newErrors.cpfCnpj = userType === 'developer' ? 'CPF é obrigatório' : 'CNPJ é obrigatório';
    } else if (userType === 'developer' && !validateCPF(cpfCnpj)) {
      newErrors.cpfCnpj = 'CPF inválido';
    } else if (userType === 'client' && !validateCNPJ(cpfCnpj)) {
      newErrors.cpfCnpj = 'CNPJ inválido';
    }
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

  try {

    await register({ 
      nome: name.trim(), 
      email: email.trim(), 
      senha: password, 
      type: userType, 
      cidade: city?.trim(), 
      estado: state?.trim(), 
      cpfCnpj: cpfCnpj?.replace(/\D/g, '') 
    } as any);

    Toast.show({
      type: 'success',
      text1: 'Sucesso!',
      text2: 'Sua conta foi criada perfeitamente.',
    });

       router.replace('/login');

  } catch (error: any) {
    Toast.show({
      type: 'error',
      text1: 'Ops! Algo deu errado',
      text2: error.message || 'Não foi possível criar a conta. Tente novamente.',
    });
  }
}
  const e = hasSubmitted ? errors : {};

  return (
    <SafeAreaView style={styles.safe}>
       <Head>
              <title> Criar Conta | RedeemSoft</title>
              <meta name="description" content="Crie sua conta no RedeemSoft" />
            </Head>
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

          <View style={styles.cityStateRow}>
            <View style={styles.cityStateField}>
              <Input
                label="Cidade"
                value={city}
                onChangeText={setCity}
                autoCapitalize="words"
                placeholder="Ex: Brasília"
                error={e.city}
              />
            </View>
            <View style={styles.cityStateField}>
              <Text style={styles.inputLabel}>Estado</Text>
              <Pressable
                style={[
                  styles.stateSelector,
                  !!e.state && styles.stateSelectorError,
                ]}
                onPress={() => setStateModalVisible(true)}
              >
                <Text style={state ? styles.stateSelectorValue : styles.stateSelectorPlaceholder}>
                  {state || 'Ex: DF'}
                </Text>
                <Ionicons name="chevron-down" size={18} color={Colors.textSecondary} />
              </Pressable>
              {e.state && <Text style={styles.errorText}>{e.state}</Text>}
            </View>
          </View>

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
              onPress={() => { setUserType('client'); setCpfCnpj(''); setErrors(prev => ({ ...prev, cpfCnpj: undefined })); }}
            >
              <Ionicons
                name="person-outline"
                size={18}
                color={userType === 'client' ? Colors.white : Colors.textSecondary}
              />
              <Text style={[styles.typeText, userType === 'client' && styles.typeTextSelected]}>
                Cliente
              </Text>
            </Pressable>
            <Pressable
              style={[styles.typeButton, userType === 'developer' && styles.typeButtonSelected]}
              onPress={() => { setUserType('developer'); setCpfCnpj(''); setErrors(prev => ({ ...prev, cpfCnpj: undefined })); }}
            >
              <Ionicons
                name="code-slash-outline"
                size={18}
                color={userType === 'developer' ? Colors.white : Colors.textSecondary}
              />
              <Text style={[styles.typeText, userType === 'developer' && styles.typeTextSelected]}>
                Desenvolvedor
              </Text>
            </Pressable>
          </View>

          <Input
            label={userType === 'developer' ? 'CPF' : 'CNPJ'}
            value={cpfCnpj}
            onChangeText={(v) => setCpfCnpj(userType === 'developer' ? maskCPF(v) : maskCNPJ(v))}
            keyboardType="numeric"
            placeholder={userType === 'developer' ? '000.000.000-00' : '00.000.000/0000-00'}
            error={e.cpfCnpj}
            maxLength={userType === 'developer' ? 14 : 18}
          />

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

      {/* Modal de seleção de estado */}
      <Modal
        visible={stateModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setStateModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setStateModalVisible(false)}>
          <View style={styles.modalSheet} onStartShouldSetResponder={() => true}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecione o Estado</Text>
              <Pressable onPress={() => setStateModalVisible(false)}>
                <Ionicons name="close" size={22} color={Colors.text} />
              </Pressable>
            </View>
            <FlatList
              data={ESTADOS_BR}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <Pressable
                  style={[styles.modalItem, state === item && styles.modalItemSelected]}
                  onPress={() => {
                    setState(item);
                    setErrors((prev) => ({ ...prev, state: undefined }));
                    setStateModalVisible(false);
                  }}
                >
                  <Text style={[styles.modalItemText, state === item && styles.modalItemTextSelected]}>
                    {item}
                  </Text>
                  {state === item && (
                    <Ionicons name="checkmark" size={18} color={Colors.primary} />
                  )}
                </Pressable>
              )}
            />
          </View>
        </Pressable>
      </Modal>
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
  cityStateRow: {
    flexDirection: 'row',
    gap: 12,
  },
  cityStateField: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
    marginBottom: 6,
  },
  stateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 52,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    marginBottom: 16,
  },
  stateSelectorError: {
    borderColor: Colors.error ?? '#e53e3e',
  },
  stateSelectorValue: {
    fontSize: 15,
    color: Colors.text,
  },
  stateSelectorPlaceholder: {
    fontSize: 15,
    color: Colors.textSecondary,
  },
  errorText: {
    fontSize: 12,
    color: Colors.error ?? '#e53e3e',
    marginTop: -12,
    marginBottom: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '60%',
    paddingBottom: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  modalItemSelected: {
    backgroundColor: Colors.surface,
  },
  modalItemText: {
    fontSize: 15,
    color: Colors.text,
  },
  modalItemTextSelected: {
    color: Colors.primary,
    fontWeight: '600',
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