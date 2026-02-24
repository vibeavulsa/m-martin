# M'Martin - Estofados Finos

E-commerce moderno para estofados finos, com catálogo interativo, painel administrativo completo, checkout integrado e segurança de nível produção. Desenvolvido com React 19, Firebase e Cloud Functions.

## 📋 Informações do Projeto

- **Nome:** M'Martin Estofados Finos
- **ID do Projeto Firebase:** m-martin-estofados
- **Tecnologias:** React 19, Vite 7, Vercel Postgres, Firebase (Auth, Cloud Functions, Storage), Framer Motion, Mercado Pago
- **Plataformas de Deploy:** Firebase Hosting, Vercel, Netlify

## 🚀 Como Executar

### Pré-requisitos
- Node.js (versão 18 ou superior)
- npm
- Conta Firebase com projeto configurado

### Instalação

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Edite o arquivo .env com suas credenciais do Firebase
# Obtenha as credenciais no Firebase Console: Project Settings > General > Your apps
```

> **⚠️ CONFIGURAÇÃO OBRIGATÓRIA**: Antes de executar o projeto, configure o arquivo `.env` com suas credenciais Firebase reais. Sem isso, ocorrerão erros como `auth/api-key-not-valid`. Veja [FIREBASE_SETUP.md](FIREBASE_SETUP.md) para detalhes.

### Desenvolvimento

```bash
npm run dev
# O aplicativo estará disponível em http://localhost:5173
```

### Build para Produção

```bash
npm run build
npm run preview
```

## 🚀 Deploy

O projeto está configurado para deploy em múltiplas plataformas:

### Firebase Hosting

```bash
npm install -g firebase-tools
firebase login
npm run build
firebase deploy
```

O arquivo `firebase.json` já está configurado com reescritas de rota para SPA e cache de assets.

### Vercel

```bash
npm install -g vercel
vercel
```

Ou conecte o repositório no [Vercel](https://vercel.com) — a configuração é detectada automaticamente via `vercel.json`.

### Netlify

```bash
npm install -g netlify-cli
npm run build
netlify deploy --prod
```

Ou conecte o repositório no [Netlify](https://netlify.com) com build command `npm run build` e publish directory `dist`.

## 📦 Estrutura do Projeto

```
src/
├── components/              # Componentes da loja
│   ├── Header.jsx           # Navegação com carrinho e perfil
│   ├── Hero.jsx             # Banner principal com CTAs
│   ├── CategorySection.jsx  # Seções de categorias
│   ├── ProductCard.jsx      # Cards com efeito glassmorphism
│   ├── CushionKitBanner.jsx # Banner do kit de almofadas com vídeo
│   ├── CushionKitSelector.jsx # Seletor interativo de cores
│   ├── CheckoutDialog.jsx   # Checkout em 3 etapas
│   ├── PaymentMethodSelector.jsx # Seletor de método de pagamento
│   ├── CartDialog.jsx       # Carrinho de compras
│   ├── LoyaltyProgramBanner.jsx # Programa de fidelidade
│   ├── TestimonialsSection.jsx  # Depoimentos de clientes
│   ├── NewsletterSignup.jsx # Cadastro de newsletter
│   ├── Login.jsx            # Página de login (Firebase Auth)
│   └── PrivateRoute.jsx     # Proteção de rotas admin
├── admin/                   # Painel administrativo
│   ├── AdminRoutes.jsx      # Rotas do admin
│   ├── pages/
│   │   ├── DashboardPage.jsx     # Dashboard com KPIs
│   │   ├── ProductsPage.jsx      # CRUD de produtos
│   │   ├── StockPage.jsx         # Controle de estoque
│   │   ├── OrdersPage.jsx        # Gestão de pedidos
│   │   ├── CushionKitPage.jsx    # Gestão do kit de almofadas
│   │   └── PaymentSettingsPage.jsx # Config. de pagamentos
│   └── components/
│       ├── AdminLayout.jsx       # Layout com menu lateral
│       └── ImagePasteArea.jsx    # Upload de imagens via paste
├── context/                 # Gerenciamento de estado
│   ├── AuthContext.jsx      # Autenticação Firebase
│   ├── CartContext.jsx      # Carrinho de compras
│   └── UserContext.jsx      # Perfil e configurações do usuário
├── services/                # Serviços backend
│   ├── orderService.ts      # Criação de pedidos via Cloud Functions
│   └── paymentService.ts    # Processamento de pagamentos
├── config/
│   └── firebase.js          # Inicialização do Firebase
├── data/                    # Dados estáticos de fallback
├── hooks/                   # Custom hooks
├── App.jsx                  # Componente principal da loja
└── main.jsx                 # Entry point com providers e rotas

functions/                   # Firebase Cloud Functions
└── src/
    └── index.ts             # createOrder + processPayment
```

## 🛋️ Categorias de Produtos

1. **Sofás** — Estofados finos para sala de estar
2. **Almofadas** — Kit de 5 almofadas com seleção de cores e fibra siliconada 500g
3. **Travesseiros** — Linha premium de conforto
4. **Puffs & Chaise** — Complementos decorativos
5. **Para Acamados** — Linha hospitalar e homecare

## 🔐 Painel Administrativo

Acessível em `/admin` com autenticação via Firebase Auth (email/senha).

### Acesso

1. Crie um usuário admin no Firebase Console → Authentication → Users → Add user
2. Acesse `/login` e faça login com as credenciais criadas
3. Será redirecionado automaticamente para o dashboard

> 📖 Para instruções detalhadas, veja [FIREBASE_SETUP.md](FIREBASE_SETUP.md)

### Páginas do Admin

| Página | Rota | Descrição |
|--------|------|-----------|
| Dashboard | `/admin` | KPIs: total de produtos, valor em estoque, pedidos, alertas de estoque baixo |
| Produtos | `/admin/produtos` | CRUD completo com múltiplas imagens, código de barras, fornecedor, preço de custo |
| Estoque | `/admin/estoque` | Controle visual com filtros, incremento/decremento, alertas por nível |
| Pedidos | `/admin/pedidos` | Acompanhamento de status (Pendente → Processando → Enviado → Entregue) |
| Kit Almofadas | `/admin/almofadas` | Gestão de cores, estoque separado por capa/refil, preços individuais |
| Pagamentos | `/admin/pagamentos` | Configuração de Mercado Pago, PIX, WhatsApp, cartão de crédito |

## 🔒 Segurança

O projeto implementa múltiplas camadas de segurança:

- **Firebase Authentication** — Login com email/senha para administradores
- **Rotas protegidas** — `PrivateRoute` redireciona para `/login` se não autenticado
- **Validação no Servidor** — Preços e regras de negócio validados em rotas de API server-side
- **Transações Atômicas** — Controle de estoque através do Vercel Postgres
- **Rate limiting** — Proteção contra abuso nas APIs
- **Autenticação Guest-First** — Permite adição ao carrinho sem login, unificando os dados automaticamente após a autenticação

> 📖 Documentação completa: [SECURITY_IMPLEMENTATION.md](SECURITY_IMPLEMENTATION.md) · [FIRESTORE_SECURITY.md](FIRESTORE_SECURITY.md) · [SETUP_INSTRUCTIONS.md](SETUP_INSTRUCTIONS.md)

## 💳 Pagamentos

Métodos de pagamento integrados:

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
- ✅ Checkout em 3 etapas (carrinho → dados → pagamento)
- ✅ 4 métodos de pagamento (WhatsApp, Mercado Pago, PIX, cartão)
- ✅ Programa de fidelidade com 4 benefícios
- ✅ Seção de depoimentos de clientes
- ✅ Cadastro de newsletter
- ✅ Navegação mobile otimizada (bottom nav, menu hamburger)
- ✅ SEO: meta tags, Open Graph, schema markup, sitemap

### Painel Administrativo
- ✅ Autenticação Firebase (email/senha)
- ✅ Dashboard com KPIs e alertas em tempo real
- ✅ CRUD completo de produtos com múltiplas imagens e upload via paste
- ✅ Gestão de estoque com filtros, alertas visuais e controles inline
- ✅ Controle de pedidos com tracking de status
- ✅ Gestão de kit de almofadas (cores, estoque por capa/refil, preços separados)
- ✅ Configuração de gateways de pagamento
- ✅ Layout responsivo com menu drawer para mobile

### Backend / Segurança
- ✅ Vercel Postgres API Routes (CRUD completo isolado do cliente)
- ✅ Validação de preços server-side e processamento de checkout
- ✅ Transações atômicas de estoque via Postgres
- ✅ Rate limiting por IP nas APIs
- ✅ Firebase Auth com rotas protegidas e suporte a Guest-First

## 🎨 Tecnologias

| Tecnologia | Versão | Uso |
|------------|--------|-----|
| React | 19 | Framework UI |
| Vite | 7 | Build tool e dev server |
| Vercel Postgres | — | Banco de Dados Relacional Primário |
| Firebase | 12.9 | Auth, Cloud Functions, Storage |
| Framer Motion | 12 | Animações e transições |
| React Router | 7 | Roteamento SPA |
| Tabler Icons | 3 | Biblioteca de ícones |
| Mercado Pago | — | Gateway de pagamentos |

## 📚 Documentação

| Documento | Descrição |
|-----------|-----------|
| [FIREBASE_SETUP.md](FIREBASE_SETUP.md) | Guia passo-a-passo de configuração do Firebase |
| [SETUP_INSTRUCTIONS.md](SETUP_INSTRUCTIONS.md) | Instruções de configuração e checklist de implantação |
| [SECURITY_IMPLEMENTATION.md](SECURITY_IMPLEMENTATION.md) | Documentação técnica de autenticação, transações e segurança |
| [FIRESTORE_SECURITY.md](FIRESTORE_SECURITY.md) | Regras de segurança do Firestore com testes práticos |
| [DELIVERABLE_SUMMARY.md](DELIVERABLE_SUMMARY.md) | Resumo das entregas do núcleo de segurança |
| [PROXIMOS_PASSOS.md](PROXIMOS_PASSOS.md) | Plano de próximos passos e evolução do projeto |

## 📝 Histórico de Evolução

O projeto evoluiu através de **28 pull requests mergeados**, organizados nas seguintes fases:

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

### Fase 5 — Arquitetura e Performance (PRs Recentes)
- Migração completa para **Vercel Postgres** (substituindo Firestore)
- Fluxo de checkout **Guest-First** com unificação automática de carrinho
- Otimização de assets estáticos e melhorias de build no Vite

---

## 📄 Licença

© 2026 M'Martin Estofados Finos. Todos os direitos reservados.
