
-- Run this inside psql as a superuser or a user with CREATE DATABASE rights

CREATE DATABASE kitenge;

\c kitenge

CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    price INTEGER NOT NULL,
    image TEXT,
    in_stock BOOLEAN DEFAULT TRUE,
    is_promo BOOLEAN DEFAULT FALSE,
    original_price INTEGER,
    discount INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE "session" (
  "sid" varchar NOT NULL COLLATE "default",
	"sess" json NOT NULL,
	"expire" timestamp(6) NOT NULL
)
WITH (OIDS=FALSE);

ALTER TABLE "session" ADD CONSTRAINT "session_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE;

CREATE INDEX "IDX_session_expire" ON "session" ("expire");

INSERT INTO products (name, description, category, price, image, in_stock, is_promo, original_price, discount)
VALUES
('Organic Hass Avocados', 'Ripe, creamy organic Hass avocados sourced directly from local organic farms.', 'Fruits', 3500,
 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&w=800&q=80', true, true, 4500, 22),
('Farm Fresh Strawberries 500g', 'Sweet, juicy hand-picked red strawberries packed with natural vitamin C.', 'Fruits', 5000,
 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&w=800&q=80', true, true, 6500, 23),
('Crisp Farm Bell Peppers Mix', 'Vibrant red, yellow, and green bell peppers full of crunch and freshness.', 'Vegetables', 2800,
 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?auto=format&fit=crop&w=800&q=80', true, false, NULL, NULL),
('Fresh Organic Milk 1L', 'Pure pasteurized whole milk from grass-fed dairy farms.', 'Dairy', 1800,
 'https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=800&q=80', true, false, NULL, NULL),
('Artisan Sourdough Loaf', 'Freshly baked crusty sourdough bread crafted with traditional fermentation.', 'Bakery', 4000,
 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80', true, true, 5000, 20);
