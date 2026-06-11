-- Add columns required for seller draft workflow and resume state
alter table if exists products
  add column if not exists is_draft boolean default false,
  add column if not exists resume_step text default 'basic',
  add column if not exists approval_status text default 'pending',
  add column if not exists is_active boolean default false,
  add column if not exists videos jsonb default '[]'::jsonb,
  add column if not exists origin_country_id text,
  add column if not exists origin_country text,
  add column if not exists currency text,
  add column if not exists is_cod_available boolean default true,
  add column if not exists item_condition text,
  add column if not exists shipping_type text,
  add column if not exists shipping_cost numeric default 0,
  add column if not exists dispatch_time text;
