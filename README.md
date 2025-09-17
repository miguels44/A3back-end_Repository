# EduBot

## 📚 Site de estudos universitário de tecnologia - Chatbot

Este é o back-end do **EduBot**, um sistema de estudos universitário com chatbot e banco de dados PostgreSQL.

---

## 🚀 Tecnologias

- [Node.js](https://nodejs.org/) (v18+ recomendado)
- [Fastify](https://fastify.dev/) - framework HTTP
- [Knex.js](https://knexjs.org/) - query builder
- [PostgreSQL](https://www.postgresql.org/) - banco de dados relacional
- [Docker](https://www.docker.com/) e [Docker Compose](https://docs.docker.com/compose/) - para serviços
- [Zod](https://zod.dev/) - validação de variáveis de ambiente

---

## 📂 Estrutura do projeto

```
.
├── infra
│   ├── compose.yml          # Configuração do Docker Compose (Postgres)
│   ├── database.js          # Conexão do Knex com Postgres
│   └── migrations           # Migrations do banco
├── src
│   ├── env
│   │   └── index.js         # Variáveis de ambiente validadas com Zod
│   ├── routes
│   │   └── status.js        # Rotas de healthcheck
│   └── server.js            # Inicialização do servidor Fastify
├── knexfile.js              # Configuração do Knex
├── package.json             # Scripts e dependências
```

---

## ⚙️ Configuração

1. **Clone o repositório**

   ```bash
   git clone https://github.com/seu-usuario/edubot.git
   cd edubot
   ```

2. **Crie o arquivo `.env`** na raiz do projeto:

   ```env
   POSTGRES_USER=postgres
   POSTGRES_PASSWORD=postgres
   POSTGRES_DB=edubot
   POSTGRES_HOST=localhost
   POSTGRES_PORT=5432

   PORT=3000
   ENV=development
   ```

3. **Instale as dependências**
   ```bash
   npm install
   ```

---

## 🐘 Banco de Dados

O projeto já vem com um `compose.yml` dentro da pasta `infra/` para subir o PostgreSQL.

- **Subir serviços (Postgres)**

  ```bash
  npm run services:up
  ```

- **Derrubar serviços**

  ```bash
  npm run services:down
  ```

- **Rodar migrations**

  ```bash
  npm run migration:run
  ```

- **Criar nova migration**

  ```bash
  npm run migration:create nome_da_migration
  ```

- **Rollback migration**
  ```bash
  npm run migration:rollback
  ```

---

## ▶️ Executando a aplicação

```bash
npm run dev
```

Isso irá:

1. Subir o Postgres via Docker
2. Iniciar o servidor Node.js com reload automático (`--watch`)

---

## 📡 Endpoints

### Healthcheck da API

```http
GET /
```

Resposta:

```json
{ "status": "api is running!" }
```

### Healthcheck do Banco

```http
GET /database
```

Resposta em caso de sucesso:

```json
{ "status": "database is ok!" }
```

Em caso de falha:

```json
{ "status": "database connection failed", "error": "mensagem de erro" }
```

---

## 🧪 Testando rapidamente

Após rodar `npm run dev`, abra em um navegador ou use `curl`:

```bash
curl http://localhost:3000/
curl http://localhost:3000/database
```

---

## 📜 Licença

Projeto desenvolvido para fins acadêmicos. Licença [MIT](LICENSE).
