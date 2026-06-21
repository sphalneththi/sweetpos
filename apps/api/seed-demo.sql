-- Categories
INSERT INTO categories (id, name, description, color, icon, sort_order, is_active, created_at, updated_at)
VALUES
  (gen_random_uuid(), 'Cakes', 'Fresh baked cakes', '#e85d75', '🎂', 1, true, NOW(), NOW()),
  (gen_random_uuid(), 'Pastries', 'Croissants, muffins, puffs', '#ffc048', '🥐', 2, true, NOW(), NOW()),
  (gen_random_uuid(), 'Cookies', 'Handmade cookies', '#6c5ce7', '🍪', 3, true, NOW(), NOW()),
  (gen_random_uuid(), 'Drinks', 'Hot and cold beverages', '#29b6f6', '☕', 4, true, NOW(), NOW()),
  (gen_random_uuid(), 'Ice Cream', 'Scoops and sundaes', '#00c853', '🍦', 5, true, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Products
DO $$
DECLARE
  cake_id UUID := (SELECT id FROM categories WHERE name = 'Cakes' LIMIT 1);
  pastry_id UUID := (SELECT id FROM categories WHERE name = 'Pastries' LIMIT 1);
  cookie_id UUID := (SELECT id FROM categories WHERE name = 'Cookies' LIMIT 1);
  drink_id UUID := (SELECT id FROM categories WHERE name = 'Drinks' LIMIT 1);
  ice_id UUID := (SELECT id FROM categories WHERE name = 'Ice Cream' LIMIT 1);
BEGIN
  INSERT INTO products (id, name, barcode, category_id, selling_price, cost_price, stock_quantity, min_stock_level, unit_type, image_url, tax_rate, is_active, created_at, updated_at)
  VALUES
    (gen_random_uuid(), 'Chocolate Cake (Slice)', '1001', cake_id, 350, 150, 24, 5, 'piece', '🎂', 0, true, NOW(), NOW()),
    (gen_random_uuid(), 'Vanilla Sponge Cake', '1002', cake_id, 2500, 1000, 8, 2, 'piece', '🍰', 0, true, NOW(), NOW()),
    (gen_random_uuid(), 'Red Velvet Slice', '1003', cake_id, 450, 180, 18, 5, 'piece', '🎂', 0, true, NOW(), NOW()),
    (gen_random_uuid(), 'Cheesecake Slice', '1004', cake_id, 550, 220, 12, 3, 'piece', '🍮', 0, true, NOW(), NOW()),
    (gen_random_uuid(), 'Butter Croissant', '2001', pastry_id, 180, 60, 30, 10, 'piece', '🥐', 0, true, NOW(), NOW()),
    (gen_random_uuid(), 'Chocolate Muffin', '2002', pastry_id, 220, 80, 25, 10, 'piece', '🧁', 0, true, NOW(), NOW()),
    (gen_random_uuid(), 'Blueberry Muffin', '2003', pastry_id, 240, 90, 20, 8, 'piece', '🧁', 0, true, NOW(), NOW()),
    (gen_random_uuid(), 'Cheese Puff', '2004', pastry_id, 150, 50, 40, 10, 'piece', '🥐', 0, true, NOW(), NOW()),
    (gen_random_uuid(), 'Choco Chip Cookie (3pk)', '3001', cookie_id, 280, 100, 35, 10, 'pack', '🍪', 0, true, NOW(), NOW()),
    (gen_random_uuid(), 'Oat & Raisin Cookie', '3002', cookie_id, 260, 90, 28, 10, 'pack', '🍪', 0, true, NOW(), NOW()),
    (gen_random_uuid(), 'Macaron Box (6pc)', '3003', cookie_id, 850, 350, 15, 5, 'box', '🍬', 0, true, NOW(), NOW()),
    (gen_random_uuid(), 'Espresso', '4001', drink_id, 350, 80, 999, 0, 'piece', '☕', 0, true, NOW(), NOW()),
    (gen_random_uuid(), 'Cappuccino', '4002', drink_id, 450, 100, 999, 0, 'piece', '☕', 0, true, NOW(), NOW()),
    (gen_random_uuid(), 'Iced Latte', '4003', drink_id, 500, 110, 999, 0, 'piece', '🧋', 0, true, NOW(), NOW()),
    (gen_random_uuid(), 'Fresh Orange Juice', '4004', drink_id, 380, 120, 50, 10, 'piece', '🍊', 0, true, NOW(), NOW()),
    (gen_random_uuid(), 'Hot Chocolate', '4005', drink_id, 420, 100, 999, 0, 'piece', '🍫', 0, true, NOW(), NOW()),
    (gen_random_uuid(), 'Vanilla Scoop', '5001', ice_id, 250, 80, 60, 10, 'piece', '🍦', 0, true, NOW(), NOW()),
    (gen_random_uuid(), 'Chocolate Scoop', '5002', ice_id, 250, 80, 55, 10, 'piece', '🍫', 0, true, NOW(), NOW()),
    (gen_random_uuid(), 'Strawberry Sundae', '5003', ice_id, 480, 160, 30, 8, 'piece', '🍓', 0, true, NOW(), NOW()),
    (gen_random_uuid(), 'Mixed Fruit Scoop', '5004', ice_id, 320, 100, 40, 10, 'piece', '🍧', 0, true, NOW(), NOW())
  ON CONFLICT (barcode) DO NOTHING;
END $$;

-- Demo Customers
INSERT INTO customers (id, name, phone, email, loyalty_points, total_spent, visit_count, is_active, created_at, updated_at)
VALUES
  (gen_random_uuid(), 'Priya Perera', '+94771234567', 'priya@email.com', 450, 45000, 18, true, NOW(), NOW()),
  (gen_random_uuid(), 'Amal Silva', '+94779876543', 'amal@email.com', 120, 12000, 5, true, NOW(), NOW()),
  (gen_random_uuid(), 'Nadeesha Fernando', '+94712345678', NULL, 780, 78000, 32, true, NOW(), NOW()),
  (gen_random_uuid(), 'Kasun Jayawardena', '+94723456789', 'kasun@email.com', 50, 5000, 2, true, NOW(), NOW())
ON CONFLICT (phone) DO NOTHING;

-- Cashier user
INSERT INTO users (id, username, email, password_hash, full_name, role, is_active, login_attempts, created_at, updated_at)
VALUES (gen_random_uuid(), 'cashier', 'cashier@sweetpos.com', '$2b$12$X6qULbYPi8MC6eVCp4Np4OYxFn5.6nXYMTbvj99EasFbnLH0n2642', 'Demo Cashier', 'cashier', true, 0, NOW(), NOW())
ON CONFLICT (username) DO NOTHING;
