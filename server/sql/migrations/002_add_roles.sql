-- Migration: 002_add_roles
USE nexus_db;

ALTER TABLE users ADD COLUMN role ENUM('USER', 'ADMIN') DEFAULT 'USER';

-- Set Arjun as ADMIN for demo purposes
UPDATE users SET role = 'ADMIN' WHERE email = 'arjun@nexus.io';
