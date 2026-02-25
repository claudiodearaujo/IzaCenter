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
- [ ] Criar GitHub Actions workflow para CI (lint, build, testes)
- [ ] Criar workflow de deploy automático (backend → Render/Railway)
- [ ] Criar workflow de deploy automático (frontend → Render/Vercel)
- [ ] Configurar variáveis de ambiente nos secrets do GitHub

#### 5.2 Backend — Deploy em Produção
- [ ] Criar configuração de deploy para o backend (render.yaml ou Dockerfile)
- [ ] Configurar variáveis de produção (Stripe live keys, SMTP, etc.)
- [ ] Configurar Redis em produção (obrigatório para token blacklist)
- [ ] Configurar domínio e SSL/TLS
- [ ] Garantir que `NODE_ENV=production` está setado

#### 5.3 Segurança
- [ ] Rotacionar as credenciais do banco que foram expostas no .env.example
- [ ] Configurar chaves Stripe de produção (live mode)
- [ ] Definir JWT_SECRET forte e único para produção
- [ ] Habilitar HTTPS em todas as comunicações
- [ ] Revisar CORS para aceitar apenas domínio de produção
- [ ] Configurar secure cookies (HttpOnly, Secure, SameSite)

#### 5.4 Pagamentos
- [ ] Testar fluxo completo de pagamento com Stripe em modo live
- [ ] Implementar tratamento de reembolsos (webhook handler apenas loga atualmente)
- [ ] Implementar idempotência em webhooks (evitar processamento duplicado)
- [ ] Testar edge cases de pagamento (falha, timeout, pagamento assíncrono)

### 🟡 Prioridade ALTA (Importante para qualidade de produção)

#### 5.5 Menu Admin Incompleto (conforme MENU_AUDIT_TASKS.md)
- [ ] Implementar página de gestão de Pedidos (admin)
- [ ] Implementar página de gestão de Disponibilidade/Horários (admin)
- [ ] Implementar página de Relatórios (admin)
- [ ] Corrigir rota de Clientes no menu admin (apontar para /admin/usuarios)

#### 5.6 Testes
- [ ] Aumentar cobertura de testes unitários do backend (services sem .spec: products, readings, appointments, users)
- [ ] Adicionar testes unitários para controllers do backend
- [ ] Adicionar testes unitários para o frontend (services e components)
- [ ] Adicionar testes E2E (Playwright já está como dependência)
- [ ] Testar fluxos críticos: registro → compra → pagamento → leitura

#### 5.7 Internacionalização (conforme ADMIN_I18N_IMPLEMENTATION.md)
- [ ] Completar implementação i18n nos componentes admin
- [ ] Verificar cobertura de traduções em todas as páginas públicas
- [ ] Testar troca de idioma em todas as páginas

#### 5.8 E-mails
- [ ] Criar templates de e-mail profissionais (atualmente HTML inline)
- [ ] Configurar domínio de e-mail verificado (SPF, DKIM, DMARC)
- [ ] Testar todos os fluxos de e-mail (boas-vindas, reset senha, confirmação de pedido, publicação de leitura)

#### 5.9 Monitoramento e Logging
- [ ] Configurar logging em produção (ex: Morgan com formato combined + log rotation)
- [ ] Implementar monitoramento de aplicação (ex: Sentry, LogRocket)
- [ ] Configurar alertas para erros críticos
- [ ] Implementar health check mais detalhado (checar DB, Redis, Stripe)
- [ ] Audit logging para operações sensíveis (login, pagamentos, alterações de admin)

### 🟢 Prioridade MÉDIA (Melhorias para V1 robusta)

#### 5.10 Performance
- [ ] Implementar cache com Redis para queries frequentes (produtos, categorias)
- [ ] Adicionar compressão de imagens no upload
- [ ] Implementar paginação cursor-based para listagens grandes
- [ ] Configurar CDN para assets estáticos
- [ ] Budget de build do Angular: revisar limite de 1MB para initial bundle

#### 5.11 UX/UI
- [ ] Implementar loading states em todas as páginas
- [ ] Implementar feedback visual para ações do usuário (toast notifications)
- [ ] Implementar página 404 customizada
- [ ] Implementar tratamento de erros offline/network
- [ ] Adicionar skeleton loading nos componentes
- [ ] Testar responsividade em dispositivos móveis

#### 5.12 Funcionalidades Adicionais
- [ ] Implementar notificações in-app (modelo existe no banco)
- [ ] Implementar busca global de produtos
- [ ] Implementar filtros avançados na loja (por categoria, preço, tipo)
- [ ] Implementar histórico de pedidos com download de PDF
- [ ] Implementar sistema de agendamento configurável (ScheduleSettings existe mas horários são hardcoded no service)

#### 5.13 API & Documentação
- [ ] Adicionar versionamento de API (ex: /api/v1/)
- [ ] Implementar documentação OpenAPI/Swagger
- [ ] Documentar todos os endpoints com exemplos
- [ ] Criar README completo do projeto com instruções de setup

#### 5.14 Legal & Compliance
- [ ] Implementar página de Termos de Uso
- [ ] Implementar página de Política de Privacidade (LGPD)
- [ ] Implementar banner de consentimento de cookies
- [ ] Implementar sistema de opt-out de comunicações
- [ ] Verificar compliance com regulamentações de pagamento (PCI DSS via Stripe)

### 🔵 Prioridade BAIXA (Nice-to-have para versões futuras)

#### 5.15 Futuras Melhorias
- [ ] PWA completo com service worker para uso offline
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
| Páginas Frontend | ~30 | ~28 | ~2 (admin: pedidos, disponibilidade) |
| Modelos de Banco | 16 | 16 | 0 |
| Testes Unit Backend | 12+ | 7 | 5 |
| Testes E2E | — | 0 | Todos |
| CI/CD | — | 0 | Tudo |
| Deploy Config | 1 | 1 (frontend) | 1 (backend) |

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
