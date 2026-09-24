# Security Hardening v1 — baseline inicial

Data: 2026-09-24. Base: `972cd42fe41ee6ba93198a1a1b2c6986c7f97711`.

## Dependências

Comando em cada diretório: `npm audit --omit=dev --json`, sobre lockfiles existentes.

| Escopo | Baixos | Moderados | Altos | Críticos | Total |
|---|---:|---:|---:|---:|---:|
| Backend | 1 | 12 | 19 | 0 | 32 |
| Frontend | 0 | 2 | 12 | 0 | 14 |

Contagens representam entradas da árvore reportada pelo npm, inclusive efeitos transitivos, não exploits independentes nem vulnerabilidades comprovadamente alcançáveis. `--omit=dev` não comprova o conteúdo da imagem final: Prisma aparece na árvore reportada e precisa de classificação específica.

Fonte reproduzível com ranges/advisories/fixAvailable: [dependency-baseline-v1.json](security/dependency-baseline-v1.json). O inventário pode mudar conforme o registry; estas são as respostas desta execução. Dependabot e auditoria completa de build/e2e ainda não foram consultados.

## Achados de código

As prioridades abaixo são de remediação, não classificações CVSS.

| ID | Prioridade | Evidência | Estado / ação |
|---|---|---|---|
| SH-LOG-01 | Alta | `backend/src/app.ts`: Morgan combined em produção e dev em desenvolvimento | Corrigido neste incremento: access log somente com metadados permitidos; teste HTTP cobre 201 e 404 |
| SH-SESSION-01 | Alta | `auth.service.ts`: logout retorna mensagem; refresh emite novo par sem persistência/revogação; reset/change atualizam senha sem invalidar tokens | Pendente: sessão revogável e rotação atômica com testes de replay |
| SH-SESSION-02 | Alta | Frontend `auth.service.ts`: `/auth/refresh-token` com body vazio; backend `auth.routes.ts`: `/refresh` exige `refreshToken` | Pendente: alinhar contrato e transporte junto à sessão persistente |
| SH-SESSION-03 | Média | `storage.service.ts`: access token em localStorage; `jwt.util.ts`: verify sem allowlist explícita de algoritmo | Pendente: avaliar armazenamento/CSRF e restringir validação JWT |
| SH-CI-01 | Alta | `.github/workflows/ci.yml`: build/test sem job SAST/SCA | Pendente: gates de segurança e verificação de checks obrigatórios |
| SH-PROXY-01 | Alta | Limitadores por IP; `app.ts` sem trust proxy; Nginx encaminha X-Forwarded-For | Pendente: provar comportamento na topologia Coolify/Tailscale antes de alterar confiança |
| SH-LOG-02 | Alta | `frontend/nginx.coolify.conf` sem formato próprio; error handler inclui mensagem/path; auditoria usa path bruto; Sentry limpa apenas alguns headers em lowercase | Pendente: revisar cada camada e validar dados sintéticos; correção de Morgan não fecha observabilidade inteira |
| SH-UPLOAD-01 | Alta | `upload.middleware.ts`: filtro por MIME informado e memoryStorage; rota de áudio usa esse filtro | Pendente: validar bytes, limites e política de acesso; não foi demonstrado exploit |
| SH-EDGE-01 | Média | Nginx não define headers/CSP; Swagger servido em todos os ambientes | Pendente: verificar headers efetivos e política compatível com frontend |

## Controles existentes observados

- CORS com lista de origens e credentials habilitado; precisa de teste por ambiente.
- Helmet na API e limitadores geral/auth/reset/upload definidos.
- Middleware exige membership ativa para contexto autorizado; testes unitários de negação existentes.
- Tokens de reset são armazenados em hash e possuem expiração.
- Exportação LGPD usa campos explícitos, e a v5 introduziu auditoria persistente.

Esses controles não substituem testes completos de integração entre tenants.

## Limites e evidências de execução

- Código clonado e inspecionado neste ambiente; runtime Windows/WSL/Coolify não acessado.
- `npm ci --ignore-scripts` no backend, seguido de geração Prisma/build explícitos: PASS.
- `npm run test:unit -- --runInBand`: 25 suites / 360 testes PASS.
- Regressão nova usa servidor Express local e requests HTTP com dados sintéticos; não toca PostgreSQL real.
- Frontend não foi alterado nem teve build reexecutado neste incremento.
- Não houve correção automática de dependências, alteração de lockfiles, secrets, billing ou banco.

Próximo incremento: SH-02, triagem/remediação de dependências e gates, seguida de SH-03 para sessões.
