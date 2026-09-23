ALTER TABLE "tenants"
ADD COLUMN "onboarding_completed_at" TIMESTAMP(3);

UPDATE "tenants"
SET "onboarding_completed_at" = CURRENT_TIMESTAMP
WHERE "slug" = 'default' AND "onboarding_completed_at" IS NULL;
