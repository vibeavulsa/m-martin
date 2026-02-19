# M'Martin - Catálogo Moderno de Estofados

## Resumo do Projeto

E-commerce completo para M'Martin Estofados Finos, com catálogo interativo, painel administrativo, checkout multi-pagamento e segurança de nível produção.

## Informações do Cliente

- **Nome do Projeto:** M'Martin Estofados Finos
- **ID do Projeto:** m-martin-estofados
- **Número do Projeto:** 178643218861
- **Plataforma:** Firebase (Auth, Firestore, Cloud Functions, Storage)

## Stack Tecnológico

### Frontend
- **React 19** — Framework JavaScript moderno
- **Vite 7** — Build tool ultrarrápido
- **Framer Motion 12** — Animações e transições fluidas
- **React Router 7** — Roteamento SPA
- **@tabler/icons-react** — Biblioteca de ícones profissionais

### Styling
- CSS modular por componente
- Glassmorphism (liquid-glass-react)
- Gradientes e animações CSS
- Design responsivo mobile-first
- Paleta da marca: marrom e dourado

### Backend
- **Firebase Auth** — Autenticação por email/senha
- **Firestore** — Banco de dados em tempo real
- **Cloud Functions** — Lógica server-side (pedidos, pagamentos)
- **Firebase Storage** — Armazenamento de imagens

### Pagamentos
- **Mercado Pago** — Checkout, PIX, cartão de crédito
- **WhatsApp** — Checkout manual via mensagem formatada

## Estrutura do Catálogo

### 1. Sofás
- Sofás Premium, Retrátil, Modular e variações

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
- **CushionKitBanner** — Vídeo do kit de almofadas com overlay interativo
- **CushionKitSelector** — Seletor visual de 5 cores para montar o kit
- **ProductCard** — Cards com glassmorphism, imagens, preço, botão consultar
- **CheckoutDialog** — Checkout em 3 etapas (carrinho → dados → pagamento)
- **PaymentMethodSelector** — Seleção entre WhatsApp, Mercado Pago, PIX, cartão
- **LoyaltyProgramBanner** — Programa de fidelidade com 4 benefícios
- **TestimonialsSection** — 4 depoimentos de clientes com avaliação 5 estrelas
- **NewsletterSignup** — Cadastro com nome e email

### Admin
- **DashboardPage** — KPIs animados, alertas de estoque baixo, pedidos recentes
- **ProductsPage** — CRUD completo com upload de múltiplas imagens via paste
- **StockPage** — Controle visual com barras de progresso, filtros, alertas
- **OrdersPage** — Tracking de status (Pendente → Processando → Enviado → Entregue)
- **CushionKitPage** — Gestão de cores, estoque por capa/refil, preços individuais
- **PaymentSettingsPage** — Configuração de Mercado Pago (sandbox/produção), PIX, WhatsApp

### Backend
- **createOrder** (Cloud Function) — Validação de preços server-side, transação atômica de estoque
- **processPayment** (Cloud Function) — Integração Mercado Pago, PIX, cartão de crédito
- **Firestore Rules** — Proteção por coleção contra manipulação de preços e dados

## Funcionalidades Implementadas

### Loja
✅ Design glassmorphism responsivo (mobile, tablet, desktop)
✅ Animações com Framer Motion (stagger, transições, hover)
✅ Kit de almofadas interativo com seletor de cores
✅ Checkout em 3 etapas com 4 métodos de pagamento
✅ Persistência de pedidos no Firestore
✅ Programa de fidelidade e depoimentos
✅ Newsletter com feedback visual
✅ SEO: meta tags, Open Graph, schema markup, sitemap
✅ Navegação mobile otimizada (bottom nav, drawer)

### Admin
✅ Autenticação Firebase (email/senha)
✅ Dashboard com 6 KPIs e alertas em tempo real
✅ CRUD de produtos com múltiplas imagens e campos ERP
✅ Gestão de estoque com filtros e controles inline
✅ Tracking de pedidos com atualização de status
✅ Kit de almofadas: cores, estoque capa/refil, preços separados
✅ Configuração de gateways de pagamento
✅ Layout responsivo com menu drawer mobile

### Segurança
✅ Firebase Auth com PrivateRoute
✅ Cloud Functions com rate limiting (5 req/min/IP)
✅ Validação de preços no servidor (anti-fraude)
✅ Transações atômicas de estoque (anti-overselling)
✅ Firestore Security Rules por coleção
✅ Proteção contra manipulação de preços (`affectedKeys`)

## Deploy

O projeto está pronto para deploy em:
- Firebase Hosting
- Vercel
- Netlify

```bash
npm run build
# Gera pasta dist/ com arquivos otimizados
```

## Próximos Passos

Veja o plano completo em [PROXIMOS_PASSOS.md](PROXIMOS_PASSOS.md).

## Documentação

| Documento | Descrição |
|-----------|-----------|
| [README.md](README.md) | Visão geral, instalação e estrutura |
| [FIREBASE_SETUP.md](FIREBASE_SETUP.md) | Configuração do Firebase passo-a-passo |
| [SETUP_INSTRUCTIONS.md](SETUP_INSTRUCTIONS.md) | Checklist de implantação |
| [SECURITY_IMPLEMENTATION.md](SECURITY_IMPLEMENTATION.md) | Documentação técnica de segurança |
| [FIRESTORE_SECURITY.md](FIRESTORE_SECURITY.md) | Regras do Firestore com testes |
| [PROXIMOS_PASSOS.md](PROXIMOS_PASSOS.md) | Plano de próximos passos |

---
**Desenvolvido com 💜 para M'Martin Estofados Finos**
