# Therapist Platform — Design System v1

## Direção

**Calma estruturada**.

A interface deve transmitir acolhimento, profissionalismo, segurança e organização sem parecer um ERP, um sistema hospitalar ou um template administrativo genérico.

Princípio central:

> Tecnologia silenciosa para quem precisa estar presente.

## Personalidade

- Humana, sem infantilização.
- Profissional, sem frieza institucional.
- Contemporânea, sem estética futurista.
- Calma, sem perder densidade funcional.
- Segura, com estados e ações explícitos.
- Acessível por padrão.

## Tokens

### Brand — Sage

| Token | Valor |
| --- | --- |
| 50 | `#F3F7F5` |
| 100 | `#E4EEE9` |
| 200 | `#C9DED3` |
| 300 | `#A5C8B7` |
| 400 | `#7EAE98` |
| 500 | `#5B947B` |
| 600 | `#477762` |
| 700 | `#385E4E` |
| 800 | `#304D42` |
| 900 | `#293F37` |
| 950 | `#15231E` |

A ação primária usa **Sage 600**. Hover usa **Sage 700**.

### Accent — Terracotta

`#D56546` é a cor de apoio. Ela deve aparecer com parcimônia em conteúdo editorial, gráficos e destaques; não substitui a cor primária.

### Warm Stone

A aplicação usa neutros levemente aquecidos.

- background: `#F8F8F5`
- surface: `#FFFFFF`
- surface secondary: `#F1F1EC`
- border: `#E4E3DC`
- text primary: `#1E1E1B`
- text secondary: `#5E5B55`
- text muted: `#7D7A73`

### Estados

- success: `#3F795F` / bg `#EDF7F1`
- warning: `#B7791F` / bg `#FFF8E6`
- error: `#B54747` / bg `#FFF0F0`
- info: `#52718C` / bg `#EEF5FA`

## Tipografia

Família principal:

`Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`

Escala recomendada:

- H1: 32/40, semibold
- H2: 24/32, semibold
- H3: 20/28, semibold
- H4: 18/26, semibold
- Body large: 16/24
- Body: 14/21
- Small: 13/19
- Caption: 12/16, medium

Não utilizar tipografia decorativa na aplicação autenticada.

## Espaçamento e geometria

Base de 4px.

Espaçamentos predominantes: 16px, 24px e 32px.

Radius:

- xs 6px
- sm 8px
- md 12px
- lg 16px
- xl 20px
- pill 999px

Sombras devem ser discretas e não devem ser o mecanismo principal de hierarquia.

## Layout

Desktop:

- sidebar padrão: 240px;
- conteúdo com largura máxima aproximada de 1440px;
- fundo de workspace: Stone 50;
- sidebar: Stone 25;
- separação por borda sutil;
- navegação ativa: Sage 50 + Sage 800.

Mobile:

- header de 64px;
- navegação em drawer;
- alvos de interação com pelo menos 40px.

## Regras de composição

1. Tente resolver a hierarquia com espaço e tipografia antes de criar um card.
2. Evite cards dentro de cards.
3. Tabelas só devem existir quando houver comparação tabular real.
4. Estados nunca dependem apenas de cor.
5. Formulários longos devem ser divididos em grupos semânticos.
6. Ações destrutivas devem ser visualmente explícitas.
7. IA não ganha uma estética paralela com neon, gradientes roxos ou robôs.

## Componentes-base

### Actions
Button, IconButton e DropdownButton.

### Inputs
Input, Textarea, Select, Checkbox, Radio, Switch, DatePicker, Search e Autocomplete.

### Navigation
Sidebar, Topbar, Breadcrumb, Tabs e Mobile Navigation.

### Data display
Card, Badge, Avatar, List, Table, Timeline, Calendar e Empty State.

### Feedback
Toast, Alert, Skeleton, Progress e Tooltip.

### Overlay
Modal, Drawer, Dropdown e Popover.

## Componentes de domínio

- PatientCard
- AppointmentCard
- SessionSummary
- PatientTimeline
- ClinicalNote
- NextAppointment
- PrivacyIndicator

Esses componentes devem representar conceitos do produto, e não somente combinações de elementos visuais.

## Acessibilidade

Meta mínima: **WCAG 2.2 AA**.

Obrigatório:

- foco visível;
- navegação por teclado;
- labels associados aos campos;
- contraste adequado;
- erro associado ao campo;
- ícone/texto além da cor para estados;
- motion curto e não essencial.

## Dark mode

A arquitetura de tokens já prevê o modo escuro:

- background `#151714`
- surface `#1E211E`
- surface secondary `#272B27`
- border `#383C38`
- text `#F3F3EE`
- muted `#A6AAA3`
- brand `#76AD91`

A implementação visual completa será uma etapa posterior.

## Estratégia de migração

A migração deve ser incremental:

1. foundations/tokens;
2. PrimeNG preset;
3. application shell;
4. componentes-base;
5. dashboard;
6. agenda;
7. pacientes;
8. atendimento/prontuário;
9. financeiro e relatórios;
10. páginas públicas;
11. remoção definitiva dos aliases legados.

Durante a transição, aliases de compatibilidade mantêm telas antigas funcionais, mas código novo deve usar tokens semânticos ou a paleta Sage/Stone definida aqui.
