-- 1. View combining all tables from all schemas
CREATE VIEW combined_all AS
SELECT
    'users' as source_table,
    CAST(u.id AS text) as id,
    u.name,
    u.email,
    NULL as product_name,
    NULL as price,
    NULL as order_id,
    NULL as product_id,
    NULL as quantity
FROM schema1.users u

UNION ALL

SELECT
    'products' as source_table,
    CAST(p.id AS text),
    NULL as name,
    NULL as email,
    p.product_name,
    CAST(p.price AS text),
    NULL as order_id,
    NULL as product_id,
    NULL as quantity
FROM schema2.products p

UNION ALL

SELECT
    'orders' as source_table,
    CAST(o.order_id AS text),
    NULL as name,
    NULL as email,
    NULL as product_name,
    NULL as price,
    CAST(o.order_id AS text),
    CAST(o.product_id AS text),
    CAST(o.quantity AS text)
FROM schema3.orders o;


-- 2. Demonstration view combining users and products
CREATE VIEW users_products AS
SELECT
    u.id as user_id,
    u.name,
    u.email,
    p.id as product_id,
    p.product_name,
    p.price
FROM schema1.users u
         JOIN schema2.products p ON u.id = p.id; -- Assuming some relation for demonstration

-- 3. Demonstration view combining users and orders
CREATE VIEW users_orders AS
SELECT
    u.id as user_id,
    u.name,
    u.email,
    o.order_id,
    o.product_id,
    o.quantity
FROM schema1.users u
         JOIN schema3.orders o ON u.id = o.order_id; -- Assuming some relation for demonstration
