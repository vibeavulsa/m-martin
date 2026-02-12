# 🔒 Firestore Security Rules - M'Martin E-commerce

## 📋 Visão Geral

Este documento descreve as regras de segurança do Firestore implementadas para o e-commerce M'Martin, com foco em proteção contra vazamento de dados e manipulação de preços.

## 🎯 Objetivos de Segurança

1. **Proteção de Dados**: Impedir acesso não autorizado a pedidos e informações sensíveis
2. **Integridade de Preços**: Bloquear manipulação de preços, nomes e descrições de produtos
3. **Controle de Estoque**: Permitir apenas atualizações legítimas de inventário (somente decrementos)
4. **Validação de Pedidos**: Garantir que pedidos tenham dados válidos (campos obrigatórios, items não vazio, total positivo)

## ⚠️ Limitações e Considerações Importantes

### 🔴 CRÍTICO - Implementação Simplificada de Admin
A função `isAdmin()` atual considera QUALQUER usuário autenticado como administrador. Isto é adequado APENAS para desenvolvimento. **ANTES DE PRODUÇÃO**, você DEVE implementar verificação real de roles (custom claims ou lista de UIDs).

### 🔴 Validação de Preços no Cliente
As regras atuais validam campos obrigatórios mas **NÃO verificam se o total do pedido corresponde à soma dos preços dos itens**. Isto é uma limitação das Firestore Rules. Para produção, recomenda-se:
- Usar Cloud Functions para validar preços no servidor
- Recalcular totais no backend antes de processar pagamentos
- **NUNCA confie nos valores de `total` enviados pelo cliente sem validação**

### 🔴 Clientes Não Veem Próprios Pedidos
Por padrão, clientes não conseguem ler seus pedidos após criação (nem mesmo os próprios). Isso protege contra vazamento de dados mas impacta a UX. Para permitir que clientes vejam seu histórico, veja a seção "Melhorias Futuras" abaixo.

### 🔴 Atualização de Estoque Não Autenticada
A regra permite que usuários não autenticados decrementem estoque durante checkout. Para produção, considere usar Cloud Functions para gerenciar estoque de forma mais segura.

## 📚 Estrutura das Regras

### Funções Auxiliares

#### `isAdmin()`
```javascript
function isAdmin() {
  return request.auth != null;
}
```
**Propósito**: Verifica se o usuário está autenticado via Firebase Auth.
- Para produção, você pode adicionar verificação de UID específico
- Ou usar Custom Claims para roles mais complexos

#### `hasRequiredOrderFields(data)`
```javascript
function hasRequiredOrderFields(data) {
  return data.keys().hasAll(['total', 'items', 'customer']);
}
```
**Propósito**: Valida que o pedido contém todos os campos obrigatórios.

#### `isValidTotal(data)`
```javascript
function isValidTotal(data) {
  return data.total is number 
    && data.total > 0
    && data.items is list
    && data.items.size() > 0;
}
```
**Propósito**: 
- Garante que o total do pedido é um número positivo
- Verifica que items é uma lista/array
- Verifica que items contém pelo menos 1 item (não está vazio)

---

## 🛍️ Coleção: `products`

### Permissões

| Operação | Quem Pode | Condições |
|----------|-----------|-----------|
| **Read** | Todos | Público - qualquer visitante pode ver o catálogo |
| **Create** | Admin | Autenticação obrigatória |
| **Update (Admin)** | Admin | Sem restrições - acesso total |
| **Update (Cliente)** | Cliente não-autenticado | APENAS campo `quantity` + valor >= 0 |
| **Delete** | Admin | Autenticação obrigatória |

### 🔐 Proteção Crítica: Update de Cliente

A regra mais importante usa `affectedKeys()` para proteger contra manipulação de preços:

```javascript
allow update: if !isAdmin() 
  && request.resource.data.diff(resource.data).affectedKeys().hasOnly(['quantity'])
  && request.resource.data.quantity >= 0
  && request.resource.data.quantity < resource.data.quantity; // Apenas decrementos
```

**Como funciona:**
1. `!isAdmin()` - Aplica-se apenas a usuários não autenticados
2. `diff(resource.data).affectedKeys()` - Identifica quais campos foram modificados
3. `.hasOnly(['quantity'])` - BLOQUEIA se qualquer outro campo além de `quantity` for alterado
4. `quantity >= 0` - Previne valores negativos de estoque
5. `quantity < resource.data.quantity` - PERMITE APENAS DECREMENTOS (não pode aumentar estoque)

**Campos protegidos:**
- ❌ `price` - Preço não pode ser alterado
- ❌ `name` - Nome não pode ser alterado
- ❌ `description` - Descrição não pode ser alterada
- ❌ `category`, `image`, `features`, etc.
- ✅ `quantity` - Único campo permitido (somente decrementos)

**⚠️ Nota de Segurança:** Esta implementação permite que usuários não autenticados decrementem estoque. Para maior segurança em produção, considere usar Cloud Functions para gerenciar estoque.

---

## 📦 Coleção: `orders`

### Permissões

| Operação | Quem Pode | Condições |
|----------|-----------|-----------|
| **Create** | Todos | Validação de campos obrigatórios + total positivo |
| **Read** | Admin | Apenas administradores podem ver pedidos |
| **Update** | Admin | Apenas administradores podem atualizar status |
| **Delete** | Admin | Apenas administradores podem excluir |

### 🔐 Validações na Criação

Quando um cliente cria um pedido:

```javascript
allow create: if hasRequiredOrderFields(request.resource.data)
  && isValidTotal(request.resource.data);
```

**Campos obrigatórios:**
- `total` - Valor total do pedido (number > 0)
- `items` - Array de itens do pedido (não pode ser vazio)
- `customer` - Dados do cliente

**Proteções:**
- Cliente NÃO pode ler pedidos após criação (nem mesmo os próprios)
- Cliente NÃO pode editar seu próprio pedido
- Apenas Admin visualiza e gerencia todos os pedidos
- Items deve conter pelo menos 1 item

**⚠️ IMPORTANTE - Limitação de Validação de Preços:**
As Firestore Rules não verificam se o `total` corresponde à soma dos preços dos items. Esta validação deve ser feita:
- No backend usando Cloud Functions antes de processar pagamentos
- NUNCA confie no valor de `total` enviado pelo cliente sem recalcular no servidor

---

## 🧪 Como Testar com Firebase Emulator

### 1. Instalar Firebase Tools

```bash
npm install -g firebase-tools
```

### 2. Inicializar Emuladores

```bash
# Se ainda não inicializou
firebase init emulators

# Selecione:
# - Firestore Emulator (porta 8080)
# - Firestore UI (porta 4000 - opcional)
```

### 3. Iniciar Emuladores

```bash
firebase emulators:start
```

Acesse:
- Emulator UI: http://localhost:4000
- Firestore Emulator: http://localhost:8080

### 4. Conectar sua App ao Emulator

No arquivo `src/config/firebase.js`, adicione antes de exportar `db`:

```javascript
import { connectFirestoreEmulator } from 'firebase/firestore';

// ... após getFirestore(app)

if (location.hostname === 'localhost') {
  connectFirestoreEmulator(db, 'localhost', 8080);
}
```

---

## 🔬 Testes Práticos

### Teste 1: Leitura Pública de Produtos ✅

**Cenário**: Usuário não autenticado lê produtos

```javascript
// NO NAVEGADOR (Console DevTools ou código React)
import { collection, getDocs } from 'firebase/firestore';

const querySnapshot = await getDocs(collection(db, 'products'));
querySnapshot.forEach((doc) => {
  console.log(doc.id, ' => ', doc.data());
});
```

**Resultado Esperado**: ✅ Sucesso - produtos retornados

---

### Teste 2: Cliente Tenta Modificar Preço ❌

**Cenário**: Usuário não autenticado tenta alterar preço de um produto

```javascript
import { doc, updateDoc } from 'firebase/firestore';

// TENTATIVA DE ATAQUE - deve falhar
await updateDoc(doc(db, 'products', 'product123'), {
  price: 0.01,  // Tentando alterar preço
  quantity: 45
});
```

**Resultado Esperado**: ❌ FALHA - Error: Missing or insufficient permissions

**Por quê?** A regra `affectedKeys().hasOnly(['quantity'])` detecta que `price` foi modificado e bloqueia.

---

### Teste 3: Cliente Decrementa Estoque ✅

**Cenário**: Durante checkout, cliente reduz quantidade disponível

```javascript
import { doc, updateDoc, getDoc } from 'firebase/firestore';

// Primeiro, obter quantidade atual
const docRef = doc(db, 'products', 'product123');
const docSnap = await getDoc(docRef);
const currentQuantity = docSnap.data().quantity;

// Operação legítima durante compra - APENAS decremento
await updateDoc(docRef, {
  quantity: currentQuantity - 1  // Decrementar
});
```

**Resultado Esperado**: ✅ Sucesso - estoque atualizado

**⚠️ Nota**: A regra agora PERMITE APENAS DECREMENTOS. Tentar aumentar o estoque falhará.

---

### Teste 4: Admin Atualiza Produto Completo ✅

**Cenário**: Admin autenticado modifica preço e descrição

```javascript
import { doc, updateDoc } from 'firebase/firestore';

// Admin logado via Firebase Auth
await updateDoc(doc(db, 'products', 'product123'), {
  price: 299.99,
  name: 'Sofá Premium Atualizado',
  description: 'Nova descrição',
  quantity: 100
});
```

**Resultado Esperado**: ✅ Sucesso - todos os campos atualizados

---

### Teste 5: Cliente Cria Pedido Válido ✅

**Cenário**: Cliente não autenticado cria um pedido

```javascript
import { collection, addDoc } from 'firebase/firestore';

await addDoc(collection(db, 'orders'), {
  total: 3500.00,
  items: [
    { productId: 'product123', quantity: 1, price: 3500.00 }
  ],
  customer: {
    name: 'João Silva',
    email: 'joao@example.com',
    phone: '11999999999'
  },
  status: 'pendente',
  createdAt: new Date()
});
```

**Resultado Esperado**: ✅ Sucesso - pedido criado

**⚠️ IMPORTANTE**: As Firestore Rules validam que:
- Campos obrigatórios existem (total, items, customer)
- Total é um número positivo
- Items não está vazio

**MAS NÃO VALIDAM** se o total corresponde à soma dos preços. Esta validação DEVE ser feita no backend com Cloud Functions antes de processar pagamentos!

---

### Teste 6: Cliente Cria Pedido Inválido ❌

**Cenário**: Tentativa de criar pedido sem campos obrigatórios

```javascript
import { collection, addDoc } from 'firebase/firestore';

// Faltando campo 'customer' - deve falhar
await addDoc(collection(db, 'orders'), {
  total: 3500.00,
  items: [
    { productId: 'product123', quantity: 1 }
  ]
  // customer: FALTANDO!
});
```

**Resultado Esperado**: ❌ FALHA - Missing or insufficient permissions

---

### Teste 7: Cliente Tenta Ler Pedidos ❌

**Cenário**: Usuário não autenticado tenta listar pedidos

```javascript
import { collection, getDocs } from 'firebase/firestore';

const querySnapshot = await getDocs(collection(db, 'orders'));
```

**Resultado Esperado**: ❌ FALHA - Missing or insufficient permissions

**Proteção**: Apenas Admin pode ler a coleção `orders`

---

### Teste 8: Admin Lê Todos os Pedidos ✅

**Cenário**: Admin autenticado lista todos os pedidos

```javascript
import { collection, getDocs } from 'firebase/firestore';

// Admin logado via Firebase Auth
const querySnapshot = await getDocs(collection(db, 'orders'));
querySnapshot.forEach((doc) => {
  console.log(doc.id, ' => ', doc.data());
});
```

**Resultado Esperado**: ✅ Sucesso - todos os pedidos retornados

---

## 🛠️ Testar Rules no Emulator UI

1. Acesse http://localhost:4000
2. Vá para a aba **Firestore**
3. Clique em **Rules Playground** (ou similar)
4. Configure:
   - Collection: `products` ou `orders`
   - Document ID: `test123`
   - Authenticated: `Yes` para admin, `No` para cliente
5. Teste operações: `get`, `list`, `create`, `update`, `delete`

---

## 📊 Cenários de Segurança Cobertos

| Ataque/Risco | Proteção |
|--------------|----------|
| 🔴 Manipulação de preços | `affectedKeys().hasOnly(['quantity'])` |
| 🔴 Alteração de nomes/descrições | `affectedKeys().hasOnly(['quantity'])` |
| 🔴 Cliente lê pedidos de outros | `allow read: if isAdmin()` |
| 🔴 Cliente edita próprio pedido | `allow update: if isAdmin()` |
| 🔴 Estoque negativo | `quantity >= 0` |
| 🔴 Pedido com total negativo | `isValidTotal()` |
| 🔴 Pedido sem dados do cliente | `hasRequiredOrderFields()` |

---

## 🚀 Deploy das Regras

### Desenvolvimento
```bash
firebase emulators:start
```

### Produção
```bash
# Certifique-se que firestore.rules está atualizado
firebase deploy --only firestore:rules
```

---

## 🔄 Melhorias Futuras (Produção)

### 1. Admin com Custom Claims (CRÍTICO)

Substitua `isAdmin()` por verificação de claims:

```javascript
function isAdmin() {
  return request.auth != null 
    && request.auth.token.admin == true;
}
```

**Como configurar Custom Claims:**
```javascript
// No Admin SDK (Node.js/Cloud Functions)
const admin = require('firebase-admin');

await admin.auth().setCustomUserClaims(uid, { admin: true });
```

### 2. Cliente Lê Próprios Pedidos

Se quiser permitir que clientes vejam seus pedidos (melhor UX):

```javascript
match /orders/{orderId} {
  allow read: if isAdmin() 
    || (request.auth != null 
        && resource.data.userId == request.auth.uid);
  
  // Para isso funcionar, adicione userId ao criar o pedido
  allow create: if hasRequiredOrderFields(request.resource.data)
    && isValidTotal(request.resource.data)
    && request.auth != null
    && request.resource.data.userId == request.auth.uid;
}
```

### 3. Validação de Preços com Cloud Functions (ESSENCIAL)

**Problema**: Firestore Rules não podem recalcular totais ou consultar preços de produtos.

**Solução**: Use Cloud Functions para validar e processar pedidos:

```javascript
// functions/index.js
const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.validateAndProcessOrder = functions.firestore
  .document('orders/{orderId}')
  .onCreate(async (snap, context) => {
    const order = snap.data();
    const db = admin.firestore();
    
    // 1. Recalcular total baseado nos preços reais dos produtos
    let calculatedTotal = 0;
    for (const item of order.items) {
      const productDoc = await db.collection('products').doc(item.productId).get();
      const product = productDoc.data();
      
      if (!product) {
        // Produto não existe - marcar pedido como inválido
        await snap.ref.update({ status: 'invalido', reason: 'Produto não encontrado' });
        return;
      }
      
      calculatedTotal += product.price * item.quantity;
    }
    
    // 2. Verificar se o total está correto
    const tolerance = 0.01; // Tolerância para erros de arredondamento
    if (Math.abs(order.total - calculatedTotal) > tolerance) {
      // Total incorreto - possível tentativa de fraude
      await snap.ref.update({ 
        status: 'invalido', 
        reason: 'Total não corresponde aos preços dos produtos',
        calculatedTotal: calculatedTotal 
      });
      return;
    }
    
    // 3. Decrementar estoque (transação atômica)
    const batch = db.batch();
    for (const item of order.items) {
      const productRef = db.collection('products').doc(item.productId);
      batch.update(productRef, {
        quantity: admin.firestore.FieldValue.increment(-item.quantity)
      });
    }
    
    // 4. Marcar pedido como validado
    batch.update(snap.ref, { 
      status: 'validado',
      validatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    await batch.commit();
  });
```

**Com esta Cloud Function:**
- ✅ Preços são recalculados no servidor (não confia no cliente)
- ✅ Estoque é gerenciado atomicamente
- ✅ Pedidos fraudulentos são detectados e marcados
- ✅ Não há necessidade de permitir updates de estoque por clientes

**Atualizar Firestore Rules se usar Cloud Functions:**
```javascript
match /products/{productId} {
  allow read: if true;
  allow write: if isAdmin();
  // REMOVER a regra de update para clientes não-autenticados
}

match /orders/{orderId} {
  allow create: if hasRequiredOrderFields(request.resource.data);
  allow read, update: if isAdmin();
}
```

### 4. Validações Mais Complexas

```javascript
function isValidProduct() {
  return request.resource.data.price > 0
    && request.resource.data.name.size() > 0
    && request.resource.data.quantity >= 0;
}
```

---

## 📚 Referências

- [Firebase Security Rules Documentation](https://firebase.google.com/docs/firestore/security/get-started)
- [Firestore Rules Conditions](https://firebase.google.com/docs/firestore/security/rules-conditions)
- [Firebase Emulator Suite](https://firebase.google.com/docs/emulator-suite)

---

## ✅ Checklist de Segurança

Antes de ir para produção:

### 🔴 CRÍTICO (Obrigatório)
- [ ] **Implementar verificação real de Admin** - Substituir `isAdmin()` por Custom Claims ou lista de UIDs
- [ ] **Validar preços no servidor** - Implementar Cloud Function para recalcular totais
- [ ] **Gerenciar estoque via Cloud Function** - Remover permissão de update de clientes não-autenticados
- [ ] **Testar scenarios de ataque** - Tentar manipular preços, totais, estoque
- [ ] **Configurar Firebase Auth** - Definir admins com Custom Claims

### 🟡 Importante (Recomendado)
- [ ] Testar TODAS as regras no emulador
- [ ] Validar que clientes não conseguem ler orders de outros
- [ ] Confirmar que apenas `quantity` pode ser alterada por não-admins (se mantiver essa permissão)
- [ ] Testar criação de orders com dados inválidos
- [ ] Adicionar userId aos pedidos para histórico do cliente
- [ ] Implementar rate limiting para operações sensíveis
- [ ] Revisar logs de acesso negado no Firestore

### 🟢 Opcional (Melhorias)
- [ ] Configurar alertas de segurança no Firebase Console
- [ ] Documentar UIDs de admins autorizados
- [ ] Adicionar validação de estoque mínimo
- [ ] Implementar logs de auditoria para operações de admin
- [ ] Configurar backup automático do Firestore

### 📊 Validações de Segurança Recomendadas

Execute estes testes antes de produção:

```bash
# 1. Teste de manipulação de preços
# Tentar atualizar preço sem ser admin - deve falhar

# 2. Teste de ordem com total incorreto
# Criar pedido com total diferente da soma dos itens
# Cloud Function deve marcar como inválido

# 3. Teste de acesso a pedidos
# Usuário não-admin tentar ler orders - deve falhar

# 4. Teste de decremento de estoque
# Tentar incrementar estoque sem ser admin - deve falhar
# Tentar decrementar - deve funcionar (se permitido nas rules)

# 5. Teste de autenticação
# Verificar que apenas admins verdadeiros têm acesso total
```

---

**Desenvolvido com 🔒 para M'Martin Estofados Finos**
