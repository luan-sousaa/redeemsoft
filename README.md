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
- Aceite ou recusa de candidatos por projeto
- Menu lateral com acesso rápido às principais funcionalidades

### Para desenvolvedores

- Cadastro e autenticação na plataforma
- Navegação pelo marketplace de projetos disponíveis
- Filtros por modalidade (P / SP / H) e data de publicação
- Visualização detalhada de cada projeto (descrição, tecnologias, orçamento, prazo)
- Candidatura a projetos com proteção contra duplicatas
- Acompanhamento das candidaturas enviadas e seus status (pendente, aceito, recusado)
- Perfil editável com sobre mim, habilidades, certificações e projetos

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
| Backend / Banco | *(MVP usa dados em memória — integração com API planejada para versões futuras)* |

---

## Como rodar o projeto

### Pré-requisitos

- [Node.js](https://nodejs.org/) versão 18 ou superior
- [Git](https://git-scm.com/)
- [Expo Go](https://expo.dev/go) instalado no celular **ou** um simulador iOS/Android configurado

---

### Windows

**1. Clone o repositório**

```bash
git clone https://github.com/luan-sousaa/redeemsoft.git
cd redeemsoft\redeemsoft
```

**2. Instale as dependências**

```bash
npm install
```

**3. Inicie o servidor de desenvolvimento**

```bash
npx expo start
```

**4. Abra o app**

- No celular: escaneie o QR code com o **Expo Go**
- No emulador Android: pressione `a` no terminal
- No simulador iOS (requer macOS): pressione `i` no terminal

> **Dica:** Se aparecer o erro `Unable to find expo in this project`, certifique-se de que está dentro da pasta `redeemsoft\redeemsoft` antes de rodar os comandos.

---

### Linux / macOS

**1. Clone o repositório**

```bash
git clone https://github.com/luan-sousaa/redeemsoft.git
cd redeemsoft/redeemsoft
```

**2. Instale as dependências**

```bash
npm install
```

**3. Inicie o servidor de desenvolvimento**

```bash
npx expo start
```

**4. Abra o app**

- No celular: escaneie o QR code com o **Expo Go**
- No emulador Android: pressione `a` no terminal
- No simulador iOS (somente macOS): pressione `i` no terminal

**Para rodar diretamente em um dispositivo físico iOS via cabo (somente macOS):**

```bash
npx expo run:ios --device
```

---

### Credenciais de teste (MVP)

| Tipo | E-mail | Senha |
|---|---|---|
| Empresa | `test@redeemsoft.com` | `password123` |
| Desenvolvedor | `dev@redeemsoft.com` | `password123` |

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
    ├── services/
    │   └── authService.ts       # Camada de serviços (mock MVP)
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
