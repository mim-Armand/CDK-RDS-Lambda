-- 1. Create 3 different schemas
CREATE SCHEMA schema1;
CREATE SCHEMA schema2;
CREATE SCHEMA schema3;

-- 2. Create tables
CREATE TABLE schema1.users (
                               id SERIAL PRIMARY KEY,
                               name TEXT,
                               email TEXT
);

CREATE TABLE schema2.products (
                                  id SERIAL PRIMARY KEY,
                                  product_name TEXT,
                                  price NUMERIC(10, 2)
);

CREATE TABLE schema3.orders (
                                order_id SERIAL PRIMARY KEY,
                                product_id INTEGER REFERENCES schema2.products(id),
                                quantity INTEGER
);

-- 3. Insert random data
-- For `users`
INSERT INTO schema1.users (name, email)
SELECT
    md5(random()::text),
    md5(random()::text) || '@example.com'
FROM generate_series(1, 100);

-- For `products`
INSERT INTO schema2.products (product_name, price)
SELECT
    md5(random()::text),
    (random() * 100)::NUMERIC(10,2)
FROM generate_series(1, 100);

-- For `orders`
-- Note: This assumes products have been created with ids ranging from 1 to 100.
INSERT INTO schema3.orders (product_id, quantity)
SELECT
    (random() * 99 + 1)::INTEGER,
        (random() * 10)::INTEGER
FROM generate_series(1, 100);
