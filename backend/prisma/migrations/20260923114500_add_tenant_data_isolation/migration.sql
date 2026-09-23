-- SaaS Foundation v2 — Data Isolation
-- Backfill every legacy aggregate into the deterministic default tenant.

ALTER TABLE "product_categories" ADD COLUMN "tenant_id" TEXT;
ALTER TABLE "products" ADD COLUMN "tenant_id" TEXT;
ALTER TABLE "orders" ADD COLUMN "tenant_id" TEXT;
ALTER TABLE "cigano_cards" ADD COLUMN "tenant_id" TEXT;
ALTER TABLE "readings" ADD COLUMN "tenant_id" TEXT;
ALTER TABLE "schedule_settings" ADD COLUMN "tenant_id" TEXT;
ALTER TABLE "appointments" ADD COLUMN "tenant_id" TEXT;
ALTER TABLE "blocked_slots" ADD COLUMN "tenant_id" TEXT;
ALTER TABLE "testimonials" ADD COLUMN "tenant_id" TEXT;
ALTER TABLE "coupons" ADD COLUMN "tenant_id" TEXT;
ALTER TABLE "notifications" ADD COLUMN "tenant_id" TEXT;

UPDATE "product_categories" SET "tenant_id" = '00000000-0000-0000-0000-000000000001' WHERE "tenant_id" IS NULL;
UPDATE "products" SET "tenant_id" = '00000000-0000-0000-0000-000000000001' WHERE "tenant_id" IS NULL;
UPDATE "orders" SET "tenant_id" = '00000000-0000-0000-0000-000000000001' WHERE "tenant_id" IS NULL;
UPDATE "cigano_cards" SET "tenant_id" = '00000000-0000-0000-0000-000000000001' WHERE "tenant_id" IS NULL;
UPDATE "readings" SET "tenant_id" = '00000000-0000-0000-0000-000000000001' WHERE "tenant_id" IS NULL;
UPDATE "schedule_settings" SET "tenant_id" = '00000000-0000-0000-0000-000000000001' WHERE "tenant_id" IS NULL;

UPDATE "appointments" SET "tenant_id" = '00000000-0000-0000-0000-000000000001' WHERE "tenant_id" IS NULL;
UPDATE "blocked_slots" SET "tenant_id" = '00000000-0000-0000-0000-000000000001' WHERE "tenant_id" IS NULL;
UPDATE "testimonials" SET "tenant_id" = '00000000-0000-0000-0000-000000000001' WHERE "tenant_id" IS NULL;
UPDATE "coupons" SET "tenant_id" = '00000000-0000-0000-0000-000000000001' WHERE "tenant_id" IS NULL;
UPDATE "notifications" SET "tenant_id" = '00000000-0000-0000-0000-000000000001' WHERE "tenant_id" IS NULL;

ALTER TABLE "product_categories" ALTER COLUMN "tenant_id" SET NOT NULL;
ALTER TABLE "products" ALTER COLUMN "tenant_id" SET NOT NULL;
ALTER TABLE "orders" ALTER COLUMN "tenant_id" SET NOT NULL;
ALTER TABLE "cigano_cards" ALTER COLUMN "tenant_id" SET NOT NULL;
ALTER TABLE "readings" ALTER COLUMN "tenant_id" SET NOT NULL;
ALTER TABLE "schedule_settings" ALTER COLUMN "tenant_id" SET NOT NULL;
ALTER TABLE "appointments" ALTER COLUMN "tenant_id" SET NOT NULL;
ALTER TABLE "blocked_slots" ALTER COLUMN "tenant_id" SET NOT NULL;
ALTER TABLE "testimonials" ALTER COLUMN "tenant_id" SET NOT NULL;
ALTER TABLE "coupons" ALTER COLUMN "tenant_id" SET NOT NULL;
ALTER TABLE "notifications" ALTER COLUMN "tenant_id" SET NOT NULL;

DROP INDEX "product_categories_slug_key";
DROP INDEX "products_slug_key";
DROP INDEX "cigano_cards_number_key";
DROP INDEX "coupons_code_key";

CREATE UNIQUE INDEX "product_categories_tenant_id_slug_key" ON "product_categories"("tenant_id", "slug");
CREATE UNIQUE INDEX "products_tenant_id_slug_key" ON "products"("tenant_id", "slug");
CREATE UNIQUE INDEX "cigano_cards_tenant_id_number_key" ON "cigano_cards"("tenant_id", "number");
CREATE UNIQUE INDEX "coupons_tenant_id_code_key" ON "coupons"("tenant_id", "code");
CREATE UNIQUE INDEX "schedule_settings_tenant_id_key" ON "schedule_settings"("tenant_id");

CREATE INDEX "product_categories_tenant_id_idx" ON "product_categories"("tenant_id");
CREATE INDEX "products_tenant_id_idx" ON "products"("tenant_id");
CREATE INDEX "products_tenant_id_is_active_idx" ON "products"("tenant_id", "is_active");
CREATE INDEX "orders_tenant_id_idx" ON "orders"("tenant_id");
CREATE INDEX "orders_tenant_id_client_id_idx" ON "orders"("tenant_id", "client_id");
CREATE INDEX "orders_tenant_id_status_idx" ON "orders"("tenant_id", "status");
CREATE INDEX "cigano_cards_tenant_id_idx" ON "cigano_cards"("tenant_id");
CREATE INDEX "readings_tenant_id_idx" ON "readings"("tenant_id");
CREATE INDEX "readings_tenant_id_client_id_idx" ON "readings"("tenant_id", "client_id");
CREATE INDEX "readings_tenant_id_status_idx" ON "readings"("tenant_id", "status");
CREATE INDEX "appointments_tenant_id_idx" ON "appointments"("tenant_id");
CREATE INDEX "appointments_tenant_id_client_id_idx" ON "appointments"("tenant_id", "client_id");
CREATE INDEX "appointments_tenant_id_scheduled_date_idx" ON "appointments"("tenant_id", "scheduled_date");
CREATE INDEX "blocked_slots_tenant_id_idx" ON "blocked_slots"("tenant_id");
CREATE INDEX "blocked_slots_tenant_id_blocked_date_idx" ON "blocked_slots"("tenant_id", "blocked_date");
CREATE INDEX "testimonials_tenant_id_idx" ON "testimonials"("tenant_id");
CREATE INDEX "testimonials_tenant_id_is_approved_idx" ON "testimonials"("tenant_id", "is_approved");
CREATE INDEX "coupons_tenant_id_idx" ON "coupons"("tenant_id");
CREATE INDEX "notifications_tenant_id_idx" ON "notifications"("tenant_id");
CREATE INDEX "notifications_tenant_id_user_id_idx" ON "notifications"("tenant_id", "user_id");

ALTER TABLE "product_categories" ADD CONSTRAINT "product_categories_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "products" ADD CONSTRAINT "products_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "orders" ADD CONSTRAINT "orders_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "cigano_cards" ADD CONSTRAINT "cigano_cards_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "readings" ADD CONSTRAINT "readings_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "schedule_settings" ADD CONSTRAINT "schedule_settings_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "blocked_slots" ADD CONSTRAINT "blocked_slots_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "testimonials" ADD CONSTRAINT "testimonials_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "coupons" ADD CONSTRAINT "coupons_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
