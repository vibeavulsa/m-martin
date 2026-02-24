# 📋 Plano de Próximos Passos — M'Martin Estofados

Este documento apresenta o plano de evolução do projeto, organizado por prioridade e baseado na análise dos 28 pull requests mergeados e no estado atual do código.

---

## 🔴 Prioridade Alta — Segurança para Produção

Itens obrigatórios antes de ir para produção.

### 1. Implementar verificação avançada de Admin (Autenticação)
**Status atual:** A Autenticação via Firebase Auth é limitada apenas aos e-mails permitidos manualmente ou a implementação das rotas `/admin/*` não valida o backend de forma robusta por session cookie.
**Ação:**
- Garantir que todas as chamadas `PUT`, `POST` e `DELETE` no frontend (via `api/orders`, `api/products`, etc.) validem o token JWT de Firebase do usuário.
- Atualmente, as APIs confiam em dados brutos. Precisamos validar o header `Authorization: Bearer <token>` nas Serverless Functions do Vercel e garantir que pertença a um usuário que seja admin.

### 2. Monitoramento e Otimização do Vercel Postgres
**Status atual:** Toda a lógica de gestão de estoque e pedidos foi migrada para Vercel Postgres (`api/orders`, `api/stock`), o que garante consistência usando transações SQL.
**Ação:**
- Testar sob estresse as conexões do banco de dados (pool limit).
- Garantir que índices corretos existam (`CREATE INDEX`) para acelerar as consultas principais de catálogo.

### 3. Validação completa de pedidos no servidor (API)
**Status atual:** A rota API `/api/orders` valida preços e realiza transação atômica de estoque de forma correta, mas as verificações sobre formatação do e-mail, telefone e endereço do cliente poderiam ser mais rigorosas.
**Ação:**
- Implementar sanitização dos inputs no backend.
- Adicionar logging robusto aos pedidos recusados (tentativas de preço alterado, estoque faltante, parâmetros inválidos).

### 4. Configurar ambientes separados (dev/staging/produção)
**Status atual:** Vercel permite configurar variáveis `.env` independentes.
**Ação:**
- Cadastrar corretamente `MERCADO_PAGO_ACCESS_TOKEN` na Vercel (Produção e Preview) para processamento real via `/api/payment`.
- Separar chaves do Mercado Pago (sandbox vs produção).

---

## 🟡 Prioridade Média — Funcionalidades de Negócio

Melhorias que agregam valor ao negócio e à experiência do cliente.

### 5. Sistema de busca e filtros
**Status atual:** Navegação apenas por categorias, sem busca textual.

**Ação:**
- Adicionar barra de busca no Header (por nome e descrição)
- Filtros por faixa de preço, categoria e disponibilidade
- Ordenação por preço, nome ou popularidade

### 6. Histórico de pedidos para o cliente
**Status atual:** Clientes não conseguem ver seus próprios pedidos após a criação.

**Ação:**
- Adicionar `userId` aos pedidos (quando autenticado)
- Criar página "Meus Pedidos" com tracking de status
- Atualizar Firestore Rules para permitir leitura do próprio pedido
- Notificação por email quando status muda

### 7. Integrar newsletter com serviço de email
**Status atual:** Cadastro de newsletter salva apenas no frontend (sem backend).

**Ação:**
- Integrar com Mailchimp, SendGrid ou Firebase Extensions
- Criar Cloud Function para salvar inscrições no Firestore
- Implementar email de boas-vindas automático
- Adicionar opção de cancelar inscrição

### 8. Sistema de avaliações de produtos
**Status atual:** Depoimentos são hardcoded no componente `TestimonialsSection`.

**Ação:**
- Criar coleção `reviews` no Firestore
- Permitir que clientes enviem avaliações após compra
- Moderar avaliações no painel admin
- Exibir nota média por produto

### 9. Gestão de cupons e promoções
**Status atual:** Não existe sistema de descontos.

**Ação:**
- Criar coleção `coupons` no Firestore
- Validar cupons na Cloud Function `createOrder`
- Adicionar campo de cupom no checkout
- Página de gestão de cupons no admin

### 10. Notificações de pedidos
**Status atual:** Sem notificações automáticas.

**Ação:**
- Email de confirmação de pedido para o cliente
- Notificação WhatsApp/email para o admin quando novo pedido chega
- Push notifications para mudança de status do pedido

---

## 🟢 Prioridade Baixa — Melhorias de UX e Infraestrutura

Otimizações que melhoram a experiência mas não são bloqueadoras.

### 11. Testes automatizados
**Status atual:** Nenhum teste automatizado no projeto.

**Ação:**
- Configurar Vitest para testes unitários
- Testes para Cloud Functions (createOrder, processPayment)
- Testes para contextos (CartContext, AuthContext)
- Testes E2E para fluxo de checkout com Playwright

### 12. Performance e otimização
**Status atual:** Bundle de ~800KB (246KB comprimido).

**Ação:**
- Lazy loading de rotas do admin (React.lazy + Suspense)
- Otimização de imagens (WebP, lazy loading, srcset)
- Code splitting por rota
- Service Worker para cache offline
- Lighthouse audit e correções

### 13. Analytics e monitoramento
**Status atual:** Firebase Analytics configurado mas sem eventos customizados.

**Ação:**
- Rastrear eventos de e-commerce (view_item, add_to_cart, purchase)
- Configurar Google Analytics 4 com conversões
- Dashboard de métricas de negócio (taxa de conversão, ticket médio)
- Monitoramento de erros com Firebase Crashlytics ou Sentry

### 14. Programa de fidelidade funcional
**Status atual:** Banner exibe benefícios mas não há lógica implementada.

**Ação:**
- Criar sistema de pontos no Firestore
- Acumular pontos por compra
- Permitir resgate de pontos como desconto
- Níveis de fidelidade (Bronze, Prata, Ouro)

### 15. Multi-idioma
**Status atual:** Interface apenas em português.

**Ação:**
- Implementar i18n com react-intl ou i18next
- Traduzir para espanhol (mercado regional)
- Detectar idioma do navegador

### 16. PWA (Progressive Web App)
**Status atual:** Apenas web app tradicional.

**Ação:**
- Adicionar manifest.json e Service Worker
- Ícones para home screen
- Suporte offline para catálogo
- Push notifications

### 17. Integração com ERP/estoque físico
**Status atual:** Estoque gerenciado apenas no Firestore.

**Ação:**
- API de sincronização com sistema ERP do cliente
- Webhooks para atualização de estoque bidirecional
- Importação/exportação de produtos via CSV

---

## 📊 Resumo por Fase

| Fase | Itens | Foco |
|------|-------|------|
| **Fase 1** (Imediato) | #1, #2, #3, #4 | Segurança para produção |
| **Fase 2** (Curto prazo) | #5, #6, #7, #10 | Funcionalidades essenciais |
| **Fase 3** (Médio prazo) | #8, #9, #11, #12 | Crescimento e qualidade |
| **Fase 4** (Longo prazo) | #13, #14, #15, #16, #17 | Escala e maturidade |

---

## ✅ Já Implementado (Referência)

Funcionalidades completadas nos 28 PRs anteriores:

- ✅ Catálogo com glassmorphism e imagens reais
- ✅ Kit de almofadas interativo com seletor de cores
- ✅ Checkout em 3 etapas (carrinho → dados → pagamento)
- ✅ 4 métodos de pagamento (WhatsApp, Mercado Pago, PIX, cartão)
- ✅ Firebase Auth para admin
- ✅ Cloud Functions com validação server-side
- ✅ Transações atômicas de estoque
- ✅ Rate limiting (5 req/min/IP)
- ✅ Firestore Security Rules completas
- ✅ CRUD de produtos com múltiplas imagens
- ✅ Gestão de estoque com alertas visuais
- ✅ Tracking de pedidos
- ✅ Gestão de kit de almofadas (cores, capas, refis)
- ✅ Configuração de gateways de pagamento
- ✅ SEO (meta tags, Open Graph, schema, sitemap)
- ✅ Animações Framer Motion no admin
- ✅ Navegação mobile otimizada
- ✅ Programa de fidelidade (banner)
- ✅ Depoimentos e newsletter
- ✅ Paleta de marca padronizada (marrom/dourado)

---

**Última atualização:** Fevereiro 2026
