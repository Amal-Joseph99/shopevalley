-- Homepage sections (Featured Products, Hot Deals, Trending Now)
CREATE TABLE IF NOT EXISTS homepage_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  display_order INTEGER DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Products assigned to homepage sections
CREATE TABLE IF NOT EXISTS homepage_section_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID NOT NULL REFERENCES homepage_sections(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(section_id, product_id)
);

-- Insert default sections
INSERT INTO homepage_sections (name, display_order) VALUES
  ('Featured Products', 1),
  ('Hot Deals', 2),
  ('Trending Now', 3)
ON CONFLICT (name) DO NOTHING;

-- RLS
ALTER TABLE homepage_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE homepage_section_products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all for authenticated users" ON homepage_sections;
DROP POLICY IF EXISTS "Allow anon read homepage_sections" ON homepage_sections;
DROP POLICY IF EXISTS "Allow all for authenticated users" ON homepage_section_products;
DROP POLICY IF EXISTS "Allow anon read homepage_section_products" ON homepage_section_products;

CREATE POLICY "Allow all for authenticated users" ON homepage_sections
  FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow anon read homepage_sections" ON homepage_sections
  FOR SELECT USING (true);
CREATE POLICY "Allow all for authenticated users" ON homepage_section_products
  FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow anon read homepage_section_products" ON homepage_section_products
  FOR SELECT USING (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_homepage_section_products_section ON homepage_section_products(section_id);
CREATE INDEX IF NOT EXISTS idx_homepage_section_products_product ON homepage_section_products(product_id);

-- Update ad_campaigns table: add image_path for storage-based uploads
ALTER TABLE ad_campaigns ADD COLUMN IF NOT EXISTS image_path TEXT;
