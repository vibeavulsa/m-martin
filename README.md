# M'Martin - Estofados Finos

Catálogo moderno de produtos para estofados, desenvolvido com React e liquid-glass-react.

## 📋 Informações do Projeto

- **Nome:** M'Martin
- **ID do Projeto:** m-martin-estofados
- **Número do Projeto:** 178643218861
- **Tecnologias:** React, Vite, liquid-glass-react, Tabler Icons, Firebase

## 🚀 Como Executar

### Pré-requisitos
- Node.js (versão 18 ou superior)
- npm ou yarn

### Instalação

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Edite o arquivo .env com suas credenciais do Firebase
```

### Desenvolvimento

```bash
# Iniciar servidor de desenvolvimento
npm run dev

# O aplicativo estará disponível em http://localhost:5173
```

### Build para Produção

```bash
# Criar build otimizado
npm run build

# Visualizar build
npm run preview
```

## 🚀 Deploy

O projeto está configurado para deploy em múltiplas plataformas. Escolha a que melhor se adequa às suas necessidades:

### Firebase Hosting

```bash
# Instalar Firebase CLI (se ainda não tiver)
npm install -g firebase-tools

# Fazer login no Firebase
firebase login

# Inicializar projeto (se necessário)
firebase init hosting

# Build e deploy
npm run build
firebase deploy
```

O arquivo `firebase.json` já está configurado com:
- Reescritas de rota para SPA (Single Page Application)
- Configuração de cache para assets estáticos
- Pasta de build: `dist`

### Netlify

Opção 1 - Deploy via CLI:
```bash
# Instalar Netlify CLI
npm install -g netlify-cli

# Deploy
npm run build
netlify deploy --prod
```

Opção 2 - Deploy via Git:
1. Conecte seu repositório no [Netlify](https://netlify.com)
2. Configure:
   - Build command: `npm run build`
   - Publish directory: `dist`

O arquivo `public/_redirects` já está configurado para lidar com rotas SPA.

### Vercel

Opção 1 - Deploy via CLI:
```bash
# Instalar Vercel CLI
npm install -g vercel

# Deploy
vercel
```

Opção 2 - Deploy via Git:
1. Conecte seu repositório no [Vercel](https://vercel.com)
2. A configuração será detectada automaticamente

O arquivo `vercel.json` já está configurado com rewrites para SPA.

## 📦 Estrutura do Projeto

```
src/
├── components/          # Componentes React
│   ├── Header.jsx      # Cabeçalho com navegação
│   ├── Hero.jsx        # Seção hero com animações
│   ├── CategorySection.jsx  # Seções de categorias
│   └── ProductCard.jsx # Cards de produtos com efeito glass
├── admin/              # Painel administrativo
│   ├── pages/          # Páginas do admin
│   ├── components/     # Componentes do admin
│   ├── context/        # Context API do admin
│   └── AdminRoutes.jsx # Rotas do painel
├── config/             # Configurações
│   └── firebase.js     # Configuração do Firebase
├── data/               # Dados estáticos
│   └── products.js     # Catálogo de produtos
├── hooks/              # Custom hooks
│   └── useCatalogoMMartin.js
├── App.jsx             # Componente principal
└── main.jsx           # Entry point
```

## 🔐 Painel Administrativo

O projeto inclui um painel administrativo completo acessível em `/admin`.

### Acesso

**URL:** `/admin`

**Credenciais padrão (apenas para desenvolvimento):**
- Usuário: `admin`
- Senha: `mmartin2026`

> ⚠️ **SEGURANÇA CRÍTICA:** Estas são credenciais de desenvolvimento. NUNCA use em produção!
> 
> **Para produção, OBRIGATORIAMENTE configure as variáveis de ambiente:**
> - `VITE_ADMIN_USER` - Defina um nome de usuário seguro
> - `VITE_ADMIN_PASS` - Defina uma senha forte
> 
> As credenciais acima só devem ser usadas em ambiente de desenvolvimento local.

### Funcionalidades

- 📊 **Dashboard** - Visão geral com métricas e estatísticas
- 📦 **Gestão de Produtos** - Adicionar, editar e remover produtos
- 📋 **Controle de Estoque** - Gerenciar quantidades e alertas de estoque baixo
- 🧾 **Gestão de Pedidos** - Visualizar e atualizar status de pedidos

Todos os dados são armazenados no LocalStorage do navegador.

## 🛋️ Categorias de Produtos

1. **Sofás** - Estofados finos para sala de estar
2. **Almofadas** - Conforto e decoração
3. **Travesseiros** - Qualidade para um sono tranquilo
4. **Homecare e Hospitalar** - Linha especializada

## 🎨 Tecnologias Utilizadas

- **React 19** - Framework JavaScript
- **Vite** - Build tool e dev server
- **liquid-glass-react** - Efeito glassmorphism
- **@tabler/icons-react** - Biblioteca de ícones
- **Firebase** - Backend e hosting (configuração pronta)

## 🔥 Firebase

O projeto está configurado para usar Firebase. Para ativar:

1. Crie um projeto no [Firebase Console](https://console.firebase.google.com/)
2. Adicione suas credenciais no arquivo `.env`:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_APP_ID`

## 📱 Recursos

### Loja/Catálogo
- ✅ Design responsivo
- ✅ Efeitos glassmorphism modernos
- ✅ Animações suaves
- ✅ Navegação intuitiva
- ✅ 12 produtos de exemplo
- ✅ Ícones profissionais Tabler Icons
- ✅ Pronto para integração Firebase

### Painel Administrativo
- ✅ Sistema de autenticação
- ✅ Dashboard com métricas em tempo real
- ✅ CRUD completo de produtos
- ✅ Gestão de estoque com alertas
- ✅ Controle de pedidos
- ✅ Interface responsiva e moderna

## 🖼️ Preview

O catálogo apresenta um design moderno com:
- Hero section com gradiente animado
- Cards com efeito liquid glass
- Grid responsivo de produtos
- Footer com informações da empresa

## 📝 Changelog / Histórico de Mudanças

### v1.0.0 (Fevereiro 2026)

#### 🎨 Identidade Visual
- **Logo atualizado** - Substituição do logo SVG por versão PNG em `assets/logo.png` para melhor compatibilidade
- **Imagens reais de produtos** - Adição de fotos profissionais do Unsplash para sofás, almofadas, travesseiros e produtos hospitalares
- **Logo no Header e Hero** - Integração do logo M'Martin nas seções de cabeçalho e hero do site

#### ✨ Funcionalidades Implementadas
- **Catálogo moderno** - Implementação completa do catálogo com design liquid-glass usando `liquid-glass-react`
- **Ícones profissionais** - Integração da biblioteca Tabler Icons para ícones consistentes e modernos
- **Efeitos glassmorphism** - Cards de produtos com efeito de vidro líquido animado
- **Design responsivo** - Layout adaptável para desktop, tablet e mobile

#### 📚 Documentação
- **README abrangente** - Documentação completa com instruções de instalação, execução e estrutura do projeto
- **Configuração Firebase** - Guia de configuração do Firebase para backend e hosting
- **Estrutura de pastas** - Documentação da arquitetura de componentes e arquivos

#### 🏗️ Infraestrutura
- **Firebase Data Connect** - Configuração do serviço de dados com PostgreSQL
- **Firestore Rules** - Regras de segurança configuradas para o banco de dados
- **Vite + React 19** - Setup moderno de desenvolvimento com hot reload

---

## 📄 Licença

© 2026 M'Martin. Todos os direitos reservados.
