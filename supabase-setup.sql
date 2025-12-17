-- Create games table
CREATE TABLE games (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT CHECK (type IN ('pc', 'android')),
  download TEXT,
  img TEXT,
  screenshots TEXT[], -- Array of screenshot URLs
  trailer_url TEXT, -- Video trailer URL
  views INTEGER DEFAULT 0,
  downloads INTEGER DEFAULT 0,
  priority INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create comments table
CREATE TABLE comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  username TEXT DEFAULT 'Guest',
  text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create functions for incrementing views and downloads
CREATE OR REPLACE FUNCTION increment_views(game_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE games SET views = views + 1 WHERE id = game_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION increment_downloads(game_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE games SET downloads = downloads + 1 WHERE id = game_id;
END;
$$ LANGUAGE plpgsql;

-- Enable Row Level Security (optional)
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Games are viewable by everyone" ON games FOR SELECT USING (true);
CREATE POLICY "Comments are viewable by everyone" ON comments FOR SELECT USING (true);

-- Create policies for insert (you can modify these based on your auth requirements)
CREATE POLICY "Anyone can insert games" ON games FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can insert comments" ON comments FOR INSERT WITH CHECK (true);

-- Create policies for updates (for view/download tracking)
CREATE POLICY "Anyone can update game stats" ON games FOR UPDATE USING (true);