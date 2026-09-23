# PRD — Content / White-label Domain v4

**Status:** 🟡 Em implementação

## Objetivo

Remover da superfície pública do Therapist Platform qualquer identidade fixa de Tarot, localização, profissional ou rede social e transformar o site público em uma experiência white-label dirigida por configurações.

## Princípios

- settings públicos são a fonte de verdade da identidade;
- conteúdo institucional não conhece uma especialidade específica;
- serviços públicos são derivados do catálogo real;
- SEO/Schema.org refletem profissional, marca e contatos configurados;
- specialty modules podem continuar específicos, mas não contaminam o core público;
- nenhuma mudança de multi-tenancy ou billing nesta fase.

## Fonte de verdade

### General
- siteName
- siteDescription
- logoUrl
- faviconUrl
- feature toggles públicos

### Professional
- displayName
- professionalTitle
- bio
- photoUrl
- languages
- serviceMode
- location
- credentials

### Contact
- email
- phone
- whatsapp
- address
- instagram
- facebook
- youtube
- tiktok

### Content
- heroTitle / heroSubtitle
- hero CTAs
- aboutTitle / aboutContent
- servicesTitle / servicesSubtitle
- CTA final
- footerText / footerDisclaimer

### SEO
- metaTitle
- metaDescription
- keywords

## Entregas

1. Criar store Angular cacheado para PublicSettings.
2. Tornar Header e Footer white-label.
3. Home usa settings + perfil profissional + catálogo destacado.
4. Serviços usa Product/Service Domain real, não cards i18n hardcoded.
5. Contato usa settings reais.
6. SeoService recebe contexto white-label e gera JSON-LD neutro.
7. Painel admin persiste corretamente os campos editados e ganha defaults neutros.
8. E-mails e Swagger removem identidade institucional de Tarot.
9. Textos públicos i18n e legais passam a linguagem genérica.
10. Preservar termos específicos apenas em specialty modules opcionais.

## Critérios de aceite

- nenhuma URL/rede social/localização pública hardcoded;
- Header/Footer refletem siteName/logo/configuração;
- Home reflete perfil profissional e serviços reais;
- página Serviços não assume Tarot;
- SEO Organization/Person/WebSite/Service é configurável;
- admin salva alterações realmente consumidas pelo público;
- build e testes verdes;
- busca por Tarot na superfície pública só encontra specialty module explícito.

## Fora do escopo

- tenantId e isolamento multi-tenant;
- domínio customizado por tenant;
- billing/assinaturas;
- remover fisicamente o módulo Cards;
- escolher marca comercial definitiva;
- redesign visual completo.

## Próxima fase

Specialty Modules v5:
- encapsular Cards/Lenormand;
- feature flags por especialidade;
- rotas e menu condicionais;
- remover o módulo de cartas do core quando não habilitado.
