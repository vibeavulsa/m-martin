# 🔒 Firestore Security Rules - M'Martin E-commerce

## 📋 Visão Geral

Este documento descreve as regras de segurança do Firestore implementadas para o e-commerce M'Martin, com foco em proteção contra vazamento de dados e manipulação de preços.

## 🎯 Objetivos de Segurança

1. **Proteção de Dados**: Impedir acesso não autorizado a pedidos e informações sensíveis
2. **Integridade de Preços**: Bloquear manipulação de preços, nomes e descrições de produtos
3. **Controle de Estoque**: Permitir apenas atualizações legítimas de inventário
4. **Validação de Pedidos**: Garantir que pedidos tenham dados válidos e completos

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
  return data.total is number && data.total > 0;
}
```
**Propósito**: Garante que o total do pedido é um número positivo.

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
  && request.resource.data.quantity >= 0;
```

**Como funciona:**
1. `!isAdmin()` - Aplica-se apenas a usuários não autenticados
2. `diff(resource.data).affectedKeys()` - Identifica quais campos foram modificados
3. `.hasOnly(['quantity'])` - BLOQUEIA se qualquer outro campo além de `quantity` for alterado
4. `quantity >= 0` - Previne valores negativos de estoque

**Campos protegidos:**
- ❌ `price` - Preço não pode ser alterado
- ❌ `name` - Nome não pode ser alterado
- ❌ `description` - Descrição não pode ser alterada
- ❌ `category`, `image`, `features`, etc.
- ✅ `quantity` - Único campo permitido

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
- `items` - Array de itens do pedido
- `customer` - Dados do cliente

**Proteções:**
- Cliente NÃO pode ler pedidos após criação
- Cliente NÃO pode editar seu próprio pedido
- Apenas Admin visualiza e gerencia todos os pedidos

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
import { doc, updateDoc } from 'firebase/firestore';

// Operação legítima durante compra
await updateDoc(doc(db, 'products', 'product123'), {
  quantity: 45  // APENAS quantity
});
```

**Resultado Esperado**: ✅ Sucesso - estoque atualizado

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

### 1. Admin com Custom Claims

Substitua `isAdmin()` por verificação de claims:

```javascript
function isAdmin() {
  return request.auth != null 
    && request.auth.token.admin == true;
}
```

### 2. Cliente Lê Próprios Pedidos

Se quiser permitir que clientes vejam seus pedidos:

```javascript
match /orders/{orderId} {
  allow read: if isAdmin() 
    || (request.auth != null 
        && resource.data.userId == request.auth.uid);
}
```

### 3. Validações Mais Complexas

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

- [ ] Testar TODAS as regras no emulador
- [ ] Configurar Firebase Auth com Admin Custom Claims
- [ ] Substituir `isAdmin()` por verificação real de roles
- [ ] Testar scenarios de ataque (price manipulation, etc.)
- [ ] Validar que clientes não conseguem ler orders de outros
- [ ] Confirmar que apenas `quantity` pode ser alterada por não-admins
- [ ] Testar criação de orders com dados inválidos
- [ ] Configurar alertas de segurança no Firebase Console
- [ ] Revisar logs de acesso negado no Firestore
- [ ] Documentar UIDs de admins autorizados

---

**Desenvolvido com 🔒 para M'Martin Estofados Finos**
