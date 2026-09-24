-- SaaS Foundation v5 — LGPD & Operations

CREATE TYPE "PrivacyRequestType" AS ENUM (
  'ACCESS',
  'CONFIRMATION',
  'CORRECTION',
  'PORTABILITY',
  'ANONYMIZATION',
  'DELETION',
  'INFORMATION',
  'CONSENT_WITHDRAWAL'
);

CREATE TYPE "PrivacyRequestStatus" AS ENUM (
  'PENDING',
  'IN_REVIEW',
  'APPROVED',
  'REJECTED',
  'COMPLETED',
  'CANCELED'
);

CREATE TYPE "AuditOutcome" AS ENUM ('SUCCESS', 'FAILURE');

CREATE TYPE "SecurityIncidentSeverity" AS ENUM (
  'LOW',
  'MEDIUM',
  'HIGH',
  'CRITICAL'
);

CREATE TYPE "SecurityIncidentStatus" AS ENUM (
  'OPEN',
  'INVESTIGATING',
  'CONTAINED',
  'RESOLVED',
  'CLOSED'
);

CREATE TABLE "privacy_requests" (
  "id" TEXT NOT NULL,
  "tenant_id" TEXT NOT NULL,
  "requester_user_id" TEXT NOT NULL,
  "type" "PrivacyRequestType" NOT NULL,
  "status" "PrivacyRequestStatus" NOT NULL DEFAULT 'PENDING',
  "details" TEXT,
  "response_message" TEXT,
  "reviewed_by_user_id" TEXT,
  "completed_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "privacy_requests_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "audit_events" (
  "id" TEXT NOT NULL,
  "tenant_id" TEXT,
  "actor_user_id" TEXT,
  "action" TEXT NOT NULL,
  "resource_type" TEXT,
  "resource_id" TEXT,
  "method" TEXT NOT NULL,
  "path" TEXT NOT NULL,
  "status_code" INTEGER,
  "outcome" "AuditOutcome" NOT NULL,
  "request_id" TEXT NOT NULL,
  "ip_hash" TEXT,
  "metadata" JSONB,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "audit_events_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "data_retention_policies" (
  "id" TEXT NOT NULL,
  "tenant_id" TEXT NOT NULL,
  "audit_retention_days" INTEGER NOT NULL DEFAULT 730,
  "privacy_request_retention_days" INTEGER NOT NULL DEFAULT 1825,
  "operational_log_retention_days" INTEGER NOT NULL DEFAULT 90,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "data_retention_policies_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "security_incidents" (
  "id" TEXT NOT NULL,
  "tenant_id" TEXT,
  "title" TEXT NOT NULL,
  "summary" TEXT NOT NULL,
  "severity" "SecurityIncidentSeverity" NOT NULL,
  "status" "SecurityIncidentStatus" NOT NULL DEFAULT 'OPEN',
  "detected_at" TIMESTAMP(3) NOT NULL,
  "controller_aware_at" TIMESTAMP(3) NOT NULL,
  "affected_data_categories" TEXT[] NOT NULL,
  "affected_subjects_estimate" INTEGER,
  "risk_relevant" BOOLEAN,
  "anpd_notified_at" TIMESTAMP(3),
  "subjects_notified_at" TIMESTAMP(3),
  "resolution_summary" TEXT,
  "created_by_user_id" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "security_incidents_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "data_retention_policies_tenant_id_key"
  ON "data_retention_policies"("tenant_id");

CREATE INDEX "privacy_requests_tenant_id_status_idx"
  ON "privacy_requests"("tenant_id", "status");
CREATE INDEX "privacy_requests_requester_user_id_idx"
  ON "privacy_requests"("requester_user_id");
CREATE INDEX "privacy_requests_created_at_idx"
  ON "privacy_requests"("created_at");

CREATE INDEX "audit_events_tenant_id_created_at_idx"
  ON "audit_events"("tenant_id", "created_at");
CREATE INDEX "audit_events_actor_user_id_idx"
  ON "audit_events"("actor_user_id");
CREATE INDEX "audit_events_action_idx"
  ON "audit_events"("action");
CREATE INDEX "audit_events_resource_type_resource_id_idx"
  ON "audit_events"("resource_type", "resource_id");
CREATE INDEX "audit_events_request_id_idx"
  ON "audit_events"("request_id");

CREATE INDEX "security_incidents_tenant_id_status_idx"
  ON "security_incidents"("tenant_id", "status");
CREATE INDEX "security_incidents_severity_idx"
  ON "security_incidents"("severity");
CREATE INDEX "security_incidents_controller_aware_at_idx"
  ON "security_incidents"("controller_aware_at");

ALTER TABLE "privacy_requests"
  ADD CONSTRAINT "privacy_requests_tenant_id_fkey"
  FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "privacy_requests"
  ADD CONSTRAINT "privacy_requests_requester_user_id_fkey"
  FOREIGN KEY ("requester_user_id") REFERENCES "users"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "privacy_requests"
  ADD CONSTRAINT "privacy_requests_reviewed_by_user_id_fkey"
  FOREIGN KEY ("reviewed_by_user_id") REFERENCES "users"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "audit_events"
  ADD CONSTRAINT "audit_events_tenant_id_fkey"
  FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "audit_events"
  ADD CONSTRAINT "audit_events_actor_user_id_fkey"
  FOREIGN KEY ("actor_user_id") REFERENCES "users"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "data_retention_policies"
  ADD CONSTRAINT "data_retention_policies_tenant_id_fkey"
  FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "security_incidents"
  ADD CONSTRAINT "security_incidents_tenant_id_fkey"
  FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "security_incidents"
  ADD CONSTRAINT "security_incidents_created_by_user_id_fkey"
  FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

-- Safe additive backfill. No business data is deleted or modified.
INSERT INTO "data_retention_policies" (
  "id",
  "tenant_id",
  "audit_retention_days",
  "privacy_request_retention_days",
  "operational_log_retention_days",
  "created_at",
  "updated_at"
)
SELECT
  gen_random_uuid()::text,
  t."id",
  730,
  1825,
  90,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "tenants" t
WHERE NOT EXISTS (
  SELECT 1
  FROM "data_retention_policies" p
  WHERE p."tenant_id" = t."id"
);
