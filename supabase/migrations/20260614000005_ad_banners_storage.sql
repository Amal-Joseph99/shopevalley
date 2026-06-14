-- Make ad title optional (image-only banners)
ALTER TABLE ad_campaigns ALTER COLUMN title DROP NOT NULL;

-- Create ad-banners storage bucket (public read)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'ad-banners',
  'ad-banners',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for ad-banners bucket
DROP POLICY IF EXISTS "Public read ad banners" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated upload ad banners" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated delete ad banners" ON storage.objects;

CREATE POLICY "Public read ad banners" ON storage.objects
  FOR SELECT USING (bucket_id = 'ad-banners');

CREATE POLICY "Authenticated upload ad banners" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'ad-banners' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated delete ad banners" ON storage.objects
  FOR DELETE USING (bucket_id = 'ad-banners' AND auth.role() = 'authenticated');
