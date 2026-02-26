# Sprints — IzaCenter (Itens Faltantes)

> Data de referência: 26/02/2026
> Baseado na auditoria do código-fonte real. Cada item foi verificado diretamente nos arquivos do projeto.

---

## Sprint 1 — Fluxo Pós-Pagamento + Agendamento pelo Cliente
**Duração:** 1 semana
**Objetivo:** Completar o ciclo de compra e habilitar o cliente a criar agendamentos.

### Contexto técnico
- O backend já redireciona para `/cliente/pedidos/:id?success=true` (sucesso) e `/loja/checkout?cancelled=true` (cancelado), mas o frontend **ignora** ambos os query params.
- Não existe `POST /appointments` para clientes — apenas admin pode criar agendamentos via service. A rota client-side só lista e cancela.

### Tarefas

#### 1.1 — Feedback pós-pagamento no frontend
**Arquivos:** `frontend/src/app/features/client/orders/order-detail/order-detail.component.ts` e `.html`
**Arquivos:** `frontend/src/app/features/shop/checkout/checkout.component.ts` e `.html`

- [ ] Ler `ActivatedRoute.queryParams` em `order-detail.component` e exibir banner de sucesso quando `?success=true` está presente
- [ ] Limpar o param da URL com `location.replaceState()` após exibir o banner (evita re-exibição no refresh)
- [ ] Ler `ActivatedRoute.queryParams` em `checkout.component` e exibir mensagem de aviso quando `?cancelled=true` está presente

**Critério de aceite:** Após pagamento bem-sucedido, o cliente vê confirmação visual na tela de detalhe do pedido. Após cancelar no Stripe, vê mensagem amigável no checkout.

---

#### 1.2 — Backend: endpoint de criação de agendamento pelo cliente
**Arquivo:** `backend/src/modules/appointments/appointments.routes.ts`
**Arquivo:** `backend/src/modules/appointments/appointments.controller.ts`
**Arquivo:** `backend/src/modules/appointments/appointments.service.ts`

- [ ] Criar rota `POST /appointments` protegida por `authenticate` (sem `requireAdmin`)
- [ ] Adicionar método `book(req, res, next)` em `AppointmentsController` que lê `userId` do JWT e chama `appointmentsService.create(...)`
- [ ] O método `create` já existe no service — apenas expô-lo na rota de cliente, passando `userId` do token (não do body)
- [ ] Validar que o `orderItemId` informado pertence ao usuário autenticado (segurança: evitar IDOR)

**Critério de aceite:** `POST /appointments` com token válido cria agendamento e retorna 201. Tentativa com `orderItemId` de outro usuário retorna 403.

---

#### 1.3 — Frontend: tela de agendamento pelo cliente
**Novo arquivo:** `frontend/src/app/features/client/appointments/appointment-book/`
**Arquivo:** `frontend/src/app/features/client/client.routes.ts`

- [ ] Criar componente `AppointmentBookComponent` em `client/appointments/appointment-book/`
- [ ] Adicionar rota `/cliente/agendamentos/novo` no `client.routes.ts`
- [ ] UI: seletor de data (PrimeNG `p-calendar` ou `p-datepicker`) + chamada a `GET /appointments/available-slots?date=YYYY-MM-DD`
- [ ] UI: grade de horários disponíveis retornados pela API (chips/buttons selecionáveis)
- [ ] UI: seletor do serviço/pedido a ser agendado (buscar `GET /orders` do usuário com status PAID que ainda não têm agendamento)
- [ ] Submit: `POST /appointments` com `{ orderItemId, scheduledDate, startTime, endTime, clientNotes }`
- [ ] Após criação bem-sucedida, redirecionar para `/cliente/agendamentos` com mensagem de sucesso
- [ ] Adicionar botão "Novo agendamento" na listagem de agendamentos existente (`appointment-list.component.html`)

**Critério de aceite:** Cliente autenticado consegue selecionar data, horário e serviço, confirmar o agendamento e ser redirecionado para a lista com confirmação visual.

---

## Sprint 2 — Formulário de Contato Real + Depoimentos Dinâmicos
**Duração:** 1 semana
**Objetivo:** Substituir mocks e TODOs por integrações reais com o backend.

### Contexto técnico
- `contact.component.ts` tem `// TODO: Send to API` e simula delay com `setTimeout`.
- `home.component.ts` chama `loadMockData()` que seta 3 depoimentos hardcoded. A API `GET /testimonials/public` já existe no backend.
- Não existe módulo `contact` no backend (`backend/src/modules/` não tem pasta `contact`).

### Tarefas

#### 2.1 — Backend: endpoint de contato
**Novo arquivo:** `backend/src/modules/contact/contact.routes.ts`
**Novo arquivo:** `backend/src/modules/contact/contact.service.ts`

- [ ] Criar `POST /contact` público (sem autenticação)
- [ ] Body: `{ name, email, subject, message }` — validar com express-validator ou schema Zod
- [ ] Usar `sendEmail()` (já existente no projeto) para encaminhar a mensagem para o e-mail da Izabela
- [ ] Responder com rate limiting básico (evitar spam) — usar o middleware de rate limit já presente no projeto
- [ ] Registrar a rota em `backend/src/modules/index.ts`

**Critério de aceite:** `POST /contact` com dados válidos envia e-mail e retorna `{ message: 'Mensagem enviada com sucesso' }`. Campos em branco retornam 400.

---

#### 2.2 — Frontend: conectar formulário de contato à API
**Arquivo:** `frontend/src/app/features/public/contact/contact.component.ts`

- [ ] Injetar `HttpClient` ou criar `ContactService` com método `send(data)`
- [ ] Substituir `setTimeout` por chamada real a `POST /contact`
- [ ] Manter tratamento de erro: exibir mensagem de erro caso a API falhe
- [ ] Desabilitar o botão durante `isLoading`

**Critério de aceite:** Submissão do formulário dispara requisição real e o usuário recebe feedback correto de sucesso ou erro.

---

#### 2.3 — Frontend: depoimentos dinâmicos na página pública
**Arquivo:** `frontend/src/app/features/public/home/home.component.ts`
**Arquivo:** `frontend/src/app/core/services/testimonials.service.ts` (verificar se existe)

- [ ] Verificar se `TestimonialsService` já tem método para `GET /testimonials/public` (ou `GET /testimonials/featured`)
- [ ] Caso não exista, adicionar método `getPublic()` no serviço
- [ ] Substituir `loadMockData()` por chamada real ao serviço
- [ ] Exibir skeleton loader enquanto carrega
- [ ] Tratar array vazio (nenhum depoimento aprovado ainda) com estado vazio amigável

**Critério de aceite:** Depoimentos exibidos na home vêm da API. Adicionar um depoimento no painel admin (e aprová-lo) reflete imediatamente na home.

---

## Sprint 3 — Geração de PDF Server-Side
**Duração:** 1 semana
**Objetivo:** Permitir download de comprovantes de pedidos e relatórios de leituras em PDF.

### Contexto técnico
- Não existe módulo `pdf` no backend (`backend/src/modules/` não tem nenhum arquivo relacionado).
- Não existe nenhuma rota para geração de PDF nos módulos `orders` ou `readings`.

### Tarefas

#### 3.1 — Backend: serviço de geração de PDF
**Novo arquivo:** `backend/src/shared/services/pdf.service.ts`

- [ ] Instalar dependência: `pdfkit` (leve, sem dependências nativas) ou `@react-pdf/renderer` se o time preferir
- [ ] Criar `PdfService` com métodos:
  - `generateOrderReceipt(orderId: string): Promise<Buffer>` — comprovante de pedido
  - `generateReadingReport(readingId: string): Promise<Buffer>` — relatório de leitura
- [ ] Layout mínimo do comprovante: logo, dados do pedido, itens, valor total, data, status
- [ ] Layout mínimo do relatório de leitura: logo, tipo de leitura, conteúdo da leitura, data

**Critério de aceite:** Chamar o método gera um Buffer de PDF válido e legível.

---

#### 3.2 — Backend: rotas de download de PDF
**Arquivo:** `backend/src/modules/orders/orders.routes.ts`
**Arquivo:** `backend/src/modules/readings/readings.routes.ts`

- [ ] Adicionar `GET /orders/:id/pdf` (autenticado — verificar que o pedido pertence ao usuário ou é admin)
- [ ] Adicionar `GET /readings/:id/pdf` (autenticado — mesma verificação)
- [ ] Setar headers corretos: `Content-Type: application/pdf`, `Content-Disposition: attachment; filename="pedido-XXX.pdf"`
- [ ] Responder com o Buffer gerado pelo `PdfService`

**Critério de aceite:** `GET /orders/:id/pdf` com token válido retorna arquivo PDF para download. Pedido de outro usuário retorna 403.

---

#### 3.3 — Frontend: botões de download de PDF
**Arquivo:** `frontend/src/app/features/client/orders/order-detail/order-detail.component.ts` e `.html`
**Arquivo:** `frontend/src/app/features/client/readings/reading-detail/reading-detail.component.ts` e `.html`

- [ ] Adicionar método `downloadPdf()` que faz `GET /orders/:id/pdf` com `responseType: 'blob'`
- [ ] Usar `URL.createObjectURL()` + âncora temporária para disparar o download no browser
- [ ] Botão com ícone de download e estado de loading
- [ ] Repetir o mesmo padrão em `reading-detail`

**Critério de aceite:** Clicar em "Baixar PDF" inicia download do arquivo sem abrir nova aba.

---

## Sprint 4 — Configuração de Produção
**Duração:** 1 semana
**Objetivo:** Tornar o sistema operacional em produção com todas as integrações reais configuradas.

> Esta sprint é majoritariamente de infraestrutura/DevOps — sem código novo, mas crítica para o go-live.

### Tarefas

#### 4.1 — Secrets do GitHub Actions
**Arquivo:** `.github/workflows/` (arquivos existentes)

- [ ] Configurar no repositório GitHub → Settings → Secrets:
  - `RENDER_API_KEY` — para deploy automático
  - `RENDER_BACKEND_SERVICE_ID`
  - `RENDER_FRONTEND_SERVICE_ID`
  - `STRIPE_SECRET_KEY` (produção, não test)
  - `STRIPE_WEBHOOK_SECRET` (produção)
  - `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`
  - `REDIS_URL` (URL do Redis em produção)
  - `JWT_SECRET` (secret forte, gerado aleatoriamente)
  - `FRONTEND_URL` (domínio de produção: `https://www.izabelatarot.com.br`)
- [ ] Verificar que o pipeline de CI/CD usa os secrets corretamente (sem fallback para valores de dev)

**Critério de aceite:** Deploy via `git push main` completa sem erros e a aplicação sobe com variáveis de produção.

---

#### 4.2 — Redis em produção
**Arquivo:** `backend/src/config/redis.ts` (ou onde estiver a configuração)

- [ ] Provisionar instância Redis no Render (Redis addon) ou Upstash
- [ ] Garantir que `REDIS_URL` está configurada no serviço backend do Render
- [ ] Testar que as filas BullMQ e o cache funcionam em produção
- [ ] Verificar que a aplicação inicia corretamente se Redis não responder (graceful degradation ou erro claro)

**Critério de aceite:** Filas de e-mail e notificações processam jobs em produção. Painel de saúde (`/health`) retorna status do Redis.

---

#### 4.3 — SMTP em produção
- [ ] Configurar conta SendGrid (ou outro provedor SMTP transacional)
- [ ] Verificar domínio remetente (SPF, DKIM, DMARC) para evitar spam
- [ ] Testar envio de e-mails de confirmação de pedido, agendamento e contato em produção
- [ ] Configurar endereço `izabela.ayurvida@gmail.com` como destinatário dos e-mails de contato

**Critério de aceite:** E-mails transacionais chegam na caixa de entrada (não spam) com remetente verificado.

---

#### 4.4 — Domínio e SSL
- [ ] Apontar DNS de `izabelatarot.com.br` para o serviço frontend no Render
- [ ] Configurar `www.izabelatarot.com.br` com redirecionamento de `izabelatarot.com.br` → `www`
- [ ] Validar certificado SSL automático do Render
- [ ] Atualizar `FRONTEND_URL` no backend para o domínio de produção
- [ ] Configurar webhook do Stripe para o domínio de produção (`https://api.izabelatarot.com.br/webhooks/stripe`)

**Critério de aceite:** `https://www.izabelatarot.com.br` carrega com cadeado verde. Pagamentos Stripe disparam webhook corretamente em produção.

---

#### 4.5 — Smoke test de produção
- [ ] Registrar novo usuário e fazer login
- [ ] Adicionar produto ao carrinho e simular compra com cartão de teste Stripe
- [ ] Verificar redirecionamento pós-pagamento e banner de sucesso (Sprint 1)
- [ ] Criar agendamento pelo painel do cliente (Sprint 1)
- [ ] Enviar formulário de contato e confirmar recebimento do e-mail (Sprint 2)
- [ ] Baixar PDF de um pedido (Sprint 3)

**Critério de aceite:** Todos os fluxos críticos funcionam end-to-end em produção.

---

## Resumo das Sprints

| Sprint | Foco                              | Itens | Complexidade |
|--------|-----------------------------------|-------|--------------|
| 1      | Fluxo pós-pagamento + Agendamento | 3     | Alta         |
| 2      | Contato real + Depoimentos reais  | 3     | Média        |
| 3      | PDF server-side                   | 3     | Média        |
| 4      | Configuração de produção          | 5     | Média/Infra  |

**Ordem recomendada:** Sprint 1 → Sprint 2 → Sprint 4 (go-live parcial) → Sprint 3
