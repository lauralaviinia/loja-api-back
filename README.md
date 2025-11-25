# 🛍️ API de loja

Uma API REST completa para gerenciamento de loja construída com Node.js, TypeScript, Prisma e PostgreSQL.

## 📋 Funcionalidades
- ✅ Gerenciamento de Produtos - CRUD completo
- ✅ Gerenciamento de Categoria - CRUD completo
- ✅ Gerenciamento de Pedido - CRUD completo
- ✅ Gerenciamento de Cliente - CRUD completo com relacionamentos
- ✅ Validações com Zod - Validação robusta de dados de entrada
- ✅ Documentação Swagger - API totalmente documentada
- ✅ Banco PostgreSQL - Persistência de dados confiável

## 🛠️ Tecnologias
- Node.js + TypeScript
- Express.js - Framework web
- Prisma - ORM para banco de dados
- PostgreSQL - Banco de dados
- Zod - Validação de esquemas
- Swagger - Documentação da API
- Docker - Containerização do banco

## 🚀 Como Rodar a Aplicação

### 📋 Pré-requisitos
- Node.js (v18 ou superior)  
- npm ou yarn  
- Docker e Docker Compose  
- Git  

### 1️⃣ Clone o Repositório
```bash
git clone https://github.com/seu-usuario/loja-api.git
cd loja-api
```

### 2️⃣ Instale as Dependências
```bash
npm install
```

### 3️⃣ Configure o Banco de Dados
**Inicie o PostgreSQL com Docker:**
```bash
docker-compose up -d
```

Isso irá:
- Criar um container PostgreSQL na porta `5433`
- Configurar usuário: `admin`, senha: `admin`
- Criar banco de dados: `loja`

**Verifique se o container está rodando:**
```bash
docker ps
```

### 4️⃣ Configure as Variáveis de Ambiente
No arquivo .env:
```bash
DATABASE_URL="postgresql://admin:admin@localhost:5433/loja"
PORT=3333
```

### 5️⃣ Execute as Migrações do Banco
```bash
# Gerar o Prisma Client
npx prisma generate

# Executar migrações
npx prisma migrate dev
```

### 6️⃣ Inicie a Aplicação
```bash
# Desenvolvimento (com hot reload)
npm run dev

# Build para produção
npm run build
npm start
```

## 📖 Documentação
Acesse a documentação interativa via **Swagger UI**:
http://localhost:3000/api-docs

### Endpoints Principais

🛒 **Produtos**

- `POST /produtos` → Criar produto
- `GET /produtos` → Listar todos os produtos
- `GET /produtos/:id` → Buscar produto por ID
- `PUT /produtos/:id` → Atualizar produto
- `DELETE /produtos/:id` → Deletar produto

📂 **Categorias**

- `POST /categorias` → Criar categoria
- `GET /categorias` → Listar todas as categorias
- `GET /categorias/:id` → Buscar categoria por ID
- `PUT /categorias/:id` → Atualizar categoria
- `DELETE /categorias/:id` → Deletar categoria

👥 **Clientes**

- `POST /clientes` → Criar cliente
- `GET /clientes` → Listar todos os clientes
- `GET /clientes/:`id → Buscar cliente por ID
- `PUT /clientes/:id` → Atualizar cliente
- `DELETE /clientes/:id` → Deletar cliente

📦 **Pedidos**

- `POST /pedidos` → Criar pedido
- `GET /pedidos` → Listar todos os pedidos (com relacionamentos: cliente + produtos)
- `GET /pedidos/:id` → Buscar pedido por ID
- `PUT /pedidos/:id` → Atualizar pedido
- `DELETE /pedidos/:id` → Deletar pedido

# 📄 Licença
Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

# 🎀 Autora
Laura Lavínia Lopes de Andrade

- GitHub: @lauralaviinia
- RGM: 33467145