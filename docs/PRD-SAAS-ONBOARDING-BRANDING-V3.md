# PRD — SaaS Foundation v3: Onboarding & Branding

**Status:** 🟡 Em implementação

## Objetivo

Permitir que um profissional crie seu próprio tenant, receba ownership isolado e tenha identidade visual/configuração inicial próprias, sem introduzir billing ou limites de plano.

A v3 também remove a dependência de `User.role=ADMIN` como autoridade tenant-scoped. A autorização administrativa passa a ser determinada pelo `TenantMembership.role`.

## Invariantes

- User continua sendo identidade global;
- TenantMembership é a autoridade de acesso ao tenant;
- OWNER/ADMIN de um tenant não recebe privilégio em outro tenant;
- onboarding nunca grava dados no tenant default por acidente;
- slug de tenant é único, normalizado e protegido contra nomes reservados;
- bootstrap é transacional;
- branding permanece configuração JSON tenant-scoped;
- sem cobrança, plano pago ou enforcement de limites nesta fase.
## Fluxo de onboarding profissional

Endpoint público:

`POST /onboarding/professional`

Cria atomicamente:
1. Tenant ACTIVE no plano starter;
2. User global com role legado CLIENT;
3. TenantMembership OWNER;
4. settings iniciais do tenant;
5. branding inicial;
6. tokens de autenticação.

O retorno inclui tenant, membership, user e tokens. O frontend persiste o slug selecionado e passa a enviar `X-Tenant-Slug`.

Nesta fase, um email já existente não pode ser reutilizado pelo onboarding público. Associação de usuário existente a novos workspaces entra na trilha de equipe/convites.

## Slug

Formato:
- lowercase;
- 3 a 48 caracteres;
- letras, números e hífen;
- não iniciar/terminar com hífen;
- bloqueio de slugs reservados: www, api, admin, auth, app, default, support, help, billing.

## Branding

Nova chave de SiteSetting: `branding`.

Campos:
- primaryColor;
- secondaryColor;
- accentColor;
- surfaceColor;
- textColor;
- logoUrl;
- faviconUrl;
- fontFamily;
- borderRadius.

O frontend aplica branding através de CSS custom properties.
## Bootstrap de settings

O onboarding cria defaults para:
- general;
- contact;
- professional;
- specialties;
- seo;
- content;
- branding.

Valores informados pelo profissional são usados para siteName, displayName, professionalTitle, serviceMode e contato.

## Autorização

Backend:
- `authenticate` continua validando JWT + membership ativa;
- `requireAdmin` passa a exigir apenas membership OWNER/ADMIN;
- `User.role` permanece por compatibilidade, mas deixa de conceder autoridade tenant-scoped.

Frontend:
- AuthService armazena membership atual;
- adminGuard verifica membership OWNER/ADMIN;
- TenantContextService armazena slug selecionado;
- tenantInterceptor envia `X-Tenant-Slug` quando houver seleção explícita.

## Compatibilidade

- tenant default continua resolvido quando não há slug explícito;
- usuários/admins legados continuam funcionando por já possuírem membership no tenant default;
- login/register continuam tenant-scoped;
- URLs por hostname/customDomain continuam funcionando sem header explícito.
## UI

Nova rota pública:
`/onboarding/profissional`

Wizard inicial:
1. conta do profissional;
2. nome/slug do workspace;
3. identidade profissional;
4. cores básicas;
5. conclusão e entrada no admin.

Após sucesso:
- grava tenant slug;
- grava user/tokens/membership;
- aplica branding;
- redireciona para `/admin`.

## Fora do escopo

- convites de equipe;
- associação de conta existente a outro tenant;
- verificação DNS de custom domain;
- provisionamento automático de domínio;
- Stripe SaaS;
- cobrança recorrente;
- feature entitlements por plano;
- trial;
- remoção do enum UserRole;
- RLS PostgreSQL.

## Critérios de aceite

- profissional novo cria tenant isolado;
- user criado recebe membership OWNER sem virar ADMIN global;
- OWNER consegue acessar admin do próprio tenant;
- OWNER não consegue administrar tenant sem membership;
- slug duplicado/reservado é rejeitado;
- settings iniciais pertencem somente ao tenant criado;
- branding público muda conforme tenant;
- frontend envia X-Tenant-Slug após onboarding;
- tenant default continua compatível;
- backend build/unit PASS;
- frontend build/test PASS.

Próxima fase: SaaS Foundation v4 — Plans & Billing.
