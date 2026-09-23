# PRD — SaaS Foundation v4: Plans & Billing

**Status:** 🟡 Implementação validada — deploy Coolify pendente

## Objetivo

Adicionar o domínio de planos, entitlements e lifecycle de assinatura SaaS do profissional/tenant, mantendo totalmente separado o fluxo Stripe já existente para pagamentos dos clientes finais por serviços e produtos.

A v4 deve permitir:

- catálogo técnico de planos;
- estado de assinatura por tenant;
- entitlements e limites consultáveis;
- checkout recorrente Stripe opcional;
- portal de cobrança Stripe opcional;
- lifecycle dirigido por webhook;
- idempotência persistente de webhooks;
- tela administrativa de plano e assinatura;
- operação segura quando billing estiver desabilitado.

## Invariantes

1. `Order` e checkout de clientes continuam sendo comércio do tenant e não representam assinatura SaaS.
2. Assinatura SaaS pertence ao `Tenant`, nunca ao `User`.
3. Abrir checkout não altera `Tenant.planKey`.
4. Upgrade só ocorre após webhook Stripe com assinatura `active` ou `trialing`.
5. `past_due` mantém temporariamente o plano vigente.
6. `canceled` e `unpaid` retornam o tenant para `starter`.
7. Billing SaaS é opt-in por ambiente: `SAAS_BILLING_ENABLED=false` por padrão.
8. Nenhuma chamada Stripe SaaS ocorre sem billing habilitado e Price ID configurado.
9. O tenant legado/default deve continuar funcional mesmo sem configuração Stripe SaaS.
10. Webhooks devem ser idempotentes de forma persistente no PostgreSQL.
11. Pricing comercial não será hardcoded: preço e Price ID vêm de configuração.
12. Entitlements são o contrato de produto; componentes futuros devem consultar esse contrato em vez de comparar plano diretamente.

## Catálogo técnico inicial

### starter

Plano base e fallback de segurança.

Entitlements iniciais:
- branding: true;
- customDomain: false;
- advancedReports: false;
- teamMembers: 1;
- specialtyModules: 1.

### professional

Plano para profissional independente com recursos avançados.

Entitlements iniciais:
- branding: true;
- customDomain: true;
- advancedReports: true;
- teamMembers: 3;
- specialtyModules: 5.

### studio

Plano para operação com equipe/múltiplas especialidades.

Entitlements iniciais:
- branding: true;
- customDomain: true;
- advancedReports: true;
- teamMembers: 10;
- specialtyModules: ilimitado.

Os limites acima são defaults técnicos e podem ser revisados em uma fase comercial sem alteração estrutural.

## Modelo de dados

### SaasSubscription

Uma assinatura por tenant.

Campos:
- id;
- tenantId unique;
- planKey;
- status;
- provider;
- providerCustomerId;
- providerSubscriptionId;
- providerPriceId;
- currentPeriodStart;
- currentPeriodEnd;
- trialEndsAt;
- cancelAtPeriodEnd;
- canceledAt;
- timestamps.

Status:
- FREE;
- TRIALING;
- ACTIVE;
- PAST_DUE;
- PAUSED;
- CANCELED;
- INCOMPLETE;
- UNPAID.

### StripeWebhookEvent

Registro persistente de idempotência.

Campos:
- id;
- stripeEventId unique;
- eventType;
- processedAt;
- lastError opcional;
- createdAt;
- updatedAt.

Não armazenar payload completo do Stripe para reduzir superfície de dados pessoais.

## Backfill

Migration deve criar uma assinatura `FREE/starter` para todos os tenants existentes que ainda não possuam `SaasSubscription`.

O onboarding v3 passa a criar a assinatura FREE dentro da mesma transação que cria Tenant, OWNER e settings.

## Configuração

Novas variáveis:

- `SAAS_BILLING_ENABLED=false`
- `SAAS_PROFESSIONAL_PRICE_ID=`
- `SAAS_PROFESSIONAL_MONTHLY_PRICE_CENTS=`
- `SAAS_STUDIO_PRICE_ID=`
- `SAAS_STUDIO_MONTHLY_PRICE_CENTS=`

Os valores monetários são apenas para apresentação. O Stripe Price ID continua sendo a fonte de verdade da cobrança.

## API

### GET /billing/plans

Público.
Retorna catálogo sem expor Price IDs.

### GET /billing/current

Autenticado, OWNER/ADMIN.
Retorna:
- plano atual;
- assinatura;
- entitlements;
- billingEnabled;
- checkoutAvailable por plano.

### POST /billing/checkout

Autenticado, OWNER/ADMIN.

Body:
```json
{ "planKey": "professional" }
```

Regras:
- rejeitar starter;
- rejeitar plano desconhecido;
- rejeitar se billing estiver desabilitado;
- rejeitar se Price ID não estiver configurado;
- criar customer SaaS por tenant quando necessário;
- criar Stripe Checkout mode=subscription;
- metadata deve conter `billingKind=saas`, `tenantId`, `planKey`;
- não alterar plano antes do webhook.

### POST /billing/portal

Autenticado, OWNER/ADMIN.
Cria Stripe Billing Portal apenas quando existe customer SaaS.

## Webhooks

O endpoint Stripe existente continua único.

Eventos de comércio:
- continuam sendo encaminhados para OrdersService.

Eventos SaaS:
- checkout.session.completed;
- customer.subscription.created;
- customer.subscription.updated;
- customer.subscription.deleted;
- invoice.paid;
- invoice.payment_failed.

O roteamento diferencia os domínios por metadata e/ou subscription persistida.

## Lifecycle

### active/trialing

- persistir subscription;
- atualizar `Tenant.planKey` para o plano confirmado.

### past_due/paused/incomplete

- persistir status;
- não conceder upgrade novo sem status active/trialing;
- preservar plano já vigente para past_due durante recuperação.

### canceled/unpaid

- persistir status;
- atualizar `Tenant.planKey=starter`.

## Frontend

Nova rota:
- `/admin/assinatura`

Exibir:
- plano atual;
- status;
- período corrente;
- cancelamento agendado;
- entitlements;
- cards de planos;
- preço quando configurado;
- estado "Preço sob configuração" quando não houver valor;
- CTA de upgrade apenas quando billing e Price ID estiverem disponíveis;
- CTA "Gerenciar cobrança" apenas quando houver customer SaaS.

Adicionar item "Plano e assinatura" no menu administrativo.

## Segurança

- nunca confiar em `planKey` vindo do browser para conceder entitlement;
- nunca atualizar plano no retorno HTTP do Checkout;
- Stripe webhook assinado é a confirmação externa;
- manter idempotência persistente;
- não reutilizar `User.stripeCustomerId` do comércio para assinatura SaaS;
- não logar secrets, payment methods ou payload completo;
- rotas de mutação de billing exigem OWNER/ADMIN do tenant.

## Fora de escopo v4

- definição final de preços comerciais;
- cupons SaaS;
- cobrança anual;
- impostos/notas fiscais;
- split/payment marketplace;
- convite de equipe;
- provisionamento DNS/TLS de custom domain;
- enforcement de todos os limites históricos sobre dados já existentes;
- dunning customizado além do Stripe;
- métricas financeiras SaaS avançadas.

## Critérios de aceite

- tenant existente recebe assinatura FREE via migration;
- novo onboarding cria assinatura FREE;
- catálogo retorna planos sem Price IDs;
- current retorna plano/entitlements tenant-scoped;
- checkout não chama Stripe quando billing=false;
- checkout nunca concede plano antecipadamente;
- webhook active/trialing promove plano;
- webhook canceled/unpaid faz downgrade para starter;
- idempotência de webhook persiste após restart;
- pagamentos de Orders continuam inalterados;
- frontend mostra plano e billing status;
- backend build/unit PASS;
- frontend build/test PASS;
- migration aplicada no Coolify local;
- runtime permanece healthy.

## Validação local concluída

- Prisma validate/generate: PASS.
- Migration DDL: PASS em banco scratch PostgreSQL derivado do schema Coolify.
- Backfill de tenant existente: PASS — `starter | FREE`.
- Backend build: PASS.
- Backend unit tests: 22/22 suites, 351/351 testes PASS.
- Frontend TypeScript check/build: PASS.
- Frontend tests: 269/269 PASS em ChromeHeadless.
- `git diff --check`: PASS.
- fluxo de comércio `Order` preservado nos testes existentes.
- billing SaaS permanece explicitamente desabilitado no ambiente local.
- pendente para encerramento operacional: merge, migration no Coolify e smoke test do runtime.

Próxima fase após o encerramento operacional: SaaS Foundation v5 — LGPD & Operations.
