-- Public product media bucket for admin-uploaded product images/videos.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-media',
  'product-media',
  true,
  52428800,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm']
)
ON CONFLICT (id) DO UPDATE
SET
  public = true,
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm'];

DROP POLICY IF EXISTS "Public read product media" ON storage.objects;
CREATE POLICY "Public read product media" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-media');

DROP POLICY IF EXISTS "Authenticated upload product media" ON storage.objects;
CREATE POLICY "Authenticated upload product media" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'product-media'
    AND auth.role() = 'authenticated'
  );

DROP POLICY IF EXISTS "Authenticated update product media" ON storage.objects;
CREATE POLICY "Authenticated update product media" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'product-media'
    AND auth.role() = 'authenticated'
  );

DROP POLICY IF EXISTS "Authenticated delete product media" ON storage.objects;
CREATE POLICY "Authenticated delete product media" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'product-media'
    AND auth.role() = 'authenticated'
  );
