-- SaaS Foundation v1
-- Adds tenant identity and memberships while preserving the current single-tenant dataset.

CREATE TYPE "TenantStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'ARCHIVED');
CREATE TYPE "TenantMemberRole" AS ENUM ('OWNER', 'ADMIN', 'CLIENT');

CREATE TABLE "tenants" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "status" "TenantStatus" NOT NULL DEFAULT 'ACTIVE',
    "plan_key" TEXT NOT NULL DEFAULT 'starter',
    "custom_domain" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "tenants_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "tenant_memberships" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "role" "TenantMemberRole" NOT NULL DEFAULT 'CLIENT',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "tenant_memberships_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "tenants_slug_key" ON "tenants"("slug");
CREATE UNIQUE INDEX "tenants_custom_domain_key" ON "tenants"("custom_domain");
CREATE INDEX "tenants_status_idx" ON "tenants"("status");
CREATE UNIQUE INDEX "tenant_memberships_tenant_id_user_id_key" ON "tenant_memberships"("tenant_id", "user_id");
CREATE INDEX "tenant_memberships_user_id_idx" ON "tenant_memberships"("user_id");
CREATE INDEX "tenant_memberships_tenant_id_role_idx" ON "tenant_memberships"("tenant_id", "role");

INSERT INTO "tenants" (
    "id", "name", "slug", "status", "plan_key", "created_at", "updated_at"
) VALUES (
    '00000000-0000-0000-0000-000000000001',
    'Default Tenant',
    'default',
    'ACTIVE',
    'starter',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

INSERT INTO "tenant_memberships" (
    "id", "tenant_id", "user_id", "role", "is_active", "created_at", "updated_at"
)
SELECT
    'legacy-' || "id",
    '00000000-0000-0000-0000-000000000001',
    "id",
    CASE
        WHEN "role"::text = 'ADMIN' THEN 'OWNER'::"TenantMemberRole"
        ELSE 'CLIENT'::"TenantMemberRole"
    END,
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM "users";

ALTER TABLE "site_settings" ADD COLUMN "tenant_id" TEXT;

UPDATE "site_settings"
SET "tenant_id" = '00000000-0000-0000-0000-000000000001'
WHERE "tenant_id" IS NULL;

ALTER TABLE "site_settings" ALTER COLUMN "tenant_id" SET NOT NULL;

DROP INDEX "site_settings_key_key";
CREATE UNIQUE INDEX "site_settings_tenant_id_key_key" ON "site_settings"("tenant_id", "key");
CREATE INDEX "site_settings_tenant_id_idx" ON "site_settings"("tenant_id");

ALTER TABLE "tenant_memberships"
ADD CONSTRAINT "tenant_memberships_tenant_id_fkey"
FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "tenant_memberships"
ADD CONSTRAINT "tenant_memberships_user_id_fkey"
FOREIGN KEY ("user_id") REFERENCES "users"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "site_settings"
ADD CONSTRAINT "site_settings_tenant_id_fkey"
FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
