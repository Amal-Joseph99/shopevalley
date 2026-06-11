import React, { useState } from 'react';
import { 
  PlusCircle, 
  Store, 
  Briefcase, 
  DollarSign, 
  Package, 
  ShoppingCart, 
  TrendingUp, 
  Award, 
  Sparkles,
  CheckCircle2,
  Trash2,
  Lock
} from 'lucide-react';
import { Vendor, Product } from '../types';

interface VendorPortalProps {
  vendors: Vendor[];
  products: Product[];
  onAddProduct: (prod: Product) => void;
  onAddVendor: (v: Vendor) => void;
  onDeleteProduct: (prodId: string) => void;
  onNavigate: (path: string) => void;
}

export default function VendorPortal({
  vendors,
  products,
  onAddProduct,
  onAddVendor,
  onDeleteProduct,
  onNavigate
}: VendorPortalProps) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'inventory' | 'register'>('dashboard');
  
  // Registration form states
  const [regName, setRegName] = useState('');
  const [regBio, setRegBio] = useState('');
  const [regCategory, setRegCategory] = useState('Ceramics');
  const [regLocation, setRegLocation] = useState('Denver, CO');
  const [regLogo, setRegLogo] = useState('https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=200&auto=format&fit=crop&q=80');
  const [vendorRegistered, setVendorRegistered] = useState(false);
  const [newVendorId, setNewVendorId] = useState('');

  // Add Product form states (controlled by simulated current active vendor)
  const [selectedVendorId, setSelectedVendorId] = useState('v1'); // Default to Aura Pottery
  const [newProdName, setNewProdName] = useState('');
  const [newProdDesc, setNewProdDesc] = useState('');
  const [newProdPrice, setNewProdPrice] = useState('');
  const [newProdCategory, setNewProdCategory] = useState('Ceramics');
  const [newProdStock, setNewProdStock] = useState('10');
  const [newProdMaterials, setNewProdMaterials] = useState('');
  const [newProdImg, setNewProdImg] = useState('https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=600&auto=format&fit=crop&q=80');
  const [productAddedSuccess, setProductAddedSuccess] = useState(false);

  // Statistics calculations based on active vendor profile
  const currentVendor = vendors.find(v => v.id === selectedVendorId) || vendors[0];
  const vendorProducts = products.filter(p => p.vendorId === currentVendor.id);
  const totalStockCount = vendorProducts.reduce((acc, p) => acc + p.stock, 0);
  
  // Simulated stats metrics
  const totalIncomingRevenue = vendorProducts.length * 482 + 540;
  const totalSalesCount = Math.round(totalIncomingRevenue / 55);

  const handleRegisterVendor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName || !regBio) {
      alert('Please compile all necessary fields.');
      return;
    }

    const newId = `v_${Date.now()}`;
    const slug = regName.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');
    const newV: Vendor = {
      id: newId,
      name: regName,
      slug,
      logo: regLogo,
      coverImage: 'https://images.unsplash.com/photo-1565192647048-f997ded879ab?w=1200&auto=format&fit=crop&q=80',
      description: regBio,
      rating: 5.0,
      reviewsCount: 0,
      location: regLocation,
      distance: 2.5,
      category: regCategory,
      featured: false,
      joinDate: 'Just Now'
    };

    onAddVendor(newV);
    setNewVendorId(newId);
    setSelectedVendorId(newId);
    setVendorRegistered(true);
    setActiveTab('inventory');
  };

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName || !newProdPrice || !newProdDesc) {
      alert('Please fill out product particulars.');
      return;
    }

    const priceNum = parseFloat(newProdPrice);
    const stockNum = parseInt(newProdStock, 10);
    if (isNaN(priceNum) || isNaN(stockNum)) {
      alert('Please enter appropriate numbers for price and inventory.');
      return;
    }

    const prodSlug = newProdName.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');
    const materialsArray = newProdMaterials.split(',').map(m => m.trim()).filter(Boolean);

    const newP: Product = {
      id: `p_${Date.now()}`,
      name: newProdName,
      slug: prodSlug,
      idKey: `p_key_${Date.now()}`,
      description: newProdDesc,
      price: priceNum,
      category: newProdCategory,
      images: [newProdImg],
      vendorId: currentVendor.id,
      vendorName: currentVendor.name,
      rating: 5.0,
      reviewCount: 0,
      stock: stockNum,
      tags: [newProdCategory.toLowerCase(), 'artisan', 'handmade', 'direct'],
      isHandmade: true,
      materials: materialsArray.length > 0 ? materialsArray : ['Premium eco clay', 'Beeswax finish'],
      createdAt: new Date().toISOString()
    };

    onAddProduct(newP);
    setProductAddedSuccess(true);
    
    // Clear form inputs
    setNewProdName('');
    setNewProdDesc('');
    setNewProdPrice('');
    setNewProdMaterials('');
    
    setTimeout(() => {
      setProductAddedSuccess(false);
    }, 4000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8" id="sh_vendor_portal_dashboard">
      
      {/* 1. Header Hero Panel */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-lg mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
        <div className="absolute right-0 bottom-0 p-16 bg-white/[0.02] rounded-tl-full pointer-events-none select-none" />
        
        <div className="flex items-center gap-4">
          <div className="bg-amber-400 text-slate-950 p-4 rounded-xl shadow-md border border-amber-300">
            <Store className="w-8 h-8" />
          </div>
          <div>
            <h1 className="font-extrabold text-2xl tracking-tighter uppercase font-sans">
              Admin & Shop Operations Portal
            </h1>
            <p className="text-xs text-slate-400 font-mono">
              Configured Vendor: <span className="text-amber-400 font-bold font-sans">{currentVendor.name} ({currentVendor.location})</span>
            </p>
          </div>
        </div>

        {/* Change vendor scope drop-down */}
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="shrink-0">
            <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Switch Managed Shop:</label>
            <select 
              value={selectedVendorId}
              onChange={(e) => setSelectedVendorId(e.target.value)}
              className="bg-slate-800/80 border border-slate-700 text-white text-xs font-bold py-2 px-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-400 cursor-pointer"
            >
              {vendors.map((v) => (
                <option key={v.id} value={v.id}>{v.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 2. Navigation Tabs */}
      <div className="flex border-b border-slate-200 mb-8 overflow-x-auto">
        <button 
          onClick={() => setActiveTab('dashboard')}
          className={`px-5 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all shrink-0 cursor-pointer ${
            activeTab === 'dashboard' ? 'border-slate-950 text-slate-950 font-black' : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <TrendingUp className="w-4 h-4 inline mr-1.5" />
          Shop Metrics & Orders
        </button>
        <button 
          onClick={() => setActiveTab('inventory')}
          className={`px-5 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all shrink-0 cursor-pointer ${
            activeTab === 'inventory' ? 'border-slate-950 text-slate-950 font-black' : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <Package className="w-4 h-4 inline mr-1.5" />
          My Products & Stock ({vendorProducts.length})
        </button>
      </div>

      {/* 3. Tab Contents */}
      
      {/* Tab A: Shop Metrics & Dashboard */}
      {activeTab === 'dashboard' && (
        <div className="space-y-8" id="v_tab_dashboard">
          {/* Bento analytics grids */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex items-center justify-between shadow-sm">
              <div>
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block">My Escrow Balance</span>
                <span className="text-2xl font-extrabold text-slate-900 mt-1 block">${totalIncomingRevenue}</span>
                <span className="text-[10px] text-emerald-600 font-bold block mt-0.5">↑ 100% Securely Held</span>
              </div>
              <div className="p-3 bg-white border border-slate-200 text-slate-700 rounded-xl shadow-sm">
                <DollarSign className="w-6 h-6 text-emerald-600" />
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex items-center justify-between shadow-sm">
              <div>
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block">Fulfilled Orders</span>
                <span className="text-2xl font-extrabold text-slate-900 mt-1 block">{totalSalesCount} items</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Average checkout $45</span>
              </div>
              <div className="p-3 bg-white border border-slate-200 text-slate-700 rounded-xl shadow-sm">
                <ShoppingCart className="w-6 h-6 text-slate-600" />
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex items-center justify-between shadow-sm">
              <div>
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block">Active Catalog</span>
                <span className="text-2xl font-extrabold text-slate-900 mt-1 block">{vendorProducts.length} items</span>
                <span className="text-[10px] text-amber-600 font-bold block mt-0.5">{totalStockCount} units in stock</span>
              </div>
              <div className="p-3 bg-white border border-slate-200 text-slate-700 rounded-xl shadow-sm">
                <Package className="w-6 h-6 text-amber-500" />
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex items-center justify-between shadow-sm">
              <div>
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block">Verified Rating</span>
                <span className="text-2xl font-extrabold text-slate-900 mt-1 block">{currentVendor.rating} ★</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">({currentVendor.reviewsCount} customer feeds)</span>
              </div>
              <div className="p-3 bg-white border border-slate-200 text-slate-700 rounded-xl shadow-sm">
                <Award className="w-6 h-6 text-amber-400 animate-pulse" />
              </div>
            </div>

          </div>

          {/* Graphical/Visual Chart Simulation representational blocks */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Sales Chart */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-slate-950 text-base leading-none mb-2">Simulated Sales Pattern</h3>
              <p className="text-xs text-slate-500 mb-5">Calculated seasonally for {currentVendor.name}</p>
              
              {/* Custom CSS visual bar chart representation */}
              <div className="space-y-4">
                {[
                  { month: 'Jan', sales: 4, amount: 280 },
                  { month: 'Feb', sales: 7, amount: 490 },
                  { month: 'Mar', sales: 12, amount: 840 },
                  { month: 'Apr', sales: 9, amount: 630 },
                  { month: 'May (Record)', sales: 15, amount: 1200 }
                ].map((item, idx) => {
                  const maxAmount = 1200;
                  const pct = (item.amount / maxAmount) * 100;
                  return (
                    <div key={idx} className="flex items-center gap-3">
                      <span className="w-10 text-[10px] font-mono uppercase text-slate-400">{item.month}</span>
                      <div className="flex-grow bg-slate-100 h-6.5 rounded-lg overflow-hidden border border-slate-200/50">
                        <div 
                          className="bg-slate-900 text-white text-[10px] font-bold font-mono h-full flex items-center pl-3.5"
                          style={{ width: `${pct}%` }}
                        >
                          ${item.amount}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Direct Orders simulation list */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-slate-950 text-base leading-none mb-1">Incoming Purchase Orders</h3>
              <p className="text-xs text-slate-500 mb-4 font-normal">Placed recently across other sessions</p>

              <div className="space-y-3 max-h-56 overflow-y-auto">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex justify-between items-center text-xs">
                  <div>
                    <p className="font-bold text-slate-900">#SV-4821 - Johnathan Doe</p>
                    <p className="text-[10px] text-slate-500">1x Speckled Coffee Cup • Local route</p>
                  </div>
                  <span className="font-extrabold text-amber-600 font-sans">$36.00</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex justify-between items-center text-xs">
                  <div>
                    <p className="font-bold text-slate-900">#SV-1194 - Alice Cooper</p>
                    <p className="text-[10px] text-slate-500">2x Maple Cutting platter • Express</p>
                  </div>
                  <span className="font-extrabold text-amber-600 font-sans">$144.00</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex justify-between items-center text-xs">
                  <div>
                    <p className="font-bold text-slate-900">#SV-7729 - Raymond Smith</p>
                    <p className="text-[10px] text-slate-500">1x Rosemary Salve • Standard</p>
                  </div>
                  <span className="font-extrabold text-amber-600 font-sans">$18.00</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Tab B: Product Inventory Creator Form */}
      {activeTab === 'inventory' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8" id="v_tab_inventory">
          
          {/* Left Block: Add Product catalog form */}
          <div className="lg:col-span-1 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="border-b border-slate-100 pb-3 mb-5 flex items-center justify-between">
              <h3 className="font-bold text-slate-950 text-md">Add Handmade Product</h3>
              <PlusCircle className="w-5 h-5 text-amber-500" />
            </div>

            {productAddedSuccess && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-850 p-4 rounded-xl text-xs mb-4.5 font-bold flex items-center gap-1.5 animate-bounce">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Product added live on ShopeValley! Click Home / Product categories to browse.
              </div>
            )}

            <form onSubmit={handleCreateProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Product Title *</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. Clay Speckled Serving Pitcher"
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                  className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-200 rounded-xl focus:ring-1 focus:ring-slate-950 focus:outline-none bg-white font-sans"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Price ($) *</label>
                  <input 
                    type="number"
                    required
                    placeholder="e.g. 45"
                    value={newProdPrice}
                    onChange={(e) => setNewProdPrice(e.target.value)}
                    className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-200 rounded-xl focus:ring-1 focus:ring-slate-950 focus:outline-none bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Initial Stock *</label>
                  <input 
                    type="number"
                    required
                    placeholder="10"
                    value={newProdStock}
                    onChange={(e) => setNewProdStock(e.target.value)}
                    className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-200 rounded-xl focus:ring-1 focus:ring-slate-950 focus:outline-none bg-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Category Group</label>
                <select 
                  value={newProdCategory}
                  onChange={(e) => setNewProdCategory(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-slate-950 cursor-pointer"
                >
                  <option value="Ceramics">Ceramics</option>
                  <option value="Woodworking">Woodworking</option>
                  <option value="Textiles">Textiles</option>
                  <option value="Leather Bags">Leather Bags</option>
                  <option value="Skincare & Honey">Skincare & Honey</option>
                  <option value="Artisan Jewelry">Artisan Jewelry</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Materials (comma separated)</label>
                <input 
                  type="text"
                  placeholder="e.g. Obsidian mud, lead-free gloss"
                  value={newProdMaterials}
                  onChange={(e) => setNewProdMaterials(e.target.value)}
                  className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-200 rounded-xl focus:ring-1 focus:ring-slate-950 focus:outline-none bg-white font-sans"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">High-Res Product Image URL *</label>
                <input 
                  type="text"
                  required
                  value={newProdImg}
                  onChange={(e) => setNewProdImg(e.target.value)}
                  className="w-full text-xs sm:text-[11px] px-3 py-2 border border-slate-200 rounded-xl focus:ring-1 focus:ring-slate-950 focus:outline-none bg-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Detailed Description *</label>
                <textarea 
                  required
                  placeholder="Throw details, wood curing times, organic skin hydration details..."
                  rows={4}
                  value={newProdDesc}
                  onChange={(e) => setNewProdDesc(e.target.value)}
                  className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-200 rounded-xl focus:ring-1 focus:ring-slate-950 focus:outline-none bg-white font-sans"
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-slate-950 hover:bg-slate-800 text-white font-sans font-bold text-xs py-2.5 rounded-xl transition-all cursor-pointer shadow uppercase"
              >
                List Product LIVE
              </button>
            </form>
          </div>

          {/* Right Column: Inventory Table */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm overflow-hidden flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-slate-950 text-md mb-4.5 border-b border-slate-100 pb-3">
                Active Shop Storefront Inventory ({vendorProducts.length} items)
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse" id="inventory_table">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 font-mono uppercase text-[10px]">
                      <th className="py-2.5">Thumb</th>
                      <th className="py-2.5">Title</th>
                      <th className="py-2.5 text-center">Price</th>
                      <th className="py-2.5 text-center">Stock</th>
                      <th className="py-2.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {vendorProducts.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/50">
                        <td className="py-3">
                          <img 
                            src={p.images[0]} 
                            alt={p.name}
                            className="w-10 h-10 object-cover rounded bg-slate-100 border border-slate-200"
                            referrerPolicy="no-referrer"
                          />
                        </td>
                        <td className="py-3 pr-2">
                          <div className="font-bold text-slate-900 font-sans truncate max-w-[150px] sm:max-w-xs">{p.name}</div>
                          <span className="text-[10px] text-slate-400 font-mono italic">{p.category}</span>
                        </td>
                        <td className="py-3 text-center font-bold text-slate-950">${p.price}</td>
                        <td className="py-3 text-center">
                          <span className={`px-2 py-0.5 rounded font-bold font-mono ${
                            p.stock <= 3 ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {p.stock} units
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <button 
                            onClick={() => onDeleteProduct(p.id)}
                            className="text-rose-500 hover:text-rose-700 p-1.5 focus:outline-none cursor-pointer inline-flex items-center"
                            title="Delete item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {vendorProducts.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-slate-400">
                          No active products listed in your shop catalogs. Use the side form to construct catalog items!
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-8 pt-4.5 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-400 font-mono">
              <span>* Items deleted will be immediately disabled from global buyer routing lists.</span>
              <span className="flex items-center gap-1.5 text-slate-500 font-bold">
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                PCI-DSS Escrow Protected
              </span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
