CREATE TABLE "users" (
  "id" SERIAL NOT NULL,
  "email" TEXT NOT NULL,
  "password_hash" TEXT NOT NULL,
  "role" TEXT NOT NULL DEFAULT 'CUSTOMER',
  "two_factor_enabled" BOOLEAN NOT NULL DEFAULT false,
  "name" TEXT,
  "phone" TEXT,
  "address" TEXT,
  "city" TEXT,
  "country" TEXT,
  "profile_image_url" TEXT,
  "email_verified" BOOLEAN NOT NULL DEFAULT false,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "last_login" TIMESTAMP(3),
  CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "user_addresses" (
  "id" SERIAL NOT NULL,
  "user_id" INTEGER NOT NULL,
  "label" TEXT,
  "street" TEXT NOT NULL,
  "city" TEXT NOT NULL,
  "country" TEXT NOT NULL,
  "is_default" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "user_addresses_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "user_preferences" (
  "id" SERIAL NOT NULL,
  "user_id" INTEGER NOT NULL,
  "language" TEXT NOT NULL DEFAULT 'en',
  "currency" TEXT NOT NULL DEFAULT 'RWF',
  "theme" TEXT NOT NULL DEFAULT 'system',
  "date_format" TEXT NOT NULL DEFAULT 'MM/DD/YYYY',
  "timezone" TEXT NOT NULL DEFAULT 'Africa/Kigali',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "user_preferences_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "user_notifications" (
  "id" SERIAL NOT NULL,
  "user_id" INTEGER NOT NULL,
  "email_order_updates" BOOLEAN NOT NULL DEFAULT true,
  "email_promotions" BOOLEAN NOT NULL DEFAULT true,
  "email_newsletters" BOOLEAN NOT NULL DEFAULT false,
  "sms_order_updates" BOOLEAN NOT NULL DEFAULT false,
  "sms_promotions" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "user_notifications_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "products" (
  "id" SERIAL NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "category" TEXT,
  "price" INTEGER NOT NULL,
  "image" TEXT,
  "in_stock" BOOLEAN NOT NULL DEFAULT true,
  "is_promo" BOOLEAN NOT NULL DEFAULT false,
  "original_price" INTEGER,
  "discount" INTEGER,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "orders" (
  "id" SERIAL NOT NULL,
  "order_number" INTEGER,
  "customer_name" TEXT,
  "customer_phone" TEXT NOT NULL,
  "channel" TEXT,
  "subtotal" INTEGER NOT NULL,
  "delivery_option" TEXT,
  "delivery_fee" INTEGER,
  "delivery_location" TEXT,
  "user_id" INTEGER,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "tracking_number" TEXT,
  "shipped_at" TIMESTAMP(3),
  "delivered_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "order_items" (
  "id" SERIAL NOT NULL,
  "order_id" INTEGER NOT NULL,
  "product_id" INTEGER NOT NULL,
  "quantity" INTEGER NOT NULL,
  "unit_price" INTEGER NOT NULL,
  CONSTRAINT "order_items_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "reviews" (
  "id" SERIAL NOT NULL,
  "product_id" INTEGER NOT NULL,
  "user_id" INTEGER NOT NULL,
  "rating" INTEGER NOT NULL,
  "comment" TEXT,
  "user_name" TEXT,
  "user_email" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "wishlist" (
  "id" SERIAL NOT NULL,
  "user_id" INTEGER NOT NULL,
  "product_id" INTEGER NOT NULL,
  CONSTRAINT "wishlist_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "auth_tokens" (
  "id" SERIAL NOT NULL,
  "user_id" INTEGER NOT NULL,
  "type" TEXT NOT NULL,
  "token" TEXT NOT NULL,
  "code" TEXT,
  "expires_at" TIMESTAMP(3) NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "auth_tokens_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX "user_preferences_user_id_key" ON "user_preferences"("user_id");
CREATE UNIQUE INDEX "user_notifications_user_id_key" ON "user_notifications"("user_id");
CREATE INDEX "orders_user_id_idx" ON "orders"("user_id");
CREATE INDEX "orders_created_at_idx" ON "orders"("created_at");
CREATE INDEX "order_items_order_id_idx" ON "order_items"("order_id");
CREATE INDEX "order_items_product_id_idx" ON "order_items"("product_id");
CREATE UNIQUE INDEX "reviews_user_id_product_id_key" ON "reviews"("user_id", "product_id");
CREATE INDEX "reviews_product_id_idx" ON "reviews"("product_id");
CREATE UNIQUE INDEX "wishlist_user_id_product_id_key" ON "wishlist"("user_id", "product_id");
CREATE UNIQUE INDEX "auth_tokens_token_key" ON "auth_tokens"("token");
CREATE INDEX "auth_tokens_user_id_type_idx" ON "auth_tokens"("user_id", "type");

ALTER TABLE "user_addresses" ADD CONSTRAINT "user_addresses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "user_preferences" ADD CONSTRAINT "user_preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "user_notifications" ADD CONSTRAINT "user_notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "wishlist" ADD CONSTRAINT "wishlist_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "wishlist" ADD CONSTRAINT "wishlist_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "auth_tokens" ADD CONSTRAINT "auth_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
