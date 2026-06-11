import { Eye } from 'lucide-react';
import { Product } from '../types';
import { PRODUCTS } from '../data';
import ProductCard from './ProductCard';

interface RecommendationsProps {
  viewHistory: string[]; // Product IDs
  onProductClick: (category: string, slug: string) => void;
  onAddToCart: (product: Product) => void;
  onToggleWishlist: (product: Product) => void;
  wishlist: Product[];
  onNavigate: (path: string) => void;
}

export default function Recommendations({ 
  viewHistory, 
  onProductClick, 
  onAddToCart, 
  onToggleWishlist, 
  wishlist,
  onNavigate 
}: RecommendationsProps) {
  
  const getPersonalizedRecommendations = (): { product: Product; reason: string }[] => {
    const limit = 8; // Change to 8 to support 2 rows of 4 columns
    if (!viewHistory || viewHistory.length === 0) {
      // Fallback: Top premium items
      return PRODUCTS
        .filter(p => p.rating >= 4.5)
        .slice(0, limit)
        .map(p => ({
          product: p,
          reason: 'Bestseller in Local Workshops'
        }));
    }

    // Retrieve viewed products
    const viewedProducts = PRODUCTS.filter(p => viewHistory.includes(p.id));
    
    // Count categories and tags
    const categories: Record<string, number> = {};
    const tags: Record<string, number> = {};
    
    viewedProducts.forEach(p => {
      categories[p.category] = (categories[p.category] || 0) + 1.5; // heavy weight on category
      p.tags.forEach(t => {
        tags[t] = (tags[t] || 0) + 1;
      });
    });

    // Find recommended products excluding viewed items
    const recommendations = PRODUCTS
      .filter(p => !viewHistory.includes(p.id))
      .map(p => {
        let score = 0;
        let reason = 'You might also love';

        // Add score for matching category
        if (categories[p.category]) {
          score += categories[p.category];
          reason = `Complements your interest in ${p.category}`;
        }

        // Add score for matching tags
        p.tags.forEach(t => {
          if (tags[t]) {
            score += tags[t] * 0.5;
            if (score > 1.5 && reason === 'You might also love') {
              reason = `Matches your preference for #${t}`;
            }
          }
        });

        return { product: p, score, reason };
      })
      .filter(r => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    // If we have less than limit recommendations, pad with high rated ones
    if (recommendations.length < limit) {
      const existingIds = [...recommendations.map(r => r.product.id), ...viewHistory];
      const paddings = PRODUCTS
        .filter(p => !existingIds.includes(p.id))
        .sort((a,b) => b.rating - a.rating)
        .slice(0, limit - recommendations.length)
        .map(p => ({
          product: p,
          score: 0.1,
          reason: 'Trending in Nearby Workshops'
        }));
      
      return [...recommendations, ...paddings].map(r => ({
        product: r.product,
        reason: r.reason
      }));
    }

    return recommendations.map(r => ({
      product: r.product,
      reason: r.reason
    }));
  };

  const recList = getPersonalizedRecommendations();

  if (!recList || recList.length === 0) {
    return null;
  }

  return (
    <section className="w-full bg-slate-50 border-y border-slate-200/50 py-6 px-4" id="sh_history_recs_section">
      <div className="max-w-7xl mx-auto">
        
        {/* Dynamic Header with GREEN/EMERALD See More Link */}
        <div className="flex items-center justify-between gap-4 mb-4 pb-2 border-b border-slate-200" id="sh_personalized_header_row">
          <h2 className="text-base sm:text-lg md:text-xl font-bold tracking-tight text-slate-900 uppercase font-sans flex items-center gap-2 leading-none">
            <span className="w-1.5 h-5 bg-[#2E7D32] rounded-full inline-block shrink-0"></span>
            <span>Personalized For You</span>
          </h2>
          
          <button 
            onClick={() => onNavigate('section/personalized')} 
            className="text-xs font-bold text-[#2E7D32] hover:underline hover:text-[#1b5e20] transition-colors uppercase tracking-wide cursor-pointer shrink-0"
          >
            See More &rarr;
          </button>
        </div>

        {/* 4-column product grid using high fidelity ProductCard (2 columns on mobile, 4 on desktop) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {recList.map(({ product }, idx) => {
            const isFav = wishlist.some(item => item.id === product.id);
            return (
              <ProductCard 
                key={idx}
                product={product}
                isWishlisted={isFav}
                onToggleWishlist={onToggleWishlist}
                onAddToCart={onAddToCart}
                onNavigate={onNavigate}
              />
            );
          })}
        </div>

      </div>
    </section>
  );
}
