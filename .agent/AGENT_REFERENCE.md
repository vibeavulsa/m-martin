# M'Martin — Referência Rápida para Agente

> **Última atualização:** 2026-02-17  
> Este arquivo consolida todas as informações dos MDs do projeto para acesso rápido.

---

## 🗂️ Mapa de Documentação

| Arquivo | Conteúdo | Quando Consultar |
|---------|----------|------------------|
| `README.md` | Visão geral, estrutura, quick start, changelog | Visão geral do projeto |
| `PROJETO.md` | Stack, catálogo completo, componentes, funcionalidades | Entender escopo e features |
| `FIREBASE_SETUP.md` | Setup passo-a-passo do Firebase | Configuração inicial Firebase |
| `SETUP_INSTRUCTIONS.md` | Config do .env, admin, rules, testes | Troubleshooting, setup |
| `SECURITY_IMPLEMENTATION.md` | Auth, transações, regras — doc técnica | Implementar segurança |
| `FIRESTORE_SECURITY.md` | Rules detalhadas, testes, cenários de ataque | Editar firestore.rules |
| `DELIVERABLE_SUMMARY.md` | Log de entrega do núcleo de segurança | Histórico de implementações |

---

## 📐 Arquitetura do Projeto

### Stack
- **React 19.2** + **Vite 7.2** + **Firebase 12.9**
- **Framer Motion 12.33** (animações — substituiu `liquid-glass-react`)
- **React Router DOM 7.13** (SPA routing)
- **Tabler Icons React 3.36** (ícones)
- **CSS modular** (glassmorphism via CSS puro, não usa Tailwind)

### Projeto Firebase
- ID: `m-martin-estofados` | Número: `178643218861`
- Auth: Email/senha | Firestore: produtos, pedidos, categorias, cushionKit
- Hosting: Firebase / Vercel / Netlify (SPA com rewrites)

### Variáveis de Ambiente (`.env`)
```env
VITE_FIREBASE_API_KEY=...      # Obrigatório
VITE_FIREBASE_APP_ID=...       # Obrigatório
VITE_ADMIN_USER=admin          # Fallback legacy
VITE_ADMIN_PASS=...            # Fallback legacy
VITE_WHATSAPP_NUMBER=55...     # WhatsApp de contato
```

---

## 📁 Estrutura de Arquivos Completa

```
src/
├── App.jsx                    # Componente catálogo (Class AppCatalog + Function App)
├── main.jsx                   # Entry point: BrowserRouter > AuthProvider > Routes
│
├── components/  (29 arquivos)
│   ├── Header.jsx/.css        # Navbar + navegação categorias
│   ├── Hero.jsx/.css          # Seção hero + Framer Motion
│   ├── CategorySection.jsx/.css
│   ├── ProductCard.jsx/.css
│   ├── ProductDialog.jsx/.css # Modal detalhes produto
│   ├── CartDialog.jsx/.css    # Carrinho
│   ├── CheckoutDialog.jsx/.css # Checkout + validação estoque
│   ├── CustomerDialog.jsx/.css # Dados cliente
│   ├── OrderConfirmationDialog.jsx/.css # Confirmação pedido
│   ├── CushionKitBanner.jsx/.css  # Banner kit almofadas
│   ├── CushionKitSelector.jsx/.css # Seletor cores/tamanho
│   ├── SettingsDialog.jsx/.css
│   ├── UserProfileDialog.jsx/.css
│   ├── Login.jsx/.css         # Firebase Auth login
│   └── PrivateRoute.jsx       # Proteção de rotas
│
├── admin/
│   ├── AdminRoutes.jsx
│   ├── Admin.css
│   ├── components/AdminLayout.jsx
│   ├── context/AdminContext.jsx
│   └── pages/ (6): Dashboard, Products, Stock, Orders, CushionKit, Login
│
├── context/
│   ├── AuthContext.jsx        # Firebase Auth state
│   ├── CartContext.jsx        # Carrinho state
│   └── UserContext.jsx        # Usuário state
│
├── config/firebase.js         # Firebase init
├── data/products.js           # 15 produtos + 5 categorias (fallback)
├── services/orderService.ts   # Transações atômicas Firestore
├── hooks/useCatalogoMMartin.js
├── types/order.ts
├── utils/whatsappGenerator.ts
│
└── assets/
    ├── logo.png, logoblack.png
    ├── almofadas_bg.jpeg, bg_tp*.jpeg (backgrounds)
    └── almofadas/ (10 arquivos: PNGs cores + vídeos MP4)
```

---

## 🛒 Catálogo: 15 Produtos em 5 Categorias

| # | Categoria | Qtd | Produtos |
|---|-----------|-----|----------|
| 1 | Sofás | 3 | Premium 3L (R$3.500), Retrátil (R$4.200), Canto Modular (R$5.800) |
| 2 | Almofadas | 4 | Veludo (R$120), Ortopédica (R$180), Kit Estampadas (R$380), **Kit Refil 5un (R$349,50)** |
| 3 | Travesseiros | 3 | Viscoelástico (R$280), Plumas (R$350), Cervical (R$240) |
| 4 | Homecare/Hospitalar | 4 | Colchão D45 (R$1.800), Anti-Refluxo (R$320), Kit Cama (R$2.500), **Acamados (R$807,90)** |
| 5 | Pet | 1 | **Cama Pet 70x90 (R$130)** |

> Produtos em **negrito** são novos (adicionados após v1.0 inicial).

---

## 🔒 Segurança — Resumo Executivo

### Firestore Rules (`firestore.rules`)
| Coleção | Read | Create | Update | Delete |
|---------|------|--------|--------|--------|
| `products` | Público | Admin | Admin OU decremento válido | Admin |
| `orders` | Admin | Público (c/ validação) | Admin | Admin |
| `categories` | Público | Admin | Admin | Admin |
| `cushionKit` | Público | Admin | Admin | Admin |

### Campos obrigatórios para `orders.create`:
- `totalPrice` (number > 0)
- `items` (list, size > 0)
- `customer` (object)

### ⚠️ isAdmin() Simplificado
```javascript
// ATUAL (dev only) — qualquer autenticado = admin
function isAdmin() { return request.auth != null; }

// PRODUÇÃO — usar Custom Claims:
// function isAdmin() { return request.auth != null && request.auth.token.admin == true; }
```

### Transação Atômica de Estoque
```
BEGIN TRANSACTION → READ products → VALIDATE quantities →
UPDATE quantities (decrement) + CREATE order → COMMIT
```
- Se estoque insuficiente: throw error, modal permanece aberto, nada muda.

---

## 🚏 Roteamento

```
/          → App (catálogo público)
/login     → Login.jsx (Firebase Auth)
/admin/*   → PrivateRoute > AdminRoutes
  /admin/         → DashboardPage
  /admin/products → ProductsPage
  /admin/stock    → StockPage
  /admin/orders   → OrdersPage
  /admin/cushion-kit → CushionKitPage
```

---

## 🔄 Fluxo de Compra

```
Catálogo → ProductCard (click)
  → ProductDialog (detalhes, "Adicionar ao Carrinho")
  → CartDialog (revisar itens)
  → CustomerDialog (dados do cliente)
  → CheckoutDialog (transação atômica: valida estoque → cria pedido)
  → OrderConfirmationDialog (sucesso + link WhatsApp)
```

---

## 🛠️ Comandos Úteis

```bash
npm run dev          # Dev server → http://localhost:5173
npm run build        # Build → dist/
npm run preview      # Preview build local
npm run lint         # ESLint
firebase deploy      # Deploy completo
firebase deploy --only firestore:rules   # Só regras
firebase deploy --only hosting           # Só hosting
```

---

## ⚠️ Pendências para Produção

1. **isAdmin() real** — Implementar Custom Claims ou lista de UIDs
2. **Cloud Functions** — Validar preços no servidor (totalPrice pode ser manipulado)
3. **Rate limiting** — Proteger endpoints públicos
4. **Estoque via Cloud Functions** — Remover permissão de decremento para não-autenticados
5. **SEO** — Sitemap, meta tags, schema markup
6. **Pagamento** — Integrar gateway de pagamento
