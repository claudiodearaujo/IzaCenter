# PRD — Service Domain v2

**Status:** ✅ Implementado e validado

## Objetivo

Desacoplar o catálogo de serviços dos tipos rígidos herdados do domínio de Tarot sem quebrar pedidos, produtos ou integrações existentes.

## Problema atual

O catálogo depende de `ProductType` (`QUESTION`, `SESSION`, `MONTHLY`, `SPECIAL`) e de campos específicos como `numQuestions` e `numCards`. Isso obriga novas especialidades a se encaixarem em conceitos que não pertencem ao core.

## Solução

Introduzir em `Product`:
- `serviceKind`: classificação aberta e genérica do item;
- `capabilities`: JSON versionável com capacidades funcionais do serviço.

O enum `ProductType` e os campos legados permanecem durante a janela de compatibilidade.

## Capability model v1

- `scheduling`: habilitado + duração;
- `intake`: habilitado + limite de perguntas/campos;
- `digitalDelivery`: habilitado + formato;
- `recurring`: habilitado + sessões + cadência;
- `specialtyModule`: módulo opcional + configuração livre.

Exemplos de `serviceKind`:
- `SERVICE`;
- `SESSION`;
- `PACKAGE`;
- `ASYNC_SERVICE`;
- `DIGITAL_PRODUCT`.

A lista não é enum de banco: novos tipos podem ser introduzidos sem migração estrutural.

## Compatibilidade

- criação via API não exige mais `productType` quando `serviceKind` é informado;
- o backend deriva o `ProductType` legado para manter `OrderItem` compatível;
- writes genéricos sincronizam `requiresScheduling`, `sessionDurationMinutes`, `numQuestions` e `numCards` quando aplicável;
- reads expõem `serviceKind` e `capabilities` mesmo para registros antigos;
- migração faz backfill inicial dos produtos existentes.

## Critérios de aceite

- migração aditiva, sem remoção ou rename destrutivo;
- produtos antigos continuam legíveis e compráveis;
- novos serviços podem ser cadastrados sem conceitos de Tarot;
- admin edita kind, agenda, intake, entrega digital e recorrência;
- testes unitários e builds verdes;
- API documentada para transição.

## Fora do escopo

- remover `ProductType` do banco;
- remover `numCards`/`numQuestions` fisicamente;
- migrar `Reading`;
- multi-tenancy e billing SaaS.
