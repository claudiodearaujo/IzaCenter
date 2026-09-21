# PRD — Delivery Domain v3

**Status:** ✅ Implementado e validado

## Objetivo

Transformar o conceito legado de `Reading` em uma abstração genérica de entrega de serviço (`Delivery`), preservando dados históricos e compatibilidade de API durante a migração.

## Problema atual

- qualquer produto sem agendamento gera automaticamente uma leitura;
- o core assume Tarot por meio de cartas, interpretação e mensagens específicas;
- existem contratos frontend divergentes para o mesmo recurso;
- o detalhe do cliente usa rota diferente do módulo oficial;
- novos serviços digitais não cabem naturalmente em `Reading`.

## Direção

Service → OrderItem → Delivery

`Reading` deixa de ser identidade de domínio e passa a ser implementação física legada da nova abstração `Delivery`.

## Modelo genérico

A tabela `readings` será mantida nesta fase e receberá campos aditivos:
- `deliveryType`: classificação aberta da entrega;
- `content`: JSON genérico da entrega;
- `specialtyModule`: módulo opcional de especialidade;
- `metadata`: dados adicionais versionáveis.

Conteúdo normalizado v1:
- `introduction`;
- `body`;
- `recommendations`;
- `goals`;
- `closing`.

Mídias continuam nos campos existentes (`audioUrl`, `videoUrl`, `pdfUrl`) até etapa posterior.

## API

Novas rotas canônicas:
- `GET /deliveries`;
- `GET /deliveries/:id`;
- `GET /deliveries/:id/pdf`;
- `GET /admin/deliveries`;
- `GET /admin/deliveries/:id`;
- `PUT /admin/deliveries/:id`;
- `PATCH /admin/deliveries/:id/status`;
- `PATCH /admin/deliveries/:id/audio`.

As rotas `/readings` permanecem como aliases legados temporários.

## Regras de criação

Após pagamento:
- criar Delivery quando `capabilities.digitalDelivery.enabled = true`;
- para produtos legados sem capabilities completas, preservar o comportamento anterior como fallback;
- não criar Delivery apenas porque o serviço não exige agendamento;
- snapshot de `specialtyModule` deve ser gravado na entrega.

## Specialty modules

Tarot/Lenormand deixa de ser parte obrigatória da entrega.

Quando `specialtyModule = tarot-cards`:
- ReadingCard/CiganoCard permanecem disponíveis;
- UI de cartas é exibida;
- PDF pode incluir as cartas.

Para entregas sem specialty module:
- nenhuma UI de cartas;
- conteúdo e mensagens são genéricos.

## Compatibilidade

- campos legados de Reading continuam sincronizados com `content`;
- responses expõem tanto o contrato genérico quanto aliases legados durante a transição;
- pedidos e entregas históricas continuam acessíveis;
- nenhuma tabela ou coluna histórica é removida nesta fase.

## Critérios de aceite

- migração aditiva e com backfill;
- novas rotas `/deliveries` funcionais;
- aliases `/readings` continuam funcionais;
- pagamento cria Delivery baseado em capabilities;
- frontend usa contrato único de Delivery;
- UI de cartas só aparece quando o módulo de especialidade exigir;
- textos públicos de entrega não assumem Tarot;
- builds e testes verdes.

## Fora do escopo

- renomear fisicamente a tabela `readings`;
- remover `ReadingCard` / `CiganoCard`;
- remover rotas legadas nesta fase;
- multi-tenancy;
- billing SaaS.
