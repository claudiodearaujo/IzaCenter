# PRD — SaaS Foundation v1

**Status:** ✅ Implementado e validado

## Objetivo

Introduzir a fundação multi-tenant do Therapist Platform sem habilitar ainda operação SaaS pública e sem quebrar os dados single-tenant existentes.

Esta fase cria o conceito de Tenant, membership, contexto por request e isolamento de Settings. Os demais agregados continuam no tenant legado até a próxima etapa de Data Isolation.

## Princípios

- migração aditiva e reversível;
- tenant padrão preserva 100% do comportamento atual;
- nenhum novo tenant comercial é exposto antes do isolamento de dados;
- contexto de tenant nunca é inferido de dados do cliente;
- settings e branding passam a ser tenant-scoped;
- autenticação global existente é preservada nesta fase;
- membership é preparada para OWNER / ADMIN / CLIENT.

## Modelo

### Tenant
- id
- name
- slug
- status: ACTIVE | SUSPENDED | ARCHIVED
- planKey
- customDomain opcional
- timestamps

### TenantMembership
- tenantId
- userId
- role: OWNER | ADMIN | CLIENT
- isActive
- timestamps
- unique(tenantId, userId)

### SiteSetting
- passa de key global para unique(tenantId, key)
- registros atuais são backfilled para o tenant padrão

## Tenant padrão

ID determinístico:
`00000000-0000-0000-0000-000000000001`

Slug:
`default`

Todos os usuários existentes recebem membership no tenant padrão:
- UserRole.ADMIN -> OWNER
- UserRole.CLIENT -> CLIENT

## Resolução de tenant

Ordem:
1. header `X-Tenant-Slug` — uso explícito em desenvolvimento/API;
2. customDomain conhecido;
3. subdomínio elegível;
4. fallback para tenant `default`.

Se um header explícito indicar tenant inexistente/inativo, responder 404 em vez de cair silenciosamente no tenant padrão.

O request recebe:
- tenant.id
- tenant.slug
- tenant.name
- tenant.status
- tenant.planKey

## Escopo v1

1. Prisma Tenant + TenantMembership.
2. Migration com default tenant e backfill.
3. TenantService.
4. Middleware resolveTenant.
5. Helper requireTenantMembership.
6. Request typing.
7. CORS aceita X-Tenant-Slug.
8. Todas as rotas API recebem tenant context.
9. SettingsService passa a ler/gravar por tenantId.
10. SettingsController usa req.tenant.id.
11. Admin Settings exige membership OWNER/ADMIN além do papel ADMIN legado.
12. Endpoint read-only GET /tenant/current.
13. Testes de resolução, membership e isolamento de settings.

## Fora do escopo v1

- adicionar tenantId a Order, Product, Delivery, Appointment, Testimonial etc.;
- permitir criação pública de tenant;
- onboarding;
- convite de equipe;
- billing/Stripe por tenant;
- domínio customizado provisionado automaticamente;
- remover UserRole global;
- permitir mesmo e-mail possuir identidades separadas por tenant.

## Próximas etapas

### SaaS Foundation v2 — Data Isolation
Adicionar tenantId e políticas de consulta/escrita a todos os agregados de negócio, com backfill para o tenant padrão.

### v3 — Onboarding & Branding
Criação de tenant, owner inicial, domínio/subdomínio, wizard e branding.

### v4 — Plans & Billing
Planos, limites, feature entitlements, Stripe SaaS e lifecycle de assinatura.

### v5 — LGPD & Operations
Exportação/remoção, retenção, audit trail, observabilidade e controles administrativos.

## Critérios de aceite

- migração preserva todos os registros atuais;
- default tenant é criado deterministicamente;
- usuários atuais recebem membership;
- /settings/public resolve settings do tenant atual;
- dois tenantIds podem ter a mesma key de setting sem colisão;
- header explícito inválido não faz fallback;
- admin sem membership não altera settings de outro tenant;
- sem tenant explícito, comportamento atual continua funcionando;
- builds e testes verdes.
