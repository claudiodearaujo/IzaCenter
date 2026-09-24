# PRD — Security Hardening v1

**Status:** 🟡 Em implementação  
**Baseline:** 24/09/2026  
**Pré-requisito:** SaaS Foundation v1–v5 concluída.

## Objetivo

Reduzir o risco técnico do Therapist Platform antes de exposição pública de produção ou ativação de billing SaaS real.

O hardening deve preservar isolamento multi-tenant, compatibilidade do tenant `default`, comportamento funcional atual, billing SaaS desligado no ambiente local, migrations aditivas e CI reprodutível.

## Baseline real

Dependabot aberto em 24/09/2026:

- total: **331** alertas;
- críticos: **4**;
- altos: **147**;
- médios: **159**;
- baixos: **21**.

Distribuição principal:
- `frontend/package-lock.json`: 109;
- `backend/package-lock.json`: 105;
- `package-lock.json`: 3;
- demais: majoritariamente manifests de exemplos/tooling em `.claude/.cursor/.gemini`.

### Críticos

- `handlebars` em `backend/package-lock.json` — GHSA-2w6w-674q-4c4q — patched em 4.7.9.
- `tar` em três manifests de exemplos `loki-mode` — GHSA-23hp-3jrh-7fpw — patched em 7.5.19.

### Altos de runtime observados

Incluem `multer`, `sharp`, `nodemailer`, `js-yaml`, `fast-uri`, `brace-expansion`, `browserslist`, `nanoid`, `vite`, pacotes `@angular/*`, `express-rate-limit`, `path-to-regexp` e `ws`.

## Achados arquiteturais iniciais

- Backend usa versões diretas reportadas em advisories: `multer ^2.0.2`, `sharp ^0.34.5`, `nodemailer ^7.0.12`.
- Frontend tem pacotes Angular 20.x e `@angular/service-worker ^21.2.0`.
- `npm ci --legacy-peer-deps` mascara incompatibilidades de peer dependencies.
- Uploads confiam inicialmente em `file.mimetype`; existe `uploadFile` genérico aceitando qualquer tipo até 100 MB.
- Backend usa Helmet, mas Nginx não possui CSP explícita.
- JWT refresh não possui revogação server-side; logout depende do descarte no cliente.
- CI não possui dependency audit gate.

## Execução

### P0 — Critical Remediation

1. mapear a árvore que introduz `handlebars`;
2. atualizar a cadeia para `handlebars >=4.7.9`;
3. atualizar/eliminar os três lockfiles de exemplo afetados por `tar`;
4. build + testes;
5. validar Dependabot.

Gate: zero críticos nos runtimes e nenhum crítico sem classificação explícita no repositório.

### P0.1 — Direct High Remediation

Prioridade: `multer`, `sharp`, `nodemailer`.

Regras:
- patch/minor primeiro;
- major isolado quando necessário;
- testes específicos;
- nunca usar `npm audit fix --force` indiscriminadamente.

### P0.2 — Dependency Graph Hygiene

- classificar manifests em runtime, build/test, tooling e exemplos;
- remover lockfiles de exemplo desnecessários ou atualizá-los de forma reprodutível;
- reduzir ruído sem ocultar risco real.

### P0.3 — Angular Alignment

- uma única major suportada;
- alinhar core/common/compiler/forms/router/animations/CLI/build/compiler-cli/service-worker;
- remover `--legacy-peer-deps` quando possível;
- major upgrade apenas em PR isolado.

### P1 — CI Security Gates

- dependency audit crítico primeiro;
- high gate depois da redução da baseline;
- SBOM;
- artifact de audit;
- GitGuardian preservado;
- exceções documentadas com owner, justificativa e prazo.

Gates não podem nascer permanentemente vermelhos.

### P1 — Upload Hardening

- restringir/remover `uploadFile` genérico;
- allowlist por caso de uso;
- validar assinatura/magic bytes além do MIME;
- tamanho por endpoint;
- re-encode de imagens quando aplicável;
- testes para MIME spoofing, arquivos malformados e oversized payloads.

### P1 — Auth & Session Hardening

- refresh sessions persistidas;
- refresh token hasheado;
- rotação e revogação;
- logout server-side;
- detecção de reuse;
- auditoria;
- compatibilidade multi-tenant.

### P1 — Proxy, Rate Limit, CORS e CSP

- `trust proxy` limitado à topologia conhecida;
- rate limit sem spoofing de IP;
- CORS allowlist por ambiente;
- CSP compatível com Angular/Stripe/storage;
- Permissions-Policy, Referrer-Policy e frame-ancestors;
- HSTS somente na camada HTTPS correta.

### P1 — Multi-tenant Threat Model

Testes explícitos:
- tenant A não lê/altera recurso B mesmo conhecendo ID;
- admin A não opera recurso B;
- export LGPD e billing não cruzam tenant;
- host/header conflitantes não selecionam tenant indevido;
- cobertura de IDOR.

### P2 — Runtime Container Hardening

- runtime não-root;
- minimizar toolchain;
- read-only filesystem quando viável;
- drop capabilities;
- imagens pinadas;
- scan de imagem;
- separar migrations do runtime final quando a operação de produção amadurecer.

## Fora de escopo

Pentest externo formal, ISO/SOC, WAF gerenciado, SIEM/SOC 24x7, DLP, billing live e exposição pública de produção.

## Critérios de aceite

- críticos de runtime = 0;
- críticos de tooling/exemplos = 0 ou removidos da dependency graph de forma documentada;
- direct highs P0 remediados;
- CI verde;
- security gate introduzido sem baseline vermelha;
- testes de upload spoofing;
- baseline cross-tenant automatizada;
- risco residual documentado;
- Coolify local healthy;
- billing SaaS continua desligado.

## Sequência

1. P0 Critical Remediation;
2. P0.1 Direct High Remediation;
3. P0.2 Dependency Graph Hygiene;
4. P0.3 Angular Alignment;
5. P1 CI Security Gates;
6. P1 Upload Hardening;
7. P1 Auth & Session Hardening;
8. P1 Proxy/CORS/CSP;
9. P1 Multi-tenant Threat Model;
10. P2 Container Hardening.
