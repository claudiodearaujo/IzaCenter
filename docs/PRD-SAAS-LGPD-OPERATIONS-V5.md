# PRD — SaaS Foundation v5: LGPD & Operations

**Status:** 🟡 Implementação concluída — CI/deploy pendentes

## Objetivo

Completar a fundação SaaS com controles operacionais de proteção de dados, direitos do titular, auditoria persistente, retenção controlada e preparação para resposta a incidentes, sem prometer automações jurídicas que dependem de análise humana.

A plataforma deve oferecer mecanismos técnicos para o controlador cumprir suas obrigações, mas não substituir avaliação jurídica sobre base legal, prazo de retenção, necessidade de eliminação ou comunicação de incidente.

## Referências regulatórias

- LGPD — Lei nº 13.709/2018.
- Direitos dos titulares previstos nos arts. 17 e 18.
- Resolução CD/ANPD nº 15/2024 — comunicação de incidente de segurança.
- Resolução CD/ANPD nº 18/2024 — atuação do Encarregado.

Princípios técnicos adotados:
- minimização;
- necessidade;
- transparência;
- segurança;
- prevenção;
- responsabilização e prestação de contas;
- rastreabilidade das decisões administrativas.

## Invariantes

1. Dados continuam isolados por `tenantId`.
2. `User` continua identidade global; direitos são exercidos por tenant quando os dados tratados são tenant-scoped.
3. Exportação nunca inclui `passwordHash`, reset tokens, secrets, Stripe IDs internos ou dados de outros tenants.
4. Pedido de eliminação não executa hard-delete automaticamente.
5. Dados financeiros, transacionais ou necessários para obrigação legal podem ser preservados até decisão do controlador.
6. Auditoria é append-only no fluxo normal da aplicação.
7. Auditoria não persiste corpo de request/response.
8. Auditoria não armazena e-mail do usuário nem IP bruto; IP será hash irreversível com salt do ambiente quando disponível.
9. Toda mutação administrativa relevante deve gerar AuditEvent.
10. Solicitações LGPD têm lifecycle próprio e histórico auditável.
11. A plataforma registra incidentes e marcos de comunicação, mas não decide automaticamente se um incidente é notificável.
12. Billing SaaS permanece desabilitado no ambiente local.

## Escopo funcional

### 1. Direitos do titular

Endpoint autenticado:

- `GET /privacy/export`
  - gera exportação JSON do usuário no tenant atual;
  - inclui perfil, membership, pedidos, entregas/readings, agendamentos, depoimentos e preferências;
  - exclui credenciais, tokens e dados internos de pagamento.

- `POST /privacy/requests`
  - tipos:
    - ACCESS;
    - CONFIRMATION;
    - CORRECTION;
    - PORTABILITY;
    - ANONYMIZATION;
    - DELETION;
    - INFORMATION;
    - CONSENT_WITHDRAWAL.
  - cria solicitação tenant-scoped;
  - status inicial `PENDING`.

- `GET /privacy/requests/me`
  - histórico do próprio titular no tenant atual.

### 2. Operação administrativa

OWNER/ADMIN:

- `GET /admin/privacy/requests`
- `GET /admin/privacy/requests/:id`
- `PATCH /admin/privacy/requests/:id`

Status:
- PENDING;
- IN_REVIEW;
- APPROVED;
- REJECTED;
- COMPLETED;
- CANCELED.

Ao concluir:
- registrar justificativa/resposta;
- registrar operador;
- registrar timestamp;
- criar AuditEvent.

Nenhum endpoint administrativo de v5 executará eliminação física irreversível automaticamente.

### 3. Auditoria persistente

Novo modelo `AuditEvent`:

- id;
- tenantId nullable para eventos globais;
- actorUserId nullable;
- action;
- resourceType;
- resourceId opcional;
- method;
- path;
- statusCode;
- outcome;
- requestId;
- ipHash opcional;
- metadata JSON opcional, estritamente minimizado;
- createdAt.

Cobertura mínima:
- login/register/logout/reset password;
- criação/alteração de tenant;
- onboarding;
- billing SaaS;
- alterações de settings;
- produtos/pedidos/entregas/agendamentos;
- alterações administrativas de usuários;
- solicitações LGPD;
- operações sobre incidentes.

### 4. Retenção e anonimização

v5 introduz política técnica, não decisão jurídica automática.

Novo `DataRetentionPolicy` tenant-scoped:
- auditRetentionDays default 730;
- privacyRequestRetentionDays default 1825;
- operationalLogRetentionDays default 90;
- updatedAt.

Job destrutivo automático fica fora de escopo desta primeira implementação.

Será disponibilizado:
- leitura da política;
- alteração por OWNER/ADMIN;
- relatório de registros elegíveis para futura limpeza;
- nenhuma exclusão automática na v5 inicial.

### 5. Incidentes de segurança

Novo `SecurityIncident`:

- tenantId nullable;
- title;
- summary;
- severity LOW/MEDIUM/HIGH/CRITICAL;
- status OPEN/INVESTIGATING/CONTAINED/RESOLVED/CLOSED;
- detectedAt;
- controllerAwareAt;
- affectedDataCategories;
- affectedSubjectsEstimate;
- riskRelevant boolean nullable;
- anpdNotifiedAt;
- subjectsNotifiedAt;
- resolutionSummary;
- createdByUserId;
- createdAt/updatedAt.

A interface deve destacar, sem declarar conclusão jurídica:
- data de ciência do controlador;
- existência ou não de avaliação de risco;
- marcos de comunicação;
- referência operacional de 3 dias úteis para incidentes que possam acarretar risco ou dano relevante, conforme regulamentação vigente da ANPD.

### 6. Encarregado / canal de privacidade

Configuração tenant-scoped:
- privacyContactName;
- privacyContactEmail;
- privacyContactUrl opcional.

Exibir no aviso de privacidade e na área de direitos do titular.

## Modelo de dados

Novos enums:
- PrivacyRequestType
- PrivacyRequestStatus
- AuditOutcome
- SecurityIncidentSeverity
- SecurityIncidentStatus

Novos modelos:
- PrivacyRequest
- AuditEvent
- DataRetentionPolicy
- SecurityIncident

Relações devem preservar isolamento por tenant.

## Segurança

- endpoints privados exigem autenticação;
- operações administrativas exigem OWNER/ADMIN;
- exportação só pode acessar o próprio userId;
- nunca exportar hashes, tokens, reset tokens, secrets, IDs internos de Stripe ou notas administrativas de outros contextos;
- auditoria não deve falhar a request principal se persistência de audit event falhar; a falha deve ir para observabilidade;
- nunca persistir request body completo em audit event;
- IP bruto não deve ser gravado;
- metadata deve usar allowlist;
- logs/Sentry não devem receber exportações completas de dados pessoais.

## Observabilidade

Health:
- manter DB health atual;
- incluir indicador de capacidade de persistência de auditoria quando tecnicamente seguro.

Sentry:
- reduzir risco de captura de PII;
- configurar `sendDefaultPii: false`;
- beforeSend sanitiza headers sensíveis e payloads conhecidos.

Operational metrics nesta fase:
- privacy requests por status;
- incidentes abertos por severidade;
- falhas de auditoria em log estruturado.

## Frontend

Cliente:
- nova seção `/cliente/privacidade`;
- download/exportação JSON;
- criação de solicitação;
- histórico de solicitações;
- canal do encarregado.

Admin:
- `/admin/privacidade`;
- fila de solicitações;
- detalhe/status/resposta;
- política de retenção;
- incidentes;
- trilha de auditoria paginada.

O Design System Therapist deve ser usado em todas as telas novas.

## Migração

A migration deve:
- criar enums e tabelas;
- criar política de retenção default para cada tenant existente;
- não alterar dados de negócio atuais;
- não executar limpeza histórica.

## Critérios de aceite

- Prisma validate/generate PASS;
- migration clean install PASS;
- upgrade do banco atual PASS;
- tenant existente recebe DataRetentionPolicy default;
- exportação não contém campos sensíveis;
- exportação não cruza tenant;
- privacy request é tenant-scoped;
- usuário vê apenas próprias solicitações;
- admin vê apenas solicitações do tenant;
- mudança de status gera AuditEvent;
- audit middleware não persiste e-mail nem IP bruto;
- incidentes são tenant-scoped;
- frontend cliente/admin integrado;
- backend build/unit PASS;
- frontend build/test PASS;
- CI PASS;
- migration aplicada no Coolify;
- runtime healthy.

## Fora de escopo

- decisão jurídica automática sobre base legal;
- eliminação automática irreversível;
- cálculo oficial de feriados para prazo regulatório;
- comunicação automática à ANPD;
- envio automático de comunicação massiva a titulares;
- geração automática de RIPD;
- DLP;
- SIEM externo;
- SOC;
- certificações formais;
- revisão jurídica de termos/aviso de privacidade.

## Próximo marco

Após v5, a Fase 3 — SaaS Foundation estará tecnicamente concluída. O próximo roadmap deverá separar:
- Product/Commercial Readiness;
- Security Hardening;
- Tenant Team & Invitations;
- Custom Domain Automation;
- Production Operations.


## Validação local

- Prisma validate/generate: PASS.
- Backend build: PASS.
- Backend baseline + privacy tests: 23/23 suites, 357/357 testes PASS antes do hardening final.
- PrivacyService específico: 6/6 testes PASS.
- Migration v5 aplicada em banco scratch derivado do schema real do Coolify: PASS.
- Backfill sintético: `v5-existing | 730 | 1825 | 90` — PASS.
- Tabelas confirmadas no scratch: `privacy_requests`, `audit_events`, `data_retention_policies`, `security_incidents`.
- Frontend unit tests: 262/262 PASS.
- Frontend production build: PASS após correção do contrato legado de `OrderDetailComponent`.
- Exportação usa selects explícitos e não inclui passwordHash, resetToken ou Stripe IDs internos.
- Auditoria persiste somente IP hasheado quando `AUDIT_IP_HASH_SALT` está configurado; sem salt, nenhum fingerprint de IP é salvo.
- Limpeza destrutiva automática permanece desabilitada.
- Billing SaaS permanece desligado no runtime local.

### Gate ainda pendente

- CI remoto final da branch;
- merge;
- migration no Coolify;
- smoke tests autenticados/anônimos do runtime;
- encerramento formal do roadmap SaaS Foundation.
