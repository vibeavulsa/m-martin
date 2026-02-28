# 📋 Plano de Próximos Passos — M'Martin Estofados

Este documento apresenta o plano de evolução do projeto, organizado por prioridade e baseado na análise dos **71 pull requests mergeados** e no estado atual do código.

> **Nota:** O projeto migrou de Firebase Firestore para **Vercel Serverless Functions + PostgreSQL (Neon)** na Fase 5. Toda persistência de dados agora é feita via API routes serverless. O Firebase é usado apenas para autenticação.

---

## 🔴 Prioridade Alta — Segurança para Produção

Itens obrigatórios antes de ir para produção.

### 1. Implementar verificação de Admin nas API Routes
**Status atual:** As rotas `/api/*` não validam o token JWT do Firebase Auth. Qualquer pessoa pode chamar `POST /api/products` e criar produtos.
**Ação:**
- Adicionar middleware de autenticação nas Serverless Functions
- Validar header `Authorization: Bearer <token>` usando `firebase-admin` SDK
- Verificar se o email do token pertence a um admin autorizado
- Exemplo:
```javascript
import { getAuth } from "firebase-admin/auth";

export default async function handler(req, res) {
   const authHeader = req.headers.authorization;
   if (!authHeader?.startsWith('Bearer ')) {
       return res.status(401).json({ error: 'Não autorizado' });
   }
   const token = authHeader.split('Bearer ')[1];
   const decoded = await getAuth().verifyIdToken(token);
   if (decoded.email !== 'admin@mmartin.com') {
       return res.status(403).json({ error: 'Acesso negado' });
   }
   // ... prosseguir com a lógica
}
```

### 2. Monitoramento e Otimização do PostgreSQL (Neon)
**Status atual:** Toda a lógica de gestão de estoque e pedidos está no PostgreSQL via transações SQL.
**Ação:**
- Testar sob estresse as conexões do banco de dados (pool limit do Neon)
- Criar índices SQL (`CREATE INDEX`) para acelerar consultas de catálogo
- Monitorar uso do free tier do Neon (compute hours, storage)
- Configurar alertas para erros de conexão

### 3. Validação completa de pedidos no servidor
**Status atual:** A rota `/api/orders` valida preços e realiza transação atômica de estoque, mas inputs do cliente (email, telefone, endereço) não são sanitizados rigorosamente.
**Ação:**
- Implementar sanitização de inputs no backend
- Adicionar logging robusto de tentativas inválidas
- Validar formato de email, telefone e endereço

### 4. Configurar ambientes separados (dev/staging/produção)
**Status atual:** Vercel permite configurar variáveis `.env` independentes por ambiente.
**Ação:**
- Cadastrar `MERCADO_PAGO_ACCESS_TOKEN` separado para Preview vs Produção
- Separar chaves sandbox e produção do Mercado Pago
- Configurar banco de dados separado para Preview deployments (branch databases no Neon)

---

## 🟡 Prioridade Média — Funcionalidades de Negócio

### ~~5. Sistema de busca e filtros~~ ✅
**Status atual:** Concluído. API suporta filtro por query `%termo%`. Frontend possui barra de busca na Header, Toolbar de filtros por categoria, faixa de preço e ordenação ascendente/descendente.

### 6. Histórico de pedidos para o cliente
**Status atual:** Clientes não conseguem ver seus pedidos.
**Ação:**
- Adicionar `user_id` aos pedidos (quando autenticado)
- Criar página "Meus Pedidos" com tracking de status
- API route `/api/orders?userId=...` com filtro
- Notificação por email quando status muda

### 7. Integrar newsletter com serviço de email
**Status atual:** Cadastro de newsletter salva apenas no frontend.
**Ação:**
- Integrar com SendGrid ou Resend via API route
- Salvar inscrições na tabela `settings` ou nova tabela `newsletter_subscribers`
- Email de boas-vindas automático
- Opção de cancelar inscrição

### ~~8. Sistema de avaliações de produtos~~ ✅
**Status atual:** Concluído. Tabela `reviews` criada. CRUD em `/api/reviews`. Integrado na página de produto (`ProductReviews.jsx`) e moderado no painel Admin (`ReviewsPage.jsx`).

### 9. Gestão de cupons e promoções
**Status atual:** Não existe sistema de descontos.
**Ação:**
- Criar tabela `coupons` no PostgreSQL
- Validar cupons na API route `/api/orders`
- Campo de cupom no checkout
- Página de gestão de cupons no admin

### ~~10. Notificações de pedidos~~ ✅
**Status atual:** Concluído. O arquivo `/api/_lib/notifications.js` lida com as notificações por email (cliente), webhook ou WhatsApp para admin.
**Ação:**
- Email de confirmação via SendGrid/Resend incorporado no `api/orders.js`.
- Notificações de atualização de status implementadas.

---

## 🟢 Prioridade Baixa — Melhorias de UX e Infraestrutura

### 11. Testes automatizados
**Ação:**
- Vitest para testes unitários
- Testes para API routes (products, orders, stock)
- Testes para contextos (CartContext, AdminContext)
- E2E com Playwright para fluxo de checkout

### ~~12. Performance e otimização~~ ✅
**Status atual:** Concluído.
**Ação:**
- Lazy loading com `React.lazy + Suspense` no Painel Admin finalizado.
- `loading="lazy"` adicionado em imagens via `ProductCard`.
- Code splitting implementado via `manualChunks` no `vite.config.js`.
- Service Worker registrado (cache offline e cache prioritário na API/Imagens) usando `vite-plugin-pwa`.

### 13. Analytics e monitoramento
**Ação:**
- Eventos de e-commerce (view_item, add_to_cart, purchase)
- Google Analytics 4 com conversões
- Monitoramento de erros com Sentry
- Dashboard de métricas de negócio

### 14. Programa de fidelidade funcional
**Status atual:** Banner exibe benefícios mas sem lógica.
**Ação:**
- Tabela `loyalty_points` no PostgreSQL
- Acumular pontos por compra
- Resgate como desconto
- Níveis (Bronze, Prata, Ouro)

### 15. PWA (Progressive Web App)
**Ação:**
- manifest.json e Service Worker
- Ícones para home screen
- Suporte offline para catálogo
- Push notifications

### 16. Integração com ERP/estoque físico
**Ação:**
- API de sincronização com ERP
- Webhooks bidirecionais de estoque
- Importação/exportação CSV

---

## 📊 Resumo por Fase

| Fase | Itens | Foco |
|------|-------|------|
| **Fase 1** (Imediato) | #1, #2, #3, #4 | Segurança para produção |
| **Fase 2** (Curto prazo) | #5, #6, #7, #10 | Funcionalidades essenciais |
| **Fase 3** (Médio prazo) | #8, #9, #11, #12 | Crescimento e qualidade |
| **Fase 4** (Longo prazo) | #13, #14, #15, #16 | Escala e maturidade |

---

## ✅ Já Implementado (Referência)

Funcionalidades completadas nos 71 PRs:

### Catálogo & UX
- ✅ Catálogo com glassmorphism e imagens reais
- ✅ Kit de almofadas interativo com seletor de cores
- ✅ Checkout em 3 etapas (carrinho → dados → pagamento)
- ✅ 4 métodos de pagamento (WhatsApp, Mercado Pago, PIX, cartão)
- ✅ CRUD de produtos com múltiplas imagens
- ✅ Gestão de estoque com alertas visuais
- ✅ Tracking de pedidos
- ✅ Gestão de kit de almofadas (cores, capas, refis)
- ✅ Configuração de gateways de pagamento
- ✅ SEO (meta tags, Open Graph, schema, sitemap)
- ✅ Animações Framer Motion no admin
- ✅ Navegação mobile otimizada
- ✅ Paleta de marca padronizada (marrom/dourado)

### Infraestrutura (Migração Serverless) 🆕
- ✅ **Vercel Serverless Functions** — API routes para products, stock, orders, settings
- ✅ **PostgreSQL (Neon)** — Banco relacional com transações SQL
- ✅ **Seed data idempotente** — Upsert de produtos e categorias
- ✅ **dbService.js** — Cliente HTTP (substituiu Firebase SDK)
- ✅ **AuthDialog guest-first** — Navega sem login, admin com login
- ✅ **Fallback local** — Renderiza dados estáticos se DB indisponível
- ✅ **Settings via PostgreSQL** — Categorias, config, exibição da home

---

**Última atualização:** 27 de Fevereiro de 2026
