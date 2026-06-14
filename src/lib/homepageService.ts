import { supabase } from '../lib/supabaseClient';
import { Product } from '../types';

export const SECTION_SLUGS: Record<string, string> = {
  'Featured Products': 'featured-products',
  'Hot Deals': 'hot-deals',
  'Trending Now': 'trending-now'
};

export const SLUG_TO_NAME: Record<string, string> = {
  'featured-products': 'Featured Products',
  'hot-deals': 'Hot Deals',
  'trending-now': 'Trending Now'
};

function normalizeProductRow(p: any): Product {
  return {
    id: p.id,
    idKey: p.id,
    name: p.name || '',
    description: p.description || '',
    price: Number(p.price) || 0,
    originalPrice: p.original_price ? Number(p.original_price) : undefined,
    category: p.category || '',
    subCategory: p.sub_category || '',
    images: Array.isArray(p.images) ? p.images : [],
    rating: Number(p.rating) || 0,
    reviewCount: p.review_count || 0,
    stock: p.stock || 0,
    tags: p.tags || [],
    slug: p.slug || '',
    brand: p.brand || '',
    createdAt: p.created_at || ''
  };
}

export async function fetchHomepageSectionProducts(sectionName: string): Promise<Product[]> {
  const { data: sec } = await supabase
    .from('homepage_sections')
    .select('id')
    .eq('name', sectionName)
    .eq('status', 'Active')
    .single();

  if (!sec) return [];

  const { data: spData } = await supabase
    .from('homepage_section_products')
    .select('display_order, products:product_id(*)')
    .eq('section_id', sec.id)
    .order('display_order', { ascending: true });

  if (!spData) return [];

  return spData
    .filter((sp: any) => sp.products)
    .map((sp: any) => normalizeProductRow(sp.products));
}

export async function fetchAllHomepageSections(): Promise<Array<{ id: string; name: string; products: Product[] }>> {
  const { data: secs } = await supabase
    .from('homepage_sections')
    .select('id, name, display_order')
    .eq('status', 'Active')
    .order('display_order', { ascending: true });

  if (!secs || secs.length === 0) return [];

  const result: Array<{ id: string; name: string; products: Product[] }> = [];

  for (const sec of secs) {
    const { data: spData } = await supabase
      .from('homepage_section_products')
      .select('display_order, products:product_id(*)')
      .eq('section_id', sec.id)
      .order('display_order', { ascending: true });

    if (spData && spData.length > 0) {
      const products = spData
        .filter((sp: any) => sp.products)
        .map((sp: any) => normalizeProductRow(sp.products));
      result.push({ id: sec.id, name: sec.name, products });
    }
  }

  return result;
}
