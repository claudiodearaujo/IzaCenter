# Productization

## Objetivo

Transformar a implementação originalmente criada para uma profissional específica em uma plataforma reutilizável para terapeutas e profissionais de atendimento.

## Fase 1 — Despersonalização ✅ concluída

- remover nomes, e-mails, domínios e assets pessoais;
- substituir a identidade antiga por defaults técnicos neutros;
- manter comportamento funcional sem dependência da profissional original;
- retirar arquivos de ambiente com segredos do versionamento;
- preservar apenas exemplos seguros de configuração.

## Fase 2 — Generalização de domínio 🟡 em andamento

PRD ativo: [PRD-GENERIC-DOMAIN.md](PRD-GENERIC-DOMAIN.md).

O sistema ainda possui conceitos específicos de Tarot/Baralho Cigano. Eles deverão se tornar configuração de especialidade, serviço e conteúdo, e não regras fixas do core.

Prioridades:
- perfil profissional configurável;
- especialidades e modalidades configuráveis;
- serviços/produtos configuráveis;
- conteúdo público e SEO configuráveis;
- templates de e-mail e PDF configuráveis;
- identidade visual configurável.

## Fase 3 — SaaS

- tenancy e isolamento de dados;
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
