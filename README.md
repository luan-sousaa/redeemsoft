# RedeemSoft

> Conectando empresas a desenvolvedores especializados em manutenção, modernização e recuperação de software.

---

## Descrição

O **RedeemSoft** é uma plataforma marketplace que conecta empresas e usuários a desenvolvedores qualificados em manutenção e modernização de software. Com o avanço das ferramentas de geração de código por IA, muitos sistemas são construídos de forma acelerada, mas apresentam falhas estruturais, problemas de arquitetura, débitos técnicos e dificuldades de manutenção a longo prazo.

O RedeemSoft resolve esse problema criando uma ponte direta entre quem tem um sistema com problemas e quem tem o conhecimento para corrigi-los — sejam sistemas legados, projetos "vibecodados" ou aplicações que simplesmente pararam de funcionar adequadamente.

---

## Introdução

### O problema

O mercado de software enfrenta dois desafios simultâneos:

1. **Sistemas legados** — aplicações desenvolvidas em tecnologias antigas (Delphi, VB.NET, PHP 5.x, Access, COBOL) que ainda rodam em produção mas se tornaram difíceis de manter e incompatíveis com infraestrutura moderna.
2. **Projetos vibecodados** — sistemas criados rapidamente com auxílio de IA, sem padrões de arquitetura, sem testes e sem documentação, que acumulam dívida técnica e quebram com frequência.

### A solução

O RedeemSoft atua como um marketplace especializado, permitindo que empresas publiquem suas demandas técnicas e desenvolvedores experientes se candidatem para resolvê-las. O objetivo é desburocratizar o acesso a profissionais qualificados e dar uma segunda vida a sistemas que, de outra forma, seriam descartados ou continuariam gerando prejuízo.

### Objetivo acadêmico

Este projeto foi desenvolvido como trabalho prático da disciplina **Desenvolvimento Mobile I** do curso de **Análise e Desenvolvimento de Sistemas**, com o propósito de aplicar os conceitos de desenvolvimento mobile com React Native e Expo, fluxos de autenticação, navegação e arquitetura de aplicações cliente.

---

## Funcionalidades

### Para empresas

- Cadastro e autenticação na plataforma
- Publicação de projetos com descrição, orçamento, prazo, stack e modalidade (presencial, semi-presencial ou home office)
- Busca e visualização de perfis de desenvolvedores disponíveis
- Gestão de solicitações e candidaturas recebidas
- Fluxo de pagamento PIX via AbacatePay: geração de QR Code, copia-e-cola e confirmação de pagamento antes da contratação
- Aceite ou recusa de candidatos por projeto
- Tela de notificações
- Foto de perfil individual persistida por usuário no dispositivo
- Menu lateral com acesso rápido às principais funcionalidades

### Para desenvolvedores

- Cadastro e autenticação na plataforma
- Navegação pelo marketplace de projetos disponíveis
- Filtros por modalidade (P / SP / H) e data de publicação
- Visualização detalhada de cada projeto (descrição, tecnologias, orçamento, prazo)
- Candidatura a projetos com proteção contra duplicatas
- Acompanhamento das candidaturas enviadas e seus status (pendente, aceito, recusado)
- Perfil editável com sobre mim, habilidades, certificações e projetos
- Tela de notificações
- Foto de perfil individual persistida por usuário no dispositivo
- Menu sanduíche acessível diretamente na home

### Fluxo de autenticação

- Login com e-mail e senha
- Cadastro diferenciado por tipo de usuário (empresa ou desenvolvedor)
- Recuperação de senha via código de verificação (OTP)

---

## Tecnologias utilizadas

| Camada | Tecnologia |
|---|---|
| Framework mobile | [React Native](https://reactnative.dev/) `0.81.5` |
| Plataforma | [Expo](https://expo.dev/) SDK `54` |
| Navegação | [Expo Router](https://expo.github.io/router/) `6.x` (file-based routing) |
| Linguagem | [TypeScript](https://www.typescriptlang.org/) `5.9` |
| Ícones | [@expo/vector-icons](https://icons.expo.fyi/) (Ionicons) |
| Notificações in-app | [react-native-toast-message](https://github.com/calintamas/react-native-toast-message) |
| Animações | [react-native-reanimated](https://docs.swmansion.com/react-native-reanimated/) |
| Gestos | [react-native-gesture-handler](https://docs.swmansion.com/react-native-gesture-handler/) |
| Áreas seguras | react-native-safe-area-context |
| Imagens | [expo-image](https://docs.expo.dev/versions/latest/sdk/image/), [expo-image-picker](https://docs.expo.dev/versions/latest/sdk/imagepicker/) |
| Clipboard | [expo-clipboard](https://docs.expo.dev/versions/latest/sdk/clipboard/) |
| Gateway de pagamento | [AbacatePay](https://abacatepay.com/) (PIX — ambiente sandbox) |
| Backend | [Express](https://expressjs.com/) + TypeScript (`Backend/`) |
| ORM | [Drizzle ORM](https://orm.drizzle.team/) |
| Banco de dados | SQLite via [libSQL](https://github.com/tursodatabase/libsql) (`Backend/src/db/news.db`) |

---

## Como rodar o projeto

### Pré-requisitos

- [Node.js](https://nodejs.org/) versão 18 ou superior
- [Git](https://git-scm.com/)
- [Expo Go](https://expo.dev/go) instalado no celular **ou** um simulador iOS/Android configurado

> **Atenção:** O projeto possui dois processos independentes que precisam estar rodando ao mesmo tempo: o **backend** (API Express) e o **app** (Expo). Siga os passos abaixo na ordem correta.

---

### 1. Clone o repositório

```bash
git clone https://github.com/luan-sousaa/redeemsoft.git
cd redeemsoft/redeemsoft
```

> No Windows use `cd redeemsoft\redeemsoft`

---

### 2. Instale as dependências

```bash
npm install
```

---

### 3. Suba o backend (API)

Abra um terminal dedicado para o backend e deixe-o rodando:

```bash
cd Backend
npx tsx app.ts
```

Você verá a mensagem:
```
Servidor rodando com sucesso na porta 3000!
```

---

### 4. Configure o endereço da API no app

O app precisa saber onde o backend está. Abra os arquivos abaixo e substitua o valor de `API_URL` pelo IP da sua máquina na rede local:

**`services/authService.ts`** e **`services/projetoService.ts`**:
```ts
const API_URL = 'http://SEU_IP_LOCAL:3000';
```

Para descobrir seu IP local:
- **macOS/Linux:** `ipconfig getifaddr en0`
- **Windows:** `ipconfig` → procure "Endereço IPv4"

> **Dispositivo físico (iPhone/Android):** O celular e o computador precisam estar na **mesma rede Wi-Fi**. Conexões HTTP para IPs locais podem ser bloqueadas pelo iOS — nesse caso use o [Cloudflare Tunnel](#usando-cloudflare-tunnel-dispositivo-físico-ios).

---

### 5. Inicie o Expo

**Simulador (Android/iOS) ou celular na mesma rede:**
```bash
npx expo start
```

**Dispositivo físico com problemas de rede (recomendado para iOS):**
```bash
npx expo start --tunnel
```

- Escaneie o QR code com o **Expo Go**
- No emulador Android: pressione `a`
- No simulador iOS (somente macOS): pressione `i`

---

### Usando Cloudflare Tunnel (dispositivo físico iOS)

O iOS bloqueia conexões HTTP para IPs locais em apps. Para contornar isso sem criar conta, use o Cloudflare Tunnel:

**1. Instale o cloudflared:**
```bash
# macOS
brew install cloudflared

# Windows (via winget)
winget install --id Cloudflare.cloudflared
```

**2. Com o backend rodando na porta 3000, abra outro terminal:**
```bash
cloudflared tunnel --url http://localhost:3000
```

Será gerada uma URL HTTPS como:
```
https://xxxx-xxxx.trycloudflare.com
```

**3. Substitua o `API_URL` nos dois services pela URL gerada:**
```ts
const API_URL = 'https://xxxx-xxxx.trycloudflare.com';
```

**4. Inicie o Expo com tunnel:**
```bash
npx expo start --tunnel
```

> O Cloudflare Tunnel gratuito é temporário — a URL muda a cada vez que você reinicia o `cloudflared`. Lembre de atualizar o `API_URL` sempre que reiniciar.

---

### Credenciais de teste

O banco de dados é local (SQLite), então não há contas pré-cadastradas. Basta criar uma conta pela tela de cadastro do app:

1. Abra o app → toque em **Criar conta**
2. Escolha o tipo: **Cliente** (empresa) ou **Dev** (desenvolvedor)
3. Preencha os dados e confirme

> Para testar o fluxo completo, crie uma conta de empresa e uma de desenvolvedor em dispositivos ou sessões diferentes.

---

### Verificação de tipos

Para checar se o projeto está sem erros de TypeScript:

```bash
npx tsc --noEmit
```

---

## Pipeline / CI-CD

O projeto utiliza **GitHub Actions** como ferramenta de integração contínua. A pipeline é disparada automaticamente a cada `push` ou `pull request` para a branch `main`.

### O que a pipeline faz

```
push / pull_request → main
        │
        ├── Checkout do código
        ├── Instala dependências (npm install)
        ├── Verifica tipos TypeScript (tsc --noEmit)
        ├── Executa o linter (expo lint)
        └── Valida o projeto com Expo Doctor
```

### Benefícios

- **Qualidade garantida:** nenhum código com erro de tipagem ou lint chega à branch principal
- **Feedback rápido:** o desenvolvedor é avisado imediatamente se quebrar algo
- **Automação:** não é necessário rodar verificações manualmente antes de cada merge
- **Confiabilidade:** a branch `main` sempre reflete um estado válido e buildável do projeto

---

## Estrutura do projeto

```
redeemsoft/
└── redeemsoft/                  # Raiz do projeto Expo
    ├── app/
    │   ├── _layout.tsx          # Layout raiz (providers globais)
    │   ├── (auth)/              # Rotas de autenticação
    │   │   ├── login.tsx
    │   │   ├── register.tsx
    │   │   ├── forgot-password.tsx
    │   │   ├── verify-code.tsx
    │   │   └── reset-password.tsx
    │   └── (app)/               # Rotas autenticadas
    │       ├── index.tsx                    # Home (dev ou empresa)
    │       ├── marketplace.tsx              # Marketplace de projetos (dev)
    │       ├── projeto-detalhe.tsx          # Detalhe de um projeto
    │       ├── minhas-candidaturas.tsx      # Candidaturas do dev
    │       ├── buscar-desenvolvedores.tsx   # Busca de devs (empresa)
    │       ├── desenvolvedor-detalhe.tsx    # Perfil do desenvolvedor
    │       ├── meus-projetos.tsx            # Projetos da empresa
    │       ├── criar-projeto.tsx            # Publicar novo projeto
    │       ├── checkout.tsx                 # Tela de checkout (valor + gerar PIX)
    │       ├── pagamento-pix.tsx            # QR Code + simulação de pagamento
    │       ├── notificacoes.tsx             # Tela de notificações
    │       ├── configuracoes.tsx            # Configurações do usuário
    │       └── sobre-mim.tsx               # Editar perfil
    ├── components/
    │   ├── DrawerMenu.tsx       # Menu lateral compartilhado (dev e empresa)
    │   ├── Logo.tsx
    │   └── ...
    ├── constants/
    │   ├── colors.ts            # Paleta de cores do design system
    │   └── theme.ts
    ├── contexts/
    │   └── AuthContext.tsx      # Estado global de autenticação
    ├── hooks/
    │   └── use-avatar.ts        # Hook de foto de perfil (por usuário, AsyncStorage)
    ├── services/
    │   ├── authService.ts       # Serviços de auth, candidaturas e desenvolvedores
    │   ├── projetoService.ts    # Serviços de projetos
    │   └── paymentService.ts    # Integração com AbacatePay (PIX)
    ├── types/
    │   └── index.ts             # Tipos globais compartilhados
    ├── Backend/                 # API Express + TypeScript
    │   ├── app.ts               # Entry point do servidor (porta 3000)
    │   ├── src/
    │   │   ├── controllers/
    │   │   │   ├── usuarioController.ts
    │   │   │   ├── devController.ts
    │   │   │   ├── projetoController.ts
    │   │   │   └── candidaturaController.ts
    │   │   ├── routes/
    │   │   │   ├── usuarioRoutes.ts
    │   │   │   ├── devRoutes.ts
    │   │   │   ├── projetoRoutes.ts
    │   │   │   └── candidaturaRoutes.ts
    │   │   └── db/
    │   │       ├── db.ts        # Conexão Drizzle ORM
    │   │       ├── schema.ts    # Tabelas: usuario, desenvolvedor, cliente, aplicacao, novoProjeto
    │   │       └── news.db      # Banco SQLite local
    │   └── tsconfig.json
    ├── package.json
    ├── tsconfig.json
    └── app.json
```

---

## Como contribuir

1. Faça um **fork** do repositório
2. Crie uma branch para sua feature ou correção:
   ```bash
   git checkout -b feature/nome-da-feature
   ```
3. Faça suas alterações e verifique se não há erros:
   ```bash
   npx tsc --noEmit
   npm run lint
   ```
4. Commit seguindo o padrão [Conventional Commits](https://www.conventionalcommits.org/):
   ```bash
   git commit -m "feat: adiciona tela de chat entre dev e empresa"
   ```
5. Envie para o seu fork:
   ```bash
   git push origin feature/nome-da-feature
   ```
6. Abra um **Pull Request** descrevendo claramente o que foi alterado e o motivo

---

## Autores

| Nome | Papel |
|---|---|
| Anna Karla | Desenvolvimento |
| Débora Amorim | Desenvolvimento |
| Luan Bispo | Desenvolvimento |
| Yasmin Gabrielly | Desenvolvimento |

**Curso:** Análise e Desenvolvimento de Sistemas
**Disciplina:** Desenvolvimento Mobile I

---

## Licença

Este projeto está licenciado sob a licença **MIT**. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

<p align="center">Feito com 💙 por Anna Karla, Débora, Luan e Yasmin</p>
