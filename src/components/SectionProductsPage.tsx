import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import ProductCard from './ProductCard';
import { Product } from '../types';
import { fetchHomepageSectionProducts, SLUG_TO_NAME } from '../lib/homepageService';

interface SectionProductsPageProps {
  sectionSlug: string;
  onNavigate: (path: string) => void;
  onAddToCart: (product: Product) => void;
  onToggleWishlist: (product: Product) => void;
  wishlist: Product[];
}

export default function SectionProductsPage({
  sectionSlug,
  onNavigate,
  onAddToCart,
  onToggleWishlist,
  wishlist
}: SectionProductsPageProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const sectionName = SLUG_TO_NAME[sectionSlug] || sectionSlug;

  useEffect(() => {
    setIsLoading(true);
    fetchHomepageSectionProducts(sectionName).then(data => {
      setProducts(data);
      setIsLoading(false);
    });
  }, [sectionName]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8" id="sh_section_wise_view_workspace">
      <div className="mb-6 flex justify-between items-center">
        <button
          onClick={() => onNavigate('')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:underline cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Homepage
        </button>
      </div>

      <div className="border-b border-slate-200/80 pb-5 mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950 uppercase">
          {sectionName}
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          {isLoading ? 'Loading...' : `Showing ${products.length} products`}
        </p>
      </div>

      {isLoading ? (
        <div className="text-center py-20">
          <div className="w-8 h-8 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 border border-slate-200 rounded-3xl p-6">
          <p className="text-xs text-slate-500">No products in this section yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {products.map(p => {
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
      )}
    </div>
  );
}
