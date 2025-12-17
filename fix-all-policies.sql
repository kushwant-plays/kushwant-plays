-- Drop all existing policies
DROP POLICY IF EXISTS "Games are viewable by everyone" ON games;
DROP POLICY IF EXISTS "Comments are viewable by everyone" ON comments;
DROP POLICY IF EXISTS "Anyone can insert games" ON games;
DROP POLICY IF EXISTS "Anyone can insert comments" ON comments;
DROP POLICY IF EXISTS "Anyone can update game stats" ON games;
DROP POLICY IF EXISTS "Only admin can insert games" ON games;
DROP POLICY IF EXISTS "Only admin can update games" ON games;
DROP POLICY IF EXISTS "Only admin can delete games" ON games;
DROP POLICY IF EXISTS "Allow delete games" ON games;

-- Create simple policies that allow everything
CREATE POLICY "Allow all select on games" ON games FOR SELECT USING (true);
CREATE POLICY "Allow all insert on games" ON games FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update on games" ON games FOR UPDATE USING (true);
CREATE POLICY "Allow all delete on games" ON games FOR DELETE USING (true);

CREATE POLICY "Allow all select on comments" ON comments FOR SELECT USING (true);
CREATE POLICY "Allow all insert on comments" ON comments FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update on comments" ON comments FOR UPDATE USING (true);
CREATE POLICY "Allow all delete on comments" ON comments FOR DELETE USING (true);