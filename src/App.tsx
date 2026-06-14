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

import LoginScreen from './components/LoginScreen';
import AdminPanel from './components/AdminPanel';
import ProductDetailView from './components/ProductDetailView';
import ProfilePage from './components/ProfilePage';
import AddressesPage from './components/AddressesPage';
import MyOrdersPage from './components/MyOrdersPage';
import NotificationsPage from './components/NotificationsPage';
import { supabase, getCurrentUserProfile } from './lib/supabaseClient';
import { PRODUCTS } from './data';
import { Product, CartItem, Order, LoggedUser, ProductVariant } from './types';
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
  const [products, setProducts] = useState<Product[]>([]);

  // User States
  const [cart, setCart] = useState<CartItem[]>([]);

  const [wishlist, setWishlist] = useState<Product[]>([]);

  const [viewHistory, setViewHistory] = useState<string[]>([]);

  const [orders, setOrders] = useState<Order[]>([]);

  // Client-side quick filter parameters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('All');

  // User Authentication State (managed by Supabase)
  const [currentUser, setCurrentUser] = useState<LoggedUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

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
    if (!path || path === '/' || path === 'login' || path === 'register' || path === 'verify-otp' || path === 'forgot-password' || path === 'reset-password' || path === 'wishlist') {
      return true;
    }
    if (path === 'admin') {
      return true;
    }
    if (path.startsWith('category/') || path.startsWith('section/')) {
      return true;
    }
    // Legal, About, Contact pages are accessible by guests
    const guestStaticPages = ['about-us', 'contact-us', 'privacy-policy', 'terms-of-service', 'refund-policy', 'cookie-policy', 'security'];
    if (guestStaticPages.includes(path)) {
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
    return path === 'admin';
  };

  const handleProtectedNavigate = (path: string, options?: { page?: number; q?: string }) => {
    const normalized = path.replace(/^#\/?/, '');

    // Admin users can ONLY access the admin dashboard
    if (currentUser?.role === 'ADMIN' && normalized !== 'admin') {
      navigate('admin');
      return;
    }

    // Block non-logged-in users from protected pages
    if (!currentUser && !isGuestAllowedPath(normalized)) {
      showAuthDialog(
        'Signup Required',
        'You need to sign up or log in before accessing this page.',
        'login',
        'Login / Signup'
      );
      return;
    }

    // Block non-admin users from admin-only pages
    if (currentUser && currentUser.role !== 'ADMIN' && isAdminOnlyPath(normalized)) {
      showAuthDialog(
        'Admin Page Restricted',
        'Only admin accounts can access the admin area.',
        '',
        'Close'
      );
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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    navigate('');
  };



  useEffect(() => {
    // 1. Initial auth sync from Supabase
    const syncAuth = async () => {
      const profile = await getCurrentUserProfile();
      if (profile) {
        setCurrentUser({
          id: profile.id,
          name: profile.name,
          email: profile.email,
          phoneNumber: profile.phone,
          role: profile.role,
          email_verified: profile.email_verified,
          addresses: [],
          created_at: profile.created_at
        });
      }
      setAuthLoading(false);
    };
    syncAuth();

    // 2. Listen for auth changes in real-time
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
      } else if (event === 'PASSWORD_RECOVERY') {
        navigate('reset-password');
      } else if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
        if (session?.user) {
          const profile = await getCurrentUserProfile();
          if (profile) {
            setCurrentUser({
              id: profile.id,
              name: profile.name,
              email: profile.email,
              phoneNumber: profile.phone,
              role: profile.role,
              email_verified: profile.email_verified,
              addresses: [],
              created_at: profile.created_at
            });
          }
        }
      }
    });

    // 3. Fetch products from Supabase
    const fetchProducts = async () => {
      const { data } = await supabase.from('products').select('*');
      if (data && data.length > 0) {
        setProducts(data.map((p: any) => ({
          id: p.id_key || p.id,
          name: p.name,
          slug: p.slug,
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
          isOrganic: p.is_organic || false,
          isHandmade: p.is_handmade || false,
          materials: p.materials || [],
          brand: p.brand || '',
          sku: p.sku || '',
          hsnCode: p.hsn_code || '',
          manufacturerName: p.manufacturer_name || '',
          manufacturerCountry: p.manufacturer_country || '',
          countryOfOrigin: p.country_of_origin || '',
          weight: p.weight || '',
          dimensions: p.dimensions || '',
          package: p.package || '',
          importantNote: p.important_note || '',
          highlights: p.highlights || '',
          aboutProduct: p.about_product || [],
          directions: p.directions || [],
          variants: Array.isArray(p.variants) ? p.variants : []
        })));
      }
    };
    fetchProducts();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    // Don't run route guards until auth state is resolved
    if (authLoading) return;

    const normalized = route.path || '/';

    // Admin users can ONLY access admin dashboard
    if (currentUser?.role === 'ADMIN' && normalized !== 'admin') {
      navigate('admin');
      return;
    }

    // Redirect guests away from protected pages
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

    // Block non-admin users from admin-only pages
    if (currentUser && currentUser.role !== 'ADMIN' && isAdminOnlyPath(normalized)) {
      showAuthDialog(
        'Admin Restricted',
        'Only admin accounts can access the admin dashboard.',
        '',
        'Close'
      );
      navigate('');
      return;
    }
  }, [route, currentUser, authLoading]);



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

  // Product operations
  const handleAddProduct = (newP: Product) => {
    setProducts((prev) => [newP, ...prev]);
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
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch = query === '' || 
        p.name.toLowerCase().includes(query) || 
        p.description.toLowerCase().includes(query) || 
        p.tags.some(t => t.toLowerCase().includes(query));

      const matchesCategory = selectedCategoryFilter === 'All' || p.category === selectedCategoryFilter;

      return matchesSearch && matchesCategory;
    });
  };

  const allFilteredProducts = getFilteredProducts();

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
          selectedCategoryFilter={selectedCategoryFilter}
          setSelectedCategoryFilter={setSelectedCategoryFilter}
          currentUser={currentUser}
          onLogout={handleLogout}
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
                  {matchingProducts.length} items available
                </div>
              </div>

              {/* Ad banner placeholder - hidden until configured */}

              <div className="space-y-8">
                {paginatedProducts.length === 0 ? (
                  <div className="text-center py-20 border border-slate-200 rounded-2xl bg-white p-6">
                    <p className="text-slate-500 font-mono text-xs">No products found in {catName}.</p>
                    <button 
                      onClick={() => handleProtectedNavigate('')}
                      className="mt-4 bg-slate-950 text-white text-xs font-bold py-2 px-6 rounded-lg"
                    >
                      Browse All Products
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
                products={products}
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



        {/* VIEW 9: REGISTERED BUYERS AND ADMIN AUTHENTICATION WORKSPACE */}
        {route.path === 'login' || route.path === 'register' || route.path === 'verify-otp' || route.path === 'forgot-password' || route.path === 'reset-password' ? (
          <LoginScreen 
            onNavigate={handleProtectedNavigate}
            onLoginSuccess={(user) => setCurrentUser(user)}
            initialView={route.path === 'forgot-password' ? 'forgot-password' : route.path === 'reset-password' ? 'reset-password' : route.path === 'register' ? 'register' : route.path === 'verify-otp' ? 'otp' : 'login'}
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
            onLogout={handleLogout}
            onUpdateProducts={setProducts}
            onUpdateOrders={setOrders}
          />
        ) : null}

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
              <div className="flex items-center gap-2 text-white">
                <img src="/logo.png" alt="ShopeValley" className="h-8 w-8 rounded-lg object-contain" />
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
