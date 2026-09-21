ALTER TABLE "products"
ADD COLUMN "service_kind" TEXT NOT NULL DEFAULT 'SERVICE',
ADD COLUMN "capabilities" JSONB;

UPDATE "products"
SET
  "service_kind" = CASE
    WHEN "product_type" = 'SESSION' THEN 'SESSION'
    WHEN "product_type" = 'MONTHLY' THEN 'PACKAGE'
    WHEN "product_type" = 'QUESTION' THEN 'ASYNC_SERVICE'
    ELSE 'SERVICE'
  END,
  "capabilities" = jsonb_strip_nulls(
    jsonb_build_object(
      'scheduling', jsonb_build_object(
        'enabled', "requires_scheduling",
        'durationMinutes', "session_duration_minutes"
      ),
      'intake', jsonb_build_object(
        'enabled', ("num_questions" IS NOT NULL),
        'maxQuestions', "num_questions"
      ),
      'specialtyModule', CASE
        WHEN "num_cards" IS NOT NULL THEN jsonb_build_object(
          'key', 'tarot-cards',
          'config', jsonb_build_object('numCards', "num_cards")
        )
        ELSE NULL
      END
    )
  );

CREATE INDEX "products_service_kind_idx" ON "products"("service_kind");
