# 🌍 IzaCenter - Plano de Internacionalização Restante

**Data:** 2026-02-04
**Status:** Mapeamento Completo
**Versão Base:** main branch (produção)

---

## 📊 Resumo Executivo

| Métrica | Valor |
|---------|-------|
| **Total de Linhas de Código (TS)** | 7,830 |
| **Chamadas de Tradução Existentes** | 10,356 |
| **Arquivos Analisados** | 125 (81 TS + 44 HTML) |
| **Strings Pendentes Identificadas** | ~102 |
| **Chaves de Tradução Faltantes** | ~102 |
| **Cobertura Atual** | ~99% |
| **Cobertura Após Implementação** | ~100% |

---

## 🔴 PRIORIDADE ALTA - STRINGS CRÍTICAS DO USUÁRIO

### 1️⃣ Mensagens de Erro (Interceptador Global)

**Arquivo:** `/frontend/src/app/core/interceptors/error.interceptor.ts`

| Texto Hardcoded | Localização | Chave Proposta | Idiomas |
|---|---|---|---|
| `'Ocorreu um erro inesperado'` | Linha 13 | `error.interceptor.unexpectedError` | 4 |
| `'Sessão expirada. Faça login novamente.'` | Linha 22 | `error.interceptor.sessionExpired` | 4 |
| `'Você não tem permissão para acessar este recurso.'` | Linha 26 | `error.interceptor.unauthorized` | 4 |
| `'Recurso não encontrado.'` | Linha 29 | `error.interceptor.notFound` | 4 |
| `'Dados inválidos.'` | Linha 32 | `error.interceptor.invalidData` | 4 |
| `'Erro interno do servidor. Tente novamente mais tarde.'` | Linha 35 | `error.interceptor.serverError` | 4 |

**Impacto:** Critico - Afeta todos os erros de API
**Esforço:** 30 minutos (6 traduções × 4 idiomas = 24 strings)

---

### 2️⃣ Títulos Padrão do Serviço de Notificações

**Arquivo:** `/frontend/src/app/core/services/notification.service.ts`

| Propriedade | Valor Atual | Chave Proposta | Status |
|---|---|---|---|
| `notificationSuccess.title` | `'Sucesso'` | `notifications.success` | ❌ Pendente |
| `notificationError.title` | `'Erro'` | `notifications.error` | ❌ Pendente |
| `notificationWarning.title` | `'Atenção'` | `notifications.warning` | ❌ Pendente |
| `notificationInfo.title` | `'Informação'` | `notifications.info` | ❌ Pendente |

**Impacto:** Alto - Mensagens são exibidas em toda a aplicação
**Esforço:** 20 minutos

---

### 3️⃣ Mensagens de Autenticação

**Arquivo:** `/frontend/src/app/features/auth/login/login.component.ts`

```typescript
// Login Component
'Login realizado com sucesso!'    → auth.login.successMessage
'Erro ao fazer login'             → auth.login.errorMessage

// Register Component
'As senhas não coincidem'         → auth.register.passwordMismatch
'Cadastro realizado com sucesso!' → auth.register.successMessage
'Erro ao cadastrar'               → auth.register.errorMessage

// Reset Password Component
'As senhas não coincidem'         → auth.resetPassword.passwordMismatch
'Token inválido ou expirado'      → auth.resetPassword.invalidToken
```

**Impacto:** Alto - Fluxo crítico de autenticação
**Esforço:** 45 minutos (8 mensagens × 4 idiomas)

---

### 4️⃣ Seletor de Idiomas

**Arquivo:** `/frontend/src/app/shared/components/language-selector/language-selector.component.ts`

| Idioma | Valor Atual | Chave Proposta | Status |
|---|---|---|---|
| Português | `'Português'` | `languages.portuguese` | ⚠️ Valor duplicado |
| English | `'English'` | `languages.english` | ⚠️ Valor duplicado |
| Español | `'Español'` | `languages.spanish` | ⚠️ Valor duplicado |
| Français | `'Français'` | `languages.french` | ⚠️ Valor duplicado |

**Impacto:** Médio-Alto - Visível no header
**Esforço:** 15 minutos (usar valores de tradução existentes)

---

### 5️⃣ Informações de Contato (Hardcoded)

**Arquivo:** `/frontend/src/app/features/public/contact/contact.component.ts`

```typescript
email:    'izabela.ayurvida@gmail.com'    → contact.info.email.value
instagram: '@izabela.tarot'               → contact.info.instagram.value
location: 'Belo Horizonte, MG'            → contact.info.location.value
```

**Impacto:** Médio - Informações de negócio importantes
**Esforço:** 20 minutos (3 itens × 4 idiomas)

---

## 🟠 PRIORIDADE ALTA - HTML HARDCODED TEXT

### 6️⃣ Página de Detalhe de Leitura

**Arquivo:** `/frontend/src/app/features/client/readings/reading-detail/reading-detail.component.html`

| HTML Line | Texto Hardcoded | Chave Proposta |
|---|---|---|
| 9 | `Voltar para leituras` | `client.readings.backLabel` |
| 24 | `Erro ao carregar leitura` | `client.readings.errorLoading` |
| 27 | `Voltar para Leituras` | `client.readings.backButton` |
| 42 | `Publicada em` | `client.readings.publishedOn` |
| 49 | `Sua(s) pergunta(s):` | `client.readings.yourQuestions` |
| 61 | `Pausar` / `Ouvir` | `client.readings.pause` / `client.readings.listen` |
| 61 | `Áudio` | `client.readings.audio` |
| 66 | `Imprimir` | `client.readings.print` |
| 83 | `Introdução` | `client.readings.sections.introduction` |
| 96 | `As Cartas` | `client.readings.sections.cards` |
| 119 | `Posição` | `client.readings.position` |
| 153 | `Visão Geral` | `client.readings.sections.overview` |
| 165 | `Conselho` | `client.readings.sections.advice` |
| 178 | `Conclusão` | `client.readings.sections.conclusion` |
| 189 | `"Que as estrelas iluminem seu caminho..."` | `client.readings.signature.quote` |
| 191 | `Com amor e luz,` | `client.readings.signature.greeting` |
| 192 | `Izabela` | `client.readings.signature.name` |
| 199 | `Voltar para Leituras` | `client.readings.backButton2` |
| 203 | `Nova Consulta` | `client.readings.newConsultation` |

**Impacto:** Crítico - Componente principal do cliente
**Esforço:** 1 hora 15 minutos

---

### 7️⃣ Página de Detalhe de Pedido

**Arquivo:** `/frontend/src/app/features/client/orders/order-detail/order-detail.component.html`

| HTML Line | Texto | Chave Proposta |
|---|---|---|
| 23 | `Erro ao carregar pedido` | `client.orders.errorLoading` |
| 53 | `Itens do Pedido` | `client.orders.items` |

**Impacto:** Alto - Página de pedido
**Esforço:** 15 minutos

---

### 8️⃣ Listas de Agendamentos e Pedidos (Empty States)

**Arquivo:** `/frontend/src/app/features/client/appointments/appointment-list/appointment-list.component.html`

```
Line 39:  "Nenhum agendamento"      → client.appointments.none
Line 182: "Pontualidade"            → client.appointments.punctuality
Line 191: "Cancelamento"            → client.appointments.cancellation
```

**Arquivo:** `/frontend/src/app/features/client/orders/order-list/order-list.component.html`

```
Line 36: "Nenhum pedido encontrado" → client.orders.noneFound
```

**Impacto:** Médio - Estados vazios
**Esforço:** 20 minutos

---

### 9️⃣ Página Home - Seção "Sobre"

**Arquivo:** `/frontend/src/app/features/public/home/home.component.html`

| HTML Line | Elemento | Texto | Chave Proposta |
|---|---|---|---|
| 29 | Button | `Conheça a Izabela` | `home.hero.aboutButton` |
| 48 | Image Alt | `Izabela Santos` | `home.about.name` |
| 54 | Heading | `Olá, eu sou a Izabela Santos` | `home.about.greeting` |
| 57-62 | Paragraph | Bio text (multiline) | `home.about.bio` |
| 79 | Button | `Saiba Mais` | `home.about.learnMore` |

**Impacto:** Alto - Primeira impressão do site
**Esforço:** 30 minutos

---

### 🔟 Layout do Admin

**Arquivo:** `/frontend/src/app/layouts/admin-layout/admin-layout.component.html`

```
Line 34: "Izabela Tarot"            → app.name
Line 48: "Administrador"            → admin.layout.administratorLabel
```

**Arquivo:** `/frontend/src/app/layouts/client-layout/client-layout.component.html`

```
Line 10: "Izabela Tarot"   → app.name
Line 32: "Izabela Tarot"   → app.name
```

**Impacto:** Médio - Branding
**Esforço:** 15 minutos

---

### 1️⃣1️⃣ Cartão de Depoimento

**Arquivo:** `/frontend/src/app/shared/components/testimonial-card/testimonial-card.component.html`

```
Line 36: "Cliente" → testimonials.clientLabel
```

**Impacto:** Baixo - Label de categoria
**Esforço:** 5 minutos

---

## 🟡 PRIORIDADE MÉDIA - PLACEHOLDERS DE FORMULÁRIO

### 1️⃣2️⃣ Placeholders de Autenticação

**Arquivo:** `/frontend/src/app/features/auth/login/login.component.html`

```
Line 26: placeholder="seu@email.com"           → auth.login.emailPlaceholder
```

**Arquivo:** `/frontend/src/app/features/auth/register/register.component.html`

```
Line 28: placeholder="seu@email.com"           → auth.register.emailPlaceholder
Line 35: placeholder="(31) 99999-9999"         → auth.register.phonePlaceholder
```

**Arquivo:** `/frontend/src/app/features/auth/forgot-password/forgot-password.component.html`

```
Line 32: placeholder="seu@email.com"           → auth.forgotPassword.emailPlaceholder
```

**Impacto:** Médio - UX melhorada
**Esforço:** 20 minutos

---

### 1️⃣3️⃣ Placeholders do Perfil do Cliente

**Arquivo:** `/frontend/src/app/features/client/profile/profile.component.html`

```
Line 68:  placeholder="Seu nome completo"                   → client.profile.fullNamePlaceholder
Line 154: placeholder="Digite sua senha atual"              → client.profile.currentPasswordPlaceholder
Line 171: placeholder="Digite a nova senha"                 → client.profile.newPasswordPlaceholder
Line 191: placeholder="Confirme a nova senha"               → client.profile.confirmPasswordPlaceholder
```

**Impacto:** Médio - Formulário do usuário
**Esforço:** 20 minutos

---

### 1️⃣4️⃣ Placeholders de Configurações do Admin

**Arquivo:** `/frontend/src/app/features/admin/settings/settings.component.html`

```
Line 57:   placeholder="Izabela Tarot"                → admin.settings.siteName
Line 78:   placeholder="Breve descrição do site..."   → admin.settings.siteDescription
Line 244:  placeholder="São Paulo, SP"                → admin.settings.location
Line 325:  placeholder="Segunda a Sexta"              → admin.settings.operatingDays
Line 355:  placeholder="Descubra seu Destino"         → admin.settings.tagline
Line 365:  placeholder="Leituras de tarot cigano..."  → admin.settings.shortDescription
Line 394:  placeholder="G-XXXXXXXXXX"                 → admin.settings.googleAnalyticsPlaceholder
Line 403:  placeholder="XXXXXXXXXXXXXXX"              → admin.settings.facebookPixelPlaceholder
```

**Impacto:** Médio - Configuração de site
**Esforço:** 45 minutos

---

### 1️⃣5️⃣ Labels e Descrições de Configurações do Admin

**Arquivo:** `/frontend/src/app/features/admin/settings/settings.component.html`

| Line | Label | Chave Proposta |
|---|---|---|
| 85 | `Logo e Favicon` | `admin.settings.sections.logoFavicon` |
| 89 | `Logo` | `admin.settings.logo` |
| 99 | `Sem logo` | `admin.settings.noLogo` |
| 117 | `Favicon` | `admin.settings.favicon` |
| 148 | `Funcionalidades` | `admin.settings.sections.features` |
| 154 | `Site offline para visitantes` | `admin.settings.siteOfflineDescription` |
| 165 | `Permitir Cadastro` | `admin.settings.allowRegistration` |
| 177 | `Permitir Depoimentos` | `admin.settings.allowTestimonials` |
| 178 | `Clientes podem enviar depoimentos` | `admin.settings.allowTestimonialsDescription` |
| 189 | `Pagamento Online` | `admin.settings.onlinePayment` |
| 190 | `Aceitar pagamentos via Stripe` | `admin.settings.onlinePaymentDescription` |
| 230 | `WhatsApp` | `admin.settings.whatsapp` |
| 251 | `Redes Sociais` | `admin.settings.sections.socialMedia` |
| 320 | `Dias de Funcionamento` | `admin.settings.operatingDays` |
| 372 | `Texto Sobre` | `admin.settings.sections.aboutText` |
| 385 | `Rastreamento` | `admin.settings.sections.tracking` |
| 389 | `Google Analytics ID` | `admin.settings.googleAnalyticsId` |
| 398 | `Facebook Pixel ID` | `admin.settings.facebookPixelId` |

**Impacto:** Médio - Página importante mas não crítica
**Esforço:** 1 hora 15 minutos

---

## 🟢 PRIORIDADE BAIXA - SEO E METADATA

### 1️⃣6️⃣ Títulos e Descrições SEO

**Arquivo:** `/frontend/src/app/core/services/seo.service.ts`

```
Line 29: 'Izabela Tarot' (siteName)   → seo.siteName
```

**Arquivo:** `/frontend/src/app/features/public/home/home.component.ts`

```
Line 61: 'Leituras de Tarot e Baralho Cigano'
       → seo.home.title
Line 62: 'Leituras de tarot e baralho cigano Lenormand com Izabela Santos...'
       → seo.home.description
```

**Arquivo:** `/frontend/src/app/features/public/contact/contact.component.ts`

```
Line 34: 'Contato'                           → seo.contact.title
Line 35: 'Entre em contato com Izabela...'   → seo.contact.description
Line 41: { name: 'Início', url: '/' }       → breadcrumb.home
Line 42: { name: 'Contato', url: '/contato' } → breadcrumb.contact
```

**Impacto:** Baixo - Não afeta UX do usuário direto
**Esforço:** 1 hora 30 minutos

---

## 📋 Plano de Implementação

### Fase 1: Estrutura de Tradução (20 minutos)

1. **Criar novo arquivo de estrutura no translation helper:**
   - Adicionar arquivo de referência em `/frontend/src/assets/i18n/KEYS_STRUCTURE.md`
   - Documentar todas as novas chaves

2. **Validar chaves existentes:**
   - Verificar sobreposições com chaves existentes
   - Consolidar chaves duplicadas

### Fase 2: Tradução de Strings Críticas (2 horas)

**Ordem de Prioridade:**

1. Seções 1-5 (Mensagens de erro, notificações, auth)
   - Tempo: 45 minutos
   - Impacto: Crítico
   - Idiomas: pt-BR, en, es, fr

2. Seções 6-11 (HTML hardcoded text)
   - Tempo: 1 hora 15 minutos
   - Impacto: Alto
   - Foco: Client-facing pages primeiro

### Fase 3: Placeholders e Admin (1 hora 30 minutos)

1. Placeholders de formulário (Seção 12-14)
   - Tempo: 1 hora 15 minutos

2. Configurações do admin (Seção 15)
   - Tempo: 15 minutos

### Fase 4: SEO e Metadata (1 hora 30 minutos)

1. Títulos e descrições SEO
   - Tempo: 1 hora 30 minutos
   - Nota: Pode ser feito em paralelo com fase 3

---

## 📦 Arquivos a Atualizar

### Arquivos de Tradução

```
frontend/src/assets/i18n/
├── pt-BR.json  (adicionar ~102 chaves)
├── en.json     (adicionar ~102 chaves)
├── es.json     (adicionar ~102 chaves)
└── fr.json     (adicionar ~102 chaves)
```

### Arquivos de Componentes/Serviços (Modificar)

```typescript
// Arquivos que serão modificados para usar translate service:
frontend/src/app/
├── core/
│   ├── interceptors/error.interceptor.ts        (6 strings)
│   └── services/notification.service.ts         (4 strings)
├── features/
│   ├── auth/login/login.component.ts           (2 strings)
│   ├── auth/register/register.component.ts     (3 strings)
│   ├── auth/reset-password/reset-password.component.ts (2 strings)
│   ├── auth/forgot-password/forgot-password.component.html (1 string)
│   ├── public/home/home.component.ts           (2 strings)
│   ├── public/home/home.component.html         (5 strings)
│   ├── public/contact/contact.component.ts     (3 strings)
│   ├── client/readings/reading-detail/reading-detail.component.html (19 strings)
│   ├── client/orders/order-detail/order-detail.component.html (2 strings)
│   ├── client/orders/order-list/order-list.component.html (1 string)
│   ├── client/appointments/appointment-list/appointment-list.component.html (3 strings)
│   ├── client/profile/profile.component.html   (4 strings)
│   ├── admin/settings/settings.component.html  (28 strings)
│   └── admin/...
├── layouts/
│   ├── admin-layout/admin-layout.component.html (2 strings)
│   └── client-layout/client-layout.component.html (2 strings)
└── shared/
    ├── components/
    │   ├── language-selector/language-selector.component.ts (4 strings)
    │   └── testimonial-card/testimonial-card.component.html (1 string)
    └── pipes/...
```

---

## ✅ Checklist de Implementação

### Pré-requisitos
- [ ] Repositório atualizado com main
- [ ] Branch `claude/implement-i18n-frontend-8jusP` sincronizada
- [ ] npm dependencies instaladas

### Fase 1: Estrutura
- [ ] Criar documento KEYS_STRUCTURE.md
- [ ] Validar nomeação de chaves para consistência
- [ ] Documentar convenção de naming

### Fase 2: Crítica (40 pontos de impacto)
- [ ] Adicionar 6 strings error.interceptor.* aos 4 idiomas
- [ ] Adicionar 4 strings notifications.* aos 4 idiomas
- [ ] Adicionar 6 strings auth.* aos 4 idiomas
- [ ] Adicionar 4 strings languages.* aos 4 idiomas
- [ ] Adicionar 3 strings contact.info.* aos 4 idiomas
- [ ] Adicionar 19 strings client.readings.* aos 4 idiomas
- [ ] Adicionar 10 strings client.orders e appointments aux 4 idiomas
- [ ] Adicionar 5 strings home.* aos 4 idiomas
- [ ] Testar error interceptor com diferentes erros
- [ ] Testar notifications em toda a app
- [ ] Testar auth flow em todos os idiomas

### Fase 3: Médio (50 pontos)
- [ ] Adicionar 16 strings form placeholders
- [ ] Adicionar 28 strings admin.settings
- [ ] Atualizar componentes para usar translate pipe
- [ ] Testar admin settings em todos os idiomas
- [ ] Validar placeholders em formulários

### Fase 4: Baixo (20 pontos)
- [ ] Adicionar 8 strings seo.*
- [ ] Atualizar seo.service.ts
- [ ] Validar meta tags em todas as páginas

### Testes Finais
- [ ] ng build --prod sem erros
- [ ] Testar switching entre todos os 4 idiomas
- [ ] Verificar localStorage.language.persist
- [ ] Testar browser language detection
- [ ] Verificar fallback para pt-BR se idioma não suportado
- [ ] Testar em navegadores: Chrome, Firefox, Safari
- [ ] Verificar console sem warnings i18n

### Entrega
- [ ] Commitar todas as mudanças
- [ ] Push para branch claude/implement-i18n-frontend-8jusP
- [ ] Criar Pull Request para main
- [ ] Aguardar aprovação e merge

---

## 📈 Métricas de Sucesso

| Métrica | Antes | Depois | Meta |
|---------|-------|--------|------|
| Strings Traduzidas | 10,356 | 10,458 | 100% |
| Cobertura i18n | 99% | 100% | ✅ |
| Linhas HTML sem i18n | 120+ | 0 | ✅ |
| Componentes traduzidos | 30/32 | 32/32 | ✅ |
| Build sem warnings | ✅ | ✅ | ✅ |
| Testes de idioma | Manual | Automated | 📋 |

---

## 🚀 Próximos Passos

1. **Hoje:** Revisar este documento e prioridades
2. **Amanhã:** Iniciar Fase 1 - Estrutura
3. **Dia 3:** Fases 2-3 - Strings críticas e média prioridade
4. **Dia 4:** Fase 4 - SEO e metadata + testes completos
5. **Dia 5:** Revisão, correções e merge para main

---

## 📞 Contato para Dúvidas

- Revisar arquivo INTERNATIONALIZATION_TODO.md para histórico
- Verificar translation files em `/frontend/src/assets/i18n/`
- Consultar TranslateService documentation

---

**Último atualizado:** 2026-02-04
**Responsável:** Claude Code
**Status:** 🟢 Pronto para Implementação
