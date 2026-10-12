-- =====================================================================
-- MarketLink (Theme: eGreen Basket) - Database Schema Migration
-- Dialect: MySQL 8.0+ / MariaDB
-- Strict Relational Foreign Keys, Enums, Timestamps & Indexes
-- Constraints Enforced:
--   1. Physical Stall Pickups only (Strictly NO courier/home delivery)
--   2. Strict Pay-on-Pickup: online_amount_collected is strictly $0.00
-- =====================================================================

CREATE DATABASE IF NOT EXISTS `marketlink_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `marketlink_db`;

-- Drop existing tables in reverse dependency order
DROP TABLE IF EXISTS `reviews`;
DROP TABLE IF EXISTS `order_items`;
DROP TABLE IF EXISTS `orders`;
DROP TABLE IF EXISTS `products`;
DROP TABLE IF EXISTS `farmer_profiles`;
DROP TABLE IF EXISTS `markets`;
DROP TABLE IF EXISTS `users`;

-- ---------------------------------------------------------------------
-- 1. USERS TABLE
-- Handles authentication & role-based access (admin, farmer, customer)
-- ---------------------------------------------------------------------
CREATE TABLE `users` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(191) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `role` ENUM('admin', 'farmer', 'customer') NOT NULL DEFAULT 'customer',
  `phone` VARCHAR(30) NULL,
  `organization` VARCHAR(150) NULL COMMENT 'e.g. Municipal Market Authority',
  `avatar_url` VARCHAR(255) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_users_role` (`role`),
  INDEX `idx_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 2. MARKETS TABLE
-- Physical farmers market locations hosting stalls with scheduled operating hours
-- ---------------------------------------------------------------------
CREATE TABLE `markets` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(150) NOT NULL,
  `slug` VARCHAR(160) NOT NULL UNIQUE,
  `location_address` VARCHAR(255) NOT NULL,
  `latitude` DECIMAL(10, 8) NOT NULL,
  `longitude` DECIMAL(11, 8) NOT NULL,
  `operating_days` VARCHAR(100) NOT NULL COMMENT 'e.g., Saturday & Sunday',
  `opening_time` TIME NOT NULL COMMENT 'e.g., 07:00:00',
  `closing_time` TIME NOT NULL COMMENT 'e.g., 14:00:00',
  `description` TEXT NULL,
  `parking_info` VARCHAR(255) NULL,
  `image_url` VARCHAR(255) NULL,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_markets_geo` (`latitude`, `longitude`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 3. FARMER_PROFILES TABLE
-- Dedicated profile for farmers registered to specific market stalls
-- ---------------------------------------------------------------------
CREATE TABLE `farmer_profiles` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED NOT NULL UNIQUE,
  `market_id` INT UNSIGNED NOT NULL,
  `farm_name` VARCHAR(150) NOT NULL,
  `stall_number` VARCHAR(30) NOT NULL COMMENT 'Physical stall designator, e.g., Stall A-14',
  `stall_lat` DECIMAL(10, 8) NOT NULL,
  `stall_lng` DECIMAL(11, 8) NOT NULL,
  `bio` TEXT NULL,
  `farming_practices` ENUM('Organic Certified', 'Transitional Organic', 'Conventional Eco-Safe') NOT NULL DEFAULT 'Organic Certified',
  `cutoff_hours` SMALLINT UNSIGNED NOT NULL DEFAULT 12 COMMENT 'Hours before market opening when pre-orders close',
  `contact_phone` VARCHAR(30) NOT NULL,
  `contact_email` VARCHAR(191) NOT NULL,
  `banner_image` VARCHAR(255) NULL,
  `rating_avg` DECIMAL(3, 2) DEFAULT 5.00,
  `is_verified` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_farmer_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_farmer_market` FOREIGN KEY (`market_id`) REFERENCES `markets` (`id`) ON DELETE CASCADE,
  INDEX `idx_farmer_market` (`market_id`),
  INDEX `idx_farmer_stall` (`stall_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 4. PRODUCTS TABLE
-- Farm-fresh inventory with harvest timestamp, stock bounds, and farming type
-- ---------------------------------------------------------------------
CREATE TABLE `products` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `farmer_id` INT UNSIGNED NOT NULL,
  `market_id` INT UNSIGNED NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `category` ENUM('Fresh Vegetables', 'Orchard Fruits', 'Farm Fresh Dairy & Eggs', 'Raw Honey & Preserves', 'Organic Herbs') NOT NULL,
  `description` TEXT NULL,
  `price_per_unit` DECIMAL(8, 2) NOT NULL,
  `unit` ENUM('kg', 'bunch', 'punnet', 'dozen', 'jar', 'piece', '500g bag') NOT NULL DEFAULT 'kg',
  `farming_type` ENUM('Organic', 'Conventional') NOT NULL DEFAULT 'Organic',
  `harvest_date` DATE NOT NULL COMMENT 'Date when crop was harvested for traceability',
  `stock_limit` INT UNSIGNED NOT NULL DEFAULT 50 COMMENT 'Maximum available units for pre-order',
  `in_stock` INT UNSIGNED NOT NULL DEFAULT 50 COMMENT 'Current remaining units for pre-order',
  `image_url` VARCHAR(255) NULL,
  `status` ENUM('active', 'out_of_stock', 'archived') NOT NULL DEFAULT 'active',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_product_farmer` FOREIGN KEY (`farmer_id`) REFERENCES `farmer_profiles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_product_market` FOREIGN KEY (`market_id`) REFERENCES `markets` (`id`) ON DELETE CASCADE,
  INDEX `idx_products_category` (`category`),
  INDEX `idx_products_farming_type` (`farming_type`),
  INDEX `idx_products_farmer` (`farmer_id`),
  INDEX `idx_products_market` (`market_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 5. ORDERS TABLE
-- Pre-order reservations for physical stall pickup with zero online collection
-- ---------------------------------------------------------------------
CREATE TABLE `orders` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `order_code` VARCHAR(20) NOT NULL UNIQUE COMMENT 'Human-friendly alphanumeric code, e.g. ML-9021',
  `customer_id` INT UNSIGNED NOT NULL,
  `farmer_id` INT UNSIGNED NOT NULL,
  `market_id` INT UNSIGNED NOT NULL,
  `pickup_date` DATE NOT NULL,
  `pickup_timeslot` VARCHAR(50) NOT NULL COMMENT 'e.g. 08:00 AM - 10:00 AM',
  `pickup_token` VARCHAR(64) NOT NULL UNIQUE COMMENT 'Cryptographically secure QR verification token',
  `pickup_pin` CHAR(4) NOT NULL COMMENT '4-digit fast verification PIN for at-stall checkin',
  `order_status` ENUM('placed', 'accepted', 'ready', 'completed', 'cancelled') NOT NULL DEFAULT 'placed',
  `payment_method` ENUM('Cash On Pickup', 'Contactless Tap at Stall') NOT NULL DEFAULT 'Cash On Pickup',
  `payment_status` ENUM('pending_at_stall', 'collected_at_stall', 'waived_cancelled') NOT NULL DEFAULT 'pending_at_stall',
  `online_amount_collected` DECIMAL(10, 2) NOT NULL DEFAULT 0.00 COMMENT 'Strict SRS Constraint: Always $0.00',
  `initial_total_due` DECIMAL(10, 2) NOT NULL COMMENT 'Pre-order estimated total cash due on pickup',
  `final_total_due` DECIMAL(10, 2) NOT NULL COMMENT 'Adjusted total due after at-stall inspection/rejections',
  `inspection_notes` TEXT NULL COMMENT 'Notes made by farmer/customer during stall pickup quality check',
  `cancelled_reason` VARCHAR(255) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_order_customer` FOREIGN KEY (`customer_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_order_farmer` FOREIGN KEY (`farmer_id`) REFERENCES `farmer_profiles` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_order_market` FOREIGN KEY (`market_id`) REFERENCES `markets` (`id`) ON DELETE RESTRICT,
  INDEX `idx_orders_status` (`order_status`),
  INDEX `idx_orders_pickup_pin` (`pickup_pin`),
  INDEX `idx_orders_customer` (`customer_id`),
  INDEX `idx_orders_farmer` (`farmer_id`),
  INDEX `idx_orders_date` (`pickup_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 6. ORDER_ITEMS TABLE
-- Line items with inspection & rejection audit fields for damaged produce deduction
-- ---------------------------------------------------------------------
CREATE TABLE `order_items` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `order_id` INT UNSIGNED NOT NULL,
  `product_id` INT UNSIGNED NOT NULL,
  `product_name` VARCHAR(150) NOT NULL,
  `unit_price` DECIMAL(8, 2) NOT NULL,
  `unit` VARCHAR(30) NOT NULL,
  `reserved_qty` INT UNSIGNED NOT NULL COMMENT 'Initial reserved quantity by customer',
  `accepted_qty` INT UNSIGNED NOT NULL COMMENT 'Quantity accepted after at-stall inspection',
  `rejected_qty` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Quantity rejected due to bruising/blemish at stall',
  `rejection_note` VARCHAR(255) NULL COMMENT 'Reason for deduction (e.g. bruised peach, customer reduced qty)',
  `subtotal` DECIMAL(10, 2) NOT NULL COMMENT 'Final line item total = accepted_qty * unit_price',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_item_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_item_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE RESTRICT,
  INDEX `idx_order_items_order` (`order_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 7. REVIEWS TABLE
-- Verified stall pickup reviews by genuine customers
-- ---------------------------------------------------------------------
CREATE TABLE `reviews` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `order_id` INT UNSIGNED NOT NULL UNIQUE,
  `customer_id` INT UNSIGNED NOT NULL,
  `farmer_id` INT UNSIGNED NOT NULL,
  `rating` TINYINT UNSIGNED NOT NULL CHECK (`rating` BETWEEN 1 AND 5),
  `comment` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_review_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_review_customer` FOREIGN KEY (`customer_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_review_farmer` FOREIGN KEY (`farmer_id`) REFERENCES `farmer_profiles` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
