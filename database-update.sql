-- Add new columns to existing games table
ALTER TABLE games 
ADD COLUMN IF NOT EXISTS screenshots TEXT[],
ADD COLUMN IF NOT EXISTS trailer_url TEXT,
ADD COLUMN IF NOT EXISTS requirements TEXT;

-- Update existing games to have empty arrays for screenshots
UPDATE games SET screenshots = '{}' WHERE screenshots IS NULL;