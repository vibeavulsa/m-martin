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

## 📦 Estrutura do Projeto

```
src/
├── components/          # Componentes React
│   ├── Header.jsx      # Cabeçalho com navegação
│   ├── Hero.jsx        # Seção hero com animações
│   ├── CategorySection.jsx  # Seções de categorias
│   └── ProductCard.jsx # Cards de produtos com efeito glass
├── config/             # Configurações
│   └── firebase.js     # Configuração do Firebase
├── data/               # Dados estáticos
│   └── products.js     # Catálogo de produtos
├── hooks/              # Custom hooks
│   └── useCatalogoMMartin.js
├── App.jsx             # Componente principal
└── main.jsx           # Entry point
```

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

- ✅ Design responsivo
- ✅ Efeitos glassmorphism modernos
- ✅ Animações suaves
- ✅ Navegação intuitiva
- ✅ 12 produtos de exemplo
- ✅ Ícones profissionais Tabler Icons
- ✅ Pronto para integração Firebase

## 🖼️ Preview

O catálogo apresenta um design moderno com:
- Hero section com gradiente animado
- Cards com efeito liquid glass
- Grid responsivo de produtos
- Footer com informações da empresa

## 📄 Licença

© 2026 M'Martin. Todos os direitos reservados.
