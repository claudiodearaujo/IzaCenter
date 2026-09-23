# Productization

## Objetivo

Transformar a implementação originalmente criada para uma profissional específica em uma plataforma reutilizável para terapeutas e profissionais de atendimento.

## Fase 1 — Despersonalização ✅ concluída

- remover nomes, e-mails, domínios e assets pessoais;
- substituir a identidade antiga por defaults técnicos neutros;
- manter comportamento funcional sem dependência da profissional original;
- retirar arquivos de ambiente com segredos do versionamento;
- preservar apenas exemplos seguros de configuração.

## Fase 2 — Generalização de domínio ✅ concluída

PRDs:
- [PRD-GENERIC-DOMAIN.md](PRD-GENERIC-DOMAIN.md) — Generic Domain v1 ✅
- [PRD-SERVICE-DOMAIN-V2.md](PRD-SERVICE-DOMAIN-V2.md) — Service Domain v2 ✅
- [PRD-DELIVERY-DOMAIN-V3.md](PRD-DELIVERY-DOMAIN-V3.md) — Delivery Domain v3 ✅
- [PRD-CONTENT-WHITELABEL-V4.md](PRD-CONTENT-WHITELABEL-V4.md) — Content / White-label Domain v4 ✅
- [PRD-SPECIALTY-MODULES-V5.md](PRD-SPECIALTY-MODULES-V5.md) — Specialty Modules v5 ✅

O core público está em migração para white-label. Conceitos específicos de especialidade devem permanecer encapsulados em specialty modules opcionais, e não em regras fixas do core.

Prioridades:
- perfil profissional configurável;
- especialidades e modalidades configuráveis;
- serviços/produtos configuráveis;
- conteúdo público e SEO configuráveis;
- templates de e-mail e PDF configuráveis;
- identidade visual configurável.

## Fase 3 — SaaS 🟡 em andamento

PRDs:
- [PRD-SAAS-FOUNDATION-V1.md](PRD-SAAS-FOUNDATION-V1.md) — SaaS Foundation v1 ✅
- SaaS Foundation v2 — Data Isolation ⏳
- SaaS Foundation v3 — Onboarding & Branding ⏳
- SaaS Foundation v4 — Plans & Billing ⏳
- SaaS Foundation v5 — LGPD & Operations ⏳

A v1 instala o contexto de tenant, memberships e settings tenant-scoped sem expor ainda criação pública de tenants. O isolamento completo dos agregados de negócio continua na v2.

Prioridades:
- isolamento de dados por tenant;
- onboarding do profissional;
- planos e assinaturas;
- branding e domínio por tenant;
- feature flags por plano;
- billing e cobrança;
- controles operacionais de LGPD;
- auditoria e observabilidade.

## Naming

`therapist-platform` é um nome técnico temporário para o código e o repositório. A marca comercial deve ser escolhida depois de validar domínio, conflito com marcas existentes, busca no INPI e posicionamento de mercado.

## Segurança

O arquivo local de ambiente do backend não deve ser versionado. Credenciais que já tenham sido publicadas anteriormente devem ser substituídas no provedor correspondente.
