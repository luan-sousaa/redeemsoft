import { Stack } from 'expo-router';

export default function AppLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="(tabs)" />
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
      <Stack.Screen name="editar-habilidades" />
      <Stack.Screen name="editar-certificados" />
      <Stack.Screen name="editar-perfil" />
      <Stack.Screen name="configuracoes-empresa" />
      <Stack.Screen name="perfil-empresa" />
      <Stack.Screen name="checkout" />
      <Stack.Screen name="pagamento-pix" />
      <Stack.Screen name="notificacoes" />
      <Stack.Screen name="confirmar-contratacao" />
    </Stack>
  );
}
