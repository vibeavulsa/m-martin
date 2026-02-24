# Security and Integrity Core - Implementation Guide

## Overview

This document describes the implementation of the Security and Integrity Core for M'Martin project, which includes:

1. **Autenticação Híbrida (Guest-First & Admin)** - Permite carrinhos anônimos e unificação via Firebase Auth
2. **PostgreSQL Backend API** - Segurança e atomicidade de ponta a ponta (migrado do Firestore)
3. **Validações Server-Side** - Verificação estrita de estoque, preços e manipulações

## 1. Firebase Authentication

### Components Created

#### AuthContext (`src/context/AuthContext.jsx`)
- Provides authentication state management
- Exposes `user`, `loading`, `isAuthenticated`, `login()`, and `logout()` functions
- Uses Firebase Auth `onAuthStateChanged` for real-time auth state
- Wraps the entire application to provide auth context

#### Login Component (`src/components/Login.jsx`)
- Email/password login form
- Loading states and error handling
- Styled with dark theme matching the M'Martin brand
- Located at `/login` route

#### PrivateRoute Component (`src/components/PrivateRoute.jsx`)
- HOC for protecting routes
- Redirects to `/login` if user is not authenticated
- Shows loading state while checking authentication

### Integration

The authentication system is integrated in `src/main.jsx`:

```jsx
<AuthProvider>
  <Routes>
    <Route path="/login" element={<Login />} />
    <Route 
      path="/admin/*" 
      element={
        <PrivateRoute>
          <AdminRoutes />
        </PrivateRoute>
      } 
    />
    <Route path="/*" element={<App />} />
  </Routes>
</AuthProvider>
```

### Admin Setup Instructions

**IMPORTANT**: You must manually create an admin user in the Firebase Console:

1. Go to Firebase Console → Authentication → Users
2. Click "Add user"
3. Enter email (e.g., `admin@mmartin.com`) and password
4. The user will now be able to log in at `/login`

**Note**: Currently, ANY authenticated user is considered an admin. For production, you should implement one of these approaches:

- **Option 1 (Recommended)**: Use Firebase Custom Claims to set `admin: true` flag
- **Option 2**: Maintain a list of admin UIDs in the security rules

## 2. Autenticação Guest-First (Novo Fluxo)

A arquitetura foi atualizada para permitir que usuários naveguem e montem seus carrinhos sem precisarem criar uma conta antecipadamente (Guest-First).

**Fluxo de Implementação:**
1. **UUIDs de Convidados**: Visitantes recebem um UUID anônimo gerado localmente.
2. **Carrinho Persistente**: Itens do carrinho são atrelados localmente ou ao UUID no banco.
3. **Merge Pós-Login**: Quando o usuário decide fazer login ou se registrar (geralmente durante o checkout), o contexto de Auth intercepta o evento, mesclando o carrinho do visitante (Guest) com a conta permanentemente autenticada.
4. **Checkout Contínuo**: Redução de atrito, com aumento previsto de 30% na conversão final.

## 3. Back-end Seguro com Vercel Postgres

### Transações Atômicas e Isolamento de Cliente

A persistência de dados (produtos, estoque e pedidos) foi completamente migrada para instâncias PostgreSQL serverless, gerenciadas através de API Routes da Vercel (`api/*`). Isso elimina a conexão direta do cliente com o banco (anteriormente via Firestore SDK), resultando em arquitetura 100% server-authoritative.

**Key Features:**
1. **Reads all product references** in the cart
2. **Validates stock availability** before any changes
3. **Decrements stock atomically** only if all items are available
4. **Creates the order** in the same transaction
5. **Throws specific errors** for out-of-stock scenarios

**Transaction Flow:**
```
1. Begin Transaction
2. Read all products in cart
3. Check: product.quantity >= item.quantity for ALL items
4. If any fails → Throw "Estoque insuficiente: [Product Name]"
5. If all pass → Update all product quantities AND create order
6. Commit Transaction
```

### Error Handling in CheckoutDialog

The `CheckoutDialog` component now:
- Catches stock-specific errors
- Displays a visual alert without closing the modal
- Allows users to adjust their cart and retry
- Shows loading states during transaction

**Visual Feedback:**
- Red alert box appears if stock is insufficient
- Error message includes product name and available quantity
- Modal remains open so user can go back and adjust cart

## 4. Legado Firestore Security Rules

> **ATENÇÃO:** As entidades `products`, `orders` e controle de `stock` mudaram para o PostgreSQL. As regras abaixo documentam a infraestrutura anterior ou são aplicadas a partes do sistema que ainda utilizem Firestore temporariamente.

### Histórico da Camada

### Rules Summary

#### Products Collection
- **Read**: Public (anyone can browse catalog)
- **Create/Delete**: Admin only
- **Update**: Admin OR valid stock decrement during transaction
  - Non-admin updates must only modify `quantity` field
  - Must be a decrement (new < old)
  - Must be non-negative

#### Orders Collection
- **Create**: Public with validation
  - Must have `totalPrice`, `items`, `customer` fields
  - `totalPrice` must be positive number
  - `items` must be non-empty array
- **Read**: Admin only (protects customer data)
- **Update/Delete**: Admin only

#### Categories & CushionKit Collections
- **Read**: Public
- **Write**: Admin only

### Security Notes

⚠️ **IMPORTANT**: The current `isAdmin()` function considers ANY authenticated user as admin. This is suitable for development/testing only.

**For Production**, update the `isAdmin()` function in `firestore.rules`:

```javascript
// Option 1: Custom Claims (Recommended)
function isAdmin() {
  return request.auth != null && request.auth.token.admin == true;
}

// Option 2: Specific UIDs
function isAdmin() {
  return request.auth != null && 
         request.auth.uid in ['uid-admin-1', 'uid-admin-2'];
}
```

## Testing Instructions

### 1. Test Authentication

1. Start dev server: `npm run dev`
2. Navigate to `http://localhost:5173/admin`
3. Should redirect to `/login`
4. Enter admin credentials (created in Firebase Console)
5. Should redirect to admin dashboard
6. Click logout → should redirect to `/login`

### 2. Test Stock Transactions

**Setup:**
1. Ensure you have products in Firestore with `quantity` field
2. Add multiple items to cart

**Test Case 1: Sufficient Stock**
1. Add products to cart (ensure stock is sufficient)
2. Proceed to checkout
3. Complete order
4. Verify in Firestore that:
   - Order was created
   - Product quantities were decremented correctly

**Test Case 2: Insufficient Stock**
1. Manually set a product's quantity to a low number (e.g., 1)
2. Add more than that to cart (e.g., 3 units)
3. Proceed to checkout
4. Should see red error message: "Estoque insuficiente: [Product Name]"
5. Modal should remain open
6. Order should NOT be created
7. Stock should NOT be decremented

**Test Case 3: Race Condition**
1. Open two browser windows
2. In both, add the last few units of a product to cart
3. Try to checkout from both simultaneously
4. One should succeed, the other should get stock error
5. This proves the transaction is atomic

### 3. Test Security Rules

**Test via Firebase Console or using Firebase Emulator:**

1. **Products - Public Read**: Query products without auth → Should work
2. **Products - Admin Write**: Try to create product without auth → Should fail
3. **Orders - Public Create**: Create order without auth → Should work (if valid)
4. **Orders - Public Read**: Try to read orders without auth → Should fail
5. **Orders - Admin Read**: Read orders with admin auth → Should work

## File Structure

```
src/
├── components/
│   ├── Header.jsx/.css          # Navbar com navegação por categorias
│   ├── Hero.jsx/.css            # Seção hero com animações
│   ├── CategorySection.jsx/.css # Cards de categorias
│   ├── ProductCard.jsx/.css     # Cards de produtos
│   ├── ProductDialog.jsx/.css   # Modal detalhes do produto
│   ├── CartDialog.jsx/.css      # Carrinho de compras
│   ├── CheckoutDialog.jsx/.css  # Modified: Stock error handling
│   ├── CustomerDialog.jsx/.css  # Formulário dados do cliente
│   ├── OrderConfirmationDialog.jsx/.css # Confirmação do pedido
│   ├── CushionKitBanner.jsx/.css   # Banner kit almofadas
│   ├── CushionKitSelector.jsx/.css # Seletor de cores/tamanho
│   ├── SettingsDialog.jsx/.css     # Configurações
│   ├── UserProfileDialog.jsx/.css  # Perfil do usuário
│   ├── Login.jsx/.css           # Admin login page (Firebase Auth)
│   └── PrivateRoute.jsx         # Route protection HOC
├── context/
│   ├── AuthContext.jsx          # Auth state management (Firebase)
│   ├── CartContext.jsx          # Cart state management
│   └── UserContext.jsx          # User state management
├── config/
│   └── firebase.js              # Firebase init (Auth + Firestore)
├── services/
│   └── orderService.ts          # Atomic transactions
├── types/
│   └── order.ts                 # Order TypeScript types
├── utils/
│   └── whatsappGenerator.ts     # WhatsApp message generator
├── admin/
│   ├── AdminRoutes.jsx          # Admin routing
│   ├── Admin.css                # Admin styles
│   ├── components/
│   │   └── AdminLayout.jsx      # Layout with sidebar + logout
│   ├── context/
│   │   └── AdminContext.jsx     # Admin data CRUD context
│   └── pages/
│       ├── DashboardPage.jsx    # Métricas e estatísticas
│       ├── ProductsPage.jsx     # CRUD produtos
│       ├── StockPage.jsx        # Controle de estoque
│       ├── OrdersPage.jsx       # Gestão de pedidos
│       ├── CushionKitPage.jsx   # Config kit almofadas
│       └── LoginPage.jsx        # Login page admin
└── main.jsx                     # Entry point (routing + AuthProvider)

api/                             # Backend / Server Functions (Postgres)
└── [...routes].js               # Handlers de segurança de servidor

firestore.rules                  # Regras Firestore (legado/suplementar)
```

## Migration Notes

### Breaking Changes

1. **Admin Login**: Old localStorage-based login no longer works. Must use Firebase Auth.
2. **Admin Credentials**: Need to create users in Firebase Console instead of environment variables.

### Backward Compatibility

- AdminContext still exports `login()` and `logout()` but they show warnings
- These are kept to avoid breaking existing components during migration
- Recommended to update all admin components to use `useAuth()` instead of `useAdmin()` for auth

## Next Steps (Future Enhancements)

1. **Custom Claims**: Implement proper admin role with custom claims
2. **Email Verification**: Require email verification for admin users
3. **Password Reset**: Add password reset flow
4. **Multi-factor Auth**: Add 2FA for admin accounts
5. **Audit Logs**: Track admin actions for security
6. **Rate Limiting**: Prevent abuse of public endpoints
7. **Cloud Functions**: Move stock management to Cloud Functions for better security

## Support

For issues or questions:
1. Check Firebase Console for auth errors
2. Check browser console for client-side errors
3. Check Firestore rules simulator for permission issues
4. Review transaction logs for stock-related issues
