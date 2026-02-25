# IzaCenter — Izabela Tarot

Plataforma web completa para serviços de Tarot Cigano com e-commerce, área do cliente e painel administrativo.

## Stack

- **Frontend:** Angular 20, PrimeNG, Tailwind CSS, ngx-translate (i18n)
- **Backend:** Express 5, TypeScript, Prisma 7, PostgreSQL (Supabase)
- **Pagamentos:** Stripe (checkout sessions + webhooks)
- **Storage:** Supabase Storage (imagens e mídia)
- **E-mail:** Nodemailer (SMTP)
- **Cache:** Redis (opcional)

## Setup

### Pré-requisitos

- Node.js 20+
- PostgreSQL (ou Supabase)
- Conta Stripe (test mode para desenvolvimento)

### Backend

```bash
cd backend
cp .env.example .env
# Edite .env com suas credenciais
npm install
npx prisma migrate dev
npm run seed  # Popular banco com dados de teste
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm start
```

A aplicação estará disponível em `http://localhost:4200` (frontend) e `http://localhost:3000` (backend API).

## Documentação

- [Review Completo & Plano de Produção](REVIEW.md)
- [Implementação i18n Admin](ADMIN_I18N_IMPLEMENTATION.md)
- [Auditoria do Menu Admin](MENU_AUDIT_TASKS.md)
