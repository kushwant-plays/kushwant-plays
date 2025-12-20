-- Add category column to games table
-- Run this in Supabase SQL Editor

-- Add category column with default value
ALTER TABLE games 
ADD COLUMN category TEXT DEFAULT 'action';

-- Update existing games with appropriate categories (optional - you can do this manually in admin)
-- UPDATE games SET category = 'action' WHERE category IS NULL;

-- Add check constraint for valid categories
ALTER TABLE games 
ADD CONSTRAINT valid_category 
CHECK (category IN ('action', 'adventure', 'horror', 'rpg', 'strategy', 'racing', 'sports', 'puzzle', 'simulation'));