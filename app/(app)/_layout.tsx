import { AuthProvider } from '@/contexts/AuthContext';
import { Stack } from 'expo-router';
import React from 'react';

export default function AppLayout() {
  return (

    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="marketplace" />
      <Stack.Screen name="meus-projetos" />
      <Stack.Screen name="criar-projeto" />
      <Stack.Screen name="configuracoes" />
      <Stack.Screen name="sobre-mim" />
      <Stack.Screen name="projeto-detalhe" />
      <Stack.Screen name="minhas-candidaturas" />
      <Stack.Screen name="buscar-desenvolvedores" />
      <Stack.Screen name="desenvolvedor-detalhe" />
      <Stack.Screen name="chat-conversa" />
      <Stack.Screen name="checkout" />
      <Stack.Screen name="pagamento-pix" />
    </Stack>
  );
}
