# 🔮 PROMPT CURSOR.AI - IZABELA TAROT
## Sistema Completo: Site Institucional + E-commerce + Área do Cliente + Painel Administrativo

---

## 📋 CONTEXTO DO PROJETO

Você é um desenvolvedor sênior especializado em Angular e Node.js. Deve criar um sistema completo para **Izabela Tarot**, uma plataforma de serviços de leituras de tarot terapêutico. O sistema deve ser elegante, místico, acolhedor e otimizado para um público 95% feminino que busca orientação em áreas como profissional, saúde e relacionamentos.

### Sobre a Profissional
- **Nome:** Izabela Santos
- **Profissão:** Taróloga e Estudante de Psicologia Analítica Junguiana
- **Formação:** Administração de Empresas + Terapias Integrativas Naturais
- **Localização:** Belo Horizonte, MG
- **Baralho:** Cigano (Lenormand) - 36 cartas
- **Idiomas:** Português, Inglês, Francês, Espanhol
- **Horário:** Segunda a Sexta, 9h às 18h

---

## 🛠️ STACK TECNOLÓGICO

```yaml
Frontend:
  - Angular 20 (standalone components(sempre arquivos separados, html, ts, css), signals, new control flow, modelo css)
  - Tailwind CSS 4 (crir o arquivo .postcssrc.json
        '''     {
  "plugins": {
    "@tailwindcss/postcss": {},
    "autoprefixer": {}
  }
}'''
app.config.ts
'''import { providePrimeNG } from 'primeng/config';
 providePrimeNG({
      ripple: true,
      theme: {
        preset: LivriaPreset,
        options: {
          darkModeSelector: '.dark',
          cssLayer: {
            name: 'primeng',
            order: 'base, primeng, components'
          }
        }
      }
    })
'''
nunca mude o Tailwind CSS 3, 
                    )
  - PrimeNG 20
  - PrimeIcons
  - Angular Animations

Backend:
  - Node.js 20+ (LTS)
  - Express.js ou Fastify
  - TypeScript
  - Prisma ORM
  - JWT (jsonwebtoken)
  - bcrypt
  - Zod (validação)
  - Multer (upload)

Banco de Dados:
  - Supabase (PostgreSQL hospedado)
  - Supabase Storage (arquivos/imagens)

Pagamentos:
  - Stripe (Checkout Session + Webhooks)

Hospedagem:
  - Render (Frontend estático)
  - Render (Backend Node.js)

Extras:
  - jsPDF + html2canvas (exportação PDF - frontend)
  - Nodemailer (emails transacionais)
  - date-fns (manipulação de datas)
  - node-cron (tarefas agendadas)
```

---

## 🎨 DESIGN SYSTEM

### Paleta de Cores (Feng Shui + UX Feminino)

```css
:root {
  /* Cores Primárias - Lilás Místico */
  --primary-50: #faf5ff;
  --primary-100: #f3e8ff;
  --primary-200: #e9d5ff;
  --primary-300: #d8b4fe;
  --primary-400: #c084fc;
  --primary-500: #a855f7;
  --primary-600: #9333ea;
  --primary-700: #7c3aed;
  --primary-800: #6b21a8;
  --primary-900: #581c87;

  /* Cores Secundárias - Rosa Suave */
  --secondary-50: #fdf2f8;
  --secondary-100: #fce7f3;
  --secondary-200: #fbcfe8;
  --secondary-300: #f9a8d4;
  --secondary-400: #f472b6;
  --secondary-500: #ec4899;

  /* Cores de Destaque - Dourado */
  --accent-gold: #d4af37;
  --accent-gold-light: #f4e4bc;
  --accent-gold-dark: #996515;

  /* Neutros */
  --neutral-50: #fafafa;
  --neutral-100: #f5f5f5;
  --neutral-200: #e5e5e5;
  --neutral-700: #404040;
  --neutral-800: #262626;
  --neutral-900: #171717;

  /* Semânticas */
  --success: #10b981;
  --warning: #f59e0b;
  --error: #ef4444;
  --info: #3b82f6;
}
```

### Tipografia

```css
/* Títulos - Elegante e Místico */
font-family: 'Cormorant Garamond', 'Playfair Display', serif;

/* Corpo - Legível e Acolhedor */
font-family: 'Nunito', 'Open Sans', sans-serif;

/* Decorativo - Para elementos especiais */
font-family: 'Dancing Script', cursive;
```

### Princípios de Design

1. **Feng Shui:** Espaços amplos, fluxo visual suave, elementos naturais
2. **Acolhimento:** Cantos arredondados, gradientes suaves, sombras delicadas
3. **Misticismo:** Elementos como estrelas, lua, cristais sutis
4. **Confiança:** Layout limpo, hierarquia clara, CTAs evidentes
5. **Responsividade:** Mobile-first (maioria do público acessa por celular)

---

## 📁 ESTRUTURA DE PASTAS - MONOREPO

```
izabela-tarot/
├── apps/
│   ├── frontend/                    # Angular 20
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── core/
│   │   │   │   │   ├── guards/
│   │   │   │   │   │   ├── auth.guard.ts
│   │   │   │   │   │   ├── admin.guard.ts
│   │   │   │   │   │   └── client.guard.ts
│   │   │   │   │   ├── interceptors/
│   │   │   │   │   │   ├── auth.interceptor.ts
│   │   │   │   │   │   └── error.interceptor.ts
│   │   │   │   │   ├── services/
│   │   │   │   │   │   ├── api.service.ts
│   │   │   │   │   │   ├── auth.service.ts
│   │   │   │   │   │   ├── cart.service.ts
│   │   │   │   │   │   ├── storage.service.ts
│   │   │   │   │   │   └── notification.service.ts
│   │   │   │   │   └── models/
│   │   │   │   │       ├── user.model.ts
│   │   │   │   │       ├── product.model.ts
│   │   │   │   │       ├── order.model.ts
│   │   │   │   │       ├── reading.model.ts
│   │   │   │   │       ├── appointment.model.ts
│   │   │   │   │       └── card.model.ts
│   │   │   │   │
│   │   │   │   ├── shared/
│   │   │   │   │   ├── components/
│   │   │   │   │   │   ├── header/
│   │   │   │   │   │   ├── footer/
│   │   │   │   │   │   ├── card-selector/
│   │   │   │   │   │   ├── loading-spinner/
│   │   │   │   │   │   ├── testimonial-card/
│   │   │   │   │   │   └── product-card/
│   │   │   │   │   ├── directives/
│   │   │   │   │   ├── pipes/
│   │   │   │   │   │   ├── currency-brl.pipe.ts
│   │   │   │   │   │   └── date-pt.pipe.ts
│   │   │   │   │   └── animations/
│   │   │   │   │       └── fade.animation.ts
│   │   │   │   │
│   │   │   │   ├── features/
│   │   │   │   │   ├── public/
│   │   │   │   │   │   ├── home/
│   │   │   │   │   │   ├── about/
│   │   │   │   │   │   ├── services/
│   │   │   │   │   │   ├── contact/
│   │   │   │   │   │   ├── testimonials/
│   │   │   │   │   │   └── faq/
│   │   │   │   │   │
│   │   │   │   │   ├── shop/
│   │   │   │   │   │   ├── product-list/
│   │   │   │   │   │   ├── product-detail/
│   │   │   │   │   │   ├── cart/
│   │   │   │   │   │   └── checkout/
│   │   │   │   │   │
│   │   │   │   │   ├── auth/
│   │   │   │   │   │   ├── login/
│   │   │   │   │   │   ├── register/
│   │   │   │   │   │   ├── forgot-password/
│   │   │   │   │   │   └── reset-password/
│   │   │   │   │   │
│   │   │   │   │   ├── client/
│   │   │   │   │   │   ├── dashboard/
│   │   │   │   │   │   ├── profile/
│   │   │   │   │   │   ├── readings/
│   │   │   │   │   │   │   ├── reading-list/
│   │   │   │   │   │   │   └── reading-detail/
│   │   │   │   │   │   ├── appointments/
│   │   │   │   │   │   │   ├── schedule/
│   │   │   │   │   │   │   └── my-appointments/
│   │   │   │   │   │   └── payment-history/
│   │   │   │   │   │
│   │   │   │   │   └── admin/
│   │   │   │   │       ├── dashboard/
│   │   │   │   │       ├── products/
│   │   │   │   │       │   ├── product-list/
│   │   │   │   │       │   ├── product-form/
│   │   │   │   │       │   └── product-categories/
│   │   │   │   │       ├── orders/
│   │   │   │   │       │   ├── order-list/
│   │   │   │   │       │   └── order-detail/
│   │   │   │   │       ├── readings/
│   │   │   │   │       │   ├── pending-readings/
│   │   │   │   │       │   └── reading-editor/
│   │   │   │   │       ├── schedule/
│   │   │   │   │       │   ├── availability/
│   │   │   │   │       │   └── appointments/
│   │   │   │   │       ├── clients/
│   │   │   │   │       └── reports/
│   │   │   │   │
│   │   │   │   ├── layouts/
│   │   │   │   │   ├── public-layout/
│   │   │   │   │   ├── client-layout/
│   │   │   │   │   └── admin-layout/
│   │   │   │   │
│   │   │   │   ├── app.component.ts
│   │   │   │   ├── app.config.ts
│   │   │   │   └── app.routes.ts
│   │   │   │
│   │   │   ├── assets/
│   │   │   │   ├── images/
│   │   │   │   │   ├── logo/
│   │   │   │   │   ├── cards/          # 36 cartas do baralho cigano
│   │   │   │   │   ├── backgrounds/
│   │   │   │   │   └── icons/
│   │   │   │   └── fonts/
│   │   │   │
│   │   │   ├── environments/
│   │   │   │   ├── environment.ts
│   │   │   │   └── environment.prod.ts
│   │   │   │
│   │   │   └── styles/
│   │   │       ├── _variables.scss
│   │   │       ├── _animations.scss
│   │   │       ├── _primeng-theme.scss
│   │   │       └── styles.scss
│   │   │
│   │   ├── angular.json
│   │   ├── tailwind.config.js
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   └── backend/                        # Node.js + Express/Fastify
│       ├── src/
│       │   ├── config/
│       │   │   ├── database.ts         # Prisma client
│       │   │   ├── supabase.ts         # Supabase Storage client
│       │   │   ├── stripe.ts           # Stripe config
│       │   │   ├── email.ts            # Nodemailer config
│       │   │   └── env.ts              # Environment variables
│       │   │
│       │   ├── modules/
│       │   │   ├── auth/
│       │   │   │   ├── auth.controller.ts
│       │   │   │   ├── auth.service.ts
│       │   │   │   ├── auth.routes.ts
│       │   │   │   ├── auth.schema.ts      # Zod schemas
│       │   │   │   └── auth.middleware.ts
│       │   │   │
│       │   │   ├── users/
│       │   │   │   ├── users.controller.ts
│       │   │   │   ├── users.service.ts
│       │   │   │   ├── users.routes.ts
│       │   │   │   └── users.schema.ts
│       │   │   │
│       │   │   ├── products/
│       │   │   │   ├── products.controller.ts
│       │   │   │   ├── products.service.ts
│       │   │   │   ├── products.routes.ts
│       │   │   │   └── products.schema.ts
│       │   │   │
│       │   │   ├── orders/
│       │   │   │   ├── orders.controller.ts
│       │   │   │   ├── orders.service.ts
│       │   │   │   ├── orders.routes.ts
│       │   │   │   └── orders.schema.ts
│       │   │   │
│       │   │   ├── payments/
│       │   │   │   ├── payments.controller.ts
│       │   │   │   ├── payments.service.ts
│       │   │   │   ├── payments.routes.ts
│       │   │   │   ├── stripe.webhook.ts
│       │   │   │   └── payments.schema.ts
│       │   │   │
│       │   │   ├── readings/
│       │   │   │   ├── readings.controller.ts
│       │   │   │   ├── readings.service.ts
│       │   │   │   ├── readings.routes.ts
│       │   │   │   └── readings.schema.ts
│       │   │   │
│       │   │   ├── cards/
│       │   │   │   ├── cards.controller.ts
│       │   │   │   ├── cards.service.ts
│       │   │   │   └── cards.routes.ts
│       │   │   │
│       │   │   ├── appointments/
│       │   │   │   ├── appointments.controller.ts
│       │   │   │   ├── appointments.service.ts
│       │   │   │   ├── appointments.routes.ts
│       │   │   │   └── appointments.schema.ts
│       │   │   │
│       │   │   ├── schedule/
│       │   │   │   ├── schedule.controller.ts
│       │   │   │   ├── schedule.service.ts
│       │   │   │   └── schedule.routes.ts
│       │   │   │
│       │   │   ├── notifications/
│       │   │   │   ├── notifications.controller.ts
│       │   │   │   ├── notifications.service.ts
│       │   │   │   ├── notifications.routes.ts
│       │   │   │   └── email.templates.ts
│       │   │   │
│       │   │   ├── upload/
│       │   │   │   ├── upload.controller.ts
│       │   │   │   ├── upload.service.ts
│       │   │   │   └── upload.routes.ts
│       │   │   │
│       │   │   └── admin/
│       │   │       ├── admin.controller.ts
│       │   │       ├── admin.service.ts
│       │   │       └── admin.routes.ts
│       │   │
│       │   ├── middlewares/
│       │   │   ├── auth.middleware.ts
│       │   │   ├── admin.middleware.ts
│       │   │   ├── error.middleware.ts
│       │   │   ├── validation.middleware.ts
│       │   │   └── rate-limit.middleware.ts
│       │   │
│       │   ├── utils/
│       │   │   ├── jwt.util.ts
│       │   │   ├── password.util.ts
│       │   │   ├── date.util.ts
│       │   │   ├── pdf.util.ts
│       │   │   └── response.util.ts
│       │   │
│       │   ├── jobs/
│       │   │   ├── reminder.job.ts         # Lembretes de agendamento
│       │   │   ├── cleanup.job.ts          # Limpeza de dados antigos
│       │   │   └── scheduler.ts            # node-cron setup
│       │   │
│       │   ├── types/
│       │   │   ├── express.d.ts
│       │   │   └── index.ts
│       │   │
│       │   ├── app.ts                      # Express/Fastify app setup
│       │   └── server.ts                   # Entry point
│       │
│       ├── prisma/
│       │   ├── schema.prisma
│       │   ├── migrations/
│       │   └── seed.ts
│       │
│       ├── tests/
│       │   ├── unit/
│       │   └── integration/
│       │
│       ├── .env.example
│       ├── tsconfig.json
│       ├── package.json
│       └── Dockerfile
│
├── docs/
│   ├── API.md
│   ├── DATABASE.md
│   └── DEPLOYMENT.md
│
├── docker-compose.yml
├── package.json                        # Workspace root
└── README.md
```

---

## 🗄️ SCHEMA PRISMA (BANCO DE DADOS)

```prisma
// apps/backend/prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// =============================================
// ENUMS
// =============================================

enum UserRole {
  CLIENT
  ADMIN
}

enum OrderStatus {
  PENDING
  PAID
  PROCESSING
  COMPLETED
  CANCELLED
  REFUNDED
}

enum ReadingStatus {
  PENDING
  IN_PROGRESS
  PUBLISHED
  ARCHIVED
}

enum AppointmentStatus {
  SCHEDULED
  CONFIRMED
  COMPLETED
  CANCELLED
  NO_SHOW
}

enum ProductType {
  QUESTION
  SESSION
  MONTHLY
  SPECIAL
}

enum PaymentStatus {
  PENDING
  SUCCEEDED
  FAILED
  REFUNDED
}

// =============================================
// MODELS
// =============================================

model User {
  id                   String    @id @default(uuid())
  email                String    @unique
  passwordHash         String    @map("password_hash")
  fullName             String    @map("full_name")
  phone                String?
  birthDate            DateTime? @map("birth_date")
  avatarUrl            String?   @map("avatar_url")
  role                 UserRole  @default(CLIENT)
  preferredLanguage    String    @default("pt-BR") @map("preferred_language")
  notificationEmail    Boolean   @default(true) @map("notification_email")
  notificationWhatsapp Boolean   @default(true) @map("notification_whatsapp")
  notes                String?   // Admin notes
  stripeCustomerId     String?   @map("stripe_customer_id")
  
  // Password reset
  resetToken           String?   @map("reset_token")
  resetTokenExpiry     DateTime? @map("reset_token_expiry")
  
  // Timestamps
  createdAt            DateTime  @default(now()) @map("created_at")
  updatedAt            DateTime  @updatedAt @map("updated_at")
  lastLoginAt          DateTime? @map("last_login_at")

  // Relations
  orders               Order[]
  readings             Reading[]
  appointments         Appointment[]
  notifications        Notification[]
  testimonials         Testimonial[]

  @@map("users")
}

model ProductCategory {
  id           String    @id @default(uuid())
  name         String
  slug         String    @unique
  description  String?
  icon         String?
  displayOrder Int       @default(0) @map("display_order")
  isActive     Boolean   @default(true) @map("is_active")
  createdAt    DateTime  @default(now()) @map("created_at")

  // Relations
  products     Product[]

  @@map("product_categories")
}

model Product {
  id                     String          @id @default(uuid())
  categoryId             String?         @map("category_id")
  name                   String
  slug                   String          @unique
  shortDescription       String?         @map("short_description")
  fullDescription        String?         @map("full_description")
  productType            ProductType     @map("product_type")
  
  // Pricing
  price                  Decimal         @db.Decimal(10, 2)
  originalPrice          Decimal?        @db.Decimal(10, 2) @map("original_price")
  
  // Specific configurations
  numQuestions           Int?            @map("num_questions")
  sessionDurationMinutes Int?            @map("session_duration_minutes")
  numCards               Int?            @map("num_cards")
  validityDays           Int             @default(365) @map("validity_days")
  
  // Media
  coverImageUrl          String?         @map("cover_image_url")
  galleryUrls            String[]        @map("gallery_urls")
  
  // Settings
  isActive               Boolean         @default(true) @map("is_active")
  isFeatured             Boolean         @default(false) @map("is_featured")
  requiresScheduling     Boolean         @default(false) @map("requires_scheduling")
  maxPerClient           Int?            @map("max_per_client")
  
  // SEO
  metaTitle              String?         @map("meta_title")
  metaDescription        String?         @map("meta_description")
  
  // Availability
  availableFrom          DateTime?       @map("available_from")
  availableUntil         DateTime?       @map("available_until")
  
  // Timestamps
  createdAt              DateTime        @default(now()) @map("created_at")
  updatedAt              DateTime        @updatedAt @map("updated_at")

  // Relations
  category               ProductCategory? @relation(fields: [categoryId], references: [id])
  attachments            ProductAttachment[]
  orderItems             OrderItem[]

  @@map("products")
}

model ProductAttachment {
  id           String   @id @default(uuid())
  productId    String   @map("product_id")
  name         String
  fileUrl      String   @map("file_url")
  fileType     String?  @map("file_type")
  fileSize     Int?     @map("file_size")
  displayOrder Int      @default(0) @map("display_order")
  createdAt    DateTime @default(now()) @map("created_at")

  // Relations
  product      Product  @relation(fields: [productId], references: [id], onDelete: Cascade)

  @@map("product_attachments")
}

model Order {
  id                       String        @id @default(uuid())
  orderNumber              String        @unique @map("order_number")
  clientId                 String        @map("client_id")
  
  // Values
  subtotal                 Decimal       @db.Decimal(10, 2)
  discount                 Decimal       @default(0) @db.Decimal(10, 2)
  total                    Decimal       @db.Decimal(10, 2)
  
  // Stripe
  stripeCheckoutSessionId  String?       @map("stripe_checkout_session_id")
  stripePaymentIntentId    String?       @map("stripe_payment_intent_id")
  
  // Status
  status                   OrderStatus   @default(PENDING)
  paymentStatus            PaymentStatus @default(PENDING) @map("payment_status")
  
  // Notes
  clientNotes              String?       @map("client_notes")
  adminNotes               String?       @map("admin_notes")
  
  // Timestamps
  paidAt                   DateTime?     @map("paid_at")
  completedAt              DateTime?     @map("completed_at")
  cancelledAt              DateTime?     @map("cancelled_at")
  createdAt                DateTime      @default(now()) @map("created_at")
  updatedAt                DateTime      @updatedAt @map("updated_at")

  // Relations
  client                   User          @relation(fields: [clientId], references: [id])
  items                    OrderItem[]

  @@map("orders")
}

model OrderItem {
  id              String      @id @default(uuid())
  orderId         String      @map("order_id")
  productId       String      @map("product_id")
  
  // Snapshot at purchase time
  productName     String      @map("product_name")
  productType     ProductType @map("product_type")
  unitPrice       Decimal     @db.Decimal(10, 2) @map("unit_price")
  quantity        Int         @default(1)
  totalPrice      Decimal     @db.Decimal(10, 2) @map("total_price")
  
  // Client questions (for question type)
  clientQuestions String[]    @map("client_questions")
  
  createdAt       DateTime    @default(now()) @map("created_at")

  // Relations
  order           Order       @relation(fields: [orderId], references: [id], onDelete: Cascade)
  product         Product     @relation(fields: [productId], references: [id])
  reading         Reading?
  appointment     Appointment?

  @@map("order_items")
}

model CiganoCard {
  id              String   @id @default(uuid())
  number          Int      @unique
  name            String
  nameEn          String?  @map("name_en")
  nameEs          String?  @map("name_es")
  nameFr          String?  @map("name_fr")
  keywords        String[]
  generalMeaning  String?  @map("general_meaning")
  loveMeaning     String?  @map("love_meaning")
  careerMeaning   String?  @map("career_meaning")
  healthMeaning   String?  @map("health_meaning")
  advice          String?
  imageUrl        String   @map("image_url")
  isPositive      Boolean? @map("is_positive")
  element         String?
  createdAt       DateTime @default(now()) @map("created_at")

  // Relations
  readingCards    ReadingCard[]

  @@map("cigano_cards")
}

model Reading {
  id              String        @id @default(uuid())
  orderItemId     String        @unique @map("order_item_id")
  clientId        String        @map("client_id")
  
  // Info
  title           String
  status          ReadingStatus @default(PENDING)
  
  // Context
  clientQuestion  String?       @map("client_question")
  focusArea       String?       @map("focus_area")
  
  // Content
  introduction    String?
  generalGuidance String?       @map("general_guidance")
  recommendations String?
  goals           String?
  closingMessage  String?       @map("closing_message")
  
  // Media
  audioUrl        String?       @map("audio_url")
  videoUrl        String?       @map("video_url")
  
  // Dates
  readingDate     DateTime?     @map("reading_date")
  publishedAt     DateTime?     @map("published_at")
  expiresAt       DateTime?     @map("expires_at")
  
  // PDF
  pdfUrl          String?       @map("pdf_url")
  pdfGeneratedAt  DateTime?     @map("pdf_generated_at")
  
  // Timestamps
  createdAt       DateTime      @default(now()) @map("created_at")
  updatedAt       DateTime      @updatedAt @map("updated_at")

  // Relations
  orderItem       OrderItem     @relation(fields: [orderItemId], references: [id], onDelete: Cascade)
  client          User          @relation(fields: [clientId], references: [id])
  cards           ReadingCard[]

  @@map("readings")
}

model ReadingCard {
  id             String     @id @default(uuid())
  readingId      String     @map("reading_id")
  cardId         String     @map("card_id")
  
  position       Int
  positionName   String?    @map("position_name")
  isReversed     Boolean    @default(false) @map("is_reversed")
  
  // Custom interpretation
  interpretation String?
  
  createdAt      DateTime   @default(now()) @map("created_at")

  // Relations
  reading        Reading    @relation(fields: [readingId], references: [id], onDelete: Cascade)
  card           CiganoCard @relation(fields: [cardId], references: [id])

  @@map("reading_cards")
}

model ScheduleSettings {
  id                   String    @id @default(uuid())
  
  // Default hours
  mondayStart          String?   @map("monday_start")
  mondayEnd            String?   @map("monday_end")
  mondayEnabled        Boolean   @default(true) @map("monday_enabled")
  
  tuesdayStart         String?   @map("tuesday_start")
  tuesdayEnd           String?   @map("tuesday_end")
  tuesdayEnabled       Boolean   @default(true) @map("tuesday_enabled")
  
  wednesdayStart       String?   @map("wednesday_start")
  wednesdayEnd         String?   @map("wednesday_end")
  wednesdayEnabled     Boolean   @default(true) @map("wednesday_enabled")
  
  thursdayStart        String?   @map("thursday_start")
  thursdayEnd          String?   @map("thursday_end")
  thursdayEnabled      Boolean   @default(true) @map("thursday_enabled")
  
  fridayStart          String?   @map("friday_start")
  fridayEnd            String?   @map("friday_end")
  fridayEnabled        Boolean   @default(true) @map("friday_enabled")
  
  saturdayStart        String?   @map("saturday_start")
  saturdayEnd          String?   @map("saturday_end")
  saturdayEnabled      Boolean   @default(false) @map("saturday_enabled")
  
  sundayStart          String?   @map("sunday_start")
  sundayEnd            String?   @map("sunday_end")
  sundayEnabled        Boolean   @default(false) @map("sunday_enabled")
  
  // General settings
  slotDurationMinutes  Int       @default(30) @map("slot_duration_minutes")
  bufferMinutes        Int       @default(15) @map("buffer_minutes")
  advanceBookingDays   Int       @default(30) @map("advance_booking_days")
  minNoticeHours       Int       @default(24) @map("min_notice_hours")
  
  // Blocked dates
  blockedDates         DateTime[] @map("blocked_dates")
  
  timezone             String    @default("America/Sao_Paulo")
  
  updatedAt            DateTime  @updatedAt @map("updated_at")

  @@map("schedule_settings")
}

model Appointment {
  id                 String            @id @default(uuid())
  orderItemId        String?           @unique @map("order_item_id")
  clientId           String            @map("client_id")
  
  // Date/time
  scheduledDate      DateTime          @map("scheduled_date")
  startTime          String            @map("start_time")
  endTime            String            @map("end_time")
  durationMinutes    Int               @map("duration_minutes")
  
  // Status
  status             AppointmentStatus @default(SCHEDULED)
  
  // Notes
  clientNotes        String?           @map("client_notes")
  adminNotes         String?           @map("admin_notes")
  
  // Online meeting
  meetingUrl         String?           @map("meeting_url")
  meetingPassword    String?           @map("meeting_password")
  
  // Confirmations
  reminderSentAt     DateTime?         @map("reminder_sent_at")
  confirmedAt        DateTime?         @map("confirmed_at")
  
  // Cancellation
  cancelledAt        DateTime?         @map("cancelled_at")
  cancellationReason String?           @map("cancellation_reason")
  
  // Timestamps
  createdAt          DateTime          @default(now()) @map("created_at")
  updatedAt          DateTime          @updatedAt @map("updated_at")

  // Relations
  orderItem          OrderItem?        @relation(fields: [orderItemId], references: [id])
  client             User              @relation(fields: [clientId], references: [id])

  @@map("appointments")
}

model BlockedSlot {
  id          String   @id @default(uuid())
  blockedDate DateTime @map("blocked_date")
  startTime   String?  @map("start_time")
  endTime     String?  @map("end_time")
  isFullDay   Boolean  @default(false) @map("is_full_day")
  reason      String?
  createdAt   DateTime @default(now()) @map("created_at")

  @@map("blocked_slots")
}

model Testimonial {
  id              String   @id @default(uuid())
  clientId        String?  @map("client_id")
  clientName      String   @map("client_name")
  clientAvatarUrl String?  @map("client_avatar_url")
  content         String
  rating          Int?
  isApproved      Boolean  @default(false) @map("is_approved")
  isFeatured      Boolean  @default(false) @map("is_featured")
  displayOrder    Int      @default(0) @map("display_order")
  createdAt       DateTime @default(now()) @map("created_at")

  // Relations
  client          User?    @relation(fields: [clientId], references: [id])

  @@map("testimonials")
}

model Coupon {
  id            String    @id @default(uuid())
  code          String    @unique
  description   String?
  discountType  String    @map("discount_type") // 'percentage' or 'fixed'
  discountValue Decimal   @db.Decimal(10, 2) @map("discount_value")
  minOrderValue Decimal?  @db.Decimal(10, 2) @map("min_order_value")
  maxUses       Int?      @map("max_uses")
  usesCount     Int       @default(0) @map("uses_count")
  validFrom     DateTime? @map("valid_from")
  validUntil    DateTime? @map("valid_until")
  isActive      Boolean   @default(true) @map("is_active")
  createdAt     DateTime  @default(now()) @map("created_at")

  @@map("coupons")
}

model SiteSetting {
  id        String   @id @default(uuid())
  key       String   @unique
  value     Json
  updatedAt DateTime @updatedAt @map("updated_at")

  @@map("site_settings")
}

model Notification {
  id          String   @id @default(uuid())
  userId      String   @map("user_id")
  title       String
  message     String
  type        String?  // order, reading, appointment, system
  referenceId String?  @map("reference_id")
  isRead      Boolean  @default(false) @map("is_read")
  readAt      DateTime? @map("read_at")
  createdAt   DateTime @default(now()) @map("created_at")

  // Relations
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("notifications")
}
```

---

## 🔧 BACKEND NODE.JS - IMPLEMENTAÇÃO

### 1. Configuração Principal (app.ts)

```typescript
// apps/backend/src/app.ts
import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { rateLimit } from 'express-rate-limit';

// Routes
import authRoutes from './modules/auth/auth.routes';
import usersRoutes from './modules/users/users.routes';
import productsRoutes from './modules/products/products.routes';
import ordersRoutes from './modules/orders/orders.routes';
import paymentsRoutes from './modules/payments/payments.routes';
import readingsRoutes from './modules/readings/readings.routes';
import cardsRoutes from './modules/cards/cards.routes';
import appointmentsRoutes from './modules/appointments/appointments.routes';
import scheduleRoutes from './modules/schedule/schedule.routes';
import notificationsRoutes from './modules/notifications/notifications.routes';
import uploadRoutes from './modules/upload/upload.routes';
import adminRoutes from './modules/admin/admin.routes';

// Middlewares
import { errorHandler } from './middlewares/error.middleware';

const app: Express = express();

// Trust proxy (for Render)
app.set('trust proxy', 1);

// Security
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:4200',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Stripe webhook needs raw body
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression
app.use(compression());

// Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined'));
}

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/readings', readingsRoutes);
app.use('/api/cards', cardsRoutes);
app.use('/api/appointments', appointmentsRoutes);
app.use('/api/schedule', scheduleRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/admin', adminRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use(errorHandler);

export default app;
```

### 2. Server Entry Point

```typescript
// apps/backend/src/server.ts
import app from './app';
import { PrismaClient } from '@prisma/client';
import { initScheduler } from './jobs/scheduler';

const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

async function main() {
  try {
    // Test database connection
    await prisma.$connect();
    console.log('✅ Database connected');

    // Initialize scheduled jobs
    initScheduler();
    console.log('✅ Scheduler initialized');

    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down...');
  await prisma.$disconnect();
  process.exit(0);
});

main();
```

### 3. Auth Module

```typescript
// apps/backend/src/modules/auth/auth.routes.ts
import { Router } from 'express';
import { AuthController } from './auth.controller';
import { validate } from '../../middlewares/validation.middleware';
import { loginSchema, registerSchema, forgotPasswordSchema, resetPasswordSchema } from './auth.schema';

const router = Router();
const controller = new AuthController();

router.post('/register', validate(registerSchema), controller.register);
router.post('/login', validate(loginSchema), controller.login);
router.post('/forgot-password', validate(forgotPasswordSchema), controller.forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), controller.resetPassword);
router.post('/refresh-token', controller.refreshToken);
router.post('/logout', controller.logout);

export default router;
```

```typescript
// apps/backend/src/modules/auth/auth.service.ts
import { PrismaClient, User } from '@prisma/client';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { signToken, verifyToken } from '../../utils/jwt.util';
import { sendEmail } from '../notifications/email.templates';
import { AppError } from '../../utils/response.util';

const prisma = new PrismaClient();

export class AuthService {
  async register(data: {
    email: string;
    password: string;
    fullName: string;
    phone?: string;
  }): Promise<{ user: Partial<User>; accessToken: string; refreshToken: string }> {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email }
    });

    if (existingUser) {
      throw new AppError('Email já cadastrado', 400);
    }

    // Hash password
    const passwordHash = await bcrypt.hash(data.password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        fullName: data.fullName,
        phone: data.phone,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        avatarUrl: true,
        createdAt: true,
      }
    });

    // Generate tokens
    const accessToken = signToken({ userId: user.id, role: user.role }, '15m');
    const refreshToken = signToken({ userId: user.id }, '7d');

    // Send welcome email
    await sendEmail({
      to: user.email,
      template: 'welcome',
      data: { name: user.fullName }
    });

    return { user, accessToken, refreshToken };
  }

  async login(email: string, password: string): Promise<{
    user: Partial<User>;
    accessToken: string;
    refreshToken: string;
  }> {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      throw new AppError('Credenciais inválidas', 401);
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);

    if (!isValidPassword) {
      throw new AppError('Credenciais inválidas', 401);
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    });

    // Generate tokens
    const accessToken = signToken({ userId: user.id, role: user.role }, '15m');
    const refreshToken = signToken({ userId: user.id }, '7d');

    // Return user without sensitive data
    const { passwordHash, resetToken, resetTokenExpiry, ...safeUser } = user;

    return { user: safeUser, accessToken, refreshToken };
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      // Don't reveal if email exists
      return;
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken, resetTokenExpiry }
    });

    // Send reset email
    const resetUrl = `${process.env.FRONTEND_URL}/auth/redefinir-senha?token=${resetToken}`;
    
    await sendEmail({
      to: user.email,
      template: 'password-reset',
      data: { name: user.fullName, resetUrl }
    });
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: { gt: new Date() }
      }
    });

    if (!user) {
      throw new AppError('Token inválido ou expirado', 400);
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetToken: null,
        resetTokenExpiry: null
      }
    });

    // Send confirmation email
    await sendEmail({
      to: user.email,
      template: 'password-changed',
      data: { name: user.fullName }
    });
  }

  async refreshToken(token: string): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const payload = verifyToken(token);
      
      const user = await prisma.user.findUnique({
        where: { id: payload.userId }
      });

      if (!user) {
        throw new AppError('Usuário não encontrado', 401);
      }

      const accessToken = signToken({ userId: user.id, role: user.role }, '15m');
      const newRefreshToken = signToken({ userId: user.id }, '7d');

      return { accessToken, refreshToken: newRefreshToken };
    } catch (error) {
      throw new AppError('Token inválido', 401);
    }
  }
}
```

```typescript
// apps/backend/src/modules/auth/auth.controller.ts
import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import { successResponse } from '../../utils/response.util';

const authService = new AuthService();

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.register(req.body);
      
      // Set refresh token as httpOnly cookie
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      successResponse(res, 201, 'Cadastro realizado com sucesso', {
        user: result.user,
        accessToken: result.accessToken
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);

      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      successResponse(res, 200, 'Login realizado com sucesso', {
        user: result.user,
        accessToken: result.accessToken
      });
    } catch (error) {
      next(error);
    }
  }

  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      await authService.forgotPassword(req.body.email);
      successResponse(res, 200, 'Se o email existir, você receberá instruções para redefinir sua senha');
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { token, password } = req.body;
      await authService.resetPassword(token, password);
      successResponse(res, 200, 'Senha redefinida com sucesso');
    } catch (error) {
      next(error);
    }
  }

  async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.cookies.refreshToken;
      
      if (!token) {
        return res.status(401).json({ error: 'Refresh token não fornecido' });
      }

      const result = await authService.refreshToken(token);

      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      successResponse(res, 200, 'Token atualizado', {
        accessToken: result.accessToken
      });
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      res.clearCookie('refreshToken');
      successResponse(res, 200, 'Logout realizado com sucesso');
    } catch (error) {
      next(error);
    }
  }
}
```

```typescript
// apps/backend/src/modules/auth/auth.schema.ts
import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    email: z.string().email('Email inválido'),
    password: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres'),
    fullName: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
    phone: z.string().optional(),
  })
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Email inválido'),
    password: z.string().min(1, 'Senha é obrigatória'),
  })
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email('Email inválido'),
  })
});

export const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(1, 'Token é obrigatório'),
    password: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres'),
  })
});
```

### 4. Payments Module (Stripe)

```typescript
// apps/backend/src/modules/payments/payments.routes.ts
import { Router } from 'express';
import { PaymentsController } from './payments.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validation.middleware';
import { createCheckoutSchema } from './payments.schema';

const router = Router();
const controller = new PaymentsController();

// Webhook (no auth, raw body)
router.post('/webhook', controller.handleWebhook);

// Protected routes
router.use(authMiddleware);
router.post('/create-checkout', validate(createCheckoutSchema), controller.createCheckout);
router.get('/session/:sessionId', controller.getSession);

export default router;
```

```typescript
// apps/backend/src/modules/payments/payments.service.ts
import Stripe from 'stripe';
import { PrismaClient } from '@prisma/client';
import { AppError } from '../../utils/response.util';

const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

interface CartItem {
  productId: string;
  quantity: number;
  questions?: string[];
}

export class PaymentsService {
  async createCheckoutSession(
    userId: string,
    items: CartItem[],
    clientNotes?: string
  ): Promise<{ sessionId: string; url: string }> {
    // Get user
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new AppError('Usuário não encontrado', 404);
    }

    // Get products
    const productIds = items.map(item => item.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, isActive: true }
    });

    if (products.length !== productIds.length) {
      throw new AppError('Um ou mais produtos não encontrados', 400);
    }

    // Create Stripe line items
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map(item => {
      const product = products.find(p => p.id === item.productId)!;
      return {
        price_data: {
          currency: 'brl',
          product_data: {
            name: product.name,
            description: product.shortDescription || undefined,
            images: product.coverImageUrl ? [product.coverImageUrl] : [],
          },
          unit_amount: Math.round(Number(product.price) * 100),
        },
        quantity: item.quantity,
      };
    });

    // Get or create Stripe customer
    let customerId = user.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.fullName,
        metadata: { userId: user.id },
      });
      customerId = customer.id;

      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId: customerId }
      });
    }

    // Calculate totals
    const subtotal = items.reduce((sum, item) => {
      const product = products.find(p => p.id === item.productId)!;
      return sum + Number(product.price) * item.quantity;
    }, 0);

    // Generate order number
    const orderCount = await prisma.order.count();
    const orderNumber = `IZT-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(orderCount + 1).padStart(4, '0')}`;

    // Create order in database
    const order = await prisma.order.create({
      data: {
        orderNumber,
        clientId: userId,
        subtotal,
        total: subtotal,
        clientNotes,
        items: {
          create: items.map(item => {
            const product = products.find(p => p.id === item.productId)!;
            return {
              productId: item.productId,
              productName: product.name,
              productType: product.productType,
              unitPrice: product.price,
              quantity: item.quantity,
              totalPrice: Number(product.price) * item.quantity,
              clientQuestions: item.questions || [],
            };
          })
        }
      }
    });

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card', 'boleto', 'pix'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/cliente/pedidos/${order.id}?success=true`,
      cancel_url: `${process.env.FRONTEND_URL}/carrinho?cancelled=true`,
      metadata: {
        orderId: order.id,
      },
      payment_intent_data: {
        metadata: {
          orderId: order.id,
        },
      },
      locale: 'pt-BR',
      expires_at: Math.floor(Date.now() / 1000) + 1800, // 30 minutes
    });

    // Update order with session ID
    await prisma.order.update({
      where: { id: order.id },
      data: { stripeCheckoutSessionId: session.id }
    });

    return {
      sessionId: session.id,
      url: session.url!
    };
  }

  async handleWebhook(payload: Buffer, signature: string): Promise<void> {
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        payload,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (err) {
      throw new AppError(`Webhook signature verification failed`, 400);
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await this.handlePaymentSuccess(session);
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await this.handlePaymentFailed(paymentIntent);
        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        await this.handleRefund(charge);
        break;
      }
    }
  }

  private async handlePaymentSuccess(session: Stripe.Checkout.Session): Promise<void> {
    const orderId = session.metadata?.orderId;
    if (!orderId) return;

    // Update order
    const order = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'PAID',
        paymentStatus: 'SUCCEEDED',
        stripePaymentIntentId: session.payment_intent as string,
        paidAt: new Date(),
      },
      include: {
        items: true,
        client: true,
      }
    });

    // Create readings for each item
    for (const item of order.items) {
      await prisma.reading.create({
        data: {
          orderItemId: item.id,
          clientId: order.clientId,
          title: `Leitura: ${item.productName}`,
          clientQuestion: item.clientQuestions.join('\n'),
          status: 'PENDING',
        }
      });
    }

    // Notify admin
    const admins = await prisma.user.findMany({
      where: { role: 'ADMIN' }
    });

    for (const admin of admins) {
      await prisma.notification.create({
        data: {
          userId: admin.id,
          title: 'Novo Pedido Pago! 🎉',
          message: `Pedido ${order.orderNumber} foi pago e aguarda tiragem.`,
          type: 'order',
          referenceId: order.id,
        }
      });
    }

    // Notify client
    await prisma.notification.create({
      data: {
        userId: order.clientId,
        title: 'Pagamento Confirmado! ✨',
        message: 'Seu pagamento foi confirmado. Sua leitura será preparada em breve.',
        type: 'order',
        referenceId: order.id,
      }
    });

    // Send email to client
    // await sendEmail({ ... });
  }

  private async handlePaymentFailed(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    const orderId = paymentIntent.metadata?.orderId;
    if (!orderId) return;

    await prisma.order.update({
      where: { id: orderId },
      data: { paymentStatus: 'FAILED' }
    });
  }

  private async handleRefund(charge: Stripe.Charge): Promise<void> {
    const paymentIntentId = charge.payment_intent as string;
    
    const order = await prisma.order.findFirst({
      where: { stripePaymentIntentId: paymentIntentId }
    });

    if (order) {
      await prisma.order.update({
        where: { id: order.id },
        data: {
          status: 'REFUNDED',
          paymentStatus: 'REFUNDED',
        }
      });
    }
  }

  async getSession(sessionId: string): Promise<Stripe.Checkout.Session> {
    return stripe.checkout.sessions.retrieve(sessionId);
  }
}
```

```typescript
// apps/backend/src/modules/payments/payments.controller.ts
import { Request, Response, NextFunction } from 'express';
import { PaymentsService } from './payments.service';
import { successResponse } from '../../utils/response.util';

const paymentsService = new PaymentsService();

export class PaymentsController {
  async createCheckout(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { items, clientNotes } = req.body;

      const result = await paymentsService.createCheckoutSession(userId, items, clientNotes);
      
      successResponse(res, 200, 'Checkout criado', result);
    } catch (error) {
      next(error);
    }
  }

  async handleWebhook(req: Request, res: Response, next: NextFunction) {
    try {
      const signature = req.headers['stripe-signature'] as string;
      
      await paymentsService.handleWebhook(req.body, signature);
      
      res.status(200).json({ received: true });
    } catch (error) {
      next(error);
    }
  }

  async getSession(req: Request, res: Response, next: NextFunction) {
    try {
      const { sessionId } = req.params;
      const session = await paymentsService.getSession(sessionId);
      
      successResponse(res, 200, 'Sessão recuperada', session);
    } catch (error) {
      next(error);
    }
  }
}
```

### 5. Readings Module

```typescript
// apps/backend/src/modules/readings/readings.service.ts
import { PrismaClient, ReadingStatus } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';
import { AppError } from '../../utils/response.util';

const prisma = new PrismaClient();
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

interface ReadingCardInput {
  cardId: string;
  position: number;
  positionName?: string;
  isReversed: boolean;
  interpretation?: string;
}

interface UpdateReadingInput {
  title?: string;
  introduction?: string;
  generalGuidance?: string;
  recommendations?: string;
  goals?: string;
  closingMessage?: string;
  audioUrl?: string;
  videoUrl?: string;
  cards?: ReadingCardInput[];
}

export class ReadingsService {
  // Client methods
  async getClientReadings(userId: string) {
    return prisma.reading.findMany({
      where: {
        clientId: userId,
        status: 'PUBLISHED',
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } }
        ]
      },
      include: {
        cards: {
          include: { card: true },
          orderBy: { position: 'asc' }
        },
        orderItem: {
          include: { product: true }
        }
      },
      orderBy: { publishedAt: 'desc' }
    });
  }

  async getReadingById(id: string, userId: string) {
    const reading = await prisma.reading.findFirst({
      where: {
        id,
        clientId: userId,
        status: 'PUBLISHED',
      },
      include: {
        cards: {
          include: { card: true },
          orderBy: { position: 'asc' }
        },
        orderItem: {
          include: { product: true }
        }
      }
    });

    if (!reading) {
      throw new AppError('Leitura não encontrada', 404);
    }

    return reading;
  }

  // Admin methods
  async getPendingReadings() {
    return prisma.reading.findMany({
      where: {
        status: { in: ['PENDING', 'IN_PROGRESS'] }
      },
      include: {
        client: {
          select: { id: true, fullName: true, email: true }
        },
        orderItem: {
          include: {
            product: true,
            order: true
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    });
  }

  async getReadingForEdit(id: string) {
    const reading = await prisma.reading.findUnique({
      where: { id },
      include: {
        client: {
          select: { id: true, fullName: true, email: true }
        },
        cards: {
          include: { card: true },
          orderBy: { position: 'asc' }
        },
        orderItem: {
          include: {
            product: true,
            order: true
          }
        }
      }
    });

    if (!reading) {
      throw new AppError('Leitura não encontrada', 404);
    }

    return reading;
  }

  async updateReading(id: string, data: UpdateReadingInput) {
    // Update reading
    const reading = await prisma.reading.update({
      where: { id },
      data: {
        title: data.title,
        introduction: data.introduction,
        generalGuidance: data.generalGuidance,
        recommendations: data.recommendations,
        goals: data.goals,
        closingMessage: data.closingMessage,
        audioUrl: data.audioUrl,
        videoUrl: data.videoUrl,
        status: 'IN_PROGRESS',
      }
    });

    // Update cards if provided
    if (data.cards) {
      // Delete existing cards
      await prisma.readingCard.deleteMany({
        where: { readingId: id }
      });

      // Create new cards
      await prisma.readingCard.createMany({
        data: data.cards.map(card => ({
          readingId: id,
          cardId: card.cardId,
          position: card.position,
          positionName: card.positionName,
          isReversed: card.isReversed,
          interpretation: card.interpretation,
        }))
      });
    }

    return this.getReadingForEdit(id);
  }

  async publishReading(id: string, pdfBuffer?: Buffer) {
    let pdfUrl: string | undefined;

    // Upload PDF to Supabase Storage if provided
    if (pdfBuffer) {
      const fileName = `readings/${id}/${Date.now()}.pdf`;
      
      const { data, error } = await supabase.storage
        .from('readings')
        .upload(fileName, pdfBuffer, {
          contentType: 'application/pdf',
          upsert: true
        });

      if (error) {
        throw new AppError('Erro ao fazer upload do PDF', 500);
      }

      const { data: urlData } = supabase.storage
        .from('readings')
        .getPublicUrl(fileName);

      pdfUrl = urlData.publicUrl;
    }

    // Get reading to get product validity
    const reading = await prisma.reading.findUnique({
      where: { id },
      include: {
        orderItem: {
          include: { product: true }
        }
      }
    });

    if (!reading) {
      throw new AppError('Leitura não encontrada', 404);
    }

    // Calculate expiry date
    const validityDays = reading.orderItem.product.validityDays;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + validityDays);

    // Update reading status
    const updatedReading = await prisma.reading.update({
      where: { id },
      data: {
        status: 'PUBLISHED',
        publishedAt: new Date(),
        readingDate: new Date(),
        expiresAt,
        pdfUrl,
        pdfGeneratedAt: pdfBuffer ? new Date() : undefined,
      }
    });

    // Notify client
    await prisma.notification.create({
      data: {
        userId: reading.clientId,
        title: 'Sua leitura está pronta! 🔮',
        message: 'Sua tiragem de tarot foi publicada e está disponível na sua área do cliente.',
        type: 'reading',
        referenceId: id,
      }
    });

    // Send email
    // await sendEmail({ ... });

    return updatedReading;
  }
}
```

### 6. Middlewares

```typescript
// apps/backend/src/middlewares/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt.util';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token não fornecido' });
    }

    const token = authHeader.split(' ')[1];
    const payload = verifyToken(token);

    // Verify user still exists
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, role: true }
    });

    if (!user) {
      return res.status(401).json({ error: 'Usuário não encontrado' });
    }

    req.user = { id: user.id, role: user.role };
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido' });
  }
};

export const adminMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Acesso negado' });
  }
  next();
};
```

```typescript
// apps/backend/src/middlewares/error.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/response.util';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', err);

  // Custom AppError
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message,
    });
  }

  // Zod validation error
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      error: 'Dados inválidos',
      details: err.errors.map(e => ({
        field: e.path.join('.'),
        message: e.message
      }))
    });
  }

  // Prisma errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      return res.status(400).json({
        success: false,
        error: 'Registro duplicado'
      });
    }
    if (err.code === 'P2025') {
      return res.status(404).json({
        success: false,
        error: 'Registro não encontrado'
      });
    }
  }

  // Default error
  return res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' 
      ? 'Erro interno do servidor' 
      : err.message
  });
};
```

```typescript
// apps/backend/src/middlewares/validation.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';

export const validate = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Dados inválidos',
          details: error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message
          }))
        });
      }
      next(error);
    }
  };
};
```

### 7. Utilities

```typescript
// apps/backend/src/utils/jwt.util.ts
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface TokenPayload {
  userId: string;
  role?: string;
}

export const signToken = (payload: TokenPayload, expiresIn: string): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
};

export const verifyToken = (token: string): TokenPayload => {
  return jwt.verify(token, JWT_SECRET) as TokenPayload;
};
```

```typescript
// apps/backend/src/utils/response.util.ts
import { Response } from 'express';

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const successResponse = (
  res: Response,
  statusCode: number,
  message: string,
  data?: any
) => {
  res.status(statusCode).json({
    success: true,
    message,
    data
  });
};
```

---

## 🌐 FRONTEND - API SERVICE

```typescript
// apps/frontend/src/app/core/services/api.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  get<T>(endpoint: string, params?: any): Observable<T> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined) {
          httpParams = httpParams.set(key, params[key]);
        }
      });
    }
    return this.http.get<T>(`${this.baseUrl}${endpoint}`, { params: httpParams });
  }

  post<T>(endpoint: string, data: any): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}${endpoint}`, data);
  }

  put<T>(endpoint: string, data: any): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}${endpoint}`, data);
  }

  patch<T>(endpoint: string, data: any): Observable<T> {
    return this.http.patch<T>(`${this.baseUrl}${endpoint}`, data);
  }

  delete<T>(endpoint: string): Observable<T> {
    return this.http.delete<T>(`${this.baseUrl}${endpoint}`);
  }

  upload<T>(endpoint: string, file: File, additionalData?: any): Observable<T> {
    const formData = new FormData();
    formData.append('file', file);
    
    if (additionalData) {
      Object.keys(additionalData).forEach(key => {
        formData.append(key, additionalData[key]);
      });
    }

    return this.http.post<T>(`${this.baseUrl}${endpoint}`, formData);
  }
}
```

```typescript
// apps/frontend/src/app/core/interceptors/auth.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getAccessToken();

  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(req);
};
```

---

## 🚀 CONFIGURAÇÃO DO AMBIENTE

### Backend (.env)

```env
# Server
NODE_ENV=development
PORT=3000

# Database (Supabase)
DATABASE_URL=postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres

# Supabase (Storage only)
SUPABASE_URL=https://[project].supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_KEY=eyJ...

# JWT
JWT_SECRET=your-super-secret-jwt-key-here

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email (Nodemailer)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=izabela.ayurvida@gmail.com
SMTP_PASS=your-app-password

# Frontend URL
FRONTEND_URL=https://izabelatarot.com.br
```

### Frontend (environment.ts)

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  stripePublishableKey: 'pk_test_...'
};
```

---

## 📦 PACKAGE.JSON (Backend)

```json
{
  "name": "izabela-tarot-backend",
  "version": "1.0.0",
  "main": "dist/server.js",
  "scripts": {
    "dev": "ts-node-dev --respawn --transpile-only src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate deploy",
    "prisma:studio": "prisma studio",
    "seed": "ts-node prisma/seed.ts",
    "test": "jest"
  },
  "dependencies": {
    "@prisma/client": "^5.x",
    "@supabase/supabase-js": "^2.x",
    "bcrypt": "^5.x",
    "compression": "^1.x",
    "cors": "^2.x",
    "date-fns": "^3.x",
    "express": "^4.x",
    "express-rate-limit": "^7.x",
    "helmet": "^7.x",
    "jsonwebtoken": "^9.x",
    "morgan": "^1.x",
    "multer": "^1.x",
    "node-cron": "^3.x",
    "nodemailer": "^6.x",
    "stripe": "^14.x",
    "zod": "^3.x"
  },
  "devDependencies": {
    "@types/bcrypt": "^5.x",
    "@types/compression": "^1.x",
    "@types/cors": "^2.x",
    "@types/express": "^4.x",
    "@types/jsonwebtoken": "^9.x",
    "@types/morgan": "^1.x",
    "@types/multer": "^1.x",
    "@types/node": "^20.x",
    "@types/node-cron": "^3.x",
    "@types/nodemailer": "^6.x",
    "prisma": "^5.x",
    "ts-node-dev": "^2.x",
    "typescript": "^5.x"
  }
}
```

---

## 🐳 DOCKER (Backend)

```dockerfile
# apps/backend/Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci

COPY . .

RUN npm run prisma:generate
RUN npm run build

FROM node:20-alpine AS runner

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000

CMD ["npm", "start"]
```

---

## ✅ CHECKLIST DE IMPLEMENTAÇÃO

### Fase 1: Setup Inicial
- [ ] Criar estrutura monorepo
- [ ] Setup Backend Node.js + TypeScript
- [ ] Setup Frontend Angular 20
- [ ] Configurar Prisma + Supabase
- [ ] Configurar variáveis de ambiente

### Fase 2: Backend Core
- [ ] Auth module (register, login, JWT)
- [ ] Users module (profile, CRUD)
- [ ] Middlewares (auth, admin, error, validation)
- [ ] Utilities (jwt, password, response)

### Fase 3: Backend Features
- [ ] Products module
- [ ] Orders module
- [ ] Payments module (Stripe)
- [ ] Readings module
- [ ] Cards module
- [ ] Appointments module
- [ ] Schedule module
- [ ] Notifications module
- [ ] Upload module (Supabase Storage)

### Fase 4: Frontend Core
- [ ] API Service
- [ ] Auth Service + Interceptor
- [ ] Guards (auth, admin, client)
- [ ] Layouts

### Fase 5: Frontend Public
- [ ] Home, About, Services pages
- [ ] Product List + Detail
- [ ] Cart + Checkout
- [ ] Auth pages

### Fase 6: Frontend Client Area
- [ ] Dashboard
- [ ] Readings (list + detail)
- [ ] Appointments
- [ ] Profile
- [ ] Payment History

### Fase 7: Frontend Admin
- [ ] Dashboard
- [ ] Product Management
- [ ] Order Management
- [ ] Reading Editor
- [ ] Schedule Management

### Fase 8: Deploy
- [ ] Build frontend
- [ ] Build backend
- [ ] Deploy to Render
- [ ] Configure domain
- [ ] Setup Stripe webhooks

---

## 📞 CONTATOS DA CLIENTE

- **Instagram:** @izabela.tarot
- **E-mail:** izabela.ayurvida@gmail.com
- **Pix:** izabela.ayurvida@gmail.com
- **Linktree:** linktr.ee/iza1543

---

**FIM DO PROMPT**

Este prompt contém todas as especificações para desenvolver o sistema Izabela Tarot com **backend Node.js** e **Supabase apenas para persistência**.
