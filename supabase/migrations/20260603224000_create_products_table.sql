-- Create products table for admin-backed product listings
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  id_key text unique,
  name text not null,
  slug text unique not null,
  description text,
  price numeric not null default 0,
  original_price numeric,
  category text,
  sub_category text,
  images jsonb default '[]'::jsonb,
  vendor_id text,
  vendor_name text,
  rating numeric default 0,
  review_count integer default 0,
  stock integer default 0,
  tags text[] default '{}',
  is_organic boolean,
  is_handmade boolean,
  materials text[] default '{}',
  brand text,
  sku text,
  hsn_code text,
  manufacturer_name text,
  manufacturer_country text,
  country_of_origin text,
  weight text,
  dimensions text,
  package text,
  important_note text,
  highlights text,
  about_product text[] default '{}',
  directions text[] default '{}',
  variants jsonb default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_products_category on products(category);
create index if not exists idx_products_slug on products(slug);
create index if not exists idx_products_vendor_id on products(vendor_id);
