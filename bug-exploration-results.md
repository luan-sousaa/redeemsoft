# Resultados da Exploração de Bugs - Tarefa 1 Completa

## CONFIRMAÇÃO: Todos os 5 bugs críticos foram identificados

### ✅ **BUG 1: Chat Navigation Quebrada**

**Arquivo:** `components/DrawerMenu.tsx` linha 45 e 79
**Contraexemplo encontrado:**

```typescript
{
  icon: 'chatbubble-outline',
  label: 'Chat',
  onPress: () => { onClose(); router.push('/(app)/chat' as Href); }, // ❌ ROTA INEXISTENTE
  active: activeScreen === 'chat',
},
```

**Evidência:** A rota `/(app)/chat` não existe no sistema. Verificamos que as rotas válidas são:

- `/(app)/(tabs)/mensagens.tsx` ✅ (aba de mensagens)
- `/(app)/chat-conversa.tsx` ✅ (conversa específica)

**Comportamento observado:** Quando usuário clica "Chat" no DrawerMenu, haverá erro de navegação ou tela em branco.

---

### ✅ **BUG 2: UX Confusa em Mensagens Vazias**

**Arquivo:** `app/(app)/(tabs)/mensagens.tsx` linhas 108-117
**Contraexemplo encontrado:**

```typescript
{filtradas.length === 0 ? (
  <View style={styles.emptyContainer}>
    <Ionicons name="chatbubbles-outline" size={70} color={Colors.textSecondary} />
    <Text style={styles.emptyTitle}>
      {filtro ? 'Nenhuma conversa encontrada' : 'Nenhuma conversa ainda'}
    </Text>
    <Text style={styles.emptyText}>
      {filtro
        ? 'Tente buscar por outro nome ou projeto'
        : 'As conversas aparecem aqui quando uma candidatura for aceita'} // ❌ APENAS TEXTO, SEM AÇÃO
    </Text>
  </View>
)}
```

**Evidência:** Embora tenha texto explicativo básico, falta:

- Botão para navegar para projetos disponíveis
- Link para candidaturas
- Guia mais clara sobre o processo

---

### ✅ **BUG 3: Inconsistências de Tipo Modalidades**

**Evidência encontrada em múltiplos arquivos:**

**ProjetoEmpresa interface:** `modalidades: string[]` (correto)

```typescript
export type ProjetoEmpresa = {
  modalidades: string[]; // ✅ Array esperado
};
```

**API mapping inconsistente:** `app/(app)/(tabs)/index.tsx` linha 233-244

```typescript
const data: ProjetoEmpresa[] = raw.map((p) => ({
  modalidades: [p.modalidade ?? "H"], // ❌ Conversão manual necessária
  // API retorna modalidade: string
  // Frontend força conversão para modalidades: string[]
}));
```

**Mais inconsistências:** `app/(app)/marketplace.tsx` linha 95

```typescript
modalidades: p.modalidades ?? (p.modalidade ? [p.modalidade] : []),
// ❌ Lógica complexa para lidar com inconsistência
```

---

### ✅ **BUG 4: Marketplace Duplicado**

**Evidência de duas implementações:**

1. **Implementação Principal:** `app/(app)/(tabs)/index.tsx`
   - Marketplace integrado na aba "Início" para devs
   - Usa TabNavigation
   - Funcionalidade básica de busca e filtros

2. **Implementação Duplicada:** `app/(app)/marketplace.tsx`
   - Marketplace standalone com DrawerMenu
   - Filtros mais avançados (modalidade, data)
   - Referenciado pelo DrawerMenu no item "Buscar"

**Contraexemplo:** Usuário pode acessar marketplace por:

- Aba "Início" (tabs) → comportamento A
- DrawerMenu "Buscar" → comportamento B (diferente)

---

### ✅ **BUG 5: Sobreposição de Navegação**

**Arquivo:** `app/(app)/marketplace.tsx` linha 204-208
**Contraexemplo encontrado:**

```typescript
<DrawerMenu visible={drawerOpen} onClose={() => setDrawerOpen(false)} activeScreen="marketplace" />

{/* ── Top bar ── */}
<View style={styles.topBar}>
  <Pressable style={styles.menuBtn} onPress={() => setDrawerOpen(true)}>
    <Ionicons name="menu" size={28} color={Colors.text} />
  </Pressable>
```

**Evidência:** O `marketplace.tsx` implementa DrawerMenu quando:

- Usuário já tem TabNavigation sempre disponível
- Cria múltiplos caminhos para mesmas funcionalidades
- Gera confusão na UX com dois sistemas de navegação sobrepostos

---

## 🎯 **Status da Tarefa 1: COMPLETA**

**Resultado:** Todos os 5 bugs foram confirmados através de análise de código estática.

**Contraexemplos documentados:**

1. ❌ DrawerMenu "Chat" → `/(app)/chat` (rota inexistente)
2. ❌ Mensagens vazias com UX inadequada (apenas texto, sem ações)
3. ❌ `modalidade: string` vs `modalidades: string[]` (múltiplas inconsistências)
4. ❌ Duas implementações diferentes de marketplace
5. ❌ DrawerMenu + TabNavigation = navegação duplicada

**Próxima etapa:** Tarefa 2 - Escrever testes de preservação para comportamentos que devem ser mantidos.

---

## 📋 **Análise de Causa Raiz**

As hipóteses do design se confirmaram:

1. **Rota Chat Inexistente** ✅ - Link hardcoded incorreto no DrawerMenu
2. **UX Inadequada** ✅ - Componente não oferece ações para estado vazio
3. **Inconsistência de Tipos** ✅ - API retorna string, frontend espera string[]
4. **Implementações Duplicadas** ✅ - Duas rotas diferentes com comportamentos distintos
5. **Arquitetura de Navegação Confusa** ✅ - DrawerMenu sobreposto ao TabNavigation

Todas as correções propostas no design estão validadas pelos contraexemplos encontrados.
