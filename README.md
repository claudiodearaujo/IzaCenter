# IzaCenter — Izabela Tarot

Plataforma web completa para serviços de Tarot Cigano com e-commerce, área do cliente e painel administrativo.

## Stack

- **Frontend:** Angular 20, PrimeNG, Tailwind CSS, ngx-translate (i18n)
- **Backend:** Express 5, TypeScript, Prisma 7, PostgreSQL (Supabase)
- **Pagamentos:** Stripe (checkout sessions + webhooks)
- **Storage:** Supabase Storage (imagens e mídia)
- **E-mail:** Nodemailer (SMTP)
- **Cache:** Redis (opcional)

## Funcionalidades

- **Site público** — Home, Sobre, Serviços, Loja, Contato, FAQ, Depoimentos, Termos, Privacidade
- **Loja/E-commerce** — Catálogo de produtos, carrinho, checkout com Stripe
- **Área do Cliente** — Dashboard, leituras, agendamentos, pedidos com download de PDF, perfil
- **Painel Admin** — Dashboard, leituras, agendamentos, pedidos, produtos, categorias, cartas, usuários, depoimentos, disponibilidade, relatórios, configurações
- **Backend API** — REST API com autenticação JWT, integração Stripe, Supabase Storage, e-mail SMTP
- **PWA** — Service worker com cache de assets e APIs
- **i18n** — 4 idiomas: PT-BR, EN, ES, FR

## Setup

### Pré-requisitos

- Node.js 20+
- PostgreSQL (ou conta [Supabase](https://supabase.com))
- Conta [Stripe](https://stripe.com) (test mode para desenvolvimento)
- Conta de e-mail SMTP (Gmail com App Password, ou similar)
- Redis (opcional — necessário para produção)

### Backend

```bash
cd backend
cp .env.example .env
# Edite .env com suas credenciais (veja seção Variáveis de Ambiente abaixo)
npm install
npx prisma migrate dev
npm run seed  # Popular banco com dados de teste
npm run dev
```

A API estará disponível em `http://localhost:3000`.

### Frontend

```bash
cd frontend
npm install
npm start
```

A aplicação estará disponível em `http://localhost:4200`.

### Variáveis de Ambiente (Backend)

Copie `backend/.env.example` para `backend/.env` e configure:

| Variável | Descrição | Obrigatório |
|----------|-----------|-------------|
| `DATABASE_URL` | URL de conexão PostgreSQL (Supabase) | ✅ |
| `JWT_SECRET` | Segredo para tokens JWT | ✅ |
| `JWT_REFRESH_SECRET` | Segredo para refresh tokens | ✅ |
| `SUPABASE_URL` | URL do projeto Supabase | ✅ |
| `SUPABASE_ANON_KEY` | Chave anônima do Supabase | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | Chave de serviço do Supabase | ✅ |
| `STRIPE_SECRET_KEY` | Chave secreta do Stripe (`sk_test_...`) | ✅ |
| `STRIPE_WEBHOOK_SECRET` | Segredo de webhook do Stripe (`whsec_...`) | ✅ |
| `SMTP_HOST` | Host do servidor SMTP | ✅ |
| `SMTP_USER` | Usuário SMTP | ✅ |
| `SMTP_PASS` | Senha SMTP | ✅ |
| `FRONTEND_URL` | URL do frontend (para CORS e e-mails) | ✅ |
| `REDIS_URL` | URL do Redis (token blacklist) | ⚠️ Prod |
| `SENTRY_DSN` | DSN do Sentry (monitoramento de erros) | ⚠️ Prod |

### Configuração do Stripe (Webhooks)

Para receber eventos do Stripe localmente:

```bash
# Instale o Stripe CLI
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Copie o segredo exibido para `STRIPE_WEBHOOK_SECRET` no `.env`.

### Banco de Dados

```bash
cd backend

# Criar e aplicar migrações
npx prisma migrate dev

# Visualizar banco de dados
npx prisma studio

# Popular com dados de exemplo
npm run seed
```

### Testes

```bash
# Backend — testes unitários
cd backend
npm run test:unit

# Backend — testes de integração
npm run test:integration

# Backend — cobertura
npm run test:coverage

# Frontend — testes unitários
cd frontend
npm test

# E2E (Playwright)
cd e2e
npm test
```

### Build para Produção

```bash
# Backend
cd backend
npm run build
npm start

# Frontend
cd frontend
npm run build
```

## Deploy

### Render (recomendado)

O projeto inclui configurações para deploy no [Render](https://render.com):

- **Backend:** `backend/render.yaml` — Web service com PostgreSQL e Redis
- **Frontend:** Configuração via `render.yaml` na raiz

Configure as variáveis de ambiente no painel do Render antes do primeiro deploy.

#### Secrets do GitHub Actions

Para CI/CD automático, configure os seguintes secrets no GitHub:

| Secret | Descrição |
|--------|-----------|
| `RENDER_BACKEND_DEPLOY_HOOK` | Webhook de deploy do backend no Render |
| `RENDER_FRONTEND_DEPLOY_HOOK` | Webhook de deploy do frontend no Render |
| `E2E_BASE_URL` | URL base para testes E2E (ex: `https://seu-frontend.onrender.com`) |

### Docker

```bash
# Backend
cd backend
docker build -t izacenter-backend .
docker run -p 3000:3000 --env-file .env izacenter-backend
```

## Estrutura do Projeto

```
IzaCenter/
├── backend/                # API Express 5 + TypeScript
│   ├── src/
│   │   ├── modules/        # auth, users, products, orders, readings, ...
│   │   ├── middlewares/    # auth, error, rate-limit, audit, upload
│   │   ├── config/         # database, redis, email, stripe, supabase
│   │   └── utils/          # helpers, email templates
│   ├── prisma/
│   │   ├── schema.prisma   # 16 modelos
│   │   └── seed.ts         # dados de exemplo
│   └── Dockerfile
├── frontend/               # Angular 20 + PrimeNG + Tailwind
│   └── src/app/
│       ├── features/       # public, auth, shop, client, admin
│       ├── layouts/        # public-layout, client-layout, admin-layout
│       ├── core/           # services, guards, interceptors
│       └── shared/         # components, pipes
├── e2e/                    # Testes E2E Playwright
└── docs/                   # Documentação adicional
```

## API

A documentação Swagger/OpenAPI está disponível em `http://localhost:3000/api/docs` após iniciar o backend.

## Usuários de Teste (seed)

Após executar `npm run seed` no backend:

| Papel | E-mail | Senha |
|-------|--------|-------|
| Admin | admin@izabelatarot.com.br | Admin@123 |
| Cliente | cliente@example.com | Cliente@123 |

## Documentação

- [Review Completo & Plano de Produção](REVIEW.md)
- [Implementação i18n Admin](ADMIN_I18N_IMPLEMENTATION.md)
- [Auditoria do Menu Admin](MENU_AUDIT_TASKS.md)
