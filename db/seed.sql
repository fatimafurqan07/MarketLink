-- =====================================================================
-- MarketLink (Theme: eGreen Basket) - Database Seed Script
-- Realistic, Production-Ready Demo Data
-- 2 Markets, 3 Farmers (with physical stalls), 12 Pure Farm Products, 2 Pre-orders
-- =====================================================================

USE `marketlink_db`;

-- Clear existing data
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE `reviews`;
TRUNCATE TABLE `order_items`;
TRUNCATE TABLE `orders`;
TRUNCATE TABLE `products`;
TRUNCATE TABLE `farmer_profiles`;
TRUNCATE TABLE `markets`;
TRUNCATE TABLE `users`;
SET FOREIGN_KEY_CHECKS = 1;

-- ---------------------------------------------------------------------
-- 1. USERS SEED
-- Passwords hashed (demo standard: 'Pass@1234')
-- ---------------------------------------------------------------------
INSERT INTO `users` (`id`, `name`, `email`, `password_hash`, `role`, `phone`, `organization`, `avatar_url`) VALUES
(1, 'Zavi', 'zavimalik23@gmail.com', '$2a$10$w3U6Y047aM7F7U4G.J6H1.eW1uA8A.L0R7J/Y0J4K6.M8N0O1P2Q3', 'admin', '+92 300 0000000', 'MarketLink Support Board', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80'),
(2, 'Ahsan', 'ahsan@marketlink.com', '$2a$10$w3U6Y047aM7F7U4G.J6H1.eW1uA8A.L0R7J/Y0J4K6.M8N0O1P2Q3', 'farmer', '+92 321 2222222', 'Ahsan Organic Green Farms', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80'),
(3, 'Fatima', 'fatima@marketlink.com', '$2a$10$w3U6Y047aM7F7U4G.J6H1.eW1uA8A.L0R7J/Y0J4K6.M8N0O1P2Q3', 'customer', '+92 345 0000000', 'Household Market Patron', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=250&q=80');

-- ---------------------------------------------------------------------
-- 2. MARKETS SEED (2 Markets)
-- ---------------------------------------------------------------------
INSERT INTO `markets` (`id`, `name`, `slug`, `location_address`, `latitude`, `longitude`, `operating_days`, `opening_time`, `closing_time`, `description`, `parking_info`, `image_url`) VALUES
(1, 'Sunrise Greenmarket & Plaza', 'sunrise-greenmarket', '1240 Harborview Way, Waterfront Pavilion, Pier 4', 37.79885400, -122.39634500, 'Saturday & Sunday', '07:30:00', '13:30:00', 'Historic open-air pavilion showcasing certified organic growers, heirloom vegetable farmers, and regional honey producers. Physical stall pickup only.', 'Dedicated visitor parking in South Pier Lot. 2-hour validated spaces for pre-order pickup.', 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=800&q=80'),
(2, 'Oakridge Artisanal Valley Market', 'oakridge-valley-market', '890 Valley Oak Blvd, Community Green Park', 37.75128000, -122.41889000, 'Wednesday & Saturday', '08:00:00', '14:00:00', 'Vibrant neighborhood agro-hub nestled beneath hundred-year oaks. Dedicated express pickup lane for MarketLink pre-order customers.', 'Free street parking and bike racks along Oak Boulevard.', 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80');

-- ---------------------------------------------------------------------
-- 3. FARMER_PROFILES SEED (3 Farmers)
-- ---------------------------------------------------------------------
INSERT INTO `farmer_profiles` (`id`, `user_id`, `market_id`, `farm_name`, `stall_number`, `stall_lat`, `stall_lng`, `bio`, `farming_practices`, `cutoff_hours`, `contact_phone`, `contact_email`, `banner_image`, `rating_avg`, `is_verified`) VALUES
(1, 2, 1, 'Green Valley Organic Farm', 'Stall #A-14 (North Wing)', 37.79901000, -122.39650000, 'Family-owned certified organic grower cultivating heirloom tomatoes, baby spinach, crisp rainbow carrots, and biodynamic culinary herbs.', 'Organic Certified', 12, '+1 (555) 234-5678', 'mateo@greenvalley.farm', 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80', 4.96, 1),
(2, 3, 1, 'Sunshower Berry & Orchard', 'Stall #B-08 (East Breeze)', 37.79872000, -122.39612000, 'High-elevation orchard specializing in hand-picked blackberries, crisp Fuji apples, and Bartlett pears picked at optimal sugar sweetness.', 'Transitional Organic', 14, '+1 (555) 345-6789', 'clara@sunshowerorchards.com', 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=800&q=80', 4.89, 1),
(3, 4, 2, 'Heritage Root & Greens', 'Stall #G-22 (Oak Circle)', 37.75135000, -122.41892000, 'Pesticide-free pasture eggs, wild wildflower honey, and fresh culinary herbs cut within 4 hours of market opening for peak freshness.', 'Conventional Eco-Safe', 10, '+1 (555) 456-7890', 'jonah@heritageroot.org', 'https://images.unsplash.com/photo-1592417817098-8f3d69106093?auto=format&fit=crop&w=800&q=80', 4.92, 1);

-- ---------------------------------------------------------------------
-- 4. PRODUCTS SEED (12 Pure Agricultural Produce Items)
-- Categories: Fresh Vegetables, Orchard Fruits, Farm Fresh Dairy & Eggs, Raw Honey & Preserves, Organic Herbs
-- ---------------------------------------------------------------------
INSERT INTO `products` (`id`, `farmer_id`, `market_id`, `name`, `category`, `description`, `price_per_unit`, `unit`, `farming_type`, `harvest_date`, `stock_limit`, `in_stock`, `image_url`) VALUES
-- Farmer 1: Green Valley Organic Farm (Stall #A-14)
(1, 1, 1, 'Organic Roma Tomatoes', 'Fresh Vegetables', 'Plump, sun-ripened red Roma tomatoes harvested at morning peak. Dense flesh, low seeds, ideal for rich sauces and fresh salads.', 2.80, 'kg', 'Organic', '2026-09-22', 45, 40, 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80'),
(2, 2, 1, 'Crisp Fuji Apples', 'Orchard Fruits', 'Crisp, sweet, and extraordinarily juicy mountain Fuji apples. Grown in high-elevation mineral soils without chemical waxes.', 3.50, 'kg', 'Organic', '2026-09-21', 60, 54, 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=600&q=80'),
(3, 3, 2, 'Farm Fresh Brown Eggs', 'Farm Fresh Dairy & Eggs', 'Pasture-raised grade-A brown eggs from heritage hens roaming free on clover meadows. Deep golden yolks packed with natural lutein.', 4.50, 'dozen', 'Conventional', '2026-09-23', 30, 26, 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?auto=format&fit=crop&w=600&q=80'),
(4, 3, 2, 'Raw Wildflower Honey', 'Raw Honey & Preserves', 'Unfiltered, unheated pure raw honey harvested from apiaries placed beside mountain wildflower meadows. Rich in natural bee pollen.', 8.00, 'jar', 'Organic', '2026-09-18', 25, 22, 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=600&q=80'),
(5, 1, 1, 'Fresh Baby Spinach', 'Fresh Vegetables', 'Tender baby spinach leaves triple-washed in natural spring water. Crisp texture with sweet, iron-rich flavor.', 2.20, 'bunch', 'Organic', '2026-09-23', 50, 46, 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=600&q=80'),
(6, 1, 1, 'Organic Carrots', 'Fresh Vegetables', 'Crunchy sweet organic carrots freshly pulled from sandy loam soil. Leafy vibrant green tops attached for maximum freshness.', 2.00, 'kg', 'Organic', '2026-09-22', 40, 35, 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=600&q=80'),
(7, 1, 1, 'Sweet Italian Genovese Basil', 'Organic Herbs', 'Fragrant broadleaf Genovese basil bunches cut at sunrise. Essential for fresh pesto, tomato caprese, and pasta garnishes.', 2.50, 'bunch', 'Organic', '2026-09-23', 40, 37, 'https://images.unsplash.com/photo-1608686207856-001b95cf60ca?auto=format&fit=crop&w=600&q=80'),
(8, 2, 1, 'Plump Orchard Blackberries', 'Orchard Fruits', 'Hand-harvested dark berries bursting with deep summer sweetness. Packed in ventilated breathable pulp punnets.', 4.50, 'punnet', 'Organic', '2026-09-22', 30, 25, 'https://images.unsplash.com/photo-1563865436874-9aef32095fad?auto=format&fit=crop&w=600&q=80'),
(9, 2, 1, 'Golden Bartlett Pears', 'Orchard Fruits', 'Buttery smooth, aromatic yellow Bartlett pears ripened on the tree for delicate floral sweetness and melting texture.', 3.80, 'kg', 'Organic', '2026-09-21', 35, 31, 'https://images.unsplash.com/photo-1514756331096-242fdeb70d4a?auto=format&fit=crop&w=600&q=80'),
(10, 1, 1, 'Tuscan Lacinato Dinosaur Kale', 'Fresh Vegetables', 'Thick, crinkled dark blue-green kale leaves packed with calcium and vitamin K. Hearty and tender when massaged or braised.', 2.50, 'bunch', 'Organic', '2026-09-23', 45, 42, 'https://images.unsplash.com/photo-1524179091875-bf99a9a6fa57?auto=format&fit=crop&w=600&q=80'),
(11, 2, 1, 'Artisanal Strawberry Preserve', 'Raw Honey & Preserves', 'Small-batch preserve made solely with orchard-ripened strawberries, raw lemon juice, and pure cane sugar. Zero gelatin or pectin.', 6.50, 'jar', 'Organic', '2026-09-19', 20, 18, 'https://images.unsplash.com/photo-1568651759600-e2b2609eb12f?auto=format&fit=crop&w=600&q=80'),
(12, 3, 2, 'Fresh Rosemary & Thyme Bundle', 'Organic Herbs', 'Aromatic woody stems of fragrant culinary rosemary and wild thyme bound with natural jute twine.', 2.80, 'bunch', 'Conventional', '2026-09-23', 35, 33, 'https://images.unsplash.com/photo-1596704017254-9b121068fb31?auto=format&fit=crop&w=600&q=80');

-- ---------------------------------------------------------------------
-- 5. ORDERS SEED (2 Pre-Orders)
-- Demonstrating the Strict SRS Rules:
-- online_amount_collected = 0.00
-- PIN code for farmer at-stall checkin
-- ---------------------------------------------------------------------
INSERT INTO `orders` (`id`, `order_code`, `customer_id`, `farmer_id`, `market_id`, `pickup_date`, `pickup_timeslot`, `pickup_token`, `pickup_pin`, `order_status`, `payment_method`, `payment_status`, `online_amount_collected`, `initial_total_due`, `final_total_due`, `inspection_notes`) VALUES
(1, 'ML-7842', 5, 1, 1, '2026-09-26', '08:30 AM - 10:00 AM', 'qrp_9f81a7b8e42c0192d6e3f4581c7b89', '4921', 'ready', 'Cash On Pickup', 'pending_at_stall', 0.00, 7.80, 7.80, 'Reserved for Saturday morning harvest pickup at Stall #A-14.'),
(2, 'ML-8109', 6, 3, 2, '2026-09-26', '09:00 AM - 10:30 AM', 'qrp_3c72b1d9a54e8031f7d2e9841b5a67', '8153', 'accepted', 'Contactless Tap at Stall', 'pending_at_stall', 0.00, 12.50, 12.50, 'Ready in chilled produce basket at Stall #G-22.');

-- ---------------------------------------------------------------------
-- 6. ORDER_ITEMS SEED
-- ---------------------------------------------------------------------
INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `product_name`, `unit_price`, `unit`, `reserved_qty`, `accepted_qty`, `rejected_qty`, `rejection_note`, `subtotal`) VALUES
(1, 1, 1, 'Organic Roma Tomatoes', 2.80, 'kg', 2, 2, 0, NULL, 5.60),
(2, 1, 5, 'Fresh Baby Spinach', 2.20, 'bunch', 1, 1, 0, NULL, 2.20),
(3, 2, 3, 'Farm Fresh Brown Eggs', 4.50, 'dozen', 1, 1, 0, NULL, 4.50),
(4, 2, 4, 'Raw Wildflower Honey', 8.00, 'jar', 1, 1, 0, NULL, 8.00);
