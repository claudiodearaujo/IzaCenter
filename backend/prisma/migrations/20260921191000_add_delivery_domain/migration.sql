ALTER TABLE "readings"
ADD COLUMN "delivery_type" TEXT NOT NULL DEFAULT 'CONTENT',
ADD COLUMN "content" JSONB,
ADD COLUMN "specialty_module" JSONB,
ADD COLUMN "metadata" JSONB;

UPDATE "readings" r
SET
  "delivery_type" = CASE
    WHEN r."video_url" IS NOT NULL THEN 'VIDEO'
    WHEN r."audio_url" IS NOT NULL THEN 'AUDIO'
    WHEN r."pdf_url" IS NOT NULL THEN 'PDF'
    ELSE 'CONTENT'
  END,
  "content" = jsonb_strip_nulls(
    jsonb_build_object(
      'introduction', r."introduction",
      'body', r."general_guidance",
      'recommendations', r."recommendations",
      'goals', r."goals",
      'closing', r."closing_message"
    )
  ),
  "specialty_module" = CASE
    WHEN EXISTS (
      SELECT 1
      FROM "reading_cards" rc
      WHERE rc."reading_id" = r."id"
    ) THEN jsonb_build_object('key', 'tarot-cards', 'version', 1)
    ELSE NULL
  END,
  "metadata" = jsonb_build_object(
    'legacyReading', true,
    'schemaVersion', 1
  );

CREATE INDEX "readings_delivery_type_idx" ON "readings"("delivery_type");
