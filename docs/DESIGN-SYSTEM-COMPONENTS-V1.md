# Therapist Platform — Component Library v1

Esta biblioteca é a camada executável do Design System **Calma estruturada**.

Localização:

`frontend/src/app/shared/design-system`

Importação recomendada:

```ts
import {
  DsAvatarComponent,
  DsBadgeComponent,
  DsButtonComponent,
  DsCardComponent,
  DsEmptyStateComponent,
  DsFormFieldComponent,
  DsPageHeaderComponent
} from '../../shared/design-system';
```

## Regras

1. Código novo deve preferir componentes `ds-*` aos equivalentes montados manualmente.
2. Cores devem vir de tokens do Design System.
3. Componentes de domínio podem compor componentes `ds-*`, mas não duplicar seus estilos fundamentais.
4. Estados precisam combinar texto/ícone com cor.
5. Não criar novas variantes visuais sem primeiro incorporá-las à biblioteca.
6. A biblioteca permanece independente de regras de negócio.

## DsButton

Selector: `ds-button`.

Entradas:

- `variant`: `primary | secondary | ghost | danger`
- `size`: `sm | md | lg`
- `type`: `button | submit | reset`
- `icon`: classe PrimeIcons, por exemplo `pi-plus`
- `ariaLabel`
- `disabled`
- `loading`
- `fullWidth`

Exemplo:

```html
<ds-button icon="pi-plus">
  Novo atendimento
</ds-button>

<ds-button variant="secondary">
  Cancelar
</ds-button>
```

## DsCard

Selector: `ds-card`.

Entradas:

- `padding`: `sm | md | lg`
- `interactive`: ativa feedback de hover para cards acionáveis.

Slots opcionais:

- `dsCardHeader`
- conteúdo padrão
- `dsCardFooter`

Exemplo:

```html
<ds-card>
  <div dsCardHeader>Próximo atendimento</div>
  <p>Ana Martins · 14:30</p>
  <div dsCardFooter>
    <ds-button>Iniciar atendimento</ds-button>
  </div>
</ds-card>
```

## DsBadge

Selector: `ds-badge`.

Tons:

- `neutral`
- `brand`
- `success`
- `warning`
- `error`
- `info`

`dot=true` adiciona indicador visual sem depender somente da cor.

Exemplo:

```html
<ds-badge tone="success" [dot]="true">Confirmado</ds-badge>
```

## DsAvatar

Selector: `ds-avatar`.

Entradas:

- `name`
- `imageUrl`
- `alt`
- `size`: `sm | md | lg`

Sem imagem, as iniciais são derivadas automaticamente do nome.

```html
<ds-avatar name="Ana Martins" />
```

## DsPageHeader

Selector: `ds-page-header`.

Entradas:

- `title` obrigatório
- `description`
- `eyebrow`

Slot:

- `dsPageActions`

Exemplo:

```html
<ds-page-header
  title="Pacientes"
  description="Acompanhe pacientes, próximos atendimentos e pendências.">
  <div dsPageActions>
    <ds-button icon="pi-plus">Novo paciente</ds-button>
  </div>
</ds-page-header>
```

## DsEmptyState

Selector: `ds-empty-state`.

Entradas:

- `title` obrigatório
- `description`
- `icon`

Slot:

- `dsEmptyActions`

A mensagem deve explicar o estado e, quando fizer sentido, oferecer a ação seguinte.

```html
<ds-empty-state
  title="Nenhum atendimento registrado"
  description="Registre o primeiro atendimento deste paciente.">
  <div dsEmptyActions>
    <ds-button>Registrar atendimento</ds-button>
  </div>
</ds-empty-state>
```

## DsFormField

Selector: `ds-form-field`.

Entradas:

- `label` obrigatório
- `forId`
- `hint`
- `error`
- `required`

O componente cuida de label, ajuda e erro. O controle continua sendo nativo, PrimeNG ou outro componente compatível.

```html
<ds-form-field
  label="Nome do paciente"
  forId="patient-name"
  [required]="true"
  [error]="nameError">
  <input id="patient-name" type="text" />
</ds-form-field>
```

## Composição recomendada

Componentes de domínio previstos:

```text
PatientCard
  ├── DsCard
  ├── DsAvatar
  ├── DsBadge
  └── DsButton

AppointmentCard
  ├── DsCard
  ├── DsAvatar
  └── DsBadge

SessionSummary
  ├── DsCard
  └── DsBadge
```

A biblioteca fundamental deve permanecer pequena. Um novo componente só entra aqui quando possuir utilidade transversal em múltiplos fluxos.

## Próxima camada

Após esta biblioteca:

1. Dashboard / Hoje
2. Agenda
3. Pacientes
4. Atendimento e prontuário
5. Financeiro e relatórios
6. páginas públicas

As telas devem ser migradas incrementalmente, preservando comportamento e contratos existentes.
