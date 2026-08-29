-- Restore Prisma-managed updated_at behavior after the catalog seed.
ALTER TABLE "products"
  ALTER COLUMN "updated_at" DROP DEFAULT;
