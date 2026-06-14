-- Optional product specs and manufacturer fields for storefront detail page.
-- All columns are nullable; admin listing step 4 saves them when provided.

ALTER TABLE products ADD COLUMN IF NOT EXISTS battery TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS lighting TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS microphone TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS connectivity TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS spec_product_type TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS manufacturer_name TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS manufacturer_country TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS country_of_origin TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS important_note TEXT;

-- products RLS already enabled; ensure anon can read active product specs
DROP POLICY IF EXISTS "Allow anon read products" ON products;
CREATE POLICY "Allow anon read products" ON products
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow all for authenticated users" ON products;
CREATE POLICY "Allow all for authenticated users" ON products
  FOR ALL USING (auth.role() = 'authenticated');
