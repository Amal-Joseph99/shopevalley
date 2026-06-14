import { useState, useEffect } from 'react';
import { Flame, Sparkles, TrendingUp, ChevronRight } from 'lucide-react';
import ProductCard from './ProductCard';
import { Product } from '../types';
import { fetchAllHomepageSections, SECTION_SLUGS } from '../lib/homepageService';

interface HomepageSectionsProps {
  onNavigate: (path: string) => void;
  onAddToCart: (product: Product) => void;
  onToggleWishlist: (product: Product) => void;
  wishlist: Product[];
}

const SECTION_ICONS: Record<string, any> = {
  'Featured Products': Sparkles,
  'Hot Deals': Flame,
  'Trending Now': TrendingUp
};

const SECTION_BADGES: Record<string, { label: string; color: string } | null> = {
  'Featured Products': { label: 'SPONSORED', color: 'bg-red-500' },
  'Hot Deals': null,
  'Trending Now': { label: 'Unbeatable', color: 'bg-red-500' }
};

const HOMEPAGE_LIMIT = 20;

export default function HomepageSections({ onNavigate, onAddToCart, onToggleWishlist, wishlist }: HomepageSectionsProps) {
  const [sections, setSections] = useState<Array<{ id: string; name: string; products: Product[] }>>([]);

  useEffect(() => {
    fetchAllHomepageSections().then(setSections);
  }, []);

  if (sections.length === 0) return null;

  return (
    <div className="space-y-8">
      {sections.map(section => {
        const Icon = SECTION_ICONS[section.name] || Sparkles;
        const badge = SECTION_BADGES[section.name];
        const slug = SECTION_SLUGS[section.name];
        const displayProducts = section.products.slice(0, HOMEPAGE_LIMIT);

        return (
          <section key={section.id} className="w-full max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between gap-4 mb-4 pb-2.5 border-b border-slate-200/60">
              <h2 className="text-base sm:text-lg md:text-xl font-bold tracking-tight text-slate-900 uppercase font-sans flex items-center gap-2 leading-none">
                <Icon className="w-5 h-5 text-slate-800 shrink-0" />
                <span>{section.name}</span>
                {section.name === 'Hot Deals' && <span className="text-lg">🔥</span>}
              </h2>
              <div className="flex items-center gap-2 shrink-0">
                {badge && (
                  <span className={`${badge.color} text-white text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wide`}>
                    {badge.label}
                  </span>
                )}
                {slug && (
                  <button
                    onClick={() => onNavigate(`section/${slug}`)}
                    className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    See More <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {displayProducts.map(p => {
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
    </div>
  );
}
