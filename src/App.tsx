import { useState, useEffect } from 'react';
import { 
  useHashRouter, 
  RouteState 
} from './components/CustomRouter';
import Header from './components/Header';
import Recommendations from './components/Recommendations';
import ProductCard from './components/ProductCard';
import CartAndCheckout from './components/CartAndCheckout';
import OrderTracker from './components/OrderTracker';
import VendorPortal from './components/VendorPortal';
import LoginScreen from './components/LoginScreen';
import AdminPanel from './components/AdminPanel';
import ProductDetailView from './components/ProductDetailView';
import ProfilePage from './components/ProfilePage';
import AddressesPage from './components/AddressesPage';
import MyOrdersPage from './components/MyOrdersPage';
import NotificationsPage from './components/NotificationsPage';
import { PRODUCTS, VENDORS } from './data';
import { Product, Vendor, CartItem, Order, LoggedUser, ProductVariant } from './types';
import { 
  Heart, 
  ShoppingCart, 
  MapPin, 
  ShieldCheck, 
  ChevronRight, 
  ArrowLeft, 
  Star, 
  MessageSquare,
  ChevronLeft,
  Briefcase,
  Store,
  Info,
  ExternalLink,
  AlertCircle,
  Flame,
  Plus,
  Sparkles
} from 'lucide-react';

export default function App() {
  const { route, navigate, rawHash } = useHashRouter();

  // Core reactive datasets
  const [products, setProducts] = useState<Product<Product[]>>(() => {
    const cached = localStorage.getItem('sv_products');
    return cached ? JSON.parse(cached) : [];
  });

  const [vendors, setVendors] = useState<Vendor[]>(() => {
    const cached = localStorage.getItem('sv_vendors');
    return cached ? JSON.parse(cached) : [];
  });

  // User States
  const [cart, setCart] = useState<CartItem[]>(() => {
    const cached = localStorage.getItem('sv_cart');
    if (!cached) return [];
    try {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed)) {
        return parsed.map((item: any) => {
          const product = item.product || PRODUCTS.find((p: any) => p.id === item.productId) || PRODUCTS[0];
          const productId = item.productId || product?.id || '';
          
          let variantId = item.variantId || 'STANDARD';
          let selectedSize = item.selectedSize || item.size || 'Free Size';
          let selectedColour = item.selectedColour || item.colour || 'Default';
          
          let quantity = typeof item.quantity === 'number' && !isNaN(item.quantity) ? item.quantity : 1;
          if (quantity <= 0) quantity = 1;
          
          let unitPrice = typeof item.unitPrice === 'number' && !isNaN(item.unitPrice) ? item.unitPrice : null;
          
          if (unitPrice === null) {
            if (product && product.variants && product.variants.length > 0) {
              const matchedVariant = product.variants.find((v: any) => v.size === selectedSize && v.colour === selectedColour);
              if (matchedVariant) {
                unitPrice = matchedVariant.price;
                variantId = matchedVariant.id;
              } else {
                unitPrice = product.variants[0].price;
                variantId = product.variants[0].id;
              }
            } else if (product) {
              unitPrice = product.price;
            } else {
              unitPrice = 0;
            }
          }
          
          if (typeof unitPrice !== 'number' || isNaN(unitPrice)) {
            unitPrice = 0;
          }

          const subtotal = Math.round(unitPrice * quantity * 100) / 100;
          
          return {
            id: item.id || `${productId}-${variantId}`,
            product,
            productId,
            variantId,
            productName: item.productName || product?.name || '',
            selectedSize,
            selectedColour,
            size: selectedSize,
            colour: selectedColour,
            quantity,
            unitPrice,
            subtotal
          };
        });
      }
    } catch (e) {
      console.error("Cart hydration error, resetting cart", e);
    }
    return [];
  });

  const [wishlist, setWishlist] = useState<Product[]>(() => {
    const cached = localStorage.getItem('sv_wishlist');
    return cached ? JSON.parse(cached) : [];
  });

  const [viewHistory, setViewHistory] = useState<string[]>(() => {
    const cached = localStorage.getItem('sv_view_history');
    return cached ? JSON.parse(cached) : [];
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const cached = localStorage.getItem('sv_orders');
    if (cached) return JSON.parse(cached);
    
    // Seed initial orders so tracker is interactive on first load
    const seed: Order[] = [
      {
        id: 'SV-9812A',
        items: [
          { productId: 'p1', name: 'Speckled Stoneware Coffee Mug', price: 36, quantity: 1, vendorId: 'v1' }
        ],
        subtotal: 36,
        shipping: 6,
        tax: 2.88,
        total: 44.88,
        customerName: 'Denver Resident',
        email: 'denver.buyer@gmail.com',
        address: '2001 Colorado Blvd',
        city: 'Denver',
        zipCode: '80205',
        phone: '303-555-0155',
        status: 'pending',
        paymentMethod: 'ShopeValley Wallet Testing',
        createdAt: new Date().toISOString(),
        estimatedDelivery: 'Within 24 hours',
        trackingSteps: [
          { status: 'Order Verified', description: 'Workshop accepted order details.', time: 'Just now', done: true },
          { status: 'In Preparation', description: 'Artisan is packaging or kiln sealing.', time: 'Estimated within 1 hour', done: true },
          { status: 'Local Driver Dispatched', description: 'Electric courier routing assigned.', time: 'On route', done: true },
          { status: 'Delivered', description: 'Arrived on doorstep.', time: 'Expected shortly', done: false }
        ]
      }
    ];
    return seed;
  });

  // Client-side quick filter parameters
  const [searchQuery, setSearchQuery] = useState('');
  const [locationDistance, setLocationDistance] = useState<number>(50); // Default to check within 50 miles radius
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('All');

  // User Authentication State (managed by Supabase)
  const [currentUser, setCurrentUser] = useState<LoggedUser | null>(() => {
    const cached = localStorage.getItem('sv_current_user');
    return cached ? JSON.parse(cached) : null;
  });

  const [authDialog, setAuthDialog] = useState({
    open: false,
    title: '',
    message: '',
    actionLabel: 'Login / Signup',
    actionPath: 'login'
  });

  const showAuthDialog = (title: string, message: string, actionPath = 'login', actionLabel = 'Login / Signup') => {
    setAuthDialog({
      open: true,
      title,
      message,
      actionLabel,
      actionPath
    });
  };

  const hideAuthDialog = () => {
    setAuthDialog((prev) => ({ ...prev, open: false }));
  };

  const isGuestAllowedPath = (path: string) => {
    if (!path || path === '/' || path === 'login' || path === 'register' || path === 'verify-otp' || path === 'wishlist') {
      return true;
    }
    if (path.startsWith('category/') || path.startsWith('section/') || path.startsWith('vendor/')) {
      return true;
    }
    return false;
  };

  const isBuyerOnlyPath = (path: string) => {
    return [
      'cart',
      'checkout',
      'shipping-address',
      'order-summary',
      'track-order',
      'order-status',
      'profile',
      'addresses',
      'my-orders',
      'notifications'
    ].includes(path);
  };

  const isAdminOnlyPath = (path: string) => {
    return path === 'admin' || path === 'vendor-portal';
  };

  const handleProtectedNavigate = (path: string, options?: { page?: number; q?: string }) => {
    const normalized = path.replace(/^#\/?/, '');

    if (currentUser?.role === 'ADMIN' && normalized !== 'admin') {
      showAuthDialog(
        'Admin Access Only',
        'Admins may only use the admin dashboard. Please switch to an admin dashboard workflow.',
        'admin',
        'Go to Admin'
      );
      return;
    }

    if (!currentUser && !isGuestAllowedPath(normalized)) {
      showAuthDialog(
        'Signup Required',
        'You need to sign up or log in before accessing this page.',
        'login',
        'Login / Signup'
      );
      return;
    }

    if (currentUser?.role === 'BUYER' && isAdminOnlyPath(normalized)) {
      showAuthDialog(
        'Admin Page Restricted',
        'Buyer accounts cannot access the admin area.',
        '',
        'Close'
      );
      return;
    }

    if (currentUser?.role === 'ADMIN' && normalized === 'login') {
      navigate('admin');
      return;
    }

    navigate(normalized, options);
  };

  const handleAddToCartWithAuth = (
    product: Product,
    qty: number = 1,
    variant?: ProductVariant,
    selectedSize?: string,
    selectedColour?: string
  ) => {
    if (!currentUser) {
      showAuthDialog(
        'Login Required',
        'Please log in to add items to your cart or proceed with checkout.',
        'login',
        'Login Now'
      );
      return;
    }

    if (currentUser.role !== 'BUYER') {
      showAuthDialog(
        'Buyer Access Required',
        'Only buyer accounts are allowed to place orders on ShopeValley.',
        '',
        'Close'
      );
      return;
    }

    handleAddToCart(product, qty, variant, selectedSize, selectedColour);
  };

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('sv_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('sv_current_user');
    }
  }, [currentUser]);

  useEffect(() => {
    const normalized = route.path || '/';

    if (currentUser?.role === 'ADMIN' && normalized !== 'admin') {
      showAuthDialog(
        'Admin Dashboard Only',
        'Admin users can only use the admin dashboard.',
        'admin',
        'Go to Admin'
      );
      navigate('admin');
      return;
    }

    if (!currentUser && !isGuestAllowedPath(normalized)) {
      showAuthDialog(
        'Signup Required',
        'You need to sign up or login to open this page.',
        'login',
        'Login / Signup'
      );
      navigate('');
      return;
    }

    if (currentUser?.role === 'BUYER' && isAdminOnlyPath(normalized)) {
      showAuthDialog(
        'Admin Restricted',
        'Buyer accounts cannot enter the admin console.',
        '',
        'Close'
      );
      navigate('');
      return;
    }
  }, [route, currentUser]);

  // Sync state changes to localStorage
  useEffect(() => {
    localStorage.setItem('sv_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('sv_vendors', JSON.stringify(vendors));
  }, [vendors]);

  useEffect(() => {
    localStorage.setItem('sv_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('sv_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    localStorage.setItem('sv_view_history', JSON.stringify(viewHistory));
  }, [viewHistory]);

  useEffect(() => {
    localStorage.setItem('sv_orders', JSON.stringify(orders));
  }, [orders]);

  // Product page viewing logger inside router changes
  useEffect(() => {
    if (route.productSlug) {
      const match = products.find(p => p.slug === route.productSlug);
      if (match) {
        setViewHistory((prev) => {
          if (prev.includes(match.id)) return prev;
          return [match.id, ...prev].slice(0, 8); // Hold up to 8 items in history
        });
      }
    }
  }, [route.productSlug, products]);

  // Cart operations
  const handleAddToCart = (
    product: Product, 
    qty: number = 1, 
    variant?: ProductVariant, 
    selectedSize?: string, 
    selectedColour?: string
  ) => {
    setCart((prev) => {
      const variantId = variant ? variant.id : 'STANDARD';
      const sizeStr = selectedSize || 'Free Size';
      const colourStr = selectedColour || 'Default';
      const price = typeof (variant ? variant.price : product.price) === 'number' && !isNaN(variant ? variant.price : product.price)
        ? (variant ? variant.price : product.price)
        : 0;
      const cartItemId = `${product.id}-${variantId}`;
      const validQty = typeof qty === 'number' && !isNaN(qty) && qty > 0 ? qty : 1;
      
      const existing = prev.find(item => item.id === cartItemId);
      if (existing) {
        return prev.map(item => {
          if (item.id === cartItemId) {
            const finalQty = item.quantity + validQty;
            return { 
              ...item, 
              quantity: finalQty, 
              subtotal: Math.round(finalQty * price * 100) / 100 
            };
          }
          return item;
        });
      }
      const newItem: CartItem = {
        id: cartItemId,
        product,
        productId: product.id,
        variantId,
        productName: product.name,
        selectedSize: sizeStr,
        selectedColour: colourStr,
        size: sizeStr,
        colour: colourStr,
        quantity: validQty,
        unitPrice: price,
        subtotal: Math.round(validQty * price * 100) / 100
      };
      return [...prev, newItem];
    });
  };

  const handleModifyQty = (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveFromCart(cartItemId);
      return;
    }
    setCart((prev) => prev.map(item => {
      if (item.id === cartItemId) {
        const qty = typeof quantity === 'number' && !isNaN(quantity) && quantity > 0 ? quantity : 1;
        const price = typeof item.unitPrice === 'number' && !isNaN(item.unitPrice) ? item.unitPrice : 0;
        return { 
          ...item, 
          quantity: qty, 
          subtotal: Math.round(qty * price * 100) / 100 
        };
      }
      return item;
    }));
  };

  const handleRemoveFromCart = (cartItemId: string) => {
    setCart((prev) => prev.filter(item => item.id !== cartItemId));
  };

  const handleClearCart = () => setCart([]);

  // Wishlist triggers
  const handleToggleWishlist = (product: Product) => {
    setWishlist((prev) => {
      const exists = prev.some(p => p.id === product.id);
      if (exists) {
        return prev.filter(p => p.id !== product.id);
      }
      return [...prev, product];
    });
  };

  // Vendor operations
  const handleAddProduct = (newP: Product) => {
    setProducts((prev) => [newP, ...prev]);
  };

  const handleAddVendor = (newV: Vendor) => {
    setVendors((prev) => [...prev, newV]);
  };

  const handleDeleteProduct = (prodId: string) => {
    setProducts((prev) => prev.filter(p => p.id !== prodId));
  };

  const handlePlaceOrder = (newOrder: Order) => {
    setOrders((prev) => [newOrder, ...prev]);
  };

  // Filter application algorithms
  const getFilteredProducts = () => {
    return products.filter(p => {
      // 1. Search Query text check
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch = query === '' || 
        p.name.toLowerCase().includes(query) || 
        p.description.toLowerCase().includes(query) || 
        p.tags.some(t => t.toLowerCase().includes(query)) ||
        p.vendorName.toLowerCase().includes(query);

      // 2. Category selection check
      const matchesCategory = selectedCategoryFilter === 'All' || p.category === selectedCategoryFilter;

      // 3. Distance check matching appropriate vendor distance from Denver
      const vendor = vendors.find(v => v.id === p.vendorId);
      const matchesDistance = !vendor || vendor.distance <= locationDistance;

      return matchesSearch && matchesCategory && matchesDistance;
    });
  };

  const allFilteredProducts = getFilteredProducts();

  // Multi-vendor custom bio highlight
  const activeArtisanHighlights = vendors.filter(v => 
    v.distance <= locationDistance && 
    (selectedCategoryFilter === 'All' || v.category === selectedCategoryFilter)
  );

  return (
    <div className="min-h-screen bg-[#fdfdfd] text-slate-900 flex flex-col justify-between" id="sv_app_root">
      
      {/* Mock URL bar removed per user request */}

      {/* 2. Global Header Navigation Modules */}
      {route.path !== 'admin' && (
        <Header 
          cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
          wishlistCount={wishlist.length}
          currentRoute={route}
          onNavigate={handleProtectedNavigate}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          locationDistance={locationDistance}
          setLocationDistance={setLocationDistance}
          selectedCategoryFilter={selectedCategoryFilter}
          setSelectedCategoryFilter={setSelectedCategoryFilter}
          currentUser={currentUser}
          onLogout={() => setCurrentUser(null)}
        />
      )}

      {/* 3. Primary Workspace rendering route logic */}
      <main className="flex-grow pb-14">
        
        {/* VIEW 1: PRODUCT DETAILS PAGE (shopevalley.com/category/product-slug format) */}
        {route.categoryName && route.productSlug ? (() => {
          const product = products.find(p => p.slug === route.productSlug);
          if (!product) {
            return (
              <div className="max-w-xl mx-auto px-4 py-20 text-center">
                <AlertCircle className="w-12 h-12 text-rose-500 mx-auto animate-bounce mb-4" />
                <h2 className="font-extrabold text-xl text-slate-900 leading-none">Artisan craft not located</h2>
                <p className="text-xs text-slate-500 mt-1">This product might have been deleted from active workshop lists.</p>
                <button onClick={() => navigate('')} className="mt-5 bg-slate-950 text-white font-bold py-2 px-6 rounded-lg text-xs">
                  Return To Valley Direct
                </button>
              </div>
            );
          }

          return (
            <ProductDetailView
              product={product}
              allProducts={products}
              wishlist={wishlist}
              onToggleWishlist={handleToggleWishlist}
              onAddToCart={handleAddToCartWithAuth}
              onNavigate={handleProtectedNavigate}
              currentUser={currentUser}
            />
          );
        })() : null}

        {/* VIEW 2: CATEGORY PAGE WITH URL-BASED PAGINATION */}
        {route.categoryName && !route.productSlug ? (() => {
          const catName = route.categoryName;
          
          // Filter matching category items
          const matchingProducts = allFilteredProducts.filter(p => p.category === catName);

          // URL based pagination params
          const pageSize = 4;
          const totalPages = Math.max(1, Math.ceil(matchingProducts.length / pageSize));
          const page = Math.min(route.page, totalPages);
          const startIndex = (page - 1) * pageSize;
          const paginatedProducts = matchingProducts.slice(startIndex, startIndex + pageSize);

          return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8" id="sh_category_pagination_view">
              {/* Heading */}
              <div className="border-b border-slate-100 pb-5 mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <div className="text-[10px] bg-slate-950 text-amber-400 font-mono font-bold px-2 py-0.5 rounded uppercase w-fit mb-1 shadow-sm">
                    Category: {catName}
                  </div>
                  <h1 className="text-3xl font-extrabold tracking-tight text-slate-950 uppercase">
                    Browse {catName} Catalog
                  </h1>
                </div>

                <div className="text-slate-400 text-xs font-mono">
                  {matchingProducts.length} items verified within {locationDistance} miles.
                </div>
              </div>

              {/* Pure image-only ad banner in category page - no text, no buttons */}
              <div className="w-full mb-8">
                <div className="relative w-full h-[140px] sm:h-[180px] rounded-2xl overflow-hidden shadow-sm bg-slate-100">
                  <img 
                    src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&auto=format&fit=crop&q=80" 
                    alt="Category Page Brand ad" 
                    className="w-full h-full object-cover select-none pointer-events-none"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>

              <div className="space-y-8">
                {paginatedProducts.length === 0 ? (
                  <div className="text-center py-20 border border-slate-200 rounded-2xl bg-white p-6">
                    <p className="text-slate-500 font-mono text-xs">No active {catName} pieces match your distance radius filter ({locationDistance} mi).</p>
                    <button 
                      onClick={() => setLocationDistance(1000)}
                      className="mt-4 bg-slate-950 text-white text-xs font-bold py-2 px-6 rounded-lg"
                    >
                      Extend Distance Filter
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                    {paginatedProducts.map((p) => {
                      const isFav = wishlist.some(item => item.id === p.id);
                      return (
                        <ProductCard 
                          key={p.id}
                          product={p}
                          isWishlisted={isFav}
                          onToggleWishlist={handleToggleWishlist}
                          onAddToCart={handleAddToCartWithAuth}
                          onNavigate={handleProtectedNavigate}
                        />
                      );
                    })}
                  </div>
                )}

                {/* URL Based Paging controls */}
                <div className="flex justify-between items-center border-t border-slate-100 pt-6">
                  <button 
                    disabled={page <= 1}
                    onClick={() => navigate(`category/${catName}`, { page: page - 1 })}
                    className="text-xs font-bold border border-slate-200 hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-transparent px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Prev Page
                  </button>
                  
                  <span className="text-xs font-mono text-slate-500 font-semibold uppercase">
                    Page <span className="text-slate-900 font-black">{page}</span> of <span className="text-slate-900 font-black">{totalPages}</span>
                  </span>

                  <button 
                    disabled={page >= totalPages}
                    onClick={() => navigate(`category/${catName}`, { page: page + 1 })}
                    className="text-xs font-bold border border-slate-200 hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-transparent px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    Next Page
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })() : null}

        {/* VIEW 3: MAIN LANDING PAGES (Default homepage layout) */}
        {route.path === '/' && !route.categoryName ? (
          <div className="space-y-4" id="sh_homepage_workspace">

            {/* Sec 3: Personalized product recommendations */}
            <div id="sh_personalized_recs_section_mount" className="my-1">
              <Recommendations 
                viewHistory={viewHistory} 
                onProductClick={(cat, sl) => navigate(`category/${cat}/${sl}`)}
                onAddToCart={handleAddToCartWithAuth}
                onToggleWishlist={handleToggleWishlist}
                wishlist={wishlist}
                onNavigate={handleProtectedNavigate}
              />
            </div>

            {/* Sec 4: Hot Deals Section */}
            {(() => {
              const hotDeals = products.filter(p => p.originalPrice && p.originalPrice > p.price).slice(0, 8);
              if (hotDeals.length === 0) return null;
              return (
                <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 my-1" id="sh_hot_deals_segment">
                  <div className="flex items-center justify-between gap-4 mb-3 pb-2.5 border-b border-slate-200/60" id="sh_hot_deals_header_row">
                    <h2 className="text-base sm:text-lg md:text-xl font-bold tracking-tight text-slate-900 uppercase font-sans flex items-center gap-2 leading-none">
                      <span className="w-1.5 h-5 bg-[#2E7D32] rounded-full inline-block shrink-0"></span>
                      <span>Hot Deals</span>
                    </h2>
                    
                    <button 
                      onClick={() => navigate('section/hot-deals')} 
                      className="text-xs font-bold text-[#2E7D32] hover:underline hover:text-[#1b5e20] transition-colors uppercase tracking-wide cursor-pointer shrink-0"
                    >
                      See More &rarr;
                    </button>
                  </div>

                  {/* Grid with 8 beautiful ProductCard high fidelity rendering (4 columns desktop, 2 mobile) */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {hotDeals.map((p) => {
                      const isFav = wishlist.some(item => item.id === p.id);
                      return (
                        <ProductCard 
                          key={p.id}
                          product={p}
                          isWishlisted={isFav}
                          onToggleWishlist={handleToggleWishlist}
                          onAddToCart={handleAddToCartWithAuth}
                          onNavigate={handleProtectedNavigate}
                        />
                      );
                    })}
                  </div>
                </section>
              );
            })()}


            {/* Sec 6: Special Offers Section */}
            {(() => {
              const specialOffers = products.filter(p => p.category === 'Combo Offers').slice(0, 8);
              if (specialOffers.length === 0) return null;
              return (
                <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 my-1" id="sh_combos_section">
                  <div className="flex items-center justify-between gap-4 mb-3 pb-2.5 border-b border-slate-200/60" id="sh_special_offers_header_row">
                    <h2 className="text-base sm:text-lg md:text-xl font-bold tracking-tight text-slate-900 uppercase font-sans flex items-center gap-2 leading-none">
                      <span className="w-1.5 h-5 bg-[#2E7D32] rounded-full inline-block shrink-0"></span>
                      <span>Special Offers</span>
                    </h2>
                    
                    <button 
                      onClick={() => navigate('section/special-offers')} 
                      className="text-xs font-bold text-[#2E7D32] hover:underline hover:text-[#1b5e20] transition-colors uppercase tracking-wide cursor-pointer shrink-0"
                    >
                      See More &rarr;
                    </button>
                  </div>

                  {/* Grid of standard ProductCard (2 columns on mobile, 4 columns on desktop) */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in">
                    {specialOffers.map((p) => {
                      const isFav = wishlist.some(item => item.id === p.id);
                      return (
                        <ProductCard 
                          key={p.id}
                          product={p}
                          isWishlisted={isFav}
                          onToggleWishlist={handleToggleWishlist}
                          onAddToCart={handleAddToCartWithAuth}
                          onNavigate={handleProtectedNavigate}
                        />
                      );
                    })}
                  </div>
                </section>
              );
            })()}

            {/* Sec 7: TOP BRANDS Section */}
            {allFilteredProducts.length > 0 && (
              <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 my-1" id="sh_top_brands_section">
                
                {/* Filter metrics heading */}
                <div className="flex items-center justify-between gap-4 border-t border-slate-200/80 pt-6 pb-4" id="sh_top_brands_header_row">
                  <h2 className="text-base sm:text-lg md:text-xl font-bold tracking-tight text-slate-900 uppercase font-sans flex items-center gap-2 leading-none">
                    <span className="w-1.5 h-5 bg-[#2E7D32] rounded-full inline-block shrink-0"></span>
                    <span>TOP BRANDS</span>
                  </h2>
                  
                  <button 
                    onClick={() => navigate('section/top-brands')} 
                    className="text-xs font-bold text-[#2E7D32] hover:underline hover:text-[#1b5e20] transition-colors uppercase tracking-wide cursor-pointer shrink-0"
                  >
                    See More &rarr;
                  </button>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {allFilteredProducts.slice(0, 8).map((p) => {
                    const isFav = wishlist.some(item => item.id === p.id);
                    return (
                      <ProductCard 
                        key={p.id}
                        product={p}
                        isWishlisted={isFav}
                        onToggleWishlist={handleToggleWishlist}
                        onAddToCart={handleAddToCartWithAuth}
                        onNavigate={handleProtectedNavigate}
                      />
                    );
                  })}
                </div>
              </section>
            )}
          </div>
        ) : null}

        {/* VIEW 4: SEAMLESS SHOPPING CART AND MULTI-STEP CHECKOUT PORTAL */}
        {route.path === 'cart' || route.path === 'checkout' || route.path === 'shipping-address' || route.path === 'order-summary' ? (
          <CartAndCheckout 
            cartItems={cart}
            onModifyQty={handleModifyQty}
            onRemoveItem={handleRemoveFromCart}
            onNavigate={handleProtectedNavigate}
            onClearCart={handleClearCart}
            onPlaceOrder={handlePlaceOrder}
            currentPath={route.path}
          />
        ) : null}

        {/* VIEW 5: REAL-TIME COURIER DELIVERY MAP AND TIMELINE */}
        {(route.path === 'track-order' || route.path === 'order-status') ? (
          <OrderTracker orders={orders} initialOrderId={route.orderId} />
        ) : null}

        {/* BUYER ACCOUNT PAGES */}
        {route.path === 'profile' ? (
          <ProfilePage 
            currentUser={currentUser}
            onUpdateUser={setCurrentUser}
          />
        ) : null}

        {route.path === 'addresses' ? (
          <AddressesPage
            currentUser={currentUser}
            onUpdateUser={setCurrentUser}
          />
        ) : null}

        {route.path === 'my-orders' ? (
          <MyOrdersPage 
            orders={orders}
            onNavigate={handleProtectedNavigate}
          />
        ) : null}

        {route.path === 'notifications' ? (
          <NotificationsPage 
            onNavigate={handleProtectedNavigate}
          />
        ) : null}

        {/* VIEW 6: THE MULTI-VENDOR MERCHANT REGISTRATION AND CATALOG portal MODULE */}
        {route.path === 'vendor-portal' ? (
          <VendorPortal 
            vendors={vendors}
            products={products}
            onAddProduct={handleAddProduct}
            onAddVendor={handleAddVendor}
            onDeleteProduct={handleDeleteProduct}
            onNavigate={handleProtectedNavigate}
          />
        ) : null}

        {/* VIEW 9: REGISTERED BUYERS AND ADMIN AUTHENTICATION WORKSPACE */}
        {route.path === 'login' || route.path === 'register' || route.path === 'verify-otp' ? (
          <LoginScreen 
            onNavigate={handleProtectedNavigate}
            onLoginSuccess={(user) => setCurrentUser(user)}
          />
        ) : null}

        {/* VIEW: ADMINISTRATIVE BUSINESS PORTAL CONSOLE */}
        {route.path === 'admin' ? (
          <AdminPanel 
            products={products}
            onAddProduct={handleAddProduct}
            onDeleteProduct={handleDeleteProduct}
            orders={orders}
            onNavigate={handleProtectedNavigate}
            currentUser={currentUser}
            onLogout={() => setCurrentUser(null)}
            onUpdateProducts={setProducts}
            onUpdateOrders={setOrders}
          />
        ) : null}

        {/* VIEW 7: ARTISAN STORE HIGHLIGHT FOR A SPECIFIC MERCHANT */}
        {route.path === 'vendor' && route.vendorId ? (() => {
          const vendor = vendors.find(v => v.id === route.vendorId);
          if (!vendor) return null;

          const vendorProducts = products.filter(p => p.vendorId === vendor.id);

          return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8" id="vendor_shop_profile_view">
              {/* Back breadcrumb */}
              <button 
                onClick={() => navigate('')}
                className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-950 font-bold mb-6 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                Return to Homepage
              </button>

              {/* Cover Header and Avatar */}
              <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm mb-8">
                <div className="h-44 sm:h-56 relative bg-slate-100">
                  <img src={vendor.coverImage} alt="" className="w-full h-full object-cover select-none" referrerPolicy="no-referrer" />
                  <div className="absolute inset-0 bg-black/35" />
                </div>

                <div className="p-6 relative -mt-10 sm:-mt-14 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-slate-100">
                  <div className="flex items-end gap-3.5">
                    <img 
                      src={vendor.logo} 
                      alt={vendor.name} 
                      className="w-20 h-20 sm:w-28 sm:h-28 rounded-2xl object-cover shrink-0 border-4 border-white bg-white shadow-md z-15" 
                      referrerPolicy="no-referrer"
                    />
                    <div className="bg-white/80 backdrop-blur-sm sm:bg-transparent rounded p-1">
                      <h1 className="text-xl sm:text-2xl font-black text-slate-955 leading-none uppercase">{vendor.name}</h1>
                      <span className="text-xs text-slate-505 font-medium font-sans flex items-center gap-1 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-amber-500" />
                        Location: {vendor.location} ({vendor.distance} miles away)
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto pt-2.5">
                    <div className="text-right text-xs">
                      <p className="font-bold text-slate-800">{vendor.rating} ★ Rated</p>
                      <p className="text-slate-400 font-mono mt-0.5">({vendor.reviewsCount} customer feeds)</p>
                    </div>
                    <button 
                      onClick={() => alert(`Connecting securely with ${vendor.name} help host...`)}
                      className="bg-slate-950 text-white font-bold text-xs py-2 px-4 rounded-xl cursor-pointer"
                    >
                      Store Chat Support
                    </button>
                  </div>
                </div>

                <div className="p-6 bg-slate-50/50">
                  <h3 className="font-bold text-xs uppercase text-slate-400 tracking-wider">Workshop Bio</h3>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed max-w-4xl font-normal font-sans">
                    {vendor.description}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-2 font-mono">Verified partner of ShopeValley since {vendor.joinDate}</p>
                </div>
              </div>

              {/* Vendor catalog grid */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <Briefcase className="w-5 h-5 text-slate-700" />
                  <h3 className="font-extrabold text-base sm:text-lg uppercase text-slate-900">Products crafted by this vendor</h3>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 animate-in fade-in">
                  {vendorProducts.map((p) => {
                    const isFav = wishlist.some(item => item.id === p.id);
                    return (
                      <ProductCard 
                        key={p.id}
                        product={p}
                        isWishlisted={isFav}
                        onToggleWishlist={handleToggleWishlist}
                        onAddToCart={handleAddToCartWithAuth}
                        onNavigate={handleProtectedNavigate}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })() : null}

        {/* VIEW 10: SECTION WISE PAGES WITH FILTERED PRODUCTS */}
        {route.path === 'section' ? (() => {
          const sectionId = route.categoryName || 'top-brands';
          let title = '';
          let subtitle = '';
          let sectionProducts: Product[] = [];
          
          if (sectionId === 'personalized') {
            title = 'Personalized For You';
            subtitle = 'Custom recommendations derived specifically for your shopping interest profile.';
            sectionProducts = products.filter(p => p.rating >= 4.5);
          } else if (sectionId === 'hot-deals') {
            title = 'Hot Deals';
            subtitle = 'Sizzlers with highest discounts and special limited duration price drop values.';
            sectionProducts = products.filter(p => p.originalPrice && p.originalPrice > p.price);
          } else if (sectionId === 'special-offers') {
            title = 'Special Offers';
            subtitle = 'Premium bundle deals and curated value gift packs with high direct savings.';
            sectionProducts = products.filter(p => p.category === 'Combo Offers');
          } else {
            title = 'Top Brands';
            subtitle = 'Explore the full premium certified collection of independent Colorado local workshops.';
            sectionProducts = products;
          }

          return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8" id="sh_section_wise_view_workspace">
              {/* Back to Home Trigger */}
              <div className="mb-6 flex justify-between items-center">
                <button 
                  onClick={() => navigate('')}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2E7D32] hover:underline cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" /> Back to Homepage
                </button>
                <div className="text-[10px] font-mono text-slate-400">INR AS BASE CURRENCY</div>
              </div>

              {/* View Heading */}
              <div className="border-b border-slate-200/80 pb-5 mb-8">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950 uppercase font-display flex items-center gap-2">
                  <span className="w-2 h-8 bg-[#2E7D32] rounded-full inline-block"></span>
                  {title}
                </h1>
                <p className="text-xs text-slate-500 mt-1 font-sans font-medium">{subtitle}</p>
                <div className="text-xs text-slate-400 font-mono mt-1 font-bold">
                  Showing {sectionProducts.length} certified items
                </div>
              </div>

              {/* 4 columns in desktop, 2 columns in mobile */}
              {sectionProducts.length === 0 ? (
                <div className="text-center py-20 bg-slate-50 border border-slate-200 rounded-3xl p-6">
                  <p className="text-xs font-mono text-slate-500">No active products are categorized in this section right now.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in">
                  {sectionProducts.map((p) => {
                    const isFav = wishlist.some(item => item.id === p.id);
                    return (
                      <ProductCard 
                        key={p.id}
                        product={p}
                        isWishlisted={isFav}
                        onToggleWishlist={handleToggleWishlist}
                        onAddToCart={handleAddToCartWithAuth}
                        onNavigate={handleProtectedNavigate}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          );
        })() : null}

        {/* VIEW 8: BOOKMARKED WISHLIST GRID */}
        {route.path === 'wishlist' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8" id="sh_wishlist_view_workspace">
            {/* Heading */}
            <div className="border-b border-slate-100 pb-5 mb-8 flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-950 uppercase">My Wishlist</h1>
                <p className="text-xs text-slate-400 font-mono mt-0.5">Bookmarks of artisan things saved across your browsing session</p>
              </div>
              <button 
                onClick={() => navigate('')}
                className="text-xs text-slate-700 hover:text-amber-500 font-bold flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Return Home
              </button>
            </div>

            {wishlist.length === 0 ? (
              <div className="text-center py-20 border-2 border-dashed border-slate-200 rounded-3xl p-6 bg-slate-50/20">
                <Heart className="w-10 h-10 text-slate-350 mx-auto fill-slate-200 animate-pulse mb-3" />
                <h3 className="font-extrabold text-slate-800">Your wishlist list is currently empty</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                  Click the heart buttons on our artisan pieces cards while exploring ShopeValley to bookmark here!
                </p>
                <button 
                  onClick={() => navigate('')}
                  className="mt-5 bg-slate-950 text-white font-bold text-xs py-2 px-6 rounded-xl hover:bg-slate-800 cursor-pointer"
                >
                  Explore Ceramics and Woodworks
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 animate-in fade-in">
                {wishlist.map((p) => (
                  <ProductCard 
                    key={p.id}
                    product={p}
                    isWishlisted={true}
                    onToggleWishlist={handleToggleWishlist}
                    onAddToCart={handleAddToCartWithAuth}
                    onNavigate={handleProtectedNavigate}
                  />
                ))}
              </div>
            )}
          </div>
        )}

      </main>

      {authDialog.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4">
          <div className="w-full max-w-lg rounded-[28px] bg-white border border-slate-200 shadow-2xl p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-950">{authDialog.title}</h2>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">{authDialog.message}</p>
              </div>
              <button
                onClick={hideAuthDialog}
                className="text-slate-500 hover:text-slate-900 transition-colors"
                aria-label="Close dialog"
              >
                ✕
              </button>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-end">
              <button
                onClick={hideAuthDialog}
                className="w-full sm:w-auto rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Close
              </button>
              <button
                onClick={() => {
                  hideAuthDialog();
                  if (authDialog.actionPath) {
                    navigate(authDialog.actionPath);
                  }
                }}
                className="w-full sm:w-auto rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
              >
                {authDialog.actionLabel}
              </button>
            </div>
          </div>
        </div>
      )}

         {/* 4. FOOTER CREDITS AREA */}
      {route.path !== 'admin' && (
        <footer className="bg-[#0f172a] text-slate-300 border-t border-slate-800 py-8 px-6 md:px-12 text-xs font-sans">
        <div className="max-w-7xl mx-auto">
          
          {/* Main Footer Columns - Beautiful 4-Column Responsive Layout */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-6">
            
            {/* Column 1: Brand Info & Socials */}
            <div className="space-y-4 pr-4">
              <div className="flex items-center gap-1.5 font-bold text-2xl tracking-tighter text-white">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <span className="font-extrabold uppercase text-lg tracking-tight">
                  Shope<span className="text-amber-500 font-black">Valley</span>
                </span>
              </div>
              <p className="text-slate-400 text-[12px] leading-relaxed font-sans font-normal">
                Discover exceptional hand-thrown ceramics, carved luxury goods, and bespoke items directly from certified local artisans and workshops.
              </p>
              
              {/* Modern Social Icons */}
              <div className="flex items-center gap-4 pt-1 text-slate-400">
                <a href="#" className="hover:text-amber-500 transition-colors" aria-label="Facebook">
                  <svg className="w-[18px] h-[18px] fill-current" viewBox="0 0 24 24">
                    <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
                  </svg>
                </a>
                <a href="#" className="hover:text-amber-500 transition-colors" aria-label="Instagram">
                  <svg className="w-[18px] h-[18px] fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                  </svg>
                </a>
                <a href="#" className="hover:text-amber-500 transition-colors" aria-label="Twitter">
                  <svg className="w-[18px] h-[18px] fill-current" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                  </svg>
                </a>
                <a href="#" className="hover:text-amber-500 transition-colors" aria-label="Pinterest">
                  <svg className="w-[18px] h-[18px] fill-current" viewBox="0 0 24 24">
                    <path d="M12 0c-6.627 0-12 5.373-12 12 0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345-.091.377-.293 1.194-.333 1.359-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.135-2.607 7.462-6.227 7.462-1.216 0-2.359-.631-2.75-1.378l-.75 2.859c-.271 1.043-1.002 2.35-1.492 3.146 1.124.347 2.317.535 3.554.535 6.627 0 12-5.373 12-12 0-6.627-5.373-12-12-12z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Column 2: Customer Service */}
            <div>
              <h4 className="font-bold text-white uppercase tracking-wider text-[11px] mb-4">Customer Service</h4>
              <ul className="space-y-2.5 text-slate-400">
                <li><a href="#" onClick={(e) => e.preventDefault()} className="hover:text-amber-500 transition-colors">Contact Us</a></li>
                <li><a href="#" onClick={(e) => e.preventDefault()} className="hover:text-amber-500 transition-colors">Help Center</a></li>
                <li><a href="#" onClick={(e) => e.preventDefault()} className="hover:text-amber-500 transition-colors">Returns & Exchanges</a></li>
                <li><a href="#" onClick={(e) => e.preventDefault()} className="hover:text-amber-500 transition-colors">Shipping Info</a></li>
                <li><a href="#" onClick={(e) => e.preventDefault()} className="hover:text-amber-200 transition-colors">Track Shipment</a></li>
              </ul>
            </div>

            {/* Column 3: Company */}
            <div>
              <h4 className="font-bold text-white uppercase tracking-wider text-[11px] mb-4">Company</h4>
              <ul className="space-y-2.5 text-slate-400">
                <li><a href="#" onClick={(e) => e.preventDefault()} className="hover:text-amber-500 transition-colors">About Us</a></li>
                <li><a href="#" onClick={(e) => e.preventDefault()} className="hover:text-amber-500 transition-colors">Careers</a></li>
                <li><a href="#" onClick={(e) => e.preventDefault()} className="hover:text-amber-500 transition-colors">Blog</a></li>
                <li><a href="#" onClick={(e) => e.preventDefault()} className="hover:text-amber-500 transition-colors">Press Releases</a></li>
                <li><a href="#" onClick={(e) => e.preventDefault()} className="hover:text-amber-500 transition-colors">Sustainability</a></li>
              </ul>
            </div>

            {/* Column 4: Legal */}
            <div>
              <h4 className="font-bold text-white uppercase tracking-wider text-[11px] mb-4">Legal</h4>
              <ul className="space-y-2.5 text-slate-400">
                <li><a href="#" onClick={(e) => e.preventDefault()} className="hover:text-amber-500 transition-colors">Privacy Policy</a></li>
                <li><a href="#" onClick={(e) => e.preventDefault()} className="hover:text-amber-500 transition-colors">Terms of Service</a></li>
                <li><a href="#" onClick={(e) => e.preventDefault()} className="hover:text-amber-500 transition-colors">Refund Policy</a></li>
                <li><a href="#" onClick={(e) => e.preventDefault()} className="hover:text-amber-500 transition-colors">Cookie Policy</a></li>
                <li><a href="#" onClick={(e) => e.preventDefault()} className="hover:text-amber-500 transition-colors">Security Guard</a></li>
              </ul>
            </div>

          </div>

          {/* Secured Payments & Core trust deck */}
          <div className="border-t border-slate-800/80 pt-4 pb-4 flex flex-col lg:flex-row justify-between items-center gap-6">
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5">
              {/* Visa */}
              <span className="bg-[#1e1b4b] text-[#2563eb] border border-slate-800 rounded px-2.5 py-1 font-sans uppercase font-black tracking-wider text-[10px] leading-none select-none">
                VISA
              </span>
              {/* Mastercard icon look-alike */}
              <span className="bg-[#451a03] text-[#ea580c] border border-slate-800 rounded px-2.5 py-1 font-sans uppercase font-black tracking-wider text-[10px] leading-none select-none">
                MASTERCARD
              </span>
              {/* AMEX */}
              <span className="bg-[#0369a1] text-[#fff] border border-slate-800 rounded px-2.5 py-1 font-sans uppercase font-black text-[9px] leading-none select-none">
                AMEX
              </span>
              {/* RuPay */}
              <span className="bg-white text-[#0066b1] rounded px-2.5 py-1 font-sans italic text-[10px] font-bold leading-none select-none">
                Ru<span className="text-amber-500 font-black">Pay</span>
              </span>
              {/* UPI */}
              <span className="bg-slate-800/80 border border-slate-700 text-emerald-400 rounded px-2.5 py-1 font-sans text-[10px] tracking-wider font-extrabold leading-none select-none">
                UPI SECURE
              </span>
            </div>

            <p className="text-slate-400 text-[11px] leading-relaxed select-none text-center lg:text-right">
              Powered by secure financial gateways with 256-bit encryption. All orders verified through Escrow protection.
            </p>
          </div>

          {/* Bottom Bar: Copyright */}
          <div className="border-t border-slate-800/80 pt-4 pb-1 flex flex-col md:flex-row justify-between items-center gap-4 text-[11px] text-slate-400 font-sans">
            <div>
              &copy; 2026 SHOPEVALLEY, Inc. All rights reserved.
            </div>
          </div>

        </div>
      </footer>
      )}

    </div>
  );
}
