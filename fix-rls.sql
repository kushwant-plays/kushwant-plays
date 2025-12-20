-- Fix Storage RLS Policies
-- Run this in Supabase SQL Editor

-- Allow public uploads to game-images bucket
CREATE POLICY "Public uploads" ON storage.objects 
FOR INSERT TO public 
WITH CHECK (bucket_id = 'game-images');

-- Allow public reads from game-images bucket
CREATE POLICY "Public reads" ON storage.objects 
FOR SELECT TO public 
USING (bucket_id = 'game-images');