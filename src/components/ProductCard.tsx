import React, { useState } from 'react';
import { Heart, Eye, ShoppingCart } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  key?: any;
  product: Product;
  isWishlisted: boolean;
  onToggleWishlist: (product: Product) => void;
  onAddToCart: (product: Product, quantity?: number) => void;
  onNavigate: (path: string, options?: any) => void;
}

export function formatINR(usd: any): string {
  if (usd === undefined || usd === null || isNaN(Number(usd))) {
    return 'Price unavailable';
  }
  const usdNum = Number(usd);
  if (usdNum === 0) {
    return '₹0';
  }
  // Multiply by 83 to convert USD to a realistic INR value
  const inrAmount = usdNum * 83;
  return `₹${inrAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function ProductCard({
  product,
  isWishlisted,
  onToggleWishlist,
  onAddToCart,
  onNavigate
}: ProductCardProps) {
  const [flyingItems, setFlyingItems] = useState<{ id: number; img: string }[]>([]);

  // Calculate discount percentage if original price is available
  const discountPercent = product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  const handleAddClick = (e: React.MouseEvent) => {
    // Invoke the standard cart addition handlers
    onAddToCart(product);

    // Spawn animated floating thumbnail clone
    const newItem = {
      id: Date.now(),
      img: product.images[0]
    };
    setFlyingItems(prev => [...prev, newItem]);

    // Cleanup flight path clone after animation completes
    setTimeout(() => {
      setFlyingItems(prev => prev.filter(item => item.id !== newItem.id));
    }, 900);
  };

  return (
    <div 
      className="relative bg-white border border-slate-200/80 rounded-[14px] overflow-hidden p-2.5 flex flex-col justify-between hover:shadow-md transition-all duration-300 group h-auto"
      id={`prod_card_fidelity_${product.id}`}
    >
      {/* Dynamic Flying Item Clones for Cart throwing UX effect */}
      {flyingItems.map(item => (
        <div
          key={item.id}
          className="absolute z-50 pointer-events-none animate-throw"
          style={{
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        >
          <div className="w-12 h-12 rounded-full border-2 border-emerald-500 bg-white shadow-xl overflow-hidden flex items-center justify-center p-0.5 animate-pulse">
            <img 
              src={item.img} 
              alt="throwing mini thumbnail" 
              className="w-full h-full object-cover rounded-full" 
              referrerPolicy="no-referrer" 
            />
          </div>
        </div>
      ))}

      {/* Upper image + badges section */}
      <div className="relative">
        <div 
          onClick={() => onNavigate(`category/${product.category}/${product.slug}`)}
          className="w-full aspect-square bg-[#f8fafc] rounded-[10px] overflow-hidden flex items-center justify-center cursor-pointer relative"
        >
          <img 
            src={product.images[0]} 
            alt={product.name} 
            className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-550"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Badges Overlay on top-left of image - % OFF ONLY */}
        <div className="absolute top-2 left-2 pointer-events-none">
          {discountPercent ? (
            <span className="bg-[#e11d48] text-white text-[9px] font-black px-1.5 py-0.5 rounded-[4px] shadow-sm">
              {discountPercent}% OFF
            </span>
          ) : (
            <span className="bg-[#e11d48] text-white text-[9px] font-black px-1.5 py-0.5 rounded-[4px] shadow-sm">
              10% OFF
            </span>
          )}
        </div>

        {/* Circle Actions on top-right of image - WISHLIST ONLY */}
        <div className="absolute top-2 right-2">
          <button 
            onClick={() => onToggleWishlist(product)}
            className={`w-7 h-7 rounded-full flex items-center justify-center border transition-all duration-200 shadow-sm cursor-pointer ${
              isWishlisted 
                ? 'bg-rose-50 border-rose-200 text-[#e11d48]' 
                : 'bg-white border-slate-150 text-slate-400 hover:text-[#e11d48] hover:bg-rose-50'
            }`}
            title="Wishlist item"
          >
            <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>

      {/* Info Content Section - Compact with NO free gaps */}
      <div className="mt-2.5 flex-grow flex flex-col justify-between space-y-2">
        <div className="text-left">
          {/* Brand Name */}
          <div className="text-[10px] font-extrabold tracking-wider text-slate-400 uppercase truncate">
            {product.vendorName || "Shopevalley"}
          </div>

          {/* Product details and name - MAX 2 LINES */}
          <h3 
            onClick={() => onNavigate(`category/${product.category}/${product.slug}`)}
            className="text-[11px] sm:text-[12px] font-bold text-slate-800 leading-tight line-clamp-2 h-8 mt-0.5 cursor-pointer hover:text-blue-600 transition-colors"
          >
            {product.name}
          </h3>
        </div>

        {/* Pricing details and button - no unnecessary gaps */}
         <div className="text-left space-y-2 pt-0.5">
          {/* Row of original price strike-through (LEFT) & discounted price (RIGHT) */}
          <div className="flex items-baseline justify-between gap-1 w-full">
            <span className="text-[9px] sm:text-[10px] line-through text-slate-400 font-sans font-medium shrink-0">
              MRP: {formatINR(product.originalPrice || Math.round(product.price * 1.15))}
            </span>
            <span className="text-[13px] sm:text-[15px] font-black text-emerald-700 font-sans select-all">
              {formatINR(product.price)}
            </span>
          </div>

          {/* ADD TO CART Button */}
          <button 
            onClick={handleAddClick}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-[10.5px] font-extrabold py-2 px-2.5 rounded-[8px] flex items-center justify-center gap-1 transition-all active:scale-[0.97] shadow-sm cursor-pointer shrink-0 uppercase tracking-wider"
          >
            <ShoppingCart className="w-3.5 h-3.5 text-white" />
            <span className="text-white">Add To Cart</span>
          </button>
        </div>
      </div>
    </div>
  );
}
