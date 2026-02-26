# IzaCenter — Status de Implementação e Cobertura de Testes

> **Data:** Fevereiro 2026
> **Projeto:** IzaCenter (Izabela Tarot) — Plataforma de Tarot Cigano com e-commerce
> **Stack:** Angular 20 + PrimeNG + Tailwind (Frontend) | Express 5 + Prisma + PostgreSQL (Backend)

---

## 1. Resumo Executivo

| Área | Itens | Implementados | Cobertura de Testes | Status Geral |
|------|-------|:---:|:---:|:---:|
| **Páginas Públicas** | 9 | 9 (100%) | Parcial | ✅ |
| **Autenticação** | 4 | 4 (100%) | Parcial | ✅ |
| **Loja (Shop)** | 4 | 4 (100%) | Parcial | ✅ |
| **Área do Cliente** | 7 | 7 (100%) | Baixa | ⚠️ |
| **Painel Admin** | 16 | 16 (100%) | Média | ⚠️ |
| **Backend — Serviços** | 12 | 12 (100%) | Alta | ✅ |
| **Backend — Controllers** | 8 | 8 (100%) | Média | ⚠️ |
| **Backend — Integração** | 3+ | 3 (base) | Baixa | ⚠️ |
| **E2E (Playwright)** | 4 suites | 4 (100%) | Boa | ✅ |

---

## 2. Páginas do Frontend — Status de Implementação

### 2.1 Site Público (`/features/public/`)

| Página | Rota | Componente | Implementado | Backend Integrado | Spec |
|--------|------|-----------|:---:|:---:|:---:|
| Home | `/` | `HomeComponent` | ✅ | ✅ Depoimentos, Produtos | ❌ |
| Sobre | `/sobre` | `AboutComponent` | ✅ | ➖ Estática | ❌ |
| Serviços | `/servicos` | `ServicesComponent` | ✅ | ✅ Produtos/Categorias | ❌ |
| Contato | `/contato` | `ContactComponent` | ✅ | ✅ Email via API | ❌ |
| Depoimentos | `/depoimentos` | `TestimonialsComponent` | ✅ | ✅ API Depoimentos | ❌ |
| FAQ | `/faq` | `FaqComponent` | ✅ | ✅ Settings dinâmico | ❌ |
| Termos | `/termos` | `TermsComponent` | ✅ | ✅ Settings dinâmico | ❌ |
| Privacidade | `/privacidade` | `PrivacyComponent` | ✅ | ✅ Settings dinâmico | ❌ |
| 404 | `**` | `NotFoundComponent` | ✅ | ➖ Estática | ✅ |

> **Legenda:** ✅ Implementado | ❌ Faltante | ➖ Não aplicável (página estática)

### 2.2 Autenticação (`/features/auth/`)

| Página | Rota | Componente | Implementado | Backend Integrado | Spec |
|--------|------|-----------|:---:|:---:|:---:|
| Login | `/login` | `LoginComponent` | ✅ | ✅ `POST /auth/login` | ❌ |
| Cadastro | `/cadastro` | `RegisterComponent` | ✅ | ✅ `POST /auth/register` | ❌ |
| Esqueci Senha | `/esqueci-senha` | `ForgotPasswordComponent` | ✅ | ✅ `POST /auth/forgot-password` | ❌ |
| Redefinir Senha | `/redefinir-senha` | `ResetPasswordComponent` | ✅ | ✅ `POST /auth/reset-password` | ❌ |

### 2.3 Loja (`/features/shop/`)

| Página | Rota | Componente | Implementado | Backend Integrado | Spec |
|--------|------|-----------|:---:|:---:|:---:|
| Catálogo | `/loja` | `ProductListComponent` | ✅ | ✅ `GET /products` | ❌ |
| Detalhe do Produto | `/loja/:slug` | `ProductDetailComponent` | ✅ | ✅ `GET /products/:slug` | ❌ |
| Carrinho | `/carrinho` | `CartComponent` | ✅ | ✅ Estado local + API | ❌ |
| Checkout | `/checkout` | `CheckoutComponent` | ✅ | ✅ `POST /orders` + Stripe | ❌ |

### 2.4 Área do Cliente (`/features/client/`)

| Página | Rota | Componente | Implementado | Backend Integrado | Spec |
|--------|------|-----------|:---:|:---:|:---:|
| Dashboard | `/cliente` | `DashboardComponent` | ✅ | ✅ `GET /users/me/stats` | ❌ |
| Leituras | `/cliente/leituras` | `ReadingListComponent` | ✅ | ✅ `GET /readings/me` | ❌ |
| Detalhe Leitura | `/cliente/leituras/:id` | `ReadingDetailComponent` | ✅ | ✅ `GET /readings/:id` | ❌ |
| Agendamentos | `/cliente/agendamentos` | `AppointmentListComponent` | ✅ | ✅ `GET /appointments/me` | ❌ |
| Pedidos | `/cliente/pedidos` | `OrderListComponent` | ✅ | ✅ `GET /orders` | ❌ |
| Detalhe Pedido | `/cliente/pedidos/:id` | `OrderDetailComponent` | ✅ | ✅ `GET /orders/:id` | ❌ |
| Perfil | `/cliente/perfil` | `ProfileComponent` | ✅ | ✅ `PUT /users/me` | ❌ |

> ⚠️ **Atenção:** Nenhum componente da área do cliente possui spec de teste unitário.

### 2.5 Painel Administrativo (`/features/admin/`)

| Página | Rota | Componente | Implementado | Backend Integrado | Spec |
|--------|------|-----------|:---:|:---:|:---:|
| Dashboard | `/admin` | `AdminDashboardComponent` | ✅ | ✅ `GET /dashboard/stats` | ✅ |
| Leituras (lista) | `/admin/leituras` | `AdminReadingListComponent` | ✅ | ✅ `GET /readings` | ❌ |
| Leitura (form) | `/admin/leituras/:id` | `ReadingFormComponent` | ✅ | ✅ `PUT /readings/:id` | ❌ |
| Agendamentos | `/admin/agendamentos` | `AdminAppointmentListComponent` | ✅ | ✅ `GET /appointments` | ✅ |
| Produtos (lista) | `/admin/produtos` | `AdminProductListComponent` | ✅ | ✅ `GET /products` | ✅ |
| Produto (form) | `/admin/produtos/:id` | `ProductFormComponent` | ✅ | ✅ `POST/PUT /products` | ❌ |
| Categorias | `/admin/categorias` | `CategoryListComponent` | ✅ | ✅ `GET /categories` | ❌ |
| Cartas | `/admin/cartas` | `CardListComponent` | ✅ | ✅ `GET /cards` | ❌ |
| Usuários (lista) | `/admin/usuarios` | `UserListComponent` | ✅ | ✅ `GET /users` | ❌ |
| Usuário (detalhe) | `/admin/usuarios/:id` | `UserDetailComponent` | ✅ | ✅ `GET /users/:id` | ❌ |
| Depoimentos | `/admin/depoimentos` | `TestimonialListComponent` | ✅ | ✅ `GET /testimonials` | ❌ |
| Disponibilidade | `/admin/disponibilidade` | `AdminAvailabilityComponent` | ✅ | ✅ `GET/PUT /settings` | ✅ |
| Pedidos | `/admin/pedidos` | `AdminOrderListComponent` | ✅ | ✅ `GET /orders` | ✅ |
| Relatórios | `/admin/relatorios` | `AdminReportsComponent` | ✅ | ✅ `GET /dashboard/stats` | ✅ |
| Configurações | `/admin/configuracoes` | `SettingsComponent` | ✅ | ✅ `GET/PUT /settings` | ❌ |

---

## 3. Cobertura de Testes — Frontend

### 3.1 Testes de Serviços (Karma/Jasmine)

| Serviço | Arquivo Spec | Status |
|---------|-------------|:---:|
| `ApiService` | `api.service.spec.ts` | ✅ |
| `AuthService` | `auth.service.spec.ts` | ✅ |
| `ProductsService` | `products.service.spec.ts` | ✅ |
| `OrdersService` | `orders.service.spec.ts` | ✅ |
| `AppointmentsService` | `appointments.service.spec.ts` | ✅ |
| `ReadingsService` | `readings.service.spec.ts` | ✅ |
| `CardsService` | `cards.service.spec.ts` | ✅ |
| `CategoriesService` | `categories.service.spec.ts` | ✅ |
| `CartService` | `cart.service.spec.ts` | ✅ |
| `DashboardService` | `dashboard.service.spec.ts` | ✅ |
| `UsersService` | `users.service.spec.ts` | ✅ |
| `NotificationService` | `notification.service.spec.ts` | ✅ |
| `SettingsService` | `settings.service.spec.ts` | ✅ |
| `TestimonialsService` | `testimonials.service.spec.ts` | ✅ |
| `StorageService` | `storage.service.spec.ts` | ✅ |

> **Cobertura de serviços:** 15/15 serviços com testes ✅

### 3.2 Testes de Componentes (Karma/Jasmine)

| Componente | Arquivo Spec | Status |
|-----------|-------------|:---:|
| `AppComponent` | `app.spec.ts` | ✅ |
| **Compartilhados** | | |
| `HeaderComponent` | `header.component.spec.ts` | ✅ |
| `FooterComponent` | `footer.component.spec.ts` | ✅ |
| `LoadingSpinnerComponent` | `loading-spinner.component.spec.ts` | ✅ |
| `ProductCardComponent` | `product-card.component.spec.ts` | ✅ |
| `TestimonialCardComponent` | `testimonial-card.component.spec.ts` | ✅ |
| `CookieConsentComponent` | `cookie-consent.component.spec.ts` | ✅ |
| **Páginas Públicas** | | |
| `NotFoundComponent` | `not-found.component.spec.ts` | ✅ |
| `HomeComponent` | — | ❌ |
| `AboutComponent` | — | ❌ |
| `ServicesComponent` | — | ❌ |
| `ContactComponent` | — | ❌ |
| `TestimonialsComponent` | — | ❌ |
| `FaqComponent` | — | ❌ |
| `TermsComponent` | — | ❌ |
| `PrivacyComponent` | — | ❌ |
| **Autenticação** | | |
| `LoginComponent` | — | ❌ |
| `RegisterComponent` | — | ❌ |
| `ForgotPasswordComponent` | — | ❌ |
| `ResetPasswordComponent` | — | ❌ |
| **Loja** | | |
| `ProductListComponent` (shop) | — | ❌ |
| `ProductDetailComponent` | — | ❌ |
| `CartComponent` | — | ❌ |
| `CheckoutComponent` | — | ❌ |
| **Área do Cliente** | | |
| `DashboardComponent` (client) | `dashboard.component.spec.ts` | ✅ |
| `ReadingListComponent` (client) | — | ❌ |
| `ReadingDetailComponent` (client) | — | ❌ |
| `AppointmentListComponent` (client) | — | ❌ |
| `OrderListComponent` (client) | — | ❌ |
| `OrderDetailComponent` (client) | — | ❌ |
| `ProfileComponent` (client) | — | ❌ |
| **Admin** | | |
| `AdminDashboardComponent` | `dashboard.component.spec.ts` | ✅ |
| `AdminAppointmentListComponent` | `appointment-list.component.spec.ts` | ✅ |
| `AdminProductListComponent` | `product-list.component.spec.ts` | ✅ |
| `AdminAvailabilityComponent` | `availability.component.spec.ts` | ✅ |
| `AdminOrderListComponent` | `order-list.component.spec.ts` | ✅ |
| `AdminReportsComponent` | `reports.component.spec.ts` | ✅ |
| `AdminReadingListComponent` | — | ❌ |
| `ReadingFormComponent` | — | ❌ |
| `CategoryListComponent` | — | ❌ |
| `CardListComponent` | — | ❌ |
| `UserListComponent` | — | ❌ |
| `UserDetailComponent` | — | ❌ |
| `TestimonialListComponent` | — | ❌ |
| `SettingsComponent` | — | ❌ |
| `ProductFormComponent` | — | ❌ |

> **Cobertura de componentes:** ~15/44 componentes com testes (≈ 34%)
>
> **Componentes com maior prioridade para cobertura:**
> 1. 🔴 Área do Cliente — 0/7 componentes testados (foco: fluxos críticos do usuário)
> 2. 🟡 Autenticação — 0/4 componentes testados (foco: formulários de login/cadastro)
> 3. 🟡 Loja — 0/4 componentes testados (foco: checkout e carrinho)

### 3.3 Testes E2E (Playwright)

| Suite | Arquivo | Cenários Cobertos |
|-------|---------|------------------|
| Páginas Públicas | `public-pages.spec.ts` | Navegação, SEO, responsividade |
| Autenticação | `auth.spec.ts` | Login, cadastro, esqueci senha |
| Loja | `shop.spec.ts` | Catálogo, produto, carrinho, checkout |
| Fluxos Críticos | `critical-flows.spec.ts` | Registro → compra → pagamento, troca de idioma |

> **Cobertura E2E:** 4/4 suites implementadas ✅

---

## 4. Cobertura de Testes — Backend

### 4.1 Testes de Serviços (Jest)

| Módulo | Arquivo Spec | Status |
|--------|-------------|:---:|
| `AuthService` | `auth.service.spec.ts` | ✅ |
| `UsersService` | `users.service.spec.ts` | ✅ |
| `ProductsService` | `products.service.spec.ts` | ✅ |
| `OrdersService` | `orders.service.spec.ts` | ✅ |
| `AppointmentsService` | `appointments.service.spec.ts` | ✅ |
| `ReadingsService` | `readings.service.spec.ts` | ✅ |
| `CardsService` | `cards.service.spec.ts` | ✅ |
| `CategoriesService` | `categories.service.spec.ts` | ✅ |
| `TestimonialsService` | `testimonials.service.spec.ts` | ✅ |
| `SettingsService` | `settings.service.spec.ts` | ✅ |
| `DashboardService` | `dashboard.service.spec.ts` | ✅ |
| `NotificationsService` | `notifications.service.spec.ts` | ✅ |

> **Cobertura de serviços:** 12/12 serviços com testes ✅

### 4.2 Testes de Controllers (Jest)

| Módulo | Arquivo Spec | Status |
|--------|-------------|:---:|
| `AuthController` | `auth.controller.spec.ts` | ✅ |
| `UsersController` | `users.controller.spec.ts` | ✅ |
| `ProductsController` | `products.controller.spec.ts` | ✅ |
| `OrdersController` | `orders.controller.spec.ts` | ✅ |
| `AppointmentsController` | `appointments.controller.spec.ts` | ✅ (19 testes) |
| `ReadingsController` | `readings.controller.spec.ts` | ✅ (20 testes) |
| `CardsController` | — | ❌ |
| `CategoriesController` | — | ❌ |
| `TestimonialsController` | — | ❌ |
| `SettingsController` | — | ❌ |
| `DashboardController` | — | ❌ |
| `NotificationsController` | — | ❌ |

> **Cobertura de controllers:** 6/12 controllers com testes (50%)
>
> **Controllers com maior prioridade para cobertura:**
> 1. 🟡 `DashboardController` — Endpoint crítico para o admin
> 2. 🟡 `SettingsController` — Configurações do site
> 3. 🟡 `TestimonialsController` — Moderação de conteúdo
> 4. 🟢 `CardsController` — CRUD das cartas do Tarot
> 5. 🟢 `CategoriesController` — CRUD de categorias
> 6. 🟢 `NotificationsController` — Notificações in-app

### 4.3 Testes de Integração (Jest)

| Módulo | Arquivo Spec | Status |
|--------|-------------|:---:|
| Cards | `cards.integration.spec.ts` | ✅ |
| Orders | `orders.integration.spec.ts` | ✅ |
| Users | `users.integration.spec.ts` | ✅ |
| Auth | — | ❌ |
| Products | — | ❌ |
| Appointments | — | ❌ |
| Readings | — | ❌ |

> **Cobertura de integração:** 3/7 módulos críticos com testes (43%)

---

## 5. Análise de Integração com o Backend

### 5.1 Serviços Frontend × Endpoints Backend

| Serviço Frontend | Endpoints Utilizados | Status |
|-----------------|---------------------|:---:|
| `AuthService` | `POST /auth/login`, `/auth/register`, `/auth/logout`, `/auth/refresh`, `/auth/forgot-password`, `/auth/reset-password` | ✅ |
| `ProductsService` | `GET /products`, `GET /products/:slug`, `POST/PUT/DELETE /products` | ✅ |
| `OrdersService` | `GET /orders`, `GET /orders/:id`, `POST /orders`, `PUT /orders/:id/status` | ✅ |
| `AppointmentsService` | `GET /appointments/me`, `POST /appointments`, `GET/PUT/DELETE /appointments/:id` | ✅ |
| `ReadingsService` | `GET /readings/me`, `GET /readings/:id`, `GET /readings`, `PUT /readings/:id` | ✅ |
| `CardsService` | `GET /cards`, `POST /cards`, `PUT/DELETE /cards/:id` | ✅ |
| `CategoriesService` | `GET /categories`, `POST /categories`, `PUT/DELETE /categories/:id` | ✅ |
| `CartService` | Estado local (localStorage) + `POST /orders` no checkout | ✅ |
| `DashboardService` | `GET /dashboard/stats`, `/dashboard/revenue`, `/dashboard/top-products` | ✅ |
| `UsersService` | `GET /users`, `GET /users/:id`, `PUT /users/:id`, `DELETE /users/:id` | ✅ |
| `SettingsService` | `GET /settings`, `PUT /settings` | ✅ |
| `TestimonialsService` | `GET /testimonials`, `POST /testimonials`, `PUT/DELETE /testimonials/:id` | ✅ |
| `NotificationService` | `GET /notifications`, `PUT /notifications/:id/read` | ✅ |

> **Cobertura de integração:** Todos os 13 serviços frontend estão integrados com os endpoints backend correspondentes. ✅

### 5.2 Endpoints Backend sem Consumidor Frontend

| Endpoint | Módulo | Observação |
|----------|--------|-----------|
| `GET /dashboard/revenue` | Dashboard | Disponível, usado em `reports.component.ts` via `DashboardService` |
| `GET /users/me/stats` | Users | Usado no dashboard do cliente |
| `GET /users/me/orders` | Users | Usado no dashboard do cliente |
| `GET /users/me/readings` | Users | Usado no dashboard do cliente |
| `POST /auth/verify-email` | Auth | Endpoint existe no backend, sem tela no frontend |
| `GET /stripe/config` | Webhooks/Stripe | Interno (webhook handler) |

> ⚠️ **Verificação de e-mail:** O backend possui endpoint `POST /auth/verify-email` mas o frontend não tem página de verificação de e-mail. Recomendado implementar se o fluxo de confirmação for necessário em produção.

---

## 6. Páginas que Ainda Precisam ser Melhoradas

### 6.1 Páginas com Implementação Completa mas Sem Testes

Todas as páginas estão implementadas. As seguintes precisam de cobertura de testes:

| Prioridade | Área | Componentes sem Spec |
|:---:|------|---------------------|
| 🔴 Alta | Cliente | `ReadingListComponent`, `ReadingDetailComponent`, `AppointmentListComponent`, `OrderListComponent`, `OrderDetailComponent`, `ProfileComponent` |
| 🟡 Média | Autenticação | `LoginComponent`, `RegisterComponent`, `ForgotPasswordComponent`, `ResetPasswordComponent` |
| 🟡 Média | Loja | `ProductListComponent`, `ProductDetailComponent`, `CartComponent`, `CheckoutComponent` |
| 🟢 Baixa | Admin | `ReadingListComponent`, `ReadingFormComponent`, `CategoryListComponent`, `CardListComponent`, `UserListComponent`, `UserDetailComponent`, `TestimonialListComponent`, `SettingsComponent`, `ProductFormComponent` |
| 🟢 Baixa | Público | `HomeComponent`, `AboutComponent`, `ServicesComponent`, `ContactComponent`, `TestimonialsComponent`, `FaqComponent`, `TermsComponent`, `PrivacyComponent` |

### 6.2 Funcionalidades Futuras Identificadas

| Feature | Descrição | Prioridade |
|---------|-----------|:---:|
| Verificação de E-mail | Tela para confirmar email após cadastro | 🟡 |
| Notificações Push | Integração com Web Push API | 🟢 |
| Painel de Relatórios Avançado | Export de PDF/Excel, filtros por data | 🟢 |
| WhatsApp Integration | CTA para WhatsApp nos agendamentos | 🟢 |
| Programa de Afiliados | Sistema de cupons por indicação | 🟢 |

---

## 7. Ações Recomendadas (Prioridade)

### 🔴 Crítico (Bloqueia produção)
- [ ] Configurar variáveis de ambiente no GitHub Secrets (Stripe, JWT, SMTP)
- [ ] Configurar Redis em produção (blacklist de tokens)
- [ ] Rotacionar credenciais do banco de dados (expostas anteriormente)
- [ ] Testar fluxo completo: registro → compra → pagamento Stripe → entrega

### 🟡 Alta (Qualidade para produção)
- [x] ~~Implementar página Admin Pedidos~~ — Concluído
- [x] ~~Implementar página Admin Disponibilidade~~ — Concluído
- [x] ~~Implementar página Admin Relatórios~~ — Concluído
- [x] ~~Corrigir rota `/admin/clientes` → `/admin/usuarios`~~ — Concluído
- [x] ~~Adicionar testes para controllers: `appointments`, `readings`~~ — Concluído (39 novos testes)
- [ ] Adicionar testes para controllers faltantes: `cards`, `categories`, `testimonials`, `settings`, `dashboard`, `notifications`
- [x] ~~Adicionar specs para área do cliente (DashboardComponent)~~ — Concluído
- [ ] Implementar tela de verificação de e-mail

### 🟢 Baixa (Nice-to-have)
- [ ] Adicionar specs para componentes de autenticação (Login, Register)
- [ ] Adicionar specs para componentes da loja (ProductList, Cart, Checkout)
- [ ] Expandir testes de integração (auth, products, appointments)
- [ ] Adicionar métricas de cobertura ao pipeline CI/CD (`jest --coverage`)
- [ ] Adicionar integração WhatsApp para agendamentos

---

## 8. Comandos para Executar os Testes

### Backend (Jest)
```bash
cd backend

# Todos os testes
npm test

# Com cobertura de código
npm run test:coverage

# Apenas testes de integração
npm run test:integration

# Modo watch (desenvolvimento)
npm run test:watch
```

### Frontend (Karma)
```bash
cd frontend

# Todos os testes unitários
npm test

# Com cobertura de código
npm run test:coverage

# Modo headless (CI)
npm run test:ci
```

### E2E (Playwright)
```bash
cd e2e

# Instalar browsers (primeira vez)
npx playwright install chromium

# Executar todos os testes E2E
npx playwright test

# Com interface visual
npx playwright test --ui

# Relatório de resultados
npx playwright show-report
```
