
-- Create storage bucket for generated images
INSERT INTO storage.buckets (id, name, public)
VALUES ('generated-images', 'generated-images', true);

-- Storage policies
CREATE POLICY "Anyone can view generated images"
ON storage.objects FOR SELECT
USING (bucket_id = 'generated-images');

CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'generated-images' AND auth.role() = 'authenticated');

CREATE POLICY "Users can delete own images"
ON storage.objects FOR DELETE
USING (bucket_id = 'generated-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create generated_images table for metadata
CREATE TABLE public.generated_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  image_url TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  style TEXT NOT NULL DEFAULT 'corporativo',
  description TEXT,
  post_content TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.generated_images ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view own images"
ON public.generated_images FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own images"
ON public.generated_images FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own images"
ON public.generated_images FOR DELETE
USING (auth.uid() = user_id);
