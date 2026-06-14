-- Remove legacy marketplace/vendor constraints from products.
-- ShopeValley products are listed and managed by admin only.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'vendor_id'
  ) THEN
    ALTER TABLE products ALTER COLUMN vendor_id DROP NOT NULL;
    UPDATE products SET vendor_id = NULL WHERE vendor_id IS NOT NULL;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'vendor_name'
  ) THEN
    ALTER TABLE products ALTER COLUMN vendor_name DROP NOT NULL;
    UPDATE products SET vendor_name = NULL WHERE vendor_name IS NOT NULL;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'is_cod_available'
  ) THEN
    ALTER TABLE products ALTER COLUMN is_cod_available SET DEFAULT false;
    UPDATE products SET is_cod_available = false WHERE is_cod_available IS DISTINCT FROM false;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'shipping_cost'
  ) THEN
    ALTER TABLE products ALTER COLUMN shipping_cost SET DEFAULT 0;
    UPDATE products SET shipping_cost = 0 WHERE shipping_cost IS DISTINCT FROM 0;
  END IF;
END $$;
