# PRD — Specialty Modules v5

**Status:** ✅ Implementado e validado

## Objetivo

Retirar funcionalidades específicas de especialidade do core operacional e executá-las apenas quando um módulo estiver explicitamente habilitado por uma especialidade ativa.

A primeira implementação cobre o módulo legado de cartas como `tarot-cards`.

## Princípios

- módulos de especialidade são opcionais;
- uma especialidade ativa é a fonte de habilitação do módulo;
- API, rotas e menus devem respeitar a mesma configuração;
- módulos desabilitados não aparecem na navegação e não expõem endpoints funcionais;
- Delivery e Service Domain continuam genéricos;
- nenhuma remoção física de tabelas nesta fase.

## Registry v1

Cada especialidade pode definir:

- `usesCardModule` — compatibilidade legada;
- `moduleKey` — identificador genérico opcional.

Compatibilidade:
- `usesCardModule=true` equivale a `moduleKey=tarot-cards`;
- módulos futuros usam diretamente `moduleKey`.

## Entregas

1. Resolver `enabledModules` a partir de especialidades ativas.
2. Expor `enabledModules` em PublicSettings.
3. Criar middleware backend `requireSpecialtyModule()`.
4. Proteger todos os endpoints de Cards.
5. Criar guard Angular de specialty module.
6. Proteger rota `/admin/cartas`.
7. Ocultar item Cartas do menu quando o módulo estiver desabilitado.
8. Permitir configurar quais especialidades ativam o módulo de cartas.
9. Preservar Delivery `specialtyModule=tarot-cards` para histórico.
10. Cobrir registry, middleware, store/guard com testes.

## Critérios de aceite

- sem especialidade ativa com módulo de cartas, `enabledModules` não contém `tarot-cards`;
- endpoints `/cards` e `/admin/cards` retornam 404 quando desabilitados;
- rota e menu de Cartas não ficam disponíveis quando desabilitados;
- habilitar uma especialidade com módulo de cartas reativa API e UI sem deploy;
- deliveries históricas continuam renderizáveis;
- builds e CI verdes.

## Fora do escopo

- remover tabelas `cigano_cards` / `reading_cards`;
- criar marketplace de plugins;
- carregar código remoto;
- multi-tenancy;
- billing por módulo.

## Próxima fase

SaaS Foundation:
Tenant → isolamento de dados → onboarding → branding/domínio → planos → billing → LGPD operacional.
