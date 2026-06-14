-- Ad Campaigns table
CREATE TABLE IF NOT EXISTS ad_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  subtitle TEXT,
  image_url TEXT NOT NULL,
  link VARCHAR(500) DEFAULT '',
  badge VARCHAR(100),
  display_order INTEGER DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE ad_campaigns ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all for authenticated users" ON ad_campaigns;
DROP POLICY IF EXISTS "Allow anon read ad_campaigns" ON ad_campaigns;

CREATE POLICY "Allow all for authenticated users" ON ad_campaigns
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow anon read ad_campaigns" ON ad_campaigns
  FOR SELECT USING (true);

-- Index
CREATE INDEX IF NOT EXISTS idx_ad_campaigns_status ON ad_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_ad_campaigns_order ON ad_campaigns(display_order);
