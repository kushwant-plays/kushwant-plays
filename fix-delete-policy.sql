-- Check current policies
SELECT * FROM pg_policies WHERE tablename = 'games';

-- Drop existing delete policy if it exists
DROP POLICY IF EXISTS "Only admin can delete games" ON games;

-- Create new delete policy that allows deletion
CREATE POLICY "Allow delete games" ON games 
FOR DELETE USING (true);