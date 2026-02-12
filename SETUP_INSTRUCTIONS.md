# 🚀 Configuração Final - Núcleo de Segurança e Integridade

## ✅ O que foi implementado

### 1. 🔐 Sistema de Autenticação Firebase
- **Login com Email/Senha** na rota `/login`
- **Proteção de rotas administrativas** com `PrivateRoute`
- **Context de autenticação** (`AuthContext`) gerenciando estado global
- **Logout seguro** que invalida a sessão

### 2. ⚛️ Transações Atômicas de Estoque
- **Verificação de estoque** antes de criar pedidos
- **Decrementação atômica** - ou tudo funciona, ou nada acontece
- **Tratamento de erros específicos** para produtos sem estoque
- **Feedback visual** ao usuário quando há problemas de estoque

### 3. 🛡️ Regras de Segurança Firestore
- **Produtos**: Leitura pública, escrita apenas Admin
- **Pedidos**: Criação pública (checkout), leitura/edição apenas Admin
- **Validação de campos obrigatórios** para pedidos
- **Proteção contra modificação de preços** e dados sensíveis

---

## ⚙️ CONFIGURAÇÃO NECESSÁRIA

### ⚠️ Passo 0: Configurar Variáveis de Ambiente (OBRIGATÓRIO)

**ESTE É O PRIMEIRO PASSO CRÍTICO**. Sem isso, você verá erros como `auth/api-key-not-valid`.

1. Copie o arquivo de exemplo:
   ```bash
   cp .env.example .env
   ```

2. Obtenha suas credenciais do Firebase:
   - Acesse o [Firebase Console](https://console.firebase.google.com)
   - Selecione o projeto `m-martin-estofados`
   - Vá em **Project Settings** (⚙️ ícone de engrenagem)
   - Na seção **General**, role até **Your apps**
   - Se ainda não tiver um app web, clique em **Add app** (</>) e selecione **Web**
   - Copie as credenciais mostradas

3. Edite o arquivo `.env` e adicione suas credenciais:
   ```env
   VITE_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
   VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456
   VITE_ADMIN_USER=admin
   VITE_ADMIN_PASS=your_admin_password_here
   VITE_WHATSAPP_NUMBER=5500000000000
   ```

4. **Reinicie o servidor de desenvolvimento** após criar/editar o `.env`:
   ```bash
   npm run dev
   ```

> **💡 Nota**: Nunca commite o arquivo `.env` no Git. Ele já está no `.gitignore`.

### Passo 2: Criar Usuário Admin no Firebase Console

**OBRIGATÓRIO**: Você precisa criar manualmente o usuário admin:

1. Acesse o [Firebase Console](https://console.firebase.google.com)
2. Selecione o projeto `m-martin-estofados`
3. Vá em **Authentication** (Autenticação) no menu lateral
4. Clique na aba **Users** (Usuários)
5. Clique em **Add user** (Adicionar usuário)
6. Preencha:
   - **Email**: `admin@mmartin.com` (ou o email que preferir)
   - **Password**: Escolha uma senha forte
7. Clique em **Add user**

✅ Pronto! Agora você pode fazer login em `/login` com essas credenciais.

### Passo 3: Deploy das Regras de Segurança

Para aplicar as novas regras de segurança do Firestore:

```bash
firebase deploy --only firestore:rules
```

Ou, se preferir deploy completo:
```bash
firebase deploy
```

### Passo 4: Inicializar Produtos no Firestore

Certifique-se de que seus produtos no Firestore têm o campo `quantity`:

```javascript
// Exemplo de estrutura de produto no Firestore
{
  name: "Sofá Retrátil",
  price: "R$ 2.500,00",
  category: "sofas",
  quantity: 10,  // ← IMPORTANTE: Campo necessário para controle de estoque
  // ... outros campos
}
```

Se seus produtos não têm esse campo, adicione-o manualmente no console ou via script.

---

## 🧪 Como Testar

### Teste 1: Autenticação
```bash
npm run dev
```

1. Acesse `http://localhost:5173/admin`
2. Deve redirecionar para `/login`
3. Faça login com as credenciais criadas
4. Deve redirecionar para o dashboard admin
5. Clique em "Sair" → deve voltar para `/login`

### Teste 2: Transações de Estoque

**Cenário de Sucesso:**
1. Coloque produtos no carrinho (com estoque disponível)
2. Complete o checkout
3. ✅ Pedido criado e estoque decrementado

**Cenário de Falha (Estoque Insuficiente):**
1. No Firestore Console, defina `quantity: 1` para um produto
2. Adicione 3 unidades desse produto ao carrinho
3. Tente finalizar compra
4. ❌ Deve aparecer erro: "Estoque insuficiente: [Nome do Produto]"
5. Modal permanece aberto
6. Pedido NÃO é criado
7. Estoque NÃO é alterado

### Teste 3: Regras de Segurança

Você pode testar no **Rules Playground** do Firebase Console:

1. Vá em **Firestore Database** → **Rules**
2. Clique em **Rules Playground**
3. Teste cenários:
   - Leitura de produtos sem autenticação ✅
   - Criação de produto sem autenticação ❌
   - Criação de pedido sem autenticação ✅
   - Leitura de pedidos sem autenticação ❌

---

## 📋 Checklist de Implantação

- [ ] Arquivo `.env` criado a partir de `.env.example`
- [ ] Credenciais Firebase configuradas no `.env`
- [ ] Servidor de desenvolvimento reiniciado após configurar `.env`
- [ ] Usuário admin criado no Firebase Console
- [ ] Regras de segurança deployadas (`firebase deploy --only firestore:rules`)
- [ ] Produtos no Firestore têm campo `quantity`
- [ ] Teste de login realizado com sucesso
- [ ] Teste de transação de estoque realizado
- [ ] Verificado que pedidos não podem ser lidos sem autenticação

---

## 🔒 IMPORTANTE - Segurança em Produção

⚠️ **ATENÇÃO**: Atualmente, QUALQUER usuário autenticado é considerado admin!

Isso é adequado apenas para desenvolvimento. **Antes de produção**, você DEVE implementar uma das seguintes opções:

### Opção 1: Custom Claims (Recomendada)

Use o Firebase Admin SDK para definir um custom claim:

```javascript
// No seu backend ou Cloud Function
const admin = require('firebase-admin');

async function setAdminClaim(uid) {
  await admin.auth().setCustomUserClaims(uid, { admin: true });
}
```

E atualize `firestore.rules`:
```javascript
function isAdmin() {
  return request.auth != null && request.auth.token.admin == true;
}
```

### Opção 2: Lista de UIDs

Atualize `firestore.rules` com lista de UIDs permitidos:
```javascript
function isAdmin() {
  return request.auth != null && 
         request.auth.uid in ['UID_DO_ADMIN_1', 'UID_DO_ADMIN_2'];
}
```

Para obter o UID do usuário, veja no Firebase Console → Authentication → Users.

---

## 📚 Documentação Completa

Para detalhes técnicos completos, consulte: `SECURITY_IMPLEMENTATION.md`

---

## 🆘 Problemas Comuns

### Erro: "auth/api-key-not-valid" ou "YOUR_API_KEY"
- **Causa**: Arquivo `.env` não existe ou está com credenciais inválidas
- **Solução**: 
  1. Certifique-se de que o arquivo `.env` existe (copie de `.env.example`)
  2. Adicione suas credenciais Firebase reais no `.env`
  3. Reinicie o servidor de desenvolvimento (`npm run dev`)
  4. Veja o Passo 0 acima para instruções detalhadas

### Erro: "Permission denied" ao criar pedido
- Verifique se as regras foram deployadas
- Certifique-se de que o pedido tem os campos obrigatórios: `totalPrice`, `items`, `customer`

### Erro: "Insufficient permissions" no admin
- Verifique se o usuário está autenticado
- Confirme que o login foi bem-sucedido
- Limpe o cache do navegador

### Erro ao decrementar estoque
- Confirme que os produtos têm campo `quantity` no Firestore
- Verifique se os `productId` no carrinho correspondem aos IDs reais no Firestore

---

## 📞 Suporte

Se encontrar problemas:
1. Verifique o console do navegador para erros
2. Verifique o Firebase Console para erros de autenticação
3. Use o Rules Playground para testar regras de segurança
4. Consulte os logs de transação no Firestore

---

**Implementado por**: GitHub Copilot Agent
**Data**: Fevereiro 2026
