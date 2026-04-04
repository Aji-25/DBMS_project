-- Migration: 004_seed_data
USE nexus_db;

-- Clear tables (be careful, this is for demo reset)
DELETE FROM audit_log;
DELETE FROM ledger_entries;
DELETE FROM trades;
DELETE FROM orders;
DELETE FROM holdings;
DELETE FROM wallets;
DELETE FROM users;
DELETE FROM assets;

-- Assets
INSERT INTO assets (id, symbol, name, current_price) VALUES
(1, 'RELI', 'Reliance Industries', 2581.50),
(2, 'TATA', 'Tata Motors', 945.20),
(3, 'INFY', 'Infosys', 1622.10),
(4, 'HDFC', 'HDFC Bank', 1442.80);

-- Users (All passwords are 'password123')
-- Admin
INSERT INTO users (id, email, password_hash, name, role) VALUES
(1, 'arjun@nexus.io', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi', 'Arjun Mehta', 'ADMIN');

-- Traders
INSERT INTO users (id, email, password_hash, name, role) VALUES
(2, 'kavya@nexus.io', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi', 'Kavya Nair', 'USER'),
(3, 'rohan@nexus.io', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi', 'Rohan Sharma', 'USER'),
(4, 'priya@nexus.io', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi', 'Priya Das', 'USER');

-- Wallets (Initial 1 Lakh Each)
INSERT INTO wallets (user_id, balance) VALUES
(1, 100000.00),
(2, 100000.00),
(3, 100000.00),
(4, 100000.00);

-- Initial Holdings for match testing
-- Kavya (User 2) has 100 TATA
INSERT INTO holdings (user_id, asset_id, quantity, avg_cost_basis) VALUES (2, 2, 100.0000, 900.00);

-- Priya (User 4) has 50 RELI
INSERT INTO holdings (user_id, asset_id, quantity, avg_cost_basis) VALUES (4, 1, 50.0000, 2500.00);

-- Sample OPEN Orders for matching
-- User 2 (Kavya) selling TATA at 945.20
INSERT INTO orders (user_id, asset_id, type, order_type, qty, limit_price, status)
VALUES (2, 2, 'SELL', 'LIMIT', 10, 945.20, 'OPEN');

-- User 4 (Priya) selling RELI at 2600.00
INSERT INTO orders (user_id, asset_id, type, order_type, qty, limit_price, status)
VALUES (4, 1, 'SELL', 'LIMIT', 5, 2600.00, 'OPEN');
