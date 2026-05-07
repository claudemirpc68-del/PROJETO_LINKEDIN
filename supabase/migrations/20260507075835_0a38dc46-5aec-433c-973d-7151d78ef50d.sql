
-- Make generated-images bucket private and restrict by ownership
UPDATE storage.buckets SET public = false WHERE id = 'generated-images';

DROP POLICY IF EXISTS "Anyone can view generated images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own images" ON storage.objects;

CREATE POLICY "Users can view own generated images"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'generated-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload own generated images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'generated-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own generated images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'generated-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Remove messages table from realtime publication to prevent unauthorized subscriptions
ALTER PUBLICATION supabase_realtime DROP TABLE public.messages;
