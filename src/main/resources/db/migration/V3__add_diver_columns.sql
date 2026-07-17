-- V3__add_diver_columns.sql
-- Adds columns to divers table that Diver.java expects

ALTER TABLE divers
    ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'USER',
    ADD COLUMN IF NOT EXISTS enabled BOOLEAN DEFAULT TRUE;
