-- CreateEnum
CREATE TYPE "SaasSubscriptionStatus" AS ENUM (
  'FREE',
  'TRIALING',
  'ACTIVE',
  'PAST_DUE',
  'PAUSED',
  'CANCELED',
  'INCOMPLETE',
  'UNPAID'
);

-- CreateTable
CREATE TABLE "saas_subscriptions" (
  "id" TEXT NOT NULL,
  "tenant_id" TEXT NOT NULL,
  "plan_key" TEXT NOT NULL DEFAULT 'starter',
  "status" "SaasSubscriptionStatus" NOT NULL DEFAULT 'FREE',
  "provider" TEXT NOT NULL DEFAULT 'stripe',
  "provider_customer_id" TEXT,
  "provider_subscription_id" TEXT,
  "provider_price_id" TEXT,
  "current_period_start" TIMESTAMP(3),
  "current_period_end" TIMESTAMP(3),
  "trial_ends_at" TIMESTAMP(3),
  "cancel_at_period_end" BOOLEAN NOT NULL DEFAULT false,
  "canceled_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "saas_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stripe_webhook_events" (
  "id" TEXT NOT NULL,
  "stripe_event_id" TEXT NOT NULL,
  "event_type" TEXT NOT NULL,
  "tenant_id" TEXT,
  "processed_at" TIMESTAMP(3),
  "last_error" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "stripe_webhook_events_pkey" PRIMARY KEY ("id")
);

-- Backfill every existing tenant with a safe FREE starter subscription.
INSERT INTO "saas_subscriptions" (
  "id",
  "tenant_id",
  "plan_key",
  "status",
  "provider",
  "cancel_at_period_end",
  "created_at",
  "updated_at"
)
SELECT
  gen_random_uuid()::text,
  t."id",
  COALESCE(NULLIF(t."plan_key", ''), 'starter'),
  CASE
    WHEN COALESCE(NULLIF(t."plan_key", ''), 'starter') = 'starter'
      THEN 'FREE'::"SaasSubscriptionStatus"
    ELSE 'ACTIVE'::"SaasSubscriptionStatus"
  END,
  'stripe',
  false,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "tenants" t
WHERE NOT EXISTS (
  SELECT 1 FROM "saas_subscriptions" s WHERE s."tenant_id" = t."id"
);

-- Indexes and constraints
CREATE UNIQUE INDEX "saas_subscriptions_tenant_id_key" ON "saas_subscriptions"("tenant_id");
CREATE UNIQUE INDEX "saas_subscriptions_provider_customer_id_key" ON "saas_subscriptions"("provider_customer_id");
CREATE UNIQUE INDEX "saas_subscriptions_provider_subscription_id_key" ON "saas_subscriptions"("provider_subscription_id");
CREATE INDEX "saas_subscriptions_status_idx" ON "saas_subscriptions"("status");
CREATE INDEX "saas_subscriptions_plan_key_idx" ON "saas_subscriptions"("plan_key");

CREATE UNIQUE INDEX "stripe_webhook_events_stripe_event_id_key" ON "stripe_webhook_events"("stripe_event_id");
CREATE INDEX "stripe_webhook_events_tenant_id_idx" ON "stripe_webhook_events"("tenant_id");
CREATE INDEX "stripe_webhook_events_event_type_idx" ON "stripe_webhook_events"("event_type");
CREATE INDEX "stripe_webhook_events_processed_at_idx" ON "stripe_webhook_events"("processed_at");

ALTER TABLE "saas_subscriptions"
ADD CONSTRAINT "saas_subscriptions_tenant_id_fkey"
FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "stripe_webhook_events"
ADD CONSTRAINT "stripe_webhook_events_tenant_id_fkey"
FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE SET NULL ON UPDATE CASCADE;
