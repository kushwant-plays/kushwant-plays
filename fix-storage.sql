-- Run this in Supabase SQL Editor after creating game-images bucket manually

-- Allow public uploads
CREATE POLICY "Allow public uploads" ON storage.objects 
FOR INSERT TO public 
WITH CHECK (bucket_id = 'game-images');

-- Allow public reads  
CREATE POLICY "Allow public reads" ON storage.objects 
FOR SELECT TO public 
USING (bucket_id = 'game-images');

-- Allow public updates
CREATE POLICY "Allow public updates" ON storage.objects 
FOR UPDATE TO public 
USING (bucket_id = 'game-images');

-- Allow public deletes
CREATE POLICY "Allow public deletes" ON storage.objects 
FOR DELETE TO public 
USING (bucket_id = 'game-images');