# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Estrutura do repositório

Este repositório tem dois projetos aninhados:

- **`redeemsoft/`** — app Expo (React Native + TypeScript). **Edite SEMPRE aqui.**
- **`redeemsoft/Backend/`** — API Express + TypeScript + Drizzle ORM + Turso (libSQL)

Nunca edite arquivos no diretório externo `/Users/luan/Desktop/redeemsoft/` diretamente — o projeto real é o interno.

## Comandos

### Frontend (Expo)

```bash
# Rodar no iOS Simulator (iPhone 17 Pro)
cd redeemsoft && npx expo run:ios --device "iPhone 17 Pro"

# Metro bundler separado (se o app já estiver instalado no simulador)
cd redeemsoft && npx expo start --port 8081

# Lint
cd redeemsoft && npm run lint
```

### Backend

```bash
# Dev local (hot reload)
cd redeemsoft/Backend && npm run dev   # tsx watch app.ts

# Produção local
cd redeemsoft/Backend && npm run start # tsx app.ts

# Deploy Railway
cd redeemsoft/Backend && railway up --service redeemsoft-backend
```

> Railway **não** faz auto-deploy via GitHub push. O deploy exige `railway up` manual.

### Migrations do banco

As migrations ficam em `Backend/drizzle/` e rodam automaticamente no boot via `migrate()`. Ao criar uma migration manualmente (sem `drizzle-kit generate`), é obrigatório atualizar também o `Backend/drizzle/meta/_journal.json` — caso contrário o migrator ignora o arquivo.

## Arquitetura

### Frontend

**Expo Router file-based** — rotas mapeadas pela estrutura de pastas em `app/`:

```
app/
  _layout.tsx        → Root layout: AuthProvider > ProfileProvider > RootLayoutNav
  (auth)/            → Não autenticado: login, register, forgot-password, verify-code, reset-password
  (app)/
    _layout.tsx      → Stack com todas as telas autenticadas
    (tabs)/          → Tab bar: Início | Projetos/Candidaturas | Mensagens | Perfil
    marketplace.tsx, desenvolvedor-detalhe.tsx, checkout.tsx, pagamento-pix.tsx, ...
```

**Dois tipos de usuário** (`user.type: 'client' | 'developer'`):
- `client` (empresa) — publica projetos, contrata devs, paga via PIX
- `developer` — se candidata a projetos, tem perfil com habilidades/certificações/portfólio

A tab "Projetos" muda de label e comportamento conforme o `type`. Validação no register: `client` exige CNPJ; `developer` exige CPF.

**Contextos globais:**
- `AuthContext` — estado de autenticação, JWT em memória via `tokenStorage` em `services/api.ts`. Token persiste via AsyncStorage; restaurado no boot via `initAuth()` no `AuthProvider` (valida com `GET /me` antes de restaurar a sessão).
- `ProfileContext` — perfil do desenvolvedor. Combina dados da API com AsyncStorage local (fotos, habilidades, certificados persistem localmente).

**Services layer** (`services/`):
- `api.ts` — wrapper `fetch` com timeout de 15s, auth header, error handling. Base URL: `https://redeemsoft-production.up.railway.app`
- `authService.ts`, `profileService.ts`, `paymentService.ts`, `projetoService.ts`

### Backend

**Express 5 + Drizzle ORM + Turso (libSQL)**. Rotas montadas em `app.ts` sem prefixo (`app.use('/', routes)`).

Tabelas principais (schema em `Backend/src/db/schema.ts`):
- `usuario` — todos os usuários (type: 'client' | 'developer', resetToken)
- `desenvolvedor` — perfil dev (habilidades, certificacoes, projetos são JSON strings)
- `cliente` — perfil empresa (descricao, segmento, tamanho, site, etc.)
- `novoProjeto` — projetos criados por clientes (status: ativo | em_andamento | concluido)
- `aplicacao` — candidaturas (status: pendente | aceito | recusado)
- `contrato` — escrow PIX entre empresa e dev (statusPagamento: pendente | retido | liberado | cancelado)
- `mensagem` — chat vinculado a contrato (ativo após pagamento retido)
- `notificacao` — notificações por usuário

**Autenticação:** JWT gerado em `Backend/src/middleware/auth.ts`. Payload: `{ idUsuario, type, idDev, idCliente }`. Variáveis de ambiente Railway: `TURSO_URL`, `TURSO_TOKEN`, `JWT_SECRET`.

**Pagamentos:** AbacatePay (PIX transparente). Webhook em `Backend/src/webhooks/abacatepay.ts`.

## Identidade visual

```ts
// constants/colors.ts
background:       '#0A0A14'  // fundo principal
surface:          '#12121F'  // cards/inputs
surfaceHighlight: '#1C1C30'  // bordas e superfícies elevadas
primary:          '#4F6EF7'  // azul elétrico
primaryDark:      '#3350D4'
text:             '#FFFFFF'
textSecondary:    '#A0A8C8'
error:            '#E84560'
border:           '#1C1C30'
```

Logo: usar sempre `<Logo size="sm|md|lg" />` de `components/Logo.tsx`. O componente aplica `borderRadius` diretamente na `<Image>` (não só no `View` pai) para garantir círculo no Android.

## Padrões críticos e armadilhas

**`useRef` com `useLocalSearchParams` do Expo Router**
Telas que recebem params via `useLocalSearchParams()` devem capturar o ID no mount com `useRef` e usar `deps: []` no `useEffect`. O objeto de params é recriado a cada render dentro de Modals/pageSheets, causando loop infinito.
```ts
const { id: rawId } = useLocalSearchParams();
const devIdRef = useRef(Array.isArray(rawId) ? rawId[0] : rawId);
useEffect(() => { fetch(devIdRef.current); }, []);
```

**Navegação dentro de Modal**
Nunca chamar `router.push()` de dentro de um `Modal` com `presentationStyle="pageSheet"` — a nova tela abre mas o Modal fica sobreposto. Fechar o Modal primeiro e navegar após 350ms:
```ts
setModalVisible(false);
setTimeout(() => router.push({ pathname: '...', params: {...} }), 350);
```

**TouchableOpacity > Pressable dentro de ScrollView + Modal no iOS**
`Pressable` dentro de `ScrollView` dentro de `Modal` no iOS às vezes não dispara `onPress`. Usar `TouchableOpacity` nesses contextos.

**Guard contra duplo push**
Usar `useRef(false)` como flag para evitar push duplo quando o usuário toca rapidamente no botão.

**`??` com `||` no JSX**
Babel/Metro exige parênteses: `{a ?? (b || 'fallback')}` — sem os parênteses, erro de parse.

**Simulador iOS**
- Target: iPhone 17 Pro (UDID: `400F362B-8D37-4D15-9985-94D0DAF426C7`)
- Nunca usar `expo start --ios` — falha com erro de runtime inválido. Sempre `npx expo run:ios --device "iPhone 17 Pro"`.
- Bundle identifier: `com.anonymous.redeemsoft`
- Google Sign-In ainda não configurado.
