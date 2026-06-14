import React, { useState, useEffect } from 'react';
import { useHashRouter } from './CustomRouter';
import CategoryManagement from './CategoryManagement';
import ProductManagement from './ProductManagement';
import { 
  BarChart3, 
  Users, 
  Gift, 
  Receipt, 
  TrendingUp, 
  LayoutDashboard, 
  Tag, 
  ShoppingBag, 
  Megaphone, 
  ClipboardList, 
  Home, 
  UserCheck, 
  MessageSquare, 
  Settings, 
  LogOut, 
  Search, 
  Bell, 
  Mail, 
  ChevronDown, 
  Plus, 
  Trash2, 
  Check, 
  X, 
  RefreshCw,
  Send,
  Sparkles
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { Product, Order, LoggedUser } from '../types';

interface AdminPanelProps {
  products: Product[];
  onAddProduct: (newP: Product) => void;
  onDeleteProduct: (prodId: string) => void;
  orders: Order[];
  onUpdateOrderStatus?: (orderId: string, status: 'accepted' | 'rejected' | 'packed' | 'picked_up' | 'in_transit' | 'out_for_delivery' | 'delivered') => void;
  onNavigate: (path: string) => void;
  currentUser: LoggedUser | null;
  onLogout: () => void;
  onUpdateProducts?: (prods: Product[]) => void;
  onUpdateOrders?: (orders: Order[]) => void;
}

export default function AdminPanel({
  products,
  onAddProduct,
  onDeleteProduct,
  orders,
  onNavigate,
  currentUser,
  onLogout,
  onUpdateProducts,
  onUpdateOrders
}: AdminPanelProps) {
  const { route, navigate } = useHashRouter();

  // Navigation tabs state
  const [activeTab, setActiveTab] = useState<'dashboard' | 'category' | 'products' | 'ads' | 'orders' | 'homepage' | 'accounts' | 'inbox'>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [dbProducts, setDbProducts] = useState<Product[]>([]);
  const [isProductsLoading, setIsProductsLoading] = useState(false);
  const [productFetchError, setProductFetchError] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const normalizeProductRow = (row: any): Product => ({
    id: String(row.id || row.idKey || ''),
    name: String(row.name || ''),
    slug: String(row.slug || '') || String(row.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
    idKey: String(row.idKey || row.id || ''),
    description: String(row.description || ''),
    price: Number(row.price ?? 0),
    originalPrice: row.original_price != null ? Number(row.original_price) : row.originalPrice != null ? Number(row.originalPrice) : undefined,
    category: String(row.category || ''),
    subCategory: row.sub_category ? String(row.sub_category) : row.subCategory ? String(row.subCategory) : undefined,
    images: Array.isArray(row.images) ? row.images : row.images ? [String(row.images)] : [],
    rating: Number(row.rating ?? 0),
    reviewCount: Number(row.review_count ?? row.reviewCount ?? 0),
    stock: Number(row.stock ?? 0),
    tags: Array.isArray(row.tags) ? row.tags : row.tags ? [String(row.tags)] : [],
    isOrganic: row.is_organic ?? row.isOrganic ?? undefined,
    isHandmade: row.is_handmade ?? row.isHandmade ?? undefined,
    materials: Array.isArray(row.materials) ? row.materials : row.materials ? [String(row.materials)] : undefined,
    createdAt: String(row.created_at || row.createdAt || new Date().toISOString()),
    brand: row.brand ? String(row.brand) : undefined,
    sku: row.sku ? String(row.sku) : undefined,
    hsnCode: row.hsn_code ? String(row.hsn_code) : row.hsnCode ? String(row.hsnCode) : undefined,
    manufacturerName: row.manufacturer_name ? String(row.manufacturer_name) : row.manufacturerName ? String(row.manufacturerName) : undefined,
    manufacturerCountry: row.manufacturer_country ? String(row.manufacturer_country) : row.manufacturerCountry ? String(row.manufacturerCountry) : undefined,
    countryOfOrigin: row.country_of_origin ? String(row.country_of_origin) : row.countryOfOrigin ? String(row.countryOfOrigin) : undefined,
    weight: row.weight ? String(row.weight) : undefined,
    dimensions: row.dimensions ? String(row.dimensions) : undefined,
    package: row.package ? String(row.package) : undefined,
    importantNote: row.important_note ? String(row.important_note) : row.importantNote ? String(row.importantNote) : undefined,
    highlights: row.highlights ? String(row.highlights) : undefined,
    aboutProduct: Array.isArray(row.about_product) ? row.about_product : Array.isArray(row.aboutProduct) ? row.aboutProduct : row.about_product ? [String(row.about_product)] : row.aboutProduct ? [String(row.aboutProduct)] : undefined,
    directions: Array.isArray(row.directions) ? row.directions : row.directions ? [String(row.directions)] : undefined,
    variants: Array.isArray(row.variants) ? row.variants : [],
  });

  // Synchronize route paths to active tab
  useEffect(() => {
    if (route.path === 'admin/categories') {
      setActiveTab('category');
    } else if (route.path === 'admin') {
      setActiveTab('dashboard');
    }
  }, [route.path]);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsProductsLoading(true);
      setProductFetchError(null);

      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          throw error;
        }

        if (!Array.isArray(data)) {
          throw new Error('Unexpected products response from database');
        }

        const normalizedProducts: Product[] = data.map((row: any) => normalizeProductRow(row));

        setDbProducts(normalizedProducts);
        if (onUpdateProducts && normalizedProducts.length > 0) {
          onUpdateProducts(normalizedProducts);
        }
      } catch (error: any) {
        setProductFetchError(error?.message || 'Unable to load products from DB');
      } finally {
        setIsProductsLoading(false);
      }
    };

    fetchProducts();
  }, [onUpdateProducts]);

  useEffect(() => {
    if (activeTab === 'ads') fetchAdCampaigns();
    if (activeTab === 'homepage') fetchHomepageSections();
  }, [activeTab]);



  // Local/Interactive States for managing entity edits
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  
  // Dynamic categories extracted from existing products or seed list
  const [categories, setCategories] = useState<string[]>(() => {
    const list = new Set(products.map(p => p.category));
    // fallback seed list if empty
    if (list.size === 0) {
      return ['Electronics', 'Fashion', 'Beauty & Personal Care', 'Home Appliances', 'PC & Laptops', 'Sports & Fitness', 'Combo Offers', 'Furniture'];
    }
    return Array.from(list);
  });
  const [newCatName, setNewCatName] = useState('');

  // Inbox interactive state
  const [inboxMessages, setInboxMessages] = useState<any[]>([]);
  const [activeMessageId, setActiveMessageId] = useState<string>('');
  const [replyInput, setReplyInput] = useState('');

  // Accounts state management
  const [userAccounts, setUserAccounts] = useState<any[]>([]);

  // Ads/Homepage customizations
  // (Homepage settings removed - sections managed via dedicated tab)

  // Ads Management State (image upload based)
  interface AdBannerRow {
    id: string;
    image_url: string;
    image_path: string;
    display_order: number;
    status: string;
  }
  const [adBanners, setAdBanners] = useState<AdBannerRow[]>([]);
  const [isAdsLoading, setIsAdsLoading] = useState(false);
  const [adUploading, setAdUploading] = useState(false);
  const [adUploadProgress, setAdUploadProgress] = useState(0);

  const fetchAdCampaigns = async () => {
    setIsAdsLoading(true);
    const { data } = await supabase
      .from('ad_campaigns')
      .select('id, image_url, image_path, display_order, status')
      .order('display_order', { ascending: true });
    if (data) {
      const resolved = data.map(ad => {
        let finalUrl = ad.image_url || '';
        if (ad.image_path) {
          const { data: urlData } = supabase.storage.from('ad-banners').getPublicUrl(ad.image_path);
          if (urlData?.publicUrl) finalUrl = urlData.publicUrl;
        }
        return { ...ad, image_url: finalUrl };
      });
      setAdBanners(resolved);
    }
    setIsAdsLoading(false);
  };

  const handleAdImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    if (adBanners.length >= 5) { alert('Maximum 5 banner ads allowed.'); return; }

    const file = files[0];
    if (!file.type.startsWith('image/')) { alert('Only image files allowed.'); return; }

    setAdUploading(true);
    setAdUploadProgress(10);

    const fileName = `banner_${Date.now()}_${Math.random().toString(36).substr(2, 6)}.${file.name.split('.').pop()}`;
    
    setAdUploadProgress(40);
    const { error: uploadError } = await supabase.storage
      .from('ad-banners')
      .upload(fileName, file, { contentType: file.type, upsert: false });

    if (uploadError) {
      alert('Upload failed: ' + uploadError.message);
      setAdUploading(false);
      return;
    }

    setAdUploadProgress(70);

    const { data: urlData } = supabase.storage.from('ad-banners').getPublicUrl(fileName);

    await supabase.from('ad_campaigns').insert({
      title: `Banner ${adBanners.length + 1}`,
      image_url: urlData?.publicUrl || '',
      image_path: fileName,
      display_order: adBanners.length,
      status: 'Active'
    });

    setAdUploadProgress(100);
    setAdUploading(false);
    setAdUploadProgress(0);
    fetchAdCampaigns();
    e.target.value = '';
  };

  const handleDeleteAd = async (id: string, imagePath: string) => {
    if (!confirm('Delete this banner ad?')) return;
    if (imagePath) {
      await supabase.storage.from('ad-banners').remove([imagePath]);
    }
    await supabase.from('ad_campaigns').delete().eq('id', id);
    fetchAdCampaigns();
  };

  // Homepage Sections Management
  interface SectionProduct {
    id: string;
    section_id: string;
    product_id: string;
    display_order: number;
    product?: any;
  }
  interface HomepageSection {
    id: string;
    name: string;
    display_order: number;
    status: string;
    products: SectionProduct[];
  }
  const [homepageSections, setHomepageSections] = useState<HomepageSection[]>([]);
  const [isSectionsLoading, setIsSectionsLoading] = useState(false);
  const [showAddProductToSection, setShowAddProductToSection] = useState<string | null>(null);
  const [sectionProductSearch, setSectionProductSearch] = useState('');

  const fetchHomepageSections = async () => {
    setIsSectionsLoading(true);
    const { data: sections } = await supabase
      .from('homepage_sections')
      .select('*')
      .order('display_order', { ascending: true });

    if (sections) {
      const sectionsWithProducts: HomepageSection[] = [];
      for (const sec of sections) {
        const { data: sectionProducts } = await supabase
          .from('homepage_section_products')
          .select('*, products:product_id(id, name, images, price, original_price)')
          .eq('section_id', sec.id)
          .order('display_order', { ascending: true });
        sectionsWithProducts.push({ ...sec, products: sectionProducts || [] });
      }
      setHomepageSections(sectionsWithProducts);
    }
    setIsSectionsLoading(false);
  };

  const handleAddProductToSection = async (sectionId: string, productId: string) => {
    const existing = homepageSections.find(s => s.id === sectionId);
    if (existing && existing.products.some(p => p.product_id === productId)) return;
    
    await supabase.from('homepage_section_products').insert({
      section_id: sectionId,
      product_id: productId,
      display_order: existing ? existing.products.length : 0
    });
    fetchHomepageSections();
    setShowAddProductToSection(null);
    setSectionProductSearch('');
  };

  const handleRemoveProductFromSection = async (id: string) => {
    await supabase.from('homepage_section_products').delete().eq('id', id);
    fetchHomepageSections();
  };

  // New products attributes state for form
  const [newProd, setNewProd] = useState({
    name: '',
    price: '',
    originalPrice: '',
    category: '',
    description: '',
    imageUrl: '',
    stock: '',
    sku: 'SKU-' + Math.floor(Math.random() * 900000 + 100000)
  });

  // Calculate stats dynamically from real data only
  const salesSum = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const activeOrdersCount = orders.length;
  const totalProductsCount = products.length;
  const totalCustomersCount = userAccounts.length;

  const handleUpdateRole = (userId: string, newRole: string) => {
    setUserAccounts(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
  };

  const handleToggleUserStatus = (userId: string) => {
    setUserAccounts(prev => prev.map(u => {
      if (u.id === userId) {
        return { ...u, status: u.status === 'Active' ? 'Suspended' : 'Active' };
      }
      return u;
    }));
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyInput.trim()) return;

    setInboxMessages(prev => prev.map(m => {
      if (m.id === activeMessageId) {
        return { ...m, replied: true, replyText: replyInput };
      }
      return m;
    }));
    setReplyInput('');
  };

  const currentActiveMsg = inboxMessages.find(m => m.id === activeMessageId);

  // Submit product creation
  const handleCreateProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProd.name || !newProd.price) {
      alert("Please enter product name and price");
      return;
    }

    const priceNum = parseFloat(newProd.price);
    const origPriceNum = newProd.originalPrice ? parseFloat(newProd.originalPrice) : undefined;
    const parsedStock = parseInt(newProd.stock, 10) || 12;
    const slug = newProd.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const insertPayload = {
      name: newProd.name,
      slug,
      id_key: newProd.sku,
      description: newProd.description || 'High quality product from our curated collection.',
      price: priceNum,
      original_price: origPriceNum,
      category: newProd.category,
      images: newProd.imageUrl ? [newProd.imageUrl] : [],
      rating: 4.8,
      review_count: 1,
      stock: parsedStock,
      tags: [newProd.category.toLowerCase(), 'custom'],
      sku: newProd.sku,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: inserted, error } = await supabase
      .from('products')
      .insert(insertPayload)
      .select('*')
      .single();

    if (error || !inserted) {
      alert(`Failed to save product: ${error?.message || 'unknown error'}`);
      return;
    }

    const createdProduct = normalizeProductRow(inserted);
    setDbProducts(prev => [createdProduct, ...prev]);
    if (onAddProduct) {
      onAddProduct(createdProduct);
    }

    setShowAddProductModal(false);
    setNewProd({
      name: '',
      price: '',
      originalPrice: '',
      category: categories[0] || 'Electronics',
      description: '',
      imageUrl: '',
      stock: '50',
      sku: 'SKU-' + Math.floor(Math.random() * 900000 + 100000)
    });

    alert("Product created successfully and saved to DB.");
  };

  // Submit product edits
  const handleSaveProductEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editProduct) return;

    const updatedData = {
      name: editProduct.name,
      slug: editProduct.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
      price: editProduct.price,
      stock: editProduct.stock,
      category: editProduct.category,
      description: editProduct.description,
      updated_at: new Date().toISOString()
    };

    const { data: updatedRow, error } = await supabase
      .from('products')
      .update(updatedData)
      .eq('id', editProduct.id)
      .select('*')
      .single();

    if (error || !updatedRow) {
      alert(`Failed to update product: ${error?.message || 'unknown error'}`);
      return;
    }

    const normalized = normalizeProductRow(updatedRow);
    setDbProducts(prev => {
      const next = prev.map(p => p.id === normalized.id ? normalized : p);
      if (onUpdateProducts) {
        onUpdateProducts(next);
      }
      return next;
    });

    setEditProduct(null);
    alert("Product updates saved to DB.");
  };

  const handleDeleteProduct = async (productId: string, productName: string) => {
    if (!confirm(`Are you sure you want to delete ${productName} from active workshop rosters?`)) {
      return;
    }

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId);

    if (error) {
      alert(`Unable to delete product: ${error.message}`);
      return;
    }

    setDbProducts(prev => {
      const next = prev.filter(p => p.id !== productId);
      if (onUpdateProducts) {
        onUpdateProducts(next);
      }
      return next;
    });

    if (onDeleteProduct) {
      onDeleteProduct(productId);
    }

    alert('Product deleted from DB.');
  };

  // Handle category creation
  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCatName.trim() && !categories.includes(newCatName.trim())) {
      setCategories(prev => [...prev, newCatName.trim()]);
      setNewCatName('');
      alert("New core category added!");
    }
  };

  // Switch Order Status dropdown
  const handleOrderStatusChange = (orderId: string, value: 'accepted' | 'rejected' | 'packed' | 'picked_up' | 'in_transit' | 'out_for_delivery' | 'delivered') => {
    if (onUpdateOrders) {
      const altered = orders.map(o => o.id === orderId ? { ...o, status: value } : o);
      onUpdateOrders(altered);
    } else {
      // mutate order
      const match = orders.find(o => o.id === orderId);
      if (match) {
        match.status = value;
      }
    }
    alert(`Order #${orderId} status modified to "${value}" successfully!`);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FD] text-slate-800 font-sans flex flex-col md:flex-row shadow-inner" id="ambient_admin_panel_workspace">
      
      {/* LEFT SIDEBAR: Match styling exactly to user screenshot */}
      <div className="w-full md:w-64 bg-white border-r border-[#EBEFF5] shrink-0 flex flex-col justify-between py-6 px-4" id="admin_left_sidebar">
        
        <div>
          {/* Logo / Brand Header */}
          <div className="flex items-center gap-3.5 mb-10 px-3 cursor-pointer" onClick={() => onNavigate('')}>
            <div className="bg-[#7c3aed] text-white p-2.5 rounded-xl shadow-md shadow-violet-200 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <h2 className="font-sans font-black text-slate-900 text-lg tracking-tight">E-Commerce</h2>
              <p className="text-[9px] font-mono font-bold tracking-wider text-[#7c3aed] uppercase leading-none mt-0.5">Admin Central</p>
            </div>
          </div>

          {/* Navigation Links with rounded violet indicator pills */}
          <nav className="space-y-1.5" id="sidebar_nav_links">
            <span className="block text-[10px] font-mono tracking-wider font-extrabold text-slate-400 opacity-60 px-3 pb-2 uppercase">Menu</span>
            
            {[
              { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: 'admin' },
              { id: 'category', label: 'Category', icon: Tag, path: 'admin/categories' },
              { id: 'products', label: 'Products', icon: ShoppingBag, path: 'admin' },
              { id: 'ads', label: 'Ads Management', icon: Megaphone, path: 'admin' },
              { id: 'orders', label: 'Orders', icon: ClipboardList, path: 'admin' },
              { id: 'homepage', label: 'Homepage Sections', icon: Home, path: 'admin' },
              { id: 'accounts', label: 'Accounts', icon: UserCheck, path: 'admin' },
              { id: 'inbox', label: 'Inbox Support', icon: MessageSquare, path: 'admin' }
            ].map((tab) => {
              const TabIcon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as any);
                    navigate(tab.path);
                  }}
                  className={`w-full py-3 px-4 rounded-xl text-left font-bold text-xs flex items-center gap-3.5 transition-all outline-none ${
                    isActive 
                      ? 'bg-[#7c3aed] text-white shadow-lg shadow-violet-100 ring-1 ring-violet-500/10 scale-[1.02]' 
                      : 'text-slate-500 hover:bg-[#F4F6FB] hover:text-slate-900'
                  }`}
                >
                  <TabIcon className={`w-4.5 h-4.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Lower System buttons */}
        <div className="pt-8 border-t border-[#EBEFF5] space-y-1 mt-8" id="sidebar_footer_actions">
          <button 
            onClick={() => alert("Administrative parameters initialized. System clean.")}
            className="w-full py-2.5 px-4 rounded-xl text-left font-semibold text-slate-500 hover:bg-slate-50 hover:text-slate-900 text-xs flex items-center gap-3 transition-colors"
          >
            <Settings className="w-4.5 h-4.5 text-slate-400" />
            <span>Setting</span>
          </button>
          
          <button 
            onClick={() => {
              if (window.confirm('Are you sure you want to logout?')) {
                onLogout();
              }
            }}
            className="w-full py-2.5 px-4 rounded-xl text-left font-semibold text-[#D11A2A] hover:bg-red-50 text-xs flex items-center gap-3 transition-colors"
          >
            <LogOut className="w-4.5 h-4.5 text-red-500" />
            <span>Log Out</span>
          </button>
        </div>

      </div>

      {/* RIGHT SIDE MAIN AREA */}
      <div className="flex-grow flex flex-col overflow-x-hidden min-h-screen" id="admin_main_content">
        
        {/* UPPER MAIN HEADER */}
        <header className="bg-white border-b border-[#EBEFF5] h-20 px-8 flex items-center justify-between shrink-0" id="admin_top_navbar">
          
          {/* Greetings left */}
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-905 text-slate-900 font-sans">
              Hello, {currentUser?.name || 'Admin'}
            </h1>
            <span className="text-xl animate-bounce">👋</span>
          </div>

          {/* Search middle capsule */}
          <div className="hidden md:flex items-center max-w-sm w-80 relative">
            <div className="absolute left-3.5 text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input 
              type="text" 
              placeholder="Search your products" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="py-2.5 pl-10 pr-4 bg-[#F5F7FC] border-0 rounded-full text-xs text-slate-700 placeholder-slate-400 w-full focus:outline-none focus:ring-1 focus:ring-violet-500 transition-shadow"
            />
          </div>

          {/* User profile section right */}
          <div className="flex items-center gap-5">
            {/* Notification and mail icons with counter count badges exactly like screenshot */}
            <button className="relative p-2.5 hover:bg-slate-50 rounded-full transition-colors" onClick={() => alert("Alert mailbox is synchronized and up-to-date with secure dispatch lists.")}>
              <Bell className="w-4.5 h-4.5 text-slate-600" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#E53935]" />
            </button>
            
            <button className="relative p-2.5 hover:bg-slate-50 rounded-full transition-colors" onClick={() => setActiveTab('inbox')}>
              <Mail className="w-4.5 h-4.5 text-slate-600" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#7c3aed]" />
            </button>

            {/* Profile widget */}
            <div className="h-10 bg-slate-100 rounded-full w-[1px]" />

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#7c3aed] flex items-center justify-center text-white font-bold text-sm">
                  {currentUser?.name?.charAt(0)?.toUpperCase() || 'A'}
                </div>
              <div className="hidden lg:block text-left text-xs leading-none">
                <p className="font-bold text-slate-900">{currentUser?.name || 'Admin'}</p>
                <span className="text-[10px] text-slate-400 mt-0.5 inline-block capitalize font-mono">{currentUser?.role || 'ADMIN'} Privileges</span>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400 cursor-pointer hover:text-slate-900" />
            </div>
          </div>

        </header>

        {/* WORKSPACE AREA */}
        <div className="p-8 flex-grow space-y-8 animate-in fade-in duration-300">
          
          {/* ======================= TAB 1: DASHBOARD ======================= */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8" id="admin_dashboard_root">
              
              {/* TOP METRICS ROW: exact metrics styling like mockup (4 cards) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" id="metrics_cards_dashboard_row">
                
                {/* METRIC 1: Customers */}
                <div className="bg-white rounded-2xl p-6 border border-[#EBEFF5] shadow-xs flex items-center justify-between transition-transform hover:-translate-y-0.5">
                  <div className="space-y-1.5 text-left">
                    <p className="font-mono text-[11px] font-bold text-slate-400 tracking-wider uppercase">Total Customers</p>
                    <h3 className="text-2xl font-black text-slate-900 font-sans tracking-tight">{totalCustomersCount}+</h3>
                    <span className="text-[10px] bg-indigo-50 text-indigo-600 font-sans font-extrabold px-1.5 py-0.5 rounded tracking-wide leading-none mt-1 inline-block">Active accounts</span>
                  </div>
                  <div className="bg-[#EEF2FC] text-[#3B82F6] p-4 rounded-2xl flex items-center justify-center">
                    <Users className="w-6 h-6 stroke-[2.2]" />
                  </div>
                </div>

                {/* METRIC 2: Products */}
                <div className="bg-white rounded-2xl p-6 border border-[#EBEFF5] shadow-xs flex items-center justify-between transition-transform hover:-translate-y-0.5">
                  <div className="space-y-1.5 text-left">
                    <p className="font-mono text-[11px] font-bold text-slate-400 tracking-wider uppercase">Total Products</p>
                    <h3 className="text-2xl font-black text-slate-900 font-sans tracking-tight">{totalProductsCount}+</h3>
                    <span className="text-[10px] bg-amber-50 text-amber-600 font-sans font-extrabold px-1.5 py-0.5 rounded tracking-wide leading-none mt-1 inline-block">Active catalogs</span>
                  </div>
                  <div className="bg-[#FFF8E7] text-[#FFB300] p-4 rounded-2xl flex items-center justify-center">
                    <Gift className="w-6 h-6 stroke-[2.2]" />
                  </div>
                </div>

                {/* METRIC 3: Orders */}
                <div className="bg-white rounded-2xl p-6 border border-[#EBEFF5] shadow-xs flex items-center justify-between transition-transform hover:-translate-y-0.5">
                  <div className="space-y-1.5 text-left">
                    <p className="font-mono text-[11px] font-bold text-slate-400 tracking-wider uppercase">Total Orders</p>
                    <h3 className="text-2xl font-black text-slate-900 font-sans tracking-tight">{activeOrdersCount}+</h3>
                    <span className="text-[10px] bg-rose-50 text-rose-600 font-sans font-extrabold px-1.5 py-0.5 rounded tracking-wide leading-none mt-1 inline-block">Placed dispatches</span>
                  </div>
                  <div className="bg-[#FFF0F2] text-[#F43F5E] p-4 rounded-2xl flex items-center justify-center">
                    <Receipt className="w-6 h-6 stroke-[2.2]" />
                  </div>
                </div>

                {/* METRIC 4: Sales */}
                <div className="bg-white rounded-2xl p-6 border border-[#EBEFF5] shadow-xs flex items-center justify-between transition-transform hover:-translate-y-0.5">
                  <div className="space-y-1.5 text-left">
                    <p className="font-mono text-[11px] font-bold text-slate-400 tracking-wider uppercase">Total Sales</p>
                    <h3 className="text-2xl font-black text-slate-900 font-sans tracking-tight">${salesSum.toLocaleString()}+</h3>
                    <span className="text-[10px] bg-emerald-50 text-emerald-600 font-sans font-extrabold px-1.5 py-0.5 rounded tracking-wide leading-none mt-1 inline-block">Direct store value</span>
                  </div>
                  <div className="bg-[#E7F9F3] text-[#10B981] p-4 rounded-2xl flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 stroke-[2.2]" />
                  </div>
                </div>

              </div>

              {/* GRAPHS SECTION: Double Graph precisely matching user screenshot */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8" id="double_graphs_row">
                
                {/* 1. SALES TREND DOUBLE LINE GRAPH (2 UNITS WIDTH) */}
                <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-[#EBEFF5] shadow-xs space-y-4">
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-sans font-extrabold text-slate-900 text-base">Sales Trend</h3>
                      <p className="text-[11px] text-slate-400">Monthly sales flow performance tracking</p>
                    </div>
                    {/* Legenda exactly like the attached mockup */}
                    <div className="flex items-center gap-4 text-xs font-semibold">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#7c3aed] inline-block" />
                        <span className="text-slate-600">Current year</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444] inline-block" />
                        <span className="text-slate-600">Last year</span>
                      </div>
                    </div>
                  </div>

                  {/* CUSTOM FULL-FIDELITY RESPONSIVE SVG DOUBLE-CURVE LINE TREE */}
                  <div className="relative h-64 pt-6" id="svg_sales_trend_chart">
                    {/* SVG canvas */}
                    <svg className="w-full h-full overflow-visible" viewBox="0 0 600 200" preserveAspectRatio="none">
                      {/* Gridlines */}
                      <line x1="0" y1="30" x2="600" y2="30" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="3" />
                      <line x1="0" y1="70" x2="600" y2="70" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="3" />
                      <line x1="0" y1="110" x2="600" y2="110" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="3" />
                      <line x1="0" y1="150" x2="600" y2="150" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="3" />
                      <line x1="0" y1="180" x2="600" y2="180" stroke="#F1F5F9" strokeWidth="1" />

                      {/* Y Axis markings */}
                      <text x="5" y="34" className="text-[10px] font-mono fill-slate-400 font-bold">50K</text>
                      <text x="5" y="74" className="text-[10px] font-mono fill-slate-400 font-bold">40K</text>
                      <text x="5" y="114" className="text-[10px] font-mono fill-slate-400 font-bold">30K</text>
                      <text x="5" y="154" className="text-[10px] font-mono fill-slate-400 font-bold">15K</text>
                      <text x="5" y="184" className="text-[10px] font-mono fill-slate-400 font-bold">0</text>

                      {/* LAST YEAR (RED DEEP LINE) */}
                      <path 
                        d="M 50 160 C 120 180, 180 140, 250 150 C 310 160, 360 80, 420 100 C 480 120, 520 140, 580 125" 
                        fill="none" 
                        stroke="#EF4444" 
                        strokeWidth="3.5" 
                        strokeLinecap="round" 
                        className="opacity-95"
                      />

                      {/* CURRENT YEAR (PURPLE BOLD LINE) */}
                      <path 
                        d="M 50 140 C 120 90, 180 100, 250 145 C 310 130, 360 70, 420 85 C 480 100, 520 70, 580 60" 
                        fill="none" 
                        stroke="#7c3aed" 
                        strokeWidth="3.5" 
                        strokeLinecap="round" 
                      />

                      {/* July point indicator line matching screenshot */}
                      <line x1="335" y1="70" x2="335" y2="180" stroke="#CBD5E1" strokeWidth="1" strokeDasharray="4" />
                      
                      {/* Interactive Point at July node */}
                      <circle cx="335" cy="74" r="5" fill="#7c3aed" stroke="#ffffff" strokeWidth="2.5" className="animate-ping" />
                      <circle cx="335" cy="74" r="5" fill="#7c3aed" stroke="#ffffff" strokeWidth="2.5" />

                    </svg>

                    {/* Interactive hover tooltip on July pointing exactly to July node like in mockup screenshot */}
                    <div className="absolute top-[38px] left-[52%] -translate-x-1/2 bg-[#7c3aed] text-white font-sans font-black text-[10px] px-2.5 py-1 rounded-lg shadow-md flex items-center justify-center">
                      40 K
                    </div>

                    {/* X Axis Labels */}
                    <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 font-bold pt-3 px-1">
                      <span>January</span>
                      <span>March</span>
                      <span>May</span>
                      <span>July</span>
                      <span>September</span>
                      <span>December</span>
                    </div>

                  </div>

                </div>

                {/* 2. PRODUCT VIEWS WEEKLY COMPARISON BAR CHART (1 UNIT WIDTH) */}
                <div className="lg:col-span-1 bg-white rounded-3xl p-6 border border-[#EBEFF5] shadow-xs space-y-4">
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-sans font-extrabold text-slate-900 text-base">Product Views</h3>
                      <p className="text-[11px] text-slate-400">Weekly traffic view comparisons</p>
                    </div>
                    {/* legend */}
                    <div className="flex flex-col items-end gap-1 text-[10px] font-bold">
                      <div className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-[#7c3aed]" />
                        <span className="text-slate-500">This Week</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-[#EF4444]" />
                        <span className="text-slate-500">Last Week</span>
                      </div>
                    </div>
                  </div>

                  {/* Vertical bar grid */}
                  <div className="h-64 flex justify-between items-end gap-2.5 pt-4" id="bar_chart_views_system">
                    {[
                      { l: 'Sun', thisW: 0, lastW: 0 },
                      { l: 'Mon', thisW: 0, lastW: 0 },
                      { l: 'Tue', thisW: 0, lastW: 0 },
                      { l: 'Wed', thisW: 0, lastW: 0 },
                      { l: 'Thu', thisW: 0, lastW: 0 },
                      { l: 'Fri', thisW: 0, lastW: 0 },
                      { l: 'Sat', thisW: 0, lastW: 0 }
                    ].map((item, idx) => (
                      <div key={idx} className="flex flex-col items-center flex-grow space-y-1.5 h-full justify-end">
                        <div className="flex items-end gap-1.5 h-44 w-full justify-center">
                          {/* Last Week (Red bar) */}
                          <div 
                            style={{ height: `${item.lastW}%` }} 
                            className="w-2 bg-[#EF4444] rounded-full transition-all duration-750 hover:opacity-80" 
                            title={`Last Week: ${item.lastW}%`}
                          />
                          {/* This Week (Purple bar) */}
                          <div 
                            style={{ height: `${item.thisW}%` }} 
                            className="w-2 bg-[#7c3aed] rounded-full transition-all duration-750 hover:opacity-80"
                            title={`This Week: ${item.thisW}%`}
                          />
                        </div>
                        <span className="text-[10px] font-mono text-slate-400 font-bold">{item.l}</span>
                      </div>
                    ))}
                  </div>

                </div>

              </div>

              {/* LOWER ROW: ALL ORDERS TABLE AND TOP SOLD ITEMS LIST */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8" id="orders_leads_row">
                
                {/* 1. ALL ORDERS PORTLET (2 UNITS) */}
                <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-[#EBEFF5] shadow-xs space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div>
                      <h3 className="font-sans font-extrabold text-slate-900 text-sm uppercase">Recent Live Orders</h3>
                      <p className="text-[11px] text-slate-400">Secure real-time transaction tracking ledger</p>
                    </div>
                    <button onClick={() => setActiveTab('orders')} className="text-xs font-black text-[#7c3aed] hover:underline uppercase">View All Ledger &rarr;</button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-[#F4F6FB] text-slate-400 font-mono font-bold uppercase text-[10px]">
                          <th className="py-3 px-1">Product</th>
                          <th className="py-3 px-1">Orders ID</th>
                          <th className="py-3 px-1">Customer Name</th>
                          <th className="py-3 px-1">Date</th>
                          <th className="py-3 px-1">Price</th>
                          <th className="py-3 px-1">Statuses</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#F4F6FB] text-slate-700 font-medium">
                        {orders.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="py-8 text-center text-slate-400 text-sm font-medium">
                              No orders yet
                            </td>
                          </tr>
                        ) : (
                          orders.slice(0, 5).map((o, idx) => (
                            <tr key={o.id} className="hover:bg-slate-50/50">
                              <td className="py-3 px-1 flex items-center gap-2.5">
                                <span className="font-bold text-slate-800 truncate max-w-[140px]">
                                  {o.items[0]?.name || 'Direct Artisan Package'} {o.items.length > 1 ? `(+${o.items.length - 1} items)` : ''}
                                </span>
                              </td>
                              <td className="py-3 px-1 font-mono font-bold text-slate-400">#{o.id.substring(2, 8)}</td>
                              <td className="py-3 px-1 text-slate-900 font-bold">{o.customerName}</td>
                              <td className="py-3 px-1 text-slate-400 text-[10px] font-mono">
                                {o.createdAt ? new Date(o.createdAt).toLocaleDateString() : 'Today'}
                              </td>
                              <td className="py-3 px-1 text-slate-900 font-mono font-black">${o.total.toFixed(2)}</td>
                              <td className="py-3 px-1">
                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                                  o.status === 'delivered' 
                                    ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                                    : o.status === 'in_transit' 
                                      ? 'bg-blue-50 text-blue-600 border-blue-100'
                                      : 'bg-amber-50 text-amber-600 border-amber-100'
                                }`}>
                                  {o.status}
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                </div>

                {/* 2. TOP SOLD ITEMS PROGRESS BARS (1 UNIT) */}
                <div className="lg:col-span-1 bg-white rounded-3xl p-6 border border-[#EBEFF5] shadow-xs space-y-5">
                  <div className="border-b border-slate-100 pb-3 text-left">
                    <h3 className="font-sans font-extrabold text-slate-900 text-sm uppercase">Top Sold Items</h3>
                    <p className="text-[11px] text-slate-400">Highest grossing categories this season</p>
                  </div>

                  <div className="space-y-4">
                    {products.length === 0 ? (
                      <p className="text-slate-400 text-sm text-center py-8">No products yet</p>
                    ) : (
                      products.slice(0, 5).map((p, idx) => {
                        const colors = ['bg-indigo-500', 'bg-amber-500', 'bg-red-500', 'bg-emerald-500', 'bg-blue-500'];
                        return (
                          <div key={p.id || idx} className="space-y-1.5 text-left">
                            <div className="flex justify-between items-center text-xs font-bold font-sans">
                              <span className="text-slate-700 truncate max-w-[150px]">{p.name}</span>
                              <span className="text-slate-900 font-mono">{p.stock || 0} sold</span>
                            </div>
                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                              <div 
                                style={{ width: `${Math.min(100, ((p.stock || 0) / Math.max(1, ...products.map(x => x.stock || 0))) * 100)}%` }} 
                                className={`h-full ${colors[idx % 5]} rounded-full transition-all duration-1000`} 
                              />
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Summary Footer */}
                  <div className="bg-[#FAF9FF] border border-[#7c3aed]/10 rounded-2xl p-4 text-center space-y-1.5">
                    <p className="text-[11px] font-bold text-slate-700">Product Performance</p>
                    <p className="text-[10px] text-slate-500">Data reflects actual product inventory levels.</p>
                  </div>

                </div>

              </div>

              {selectedProduct && (
                <div className="bg-white border border-slate-200 rounded-3xl shadow-xs p-6">
                  <div className="flex flex-col lg:flex-row justify-between gap-4 mb-6">
                    <div>
                      <h3 className="text-lg font-extrabold text-slate-900">{selectedProduct.name}</h3>
                      <p className="text-xs text-slate-500">Database-backed product details for admin review</p>
                    </div>
                    <button
                      onClick={() => setSelectedProduct(null)}
                      className="text-[11px] font-bold uppercase text-slate-600 hover:text-slate-900 border border-slate-200 rounded-full px-4 py-2 transition-colors"
                    >
                      Close details
                    </button>
                  </div>

                  <div className="grid gap-6 lg:grid-cols-3">
                    <div className="space-y-4 lg:col-span-2">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100">
                          <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Price</p>
                          <p className="mt-2 text-2xl font-extrabold text-slate-900">${selectedProduct.price.toFixed(2)}</p>
                          {selectedProduct.originalPrice != null && (
                            <p className="text-xs text-slate-500 line-through">${selectedProduct.originalPrice.toFixed(2)}</p>
                          )}
                        </div>
                        <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100">
                          <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Stock</p>
                          <p className="mt-2 text-xl font-bold text-slate-900">{selectedProduct.stock} units</p>
                          <span className="text-[11px] text-slate-500">{selectedProduct.stock > 5 ? 'Healthy inventory' : selectedProduct.stock > 0 ? 'Low stock' : 'Out of stock'}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100">
                          <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Category</p>
                          <p className="mt-2 text-slate-900 font-bold">{selectedProduct.category || 'Uncategorized'}</p>
                          {selectedProduct.subCategory && <p className="text-xs text-slate-500">{selectedProduct.subCategory}</p>}
                        </div>
                        <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100">
                          <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Brand</p>
                          <p className="mt-2 text-slate-900 font-bold">{selectedProduct.brand || 'Unbranded'}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {selectedProduct.sku && (
                          <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100">
                            <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">SKU</p>
                            <p className="mt-2 text-slate-900 font-bold">{selectedProduct.sku}</p>
                          </div>
                        )}
                        {selectedProduct.brand && (
                          <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100">
                            <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Brand</p>
                            <p className="mt-2 text-slate-900 font-bold">{selectedProduct.brand}</p>
                          </div>
                        )}
                        {selectedProduct.hsnCode && (
                          <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100">
                            <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">HSN Code</p>
                            <p className="mt-2 text-slate-900 font-bold">{selectedProduct.hsnCode}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100">
                        <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Origins</p>
                        <p className="mt-2 text-slate-900 font-bold">{selectedProduct.countryOfOrigin || selectedProduct.manufacturerCountry || 'Not provided'}</p>
                        <p className="mt-1 text-xs text-slate-500">{selectedProduct.manufacturerName || 'Manufacturer details unavailable'}</p>
                      </div>
                      <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100">
                        <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Created</p>
                        <p className="mt-2 text-slate-900 font-bold">{new Date(selectedProduct.createdAt).toLocaleDateString()}</p>
                        <p className="mt-1 text-xs text-slate-500">Database timestamp</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-6 lg:grid-cols-3 mt-6">
                    <div className="lg:col-span-2 space-y-4">
                      <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100">
                        <h4 className="text-sm font-extrabold text-slate-900 mb-2">Product overview</h4>
                        <p className="text-sm leading-relaxed text-slate-700">{selectedProduct.description || 'No detailed product description available from the database.'}</p>
                      </div>
                      {selectedProduct.highlights && (
                        <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100">
                          <h4 className="text-sm font-extrabold text-slate-900 mb-2">Highlights</h4>
                          <p className="text-sm text-slate-700">{selectedProduct.highlights}</p>
                        </div>
                      )}
                      {selectedProduct.aboutProduct && selectedProduct.aboutProduct.length > 0 && (
                        <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100">
                          <h4 className="text-sm font-extrabold text-slate-900 mb-2">About this product</h4>
                          <ul className="list-disc list-inside text-sm text-slate-700 space-y-2">
                            {selectedProduct.aboutProduct.map((line, idx) => (
                              <li key={idx}>{line}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                    <div className="space-y-4">
                      {selectedProduct.directions && selectedProduct.directions.length > 0 && (
                        <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100">
                          <h4 className="text-sm font-extrabold text-slate-900 mb-2">Usage directions</h4>
                          <ul className="list-disc list-inside text-sm text-slate-700 space-y-2">
                            {selectedProduct.directions.map((line, idx) => (
                              <li key={idx}>{line}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {selectedProduct.variants && selectedProduct.variants.length > 0 && (
                        <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100">
                          <h4 className="text-sm font-extrabold text-slate-900 mb-2">Variants</h4>
                          <div className="space-y-2 text-sm text-slate-700">
                            {selectedProduct.variants.map((variant, idx) => (
                              <div key={variant.id || idx} className="bg-white border border-slate-200 rounded-2xl p-3">
                                <p className="font-semibold text-slate-900">{variant.size} / {variant.colour}</p>
                                <p className="text-[11px] text-slate-500">SKU: {variant.sku || '—'}</p>
                                <p className="text-[11px] text-slate-500">Price: ${variant.price.toFixed(2)} · Stock: {variant.stock}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}


          {/* ======================= TAB 2: CATEGORY MANAGEMENT ======================= */}
          {activeTab === 'category' && (
            <CategoryManagement />
          )}


          {/* ======================= TAB 3: PRODUCTS VIEW & NEW ======================= */}
          {activeTab === 'products' && (
            <ProductManagement />
          )}


          {/* ======================= TAB 4: ADS MANAGEMENT ======================= */}
          {activeTab === 'ads' && (
            <div className="space-y-6 text-left" id="admin_ads_management">
              <div className="border-b border-slate-200 pb-4">
                <h2 className="text-xl font-extrabold text-slate-900">Homepage Banner Ads</h2>
                <p className="text-xs text-slate-500">Upload up to 5 banner images. They will auto-rotate every 7 seconds on the homepage carousel.</p>
                <p className="text-xs text-blue-600 font-bold mt-1">Recommended size: 1200 x 300 px (4:1 ratio). Images display at 300px height without cropping.</p>
              </div>

              {isAdsLoading ? (
                <div className="text-center py-16">
                  <div className="w-8 h-8 border-3 border-violet-200 border-t-violet-600 rounded-full animate-spin mx-auto"></div>
                  <p className="text-xs text-slate-400 mt-3">Loading banners...</p>
                </div>
              ) : (
                <div className="space-y-5">
                  {/* Current Banners Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {adBanners.map((ad, idx) => (
                      <div key={ad.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs group relative">
                        <div className="h-[120px] bg-slate-50">
                          <img src={ad.image_url} alt={`Banner ${idx + 1}`} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                        </div>
                        <div className="p-3 flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-600">Banner {idx + 1}</span>
                          <button
                            onClick={() => handleDeleteAd(ad.id, ad.image_path)}
                            className="text-xs font-bold text-red-500 hover:text-red-700 flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" /> Remove
                          </button>
                        </div>
                      </div>
                    ))}

                    {/* Upload Button (+ icon) */}
                    {adBanners.length < 5 && (
                      <label className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center h-[168px] cursor-pointer hover:border-violet-400 hover:bg-violet-50/30 transition-all">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAdImageUpload}
                          className="hidden"
                          disabled={adUploading}
                        />
                        {adUploading ? (
                          <div className="text-center">
                            <div className="w-8 h-8 border-3 border-violet-200 border-t-violet-600 rounded-full animate-spin mx-auto mb-2"></div>
                            <p className="text-xs text-violet-600 font-bold">{adUploadProgress}%</p>
                          </div>
                        ) : (
                          <>
                            <Plus className="w-8 h-8 text-slate-400 mb-2" />
                            <p className="text-xs font-bold text-slate-500">Upload Banner</p>
                            <p className="text-[10px] text-slate-400 mt-1">1200 x 300 px recommended</p>
                          </>
                        )}
                      </label>
                    )}
                  </div>

                  {adBanners.length >= 5 && (
                    <p className="text-xs text-amber-600 font-bold text-center bg-amber-50 border border-amber-200 rounded-lg py-2">Maximum 5 banners reached. Remove one to upload a new one.</p>
                  )}

                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center">
                    <p className="text-xs text-slate-500"><span className="font-bold">{adBanners.length}/5</span> banners uploaded. Active banners rotate every 7 seconds on homepage.</p>
                  </div>
                </div>
              )}
            </div>
          )}


          {/* ======================= TAB 5: ORDERS MANAGEMENT ======================= */}
          {activeTab === 'orders' && (
            <div className="space-y-8 text-left" id="admin_orders_management">
              <div className="border-b border-slate-200 pb-4">
                <h2 className="text-xl font-extrabold text-slate-900">Manage Shipments & Orders</h2>
                <p className="text-xs text-slate-500">Complete listing of transactional order books with direct status dispatch triggers.</p>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
                <div className="p-4 bg-slate-50 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-600 font-mono">Live Transactions</p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 uppercase font-mono font-extrabold text-[10px] bg-slate-50/50">
                        <th className="py-3.5 px-4">OrderID</th>
                        <th className="py-3.5 px-4">Customer Details</th>
                        <th className="py-3.5 px-4">Purchased Product Items</th>
                        <th className="py-3.5 px-4">Total Amount</th>
                        <th className="py-3.5 px-4">Payment Method</th>
                        <th className="py-3.5 px-4">Status / Dispatches</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-705">
                      {orders.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-10 text-center text-slate-400 font-mono text-xs">
                            No real-time user checkout logs registered yet in state. Checkout some carts first, and they will populate instantly!
                          </td>
                        </tr>
                      ) : (
                        orders.map((o) => (
                          <tr key={o.id} className="hover:bg-slate-50/20">
                            <td className="py-3 px-4 font-mono font-bold text-[#7c3aed]">#{o.id.substring(0, 8)}</td>
                            <td className="py-3 px-4">
                              <p className="font-bold text-slate-900">{o.customerName}</p>
                              <span className="text-[10px] text-slate-400 font-mono">{o.phone || o.email}</span>
                            </td>
                            <td className="py-3 px-4">
                              <div className="space-y-1">
                                {o.items.map((it, idx) => (
                                  <div key={idx} className="text-slate-700 font-sans text-xs">
                                    • <span className="font-bold">{it.name}</span> <span className="text-slate-400">Qty {it.quantity}</span>
                                  </div>
                                ))}
                              </div>
                            </td>
                            <td className="py-3 px-4 font-mono font-black text-slate-900">${o.total.toFixed(2)}</td>
                            <td className="py-3 px-4 uppercase text-[10px] text-slate-500 font-mono font-extrabold">{o.paymentMethod || 'COD'}</td>
                            <td className="py-3 px-4">
                              <select 
                                value={o.status}
                                onChange={(e) => handleOrderStatusChange(o.id, e.target.value as any)}
                                className="bg-[#FAF9FF] border border-violet-100 text-[#7c3aed] text-[11px] font-bold rounded-lg py-1.5 px-2.5 focus:outline-none focus:ring-1 focus:ring-violet-500"
                              >
                                <option value="accepted">Accepted</option>
                                <option value="rejected">Rejected</option>
                                <option value="packed">Packed</option>
                                <option value="picked_up">Picked Up</option>
                                <option value="in_transit">In Transit</option>
                                <option value="out_for_delivery">Out for Delivery</option>
                                <option value="delivered">Delivered</option>
                              </select>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}


          {/* ======================= TAB 6: HOMEPAGE SECTIONS ======================= */}
          {activeTab === 'homepage' && (
            <div className="space-y-6 text-left" id="admin_homepage_settings">
              <div className="border-b border-slate-200 pb-4">
                <h2 className="text-xl font-extrabold text-slate-900">Homepage Sections</h2>
                <p className="text-xs text-slate-500">Manage which products appear in each homepage section (Featured Products, Hot Deals, Trending Now).</p>
              </div>

              {isSectionsLoading ? (
                <div className="text-center py-16">
                  <div className="w-8 h-8 border-3 border-violet-200 border-t-violet-600 rounded-full animate-spin mx-auto"></div>
                  <p className="text-xs text-slate-400 mt-3">Loading sections...</p>
                </div>
              ) : (
                <div className="space-y-8">
                  {homepageSections.map(section => (
                    <div key={section.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                        <div>
                          <h3 className="font-extrabold text-sm text-slate-900">{section.name}</h3>
                          <p className="text-[10px] text-slate-400">{section.products.length} products assigned</p>
                        </div>
                        <button
                          onClick={() => setShowAddProductToSection(section.id)}
                          className="flex items-center gap-1.5 bg-[#7c3aed] text-white text-[11px] font-bold py-2 px-3 rounded-lg hover:bg-violet-700 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" /> Add Product
                        </button>
                      </div>

                      {section.products.length === 0 ? (
                        <p className="text-xs text-slate-400 text-center py-6">No products in this section yet. Click "Add Product" above.</p>
                      ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                          {section.products.map(sp => (
                            <div key={sp.id} className="relative bg-slate-50 border border-slate-100 rounded-xl overflow-hidden group">
                              {sp.product?.images?.[0] && (
                                <img src={sp.product.images[0]} alt="" className="w-full h-20 object-cover" referrerPolicy="no-referrer" />
                              )}
                              <div className="p-2">
                                <p className="text-[10px] font-bold text-slate-800 truncate">{sp.product?.name || 'Unknown'}</p>
                                <p className="text-[10px] text-slate-500 font-mono">₹{sp.product?.price || 0}</p>
                              </div>
                              <button
                                onClick={() => handleRemoveProductFromSection(sp.id)}
                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                title="Remove"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Add Product to Section Modal */}
              {showAddProductToSection && (
                <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4">
                  <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 max-h-[80vh] flex flex-col">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                      <h3 className="font-extrabold text-slate-900 text-sm">Add Product to Section</h3>
                      <button onClick={() => { setShowAddProductToSection(null); setSectionProductSearch(''); }} className="text-slate-400 hover:text-slate-600 cursor-pointer"><X className="w-5 h-5" /></button>
                    </div>
                    <input
                      type="text"
                      value={sectionProductSearch}
                      onChange={(e) => setSectionProductSearch(e.target.value)}
                      placeholder="Search products by name..."
                      className="w-full text-xs border border-slate-200 rounded-xl py-2.5 px-3 mb-4 focus:outline-none focus:ring-1 focus:ring-violet-500"
                    />
                    <div className="overflow-y-auto flex-grow space-y-2">
                      {dbProducts
                        .filter(p => p.name.toLowerCase().includes(sectionProductSearch.toLowerCase()))
                        .slice(0, 20)
                        .map(p => (
                          <button
                            key={p.id}
                            onClick={() => handleAddProductToSection(showAddProductToSection, p.id)}
                            className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-violet-50 border border-slate-100 transition-colors cursor-pointer text-left"
                          >
                            {p.images?.[0] && <img src={p.images[0]} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" referrerPolicy="no-referrer" />}
                            <div className="min-w-0 flex-grow">
                              <p className="text-xs font-bold text-slate-900 truncate">{p.name}</p>
                              <p className="text-[10px] text-slate-500">₹{p.price} • {p.category}</p>
                            </div>
                            <Plus className="w-4 h-4 text-violet-500 shrink-0" />
                          </button>
                        ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}


          {/* ======================= TAB 7: ACCOUNTS WORKSPACE ======================= */}
          {activeTab === 'accounts' && (
            <div className="space-y-8 text-left" id="admin_accounts_catalog">
              <div className="border-b border-slate-200 pb-4">
                <h2 className="text-xl font-extrabold text-slate-900">Registered Accounts ({userAccounts.length})</h2>
                <p className="text-xs text-slate-500">Configure client buyer permissions levels and administrative authority parameters.</p>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
                <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                  <p className="text-xs font-bold text-slate-600 font-mono">Registry List</p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 uppercase font-mono font-extrabold text-[10px] bg-slate-50/50">
                        <th className="py-3.5 px-4">User Name</th>
                        <th className="py-3.5 px-4">Email Address</th>
                        <th className="py-3.5 px-4">Registered Role</th>
                        <th className="py-3.5 px-4">Purchases Count</th>
                        <th className="py-3.5 px-4">Join Date</th>
                        <th className="py-3.5 px-4 text-center">Status Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                      {userAccounts.map((u) => (
                        <tr key={u.id} className="hover:bg-slate-50/20">
                          <td className="py-3 px-4 font-bold text-slate-900">{u.name}</td>
                          <td className="py-3 px-4 font-mono font-medium text-slate-400">{u.email}</td>
                          <td className="py-3 px-4">
                            <select 
                              value={u.role}
                              onChange={(e) => handleUpdateRole(u.id, e.target.value)}
                              className="bg-slate-50 border border-slate-200 text-slate-700 text-[11px] font-bold rounded-lg py-1 px-2 focus:outline-none focus:ring-1 focus:ring-violet-500"
                            >
                              <option value="ADMIN">ADMIN</option>
                              <option value="BUYER">BUYER</option>
                            </select>
                          </td>
                          <td className="py-3 px-4 font-mono font-bold">{u.purchasesCount} orders placed</td>
                          <td className="py-3 px-4 text-slate-450 text-[10px] font-mono">{u.joinDate}</td>
                          <td className="py-3 px-4 text-center">
                            <button 
                              onClick={() => handleToggleUserStatus(u.id)}
                              className={`p-1 px-3 rounded-full text-[10px] font-extrabold cursor-pointer uppercase ${
                                u.status === 'Active' 
                                  ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                                  : 'bg-rose-50 text-rose-600 border border-rose-100 animate-pulse'
                              }`}
                            >
                              {u.status}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

              </div>
            </div>
          )}


          {/* ======================= TAB 8: INBOX SUPPORT CHAT ======================= */}
          {activeTab === 'inbox' && (
            <div className="space-y-8 text-left" id="admin_inbox_support">
              <div className="border-b border-slate-200 pb-4">
                <h2 className="text-xl font-extrabold text-slate-900">Support Inbox Tickets Workspace</h2>
                <p className="text-xs text-slate-500">Secure message routing to dispatch local artisan answers.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs h-[500px]">
                
                {/* Tickets list split pane */}
                <div className="border-r border-slate-200 divide-y divide-slate-100 overflow-y-auto h-full">
                  <div className="p-4 bg-slate-50 border-b border-slate-100 sticky top-0 font-bold text-xs text-slate-500">
                    Open Support Tickets
                  </div>
                  
                  {inboxMessages.map((m) => (
                    <button 
                      key={m.id}
                      onClick={() => {
                        setActiveMessageId(m.id);
                        setReplyInput(m.replyText || '');
                      }}
                      className={`w-full text-left p-4 hover:bg-slate-50/50 block space-y-1 border-l-4 transition-all ${
                        activeMessageId === m.id 
                          ? 'bg-violet-50/20 border-l-[#7c3aed]' 
                          : 'border-l-transparent'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <span className="font-extrabold text-xs text-slate-900">{m.sender}</span>
                        <span className="text-[9px] text-slate-400 font-mono">{m.date}</span>
                      </div>
                      <p className="font-bold text-[11px] text-[#7c3aed] truncate">{m.subject}</p>
                      <p className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed">{m.message}</p>
                      <div className="flex justify-end pt-1">
                        <span className={`text-[9px] font-sans font-bold px-1 rounded uppercase ${
                          m.replied 
                            ? 'bg-emerald-50 text-emerald-600' 
                            : 'bg-amber-100 text-amber-700 animate-pulse'
                        }`}>
                          {m.replied ? 'Replied' : 'Pending reply'}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Ticket conversation view */}
                <div className="lg:col-span-2 flex flex-col justify-between h-full bg-slate-50/20">
                  
                  {currentActiveMsg ? (
                    <>
                      <div className="p-6 border-b border-slate-100 bg-white shadow-xs">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#7c3aed]/10 text-[#7c3aed] font-extrabold flex items-center justify-center font-mono">
                            {currentActiveMsg.sender.charAt(0)}
                          </div>
                          <div className="text-left leading-tight">
                            <h4 className="font-bold text-xs text-slate-900">{currentActiveMsg.sender}</h4>
                            <span className="text-[10px] text-slate-400 font-mono">{currentActiveMsg.email} — Ticket reference {currentActiveMsg.id}</span>
                          </div>
                        </div>
                        <h3 className="font-extrabold text-sm text-slate-900 mt-4 uppercase border-t border-slate-50 pt-2">{currentActiveMsg.subject}</h3>
                      </div>

                      {/* Msg history stream */}
                      <div className="p-6 flex-grow overflow-y-auto space-y-4">
                        
                        {/* Cutomer Message bubble */}
                        <div className="bg-white border border-slate-100 rounded-2xl p-4 max-w-xl text-left shadow-xs">
                          <p className="text-xs text-slate-700 leading-relaxed font-sans font-normal">{currentActiveMsg.message}</p>
                        </div>

                        {/* Admin Reply bubble */}
                        {currentActiveMsg.replied && (
                          <div className="ml-auto bg-[#7c3aed] text-white rounded-2xl p-4 max-w-xl text-left shadow-xs space-y-1 animate-in slide-in-from-right duration-350">
                            <span className="text-[9px] font-mono font-bold text-violet-200 block uppercase">Response Sent:</span>
                            <p className="text-xs leading-relaxed font-sans font-medium">{currentActiveMsg.replyText}</p>
                          </div>
                        )}

                      </div>

                      {/* Reply form */}
                      <div className="p-4 bg-white border-t border-slate-100 sticky bottom-0">
                        <form onSubmit={handleSendReply} className="flex gap-2">
                          <input 
                            value={replyInput}
                            onChange={(e) => setReplyInput(e.target.value)}
                            placeholder={currentActiveMsg.replied ? "Type additional response..." : "Type reply answers to dispatch..."}
                            className="flex-grow text-xs border border-slate-200 px-3.5 py-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#7c3aed] text-slate-700 bg-slate-50"
                          />
                          <button type="submit" className="bg-[#7c3aed] text-white p-2.5 px-4 rounded-xl flex items-center justify-center hover:bg-violet-700 transition-all cursor-pointer">
                            <Send className="w-4 h-4" />
                          </button>
                        </form>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-20 text-slate-400 h-full font-mono text-xs">
                      No support request ticket currently selected. Click on a client item to review logs.
                    </div>
                  )}

                </div>

              </div>

            </div>
          )}

        </div>

      </div>

      {/* ==================== FORM MODAL: EDIT PRODUCT MOCKUP ==================== */}
      {editProduct && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-[999]" id="edit_product_modal">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-100/50 space-y-4 text-left animate-in zoom-in duration-200">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2.5">
              <h3 className="font-sans font-extrabold text-sm text-slate-900 uppercase">Edit Product Details</h3>
              <button onClick={() => setEditProduct(null)} className="p-1 hover:bg-slate-100 rounded-full"><X className="w-4 h-4 text-slate-500" /></button>
            </div>

            <form onSubmit={handleSaveProductEdit} className="space-y-3">
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-550 text-slate-500">Product Name Title</label>
                <input 
                  type="text" 
                  value={editProduct.name}
                  onChange={(e) => setEditProduct({ ...editProduct, name: e.target.value })}
                  className="w-full text-xs border border-slate-200 rounded-xl py-2 px-3 focus:outline-none focus:ring-1 focus:ring-violet-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-500">Price ($)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={editProduct.price}
                    onChange={(e) => setEditProduct({ ...editProduct, price: parseFloat(e.target.value) || 0 })}
                    className="w-full text-xs font-bold border border-slate-200 rounded-xl py-2 px-3 focus:outline-none focus:ring-1 focus:ring-violet-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-500">Stock Inventory Units</label>
                  <input 
                    type="number" 
                    value={editProduct.stock}
                    onChange={(e) => setEditProduct({ ...editProduct, stock: parseInt(e.target.value, 10) || 0 })}
                    className="w-full text-xs font-bold border border-slate-200 rounded-xl py-2 px-3 focus:outline-none focus:ring-1 focus:ring-violet-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-500">Custom Category Selection</label>
                <select 
                  value={editProduct.category}
                  onChange={(e) => setEditProduct({ ...editProduct, category: e.target.value })}
                  className="w-full text-xs border border-slate-200 rounded-xl py-2 px-3 focus:outline-none focus:ring-1 focus:ring-violet-500 bg-white"
                >
                  {categories.map((cat, idx) => (
                    <option key={idx} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-500">Description Summary</label>
                <textarea 
                  value={editProduct.description}
                  onChange={(e) => setEditProduct({ ...editProduct, description: e.target.value })}
                  rows={3}
                  className="w-full text-xs border border-slate-200 rounded-xl py-2.5 px-3 focus:outline-none focus:ring-1 focus:ring-violet-500"
                />
              </div>

              <button type="submit" className="w-full py-2.5 bg-[#7c3aed] text-white rounded-xl text-xs font-bold hover:bg-violet-700 transition-colors uppercase">
                Save Product Changes
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ==================== FORM MODAL: ADD PRODUCT WORKSPACE ==================== */}
      {showAddProductModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-[999]" id="add_product_modal">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-100/50 space-y-4 text-left animate-in zoom-in duration-205">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2.5">
              <h3 className="font-sans font-extrabold text-sm text-slate-900 uppercase">Create New Artisan Product</h3>
              <button onClick={() => setShowAddProductModal(false)} className="p-1 hover:bg-slate-100 rounded-full"><X className="w-4 h-4 text-slate-500" /></button>
            </div>

            <form onSubmit={handleCreateProductSubmit} className="space-y-3 select-none">
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-500">Product Name Title</label>
                <input 
                  type="text" 
                  value={newProd.name}
                  onChange={(e) => setNewProd({ ...newProd, name: e.target.value })}
                  placeholder="e.g., Ceramic Sandalwood Coffee Mug"
                  className="w-full text-xs border border-slate-200 rounded-xl py-2 px-3 focus:outline-none focus:ring-1 focus:ring-violet-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-500">Price ($)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={newProd.price}
                    onChange={(e) => setNewProd({ ...newProd, price: e.target.value })}
                    placeholder="19.99"
                    className="w-full text-xs border border-slate-200 rounded-xl py-2 px-3 focus:outline-none focus:ring-1 focus:ring-violet-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-500">Original Price ($ - Optional)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={newProd.originalPrice}
                    onChange={(e) => setNewProd({ ...newProd, originalPrice: e.target.value })}
                    placeholder="29.99"
                    className="w-full text-xs border border-slate-200 rounded-xl py-2 px-3 focus:outline-none focus:ring-1 focus:ring-violet-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-500">Category</label>
                  <select 
                    value={newProd.category}
                    onChange={(e) => setNewProd({ ...newProd, category: e.target.value })}
                    className="w-full text-xs border border-slate-200 rounded-xl py-2 px-3 focus:outline-none focus:ring-1 focus:ring-violet-500 bg-white"
                  >
                    {categories.map((cat, idx) => (
                      <option key={idx} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-500">Initial Stock</label>
                  <input 
                    type="number" 
                    value={newProd.stock}
                    onChange={(e) => setNewProd({ ...newProd, stock: e.target.value })}
                    className="w-full text-xs border border-slate-200 rounded-xl py-2 px-3 focus:outline-none focus:ring-1 focus:ring-violet-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-500">Image Asset URL</label>
                <input 
                  type="text" 
                  value={newProd.imageUrl}
                  onChange={(e) => setNewProd({ ...newProd, imageUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full text-xs border border-slate-200 rounded-xl py-2 px-3 focus:outline-none focus:ring-1 focus:ring-violet-500"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-500">Brand Name</label>
                <input 
                  type="text" 
                  value={newProd.brand || ''}
                  onChange={(e) => setNewProd({ ...newProd, brand: e.target.value })}
                  placeholder="e.g. ShopeValley"
                  className="w-full text-xs border border-slate-200 rounded-xl py-2 px-3 focus:outline-none focus:ring-1 focus:ring-violet-500"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-500">Item Description</label>
                <textarea 
                  value={newProd.description}
                  onChange={(e) => setNewProd({ ...newProd, description: e.target.value })}
                  placeholder="Describe building materials and kilning parameters of the piece..."
                  rows={2}
                  className="w-full text-xs border border-slate-200 rounded-xl py-2 px-3 focus:outline-none focus:ring-1 focus:ring-violet-500"
                />
              </div>

              <button type="submit" className="w-full py-2.5 bg-[#7c3aed] text-white rounded-xl text-xs font-bold hover:bg-violet-700 transition-colors uppercase">
                Publish Product Live
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
