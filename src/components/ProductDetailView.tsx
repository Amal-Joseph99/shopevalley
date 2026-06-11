import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  Share2, 
  ShoppingCart, 
  CreditCard, 
  MapPin, 
  ChevronUp, 
  ChevronDown, 
  Star, 
  ArrowLeft,
  Truck,
  RotateCcw,
  ShieldCheck,
  Check,
  Plus,
  Minus
} from 'lucide-react';
import { Product } from '../types';
import ProductCard, { formatINR } from './ProductCard';

interface ProductDetailViewProps {
  product: Product;
  allProducts: Product[];
  wishlist: Product[];
  onToggleWishlist: (product: Product) => void;
  onAddToCart: (product: Product, quantity?: number, variant?: any, selectedSize?: string, selectedColour?: string) => void;
  onNavigate: (path: string, options?: any) => void;
  currentUser: any;
}

export default function ProductDetailView({
  product,
  allProducts,
  wishlist,
  onToggleWishlist,
  onAddToCart,
  onNavigate,
  currentUser
}: ProductDetailViewProps) {
  // Image gallery state
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Accordion states (About, Specs, Important Note, Directions)
  const [isAboutExpanded, setIsAboutExpanded] = useState(true);
  const [isSpecsExpanded, setIsSpecsExpanded] = useState(true);
  const [isImportantNoteExpanded, setIsImportantNoteExpanded] = useState(true);
  const [isDirectionsExpanded, setIsDirectionsExpanded] = useState(true);

  // Pincode checking state
  const [pincode, setPincode] = useState('');
  const [pincodeResult, setPincodeResult] = useState<string | null>(null);

  const hasVariants = !!(product.variants && product.variants.length > 0);
  
  // Extract unique sizes and colours from variants list
  const availableSizes = hasVariants
    ? Array.from(new Set(product.variants?.map((v) => v.size) || []))
    : ['Free Size'];
    
  const availableColours = hasVariants
    ? Array.from(new Set(product.variants?.map((v) => v.colour) || []))
    : ['Default'];

  // Size and Colour selector states
  const [selectedSize, setSelectedSize] = useState('Free Size');
  const [selectedColour, setSelectedColour] = useState('Default');

  // Interactive review list state
  const [reviewsList, setReviewsList] = useState<{
    id: number;
    user: string;
    rating: number;
    title: string;
    comment: string;
    date: string;
  }[]>([]);
  const [isWriteReviewOpen, setIsWriteReviewOpen] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '', user: '' });

  // Reset indices & states when product slug changes
  useEffect(() => {
    setActiveImageIndex(0);
    setPincode('');
    setPincodeResult(null);
    if (hasVariants) {
      setSelectedSize(availableSizes[0] || 'Free Size');
      setSelectedColour(availableColours[0] || 'Default');
    } else {
      setSelectedSize('Free Size');
      setSelectedColour('Default');
    }
  }, [product.id, hasVariants]);

  // Handle wishlist check
  const isWishlisted = wishlist.some(item => item.id === product.id);

  const handlePincodeCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(pincode)) {
      setPincodeResult('Please enter a valid 6-digit Pincode.');
      return;
    }
    // Set a realistic delivery date based on pincode values
    const days = (parseInt(pincode[0]) % 4) + 2; 
    const date = new Date();
    date.setDate(date.getDate() + days);
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', month: 'short', day: 'numeric' };
    const formattedDate = date.toLocaleDateString('en-IN', options);
    setPincodeResult(`Delivery by ${formattedDate} | Standard Delivery available.`);
  };

  const handleShare = () => {
    const shareUrl = window.location.href;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      alert('Product link copied to clipboard!');
    } else {
      alert(`Share this link: ${shareUrl}`);
    }
  };

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReview.comment.trim()) return;
    const author = newReview.user.trim() || (currentUser?.name) || 'Shopper';
    const submission = {
      id: Date.now(),
      user: author,
      rating: newReview.rating,
      title: 'Verified Customer Review',
      comment: newReview.comment,
      date: new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })
    };
    setReviewsList([submission, ...reviewsList]);
    setNewReview({ rating: 5, comment: '', user: '' });
    setIsWriteReviewOpen(false);
  };

  // Filter similar products (from active category, excluding current product)
  const similarProducts = allProducts
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 8); // Ensure up to 8 products for exactly 2 rows of 4 cards on desktop

  // Calculate discount rate
  const discountPercent = product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 34; // default to 34% fallback as in screenshot

  // Main active image source
  const mainImageSrc = product.images[activeImageIndex] || product.images[0];

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 font-sans text-slate-800" id={`p_det_exact_screen_${product.id}`}>
      
      {/* 1. BREADCRUMBS: Home > Category > Subcategory > Title */}
      <nav className="flex flex-wrap items-center gap-1.5 text-[11.5px] font-medium text-slate-500 mb-6 py-1">
        <button onClick={() => onNavigate('')} className="hover:text-amber-500 cursor-pointer">Home</button>
        <span className="text-slate-300 font-normal">›</span>
        <button onClick={() => onNavigate(`category/${product.category}`)} className="hover:text-amber-500 cursor-pointer">{product.category}</button>
        {product.subCategory && (
          <>
            <span className="text-slate-300 font-normal">›</span>
            <span className="text-slate-400 capitalize">{product.subCategory}</span>
          </>
        )}
        <span className="text-slate-300 font-normal">›</span>
        <span className="text-slate-700 font-semibold line-clamp-1 max-w-[280px] md:max-w-md">{product.name}</span>
      </nav>

      {/* 2. CORE TOP SECTION: GRID GALLEY (LEFT) & PRODUCT DATA ACTIONS (RIGHT) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-11 pb-10">
        
        {/* LEFT COMPONENT COLUMN: Image Galleries and thumbnails */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Active Main Image Container Frame */}
          <div className="border border-slate-200 bg-white rounded-[14px] p-4 flex items-center justify-center aspect-square shadow-none relative min-h-[300px] md:min-h-[430px]">
            <img 
              src={mainImageSrc} 
              alt={product.name} 
              className="max-h-full max-w-full object-contain select-none mix-blend-multiply"
              referrerPolicy="no-referrer"
            />
            {/* Top-Right Heart Bookmark overlay tool */}
            <button
              onClick={() => onToggleWishlist(product)}
              className={`absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center bg-white shadow-md border ${
                isWishlisted ? 'border-rose-200 text-rose-600' : 'border-slate-100 text-slate-400 hover:text-rose-600'
              } transition-colors cursor-pointer z-10`}
            >
              <Heart className={`w-4.5 h-4.5 ${isWishlisted ? 'fill-current' : ''}`} />
            </button>
          </div>

          {/* Underneath Mini Gallery Thumbnails Grid (Up to 5 images as in screenshot) */}
          <div className="flex flex-wrap items-center gap-2">
            {product.images.map((imgUrl, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImageIndex(idx)}
                className={`w-14 h-14 md:w-16 md:h-16 rounded-[8px] bg-white border-2 overflow-hidden flex items-center justify-center p-0.5 transition-all ${
                  activeImageIndex === idx ? 'border-amber-400 shadow-sm scale-95' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <img 
                  src={imgUrl} 
                  alt={`thumbnail ${idx + 1}`} 
                  className="w-full h-full object-cover rounded-[5px]"
                  referrerPolicy="no-referrer"
                />
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT COMPONENT COLUMN: Information details, Pricing, Sizing, CTA buttons */}
        <div className="lg:col-span-7 flex flex-col gap-4 text-left">
          
          {/* Brand Name link */}
          <div className="text-[13px] font-semibold text-[#0066c0] hover:underline cursor-pointer">
            {product.brand || product.vendorName || "Shopevalley"}
          </div>

          {/* Product Name Title of exact size */}
          <h1 className="text-2xl md:text-[30px] font-semibold text-slate-905 tracking-tight leading-tight mt-0.5">
            {product.name}
          </h1>

          {/* Star Rating Section */}
          <div className="flex flex-wrap items-center gap-2 text-xs md:text-[13px]">
            <div className="flex text-amber-400 items-center">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={`w-4 h-4 ${i < Math.floor(product.rating || 4.5) ? 'fill-current text-amber-400' : 'text-slate-200'}`} 
                />
              ))}
            </div>
            <span className="font-bold text-slate-800">{product.rating || "4.8"} out of 5</span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-500 font-medium">({product.reviewCount || 10} customer ratings)</span>
          </div>

          {/* Short description (Paragraph limited to Max 350 char) */}
          <p className="text-[13px] md:text-[13.5px] text-slate-650 leading-relaxed font-normal py-1 border-t border-slate-100 max-w-2xl">
            {product.description.length > 350 
              ? `${product.description.substring(0, 347)}...` 
              : product.description}
          </p>

          {/* Calculate active variant parameters internally */}
          {(() => {
            const activeVariant = hasVariants
              ? product.variants?.find((v) => v.size === selectedSize && v.colour === selectedColour)
              : undefined;

            const activePrice = activeVariant ? activeVariant.price : product.price;
            const activeSku = activeVariant ? activeVariant.sku : (product.sku || 'BZD032010953');
            const activeStock = activeVariant ? activeVariant.stock : product.stock;

            return (
              <>
                {/* Price Layout */}
                <div className="border-t border-b border-slate-100 py-3.5 max-w-2xl">
                  <div className="flex items-center gap-3">
                    {/* Left-Side: MRP details with strike-through & percentage */}
                    <span className="text-xs text-slate-500 font-sans">
                      MRP: <span className="line-through">{formatINR(product.originalPrice ? (product.originalPrice / product.price * activePrice) : (activePrice * 1.5))}</span> 
                      {discountPercent > 0 && (
                        <span className="text-rose-600 font-bold ml-1.5">({discountPercent}% OFF)</span>
                      )}
                    </span>
                  </div>

                  {/* Huge bold selling price display */}
                  <div className="flex items-baseline gap-2 mt-1.5">
                    <span className="text-2xl md:text-[27px] font-extrabold text-[#0F1111] font-sans tracking-tight">
                      {formatINR(activePrice)}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">Selling Price</span>
                  </div>
                  <span className="text-[11px] text-slate-400 block mt-0.5">Inclusive of all taxes</span>
                  {hasVariants && (
                    <span className="text-[10px] text-amber-600 font-mono mt-1 block">
                      Variant ID: <span className="font-extrabold">{activeVariant?.id}</span>
                    </span>
                  )}
                </div>

                {/* Size Section */}
                <div className="space-y-2 max-w-2xl text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-600">Size: <span className="font-bold text-slate-900">{selectedSize}</span></span>
                    {hasVariants && <span className="text-slate-400 font-mono text-[10px]">SKU: {activeSku}</span>}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {availableSizes.map(size => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`px-4 py-2 border rounded font-bold text-center text-xs tracking-wide transition-all cursor-pointer ${
                          size === selectedSize 
                            ? 'border-[#232F3E] bg-[#FDF8E2] text-[#232F3E] shadow-xs' 
                            : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Colors section */}
                <div className="space-y-2 max-w-2xl text-xs pt-1">
                  <span className="font-medium text-slate-605 block">Color Accent: <span className="font-bold text-slate-900">{selectedColour}</span></span>
                  <div className="flex flex-wrap gap-2">
                    {availableColours.map(col => {
                      let bgClass = 'bg-[#fdf5eb]';
                      if (col === 'Black') bgClass = 'bg-stone-900';
                      else if (col === 'White') bgClass = 'bg-white border-slate-300';
                      else if (col === 'Navy') bgClass = 'bg-blue-900';
                      else if (col === 'Olive') bgClass = 'bg-emerald-990';
                      else if (col === 'Cream') bgClass = 'bg-[#f5ebd6]';
                      else if (col === 'Pink') bgClass = 'bg-pink-300';
                      
                      return (
                        <button
                          key={col}
                          onClick={() => setSelectedColour(col)}
                          className={`px-3 py-1.5 rounded-full border text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                            col === selectedColour
                              ? 'border-slate-900 ring-2 ring-amber-400 font-bold bg-slate-50'
                              : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                          }`}
                        >
                          <span className={`w-3.5 h-3.5 rounded-full ${bgClass} border inline-block`} />
                          {col}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Inventory Stock indicator */}
                <p className="text-xs font-semibold mt-1">
                  Inventory Status: {' '}
                  <span className={`font-extrabold ${activeStock <= 3 ? 'text-rose-600 animate-pulse' : 'text-slate-800'}`}>
                    {activeStock > 0 ? `Only ${activeStock} units remaining in Colorado workshop` : 'Sold out'}
                  </span>
                </p>

                {/* Core Call to action buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 max-w-2xl pt-4 border-t border-slate-100">
                  {/* Add To Cart: Classic Yellow Button */}
                  <button
                    onClick={() => onAddToCart(product, 1, activeVariant, selectedSize, selectedColour)}
                    className="bg-[#FFD814] hover:bg-[#F7CA00] text-slate-900 font-bold text-[12.5px] py-3 px-5 rounded-[8px] flex items-center justify-center gap-2 shadow-xs border border-[#FCD200] cursor-pointer transition-transform active:scale-[0.98] uppercase tracking-wider"
                  >
                    <ShoppingCart className="w-4 h-4 text-slate-800" />
                    Add To Cart
                  </button>

                  {/* Buy Now: Primary Blue Button */}
                  <button
                    onClick={() => {
                      onAddToCart(product, 1, activeVariant, selectedSize, selectedColour);
                      onNavigate('cart');
                    }}
                    className="bg-[#2F7DF6] hover:bg-[#1C69DC] text-white font-bold text-[12.5px] py-3 px-5 rounded-[8px] flex items-center justify-center gap-2 shadow-sm cursor-pointer transition-transform active:scale-[0.98] uppercase tracking-wider"
                  >
                    <CreditCard className="w-4 h-4 text-white" />
                    Buy Now
                  </button>

                  {/* Share Product: Navy/Dark Button */}
                  <button
                    onClick={handleShare}
                    className="bg-[#232F3E] hover:bg-[#192430] text-white font-bold text-[12.5px] py-3 px-5 rounded-[8px] flex items-center justify-center gap-2 shadow-sm cursor-pointer transition-transform active:scale-[0.98] uppercase tracking-wider"
                  >
                    <Share2 className="w-4 h-4 text-white" />
                    Share
                  </button>
                </div>
              </>
            );
          })()}

          {/* Interactive Delivery Pincode Checker Card */}
          <div className="bg-slate-50 border border-slate-200/85 rounded-xl p-4 max-w-2xl mt-3 text-xs md:text-[13px] space-y-3 shadow-none">
            <div className="flex items-center gap-2 text-slate-700 font-bold">
              <MapPin className="w-4 h-4 text-[#0066c0]" />
              <span>Select delivery location</span>
            </div>

            <form onSubmit={handlePincodeCheck} className="flex gap-2 max-w-md">
              <input
                type="text"
                maxLength={6}
                value={pincode}
                onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                placeholder="Enter 6-digit Pincode (e.g. 110001)"
                className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-amber-400 text-xs flex-grow"
              />
              <button 
                type="submit"
                className="bg-slate-800 hover:bg-slate-950 text-white font-bold text-xs py-1.5 px-4 rounded-lg cursor-pointer shrink-0 transition-colors"
              >
                Check
              </button>
            </form>

            <p className="text-[11px] text-slate-500 flex items-center gap-1.5 pl-1 font-sans">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-ping" />
              {pincodeResult ? (
                <span className="text-slate-800 font-semibold">{pincodeResult}</span>
              ) : (
                <span>Delivery details available at checkout</span>
              )}
            </p>
          </div>

        </div>

      </div>

      {/* 3. TAB HEADER SELECTORS: Product Details | Specifications | Reviews */}
      <div className="grid grid-cols-3 border border-slate-200 rounded-t-xl overflow-hidden mt-6 bg-[#f1f5f9] text-xs font-bold font-sans">
        
        {/* Product Details Tab */}
        <button 
          onClick={() => {
            setIsAboutExpanded(true);
            document.getElementById('accordion-about-product')?.scrollIntoView({ behavior: 'smooth' });
          }}
          className="py-3 px-2 text-center border-r border-slate-200 bg-white text-slate-900 border-b-2 border-b-amber-500 cursor-pointer hover:bg-slate-50"
        >
          Product Details
        </button>

        {/* Specifications Tab */}
        <button 
          onClick={() => {
            setIsSpecsExpanded(true);
            document.getElementById('accordion-specs-product')?.scrollIntoView({ behavior: 'smooth' });
          }}
          className="py-3 px-2 text-center border-r border-slate-200 bg-slate-100 text-slate-700 cursor-pointer hover:bg-slate-100"
        >
          Specifications
        </button>

        {/* Reviews Tab */}
        <button 
          onClick={() => {
            document.getElementById('section-reviews-product')?.scrollIntoView({ behavior: 'smooth' });
          }}
          className="py-3 px-2 text-center bg-blue-105 bg-blue-600 text-white cursor-pointer hover:bg-blue-700"
        >
          Reviews
        </button>

      </div>

      {/* 4. EXPANDABLE ACCORDION SHEETS OF SPECIFIC SCHEMIC LIST UNITS */}
      <div className="border border-t-0 border-slate-200 rounded-b-xl overflow-hidden divide-y divide-slate-100 bg-white shadow-none">
        
        {/* SECTION A: ABOUT PRODUCT ACCORDION (ExpandedByDefault) */}
        <div className="scroll-mt-10" id="accordion-about-product">
          <button
            onClick={() => setIsAboutExpanded(!isAboutExpanded)}
            className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 text-left cursor-pointer transition-colors"
          >
            <h3 className="font-extrabold text-[12.5px] md:text-sm text-slate-900 tracking-tight uppercase flex items-center gap-1.5">
              <span>About Product</span>
            </h3>
            {isAboutExpanded ? <ChevronUp className="w-4.5 h-4.5 text-slate-500" /> : <ChevronDown className="w-4.5 h-4.5 text-slate-500" />}
          </button>

          {isAboutExpanded && (
            <div className="p-5 text-left border-t border-slate-100 animate-in fade-in duration-200">
              <ul className="space-y-2.5">
                {(product.aboutProduct || [
                  `Premium choice. High utility structural companion from our core active lines.`,
                  `Fully tested for durability and built cleanly to operate with responsive precision.`,
                  `Optimized framework components with intuitive tactile indicators integrated nicely.`,
                  `Perfect blend of material science with ergonomic comfort design considerations.`,
                  `Authentically crafted device representing reliable standards of the workshop.`,
                  `Package includes all required installation components and instructional guidebook.`
                ]).map((bullet, index) => (
                  <li key={index} className="flex items-start gap-2 text-[12px] md:text-[12.5px] text-slate-650 leading-relaxed font-sans font-normal">
                    <span className="text-[#3b82f6] text-[15px] leading-none shrink-0 font-extrabold">•</span>
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* SECTION B: HIGHLIGHTS ACCORDION */}
        {product.highlights && (
          <div>
            <div className="w-full p-4 bg-slate-50 text-left border-y border-slate-100 font-sans font-bold text-[12.5px] md:text-sm text-slate-900 uppercase">
              Highlights
            </div>
            <div className="p-5 text-left text-[12px] md:text-[13px] text-slate-650 leading-relaxed font-sans font-normal border-b border-slate-100">
              {product.highlights}
            </div>
          </div>
        )}

        {/* SECTION C: SPECS & ITEM DETAILS DOUBLE GRID SHEET */}
        <div className="scroll-mt-10" id="accordion-specs-product">
          <button
            onClick={() => setIsSpecsExpanded(!isSpecsExpanded)}
            className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 text-left cursor-pointer transition-colors"
          >
            <h3 className="font-extrabold text-[12.5px] md:text-sm text-slate-900 tracking-tight uppercase">
              Features & Specifications
            </h3>
            {isSpecsExpanded ? <ChevronUp className="w-4.5 h-4.5 text-slate-500" /> : <ChevronDown className="w-4.5 h-4.5 text-slate-500" />}
          </button>

          {isSpecsExpanded && (
            <div className="p-5 border-t border-slate-100 text-left grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in duration-200">
              
              {/* Features & Specs Column */}
              <div>
                <h4 className="font-bold text-[11px] text-slate-400 tracking-wider font-mono uppercase pb-2 border-b border-slate-100">
                  Features & Specs
                </h4>
                <div className="divide-y divide-slate-100 mt-1 min-h-[140px]">
                  <div className="grid grid-cols-2 py-2.5 text-[12px] font-sans">
                    <span className="font-bold text-slate-800">Battery</span>
                    <span className="text-slate-600">{product.battery || 'Built-in rechargeable support'}</span>
                  </div>
                  <div className="grid grid-cols-2 py-2.5 text-[12px] font-sans">
                    <span className="font-bold text-slate-800">Lighting</span>
                    <span className="text-slate-600">{product.lighting || 'Ambient LED indicator'}</span>
                  </div>
                  <div className="grid grid-cols-2 py-2.5 text-[12px] font-sans">
                    <span className="font-bold text-slate-800">Microphone</span>
                    <span className="text-slate-600">{product.microphone || 'High-fidelity audio filter model'}</span>
                  </div>
                  <div className="grid grid-cols-2 py-2.5 text-[12px] font-sans">
                    <span className="font-bold text-slate-800">Connectivity</span>
                    <span className="text-slate-600">{product.connectivity || 'Wireless pairing optimized'}</span>
                  </div>
                  <div className="grid grid-cols-2 py-2.5 text-[12px] font-sans">
                    <span className="font-bold text-slate-800">Product Type</span>
                    <span className="text-slate-600">{product.productType || 'Premium specialty appliance'}</span>
                  </div>
                </div>
              </div>

              {/* Item Details Column */}
              <div>
                <h4 className="font-bold text-[11px] text-slate-400 tracking-wider font-mono uppercase pb-2 border-b border-slate-100">
                  Item Details
                </h4>
                <div className="divide-y divide-slate-100 mt-1">
                  <div className="grid grid-cols-2 py-2 text-[11px] font-sans">
                    <span className="font-bold text-slate-800">Brand</span>
                    <span className="text-slate-600 font-semibold text-[#0066c0]">{product.brand || product.vendorName || "Shopevalley"}</span>
                  </div>
                  <div className="grid grid-cols-2 py-2 text-[11px] font-sans">
                    <span className="font-bold text-slate-800">SKU</span>
                    <span className="text-slate-600 font-mono text-[10px]">{product.sku || `BZD${product.idKey || 'SPEC029'}`}</span>
                  </div>
                  <div className="grid grid-cols-2 py-2 text-[11px] font-sans">
                    <span className="font-bold text-slate-800">HSN Code</span>
                    <span className="text-slate-600 font-mono text-[10px]">{product.hsnCode || '85182200'}</span>
                  </div>
                  <div className="grid grid-cols-2 py-2 text-[11px] font-sans">
                    <span className="font-bold text-slate-800">Category</span>
                    <span className="text-slate-600">{product.category}</span>
                  </div>
                  <div className="grid grid-cols-2 py-2 text-[11px] font-sans">
                    <span className="font-bold text-slate-800">In Stock</span>
                    <span className="text-slate-600 font-bold text-emerald-600">{product.stock > 0 ? 'Yes' : 'Out of stock'}</span>
                  </div>
                  <div className="grid grid-cols-2 py-2 text-[11px] font-sans">
                    <span className="font-bold text-slate-800">Manufacturer Name</span>
                    <span className="text-slate-600">{product.manufacturerName || 'Shopevalley Workshop Hub'}</span>
                  </div>
                  <div className="grid grid-cols-2 py-2 text-[11px] font-sans">
                    <span className="font-bold text-slate-800">Manufacturer Country</span>
                    <span className="text-slate-600">{product.manufacturerCountry || product.countryOfOrigin || 'India'}</span>
                  </div>
                  <div className="grid grid-cols-2 py-2 text-[11px] font-sans">
                    <span className="font-bold text-slate-800">Country of Origin</span>
                    <span className="text-slate-600">{product.countryOfOrigin || 'India'}</span>
                  </div>
                  {product.weight && (
                    <div className="grid grid-cols-2 py-2 text-[11px] font-sans">
                      <span className="font-bold text-slate-800">Item Weight</span>
                      <span className="text-slate-600">{product.weight}</span>
                    </div>
                  )}
                  {product.dimensions && (
                    <div className="grid grid-cols-2 py-2 text-[11px] font-sans">
                      <span className="font-bold text-slate-800">Dimensions</span>
                      <span className="text-slate-600">{product.dimensions}</span>
                    </div>
                  )}
                  {product.package && (
                    <div className="grid grid-cols-2 py-2 text-[11px] font-sans">
                      <span className="font-bold text-slate-800">Package</span>
                      <span className="text-slate-600">{product.package}</span>
                    </div>
                  )}
                </div>
              </div>

            </div>
          )}
        </div>

        {/* SECTION D: DIRECTIONS OF USE ACCORDION */}
        {product.directions && (
          <div>
            <button
              onClick={() => setIsDirectionsExpanded(!isDirectionsExpanded)}
              className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 text-left cursor-pointer transition-colors border-t border-slate-100"
            >
              <h3 className="font-extrabold text-[12.5px] md:text-sm text-slate-900 tracking-tight uppercase">
                Directions
              </h3>
              {isDirectionsExpanded ? <ChevronUp className="w-4.5 h-4.5 text-slate-500" /> : <ChevronDown className="w-4.5 h-4.5 text-slate-500" />}
            </button>
            {isDirectionsExpanded && (
              <div className="p-5 text-left border-t border-slate-100 animate-in fade-in duration-200">
                <ol className="list-decimal pl-5 space-y-2 text-[12px] md:text-[12.5px] text-slate-650 leading-relaxed font-sans font-normal">
                  {product.directions.map((d, index) => (
                    <li key={index} className="pl-1">
                      {d}
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        )}

        {/* SECTION E: IMPORTANT NOTE / INGREDIENTS */}
        <div className="bg-[#eff6ff] border-t border-b border-blue-100">
          <button
            onClick={() => setIsImportantNoteExpanded(!isImportantNoteExpanded)}
            className="w-full flex items-center justify-between p-4 bg-[#eff6ff] hover:bg-[#dbeafe] text-left cursor-pointer transition-colors"
          >
            <h3 className="font-extrabold text-[12px] md:text-xs text-blue-800 tracking-wider uppercase font-mono">
              ★ Important Note
            </h3>
            {isImportantNoteExpanded ? <ChevronUp className="w-4.5 h-4.5 text-blue-600" /> : <ChevronDown className="w-4.5 h-4.5 text-blue-600" />}
          </button>

          {isImportantNoteExpanded && (
            <div className="p-5 pt-1 text-left text-[11.5px] md:text-[12px] text-blue-900 leading-relaxed font-sans font-normal border-t border-blue-100/40">
              <p className="bg-white/80 border border-blue-100 p-3 rounded-lg flex items-start gap-2 whitespace-pre-line shadow-xs">
                {product.importantNote || 'Adult supervision is recommended. Stated weights and sizes may slightly vary owing to raw material batch variation.'}
              </p>
            </div>
          )}
        </div>

      </div>

      {/* 5. SEAMLESS FREE SHIPPING / FLEXIBLE PAYMENT / SUPPORT BANNER BAR */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-8 mt-1.5 border-b border-slate-200">
        <div className="bg-slate-50 border border-slate-150 p-4 rounded-xl flex items-center gap-3 text-left">
          <div className="w-10 h-10 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
            <Truck className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h5 className="font-bold text-[12.5px] text-slate-800 leading-snug">Free Shipping</h5>
            <p className="text-[11px] text-slate-400 font-medium">Free shipping for order above ₹499</p>
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-150 p-4 rounded-xl flex items-center gap-3 text-left">
          <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
            <RotateCcw className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h5 className="font-bold text-[12.5px] text-slate-800 leading-snug">Flexible Payments</h5>
            <p className="text-[11px] text-slate-400 font-medium">Multiple secure payment options</p>
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-150 p-4 rounded-xl flex items-center gap-3 text-left">
          <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h5 className="font-bold text-[12.5px] text-slate-800 leading-snug">24x7 Active Support</h5>
            <p className="text-[11px] text-slate-400 font-medium">We support online all days smoothly</p>
          </div>
        </div>
      </div>

      {/* 6. COMPREHENSIVE CUSTOMER REVIEWS RATING AREA */}
      <div className="py-10 grid grid-cols-1 lg:grid-cols-12 gap-8 scroll-mt-12" id="section-reviews-product">
        
        {/* Left Side: Summary stats bars */}
        <div className="lg:col-span-4 text-left space-y-4">
          <h3 className="font-extrabold text-[17px] md:text-lg text-slate-900 tracking-tight">Customer reviews</h3>
          
          <div className="flex items-center gap-2">
            <div className="flex text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`w-5 h-5 ${i < Math.floor(product.rating) ? 'fill-current' : 'text-slate-205'}`} />
              ))}
            </div>
            <span className="font-extrabold text-slate-900 text-sm md:text-base">{product.rating} out of 5</span>
          </div>
          <span className="text-slate-450 text-[11px] block text-slate-400 leading-none">0 global ratings</span>

          {/* Sizing stars bars layout of Amazon standard */}
          <div className="space-y-2 pt-2.5 text-[11.5px] max-w-xs text-slate-500 font-sans">
            {[
              { label: '5 star', width: '0%' },
              { label: '4 star', width: '0%' },
              { label: '3 star', width: '0%' },
              { label: '2 star', width: '0%' },
              { label: '1 star', width: '0%' }
            ].map(row => (
              <div key={row.label} className="flex items-center gap-2.5">
                <span className="font-medium text-[#0066c0] hover:underline cursor-pointer py-0.5 shrink-0 w-8">{row.label}</span>
                <div className="flex-1 h-4 bg-slate-100 border border-slate-200/80 rounded-[3px] overflow-hidden">
                  <div className="h-full bg-amber-400" style={{ width: row.width }} />
                </div>
                <span className="font-bold text-slate-500 text-right w-8">{row.width}</span>
              </div>
            ))}
          </div>

          <div className="pt-4">
            <h4 className="font-black text-[13px] text-slate-900">Review this product</h4>
            <p className="text-[11.5px] text-slate-450 text-slate-400 mt-1 pb-3">Share your thoughts with other customers</p>
            <button
              onClick={() => setIsWriteReviewOpen(true)}
              className="px-6 py-2 border border-slate-320/80 bg-white hover:bg-slate-50 rounded-full font-bold text-xs text-slate-800 select-none cursor-pointer transition-colors shadow-xs w-full max-w-xs"
            >
              Write a product review
            </button>
          </div>
        </div>

        {/* Right Side: Reviews lists comments */}
        <div className="lg:col-span-8 text-left space-y-6">
          <div className="border-b border-slate-150 pb-2">
            <h4 className="font-black text-sm text-slate-900 tracking-tight pb-1">Top critical feedback</h4>
          </div>

          {isWriteReviewOpen && (
            <form onSubmit={handleAddReview} className="bg-[#f8fafc] border border-amber-200 rounded-xl p-5 space-y-4 text-xs animate-in slide-in-from-top duration-300">
              <h5 className="font-extrabold text-[13px] text-slate-900 uppercase tracking-tight">Post Your Product Review</h5>
              
              <div className="space-y-1">
                <label className="block text-slate-600 font-bold">Your Name / Alias</label>
                <input 
                  type="text" 
                  value={newReview.user}
                  onChange={(e) => setNewReview({ ...newReview, user: e.target.value })}
                  placeholder="Anonymous Shopper"
                  className="bg-white border border-slate-300 rounded-lg px-3 py-2 w-full max-w-md focus:outline-none focus:ring-1 focus:ring-amber-400"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-slate-600 font-bold">Rating stars</label>
                <select 
                  value={newReview.rating}
                  onChange={(e) => setNewReview({ ...newReview, rating: parseInt(e.target.value) })}
                  className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-amber-400 font-bold"
                >
                  <option value={5}>5 Stars (Excellent)</option>
                  <option value={4}>4 Stars (Good)</option>
                  <option value={3}>3 Stars (Average)</option>
                  <option value={2}>2 Stars (Poor)</option>
                  <option value={1}>1 Star (Awful)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-slate-600 font-bold">Written Review (Your Experience)</label>
                <textarea 
                  rows={4}
                  value={newReview.comment}
                  onChange={(e) => setNewReview({...newReview, comment: e.target.value})}
                  placeholder="How is the sound quality? Battery back up? Describe features carefully."
                  className="bg-white border border-slate-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-1 focus:ring-amber-400 leading-relaxed font-sans"
                  required
                />
              </div>

              <div className="flex gap-2.5">
                <button 
                  type="submit" 
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black px-5 py-2 rounded-lg cursor-pointer transition-colors"
                >
                  Submit Review
                </button>
                <button 
                  type="button" 
                  onClick={() => setIsWriteReviewOpen(false)}
                  className="bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold px-4 py-2 rounded-lg cursor-pointer transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {reviewsList.length === 0 ? (
            <div className="text-left py-6 text-xs text-slate-500 font-medium">
              No reviews yet. Be the first to review.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 space-y-5">
              {reviewsList.map(rev => (
                <div key={rev.id} className="pt-2.5 first:pt-0 text-left space-y-1 animate-in fade-in duration-300">
                  <div className="flex items-center gap-2">
                    <div className="w-6.5 h-6.5 rounded-full bg-slate-200/80 flex items-center justify-center font-bold text-slate-600 text-[11px] shrink-0 uppercase">
                      {rev.user.substring(0,2)}
                    </div>
                    <span className="font-extrabold text-slate-800 text-xs">{rev.user}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11.5px]">
                    <div className="flex text-amber-500">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-current' : 'text-slate-150 text-slate-200'}`} />
                      ))}
                    </div>
                    <span className="font-black text-slate-900 leading-snug">{rev.title}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-semibold mb-1">Reviewed on {rev.date} • <span className="text-emerald-700 font-bold">Verified Purchase</span></p>
                  <p className="text-[12.5px] text-slate-650 font-normal leading-relaxed italic pr-2 font-sans">
                    "{rev.comment}"
                  </p>
                </div>
              ))}
            </div>
          )}

        </div>

      </div>

      {/* 7. SIMILAR PRODUCTS: 2 ROWS EXACTLY AS USER REQUESTED */}
      <div className="pt-10 border-t border-slate-200">
        <div className="flex items-center gap-2.5 mb-6 text-left">
          {/* Vertical yellow line accent */}
          <div className="w-1.5 h-5 bg-amber-500 rounded-sm" />
          <h3 className="font-black text-sm md:text-base text-slate-900 uppercase tracking-wider font-sans">
            Similar Products
          </h3>
        </div>

        {/* 2-Row Grid: Responsive grid rendering. Matches desktop 4 items per row, exactly 2 rows = 8 items */}
        {similarProducts.length === 0 ? (
          <p className="text-left text-xs text-slate-400">No other products listed in this department currently.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
            {similarProducts.map(p => (
              <ProductCard
                key={p.id}
                product={p}
                isWishlisted={wishlist.some(item => item.id === p.id)}
                onToggleWishlist={onToggleWishlist}
                onAddToCart={onAddToCart}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
