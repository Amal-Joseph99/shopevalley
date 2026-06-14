import { useState, useEffect } from 'react';
import { Flame, Sparkles, TrendingUp } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import ProductCard from './ProductCard';
import { Product } from '../types';

interface HomepageSectionsProps {
  onNavigate: (path: string) => void;
  onAddToCart: (product: Product) => void;
  onToggleWishlist: (product: Product) => void;
  wishlist: Product[];
}

interface SectionData {
  id: string;
  name: string;
  products: Product[];
}

const SECTION_ICONS: Record<string, any> = {
  'Featured Products': Sparkles,
  'Hot Deals': Flame,
  'Trending Now': TrendingUp
};

const SECTION_COLORS: Record<string, string> = {
  'Featured Products': '#2563eb',
  'Hot Deals': '#dc2626',
  'Trending Now': '#7c3aed'
};

export default function HomepageSections({ onNavigate, onAddToCart, onToggleWishlist, wishlist }: HomepageSectionsProps) {
  const [sections, setSections] = useState<SectionData[]>([]);

  useEffect(() => {
    const fetchSections = async () => {
      const { data: secs } = await supabase
        .from('homepage_sections')
        .select('id, name, display_order')
        .eq('status', 'Active')
        .order('display_order', { ascending: true });

      if (!secs || secs.length === 0) return;

      const result: SectionData[] = [];
      for (const sec of secs) {
        const { data: spData } = await supabase
          .from('homepage_section_products')
          .select('product_id, display_order, products:product_id(*)')
          .eq('section_id', sec.id)
          .order('display_order', { ascending: true });

        if (spData && spData.length > 0) {
          const products: Product[] = spData
            .filter((sp: any) => sp.products)
            .map((sp: any) => {
              const p = sp.products;
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
            });
          result.push({ id: sec.id, name: sec.name, products });
        }
      }
      setSections(result);
    };

    fetchSections();
  }, []);

  if (sections.length === 0) return null;

  return (
    <>
      {sections.map(section => {
        const Icon = SECTION_ICONS[section.name] || Sparkles;
        const color = SECTION_COLORS[section.name] || '#2563eb';

        return (
          <section key={section.id} className="w-full max-w-7xl mx-auto px-4 sm:px-6 my-2">
            <div className="flex items-center justify-between gap-4 mb-4 pb-2.5 border-b border-slate-200/60">
              <h2 className="text-base sm:text-lg md:text-xl font-bold tracking-tight text-slate-900 uppercase font-sans flex items-center gap-2 leading-none">
                <Icon className="w-5 h-5" style={{ color }} />
                <span>{section.name}</span>
              </h2>
              <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                {section.products.length} items
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {section.products.map(p => {
                const isFav = wishlist.some(item => item.id === p.id);
                return (
                  <ProductCard
                    key={p.id}
                    product={p}
                    isWishlisted={isFav}
                    onToggleWishlist={onToggleWishlist}
                    onAddToCart={onAddToCart}
                    onNavigate={onNavigate}
                  />
                );
              })}
            </div>
          </section>
        );
      })}
    </>
  );
}
