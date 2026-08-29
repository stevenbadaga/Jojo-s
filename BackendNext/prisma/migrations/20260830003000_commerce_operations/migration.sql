-- MarketMet production commerce operations upgrade

ALTER TABLE "products"
  ADD COLUMN "sku" TEXT,
  ADD COLUMN "unit" TEXT NOT NULL DEFAULT 'item',
  ADD COLUMN "stock_quantity" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "low_stock_threshold" INTEGER NOT NULL DEFAULT 5;

CREATE UNIQUE INDEX "products_sku_key" ON "products"("sku");
CREATE INDEX "products_category_idx" ON "products"("category");
CREATE INDEX "products_active_stock_quantity_idx" ON "products"("active", "stock_quantity");

-- Preserve existing product availability while introducing quantities.
UPDATE "products"
SET "stock_quantity" = CASE WHEN "in_stock" = TRUE THEN 20 ELSE 0 END;

ALTER TABLE "orders"
  ADD COLUMN "payment_status" TEXT NOT NULL DEFAULT 'UNPAID',
  ADD COLUMN "payment_method" TEXT,
  ADD COLUMN "payment_reference" TEXT,
  ADD COLUMN "payment_notes" TEXT,
  ADD COLUMN "paid_at" TIMESTAMP(3),
  ADD COLUMN "confirmed_at" TIMESTAMP(3),
  ADD COLUMN "picking_at" TIMESTAMP(3),
  ADD COLUMN "packed_at" TIMESTAMP(3),
  ADD COLUMN "out_for_delivery_at" TIMESTAMP(3),
  ADD COLUMN "cancelled_at" TIMESTAMP(3),
  ADD COLUMN "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

CREATE INDEX "orders_status_idx" ON "orders"("status");
CREATE INDEX "orders_payment_status_idx" ON "orders"("payment_status");

CREATE TABLE "stock_movements" (
  "id" SERIAL NOT NULL,
  "product_id" INTEGER NOT NULL,
  "order_id" INTEGER,
  "type" TEXT NOT NULL,
  "change" INTEGER NOT NULL,
  "quantity_before" INTEGER NOT NULL,
  "quantity_after" INTEGER NOT NULL,
  "note" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "stock_movements_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "stock_movements_product_id_created_at_idx" ON "stock_movements"("product_id", "created_at");
CREATE INDEX "stock_movements_order_id_idx" ON "stock_movements"("order_id");

ALTER TABLE "stock_movements"
  ADD CONSTRAINT "stock_movements_product_id_fkey"
  FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "stock_movements"
  ADD CONSTRAINT "stock_movements_order_id_fkey"
  FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "insight_posts" (
  "id" SERIAL NOT NULL,
  "slug" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "excerpt" TEXT,
  "content" TEXT NOT NULL,
  "category" TEXT,
  "image" TEXT,
  "author" TEXT DEFAULT 'MarketMet Editorial',
  "featured" BOOLEAN NOT NULL DEFAULT FALSE,
  "published" BOOLEAN NOT NULL DEFAULT TRUE,
  "published_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "insight_posts_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "insight_posts_slug_key" ON "insight_posts"("slug");
CREATE INDEX "insight_posts_published_published_at_idx" ON "insight_posts"("published", "published_at");
CREATE INDEX "insight_posts_featured_idx" ON "insight_posts"("featured");

CREATE TABLE "app_notifications" (
  "id" SERIAL NOT NULL,
  "user_id" INTEGER NOT NULL,
  "order_id" INTEGER,
  "type" TEXT NOT NULL DEFAULT 'ORDER',
  "title" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "read" BOOLEAN NOT NULL DEFAULT FALSE,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "app_notifications_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "app_notifications_user_id_created_at_idx" ON "app_notifications"("user_id", "created_at");
CREATE INDEX "app_notifications_order_id_idx" ON "app_notifications"("order_id");

ALTER TABLE "app_notifications"
  ADD CONSTRAINT "app_notifications_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "app_notifications"
  ADD CONSTRAINT "app_notifications_order_id_fkey"
  FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Seed the editorial area with polished starter content. Admin can edit or replace these later.
INSERT INTO "insight_posts" ("slug", "title", "excerpt", "content", "category", "image", "author", "featured", "published", "published_at") VALUES
(
  'shop-seasonally-for-better-value',
  'Shop seasonally for better freshness and value',
  'A practical way to choose produce when quality, price and availability move throughout the year.',
  'Seasonal shopping is less about following a strict calendar and more about noticing what is arriving in good condition and consistent supply. Start with produce that looks vibrant, compare value across similar options, and build the rest of your basket around versatile staples. MarketMet uses this space to share practical buying guidance that helps customers make confident everyday choices.',
  'Freshness Guide',
  'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1400&q=84',
  'MarketMet Editorial',
  TRUE,
  TRUE,
  CURRENT_TIMESTAMP
),
(
  'build-a-smarter-weekly-grocery-basket',
  'Build a smarter weekly grocery basket',
  'Use a simple structure for essentials, fresh foods and flexible ingredients without overbuying.',
  'A strong weekly basket usually starts with the foods you use most often, then adds fresh produce and a few flexible ingredients that can work across several meals. Keep a short list of repeat essentials, check what is already at home, and avoid buying perishables without a plan. Small habits like these reduce waste while making grocery spending easier to predict.',
  'Smart Shopping',
  'https://images.unsplash.com/photo-1601598851547-4302969d0614?auto=format&fit=crop&w=1400&q=84',
  'MarketMet Editorial',
  FALSE,
  TRUE,
  CURRENT_TIMESTAMP
),
(
  'keep-fresh-produce-fresher-for-longer',
  'Keep fresh produce fresher for longer',
  'Simple storage habits can protect texture, flavour and value after your groceries arrive.',
  'Different produce benefits from different storage conditions. Keep leafy vegetables dry and cool, separate items that ripen quickly from those that are sensitive to ethylene, and avoid washing produce long before you plan to use it unless it is dried thoroughly afterwards. Better storage is one of the easiest ways to get more value from every grocery order.',
  'Food Care',
  'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=1400&q=84',
  'MarketMet Editorial',
  FALSE,
  TRUE,
  CURRENT_TIMESTAMP
);
