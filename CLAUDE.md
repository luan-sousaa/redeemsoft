# RedeemSoft — Contexto para o Claude

## Sobre o projeto
App mobile em **React Native + Expo** (Expo Router, TypeScript).
Repositório: https://github.com/luan-sousaa/redeemsoft

## Estrutura principal
```
app/
  (auth)/       → login.tsx, register.tsx, forgot-password.tsx
  (app)/        → área autenticada
  (tabs)/       → navegação por abas
components/
  Logo.tsx      → componente de logo circular reutilizável (tamanhos: sm | md | lg)
  ui/           → Button, Input e outros componentes base
constants/
  colors.ts     → paleta de cores do app
assets/images/
  logo.png      → logo da RedeemSoft (R com código binário + texto "RedeemSoft")
```

## Identidade visual

### Paleta de cores (`constants/colors.ts`)
| Token | Hex | Uso |
|---|---|---|
| `background` | `#0A0A14` | Fundo principal (azul muito escuro) |
| `surface` | `#12121F` | Fundo de cards/inputs |
| `surfaceHighlight` | `#1C1C30` | Bordas e superfícies elevadas |
| `primary` | `#4F6EF7` | Cor principal (azul elétrico) |
| `primaryDark` | `#3350D4` | Variante escura do primário |
| `text` | `#FFFFFF` | Texto principal |
| `textSecondary` | `#A0A8C8` | Texto secundário |
| `error` | `#E84560` | Erros e alertas |
| `border` | `#1C1C30` | Bordas de elementos |

### Logo
- Arquivo: `assets/images/logo.png`
- Fundo branco, formato paisagem (retangular)
- Sempre renderizar com o componente `<Logo size="sm|md|lg" />` que aplica o recorte circular
- O componente usa `borderRadius` diretamente na `<Image>` para garantir círculo no Android e iOS

## Como rodar o projeto

### iOS Simulator
```bash
npx expo run:ios --device "iPhone 17 Pro"
```
- O simulador alvo é o **iPhone 17 Pro** (UDID: `400F362B-8D37-4D15-9985-94D0DAF426C7`)
- Na primeira vez, gera a pasta `ios/` e instala CocoaPods (demora ~5 min)
- Builds subsequentes são muito mais rápidas (usa cache do DerivedData)

### Metro Bundler separado (se o app já estiver instalado)
```bash
xcrun simctl install 400F362B-8D37-4D15-9985-94D0DAF426C7 <caminho>.app
npx expo start --port 8081
xcrun simctl launch 400F362B-8D37-4D15-9985-94D0DAF426C7 com.anonymous.redeemsoft
```

## Problemas já resolvidos

### 1. Git inicializado na home do usuário
**Problema:** O repositório git estava em `/Users/luan/` (home), staging >10.000 arquivos do sistema (`.aws`, `.anydesk`, `.bash_history`, etc.).
**Solução:** Deletado o `/Users/luan/.git`. O `.git` correto já existia em `/Users/luan/Desktop/redeemsoft/redeemsoft`.

### 2. Logo aparecendo quadrada/retangular
**Problema:** No Android, `overflow: 'hidden'` no `View` pai não recorta imagens filhas corretamente.
**Solução:** Aplicar `borderRadius: diameter / 2` diretamente no componente `<Image>` em `components/Logo.tsx`, além do que já existia no `View`.

### 3. Simulador iOS falhando ao bootar
**Problema:** `expo start --ios` tentava um device com runtime inválido (erro: "Unable to boot device because we cannot determine the runtime bundle").
**Solução:** Usar `npx expo run:ios --device "iPhone 17 Pro"` que seleciona o device correto pelo nome.

### 4. Instalação no simulador falhando após build
**Problema:** `xcrun simctl install` retornava "Failed to locate promise" mesmo com build bem-sucedido.
**Solução:** Instalar manualmente via `xcrun simctl install <udid> <caminho>.app` e iniciar o Metro separadamente.

## Commits
- `1a066e2` — feat: implement RedeemSoft MVP authentication flow
- `b2cacb3` — fix: ajusta logo para formato circular e atualizações de UI

## Observações
- Bundle identifier iOS: `com.anonymous.redeemsoft`
- Google Sign-In ainda não configurado (requer `googleWebClientId` real no `app.json`)
- Watchman pode emitir aviso de `Operation not permitted` — inofensivo, herdado do `.git` que estava na home
