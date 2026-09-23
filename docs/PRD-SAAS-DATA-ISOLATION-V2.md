# PRD — SaaS Foundation v2: Data Isolation

**Status:** ✅ Implementado e validado

## Objetivo

Completar o isolamento lógico de dados do Therapist Platform por tenant, mantendo User como identidade global e preservando integralmente o tenant legado/default.

A v1 criou Tenant, TenantMembership, resolução por request e SiteSetting tenant-scoped. A v2 leva o tenant para os agregados de negócio e impede acesso cross-tenant em todas as rotas autenticadas.

## Invariantes

- migração aditiva, com backfill para o tenant default;
- nenhum dado legado é removido;
- IDs continuam globalmente únicos;
- User permanece global; acesso ao tenant depende de TenantMembership ativa;
- filhos fortes herdam tenant do agregado pai e não duplicam tenantId;
- consultas públicas também são tenant-scoped;
- webhooks/background jobs derivam tenant do agregado persistido;
- sem criação pública de tenants nesta fase.

## Agregados raiz com tenantId

- ProductCategory
- Product
- Order
- CiganoCard
- Reading / Delivery
- ScheduleSettings
- Appointment
- BlockedSlot
- Testimonial
- Coupon
- Notification

Filhos que herdam tenant e permanecem sem coluna própria:
- ProductAttachment -> Product
- OrderItem -> Order
- ReadingCard -> Reading

## Unicidade por tenant

Passam a ser compostos:
- ProductCategory: tenantId + slug
- Product: tenantId + slug
- CiganoCard: tenantId + number
- Coupon: tenantId + code
- ScheduleSettings: tenantId único

Order.orderNumber, Reading.orderItemId e Appointment.orderItemId permanecem globalmente únicos por compatibilidade.

## Enforcement de acesso

O middleware authenticate deve:
1. validar JWT;
2. resolver o usuário global;
3. exigir req.tenant já resolvido;
4. exigir TenantMembership ativa para userId + tenantId;
5. anexar tenantMembership ao request.

Rotas administrativas continuam exigindo UserRole.ADMIN e, quando necessário, OWNER/ADMIN no membership.

## Serviços tenant-scoped

Todos os métodos de leitura/escrita dos agregados raiz recebem tenantId e o incluem no where/data.

Também entram no escopo:
- Dashboard: todas as métricas e listas por tenant;
- Admin Users: usuários obtidos via membership do tenant;
- estatísticas de usuário: somente dados do tenant;
- Auth login: exige membership ativa no tenant atual;
- registro: membership CLIENT no tenant atual;
- Notifications: userId + tenantId.

## Migração

Criar tenant_id nullable, backfill com:
00000000-0000-0000-0000-000000000001

Depois:
- SET NOT NULL;
- foreign keys para tenants;
- índices por tenant;
- substituir uniques globais por compostos onde aplicável.

## Critérios de aceite

- tenant A nunca lista/lê/altera agregado do tenant B;
- slug/code/number iguais podem existir em tenants diferentes;
- usuários sem membership ativa recebem 403 em rotas autenticadas;
- admin global não consegue trocar X-Tenant-Slug para administrar outro tenant;
- dashboard e Admin Users não vazam dados cross-tenant;
- dados existentes continuam visíveis no tenant default;
- migration aplica em banco limpo e em banco legado;
- seed continua funcionando;
- Prisma validate/generate PASS;
- backend build PASS;
- unit tests PASS;
- frontend build/test sem regressão.

## Fora do escopo

- onboarding de tenant;
- convite de equipe;
- billing/plan enforcement;
- custom domain provisioning;
- identidade de usuário separada por tenant;
- RLS no PostgreSQL.

Próxima fase: SaaS Foundation v3 — Onboarding & Branding.

## Validação concluída

- Prisma validate: PASS.
- Prisma generate: PASS.
- Backend build: PASS.
- Backend unit tests: 19/19 suites, 337/337 testes PASS.
- Frontend build: PASS; apenas warnings preexistentes de imports não usados.
- Clean install PostgreSQL: 6/6 migrations aplicadas com sucesso.
- Upgrade PostgreSQL v1 -> v2 com dados legados: PASS.
- 11/11 agregados raiz receberam tenantId por backfill no tenant default.
- 11/11 tenant_id ficaram NOT NULL após o backfill.
- 5/5 uniques tenant-scoped criados.
- Mesmo slug em tenants diferentes: permitido.
- Mesmo slug duplicado dentro do mesmo tenant: rejeitado.
- Rotas de pedido e entrega que ainda faziam fallback no tenant default foram corrigidas.
- Depoimentos públicos passaram a ser explicitamente tenant-scoped.

### Decisão preservada para v3

User continua sendo identidade global. TenantMembership é a autorização tenant-scoped. O papel global User.role ainda participa do gate administrativo por compatibilidade e será reavaliado junto do onboarding/equipe na SaaS Foundation v3.
