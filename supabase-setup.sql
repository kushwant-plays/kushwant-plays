-- Complete Supabase Setup for Kushwant Plays
-- Run this in Supabase SQL Editor

-- 1. Create Storage Bucket for game images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'game-images',
  'game-images',
  true,
  52428800, -- 50MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm']
)
ON CONFLICT (id) DO NOTHING;

-- 2. Storage Policies for game-images bucket
CREATE POLICY "Allow public uploads to game-images"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'game-images');

CREATE POLICY "Allow public reads from game-images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'game-images');

CREATE POLICY "Allow public updates to game-images"
ON storage.objects FOR UPDATE
TO public
USING (bucket_id = 'game-images');

CREATE POLICY "Allow public deletes from game-images"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'game-images');

-- 3. Ensure games table exists with correct structure
CREATE TABLE IF NOT EXISTS games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL DEFAULT 'pc',
  download TEXT,
  img TEXT,
  priority INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  downloads INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  screenshots JSONB DEFAULT '[]'::jsonb,
  trailer_url TEXT,
  requirements TEXT
);

-- 4. Enable RLS on games table
ALTER TABLE games ENABLE ROW LEVEL SECURITY;

-- 5. Games table policies
CREATE POLICY "Allow public read access to games"
ON games FOR SELECT
TO public
USING (true);

CREATE POLICY "Allow authenticated insert to games"
ON games FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow authenticated update to games"
ON games FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated delete from games"
ON games FOR DELETE
TO authenticated
USING (true);

-- 6. Create game_requests table
CREATE TABLE IF NOT EXISTS game_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_name TEXT NOT NULL,
  user_name TEXT NOT NULL,
  user_email TEXT,
  platform TEXT NOT NULL DEFAULT 'pc',
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Enable RLS on game_requests
ALTER TABLE game_requests ENABLE ROW LEVEL SECURITY;

-- 8. Game requests policies
CREATE POLICY "Allow public insert to game_requests"
ON game_requests FOR INSERT
TO public
WITH CHECK (
  game_name IS NOT NULL AND 
  user_name IS NOT NULL AND 
  platform IN ('pc', 'android')
);

CREATE POLICY "Allow authenticated read game_requests"
ON game_requests FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated delete game_requests"
ON game_requests FOR DELETE
TO authenticated
USING (true);

-- 9. Create comments table
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  username TEXT NOT NULL DEFAULT 'Guest',
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Enable RLS on comments
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- 11. Comments policies
CREATE POLICY "Allow public read comments"
ON comments FOR SELECT
TO public
USING (true);

CREATE POLICY "Allow public insert comments"
ON comments FOR INSERT
TO public
WITH CHECK (text IS NOT NULL);

-- 12. Create functions for incrementing views and downloads
CREATE OR REPLACE FUNCTION increment_views(game_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE games SET views = views + 1 WHERE id = game_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION increment_downloads(game_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE games SET downloads = downloads + 1 WHERE id = game_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 13. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_games_priority ON games(priority DESC);
CREATE INDEX IF NOT EXISTS idx_games_type ON games(type);
CREATE INDEX IF NOT EXISTS idx_games_created_at ON games(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_game_id ON comments(game_id);
CREATE INDEX IF NOT EXISTS idx_game_requests_created_at ON game_requests(created_at DESC);

-- Done! Your Supabase database is now fully configured.
