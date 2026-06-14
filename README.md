# RedeemSoft

[![CI](https://github.com/luan-sousaa/redeemsoft/actions/workflows/ci.yml/badge.svg)](https://github.com/luan-sousaa/redeemsoft/actions)

> Conectando empresas a desenvolvedores especializados em manutenção, modernização e recuperação de software.

---

## Sobre o projeto

O **RedeemSoft** é uma plataforma marketplace que conecta empresas e usuários a desenvolvedores qualificados em manutenção e modernização de software. Com o avanço das ferramentas de geração de código por IA, muitos sistemas são construídos de forma acelerada, mas apresentam falhas estruturais, problemas de arquitetura, débitos técnicos e dificuldades de manutenção a longo prazo.

O RedeemSoft resolve esse problema criando uma ponte direta entre quem tem um sistema com problemas e quem tem o conhecimento para corrigi-los — sejam sistemas legados, projetos "vibecodados" ou aplicações que simplesmente pararam de funcionar adequadamente.

### O problema

O mercado de software enfrenta dois desafios simultâneos:

1. **Sistemas legados** — aplicações desenvolvidas em tecnologias antigas (Delphi, VB.NET, PHP 5.x, Access, COBOL) que ainda rodam em produção mas se tornaram difíceis de manter e incompatíveis com infraestrutura moderna.
2. **Projetos vibecodados** — sistemas criados rapidamente com auxílio de IA, sem padrões de arquitetura, sem testes e sem documentação, que acumulam dívida técnica e quebram com frequência.

### Objetivo acadêmico

Este projeto foi desenvolvido como trabalho prático da disciplina **Desenvolvimento Mobile I** do curso de **Análise e Desenvolvimento de Sistemas**, com o propósito de aplicar os conceitos de desenvolvimento mobile com React Native e Expo, fluxos de autenticação, navegação e arquitetura de aplicações cliente-servidor.

---

## Funcionalidades

### Para empresas

- Cadastro e autenticação na plataforma
- Publicação de projetos com descrição, orçamento, prazo, stack e modalidade
- Busca e visualização de perfis de desenvolvedores disponíveis
- Gestão de candidaturas recebidas (aceitar / recusar)
- Fluxo de pagamento PIX via AbacatePay (QR Code + copia-e-cola, ambiente sandbox)
- Chat com o desenvolvedor após contratação
- Perfil de empresa editável (segmento, tamanho, site, localização)
- Menu lateral com acesso rápido às funcionalidades

### Para desenvolvedores

- Cadastro e autenticação na plataforma
- Navegação pelo marketplace de projetos disponíveis
- Filtros por modalidade e data de publicação
- Candidatura a projetos com proposta de preço
- Acompanhamento das candidaturas e seus status (pendente / aceito / recusado)
- Perfil editável: sobre mim, habilidades, certificações e foto
- Chat com a empresa após contratação

### Autenticação

- Login com e-mail e senha
- Cadastro diferenciado por tipo de usuário (empresa ou desenvolvedor)
- Recuperação de senha via código de verificação (OTP de 4 dígitos, expira em 15 min)

---

## Tecnologias

| Camada | Tecnologia |
|---|---|
| Framework mobile | React Native `0.81.5` |
| Plataforma | Expo SDK `54` |
| Navegação | Expo Router `6.x` (file-based routing) |
| Linguagem | TypeScript `5.9` |
| Ícones | `@expo/vector-icons` (Ionicons) |
| Imagens | `expo-image`, `expo-image-picker` |
| Notificações in-app | `react-native-toast-message` |
| Animações | `react-native-reanimated` |
| Gateway de pagamento | AbacatePay (PIX — ambiente sandbox) |
| Backend | Express `5.x` + TypeScript |
| ORM | Drizzle ORM |
| Banco de dados | SQLite via libSQL (Turso em produção, arquivo local em dev) |
| Deploy backend | Railway |

---

## Como rodar o projeto

O projeto tem **duas formas** de execução. A Opção A é a mais simples pois usa o backend que já está em produção no Railway — nenhuma configuração de servidor necessária.

### Pré-requisitos (ambas as opções)

- [Node.js](https://nodejs.org/) versão **18 ou superior**
- [Git](https://git-scm.com/)
- [Expo Go](https://expo.dev/go) instalado no celular (Android ou iOS)

---

### ✅ Opção A — Backend em produção (recomendado)

O backend já está deployado e funcionando em `https://redeemsoft-production.up.railway.app`. Você só precisa rodar o app mobile.

**1. Clone o repositório e entre na pasta do app:**

```bash
git clone https://github.com/luan-sousaa/redeemsoft.git
cd redeemsoft/redeemsoft
```

**2. Instale as dependências:**

```bash
npm install
```

**3. Inicie o Expo com tunnel:**

```bash
npx expo start --tunnel
```

> O flag `--tunnel` é necessário para que o Expo Go no celular consiga se comunicar com o Metro Bundler independente da rede. Na primeira execução pode demorar ~30 segundos para o túnel ficar pronto.

**4. Abra o app:**

- Abra o **Expo Go** no celular
- Escaneie o QR code exibido no terminal
- O app vai carregar e conectar automaticamente ao backend em produção

**5. Crie contas de teste:**

Não há contas pré-cadastradas. Crie pelo próprio app:

- Toque em **Criar conta** → escolha **Empresa** → preencha e confirme
- Repita o processo escolhendo **Desenvolvedor**

> Para testar o fluxo completo (empresa publica projeto → dev se candidata → contratação), use dois celulares ou alterne entre contas no mesmo aparelho.

---

### ⚙️ Opção B — Tudo local (backend + app)

Use esta opção se quiser rodar o backend na sua própria máquina, sem depender do servidor em produção.

#### B.1 — Suba o backend

Abra um **terminal dedicado** para o backend e deixe-o rodando em segundo plano durante todo o desenvolvimento.

**1. Entre na pasta do backend:**

```bash
cd redeemsoft/redeemsoft/Backend
```

**2. Crie o arquivo de variáveis de ambiente a partir do exemplo:**

```bash
# macOS / Linux
cp .env.example .env

# Windows
copy .env.example .env
```

**3. Abra o `.env` e configure as variáveis:**

```env
# Banco SQLite local — não precisa de conta Turso
TURSO_URL=file:src/db/news.db
TURSO_TOKEN=

# Chave JWT — qualquer string serve em desenvolvimento
JWT_SECRET=minha-chave-local-dev

# Porta do servidor
PORT=3000
```

> O arquivo `src/db/news.db` é criado automaticamente na primeira execução. As migrações são aplicadas automaticamente ao subir o servidor.

**4. Instale as dependências do backend:**

```bash
npm install
```

**5. Inicie o servidor:**

```bash
npx tsx app.ts
```

Você verá a mensagem:
```
Servidor rodando na porta 3000
```

Deixe esse terminal aberto.

---

#### B.2 — Aponte o app para o backend local

**1. Descubra o IP da sua máquina na rede local:**

```bash
# macOS / Linux
ipconfig getifaddr en0

# Windows (Prompt de Comando)
ipconfig
# Procure "Endereço IPv4" na sua interface de rede ativa
```

**2. Abra `services/api.ts` e altere a linha 3:**

```ts
// Antes (produção)
export const API_BASE_URL = 'https://redeemsoft-production.up.railway.app';

// Depois (local — substitua pelo IP encontrado no passo anterior)
export const API_BASE_URL = 'http://192.168.x.x:3000';
```

> Celular e computador precisam estar na **mesma rede Wi-Fi**.

---

#### B.3 — Inicie o app

**1. Em outro terminal, entre na pasta do app e instale as dependências:**

```bash
cd redeemsoft/redeemsoft
npm install
```

**2. Inicie o Expo:**

```bash
npx expo start --tunnel
```

**3. Escaneie o QR code com o Expo Go.**

**4. Crie contas de teste** pelo app (igual à Opção A).

---

### Verificação de tipos

Para checar se o projeto está sem erros TypeScript:

```bash
# Na pasta redeemsoft/redeemsoft
npx tsc --noEmit
```

---

## Estrutura do projeto

```
redeemsoft/
└── redeemsoft/                        # Raiz do projeto Expo
    ├── app/
    │   ├── _layout.tsx                # Layout raiz (AuthContext, ProfileContext, Toast)
    │   ├── (auth)/                    # Telas sem autenticação
    │   │   ├── login.tsx
    │   │   ├── register.tsx
    │   │   ├── forgot-password.tsx
    │   │   ├── verify-code.tsx
    │   │   └── reset-password.tsx
    │   └── (app)/                     # Telas autenticadas
    │       ├── index.tsx              # Home (redireciona por tipo de usuário)
    │       ├── marketplace.tsx        # Lista de projetos (dev)
    │       ├── projeto-detalhe.tsx    # Detalhe de um projeto
    │       ├── minhas-candidaturas.tsx
    │       ├── buscar-desenvolvedores.tsx   # Busca de devs (empresa)
    │       ├── desenvolvedor-detalhe.tsx    # Perfil de um dev
    │       ├── meus-projetos.tsx      # Projetos da empresa + candidatos
    │       ├── criar-projeto.tsx
    │       ├── checkout.tsx           # Valor + geração de PIX
    │       ├── pagamento-pix.tsx      # QR Code + confirmação
    │       ├── configuracoes.tsx      # Configurações do dev (foto, senha, logout)
    │       ├── configuracoes-empresa.tsx
    │       ├── perfil-empresa.tsx
    │       ├── editar-perfil.tsx
    │       ├── editar-habilidades.tsx
    │       ├── editar-certificados.tsx
    │       ├── sobre-mim.tsx          # Prévia pública do perfil dev
    │       ├── notificacoes.tsx
    │       ├── chat.tsx
    │       └── chat-conversa.tsx
    ├── components/
    │   ├── DrawerMenu.tsx             # Menu lateral (dev e empresa)
    │   ├── Logo.tsx                   # Logo circular (sm | md | lg)
    │   └── ui/
    │       ├── Button.tsx
    │       └── Input.tsx
    ├── constants/
    │   └── colors.ts                  # Paleta de cores do design system
    ├── contexts/
    │   ├── AuthContext.tsx            # Estado global de autenticação + JWT
    │   └── ProfileContext.tsx         # Cache do perfil do desenvolvedor
    ├── hooks/
    │   └── use-avatar.ts              # Seleção e cache local de foto de perfil
    ├── services/
    │   ├── api.ts                     # ← URL da API aqui (API_BASE_URL, linha 3)
    │   ├── authService.ts             # Login, registro, recuperação de senha
    │   ├── profileService.ts          # Perfil do dev (GET / PUT com cache)
    │   ├── paymentService.ts          # AbacatePay PIX
    │   └── projetoService.ts          # CRUD de projetos
    ├── utils/
    │   ├── parseList.ts               # Parse de arrays JSON do banco
    │   └── pricing.ts                 # Cálculo e formatação de valores (BRL)
    ├── types/
    │   └── index.ts                   # Tipos globais compartilhados
    ├── Backend/                       # API Express + TypeScript
    │   ├── app.ts                     # Entry point (porta 3000)
    │   ├── .env.example               # Modelo de variáveis de ambiente
    │   ├── railway.json               # Configuração de deploy no Railway
    │   ├── drizzle/                   # Migrações SQL (aplicadas automaticamente)
    │   └── src/
    │       ├── controllers/           # Lógica de negócio por entidade
    │       ├── routes/                # Rotas Express
    │       ├── middleware/auth.ts     # Verificação JWT
    │       └── db/
    │           ├── db.ts              # Conexão Drizzle + libSQL
    │           ├── schema.ts          # Definição das tabelas
    │           └── news.db            # SQLite local (gerado automaticamente)
    ├── app.json
    ├── package.json
    └── tsconfig.json
```

---

## Pipeline CI/CD

O projeto usa **GitHub Actions** com pipeline disparada a cada `push` ou `pull request` para a branch `main`.

```
push / pull_request → main
        │
        ├── Checkout do código
        ├── Instala dependências (npm install)
        ├── Verifica tipos TypeScript (tsc --noEmit)
        ├── Executa o linter (expo lint)
        └── Valida o projeto com Expo Doctor
```

A branch `main` sempre reflete um estado válido e buildável do projeto.

---

## Autores

| Nome | Matrícula | Atribuição |
|---|---|---|
| Anna Karla | UC24102955 | Front-end |
| Débora Amorim | UC24201539 | Prototipação |
| Luan Bispo | UC24201444 | DevOps |
| Yasmin Gabrielly | UC24201508 | Backend & DBA |

**Curso:** Análise e Desenvolvimento de Sistemas  
**Disciplina:** Desenvolvimento Mobile I

---

## Licença

Este projeto está licenciado sob a licença **MIT**. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

<p align="center">Feito com 💙 por Anna Karla, Débora, Luan e Yasmin</p>
