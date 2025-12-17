-- Update RLS policies for admin-only game management
DROP POLICY IF EXISTS "Anyone can insert games" ON games;
DROP POLICY IF EXISTS "Anyone can update game stats" ON games;

-- Create admin-only policies
CREATE POLICY "Only admin can insert games" ON games 
FOR INSERT WITH CHECK (auth.jwt() ->> 'email' = 'prady346@gmail.com');

CREATE POLICY "Only admin can update games" ON games 
FOR UPDATE USING (auth.jwt() ->> 'email' = 'prady346@gmail.com');

CREATE POLICY "Only admin can delete games" ON games 
FOR DELETE USING (auth.jwt() ->> 'email' = 'prady346@gmail.com');

-- Allow view/download tracking for everyone
CREATE POLICY "Anyone can update game stats" ON games 
FOR UPDATE USING (true) 
WITH CHECK (
  -- Only allow updating views and downloads columns
  OLD.title = NEW.title AND 
  OLD.description = NEW.description AND 
  OLD.type = NEW.type AND 
  OLD.download = NEW.download AND 
  OLD.img = NEW.img AND 
  OLD.priority = NEW.priority
);