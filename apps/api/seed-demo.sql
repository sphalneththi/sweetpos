--
-- PostgreSQL database dump
--


-- Dumped from database version 16.14 (Debian 16.14-1.pgdg13+1)
-- Dumped by pg_dump version 16.14 (Debian 16.14-1.pgdg13+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.audit_logs (id, user_id, action, entity_type, entity_id, old_value, new_value, ip_address, terminal_id, created_at) VALUES ('213abd05-0092-4d85-971c-fc66a5123393', '6813586f-cc61-4820-b1b4-599ba04ca99a', 'login_failed', 'user', '6813586f-cc61-4820-b1b4-599ba04ca99a', NULL, NULL, '127.0.0.1', NULL, '2026-06-21 07:51:12.058126+00');
INSERT INTO public.audit_logs (id, user_id, action, entity_type, entity_id, old_value, new_value, ip_address, terminal_id, created_at) VALUES ('aa54f7a8-7d11-4024-9f56-271c7d18a4b2', '6813586f-cc61-4820-b1b4-599ba04ca99a', 'login', 'user', '6813586f-cc61-4820-b1b4-599ba04ca99a', NULL, NULL, '127.0.0.1', NULL, '2026-06-21 07:52:27.356809+00');
INSERT INTO public.audit_logs (id, user_id, action, entity_type, entity_id, old_value, new_value, ip_address, terminal_id, created_at) VALUES ('da7232e7-e519-486d-b336-927b46700c7c', '6813586f-cc61-4820-b1b4-599ba04ca99a', 'login', 'user', '6813586f-cc61-4820-b1b4-599ba04ca99a', NULL, NULL, '127.0.0.1', NULL, '2026-06-21 07:54:09.566226+00');
INSERT INTO public.audit_logs (id, user_id, action, entity_type, entity_id, old_value, new_value, ip_address, terminal_id, created_at) VALUES ('2be99eb8-df5f-492f-8793-a0472739d616', '6813586f-cc61-4820-b1b4-599ba04ca99a', 'login', 'user', '6813586f-cc61-4820-b1b4-599ba04ca99a', NULL, NULL, '127.0.0.1', NULL, '2026-06-21 08:23:18.821477+00');
INSERT INTO public.audit_logs (id, user_id, action, entity_type, entity_id, old_value, new_value, ip_address, terminal_id, created_at) VALUES ('5e6ba679-7f47-4c64-9a29-b4a3cd1cf2d8', '6813586f-cc61-4820-b1b4-599ba04ca99a', 'login', 'user', '6813586f-cc61-4820-b1b4-599ba04ca99a', NULL, NULL, '127.0.0.1', NULL, '2026-06-21 08:38:12.422153+00');
INSERT INTO public.audit_logs (id, user_id, action, entity_type, entity_id, old_value, new_value, ip_address, terminal_id, created_at) VALUES ('46300dd2-7692-4606-8762-f942d5d2d819', '6813586f-cc61-4820-b1b4-599ba04ca99a', 'sale', 'sale', '769cc783-8767-4f41-9d7b-1291773e39f1', NULL, '{"totalAmount": 660, "invoiceNumber": "INV-20260621-0001"}', NULL, NULL, '2026-06-21 08:38:12.525194+00');
INSERT INTO public.audit_logs (id, user_id, action, entity_type, entity_id, old_value, new_value, ip_address, terminal_id, created_at) VALUES ('444e4743-a3f4-4970-b5ec-bc0605071142', '6813586f-cc61-4820-b1b4-599ba04ca99a', 'login', 'user', '6813586f-cc61-4820-b1b4-599ba04ca99a', NULL, NULL, '127.0.0.1', NULL, '2026-06-21 08:38:42.348514+00');
INSERT INTO public.audit_logs (id, user_id, action, entity_type, entity_id, old_value, new_value, ip_address, terminal_id, created_at) VALUES ('16074b1a-86eb-4897-918e-07465fb40350', '6813586f-cc61-4820-b1b4-599ba04ca99a', 'login', 'user', '6813586f-cc61-4820-b1b4-599ba04ca99a', NULL, NULL, '127.0.0.1', NULL, '2026-06-21 08:43:00.669083+00');
INSERT INTO public.audit_logs (id, user_id, action, entity_type, entity_id, old_value, new_value, ip_address, terminal_id, created_at) VALUES ('45677853-3b75-4a16-9d2d-5f5e158fef68', '6813586f-cc61-4820-b1b4-599ba04ca99a', 'sale', 'sale', '9f7dd826-0f2f-42cb-95b8-8de81815ae7b', NULL, '{"totalAmount": 660, "invoiceNumber": "INV-20260621-0001"}', NULL, NULL, '2026-06-21 08:43:00.785801+00');
INSERT INTO public.audit_logs (id, user_id, action, entity_type, entity_id, old_value, new_value, ip_address, terminal_id, created_at) VALUES ('d296f504-0ee4-4f5d-bca9-4bea34456bc1', '6813586f-cc61-4820-b1b4-599ba04ca99a', 'login', 'user', '6813586f-cc61-4820-b1b4-599ba04ca99a', NULL, NULL, '127.0.0.1', NULL, '2026-06-21 08:45:53.181345+00');
INSERT INTO public.audit_logs (id, user_id, action, entity_type, entity_id, old_value, new_value, ip_address, terminal_id, created_at) VALUES ('f83341a9-21ad-456f-8080-9688e949c414', '6813586f-cc61-4820-b1b4-599ba04ca99a', 'sale', 'sale', '4661c6f1-34ed-4fb6-988d-8b6c552c39fe', NULL, '{"totalAmount": 660, "invoiceNumber": "INV-20260621-0001"}', NULL, NULL, '2026-06-21 08:45:53.276081+00');
INSERT INTO public.audit_logs (id, user_id, action, entity_type, entity_id, old_value, new_value, ip_address, terminal_id, created_at) VALUES ('f9d0c17b-b35d-46a3-add6-c173a7ce0f07', '6813586f-cc61-4820-b1b4-599ba04ca99a', 'login', 'user', '6813586f-cc61-4820-b1b4-599ba04ca99a', NULL, NULL, '127.0.0.1', NULL, '2026-06-21 08:46:28.235419+00');
INSERT INTO public.audit_logs (id, user_id, action, entity_type, entity_id, old_value, new_value, ip_address, terminal_id, created_at) VALUES ('7ffb40fa-37f5-4df9-9b16-91236a50ea02', '6813586f-cc61-4820-b1b4-599ba04ca99a', 'login', 'user', '6813586f-cc61-4820-b1b4-599ba04ca99a', NULL, NULL, '127.0.0.1', NULL, '2026-06-21 08:46:47.865757+00');
INSERT INTO public.audit_logs (id, user_id, action, entity_type, entity_id, old_value, new_value, ip_address, terminal_id, created_at) VALUES ('5baf2cad-46ed-4325-9e17-976bdfe489f1', '6813586f-cc61-4820-b1b4-599ba04ca99a', 'login', 'user', '6813586f-cc61-4820-b1b4-599ba04ca99a', NULL, NULL, '127.0.0.1', NULL, '2026-06-21 08:49:07.002174+00');
INSERT INTO public.audit_logs (id, user_id, action, entity_type, entity_id, old_value, new_value, ip_address, terminal_id, created_at) VALUES ('67eb483c-0883-4f03-a65b-b2136eaba0e8', '6813586f-cc61-4820-b1b4-599ba04ca99a', 'login', 'user', '6813586f-cc61-4820-b1b4-599ba04ca99a', NULL, NULL, '127.0.0.1', NULL, '2026-06-21 08:49:26.169872+00');
INSERT INTO public.audit_logs (id, user_id, action, entity_type, entity_id, old_value, new_value, ip_address, terminal_id, created_at) VALUES ('f0421eba-1cc7-4bc8-8a8b-d25ecfaba979', '6813586f-cc61-4820-b1b4-599ba04ca99a', 'login', 'user', '6813586f-cc61-4820-b1b4-599ba04ca99a', NULL, NULL, '127.0.0.1', NULL, '2026-06-21 08:50:29.278695+00');
INSERT INTO public.audit_logs (id, user_id, action, entity_type, entity_id, old_value, new_value, ip_address, terminal_id, created_at) VALUES ('d6b35484-2da8-464c-9385-7c4ebabd2767', '6813586f-cc61-4820-b1b4-599ba04ca99a', 'login', 'user', '6813586f-cc61-4820-b1b4-599ba04ca99a', NULL, NULL, '127.0.0.1', NULL, '2026-06-21 09:24:12.439674+00');
INSERT INTO public.audit_logs (id, user_id, action, entity_type, entity_id, old_value, new_value, ip_address, terminal_id, created_at) VALUES ('79d09643-af8b-459e-b6fc-2c6b31c92bd5', '6813586f-cc61-4820-b1b4-599ba04ca99a', 'sale', 'sale', '7fdaa9ad-3089-44e5-bb86-ace562280003', NULL, '{"totalAmount": 1260, "invoiceNumber": "INV-20260621-0002"}', NULL, NULL, '2026-06-21 09:33:14.192204+00');
INSERT INTO public.audit_logs (id, user_id, action, entity_type, entity_id, old_value, new_value, ip_address, terminal_id, created_at) VALUES ('73f6cfef-0f40-4f38-a31f-a1cefbf09f52', '6813586f-cc61-4820-b1b4-599ba04ca99a', 'login', 'user', '6813586f-cc61-4820-b1b4-599ba04ca99a', NULL, NULL, '127.0.0.1', NULL, '2026-06-21 09:57:09.360318+00');
INSERT INTO public.audit_logs (id, user_id, action, entity_type, entity_id, old_value, new_value, ip_address, terminal_id, created_at) VALUES ('08dc80c6-b393-43a2-a45f-0f5da4549ff1', '6813586f-cc61-4820-b1b4-599ba04ca99a', 'create', 'product', 'c4ae32a8-9a8e-40c4-bd75-1c290e71309b', NULL, '{"name": "Test Product", "costPrice": 200, "sellingPrice": 500}', NULL, NULL, '2026-06-21 09:57:09.402086+00');
INSERT INTO public.audit_logs (id, user_id, action, entity_type, entity_id, old_value, new_value, ip_address, terminal_id, created_at) VALUES ('e98c6023-de14-4975-9806-e3f7c0c65f00', '6813586f-cc61-4820-b1b4-599ba04ca99a', 'login', 'user', '6813586f-cc61-4820-b1b4-599ba04ca99a', NULL, NULL, '127.0.0.1', NULL, '2026-06-21 09:59:30.181123+00');
INSERT INTO public.audit_logs (id, user_id, action, entity_type, entity_id, old_value, new_value, ip_address, terminal_id, created_at) VALUES ('478d6edc-7ff8-4aee-ba7c-d36d878aec1b', '6813586f-cc61-4820-b1b4-599ba04ca99a', 'create', 'product', 'd7b68945-3753-4ae4-a45a-85afdb618e29', NULL, '{"name": "sadaru pahanthira", "costPrice": 40, "sellingPrice": 50}', NULL, NULL, '2026-06-21 10:01:13.110526+00');
INSERT INTO public.audit_logs (id, user_id, action, entity_type, entity_id, old_value, new_value, ip_address, terminal_id, created_at) VALUES ('04262fb2-b929-4570-a9c9-bb0c90e2323a', '6813586f-cc61-4820-b1b4-599ba04ca99a', 'sale', 'sale', 'b752b611-243c-4d36-893e-3098e640c2b3', NULL, '{"totalAmount": 150, "invoiceNumber": "INV-20260621-0003"}', NULL, NULL, '2026-06-21 10:09:36.601482+00');


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.categories (id, name, description, color, icon, sort_order, is_active, created_at, updated_at, deleted_at) VALUES ('11121cf3-2e51-42a9-8a5b-db07c12fb8ec', 'Cakes', 'Fresh baked cakes', '#e85d75', '????', 1, true, '2026-06-21 08:22:32.961865+00', '2026-06-21 08:22:32.961865+00', NULL);
INSERT INTO public.categories (id, name, description, color, icon, sort_order, is_active, created_at, updated_at, deleted_at) VALUES ('731f2b60-2984-41bb-a436-a512271bdfb8', 'Pastries', 'Croissants, muffins, puffs', '#ffc048', '????', 2, true, '2026-06-21 08:22:32.961865+00', '2026-06-21 08:22:32.961865+00', NULL);
INSERT INTO public.categories (id, name, description, color, icon, sort_order, is_active, created_at, updated_at, deleted_at) VALUES ('347543c6-aae6-4f11-9bbd-291c2a246dc4', 'Cookies', 'Handmade cookies', '#6c5ce7', '????', 3, true, '2026-06-21 08:22:32.961865+00', '2026-06-21 08:22:32.961865+00', NULL);
INSERT INTO public.categories (id, name, description, color, icon, sort_order, is_active, created_at, updated_at, deleted_at) VALUES ('6be84585-9283-4a5b-909e-ee4ed1b3a04d', 'Drinks', 'Hot and cold beverages', '#29b6f6', '???', 4, true, '2026-06-21 08:22:32.961865+00', '2026-06-21 08:22:32.961865+00', NULL);
INSERT INTO public.categories (id, name, description, color, icon, sort_order, is_active, created_at, updated_at, deleted_at) VALUES ('58fcd2c1-71a4-4eb6-918c-fdd9c2f1a492', 'Ice Cream', 'Scoops and sundaes', '#00c853', '????', 5, true, '2026-06-21 08:22:32.961865+00', '2026-06-21 08:22:32.961865+00', NULL);


--
-- Data for Name: customers; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.customers (id, name, phone, email, address, loyalty_points, total_spent, visit_count, last_visit, is_active, created_at, updated_at, deleted_at) VALUES ('abe92d83-ca3d-4fb1-a3bd-b4e2633f8feb', 'Priya Perera', '+94771234567', 'priya@email.com', NULL, 450, 45000.00, 18, NULL, true, '2026-06-21 08:22:32.991031+00', '2026-06-21 08:22:32.991031+00', NULL);
INSERT INTO public.customers (id, name, phone, email, address, loyalty_points, total_spent, visit_count, last_visit, is_active, created_at, updated_at, deleted_at) VALUES ('b3f201f7-64ff-4274-b69b-bfcafef2418b', 'Amal Silva', '+94779876543', 'amal@email.com', NULL, 120, 12000.00, 5, NULL, true, '2026-06-21 08:22:32.991031+00', '2026-06-21 08:22:32.991031+00', NULL);
INSERT INTO public.customers (id, name, phone, email, address, loyalty_points, total_spent, visit_count, last_visit, is_active, created_at, updated_at, deleted_at) VALUES ('f60bb87a-1060-4d11-a6c9-528827c6a79e', 'Nadeesha Fernando', '+94712345678', NULL, NULL, 780, 78000.00, 32, NULL, true, '2026-06-21 08:22:32.991031+00', '2026-06-21 08:22:32.991031+00', NULL);
INSERT INTO public.customers (id, name, phone, email, address, loyalty_points, total_spent, visit_count, last_visit, is_active, created_at, updated_at, deleted_at) VALUES ('9d7a2cba-a54b-4cd1-8358-13636bc10ab9', 'Kasun Jayawardena', '+94723456789', 'kasun@email.com', NULL, 50, 5000.00, 2, NULL, true, '2026-06-21 08:22:32.991031+00', '2026-06-21 08:22:32.991031+00', NULL);


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.products (id, barcode, sku, name, description, category_id, selling_price, cost_price, stock_quantity, min_stock_level, unit_type, image_url, tax_rate, is_active, created_at, updated_at, deleted_at) VALUES ('d8fa15db-0df6-4bcc-a2d6-4c54b14a915a', '1002', NULL, 'Vanilla Sponge Cake', NULL, '11121cf3-2e51-42a9-8a5b-db07c12fb8ec', 2500.00, 1000.00, 8.000, 2.000, 'piece', '????', 0.00, true, '2026-06-21 08:22:32.965852+00', '2026-06-21 08:22:32.965852+00', NULL);
INSERT INTO public.products (id, barcode, sku, name, description, category_id, selling_price, cost_price, stock_quantity, min_stock_level, unit_type, image_url, tax_rate, is_active, created_at, updated_at, deleted_at) VALUES ('e28e4270-bee7-419f-8081-83f4a735a89b', '1003', NULL, 'Red Velvet Slice', NULL, '11121cf3-2e51-42a9-8a5b-db07c12fb8ec', 450.00, 180.00, 18.000, 5.000, 'piece', '????', 0.00, true, '2026-06-21 08:22:32.965852+00', '2026-06-21 08:22:32.965852+00', NULL);
INSERT INTO public.products (id, barcode, sku, name, description, category_id, selling_price, cost_price, stock_quantity, min_stock_level, unit_type, image_url, tax_rate, is_active, created_at, updated_at, deleted_at) VALUES ('21f67552-8cf5-4bc8-a0dc-82045949c5b8', '1004', NULL, 'Cheesecake Slice', NULL, '11121cf3-2e51-42a9-8a5b-db07c12fb8ec', 550.00, 220.00, 12.000, 3.000, 'piece', '????', 0.00, true, '2026-06-21 08:22:32.965852+00', '2026-06-21 08:22:32.965852+00', NULL);
INSERT INTO public.products (id, barcode, sku, name, description, category_id, selling_price, cost_price, stock_quantity, min_stock_level, unit_type, image_url, tax_rate, is_active, created_at, updated_at, deleted_at) VALUES ('2fe870fa-639b-4838-b8ce-5e5da5a7ac62', '2002', NULL, 'Chocolate Muffin', NULL, '731f2b60-2984-41bb-a436-a512271bdfb8', 220.00, 80.00, 25.000, 10.000, 'piece', '????', 0.00, true, '2026-06-21 08:22:32.965852+00', '2026-06-21 08:22:32.965852+00', NULL);
INSERT INTO public.products (id, barcode, sku, name, description, category_id, selling_price, cost_price, stock_quantity, min_stock_level, unit_type, image_url, tax_rate, is_active, created_at, updated_at, deleted_at) VALUES ('0cc2c7ff-ba90-4d0f-82a5-ad0e1006c336', '2004', NULL, 'Cheese Puff', NULL, '731f2b60-2984-41bb-a436-a512271bdfb8', 150.00, 50.00, 40.000, 10.000, 'piece', '????', 0.00, true, '2026-06-21 08:22:32.965852+00', '2026-06-21 08:22:32.965852+00', NULL);
INSERT INTO public.products (id, barcode, sku, name, description, category_id, selling_price, cost_price, stock_quantity, min_stock_level, unit_type, image_url, tax_rate, is_active, created_at, updated_at, deleted_at) VALUES ('8008850b-f4e4-4930-9ed6-4df511b59252', '3002', NULL, 'Oat & Raisin Cookie', NULL, '347543c6-aae6-4f11-9bbd-291c2a246dc4', 260.00, 90.00, 28.000, 10.000, 'pack', '????', 0.00, true, '2026-06-21 08:22:32.965852+00', '2026-06-21 08:22:32.965852+00', NULL);
INSERT INTO public.products (id, barcode, sku, name, description, category_id, selling_price, cost_price, stock_quantity, min_stock_level, unit_type, image_url, tax_rate, is_active, created_at, updated_at, deleted_at) VALUES ('ef05e0bf-0121-4c81-a5b6-e4b65e527545', '3003', NULL, 'Macaron Box (6pc)', NULL, '347543c6-aae6-4f11-9bbd-291c2a246dc4', 850.00, 350.00, 15.000, 5.000, 'box', '????', 0.00, true, '2026-06-21 08:22:32.965852+00', '2026-06-21 08:22:32.965852+00', NULL);
INSERT INTO public.products (id, barcode, sku, name, description, category_id, selling_price, cost_price, stock_quantity, min_stock_level, unit_type, image_url, tax_rate, is_active, created_at, updated_at, deleted_at) VALUES ('e38cafd2-f316-42ab-8e69-cc03c60cf883', '4001', NULL, 'Espresso', NULL, '6be84585-9283-4a5b-909e-ee4ed1b3a04d', 350.00, 80.00, 999.000, 0.000, 'piece', '???', 0.00, true, '2026-06-21 08:22:32.965852+00', '2026-06-21 08:22:32.965852+00', NULL);
INSERT INTO public.products (id, barcode, sku, name, description, category_id, selling_price, cost_price, stock_quantity, min_stock_level, unit_type, image_url, tax_rate, is_active, created_at, updated_at, deleted_at) VALUES ('d37c6900-10ac-4e58-b67e-6758fd89b992', '4003', NULL, 'Iced Latte', NULL, '6be84585-9283-4a5b-909e-ee4ed1b3a04d', 500.00, 110.00, 999.000, 0.000, 'piece', '????', 0.00, true, '2026-06-21 08:22:32.965852+00', '2026-06-21 08:22:32.965852+00', NULL);
INSERT INTO public.products (id, barcode, sku, name, description, category_id, selling_price, cost_price, stock_quantity, min_stock_level, unit_type, image_url, tax_rate, is_active, created_at, updated_at, deleted_at) VALUES ('f48aec00-db96-4ea3-a5e5-818b52be65a1', '4004', NULL, 'Fresh Orange Juice', NULL, '6be84585-9283-4a5b-909e-ee4ed1b3a04d', 380.00, 120.00, 50.000, 10.000, 'piece', '????', 0.00, true, '2026-06-21 08:22:32.965852+00', '2026-06-21 08:22:32.965852+00', NULL);
INSERT INTO public.products (id, barcode, sku, name, description, category_id, selling_price, cost_price, stock_quantity, min_stock_level, unit_type, image_url, tax_rate, is_active, created_at, updated_at, deleted_at) VALUES ('f1265802-3ffe-4371-9bce-f7d8084f399e', '4005', NULL, 'Hot Chocolate', NULL, '6be84585-9283-4a5b-909e-ee4ed1b3a04d', 420.00, 100.00, 999.000, 0.000, 'piece', '????', 0.00, true, '2026-06-21 08:22:32.965852+00', '2026-06-21 08:22:32.965852+00', NULL);
INSERT INTO public.products (id, barcode, sku, name, description, category_id, selling_price, cost_price, stock_quantity, min_stock_level, unit_type, image_url, tax_rate, is_active, created_at, updated_at, deleted_at) VALUES ('c3eb2da2-7f1a-438d-bf9e-566e0cd9eb19', '5001', NULL, 'Vanilla Scoop', NULL, '58fcd2c1-71a4-4eb6-918c-fdd9c2f1a492', 250.00, 80.00, 60.000, 10.000, 'piece', '????', 0.00, true, '2026-06-21 08:22:32.965852+00', '2026-06-21 08:22:32.965852+00', NULL);
INSERT INTO public.products (id, barcode, sku, name, description, category_id, selling_price, cost_price, stock_quantity, min_stock_level, unit_type, image_url, tax_rate, is_active, created_at, updated_at, deleted_at) VALUES ('d1d4593b-862c-4b44-9866-519dc66f3f49', '5002', NULL, 'Chocolate Scoop', NULL, '58fcd2c1-71a4-4eb6-918c-fdd9c2f1a492', 250.00, 80.00, 55.000, 10.000, 'piece', '????', 0.00, true, '2026-06-21 08:22:32.965852+00', '2026-06-21 08:22:32.965852+00', NULL);
INSERT INTO public.products (id, barcode, sku, name, description, category_id, selling_price, cost_price, stock_quantity, min_stock_level, unit_type, image_url, tax_rate, is_active, created_at, updated_at, deleted_at) VALUES ('6d15dea4-d07b-4e29-b92c-8a5b9400e066', '5003', NULL, 'Strawberry Sundae', NULL, '58fcd2c1-71a4-4eb6-918c-fdd9c2f1a492', 480.00, 160.00, 30.000, 8.000, 'piece', '????', 0.00, true, '2026-06-21 08:22:32.965852+00', '2026-06-21 08:22:32.965852+00', NULL);
INSERT INTO public.products (id, barcode, sku, name, description, category_id, selling_price, cost_price, stock_quantity, min_stock_level, unit_type, image_url, tax_rate, is_active, created_at, updated_at, deleted_at) VALUES ('819be8b2-f079-47ad-a2b2-bed398f64565', '5004', NULL, 'Mixed Fruit Scoop', NULL, '58fcd2c1-71a4-4eb6-918c-fdd9c2f1a492', 320.00, 100.00, 40.000, 10.000, 'piece', '????', 0.00, true, '2026-06-21 08:22:32.965852+00', '2026-06-21 08:22:32.965852+00', NULL);
INSERT INTO public.products (id, barcode, sku, name, description, category_id, selling_price, cost_price, stock_quantity, min_stock_level, unit_type, image_url, tax_rate, is_active, created_at, updated_at, deleted_at) VALUES ('26cf0e56-a641-4ef0-ba3f-8de566d7a971', '2003', NULL, 'Blueberry Muffin', NULL, '731f2b60-2984-41bb-a436-a512271bdfb8', 240.00, 90.00, 68.000, 8.000, 'piece', '????', 0.00, true, '2026-06-21 08:22:32.965852+00', '2026-06-21 08:46:47.905816+00', NULL);
INSERT INTO public.products (id, barcode, sku, name, description, category_id, selling_price, cost_price, stock_quantity, min_stock_level, unit_type, image_url, tax_rate, is_active, created_at, updated_at, deleted_at) VALUES ('02c9cd3c-e865-47f7-b5c5-fddfcf5a6083', '2001', NULL, 'Butter Croissant', NULL, '731f2b60-2984-41bb-a436-a512271bdfb8', 180.00, 60.00, 28.000, 10.000, 'piece', '????', 0.00, true, '2026-06-21 08:22:32.965852+00', '2026-06-21 09:33:14.084432+00', NULL);
INSERT INTO public.products (id, barcode, sku, name, description, category_id, selling_price, cost_price, stock_quantity, min_stock_level, unit_type, image_url, tax_rate, is_active, created_at, updated_at, deleted_at) VALUES ('b4944fa7-fbfd-43bb-ac89-ba79cb3c7683', '4002', NULL, 'Cappuccino', NULL, '6be84585-9283-4a5b-909e-ee4ed1b3a04d', 450.00, 100.00, 998.000, 0.000, 'piece', '???', 0.00, true, '2026-06-21 08:22:32.965852+00', '2026-06-21 09:33:14.084432+00', NULL);
INSERT INTO public.products (id, barcode, sku, name, description, category_id, selling_price, cost_price, stock_quantity, min_stock_level, unit_type, image_url, tax_rate, is_active, created_at, updated_at, deleted_at) VALUES ('147b73e8-d46f-4f01-ac82-c037f5078d3d', '1001', NULL, 'Chocolate Cake (Slice)', NULL, '11121cf3-2e51-42a9-8a5b-db07c12fb8ec', 350.00, 150.00, 23.000, 5.000, 'piece', '????', 0.00, true, '2026-06-21 08:22:32.965852+00', '2026-06-21 09:33:14.084432+00', NULL);
INSERT INTO public.products (id, barcode, sku, name, description, category_id, selling_price, cost_price, stock_quantity, min_stock_level, unit_type, image_url, tax_rate, is_active, created_at, updated_at, deleted_at) VALUES ('2030f363-f69e-482a-b240-e567439caadd', '3001', NULL, 'Choco Chip Cookie (3pk)', NULL, '347543c6-aae6-4f11-9bbd-291c2a246dc4', 280.00, 100.00, 34.000, 10.000, 'pack', '????', 0.00, true, '2026-06-21 08:22:32.965852+00', '2026-06-21 09:33:14.084432+00', NULL);
INSERT INTO public.products (id, barcode, sku, name, description, category_id, selling_price, cost_price, stock_quantity, min_stock_level, unit_type, image_url, tax_rate, is_active, created_at, updated_at, deleted_at) VALUES ('c4ae32a8-9a8e-40c4-bd75-1c290e71309b', NULL, NULL, 'Test Product', NULL, NULL, 500.00, 200.00, 10.000, 2.000, 'piece', NULL, 0.00, true, '2026-06-21 09:57:09.393407+00', '2026-06-21 09:57:09.393407+00', NULL);
INSERT INTO public.products (id, barcode, sku, name, description, category_id, selling_price, cost_price, stock_quantity, min_stock_level, unit_type, image_url, tax_rate, is_active, created_at, updated_at, deleted_at) VALUES ('d7b68945-3753-4ae4-a45a-85afdb618e29', '1980819039301', '123', 'sadaru pahanthira', NULL, NULL, 50.00, 40.00, 47.000, 9.000, 'piece', NULL, 0.00, true, '2026-06-21 10:01:13.097409+00', '2026-06-21 10:09:36.544152+00', NULL);


--
-- Data for Name: suppliers; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.users (id, username, email, password_hash, full_name, role, is_active, last_login, login_attempts, locked_until, created_at, updated_at, deleted_at) VALUES ('d62b99bf-e29d-4264-a707-c1833713ab2e', 'cashier', 'cashier@sweetpos.com', '$2b$12$X6qULbYPi8MC6eVCp4Np4OYxFn5.6nXYMTbvj99EasFbnLH0n2642', 'Demo Cashier', 'cashier', true, NULL, 0, NULL, '2026-06-21 08:22:32.994457+00', '2026-06-21 08:22:32.994457+00', NULL);
INSERT INTO public.users (id, username, email, password_hash, full_name, role, is_active, last_login, login_attempts, locked_until, created_at, updated_at, deleted_at) VALUES ('6813586f-cc61-4820-b1b4-599ba04ca99a', 'admin', 'admin@sweetpos.com', '$2b$12$X6qULbYPi8MC6eVCp4Np4OYxFn5.6nXYMTbvj99EasFbnLH0n2642', 'Administrator', 'admin', true, '2026-06-21 09:59:30.065+00', 0, NULL, '2026-06-21 07:50:57.972704+00', '2026-06-21 09:59:30.070053+00', NULL);


--
-- Data for Name: inventory_movements; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.inventory_movements (id, product_id, movement_type, quantity, previous_stock, new_stock, unit_cost, reference_id, reference_type, supplier_id, notes, created_by, created_at) VALUES ('1e1256df-854e-48d8-be2a-5015fb997ec7', '26cf0e56-a641-4ef0-ba3f-8de566d7a971', 'stock_in', 50.000, 18.000, 68.000, 120.00, NULL, NULL, NULL, 'Restock delivery', '6813586f-cc61-4820-b1b4-599ba04ca99a', '2026-06-21 08:46:47.909489+00');


--
-- Data for Name: sales; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.sales (id, terminal_id, cashier_id, customer_id, subtotal, discount_amount, discount_type, discount_value, tax_amount, total_amount, cash_received, change_amount, loyalty_earned, loyalty_redeemed, status, notes, created_at, updated_at, invoice_number, payment_method) VALUES ('4661c6f1-34ed-4fb6-988d-8b6c552c39fe', 'WEB-01', '6813586f-cc61-4820-b1b4-599ba04ca99a', NULL, 660.00, 0.00, NULL, 0.00, 0.00, 660.00, 5000.00, 4340.00, 6, 0, 'completed', NULL, '2026-06-21 08:45:53.226563+00', '2026-06-21 08:45:53.226563+00', 'INV-20260621-0001', 'cash');
INSERT INTO public.sales (id, terminal_id, cashier_id, customer_id, subtotal, discount_amount, discount_type, discount_value, tax_amount, total_amount, cash_received, change_amount, loyalty_earned, loyalty_redeemed, status, notes, created_at, updated_at, invoice_number, payment_method) VALUES ('7fdaa9ad-3089-44e5-bb86-ace562280003', 'WEB-01', '6813586f-cc61-4820-b1b4-599ba04ca99a', NULL, 1260.00, 0.00, NULL, 0.00, 0.00, 1260.00, 5000.00, 3740.00, 12, 0, 'completed', NULL, '2026-06-21 09:33:14.084432+00', '2026-06-21 09:33:14.084432+00', 'INV-20260621-0002', 'cash');
INSERT INTO public.sales (id, terminal_id, cashier_id, customer_id, subtotal, discount_amount, discount_type, discount_value, tax_amount, total_amount, cash_received, change_amount, loyalty_earned, loyalty_redeemed, status, notes, created_at, updated_at, invoice_number, payment_method) VALUES ('b752b611-243c-4d36-893e-3098e640c2b3', 'WEB-01', '6813586f-cc61-4820-b1b4-599ba04ca99a', NULL, 150.00, 0.00, NULL, 0.00, 0.00, 150.00, 500.00, 350.00, 1, 0, 'completed', NULL, '2026-06-21 10:09:36.544152+00', '2026-06-21 10:09:36.544152+00', 'INV-20260621-0003', 'cash');


--
-- Data for Name: sale_items; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.sale_items (id, sale_id, product_id, product_name, product_barcode, quantity, unit_price, cost_price, discount_amount, tax_amount, total_price, created_at) VALUES ('eead230e-6860-4bfe-9615-6e7bf02fa38f', '4661c6f1-34ed-4fb6-988d-8b6c552c39fe', '26cf0e56-a641-4ef0-ba3f-8de566d7a971', 'Blueberry Muffin', '2003', 2.000, 240.00, 90.00, 0.00, 0.00, 480.00, '2026-06-21 08:45:53.226563+00');
INSERT INTO public.sale_items (id, sale_id, product_id, product_name, product_barcode, quantity, unit_price, cost_price, discount_amount, tax_amount, total_price, created_at) VALUES ('3e429c90-238b-4c68-bc23-fc24aa6d5fd2', '4661c6f1-34ed-4fb6-988d-8b6c552c39fe', '02c9cd3c-e865-47f7-b5c5-fddfcf5a6083', 'Butter Croissant', '2001', 1.000, 180.00, 60.00, 0.00, 0.00, 180.00, '2026-06-21 08:45:53.226563+00');
INSERT INTO public.sale_items (id, sale_id, product_id, product_name, product_barcode, quantity, unit_price, cost_price, discount_amount, tax_amount, total_price, created_at) VALUES ('fc254900-569a-4679-bde9-5f4ea00f3213', '7fdaa9ad-3089-44e5-bb86-ace562280003', '02c9cd3c-e865-47f7-b5c5-fddfcf5a6083', 'Butter Croissant', '2001', 1.000, 180.00, 60.00, 0.00, 0.00, 180.00, '2026-06-21 09:33:14.084432+00');
INSERT INTO public.sale_items (id, sale_id, product_id, product_name, product_barcode, quantity, unit_price, cost_price, discount_amount, tax_amount, total_price, created_at) VALUES ('0a87c29a-bef5-4e3e-9264-a9b806f1c8c9', '7fdaa9ad-3089-44e5-bb86-ace562280003', 'b4944fa7-fbfd-43bb-ac89-ba79cb3c7683', 'Cappuccino', '4002', 1.000, 450.00, 100.00, 0.00, 0.00, 450.00, '2026-06-21 09:33:14.084432+00');
INSERT INTO public.sale_items (id, sale_id, product_id, product_name, product_barcode, quantity, unit_price, cost_price, discount_amount, tax_amount, total_price, created_at) VALUES ('5cb5a6b5-1aa9-49d4-8d6a-33339b6f4366', '7fdaa9ad-3089-44e5-bb86-ace562280003', '147b73e8-d46f-4f01-ac82-c037f5078d3d', 'Chocolate Cake (Slice)', '1001', 1.000, 350.00, 150.00, 0.00, 0.00, 350.00, '2026-06-21 09:33:14.084432+00');
INSERT INTO public.sale_items (id, sale_id, product_id, product_name, product_barcode, quantity, unit_price, cost_price, discount_amount, tax_amount, total_price, created_at) VALUES ('65c81527-6b6c-486f-a413-765a0e4aa256', '7fdaa9ad-3089-44e5-bb86-ace562280003', '2030f363-f69e-482a-b240-e567439caadd', 'Choco Chip Cookie (3pk)', '3001', 1.000, 280.00, 100.00, 0.00, 0.00, 280.00, '2026-06-21 09:33:14.084432+00');
INSERT INTO public.sale_items (id, sale_id, product_id, product_name, product_barcode, quantity, unit_price, cost_price, discount_amount, tax_amount, total_price, created_at) VALUES ('e963d56f-4745-4955-af5f-39cbd0e8d7a1', 'b752b611-243c-4d36-893e-3098e640c2b3', 'd7b68945-3753-4ae4-a45a-85afdb618e29', 'sadaru pahanthira', '1980819039301', 3.000, 50.00, 40.00, 0.00, 0.00, 150.00, '2026-06-21 10:09:36.544152+00');


--
-- PostgreSQL database dump complete
--

\unrestrict 3H0QlwP58XL9JIMx7jPlUhaAwyjDp9wZKFzaX1Xb1MA9Db73B2PRfYKBiime42K

