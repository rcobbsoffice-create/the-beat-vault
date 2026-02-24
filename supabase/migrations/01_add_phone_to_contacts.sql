-- Add phone column to contacts table
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS phone TEXT;