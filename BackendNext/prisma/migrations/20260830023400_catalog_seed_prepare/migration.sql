-- Temporary default required for direct SQL catalog inserts.
ALTER TABLE "products"
  ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP;
