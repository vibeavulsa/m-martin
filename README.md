# M'Martin - Estofados Finos

E-commerce moderno para estofados finos, com catálogo interativo, painel administrativo completo, checkout integrado e segurança de nível produção. Desenvolvido com React 19, Vite 7 e **backend totalmente serverless via Vercel + PostgreSQL (Neon)**.

## 📋 Informações do Projeto

- **Nome:** M'Martin Estofados Finos
- **URL de Produção:** [m-martin.vercel.app](https://m-martin.vercel.app)
- **Tecnologias:** React 19, Vite 7, Vercel Serverless Functions, PostgreSQL (Neon), Firebase Auth, Framer Motion, Mercado Pago
- **Plataforma de Deploy:** Vercel (principal)

## 🏗️ Arquitetura — Firebase → Vercel Serverless

> **Mudança arquitetural principal (PRs #64–#71):** O projeto migrou de Firebase Firestore (banco NoSQL client-side) para **Vercel Serverless Functions + PostgreSQL (Neon)** como backend de dados. O Firebase continua sendo usado **apenas para autenticação** (Firebase Auth).

### Antes (Firestore)
```
Cliente (React) → Firebase SDK → Firestore (NoSQL, client-side)
                → Cloud Functions (pedidos, pagamentos)
```

### Agora (Vercel Serverless + PostgreSQL)
```
Cliente (React) → fetch('/api/...') → Vercel Serverless Functions → PostgreSQL (Neon)
                → Firebase Auth (apenas autenticação)
```

### Por que migrar?

| Aspecto | Firebase/Firestore | Vercel Postgres |
|---------|-------------------|-----------------|
| **Banco de dados** | NoSQL document-based | SQL relacional |
| **Segurança** | Security Rules client-side | API isolada server-side |
| **Transações** | Firestore transactions (limitadas) | SQL transactions completas |
| **Custo** | Pay-per-read/write | Neon free tier generoso |
| **Deploy** | Firebase Hosting + Functions | Vercel (tudo integrado) |
| **DX** | Firebase SDK complexo | `fetch()` + SQL puro |

## 🚀 Como Executar

### Pré-requisitos
- Node.js (versão 18 ou superior)
- npm
- Conta Vercel com banco Postgres (Neon) provisionado
- Conta Firebase com projeto configurado (apenas para Auth)

### Instalação

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Edite o arquivo .env com suas credenciais
```

> **⚠️ CONFIGURAÇÃO OBRIGATÓRIA**: O `.env` precisa conter:
> - Credenciais do **Vercel Postgres (Neon)** — `POSTGRES_URL`, `PGHOST`, `PGUSER`, etc.
> - Credenciais do **Firebase** — apenas para Auth (`VITE_FIREBASE_API_KEY`, etc.)
> - Veja `.env.example` para a lista completa.

### Desenvolvimento

```bash
npm run dev
# O aplicativo estará disponível em http://localhost:5173
```

### Inicialização do Banco

Na primeira execução, é necessário criar as tabelas e popular dados iniciais:

```bash
# 1. Criar tabelas no PostgreSQL
curl -X POST http://localhost:5173/api/init-db

# 2. Popular dados de seed (sofás, almofadas, categorias)
curl -X POST http://localhost:5173/api/seed-data
```

### Build para Produção

```bash
npm run build
npm run preview
```

## 🚀 Deploy

### Vercel (Principal)

```bash
npm install -g vercel
vercel
```

Ou conecte o repositório no [Vercel](https://vercel.com):
1. **Storage → Create → Postgres (Neon)** — As env vars são injetadas automaticamente
2. O `vercel.json` já roteia `/api/*` para as serverless functions
3. Após o primeiro deploy, execute `POST /api/init-db` uma vez para criar as tabelas

### Variáveis de Ambiente no Vercel

As seguintes variáveis são configuradas automaticamente ao provisionar Postgres no Vercel:

```
POSTGRES_URL, DATABASE_URL, DATABASE_URL_UNPOOLED
PGHOST, PGHOST_UNPOOLED, PGUSER, PGDATABASE, PGPASSWORD
```

Adicionalmente, configure manualmente:
```
VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN, ...
MERCADO_PAGO_ACCESS_TOKEN (para pagamentos em produção)
```

## 📦 Estrutura do Projeto

```
m-martin/
├── api/                         # 🆕 Vercel Serverless Functions (Backend)
│   ├── init-db.js               # Criação de tabelas PostgreSQL
│   ├── seed-data.js             # Dados iniciais (sofás, almofadas, categorias)
│   ├── products.js              # CRUD de produtos
│   ├── stock.js                 # Gestão de estoque
│   ├── orders.js                # Pedidos com transações atômicas
│   ├── cushion-kit.js           # Config do kit de almofadas
│   ├── settings.js              # Key-value store (categorias, config)
│   └── payment.js               # Integração Mercado Pago
│
├── src/
│   ├── components/              # Componentes da loja
│   │   ├── Header.jsx           # Navegação com carrinho e perfil
│   │   ├── Hero.jsx             # Banner principal com CTAs
│   │   ├── AuthDialog.jsx       # 🆕 Login/logout guest-first
│   │   ├── CategorySection.jsx  # Seções de categorias
│   │   ├── ProductCard.jsx      # Cards com efeito glassmorphism
│   │   ├── CushionKitBanner.jsx # Banner do kit de almofadas com vídeo
│   │   ├── PillowBanner.jsx     # Banner de travesseiros
│   │   ├── CushionKitSelector.jsx # Seletor interativo de cores
│   │   ├── CheckoutDialog.jsx   # Checkout em 3 etapas
│   │   ├── PaymentMethodSelector.jsx # Seletor de método de pagamento
│   │   ├── CartDialog.jsx       # Carrinho de compras
│   │   ├── SettingsDialog.jsx   # Configurações de exibição
│   │   ├── LoyaltyProgramBanner.jsx # Programa de fidelidade
│   │   ├── TestimonialsSection.jsx  # Depoimentos de clientes
│   │   ├── NewsletterSignup.jsx # Cadastro de newsletter
│   │   ├── Login.jsx            # Página de login (Firebase Auth)
│   │   └── PrivateRoute.jsx     # Proteção de rotas admin
│   ├── admin/                   # Painel administrativo
│   │   ├── AdminRoutes.jsx      # Rotas do admin
│   │   ├── context/
│   │   │   └── AdminContext.jsx # 🆕 Estado admin via PostgreSQL
│   │   ├── pages/
│   │   │   ├── DashboardPage.jsx     # Dashboard com KPIs
│   │   │   ├── ProductsPage.jsx      # CRUD de produtos
│   │   │   ├── StockPage.jsx         # Controle de estoque
│   │   │   ├── OrdersPage.jsx        # Gestão de pedidos
│   │   │   ├── CushionKitPage.jsx    # Gestão do kit de almofadas
│   │   │   └── PaymentSettingsPage.jsx # Config. de pagamentos
│   │   └── components/
│   │       ├── AdminLayout.jsx       # Layout com menu lateral
│   │       └── ImagePasteArea.jsx    # Upload de imagens via paste
│   ├── context/                 # Gerenciamento de estado
│   │   ├── AuthContext.jsx      # Autenticação Firebase
│   │   ├── CartContext.jsx      # Carrinho de compras
│   │   └── UserContext.jsx      # 🆕 Perfil e config via PostgreSQL
│   ├── services/                # Serviços
│   │   ├── dbService.js         # 🆕 Cliente HTTP para API routes
│   │   ├── orderService.ts      # Criação de pedidos
│   │   └── paymentService.ts    # Processamento de pagamentos
│   ├── config/
│   │   └── firebase.js          # Firebase (apenas Auth)
│   ├── data/
│   │   └── products.js          # Dados estáticos de fallback
│   ├── App.jsx                  # Componente principal da loja
│   └── main.jsx                 # Entry point com providers e rotas
│
├── vercel.json                  # Config de rewrites para API routes
├── firebase.json                # Config Firebase (legacy/auth)
└── package.json
```

## 🗄️ Banco de Dados — PostgreSQL (Neon)

### Schema (criado por `POST /api/init-db`)

```sql
products    (id TEXT PK, name, category, price, images JSONB, features JSONB, …)
stock       (product_id TEXT PK, quantity INT, min_stock INT)
orders      (id TEXT PK, customer JSONB, items JSONB, status TEXT, …)
cushion_kit (id INT PK DEFAULT 1, config JSONB)   -- single-row
settings    (key TEXT PK, value JSONB)             -- key-value store
```

### API Routes

| Rota | Métodos | Descrição |
|------|---------|-----------|
| `/api/init-db` | POST | Criação de tabelas (executar uma vez) |
| `/api/seed-data` | POST | Popular dados iniciais (idempotente) |
| `/api/products` | GET, POST, PUT, DELETE | CRUD completo de produtos |
| `/api/stock` | GET, PUT | Gestão de estoque por `product_id` |
| `/api/orders` | GET, POST, PUT | Pedidos com transações atômicas |
| `/api/cushion-kit` | GET, POST | Configuração do kit de almofadas |
| `/api/settings` | GET, POST | Key-value store (categorias, config, etc.) |
| `/api/payment` | POST | Integração Mercado Pago |

### Fluxo de Dados

```
mount → fetch da API (PostgreSQL) → atualiza estado + cache localStorage
         ↓ (se DB vazio)
       POST /api/seed-data → popula DB → re-fetch
```

O `localStorage` é usado apenas como cache para carregamento rápido enquanto a API responde. O **PostgreSQL é a fonte de verdade** para todos os dados.

## 🛋️ Categorias de Produtos

1. **Sofás** — Estofados finos para sala de estar (Zeus, Chronos, Roma, RC, Orgânico, Chaise)
2. **Almofadas** — Kit de 5 almofadas com seleção de cores e fibra siliconada 500g
3. **Travesseiros** — Linha premium de conforto
4. **Puffs & Chaise** — Complementos decorativos
5. **Para Acamados** — Linha hospitalar e homecare

## 🔐 Segurança

O projeto implementa segurança em múltiplas camadas:

- **Firebase Authentication** — Login com email/senha para administradores
- **AuthDialog (Guest-First)** — Permite navegar e adicionar ao carrinho sem login
- **Rotas protegidas** — `PrivateRoute` redireciona para `/login` se não autenticado
- **API Routes isoladas** — Toda lógica de banco está no servidor, isolada do cliente
- **Transações SQL** — Controle de estoque atômico via PostgreSQL
- **Rate limiting** — Proteção contra abuso nas APIs
- **Validação server-side** — Preços e regras de negócio validados no backend

> 📖 Documentação completa: [SECURITY_IMPLEMENTATION.md](SECURITY_IMPLEMENTATION.md) · [SETUP_INSTRUCTIONS.md](SETUP_INSTRUCTIONS.md)

## 🔐 Painel Administrativo

Acessível em `/admin` com autenticação via Firebase Auth (email/senha).

### Acesso

1. Crie um usuário admin no Firebase Console → Authentication → Users → Add user
2. Acesse `/login` e faça login com as credenciais criadas
3. Será redirecionado automaticamente para o dashboard
4. Na home, o header mostra ícone de escudo quando autenticado, com botão "Painel Admin"

### Páginas do Admin

| Página | Rota | Descrição |
|--------|------|-----------|
| Dashboard | `/admin` | KPIs: receita total, ticket médio, pedidos pendentes, alertas de estoque |
| Produtos | `/admin/produtos` | CRUD completo com múltiplas imagens, código de barras, fornecedor, preço de custo |
| Estoque | `/admin/estoque` | Controle visual com filtros, incremento/decremento, alertas por nível |
| Pedidos | `/admin/pedidos` | Acompanhamento de status (Pendente → Processando → Enviado → Entregue) |
| Kit Almofadas | `/admin/almofadas` | Gestão de cores, estoque separado por capa/refil, preços individuais |
| Pagamentos | `/admin/pagamentos` | Configuração de Mercado Pago, PIX, WhatsApp, cartão de crédito |

## 💳 Pagamentos

| Método | Status | Descrição |
|--------|--------|-----------|
| WhatsApp | ✅ Implementado | Checkout manual via mensagem formatada |
| Mercado Pago | ✅ Implementado | Checkout completo via API (sandbox e produção) |
| PIX | ✅ Implementado | Pagamento instantâneo com QR code |
| Cartão de Crédito | ✅ Implementado | Via Mercado Pago |

## 📱 Recursos Implementados

### Loja / Catálogo
- ✅ Design responsivo com glassmorphism
- ✅ Animações com Framer Motion (cards, KPIs, transições)
- ✅ Hero section com badges de confiança e CTAs
- ✅ Seletor interativo de cores para kit de almofadas (5 cores)
- ✅ Banner de vídeo para kit de almofadas
- ✅ Banner de travesseiros com vídeo
- ✅ Checkout em 3 etapas (carrinho → dados → pagamento)
- ✅ 4 métodos de pagamento (WhatsApp, Mercado Pago, PIX, cartão)
- ✅ Programa de fidelidade com 4 benefícios
- ✅ Seção de depoimentos de clientes
- ✅ Cadastro de newsletter
- ✅ Navegação mobile otimizada (bottom nav, menu hamburger)
- ✅ SEO: meta tags, Open Graph, schema markup, sitemap
- ✅ AuthDialog guest-first (navega sem login, admin com login)

### Painel Administrativo
- ✅ Autenticação Firebase (email/senha)
- ✅ Dashboard com KPIs e alertas em tempo real
- ✅ CRUD completo de produtos com múltiplas imagens e upload via paste
- ✅ Gestão de estoque com filtros, alertas visuais e controles inline
- ✅ Controle de pedidos com tracking de status
- ✅ Gestão de kit de almofadas (cores, estoque por capa/refil, preços separados)
- ✅ Configuração de gateways de pagamento
- ✅ Layout responsivo com menu drawer para mobile

### Backend / Infraestrutura
- ✅ **Vercel Serverless Functions** — API routes isoladas (`/api/*`)
- ✅ **PostgreSQL (Neon)** — Banco relacional como fonte de verdade
- ✅ **Seed data idempotente** — Upsert de produtos e categorias
- ✅ **Transações atômicas SQL** — Anti-overselling no estoque
- ✅ **Fallback local** — `src/data/products.js` renderiza se DB indisponível
- ✅ Firebase Auth com rotas protegidas e suporte a Guest-First

## 🎨 Tecnologias

| Tecnologia | Versão | Uso |
|------------|--------|-----|
| React | 19 | Framework UI |
| Vite | 7 | Build tool e dev server |
| **Vercel Serverless** | — | **API Routes (backend)** |
| **PostgreSQL (Neon)** | — | **Banco de Dados Relacional** |
| Firebase | 12.9 | Auth (apenas autenticação) |
| Framer Motion | 12 | Animações e transições |
| React Router | 7 | Roteamento SPA |
| Tabler Icons | 3 | Biblioteca de ícones |
| Mercado Pago | — | Gateway de pagamentos |

## 📚 Documentação

| Documento | Descrição |
|-----------|-----------|
| [PROJETO.md](PROJETO.md) | Visão geral do projeto e stack |
| [FIREBASE_SETUP.md](FIREBASE_SETUP.md) | Guia de configuração do Firebase Auth |
| [SETUP_INSTRUCTIONS.md](SETUP_INSTRUCTIONS.md) | Instruções de configuração e checklist |
| [SECURITY_IMPLEMENTATION.md](SECURITY_IMPLEMENTATION.md) | Documentação técnica de segurança |
| [DELIVERABLE_SUMMARY.md](DELIVERABLE_SUMMARY.md) | Resumo das entregas (auth, transações, API) |
| [PROXIMOS_PASSOS.md](PROXIMOS_PASSOS.md) | Plano de próximos passos |

## 📝 Histórico de Evolução

O projeto evoluiu através de **71 pull requests mergeados**, organizados nas seguintes fases:

### Fase 1 — Catálogo e Base (PRs #24–#29)
- Catálogo com design glassmorphism e imagens reais de produtos
- Banner de vídeo para kit de almofadas com seletor de cores
- Conteúdo de marketing premium com branding M'Martin
- Checkout via WhatsApp com persistência no Firestore

### Fase 2 — Segurança e Backend (PRs #30–#36)
- Firestore Security Rules com proteção contra manipulação de preços
- Firebase Auth para painel administrativo
- Transações atômicas de estoque (Firestore transactions)
- Cloud Functions com validação server-side e rate limiting
- Integração Mercado Pago (checkout, PIX, cartão de crédito)
- SEO: meta tags, Open Graph, schema markup, sitemap

### Fase 3 — Admin e UX (PRs #37–#47)
- Conteúdo persuasivo inspirado em marcas premium de estofados
- UX de checkout refinado (grid 2 colunas, correção de cores)
- Gestão avançada de estoque com integração kit de almofadas
- Formulário de produto estilo ERP (2 colunas, campos de negócio)
- Preços separados para capas e refis de almofadas
- Retenção de clientes (fidelidade, depoimentos, newsletter)
- Upload de imagens com paste e preview
- Navegação mobile otimizada (bottom nav, 9:16)

### Fase 4 — Polimento Visual (PRs #48–#52)
- Padronização da paleta de cores da marca (marrom/dourado)
- Redesign do programa de fidelidade (layout 2 colunas)
- Modernização do admin com animações Framer Motion

### Fase 5 — Migração Firebase → Vercel Serverless (PRs #63–#71) 🆕
A maior mudança arquitetural do projeto: **substituição completa do Firebase Firestore por Vercel Serverless Functions + PostgreSQL (Neon)**.

| PR | Mudança |
|----|---------|
| #64 | **Persistência Vercel Postgres**: API routes para products, stock, orders, settings, cushion-kit. Schema SQL com `init-db`. `dbService.js` como cliente HTTP |
| #65 | Variáveis de ambiente Neon completas no `.env.example` |
| #66 | Substituição de todos os mock data por CRUD PostgreSQL-backed |
| #67 | Sofa images movidas para `public/assets/`, seed com upsert |
| #68 | Fix de seed quando categorias já existem mas products está vazio |
| #69 | AuthDialog guest-first na home, upsert universal no seed |
| #70 | Cleanup de seed data e API handlers com respostas graceful |
| #71 | Fix de image paths (Vite bundled → static public paths) |
| #63 | Settings de exibição da home acessíveis sem auth |

---

## 📄 Licença

© 2026 M'Martin Estofados Finos. Todos os direitos reservados.
