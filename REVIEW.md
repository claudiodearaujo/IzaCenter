# IzaCenter — Review Completo & Plano de Produção

> **Data:** Fevereiro 2026  
> **Projeto:** IzaCenter (Izabela Tarot) — Plataforma de Tarot Cigano com e-commerce  
> **Stack:** Angular 20 + PrimeNG + Tailwind (Frontend) | Express 5 + Prisma + PostgreSQL (Backend)

---

## 1. Visão Geral do Projeto

O IzaCenter é uma plataforma web completa para serviços de Tarot Cigano, composta por:

- **Site público** — Home, Sobre, Serviços, Loja, Contato, FAQ, Depoimentos
- **Loja/E-commerce** — Catálogo de produtos, carrinho, checkout com Stripe
- **Área do Cliente** — Dashboard, leituras, agendamentos, pedidos, perfil
- **Painel Admin** — Dashboard, gestão de leituras, agendamentos, produtos, categorias, cartas, usuários, depoimentos, configurações
- **Backend API** — REST API com autenticação JWT, integração Stripe, Supabase Storage, e-mail SMTP

---

## 2. Arquitetura Atual

### 2.1 Frontend (Angular 20)
| Aspecto | Status | Detalhes |
|---------|--------|----------|
| Framework | ✅ Angular 20 com standalone components | Sem módulos NgModule |
| UI Components | ✅ PrimeNG 20 | Tema custom Livria |
| CSS | ✅ Tailwind CSS 4 | Integrado via PostCSS |
| i18n | ✅ ngx-translate | 4 idiomas (PT-BR, EN, ES, FR) |
| Routing | ✅ Lazy loading | Rotas por feature |
| Auth | ✅ Guards + Interceptor | authGuard, adminGuard, clientGuard |
| State | ✅ Angular Signals | Estado reativo sem NgRx |
| SEO | ✅ robots.txt + sitemap.xml | Configurados |
| PWA | ⚠️ Parcial | Manifest existe, sem service worker |

### 2.2 Backend (Express 5 + Prisma)
| Aspecto | Status | Detalhes |
|---------|--------|----------|
| Framework | ✅ Express 5 + TypeScript | Arquitetura MVC |
| ORM | ✅ Prisma 7 | PostgreSQL via Supabase |
| Auth | ✅ JWT com refresh token | Blacklist via Redis |
| Pagamentos | ✅ Stripe | Checkout sessions + webhooks |
| Upload | ✅ Multer + Supabase Storage | Imagens e mídia |
| E-mail | ✅ Nodemailer (SMTP) | Templates HTML inline |
| Segurança | ✅ Helmet + CORS + Rate Limiting | Configurado |
| Validação | ✅ Zod | Schemas para auth, orders, products, users |
| Cache | ⚠️ Redis opcional | Mock em dev/test |

### 2.3 Banco de Dados (14 modelos)
`User`, `ProductCategory`, `Product`, `ProductAttachment`, `Order`, `OrderItem`, `CiganoCard`, `Reading`, `ReadingCard`, `ScheduleSettings`, `Appointment`, `BlockedSlot`, `Testimonial`, `Coupon`, `SiteSetting`, `Notification`

### 2.4 Módulos do Backend (12 módulos)
`auth`, `users`, `products`, `orders`, `webhooks`, `readings`, `cards`, `appointments`, `categories`, `testimonials`, `settings`, `dashboard`

---

## 3. O que já está Implementado ✅

### 3.1 Backend — Funcionalidades Completas
- [x] Autenticação (registro, login, logout, refresh token, esqueci senha, reset senha)
- [x] CRUD de usuários com roles (CLIENT/ADMIN)
- [x] CRUD de produtos com categorias e upload de imagens
- [x] Sistema de pedidos com carrinho e cupons de desconto
- [x] Integração Stripe (checkout sessions, webhooks)
- [x] Sistema de leituras de tarot (criação, edição, publicação)
- [x] Gerenciamento de cartas do Tarot Cigano (36 cartas)
- [x] Sistema de agendamentos com verificação de conflitos
- [x] CRUD de depoimentos com aprovação
- [x] Configurações do site (dinâmicas via banco)
- [x] Dashboard admin com estatísticas e gráficos
- [x] Rate limiting por tipo de rota
- [x] Tratamento de erros centralizado
- [x] Health check endpoint

### 3.2 Frontend — Páginas e Componentes
- [x] Layout público (header, footer, navegação)
- [x] Página Home
- [x] Página Sobre
- [x] Página Serviços
- [x] Página Contato
- [x] Página FAQ
- [x] Página Depoimentos
- [x] Loja (listagem + detalhes do produto)
- [x] Carrinho de compras
- [x] Checkout com Stripe
- [x] Login / Cadastro / Esqueci Senha / Redefinir Senha
- [x] Dashboard do cliente
- [x] Listagem e detalhes de leituras (cliente)
- [x] Listagem de agendamentos (cliente)
- [x] Listagem e detalhes de pedidos (cliente)
- [x] Perfil do cliente
- [x] Dashboard admin
- [x] Gerenciamento de leituras (admin)
- [x] Gerenciamento de agendamentos (admin)
- [x] Gerenciamento de produtos (admin)
- [x] Gerenciamento de categorias (admin)
- [x] Gerenciamento de cartas (admin)
- [x] Gerenciamento de usuários (admin)
- [x] Gerenciamento de depoimentos (admin)
- [x] Configurações (admin)
- [x] Guards de autenticação e autorização
- [x] Interceptor de autenticação (token)
- [x] Interceptor de erros
- [x] Componentes compartilhados (header, footer, product-card, etc.)
- [x] Pipes customizados (currency-brl, date-pt)
- [x] Animações (fade)

### 3.3 Infraestrutura
- [x] Schema do banco de dados completo com índices
- [x] 2 migrações do Prisma
- [x] Seed de dados para desenvolvimento
- [x] Configuração de deploy no Render (frontend)
- [x] Testes unitários (auth, cards, categories, dashboard, orders, settings, testimonials)
- [x] Testes de integração (cards, orders, users)
- [x] Mocks para Prisma, e-mail, Stripe, Supabase

---

## 4. Problemas Críticos Encontrados 🔴

### 4.1 ~~Interceptor de Erros não registrado~~ (CORRIGIDO)
~~O `errorInterceptor` existia mas não estava registrado no `app.config.ts`. Erros HTTP (401, 403, 404, 500) não eram tratados no frontend.~~

**Status:** ✅ Corrigido neste PR — `errorInterceptor` adicionado ao `provideHttpClient`.

### 4.2 ~~Credenciais reais no .env.example~~ (CORRIGIDO)
~~O arquivo `.env.example` continha uma senha real do banco de dados Supabase.~~

**Status:** ✅ Corrigido neste PR — substituído por placeholder.

---

## 5. Plano para Produção — O que falta implementar

### 🔴 Prioridade CRÍTICA (Bloqueia deploy em produção)

#### 5.1 CI/CD Pipeline
- [x] Criar GitHub Actions workflow para CI (lint, build, testes) — `.github/workflows/ci.yml`
- [x] Criar workflow de deploy automático (backend → Render) — `.github/workflows/deploy-backend.yml`
- [x] Criar workflow de deploy automático (frontend → Render) — `.github/workflows/deploy-frontend.yml`
- [ ] Configurar variáveis de ambiente nos secrets do GitHub (requer acesso ao repositório)

#### 5.2 Backend — Deploy em Produção
- [x] Criar configuração de deploy para o backend — `backend/Dockerfile` + `backend/render.yaml`
- [ ] Configurar variáveis de produção (Stripe live keys, SMTP, etc.) — render.yaml template pronto
- [ ] Configurar Redis em produção (obrigatório para token blacklist e idempotência de webhooks)
- [ ] Configurar domínio e SSL/TLS (configuração no Render)
- [x] Garantir que `NODE_ENV=production` está setado — definido no render.yaml
- [x] Habilitar logging em produção — morgan `combined` habilitado

#### 5.3 Segurança
- [ ] Rotacionar as credenciais do banco que foram expostas no .env.example
- [ ] Configurar chaves Stripe de produção (live mode)
- [ ] Definir JWT_SECRET forte e único para produção — render.yaml usa `generateValue: true`
- [ ] Habilitar HTTPS em todas as comunicações (configuração no Render)
- [x] Revisar CORS para aceitar apenas domínio de produção — já configurado em `app.ts`
- [x] Configurar cookie-parser — middleware adicionado em `app.ts`

#### 5.4 Pagamentos
- [ ] Testar fluxo completo de pagamento com Stripe em modo live
- [x] Implementar tratamento de reembolsos — `ordersService.handleRefund()` + webhook handler
- [x] Implementar idempotência em webhooks — Redis-backed deduplication por `event.id`
- [x] Implementar tratamento de falha de pagamento — `ordersService.handlePaymentFailure()`
- [x] Idempotência em `handlePaymentSuccess` — guard contra processamento duplicado
- [ ] Testar edge cases de pagamento (falha, timeout, pagamento assíncrono)

### 🟡 Prioridade ALTA (Importante para qualidade de produção)

#### 5.5 Menu Admin Incompleto (conforme MENU_AUDIT_TASKS.md)
- [x] Implementar página de gestão de Pedidos (admin) — `admin/orders/order-list`
- [x] Implementar página de gestão de Disponibilidade/Horários (admin) — `admin/availability`
- [x] Implementar página de Relatórios (admin) — `admin/reports`
- [x] Corrigir rota de Clientes no menu admin — agora aponta para `/admin/usuarios`

#### 5.6 Testes
- [x] Aumentar cobertura de testes unitários do backend — 225 testes (11 suites)
  - [x] products.service.spec.ts (CRUD, slug, soft/hard delete, categories)
  - [x] users.service.spec.ts (profile, admin update, delete, stats)
  - [x] readings.service.spec.ts (CRUD, status, publish email, cards)
  - [x] appointments.service.spec.ts (CRUD, conflicts, reschedule, available slots, emails)
- [x] Adicionar testes unitários para controllers do backend (auth.controller.spec.ts, products.controller.spec.ts)
- [x] Adicionar testes unitários para o frontend (services e components) — service specs existentes + 4 novos component specs (dashboard, orders, availability, reports)
- [x] Adicionar testes E2E (Playwright já está como dependência) — `e2e/` com playwright.config.ts + 4 test suites (public-pages, auth, shop, critical-flows)
- [x] Executar testes E2E em CI — job `e2e` adicionado em `.github/workflows/ci.yml` (executa em push para main com Playwright/Chromium)
- [ ] Testar fluxos críticos: registro → compra → pagamento → leitura

#### 5.7 Internacionalização (conforme ADMIN_I18N_IMPLEMENTATION.md)
- [x] Adicionar chaves i18n para admin.orders, admin.availability, admin.reports (4 idiomas)
- [x] Completar implementação i18n nos componentes admin existentes (settings.component.html)
- [x] Completar implementação i18n nos demais componentes admin (produto-form, leitura-form, etc.) — todos os componentes admin usam TranslateModule
- [x] Corrigir labels hardcoded em reports.component.ts (periodOptions) e availability.component.ts (dayNames) — agora usam TranslateService
- [x] Adicionar chaves i18n faltantes: admin.reports.{active,noChartData,noProducts}, admin.availability.{save,saveAll,open,closed,from,to,dayOff,days.*} em 4 idiomas
- [x] Verificar cobertura de traduções em todas as páginas públicas — 1088 chaves verificadas, cobertura 100% em PT-BR, EN, ES e FR
- [x] Testar troca de idioma em todas as páginas — testado via testes E2E (`critical-flows.spec.ts`)

#### 5.8 E-mails
- [x] Refatorar templates de e-mail com layout base reutilizável (`emailLayout`, `emailButton`, `emailSignature`)
- [x] Adicionar template de confirmação de agendamento (`appointmentConfirmation`)
- [x] Adicionar template de cancelamento de agendamento (`appointmentCancellation`)
- [x] Adicionar template de notificação de reembolso (`refundNotification`)
- [ ] Configurar domínio de e-mail verificado (SPF, DKIM, DMARC)
- [ ] Testar todos os fluxos de e-mail

#### 5.9 Monitoramento e Logging
- [x] Logging em produção — morgan `combined` format habilitado
- [x] Health check detalhado — verifica DB e Redis, retorna status 503 se degraded
- [x] Audit logging — middleware para operações sensíveis (auth, orders, admin, webhooks)
- [x] Implementar monitoramento de aplicação — `@sentry/node` no backend + `@sentry/angular` no frontend; inicialização condicional via `SENTRY_DSN`; `Sentry.expressRequestHandler()` + `Sentry.expressErrorHandler()` no Express; `SentryErrorHandler` no Angular
- [ ] Configurar alertas para erros críticos — configurar no painel do Sentry após definir `SENTRY_DSN`

### 🟢 Prioridade MÉDIA (Melhorias para V1 robusta)

#### 5.10 Performance
- [x] Implementar cache com Redis para queries frequentes (produtos, categorias) — `getFeatured`, `listCategories` com TTL + invalidação em mutações
- [x] Adicionar compressão de imagens no upload — `compressImageMiddleware` (sharp) em `upload.middleware.ts`, aplicado no upload de capa de produtos
- [x] Implementar paginação cursor-based para listagens grandes — `listCursor()` em `products.service.ts` + endpoint `GET /products/public/cursor` + helper `buildCursorMeta()`
- [ ] Configurar CDN para assets estáticos
- [x] Budget de build do Angular: revisar limite de 1MB para initial bundle — warning 1MB / error 2MB em angular.json

#### 5.11 UX/UI
- [x] Implementar loading states em todas as páginas — `loadingbody` template com `p-skeleton` nos 6 componentes de lista admin
- [x] Implementar feedback visual para ações do usuário (toast notifications) — implementado via NotificationService + ToastModule em todos os layouts
- [x] Implementar página 404 customizada — `NotFoundComponent` com botões de ação
- [x] Implementar tratamento de erros offline/network — `errorInterceptor` expandido: status 0 detecta offline (`navigator.onLine`), 429 (rate limit), 503 (indisponível)
- [x] Adicionar skeleton loading nos componentes — `loadingbody` template com `p-skeleton` adicionado nos 6 componentes de lista admin (produtos, leituras, pedidos, agendamentos, usuários, depoimentos)
- [ ] Testar responsividade em dispositivos móveis

#### 5.12 Funcionalidades Adicionais
- [x] Implementar notificações in-app (modelo existe no banco) — backend: módulo `notifications` com GET/PATCH/DELETE endpoints; frontend: `InAppNotificationsService` + `NotificationBellComponent` no header
- [x] Implementar busca global de produtos — barra de busca no header redireciona para `/loja?search=termo`; shop lê parâmetro `search` dos queryParams
- [x] Implementar filtros avançados na loja (por categoria, preço, tipo) — filtro por tipo de produto e faixa de preço adicionados à loja
- [x] Implementar histórico de pedidos com download de PDF — botão "Baixar PDF" na página de detalhes do pedido (`/cliente/pedidos/:id`) usando `window.print()` com estilos de impressão
- [x] Implementar sistema de agendamento configurável — `getAvailableSlots` agora carrega horários do banco via `settingsService.getBusinessHours()`

#### 5.13 API & Documentação
- [x] Adicionar versionamento de API (ex: /api/v1/) — `/api/v1` montado em paralelo com `/api` via `mountRoutes()` em `app.ts`
- [x] Implementar documentação OpenAPI/Swagger — swagger-ui-express instalado, spec gerado com swagger-jsdoc, disponível em `/api/docs`
- [x] Documentar todos os endpoints com anotações OpenAPI (auth, products, orders, readings, appointments, users, testimonials, dashboard)
- [x] Criar README completo do projeto com instruções de setup — seções de pré-requisitos, variáveis de ambiente, Stripe webhooks, testes, build, deploy, estrutura do projeto, usuários de teste

#### 5.14 Legal & Compliance
- [x] Implementar página de Termos de Uso — `/termos-de-uso`
- [x] Implementar página de Política de Privacidade (LGPD) — `/politica-de-privacidade`
- [x] Implementar banner de consentimento de cookies — `CookieConsentComponent` no layout público
- [x] Implementar sistema de opt-out de comunicações — campos `notificationEmail` e `notificationWhatsapp` no modelo User; toggles na página de perfil do cliente (`/cliente/perfil`)
- [ ] Verificar compliance com regulamentações de pagamento (PCI DSS via Stripe)

### 🔵 Prioridade BAIXA (Nice-to-have para versões futuras)

#### 5.15 Futuras Melhorias
- [x] PWA completo com service worker — `@angular/service-worker` instalado, `ngsw-config.json` criado com cache de assets e APIs de produtos/settings, registrado em `app.config.ts`
- [ ] Integração WhatsApp (Evolution API — estrutura já existe)
- [ ] Sistema de cupons avançado (por categoria, por usuário)
- [ ] Dashboard analytics mais detalhado
- [ ] Sistema de reviews de produtos
- [ ] Integração com Google Analytics / Meta Pixel
- [ ] App mobile (Ionic/Capacitor usando Angular existente)

---

## 6. Resumo Executivo

| Categoria | Total | Implementado | Pendente |
|-----------|-------|-------------|----------|
| Módulos Backend | 12 | 12 | 0 |
| Páginas Frontend | ~30 | ~30 | 0 |
| Modelos de Banco | 16 | 16 | 0 |
| Testes Unit Backend | 15+ | 15 (303+ testes) | 0 |
| Testes Unit Frontend | 6 | 6 (components) + 15 (services) | — |
| Testes E2E | 4 suites | 4 (public-pages, auth, shop, critical-flows) | Fluxo live pós-pagamento |
| CI/CD | 3 | 3 (ci, deploy-backend, deploy-frontend) | Configurar secrets |
| Deploy Config | 2 | 2 (frontend + backend) | Configurar variáveis de produção |
| Documentação API | — | 1 (Swagger/OpenAPI em /api/docs) | — |
| Monitoramento | — | 1 (Sentry — backend + frontend) | Configurar `SENTRY_DSN` |

### Estimativa para Production-Ready

| Fase | Itens | Esforço Estimado |
|------|-------|------------------|
| 🔴 Crítico | CI/CD, Deploy, Segurança, Pagamentos | 2-3 semanas |
| 🟡 Alta | Admin completo, Testes, i18n, E-mails, Monitoramento | 3-4 semanas |
| 🟢 Média | Performance, UX, Features, Docs, Legal | 2-3 semanas |
| **Total para MVP produção** | **Fases Crítica + Alta** | **5-7 semanas** |

---

## 7. Conclusão

O projeto IzaCenter tem uma **base sólida e bem estruturada**. A arquitetura é moderna (Angular 20, Express 5, Prisma 7) e segue boas práticas (standalone components, MVC, validação com Zod, security headers). O schema do banco de dados é completo e os módulos cobrem todas as funcionalidades essenciais do negócio.

**Os maiores gaps para produção são:**
1. **Infraestrutura de deploy** — Sem CI/CD e sem configuração de deploy para o backend
2. **Segurança** — Credenciais expostas (corrigido), faltam chaves de produção
3. **Testes** — Cobertura insuficiente para garantir confiabilidade
4. **Pagamentos** — Fluxo de reembolso incompleto
5. **Admin** — 2-3 páginas faltantes

Com foco nas prioridades críticas e altas, o projeto pode estar pronto para produção em **5-7 semanas** de desenvolvimento dedicado.
