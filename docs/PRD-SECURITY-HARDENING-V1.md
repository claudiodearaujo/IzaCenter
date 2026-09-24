# PRD — Security Hardening v1

**Status:** 🟡 Em andamento — SH-01 integrado; SH-02 a SH-05 implementados e validados no CI; gates operacionais pendentes.
**Base inspecionada:** `972cd42fe41ee6ba93198a1a1b2c6986c7f97711`.
**Data:** 2026-09-24.

## Objetivo

Reduzir riscos antes da exposição pública e da cobrança SaaS real. Preservar a SaaS Foundation v1–v5, a identidade global do usuário e a autorização por membership ativa no tenant selecionado.

Billing continua desligado. Este PRD não autoriza publicação externa, cobrança, rotação de credenciais em provedores nem alterações destrutivas em dados reais.

## Baseline verificável

Diagnóstico: [SECURITY-BASELINE-V1.md](SECURITY-BASELINE-V1.md).
Inventário de dependências: [security/dependency-baseline-v1.json](security/dependency-baseline-v1.json).

O diagnóstico inicial é estático, complementado por testes locais e npm audit. Não equivale a pentest, certificação, revisão jurídica ou validação do runtime Coolify.

## Ameaças e fronteiras

| Fronteira | Ameaça a validar | Controle/aceite |
|---|---|---|
| Navegador → API | Roubo/replay de tokens; renovação inconsistente | Sessão revogável; refresh rotativo; contrato único frontend/backend |
| Usuário → tenant | Alteração de slug/host/ID para acessar outro workspace | Membership ativa e filtros tenant-scoped em leitura, escrita e exportação |
| Proxy → Express | IP encaminhado falsificado ou limite compartilhado | Modelo explícito de proxies confiáveis e teste na topologia real |
| Upload → armazenamento | MIME falso, conteúdo ativo, exaustão de memória | Validação do conteúdo, limites, autorização e acesso ao objeto |
| Aplicação → observabilidade | PII e segredos em URL, headers, erro ou breadcrumb | Allowlist de metadados e testes de não divulgação |
| Dependência → build/runtime | Pacote vulnerável e regressão de supply chain | Inventário, remediação compatível e gate CI |
| Host → tenant | Domínio arbitrário/fallback indevido | Resolução determinística e teste de host desconhecido |

## Sequência de implementação

### SH-01 — Inventário e minimização de access logs

- Inventariar lockfiles backend/frontend sem atualizar versões automaticamente.
- Substituir Morgan dev/combined por formato JSON com allowlist.
- Registrar somente evento, método normalizado, status e duração.
- Testar resposta de sucesso e 404 com segredos sintéticos em path/query/headers/body.
- Registrar lacunas de Nginx, erros, auditoria e Sentry separadamente.

### SH-02 — Dependências e gates de CI

- Separar dependências entregues na imagem final das usadas só em build/testes.
- Triar alertas por advisory, versão instalada, alcance e correção compatível.
- Corrigir primeiro alertas altos/críticos alcançáveis; não aplicar `npm audit fix --force` indiscriminadamente.
- Executar também auditoria completa, incluindo devDependencies, raiz e e2e.
- Introduzir SCA bloqueante para severidade alta/crítica; indisponibilidade do scanner deve falhar explicitamente.
- Exceção precisa de justificativa, responsável e expiração; não suprimir categoria inteira.
- Adicionar SAST adequado às permissões disponíveis e verificar branch protection/checks obrigatórios.
- Confirmar que o gate falha com fixture vulnerável isolada, sem incorporar dependência vulnerável ao produto.

### SH-03 — Sessões e autenticação

- Definir sessão persistente com refresh armazenado somente em hash, expiração e revogação.
- Rotacionar refresh de forma atômica e detectar reutilização; definir comportamento para abas concorrentes.
- Revogar conforme contrato explícito em logout, troca e reset de senha; validar tokens já emitidos.
- Alinhar endpoint, payload, transporte e armazenamento de tokens no frontend.
- Preferir refresh em cookie HttpOnly/Secure; validar SameSite, CSRF e CORS conforme topologia antes da migração.
- Restringir algoritmos e validar claims JWT; verificar força e separação dos secrets sem imprimir seus valores.
- Testar token expirado, assinatura inválida, replay, revogação, usuário removido e membership suspensa.

### SH-04 — Borda HTTP, uploads e observabilidade

- Validar CORS por origem e ambiente, incluindo preflight com header de tenant.
- Testar rate limiting de login, reset, refresh, onboarding e uploads atrás do proxy real.
- Aplicar headers/CSP no frontend e API; medir compatibilidade antes de política restritiva.
- Revisar Swagger em produção, logs Nginx, mensagens de erro, auditoria e Sentry (URLs, query, breadcrumbs e headers sem depender de capitalização).
- Validar conteúdo de uploads e URLs externas, incluindo redirecionamentos e destinos privados onde houver fetch no servidor.
- Documentar credenciais e configuração exigidas sem material secreto; nenhuma rotação automática neste incremento.

### SH-05 — Isolamento e fechamento operacional

- Exercitar dois tenants, usuários exclusivos e usuário com memberships distintas.
- Negar leitura/mutação por ID estrangeiro em pedidos, entregas, agendamentos, settings, LGPD e incidentes.
- Verificar ADMIN global sem membership e membership inativa.
- Testar alteração de slug/host e ausência de tenant explícito conforme contrato de fallback.
- Registrar matriz de controles OWASP ASVS aplicáveis com evidência ou pendência explícita.
- Validar migrations e rollback de aplicação; deploy autorizado e smoke no Coolify/Tailscale.

## Gates de saída

1. Nenhum alerta alto/crítico aplicável sem correção ou exceção formal temporária.
2. SAST/SCA executados no CI, com falhas bloqueantes e checks obrigatórios verificados.
3. Ciclo de sessão consistente e testes de replay/revogação aprovados.
4. Matriz de negação cross-tenant aprovada em integração.
5. Logs das camadas revisadas sem segredos/PII sintéticos, preservando observabilidade mínima.
6. Headers, CORS, limites e uploads validados no runtime dedicado.
7. Build/testes/CI aprovados e evidências de deploy/smoke registradas.

Só então marcar Security Hardening v1 concluído. Production Operations mantém gates próprios antes de exposição pública ou billing real.

## Primeiro incremento — validação

- Backend build: PASS.
- Backend: 25/25 suites e 360/360 testes PASS, incluindo teste HTTP real do access logger.
- npm audit backend/frontend: concluído com alertas; não é PASS de segurança.
- Nenhuma migration, mudança de credenciais ou alteração no runtime neste incremento.
- PR/CI e deploy: verificar no fechamento deste incremento; SH-02 a SH-05 continuam pendentes.

## Continuidade autorizada

Implementação e evidências: [runbook de implantação](SECURITY-HARDENING-V1-RUNBOOK.md). O PR #117 foi integrado. Código de sessões, dependências/gates, borda e integração foi implementado; o fechamento depende de CI e das pendências externas listadas no runbook.
