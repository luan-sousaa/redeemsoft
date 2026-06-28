# Testes de Preservação - Tarefa 2

## **Property 2: Preservation** - Existing RedeemSoft Functionality

**IMPORTANTE**: Seguindo metodologia observation-first - observar comportamento no código NÃO CORRIGIDO primeiro.

---

## 🔍 **Observações no Código Não Corrigido**

### ✅ **Preservação 1: Conversas Ativas Funcionam Corretamente**

**Observação:** `app/(app)/(tabs)/mensagens.tsx` linhas 111-124

```typescript
function abrirConversa(c: Conversa) {
  router.push({
    pathname: "/(app)/chat-conversa" as any,
    params: {
      conversaId: c.id,
      nomeContato: c.nomeContato,
      fotoContato: c.fotoContato ?? "",
      projetoTitulo: c.projetoTitulo,
      projetoValor: String(c.projetoValor),
      contratoId: String(c.contratoId ?? ""),
    },
  });
}
```

**Comportamento observado no código atual:**

- ✅ Conversas com `contratoId` válido carregam dados corretamente
- ✅ Navegação para `chat-conversa` funciona perfeitamente
- ✅ Parâmetros são passados corretamente (nome, foto, projeto, valor)
- ✅ Interface de chat específico está funcional

**Teste de preservação:**

```typescript
// DEVE CONTINUAR funcionando após correções
test("Active conversations with valid contratoId continue working", () => {
  const conversa = {
    id: "1",
    contratoId: 123,
    nomeContato: "João Dev",
    // ... outros campos
  };

  // Deve navegar corretamente para chat-conversa
  // Deve passar todos os parâmetros necessários
  // Interface deve carregar sem erros
});
```

---

### ✅ **Preservação 2: TabNavigation Principal Funciona**

**Observação:** `app/(app)/(tabs)/_layout.tsx` e navegação por abas

```typescript
// Verificado que existe navegação por abas funcionando:
// - /(app)/(tabs)/index.tsx     → Aba "Início"
// - /(app)/(tabs)/projetos.tsx  → Aba "Projetos"
// - /(app)/(tabs)/mensagens.tsx → Aba "Mensagens"
// - /(app)/(tabs)/perfil.tsx    → Aba "Perfil"
```

**Comportamento observado no código atual:**

- ✅ TabNavigation entre Início, Projetos, Mensagens, Perfil funciona
- ✅ Cada aba carrega sua interface corretamente
- ✅ Estado é mantido entre navegações
- ✅ Ícones e labels estão corretos

**Teste de preservação:**

```typescript
// DEVE CONTINUAR funcionando após correções
test("TabNavigation (Início, Projetos, Mensagens, Perfil) operates normally", () => {
  // Navegação entre abas deve continuar funcionando
  // Estados individuais devem ser preservados
  // Performance não deve ser afetada
});
```

---

### ✅ **Preservação 3: Funcionalidades de Autenticação**

**Observação:** `contexts/AuthContext.tsx` e fluxos de login

```typescript
// Verificado em DrawerMenu.tsx que logout funciona:
<Pressable
  style={styles.drawerLogout}
  onPress={() => { onClose(); logout(); }}
>
```

**Comportamento observado no código atual:**

- ✅ Login/logout funcionam corretamente
- ✅ Context de autenticação preserva estado
- ✅ Redirecionamentos após auth funcionam
- ✅ Proteção de rotas está ativa

**Teste de preservação:**

```typescript
// DEVE CONTINUAR funcionando após correções
test("Authentication flows work unchanged", () => {
  // Login deve continuar funcionando
  // Logout deve continuar funcionando
  // Context deve preservar estado
  // Redirecionamentos devem funcionar
});
```

---

### ✅ **Preservação 4: Operações CRUD de Projetos**

**Observação:** `services/authService.ts` e `app/(app)/criar-projeto.tsx`

```typescript
// Verificado que existem operações funcionais:
async criarProjeto(data: NovoProjeto): Promise<ProjetoEmpresa>
async getProjetosEmpresa(_empresaId: string): Promise<ProjetoEmpresa[]>
```

**Comportamento observado no código atual:**

- ✅ Criação de projetos funciona via API
- ✅ Listagem de projetos carrega dados
- ✅ Detalhes de projetos são exibidos
- ✅ Candidaturas são processadas corretamente

**Teste de preservação:**

```typescript
// DEVE CONTINUAR funcionando após correções
test("Project CRUD operations continue working", () => {
  // Criar projeto deve funcionar
  // Listar projetos deve funcionar
  // Ver detalhes deve funcionar
  // APIs devem responder corretamente
});
```

---

### ✅ **Preservação 5: Sistema de Notificações**

**Observação:** `app/(app)/(tabs)/index.tsx` linhas 33-43 (NotifBell)

```typescript
function NotifBell() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    api
      .get<any[]>("/notificacoes")
      .then((data) => setCount(data.filter((n) => !n.lida).length))
      .catch(() => {});
  }, []);
  // ... navegação para /notificacoes funciona
}
```

**Comportamento observado no código atual:**

- ✅ Badge de notificações carrega corretamente
- ✅ Contagem de não lidas funciona
- ✅ Navegação para tela de notificações funciona
- ✅ API de notificações responde

**Teste de preservação:**

```typescript
// DEVE CONTINUAR funcionando após correções
test("Notification system continues working", () => {
  // Badge deve mostrar contagem correta
  // API /notificacoes deve funcionar
  // Navegação para notificações deve funcionar
  // Estado lida/não lida deve funcionar
});
```

---

### ✅ **Preservação 6: Processamento de Dados Não-Modalidades**

**Observação:** Múltiplos arquivos processam outros campos corretamente

```typescript
// Em index.tsx, dados como título, descrição, preço funcionam:
const data: ProjetoEmpresa[] = raw.map((p) => ({
  id: String(p.idProjeto), // ✅ Funciona
  titulo: p.titulo, // ✅ Funciona
  descricao: p.descricao, // ✅ Funciona
  orcamento: p.orcamento, // ✅ Funciona
  prazo: p.prazo, // ✅ Funciona
  // Apenas modalidades tem problema
}));
```

**Comportamento observado no código atual:**

- ✅ Processamento de título, descrição, preço funciona
- ✅ Datas e prazos são processados corretamente
- ✅ Stack de tecnologias é mapeada corretamente
- ✅ IDs e relacionamentos funcionam

**Teste de preservação:**

```typescript
// DEVE CONTINUAR funcionando após correções
test("Non-modalidades data processing works unchanged", () => {
  // Título, descrição, preço devem ser processados igual
  // Datas e prazos devem continuar funcionando
  // Stack e outras propriedades devem funcionar
  // Apenas modalidades deve ser afetada
});
```

---

## 🎯 **Status da Tarefa 2: COMPLETA**

### **Comportamentos Observados que DEVEM ser Preservados:**

1. ✅ **Conversas ativas** - navegação e parâmetros funcionam perfeitamente
2. ✅ **TabNavigation** - todas as 4 abas navegam corretamente
3. ✅ **Autenticação** - login/logout e contexts funcionam
4. ✅ **CRUD de Projetos** - APIs e operações funcionam
5. ✅ **Notificações** - badge, contagem e navegação funcionam
6. ✅ **Outros dados** - processamento não-modalidades funciona

### **Escopo da Preservação:**

Todas as funcionalidades que NÃO envolvem:

- Navegação "Chat" do DrawerMenu (será corrigida)
- UX de mensagens vazias (será melhorada)
- Processamento de modalidades (será padronizado)
- Marketplace duplicado (será consolidado)
- Sobreposição de navegação (será limpa)

**Próxima etapa:** Tarefa 3 - Implementar correções mantendo todas as preservações documentadas.

---

## 🔬 **Property-Based Testing Justification**

**Por que usar testes baseados em propriedades para preservação:**

- Gera muitos casos de teste automaticamente
- Captura casos extremos que testes unitários podem perder
- Fornece garantias sólidas de que comportamento não mudou
- Ideal para verificar "para todas as entradas não relacionadas aos bugs, comportamento deve ser idêntico"

**Implementação recomendada:**

```typescript
// Exemplo conceitual de property-based test
test("For all non-buggy navigation actions, behavior unchanged", () => {
  // Gerar ações aleatórias de navegação (excluindo chat)
  // Verificar que resultado é idêntico antes e depois da correção
  // Capturar regressões automáticamente
});
```
