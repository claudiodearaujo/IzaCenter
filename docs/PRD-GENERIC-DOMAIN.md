# PRD — Generic Domain v1

## Objetivo

Transformar o Therapist Platform de uma aplicação especializada em Tarot em uma plataforma configurável para profissionais de atendimento, preservando compatibilidade com o domínio legado durante a migração.

## Princípios

- configuração antes de especialização hardcoded;
- migração incremental e reversível;
- nenhuma quebra de contratos públicos sem camada de compatibilidade;
- Tarot passa a ser uma especialidade opcional, não a identidade do core;
- multi-tenancy, billing e planos ficam fora desta fase;
- nenhuma claim médica ou psicológica é inferida automaticamente.

## Modelo conceitual alvo

Professional → Specialty → Service → Client → Appointment/Delivery → Order/Payment → Content

Reading e CiganoCard permanecem temporariamente como módulos legados compatíveis até a fase de migração estrutural.

## Escopo funcional

### 1. Identidade profissional
Configuração de:
- nome público;
- título profissional;
- biografia;
- foto;
- idiomas;
- localização/atendimento remoto;
- credenciais apresentadas pelo próprio profissional.

### 2. Especialidades
Cada especialidade possui:
- id/slug;
- nome;
- descrição;
- status ativo;
- indicação se utiliza módulo de cartas/oráculos;
- termos de atendimento e aviso/disclaimer opcionais.

### 3. Conteúdo e SEO
Configuração de:
- hero;
- sobre;
- rodapé;
- título e descrição SEO;
- palavras-chave;
- identidade pública sem dependência de Tarot.

### 4. Serviços
O catálogo atual de produtos será tratado como catálogo de serviços/produtos comercializáveis.
Campos específicos de Tarot serão mantidos apenas como compatibilidade até a migração do schema.

## Entregas técnicas v1

1. Criar configurações professional, specialties e seo usando SiteSetting.
2. Expor leitura pública segura dessas configurações.
3. Expor CRUD administrativo de configuração.
4. Atualizar contratos TypeScript frontend/backend.
5. Adicionar edição básica no painel administrativo.
6. Substituir defaults de Tarot por defaults neutros.
7. Atualizar README e documentação de arquitetura.
8. Cobrir settings com testes unitários.

## Fora do escopo v1

- renomear tabelas readings / cigano_cards;
- remover o módulo de cartas;
- multi-tenant;
- onboarding SaaS;
- assinatura recorrente;
- domínio customizado por tenant;
- migração automática de dados históricos.

## Critérios de aceite

- build backend e frontend verdes;
- testes de settings verdes;
- endpoint público retorna perfil, especialidades e SEO;
- admin consegue persistir as novas configurações;
- defaults públicos não mencionam Tarot;
- nenhuma migração destrutiva de banco;
- comportamento legado continua disponível.

## Próximas fases

### v2 — Service Domain
Normalizar ProductType, remover dependência de numCards/numQuestions do core e introduzir capabilities por serviço.

### v3 — Delivery Domain
Migrar Reading para uma abstração de entrega/atendimento com extensões por especialidade.

### v4 — Specialty Modules
Converter Tarot/Lenormand em módulo opcional plugável.

### v5 — SaaS Foundation
Tenant, isolamento de dados, onboarding, branding, planos, billing, LGPD operacional e auditoria.
