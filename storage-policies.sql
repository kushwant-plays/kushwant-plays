-- Storage Policies for game-images bucket
-- Run this in Supabase SQL Editor

-- Allow public uploads
CREATE POLICY "Allow public uploads to game-images"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'game-images');

-- Allow public reads
CREATE POLICY "Allow public reads from game-images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'game-images');

-- Allow public updates
CREATE POLICY "Allow public updates to game-images"
ON storage.objects FOR UPDATE
TO public
USING (bucket_id = 'game-images');

-- Allow public deletes
CREATE POLICY "Allow public deletes from game-images"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'game-images');