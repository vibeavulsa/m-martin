# M'Martin - Catálogo Moderno de Estofados

## Resumo do Projeto

E-commerce completo para M'Martin Estofados Finos, com catálogo interativo, painel administrativo, checkout multi-pagamento e segurança de nível produção. Backend totalmente serverless via **Vercel Serverless Functions + PostgreSQL (Neon)**.

## Informações do Cliente

- **Nome do Projeto:** M'Martin Estofados Finos
- **URL de Produção:** [m-martin.vercel.app](https://m-martin.vercel.app)
- **Plataforma de Deploy:** Vercel

## Stack Tecnológico

### Frontend
- **React 19** — Framework JavaScript moderno
- **Vite 7** — Build tool ultrarrápido
- **Framer Motion 12** — Animações e transições fluidas
- **React Router 7** — Roteamento SPA
- **@tabler/icons-react** — Biblioteca de ícones profissionais

### Styling
- CSS modular por componente
- Glassmorphism
- Gradientes e animações CSS
- Design responsivo mobile-first
- Paleta da marca: marrom e dourado

### Backend — Vercel Serverless + PostgreSQL (Neon) 🆕
- **Vercel Serverless Functions** (`/api/*`) — API routes isoladas para toda lógica de dados
- **PostgreSQL (Neon)** — Banco de dados relacional como fonte de verdade
- **`@vercel/postgres`** — Client SQL para conexão com Neon
- **Transações SQL atômicas** — Controle de estoque anti-overselling

> ⚠️ **Nota sobre Firebase:** O projeto **não usa mais Firestore** como banco de dados. O Firebase é mantido **apenas para autenticação** (Firebase Auth). Toda persistência de dados (produtos, estoque, pedidos, configurações) foi migrada para PostgreSQL via API routes serverless.

### Autenticação
- **Firebase Auth** — Login por email/senha para administradores
- **AuthDialog** — Componente guest-first na home page

### Pagamentos
- **Mercado Pago** — Checkout, PIX, cartão de crédito
- **WhatsApp** — Checkout manual via mensagem formatada

## API Routes Serverless

| Rota | Descrição |
|------|-----------|
| `POST /api/init-db` | Criação de tabelas no PostgreSQL |
| `POST /api/seed-data` | Seed idempotente (sofás, almofadas, categorias) |
| `/api/products` | CRUD completo — tabela `products` |
| `/api/stock` | Upsert por `product_id` — tabela `stock` |
| `/api/orders` | CRUD com transações atômicas — tabela `orders` |
| `/api/cushion-kit` | GET/POST single-row config — tabela `cushion_kit` |
| `/api/settings` | Key-value store — tabela `settings` |
| `/api/payment` | Integração Mercado Pago |

### Schema PostgreSQL

```sql
products    (id TEXT PK, name, category, price, images JSONB, features JSONB, …)
stock       (product_id TEXT PK, quantity INT, min_stock INT)
orders      (id TEXT PK, customer JSONB, items JSONB, status TEXT, …)
cushion_kit (id INT PK DEFAULT 1, config JSONB)
settings    (key TEXT PK, value JSONB)
```

## Estrutura do Catálogo

### 1. Sofás
- 6 modelos premium: Zeus, Chronos, Roma, RC, Orgânico, Chaise
- Configurador de tecidos com opções de cores

### 2. Almofadas (Kit de 5 unidades)
- Kit com seleção interativa de 8 cores
- Tecido Oxford premium, fibra siliconada 500g
- Preços separados para capas e refis

### 3. Travesseiros
- Linha premium (viscoelástico, plumas, cervical)

### 4. Puffs & Chaise
- Complementos decorativos para sala

### 5. Para Acamados (Hospitalar)
- Colchões, travesseiros e kits hospitalares

## Componentes Implementados

### Loja
- **Header** — Navegação por categorias, carrinho, perfil de usuário, configurações
- **Hero** — Banner com badges de confiança, CTAs, animações
- **AuthDialog** — 🆕 Login/logout guest-first no header
- **CushionKitBanner** — Vídeo do kit de almofadas com overlay interativo
- **PillowBanner** — Banner de travesseiros com vídeo
- **CushionKitSelector** — Seletor visual de 5 cores para montar o kit
- **ProductCard** — Cards com glassmorphism, imagens, preço, botão consultar
- **CheckoutDialog** — Checkout em 3 etapas (carrinho → dados → pagamento)
- **PaymentMethodSelector** — Seleção entre WhatsApp, Mercado Pago, PIX, cartão
- **SettingsDialog** — Configurações de exibição da home page
- **LoyaltyProgramBanner** — Programa de fidelidade com 4 benefícios
- **TestimonialsSection** — 4 depoimentos de clientes com avaliação 5 estrelas
- **NewsletterSignup** — Cadastro com nome e email

### Admin
- **DashboardPage** — KPIs animados (receita, ticket médio, pedidos pendentes), alertas de estoque
- **ProductsPage** — CRUD completo com upload de múltiplas imagens via paste
- **StockPage** — Controle visual com barras de progresso, filtros, alertas
- **OrdersPage** — Tracking de status (Pendente → Processando → Enviado → Entregue)
- **CushionKitPage** — Gestão de cores, estoque por capa/refil, preços individuais
- **PaymentSettingsPage** — Configuração de Mercado Pago (sandbox/produção), PIX, WhatsApp

### Backend / Serviços
- **`api/*.js`** — 🆕 Serverless Functions com CRUD PostgreSQL completo
- **`dbService.js`** — 🆕 Cliente HTTP para comunicação com API routes
- **`orderService.ts`** — Lógica de criação de pedidos
- **`paymentService.ts`** — Integração com Mercado Pago

## Funcionalidades Implementadas

### Loja
✅ Design glassmorphism responsivo (mobile, tablet, desktop)
✅ Animações com Framer Motion (stagger, transições, hover)
✅ Kit de almofadas interativo com seletor de cores
✅ Checkout em 3 etapas com 4 métodos de pagamento
✅ Persistência de pedidos no PostgreSQL via API
✅ Autenticação guest-first (navega sem login)
✅ Configurações de exibição da home acessíveis a todos
✅ Programa de fidelidade e depoimentos
✅ Newsletter com feedback visual
✅ SEO: meta tags, Open Graph, schema markup, sitemap
✅ Navegação mobile otimizada (bottom nav, drawer)

### Admin
✅ Autenticação Firebase (email/senha)
✅ Dashboard com KPIs e alertas em tempo real
✅ CRUD de produtos com múltiplas imagens e campos ERP
✅ Gestão de estoque com filtros e controles inline
✅ Tracking de pedidos com atualização de status
✅ Kit de almofadas: cores, estoque capa/refil, preços separados
✅ Configuração de gateways de pagamento
✅ Layout responsivo com menu drawer mobile

### Segurança & Infraestrutura
✅ Vercel Serverless Functions — API isolada do cliente
✅ PostgreSQL (Neon) — Banco relacional como fonte de verdade
✅ Transações SQL atômicas — Anti-overselling de estoque
✅ Firebase Auth com PrivateRoute
✅ Validação de preços no servidor (anti-fraude)
✅ Rate limiting nas APIs
✅ Seed data idempotente com upsert
✅ Fallback local para quando DB está indisponível

## Deploy

O projeto está otimizado para deploy na **Vercel**:

```bash
npm run build
# Gera pasta dist/ com arquivos otimizados
# API routes em /api/ são deployadas como serverless functions
```

## Próximos Passos

Veja o plano completo em [PROXIMOS_PASSOS.md](PROXIMOS_PASSOS.md).

## Documentação

| Documento | Descrição |
|-----------|-----------|
| [README.md](README.md) | Visão geral, instalação e estrutura |
| [FIREBASE_SETUP.md](FIREBASE_SETUP.md) | Configuração do Firebase Auth |
| [SETUP_INSTRUCTIONS.md](SETUP_INSTRUCTIONS.md) | Checklist de implantação |
| [SECURITY_IMPLEMENTATION.md](SECURITY_IMPLEMENTATION.md) | Documentação técnica de segurança |
| [DELIVERABLE_SUMMARY.md](DELIVERABLE_SUMMARY.md) | Resumo das entregas |
| [PROXIMOS_PASSOS.md](PROXIMOS_PASSOS.md) | Plano de próximos passos |

---
**Desenvolvido com 💜 para M'Martin Estofados Finos**
