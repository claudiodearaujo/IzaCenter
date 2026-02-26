# IzaCenter — Review Completo & Plano de Produção

> **Data:** Fevereiro 2026
> **Projeto:** IzaCenter (Izabela Tarot) — Plataforma de Tarot Cigano com e-commerce
> **Stack:** Angular 20 + PrimeNG + Tailwind (Frontend) | Express 5 + Prisma + PostgreSQL (Backend)
> **Revisado em:** 26/02/2026 — Auditoria completa dos arquivos reais vs. status declarado

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
| i18n | ✅ ngx-translate | 4 idiomas (PT-BR, EN, ES, FR) — 1.400+ chaves por idioma |
| Routing | ✅ Lazy loading | Rotas por feature, todas mapeadas |
| Auth | ✅ Guards + Interceptor | authGuard, adminGuard, clientGuard |
| State | ✅ Angular Signals | Estado reativo sem NgRx |
| SEO | ✅ robots.txt + sitemap.xml | Configurados |
| PWA | ✅ Service Worker | ngsw-config.json + @angular/service-worker registrado |

### 2.2 Backend (Express 5 + Prisma)
| Aspecto | Status | Detalhes |
|---------|--------|----------|
| Framework | ✅ Express 5 + TypeScript | Arquitetura MVC |
| ORM | ✅ Prisma 7 | PostgreSQL via Supabase |
| Auth | ✅ JWT com refresh token | Blacklist via Redis |
| Pagamentos | ✅ Stripe | Checkout sessions + 6 webhook handlers (sync, async, refund) |
| Upload | ✅ Multer + Supabase Storage | Imagens com compressão via sharp |
| E-mail | ✅ Nodemailer (SMTP) | 7 templates HTML com layout base reutilizável |
| Segurança | ✅ Helmet + CORS + Rate Limiting | Configurado |
| Validação | ✅ Zod | Schemas para auth, orders, products, users |
| Cache | ⚠️ Redis opcional | Mock em dev/test; obrigatório em produção |

### 2.3 Banco de Dados (16 modelos verificados)
`User`, `ProductCategory`, `Product`, `ProductAttachment`, `Order`, `OrderItem`, `CiganoCard`, `Reading`, `ReadingCard`, `ScheduleSettings`, `Appointment`, `BlockedSlot`, `Testimonial`, `Coupon`, `SiteSetting`, `Notification`

### 2.4 Módulos do Backend (12 módulos verificados)
`auth`, `users`, `products`, `orders`, `webhooks`, `readings`, `cards`, `appointments`, `categories`, `testimonials`, `settings`, `dashboard`, `notifications`

---

## 3. O que já está Implementado ✅

### 3.1 Backend — Funcionalidades Completas (verificadas nos arquivos)
- [x] Autenticação (registro, login, logout, refresh token, esqueci senha, reset senha)
- [x] CRUD de usuários com roles (CLIENT/ADMIN)
- [x] CRUD de produtos com categorias e upload de imagens (com compressão sharp)
- [x] Sistema de pedidos com carrinho e cupons de desconto
- [x] Endpoint de validação de cupom (`POST /orders/coupon/validate`)
- [x] Integração Stripe (checkout sessions, webhooks com 6 handlers, idempotência via Redis)
- [x] Sistema de leituras de tarot (criação, edição, publicação, upload de áudio)
- [x] Gerenciamento de cartas do Tarot Cigano (36 cartas, geração de deck completo)
- [x] Sistema de agendamentos com verificação de conflitos e slots disponíveis
- [x] CRUD de depoimentos com aprovação
- [x] Configurações do site: geral, contato, horários de funcionamento, conteúdo, analytics
- [x] Dashboard admin com estatísticas, gráfico de vendas e top produtos
- [x] Módulo de notificações in-app (listar, marcar lido, deletar)
- [x] Rate limiting por tipo de rota
- [x] Tratamento de erros centralizado
- [x] Health check com verificação de DB e Redis
- [x] Audit logging para operações sensíveis
- [x] Monitoramento Sentry (backend + frontend)
- [x] Documentação Swagger/OpenAPI em `/api/docs`

### 3.2 Frontend — Módulo Público/Loja (verificado nos arquivos)
- [x] Layout público (header com busca global, footer, notificações, seletor de idioma)
- [x] Página Home com produtos em destaque e depoimentos
- [x] Página Sobre com SEO (Person schema, BreadcrumbList)
- [x] Página Serviços (4 tipos com features, preços e ícones)
- [x] Página FAQ com accordion e schema estruturado
- [x] Página Depoimentos
- [x] Termos de Uso e Política de Privacidade (LGPD)
- [x] Loja — listagem com filtros (categoria, tipo, preço, busca, ordenação)
- [x] Loja — detalhe do produto (galeria, features, questão do cliente)
- [x] Carrinho com ajuste de quantidade, remoção, notas por item e sistema de cupons
- [x] Checkout com integração Stripe real (redirect para Stripe checkout)
- [x] Cookie consent integrado no public-layout

### 3.3 Frontend — Módulo Cliente (verificado nos arquivos)
- [x] Dashboard com stats reais da API (`/users/me/stats`)
- [x] Listagem de leituras com filtro por status e links para detalhe
- [x] Detalhe da leitura (título, interpretação, cards, áudio)
- [x] Listagem de agendamentos (tabs: próximos/passados, cancel com validação 24h, link de reunião)
- [x] Listagem de pedidos com status e links para detalhe
- [x] Detalhe do pedido com download via `window.print()` (PDF do browser)
- [x] Perfil do cliente (edição de dados, avatar, troca de senha, preferências de notificação)

### 3.4 Frontend — Módulo Admin (verificado nos arquivos)
- [x] Dashboard admin com estatísticas, gráficos e top produtos
- [x] Gestão de leituras: lista paginada + formulário completo (editor, cards, áudio, publicação)
- [x] Gestão de agendamentos com atualização de status e reagendamento
- [x] Gestão de pedidos (lista, filtro por status, notas admin, cancelamento)
- [x] Gestão de produtos (lista, formulário de criação/edição com upload de imagem)
- [x] Gestão de categorias com CRUD completo e reordenação
- [x] Gestão de cartas (CRUD completo, geração de deck com 36 cartas)
- [x] Gestão de usuários (lista, detalhe, alteração de role e status)
- [x] Gestão de depoimentos com aprovação
- [x] Disponibilidade — configuração de horários por dia da semana com slots e buffers
- [x] Relatórios — gráfico de vendas, top produtos, estatísticas por período
- [x] Configurações (gerais, contato, conteúdo, analytics)
- [x] Notification bell integrada no header com badge, dropdown e ações

### 3.5 Infraestrutura (verificada nos arquivos)
- [x] Schema do banco de dados com 16 modelos e índices
- [x] 2 migrações do Prisma
- [x] Seed de dados para desenvolvimento
- [x] 3 workflows GitHub Actions (CI, deploy-backend, deploy-frontend)
- [x] 4 suites de testes E2E Playwright (public-pages, auth, shop, critical-flows)
- [x] 15+ suites de testes unitários backend (303+ testes)
- [x] Testes unitários frontend (services + components)
- [x] Mocks para Prisma, e-mail, Stripe, Supabase
- [x] Configuração de deploy no Render (frontend + backend)
- [x] Dockerfile para backend

---

## 4. Lacunas Reais Encontradas na Auditoria 🔴🟡

> Esta seção lista o que está **genuinamente faltando** após verificação direta nos arquivos.

### 4.1 🔴 Frontend — Páginas Pós-Pagamento Ausentes (CRÍTICO)

Após o redirect para o Stripe, o cliente é devolvido para uma URL de sucesso/cancelamento. Essas páginas **não existem**:

- [ ] Criar página `/checkout/sucesso` — confirmação de pedido realizado com sucesso
- [ ] Criar página `/checkout/cancelado` — mensagem quando o pagamento é cancelado
- [ ] Configurar `success_url` e `cancel_url` no backend para apontar para as páginas corretas
- [ ] Integrar chamada à API para buscar status do pedido na página de sucesso

**Impacto:** Cliente fica sem feedback após pagamento; experiência de compra incompleta.

### 4.2 🔴 Frontend — Formulário de Agendamento Inexistente no Módulo Cliente (CRÍTICO)

A área do cliente mostra apenas **listagem** de agendamentos existentes. Não há como o cliente **agendar** uma sessão nova:

- [ ] Criar componente de booking: `client/appointments/appointment-booking`
- [ ] Integrar com `GET /appointments/available-slots?date=YYYY-MM-DD`
- [ ] Seletor de data + horários disponíveis em tempo real
- [ ] Formulário de confirmação e submissão do agendamento
- [ ] Adicionar rota `/cliente/agendar` e link no dashboard/menu

**Impacto:** Funcionalidade central do negócio (agendamento de sessões) inacessível para clientes.

### 4.3 🟡 Frontend — Formulário de Contato sem Backend (ALTA)

O componente `contact.component.ts` tem um comentário explícito `// TODO: Send to API` e simula sucesso com `setTimeout(1000)`:

```typescript
// TODO: Send to API
await new Promise(resolve => setTimeout(resolve, 1000));  // Fake delay
```

- [ ] Criar endpoint no backend para receber mensagens de contato
- [ ] Implementar envio de e-mail com `emailUtil` quando formulário for submetido
- [ ] Conectar `contact.component.ts` ao endpoint real

**Impacto:** Mensagens de clientes nunca chegam; formulário dá falsa sensação de sucesso.

### 4.4 🟡 Frontend — Depoimentos Hardcoded na Página Pública (ALTA)

A página `testimonials.component.html` exibe **6 depoimentos estáticos** no HTML, ignorando completamente a API e o módulo de depoimentos do backend:

- [ ] Integrar `TestimonialsService.findPublic()` na página de depoimentos
- [ ] Substituir dados hardcoded por dados dinâmicos da API
- [ ] Adicionar loading state e tratamento de lista vazia

**Impacto:** Depoimentos aprovados pelo admin não aparecem no site; módulo de gestão de depoimentos inutilizado para o site público.

### 4.5 🟡 Backend — Geração de PDF de Pedidos no Servidor Ausente (ALTA)

O modelo `Reading` tem campos `pdfUrl` e `pdfGeneratedAt`, mas não há endpoint para geração de PDF no servidor. A solução atual usa `window.print()` no cliente:

- [ ] Implementar geração de PDF server-side (biblioteca: `pdfkit` ou `puppeteer`)
- [ ] Criar endpoint `GET /orders/:id/pdf` que retorna o PDF gerado
- [ ] Criar endpoint `GET /readings/:id/pdf` para PDF das leituras
- [ ] Armazenar PDF gerado no Supabase Storage e salvar URL no modelo

**Impacto:** `window.print()` produz resultado inconsistente entre navegadores; leituras não têm PDF profissional para download.

### 4.6 🟢 Infraestrutura — Configurações de Produção Pendentes (MÉDIA)

Itens que requerem ação manual (acesso a serviços externos):

- [ ] Configurar secrets do GitHub (`RENDER_BACKEND_DEPLOY_HOOK`, `RENDER_FRONTEND_DEPLOY_HOOK`, `E2E_BASE_URL`)
- [ ] Configurar variáveis de produção no Render (Stripe live keys, SMTP, Redis URL)
- [ ] Configurar Redis em produção (obrigatório para token blacklist e idempotência de webhooks)
- [ ] Configurar domínio e SSL/TLS no Render
- [ ] Rotacionar credenciais do banco (expostas anteriormente no `.env.example`)
- [ ] Configurar domínio de e-mail verificado (SPF, DKIM, DMARC)
- [ ] Configurar `SENTRY_DSN` e alertas no painel do Sentry
- [ ] Configurar CDN para assets estáticos

---

## 5. Plano Completo para Produção

### 🔴 Prioridade CRÍTICA (Bloqueia funcionalidade central)

#### 5.1 Páginas Pós-Pagamento (NOVO — não estava mapeado)
- [ ] Implementar `checkout/sucesso/sucesso.component.ts` com confirmação de pedido
- [ ] Implementar `checkout/cancelado/cancelado.component.ts` com opção de retry
- [ ] Atualizar backend para usar URLs corretas no `createCheckoutSession`
- [ ] Adicionar rotas em `app.routes.ts`

#### 5.2 Formulário de Agendamento no Cliente (NOVO — não estava mapeado)
- [ ] Criar `client/appointments/appointment-booking/` component
- [ ] Seletor de data com calendário interativo
- [ ] Consulta de slots disponíveis em tempo real
- [ ] Submissão e confirmação do agendamento
- [ ] Adicionar rota e navegação

#### 5.3 CI/CD & Deploy (Requer acesso externo)
- [x] Criar GitHub Actions workflow para CI — `.github/workflows/ci.yml`
- [x] Criar workflow de deploy automático backend — `deploy-backend.yml`
- [x] Criar workflow de deploy automático frontend — `deploy-frontend.yml`
- [ ] Configurar secrets nos GitHub Actions
- [ ] Configurar variáveis de produção no Render

#### 5.4 Segurança (Requer acesso externo)
- [ ] Rotacionar credenciais do banco expostas
- [ ] Configurar chaves Stripe de produção (live mode)
- [ ] Definir JWT_SECRET e JWT_REFRESH_SECRET fortes para produção
- [ ] Habilitar HTTPS em todas as comunicações

#### 5.5 Pagamentos
- [ ] Testar fluxo completo de pagamento em modo live
- [ ] Testar edge cases (falha, timeout, pagamento assíncrono com boleto/PIX)
- [x] Implementar tratamento de reembolsos
- [x] Implementar idempotência em webhooks
- [x] Implementar tratamento de falha de pagamento

### 🟡 Prioridade ALTA

#### 5.6 Formulário de Contato
- [ ] Criar endpoint `POST /contact` no backend
- [ ] Implementar envio de e-mail ao receber contato
- [ ] Conectar `contact.component.ts` ao endpoint real

#### 5.7 Depoimentos Dinâmicos
- [ ] Conectar página pública de depoimentos à API
- [ ] Remover dados hardcoded do template HTML

#### 5.8 Geração de PDF Server-Side
- [ ] Instalar biblioteca de PDF (`pdfkit` ou `puppeteer`)
- [ ] Implementar `GET /orders/:id/pdf`
- [ ] Implementar `GET /readings/:id/pdf`
- [ ] Armazenar PDFs no Supabase Storage

#### 5.9 Testes
- [x] Aumentar cobertura de testes unitários do backend — 303+ testes (15 suites)
- [x] Adicionar testes unitários para controllers do backend
- [x] Adicionar testes E2E (4 suites Playwright)
- [ ] Testar fluxo crítico completo: registro → compra → pagamento → leitura
- [ ] Testar fluxo de agendamento end-to-end

#### 5.10 E-mails (Requer acesso externo)
- [x] Templates implementados (7 templates com layout reutilizável)
- [ ] Configurar domínio de e-mail verificado (SPF, DKIM, DMARC)
- [ ] Testar todos os fluxos de e-mail em produção

#### 5.11 Monitoramento
- [x] Logging em produção — morgan `combined` format
- [x] Health check detalhado — verifica DB e Redis
- [x] Audit logging para operações sensíveis
- [x] Integração Sentry (backend + frontend)
- [ ] Configurar alertas para erros críticos no painel Sentry

### 🟢 Prioridade MÉDIA

#### 5.12 Performance
- [x] Cache Redis para queries frequentes (produtos, categorias)
- [x] Compressão de imagens no upload (sharp)
- [x] Paginação cursor-based para listagens grandes
- [x] Budget de build Angular configurado
- [ ] Configurar CDN para assets estáticos

#### 5.13 UX/UI
- [x] Loading states (skeleton) em todas as páginas admin
- [x] Toast notifications via NotificationService
- [x] Página 404 customizada
- [x] Tratamento de erros offline/network (status 0, 429, 503)
- [ ] Testar responsividade em dispositivos móveis

#### 5.14 Legal & Compliance
- [x] Página de Termos de Uso
- [x] Página de Política de Privacidade (LGPD)
- [x] Banner de consentimento de cookies
- [x] Opt-out de comunicações no perfil do cliente
- [ ] Verificar compliance com regulamentações de pagamento (PCI DSS via Stripe)

### 🔵 Prioridade BAIXA (Nice-to-have)

#### 5.15 Futuras Melhorias
- [x] PWA completo com service worker
- [ ] Integração WhatsApp (Evolution API — estrutura já existe)
- [ ] Sistema de cupons avançado (por categoria, por usuário)
- [ ] Dashboard analytics mais detalhado com exportação
- [ ] Sistema de reviews/avaliações de produtos
- [ ] Integração com Google Analytics / Meta Pixel
- [ ] App mobile (Ionic/Capacitor usando Angular existente)

---

## 6. Resumo Executivo (Auditoria 26/02/2026)

| Categoria | Total | Implementado | Pendente |
|-----------|-------|-------------|----------|
| Módulos Backend | 13 | 13 | 0 |
| Páginas Frontend (Admin) | 14 | 14 | 0 |
| Páginas Frontend (Cliente) | 7 | 6 | 1 (booking) |
| Páginas Frontend (Loja) | 6 | 4 | 2 (sucesso/cancelado) |
| Páginas Frontend (Público) | 10 | 10 | 0 (contato conectado: ❌ API) |
| Modelos de Banco | 16 | 16 | 0 |
| Email Templates | 7 | 7 | 0 |
| Webhook Handlers (Stripe) | 6 | 6 | 0 |
| Testes Unit Backend | 15 suites | 303+ testes | 0 |
| Testes Unit Frontend | 15 services + 6 components | Implementados | — |
| Testes E2E | 4 suites | 28+ testes | Fluxo agendamento |
| Endpoints API | ~50 | ~50 | 2 (contact, PDF) |
| CI/CD Workflows | 3 | 3 | Configurar secrets |
| Deploy Config | 2 | 2 (frontend + backend) | Variáveis de produção |
| i18n (idiomas × módulos) | 4 × 14 | 100% | 0 |
| Documentação API | — | Swagger em `/api/docs` | — |
| Monitoramento | — | Sentry integrado | Configurar DSN |

### Lacunas Críticas para MVP (resumo)

| # | Lacuna | Módulo | Impacto |
|---|--------|--------|---------|
| 1 | Páginas pós-pagamento (sucesso/cancelado) | Loja | **Alto** — UX de compra incompleta |
| 2 | Formulário de agendamento (cliente) | Cliente | **Alto** — Funcionalidade central do negócio |
| 3 | Formulário de contato sem backend | Público | **Médio** — Perda de leads |
| 4 | Depoimentos hardcoded na página pública | Público | **Médio** — Admin inutilizado para front |
| 5 | Geração de PDF server-side | Backend | **Médio** — UX inconsistente |
| 6 | Configuração de produção (secrets, Redis, SMTP) | Infra | **Alto** — Requer acesso externo |

### Estimativa para Production-Ready

| Fase | Itens | Esforço Estimado |
|------|-------|------------------|
| 🔴 Crítico | Páginas pós-pagamento, Booking form, CI/CD secrets, segurança | 1-2 semanas |
| 🟡 Alta | Contato API, Depoimentos dinâmicos, PDF server-side, testes E2E completos | 1-2 semanas |
| 🟢 Média | Performance, UX mobile, Legal | 1 semana |
| **Total para MVP produção** | **Fases Crítica + Alta** | **2-4 semanas** |

---

## 7. Conclusão

O projeto IzaCenter tem uma **base sólida e bem estruturada** com **~85% do código implementado e verificado**. A arquitetura é moderna (Angular 20 standalone, Express 5, Prisma 7) e segue boas práticas (MVC, validação com Zod, security headers, i18n completo).

**Os maiores gaps reais encontrados na auditoria são:**
1. **Fluxo pós-pagamento** — Páginas de sucesso/cancelamento do Stripe ausentes
2. **Agendamento pelo cliente** — Funcionalidade central sem interface de booking
3. **Formulário de contato** — Dados de clientes nunca chegam ao servidor
4. **Depoimentos estáticos** — O módulo de gestão de depoimentos não alimenta o site público
5. **Configuração de produção** — Requer ação manual (secrets, domínio, Redis, SMTP)

Com foco nessas lacunas críticas, o projeto pode estar **pronto para produção em 2-4 semanas** de desenvolvimento dedicado.
