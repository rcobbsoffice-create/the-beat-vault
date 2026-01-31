-- Add stems_url column to beats table
ALTER TABLE beats ADD COLUMN IF NOT EXISTS stems_url TEXT;