# Security Hardening v1 — implantação e evidências

## Estado

Implementação em validação. Não declarar a trilha encerrada antes do smoke no Coolify, validação do armazenamento privado e confirmação dos checks obrigatórios na main.

## Mudanças de comportamento

- Access tokens contêm session ID e são conferidos no banco; tokens anteriores ao deploy deixam de ser aceitos. Todos devem fazer login novamente.
- Refresh opaco em cookie HttpOnly, SameSite=Strict, Secure em produção; access somente em memória. Prazo absoluto de sessão: 7 dias, sem extensão na rotação.
- Frontend restaura sessão ao iniciar, coordena refresh entre abas com Web Locks quando disponível e evita múltiplos refreshes simultâneos na mesma aba.
- Compare-and-swap permite apenas uma renovação por credencial. Reuso retorna 401, sem revogar a credencial vencedora. Navegadores sem Web Locks podem precisar de novo login após disputa entre abas.
- Logout revoga a sessão inteira. Troca/reset de senha incrementam a versão de autenticação e invalidam todas as sessões anteriores. Reset é de uso único por atualização condicional.
- Rotas que criam/renovam/removem cookie exigem `X-Requested-With: XMLHttpRequest` e origem permitida. Clientes CLI também devem enviar o header. Refresh é `POST /api/auth/refresh`, sem token no JSON.
- URLs externas não recebem Authorization pelo interceptor Angular.
- A proteção do router LGPD foi limitada a `/privacy` e `/admin/privacy`, preservando login e páginas públicas.
- Exceções legadas de recurso inexistente/proibido agora preservam os códigos HTTP 404/403, em vez de 500.

## Dependências e CI

- Atualizações compatíveis dos lockfiles, Nodemailer 10.0.10 e Sharp 0.35.4.
- Overrides transitivos explícitos: deepmerge-ts 8.0.0 e mysql2 3.24.4. Rever após upstream remover ranges vulneráveis; geração Prisma, migrations e testes são gates de compatibilidade.
- Angular service-worker alinhado à major 20 do restante do frontend.
- SCA inclui dependências de desenvolvimento de raiz/backend/frontend/e2e. `npm audit --audit-level=high` falha tanto com alertas altos/críticos como com erro do registry.
- SAST CodeQL security-extended com gate SARIF de severidade >=7/erro. Resultado ausente ou scanner com falha não passa.
- Integração usa PostgreSQL 16 descartável no CI, aplica todas as migrations e valida isolamento e sessões por HTTP.
- Unidade frontend passa a ser executada no CI, além de build.
- GitHub retornou 403 na consulta de proteção da main. Os workflows executam os gates, mas sua obrigatoriedade contra merges externos precisa ser confirmada por administrador. Não foi enfraquecida nenhuma proteção.

## Configuração necessária antes do deploy

1. Backup restaurável do PostgreSQL dedicado, antes da migration `20260924130000_auth_sessions`.
2. Secrets JWT distintos com pelo menos 32 caracteres em produção. Nenhum valor real foi inspecionado ou rotacionado nesta execução.
3. `FRONTEND_URL` e `BACKEND_URL` devem corresponder aos hosts permitidos. Host desconhecido não cai mais no tenant default. Subdomínios só são inferidos quando `TENANT_BASE_DOMAIN` está configurado; custom domain exato mantém precedência.
4. `TRUST_PROXY_CIDRS` vazio mantém confiança em proxy desativada. Configurar apenas IPs/CIDRs dos proxies efetivos após conferir a rede Coolify, e impedir tráfego externo direto ao backend. Não usar `true` nem confiar indiscriminadamente em X-Forwarded-For.
5. `ENABLE_API_DOCS=false` por padrão; Swagger só habilitado explicitamente ou em desenvolvimento.
6. `SAAS_BILLING_ENABLED=false` permanece invariante.
7. Criar/verificar bucket privado dedicado definido por `SUPABASE_PRIVATE_STORAGE_BUCKET` (default `therapist-private`), sem acesso anônimo e sem política ampla para authenticated. O backend usa service role após autorização própria, não Supabase Auth do navegador.

## Armazenamento de entregas

Novos uploads de áudio exigem bucket existente e privado, verificado por `getBucket`. Se ausente/público, falham sem fallback ao bucket de branding. Objetos usam prefixo `tenantId/deliveryId/audio/`, referência `private://` no banco e signed URL de 300 segundos apenas depois da consulta autorizada. Tentativa de assinar referência fora do escopo é negada.

A configuração do bucket real ainda não foi verificada. Os objetos antigos e URLs externas permanecem legados: inventariar, copiar para bucket privado, conferir checksum, trocar referências e retirar a versão pública somente após validação. Nenhum objeto real foi removido ou bucket existente tornado privado às cegas. Esse trabalho permanece bloqueador para declarar proteção integral das mídias.

Referências oficiais consultadas em 2026-09-24:
- https://supabase.com/docs/guides/storage/buckets/fundamentals
- https://supabase.com/docs/reference/javascript/file-buckets-createsignedurl
- https://supabase.com/docs/reference/javascript/file-buckets-getbucket
- https://supabase.com/changelog.md

## Observabilidade e uploads

- Access logs API/Nginx sem URL completa, IP, headers ou body.
- Auditoria conserva IDs de recurso próprios, mas normaliza segmentos livres do path.
- Sentry remove request, usuário, breadcrumb e detalhes de exceção sensíveis; tracing suspenso até política própria de minimização.
- Logs de erros operacionais não imprimem exceções brutas; Prisma não imprime query/error SQL.
- Nginx inclui CSP, HSTS, nosniff, proteção de frame e referrer. Estilos inline permanecem permitidos por compatibilidade Angular/branding; scripts inline não são permitidos. Verificar a política no navegador real antes de exposição pública.
- Uploads ativos recebem rate limit, limites multipart, verificação de assinatura MIME e nomes gerados no servidor. Imagens são decodificadas/reencodadas com limite de pixels. Assinatura de arquivo não equivale a antivírus ou validação integral de codecs.
- Erros críticos do Nginx ainda podem conter detalhes de request; validar política de coleta/retenção no runtime.

## Smoke após deploy

- Health, settings públicos e login, incluindo `/api/v1`.
- Login cria cookie Secure/HttpOnly/SameSite; resposta JSON sem refresh.
- Refresh funciona; reuso anterior é 401; logout invalida access e refresh.
- Troca/reset de senha invalidam sessões em outra aba.
- Dois tenants: troca de slug/host/ID não permite leitura/mutação; CLIENT não herda ADMIN global.
- Upload válido privado, MIME falso recusado e URL pública do objeto não acessível; signed URL expira.
- Header de origem malicioso bloqueado; IP falsificado não contorna limitador na topologia real.
- CSP sem violações impeditivas no login/onboarding/admin/privacidade/download.
- Logs/Sentry sem dados sintéticos usados no smoke.

## Rollback

A migration é aditiva. Em falha, preferir correção para frente; preservar backup e tabelas de sessão. Rollback do binário antigo remove garantias de revogação, portanto restringir acesso ao ambiente e manter a exposição pública/cobrança desligadas. Não executar DROP em sessões/dados reais automaticamente.

## Pendências externas

- Máquina local/Coolify offline na verificação desta sessão: deploy e smoke não executados.
- Proteção de branch não verificável com a permissão atual (403).
- Bucket privado e migração de mídias legadas dependem de acesso/configuração reais.

Esses itens impedem marcar todos os gates de saída como concluídos, mesmo com código e CI verdes.
