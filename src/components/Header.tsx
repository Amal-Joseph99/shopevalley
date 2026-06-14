import React, { useState, useEffect } from 'react';
import { 
  Search, 
  MapPin, 
  Heart, 
  ShoppingCart, 
  ChevronDown, 
  Sparkles, 
  Grid,
  Menu,
  X,
  User,
  LogOut,
  ShieldAlert,
  UserCheck,
  Bell,
  ClipboardList,
  Loader2,
  ArrowRight,
  CreditCard,
  HelpCircle,
  ChevronRight,
  Settings,
  Map,
  ShoppingBag,
  MessageSquare,
  LayoutDashboard
} from 'lucide-react';
import { RouteState } from './CustomRouter';
import { LoggedUser } from '../types';

interface HeaderProps {
  cartCount: number;
  wishlistCount: number;
  currentRoute: RouteState;
  onNavigate: (path: string, options?: any) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCategoryFilter: string;
  setSelectedCategoryFilter: (cat: string) => void;
  currentUser: LoggedUser | null;
  onLogout: () => void;
}

export default function Header({
  cartCount,
  wishlistCount,
  currentRoute,
  onNavigate,
  searchQuery,
  setSearchQuery,
  selectedCategoryFilter,
  setSelectedCategoryFilter,
  currentUser,
  onLogout
}: HeaderProps) {
  const [showLocationPopover, setShowLocationPopover] = useState(false);
  const [showAccountPopover, setShowAccountPopover] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isCategoryDrawerOpen, setIsCategoryDrawerOpen] = useState(false);
  const [showInlineLocationEdit, setShowInlineLocationEdit] = useState(false);

  // Address Geolocation States
  const [userLocation, setUserLocation] = useState({
    city: 'Bangalore',
    state: 'Karnataka',
    country: 'India'
  });
  const [isDetecting, setIsDetecting] = useState(false);
  
  // Quick Manual edits
  const [editCity, setEditCity] = useState('Bangalore');
  const [editState, setEditState] = useState('Karnataka');
  const [editCountry, setEditCountry] = useState('India');

  // Categories list mapped directly to existing models
  const categoriesList = [
    'All',
    'Combo Offers',
    'Fashion',
    'Electronics',
    'Mobile & Accessories',
    'Beauty & Personal Care',
    'Home Appliances',
    'PC & Laptops',
    'Sports & Fitness',
    'Furniture',
    'Toys',
    'Baby Care',
    'Books',
    'eBooks'
  ];

  // Geolocation detection logic
  const handleAutoDetectLocation = async () => {
    setIsDetecting(true);
    try {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async () => {
            try {
              const res = await fetch('https://ipapi.co/json/');
              if (res.ok) {
                const data = await res.json();
                if (data.city) {
                  const updated = {
                    city: data.city || 'Bangalore',
                    state: data.region || 'Karnataka',
                    country: data.country_name || 'India'
                  };
                  setUserLocation(updated);
                  setEditCity(updated.city);
                  setEditState(updated.state);
                  setEditCountry(updated.country);
                }
              }
            } catch (err) {
              console.warn(err);
            } finally {
              setIsDetecting(false);
            }
          },
          async () => {
            try {
              const res = await fetch('https://ipapi.co/json/');
              if (res.ok) {
                const data = await res.json();
                if (data.city) {
                  const updated = {
                    city: data.city,
                    state: data.region,
                    country: data.country_name
                  };
                  setUserLocation(updated);
                  setEditCity(updated.city);
                  setEditState(updated.state);
                  setEditCountry(updated.country);
                }
              }
            } catch (err) {
              console.warn(err);
            } finally {
              setIsDetecting(false);
            }
          },
          { timeout: 5000 }
        );
      } else {
        const res = await fetch('https://ipapi.co/json/');
        if (res.ok) {
          const data = await res.json();
          if (data.city) {
            const updated = {
              city: data.city,
              state: data.region,
              country: data.country_name
            };
            setUserLocation(updated);
            setEditCity(updated.city);
            setEditState(updated.state);
            setEditCountry(updated.country);
          }
        }
        setIsDetecting(false);
      }
    } catch (e) {
      console.warn("Location error:", e);
      setIsDetecting(false);
    }
  };

  // Passive detection on initial mount
  useEffect(() => {
    const passiveLoading = async () => {
      try {
        const res = await fetch('https://ipapi.co/json/');
        if (res.ok) {
          const data = await res.json();
          if (data.city && data.region && data.country_name) {
            const updated = {
              city: data.city,
              state: data.region,
              country: data.country_name
            };
            setUserLocation(updated);
            setEditCity(updated.city);
            setEditState(updated.state);
            setEditCountry(updated.country);
          }
        }
      } catch {
        // Keep initial defaults safely
      }
    };
    passiveLoading();
  }, []);

  const handleApplyManualLocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (editCity.trim() && editCountry.trim()) {
      setUserLocation({
        city: editCity.trim(),
        state: editState.trim(),
        country: editCountry.trim()
      });
      setShowLocationPopover(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCategoryFilter && selectedCategoryFilter !== 'All') {
      onNavigate(`category/${selectedCategoryFilter}`, { q: searchQuery });
    } else {
      onNavigate('', { q: searchQuery });
    }
  };

  const handleLogoClick = () => {
    setSearchQuery('');
    setSelectedCategoryFilter('All');
    onNavigate('');
  };

  const selectPresetCity = (city: string, state: string, country: string) => {
    setUserLocation({ city, state, country });
    setEditCity(city);
    setEditState(state);
    setEditCountry(country);
  };

  const notifyUser = (message: string) => {
    alert(message);
  };

  return (
    <header className="w-full bg-[#0F1111] text-white font-sans sticky top-0 z-50 shadow-md" id="sh_app_header">
      
      {/* ==========================================
          A. DESKTOP HEADER (1024px and up)
          - Paddings: px-8 (32px left/right) as requested
          - Row 1 Layout: [ LARGE LOGO ] [ LOCATION ] [ CENTRED SEARCH ] [ ACCOUNT ] [ WISHLIST ] [ CART ]
          ==========================================
      */}
      <div className="hidden lg:block w-full px-8 py-3 border-b border-slate-800 bg-[#0F1111]" id="sh_desktop_main_header">
        <div className="max-w-[1440px] mx-auto flex items-center justify-between gap-6">
          
          {/* 1. LARGE LOGO AREA - Own dedicated branding section, 2-3x larger, highly visible */}
          <div className="flex items-center shrink-0 pr-2" id="sh_desktop_logo_block">
            <button 
              onClick={handleLogoClick}
              className="flex items-center gap-3 group transition-transform active:scale-95 cursor-pointer text-left"
              id="sh_logo_btn_desktop"
              title="Return to Shop Valley Home"
            >
              <img
                src="/logo.png"
                alt="Shop Valley"
                className="h-12 w-12 rounded-2xl border border-[#1b5e20] bg-white object-cover shadow-lg"
              />

            </button>
          </div>

          {/* 2. LOCATION SELECTOR - OUTSIDE search bar, immediately after the logo */}
          <div className="relative shrink-0 flex items-center" id="sh_desktop_location_block">
            <button 
              onClick={() => setShowLocationPopover(!showLocationPopover)}
              className="group flex flex-row items-center gap-3 px-3 py-1 hover:ring-1 hover:ring-[#4CAF50]/65 hover:bg-white/[0.03] rounded-lg transition-all cursor-pointer text-left active:scale-98 max-w-[220px] h-12 select-none"
              id="sh_location_btn_desktop"
            >
              <MapPin className="w-5 h-5 text-amber-500 shrink-0" />
              <div className="flex flex-col min-w-0 flex-1 leading-none justify-center">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Current Location</span>
                <span className="text-[12px] font-black text-white flex items-center gap-1 min-w-0">
                  <span className="truncate">{userLocation.city}, {userLocation.state}, {userLocation.country}</span>
                  <ChevronDown className="w-3 h-3 text-slate-400 shrink-0 group-hover:text-amber-500 transition-colors" />
                </span>
              </div>
            </button>

            {/* LOCATION POPOVER DIALOG */}
            {showLocationPopover && (
              <div className="absolute left-0 mt-2.5 w-80 bg-white border border-slate-200 rounded-xl p-5 shadow-2xl z-50 text-slate-800 animate-in fade-in slide-in-from-top-3" id="sh_desktop_location_popover">
                <div className="flex justify-between items-center mb-2.5 pb-2 border-b border-slate-100">
                  <h3 className="font-extrabold text-xs text-slate-900 uppercase tracking-wide">Shipment Location Setting</h3>
                  <button 
                    onClick={() => setShowLocationPopover(false)} 
                    className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-700"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <p className="text-[11px] text-slate-500 mb-4">
                  Define your shipping location to accurately filter independent workshops and estimated deliveries coordinates.
                </p>

                {/* Auto detection state trigger */}
                <button 
                  onClick={handleAutoDetectLocation}
                  disabled={isDetecting}
                  className="w-full mb-4 inline-flex items-center justify-center gap-2 bg-[#2E7D32]/10 hover:bg-[#2E7D32]/20 text-[#2E7D32] font-extrabold text-xs py-2 px-3 rounded-lg transition-colors cursor-pointer border border-[#2E7D32]/10"
                >
                  {isDetecting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Detecting current location...</span>
                    </>
                  ) : (
                    <>
                      <MapPin className="w-3.5 h-3.5" />
                      <span>Auto-Detect My Location</span>
                    </>
                  )}
                </button>

                {/* Quick preset city selector */}
                <div className="mb-4">
                  <span className="text-[9px] uppercase font-mono text-slate-400 block mb-1.5 font-bold">Quick Presets</span>
                  <div className="grid grid-cols-2 gap-1.5 text-left text-[10px]">
                    <button 
                      onClick={() => selectPresetCity('Bangalore', 'Karnataka', 'India')}
                      className="p-1.5 border border-slate-100 hover:border-[#2E7D32]/30 rounded-md hover:bg-[#2E7D32]/5 truncate font-semibold"
                    >
                      Bangalore, India
                    </button>
                    <button 
                      type="button"
                      onClick={() => selectPresetCity('Delhi', 'Delhi NCR', 'India')}
                      className="p-1.5 border border-slate-100 hover:border-[#2E7D32]/30 rounded-md hover:bg-[#2E7D32]/5 truncate font-semibold"
                    >
                      Delhi, India
                    </button>
                    <button 
                      type="button"
                      onClick={() => selectPresetCity('Denver', 'Colorado', 'United States')}
                      className="p-1.5 border border-slate-100 hover:border-[#2E7D32]/30 rounded-md hover:bg-[#2E7D32]/5 truncate font-semibold"
                    >
                      Denver, USA
                    </button>
                    <button 
                      type="button"
                      onClick={() => selectPresetCity('San Francisco', 'California', 'United States')}
                      className="p-1.5 border border-slate-100 hover:border-[#2E7D32]/30 rounded-md hover:bg-[#2E7D32]/5 truncate font-semibold"
                    >
                      San Francisco, USA
                    </button>
                  </div>
                </div>

                {/* Manual Address Input fields */}
                <form onSubmit={handleApplyManualLocation} className="space-y-3.5">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="block text-[9px] uppercase font-mono text-slate-400 font-bold mb-0.5">City</span>
                      <input 
                        type="text" 
                        value={editCity} 
                        onChange={(e) => setEditCity(e.target.value)}
                        className="w-full border border-slate-200 rounded-md p-1.5 text-xs focus:ring-1 focus:ring-[#2E7D32] focus:outline-none bg-slate-50/50"
                        placeholder="e.g. Bangalore"
                      />
                    </div>
                    <div>
                      <span className="block text-[9px] uppercase font-mono text-slate-400 font-bold mb-0.5">State</span>
                      <input 
                        type="text" 
                        value={editState} 
                        onChange={(e) => setEditState(e.target.value)}
                        className="w-full border border-slate-200 rounded-md p-1.5 text-xs focus:ring-1 focus:ring-[#2E7D32] focus:outline-none bg-slate-50/50"
                        placeholder="e.g. Karnataka"
                      />
                    </div>
                  </div>
                  <div>
                    <span className="block text-[9px] uppercase font-mono text-slate-400 font-bold mb-0.5">Country</span>
                    <input 
                      type="text" 
                      value={editCountry} 
                      onChange={(e) => setEditCountry(e.target.value)}
                      className="w-full border border-slate-200 rounded-md p-1.5 text-xs focus:ring-1 focus:ring-[#2E7D32] focus:outline-none bg-slate-50/50"
                      placeholder="e.g. India"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                    <button 
                      type="button" 
                      onClick={() => setShowLocationPopover(false)}
                      className="text-[10px] bg-slate-105 hover:bg-slate-201 font-bold px-3 py-1.5 rounded-lg text-slate-700 bg-slate-100"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      className="text-[10px] bg-[#2E7D32] hover:bg-[#1b5e20] text-white font-extrabold px-3.5 py-1.5 rounded-lg"
                    >
                      Apply Location
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* 3. SEARCH BAR - Centered, Large responsive width, modern marketplace design */}
          <div className="flex-grow max-w-2xl mx-auto" id="sh_desktop_search_container">
            <form 
              onSubmit={handleSearchSubmit} 
              className="w-full flex items-center h-12 bg-white rounded-lg overflow-hidden border-2 border-transparent focus-within:border-amber-500 shadow-sm relative transition-all"
              id="sh_search_form_desktop"
            >
              <input 
                type="text"
                placeholder="Search products, brands and categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-grow px-4 text-sm text-[#0F1111] placeholder-slate-550 focus:outline-none bg-transparent h-full font-medium"
              />
              <button 
                type="submit" 
                className="px-6 h-full bg-[#FEB103] hover:bg-[#F3A801] transition-colors flex items-center justify-center cursor-pointer text-[#0F1111]"
              >
                <Search className="w-5 h-5 text-[#0F1111] stroke-[2.5]" />
              </button>
            </form>
          </div>

          {/* 4. RIGHT ACTIONS SECTION - Ordered preciesly left-to-right: [ WISHLIST ] [ CART ] [ ACCOUNT MENU ] */}
          <div className="flex items-center gap-6 shrink-0 justify-end" id="sh_desktop_actions_block">
            
            {/* Admin console removed from public header to prevent exposure of admin access */}

            {/* 1. WISHLIST */}
            <button 
              onClick={() => onNavigate('wishlist')}
              className="group flex items-center gap-2 px-3 py-1.5 hover:ring-1 hover:ring-amber-500/50 hover:bg-slate-100 rounded-lg relative cursor-pointer active:scale-95 h-11 select-none text-left"
              id="sh_wishlist_btn_desktop"
            >
              <Heart className="w-5 h-5 text-white group-hover:text-amber-500 transition-colors" />
              <div className="flex flex-col leading-none justify-center">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Favorites</span>
                <span className="text-xs font-black text-white">Wishlist ({wishlistCount})</span>
              </div>
            </button>

            {/* 2. CART */}
            <button 
              onClick={() => onNavigate('cart')}
              className="group flex items-center gap-2.5 px-3 py-1.5 hover:ring-1 hover:ring-amber-500/50 hover:bg-slate-100 rounded-lg relative cursor-pointer active:scale-95 h-11 select-none text-left"
              id="sh_cart_btn_desktop"
            >
              <div className="relative shrink-0">
                <ShoppingCart className="w-5.5 h-5.5 text-white group-hover:text-amber-500 transition-colors" />
                <span className="absolute -top-1.5 -right-2 bg-amber-500 text-slate-950 font-sans font-black text-[10px] rounded-full min-w-[18px] h-[18px] px-1 flex items-center justify-center border border-slate-900 shadow-md">
                  {cartCount}
                </span>
              </div>
              <div className="flex flex-col leading-none justify-center">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Checkout</span>
                <span className="text-xs font-black text-white group-hover:text-amber-400">Cart</span>
              </div>
            </button>

            {/* 3. ACCOUNT MENU DROPDOWN (Amazon Style) */}
            <div className="relative">
              <button 
                onClick={() => setShowAccountPopover(!showAccountPopover)}
                className="group flex flex-col justify-center items-start text-left px-3 py-1.5 hover:ring-1 hover:ring-amber-500/50 hover:bg-slate-100 rounded-lg transition-all cursor-pointer active:scale-95 h-11 min-w-[130px] select-none"
                id="sh_accounts_btn_desktop"
              >
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">
                  Hello, {currentUser ? currentUser.name : 'Sign In'}
                </span>
                <span className="text-xs font-black text-white flex items-center gap-1">
                  Account Menu
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-500 transition-transform" />
                </span>
              </button>

              {showAccountPopover && (
                <div 
                  className="absolute right-0 mt-2.5 w-60 bg-white border border-slate-200 rounded-xl p-1 shadow-2xl z-50 text-slate-800 animate-in fade-in slide-in-from-top-1 text-left"
                  onMouseLeave={() => setShowAccountPopover(false)}
                >
                  <div className="flex flex-col">
                    
                    {/* Profile */}
                    <button 
                      onClick={() => {
                        setShowAccountPopover(false);
                        onNavigate('profile');
                      }}
                      className="w-full h-12 px-4 hover:bg-slate-50 text-slate-705 text-slate-700 font-extrabold text-xs flex items-center gap-3.5 transition-colors border-b border-slate-100 last:border-0 rounded-lg cursor-pointer"
                    >
                      <User className="w-5 h-5 text-amber-500 shrink-0" />
                      <span>Profile</span>
                    </button>

                    {/* My Orders */}
                    <button 
                      onClick={() => {
                        setShowAccountPopover(false);
                        onNavigate('my-orders');
                      }}
                      className="w-full h-12 px-4 hover:bg-slate-50 text-slate-700 font-extrabold text-xs flex items-center gap-3.5 transition-colors border-b border-slate-100 last:border-0 rounded-lg cursor-pointer"
                    >
                      <ClipboardList className="w-5 h-5 text-amber-500 shrink-0" />
                      <span>My Orders</span>
                    </button>

                    {/* Wishlist */}
                    <button 
                      onClick={() => {
                        setShowAccountPopover(false);
                        onNavigate('wishlist');
                      }}
                      className="w-full h-12 px-4 hover:bg-slate-50 text-slate-700 font-extrabold text-xs flex items-center gap-3.5 transition-colors border-b border-slate-100 last:border-0 rounded-lg cursor-pointer"
                    >
                      <Heart className="w-5 h-5 text-amber-500 shrink-0" />
                      <span>Wishlist</span>
                    </button>

                    {/* Notifications */}
                    <button 
                      onClick={() => {
                        setShowAccountPopover(false);
                        onNavigate('notifications');
                      }}
                      className="w-full h-12 px-4 hover:bg-slate-50 text-slate-700 font-extrabold text-xs flex items-center gap-3.5 transition-colors border-b border-slate-100 last:border-0 rounded-lg cursor-pointer"
                    >
                      <Bell className="w-5 h-5 text-amber-500 shrink-0" />
                      <span>Notifications</span>
                    </button>

                    {/* Addresses */}
                    <button 
                      onClick={() => {
                        setShowAccountPopover(false);
                        onNavigate('addresses');
                      }}
                      className="w-full h-12 px-4 hover:bg-slate-50 text-slate-700 font-extrabold text-xs flex items-center gap-3.5 transition-colors border-b border-slate-100 last:border-0 rounded-lg cursor-pointer"
                    >
                      <MapPin className="w-5 h-5 text-amber-500 shrink-0" />
                      <span>Addresses</span>
                    </button>

                    {/* Logout */}
                    {currentUser ? (
                      <button 
                        onClick={() => {
                          setShowAccountPopover(false);
                          if (window.confirm('Are you sure you want to logout?')) {
                            onLogout();
                          }
                        }}
                        className="w-full h-12 px-4 hover:bg-rose-50 hover:text-rose-600 text-slate-700 font-extrabold text-xs flex items-center gap-3.5 transition-colors rounded-lg cursor-pointer"
                      >
                        <LogOut className="w-5 h-5 text-rose-500 shrink-0" />
                        <span>Logout</span>
                      </button>
                    ) : (
                      <button 
                        onClick={() => {
                          setShowAccountPopover(false);
                          onNavigate('login');
                        }}
                        className="w-full h-12 px-4 hover:bg-amber-50 text-amber-600 font-extrabold text-xs flex items-center gap-3.5 transition-colors rounded-lg cursor-pointer"
                      >
                        <UserCheck className="w-5 h-5 text-amber-500 shrink-0" />
                        <span>Sign In / Register</span>
                      </button>
                    )}

                  </div>
                </div>
              )}
            </div>

          </div>

        </div>
      </div>

      {/* ==========================================
          B. TABLET HEADER (768px to 1023px)
          - Paddings: px-6 (24px left/right) as requested
          - Layout: Logo | Search | Cart | Menu
          ==========================================
      */}
      <div className="hidden md:max-lg:block w-full px-6 py-3.5 bg-[#131921] border-b border-slate-900" id="sh_tablet_main_header">
        <div className="max-w-[1440px] mx-auto flex items-center justify-between gap-5 animate-in fade-in">
          
          {/* Logo - Large space branding */}
          <button 
            onClick={handleLogoClick} 
            className="flex items-center gap-2 cursor-pointer text-left"
            id="sh_tablet_logo"
          >
            <img src="/logo.png" alt="ShopeValley" className="h-10 w-10 rounded-xl object-contain" />

          </button>

          {/* Search bar centered */}
          <div className="flex-grow max-w-md mx-auto">
            <form 
              onSubmit={handleSearchSubmit} 
              className="w-full flex items-center h-10 bg-white rounded-lg overflow-hidden border-2 border-transparent focus-within:border-amber-500 shadow-xs"
            >
              <input 
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-grow px-3 text-xs text-[#0F1111] placeholder-slate-400 focus:outline-none bg-transparent h-full"
              />
              <button type="submit" className="px-4 h-full bg-[#FEB103] hover:bg-[#F3A801] text-slate-950 flex items-center justify-center">
                <Search className="w-4 h-4 text-[#0F1111]" />
              </button>
            </form>
          </div>

          {/* Controls: Cart and Menu */}
          <div className="flex items-center gap-4 shrink-0 justify-end">
            <button 
              onClick={() => onNavigate('cart')}
              className="p-1 px-2 text-white relative hover:ring-1 hover:ring-slate-500 rounded-lg flex items-center justify-center"
              title="Cart items"
            >
              <div className="relative">
                <ShoppingCart className="w-5.5 h-5.5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1.5 bg-amber-500 text-[#0F1111] font-sans font-bold text-[9px] rounded-full w-4.5 h-4.5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </div>
            </button>

            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="p-1 px-2 hover:ring-1 hover:ring-slate-500 rounded-lg text-white"
              aria-label="Tablet Catalog Drawer Toggle"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>

        </div>
      </div>

      {/* ==========================================
          C. MOBILE HEADER (Below 768px format)
          - Paddings: px-4 (16px left/right as explicitly requested)
          - Row 1: [ LOGO ]      [ ACCOUNT ] [ CART ] [ MENU ]
          - Row 2: [ LOCATION ]
          - Row 3: [ FULL WIDTH SEARCH BAR ]
          ==========================================
      */}
      <div className="block md:hidden w-full px-4 py-2 bg-[#131921] space-y-2.5 border-b border-slate-900" id="sh_mobile_main_header">
        
        {/* Row 1: LOGO and actions [ ACCOUNT ] [ CART ] [ MENU ] */}
        <div className="flex items-center justify-between">
          
          {/* Logo brand area, bold and highly readable */}
          <button 
            onClick={handleLogoClick} 
            className="flex items-center gap-1.5 cursor-pointer text-left h-9"
          >
              <img
              src="/logo.png"
              alt="Shop Valley"
              className="h-8 w-8 rounded-xl border border-[#1b5e20] bg-white object-cover"
            />

          </button>

          {/* Stacked Row Icons */}
          <div className="flex items-center gap-3">
            
            {/* ACCOUNT Trigger on Row 1 */}
            <button 
              onClick={() => {
                setShowAccountPopover(true);
                setShowLocationPopover(false);
                // Trigger popover directly or push to custom router page
                onNavigate('login');
              }}
              className="p-1.5 text-white hover:bg-slate-800 rounded-lg flex items-center justify-center"
              aria-label="Sign In"
            >
              <User className="w-5 h-5 text-amber-400" />
            </button>

            {/* CART Trigger on Row 1 */}
            <button 
              onClick={() => onNavigate('cart')}
              className="p-1.5 text-white hover:bg-slate-800 rounded-lg relative flex items-center justify-center"
              aria-label="View Cart"
            >
              <ShoppingCart className="w-5.5 h-5.5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-500 text-slate-950 font-sans font-black text-[9px] rounded-full w-4 h-4 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            {/* MENU CATALOG Trigger on Row 1 - Opens sliding side drawer */}
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="p-1.5 text-white hover:bg-slate-800 rounded-lg flex items-center justify-center"
              aria-label="Catalog Drawer"
            >
              <Menu className="w-5.5 h-5.5" />
            </button>

          </div>
        </div>

        {/* Row 3: Full Width Search Bar */}
        <div className="w-full">
          <form 
            onSubmit={handleSearchSubmit} 
            className="w-full flex items-center h-10 bg-white rounded-lg overflow-hidden shadow-xs border-2 border-transparent focus-within:border-amber-500"
            id="sh_search_form_mobile"
          >
            <input 
              type="text"
              placeholder="Search products, brands and categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-grow px-3.5 text-slate-900 text-xs placeholder-slate-400 focus:outline-none bg-transparent h-full font-medium"
            />
            <button 
              type="submit" 
              className="px-4.5 h-full bg-[#FEB103] hover:bg-[#F3A801] text-slate-900 flex items-center justify-center cursor-pointer"
            >
              <Search className="w-4.5 h-4.5 text-[#0F1111]" />
            </button>
          </form>
        </div>

      </div>

      {/* ==========================================
          D. AMAZON-STYLE CUSTOM CATEGORY BAR (ROW 2)
          - Compact horizontal layout
          - Spacing reduced significantly to save vertical space
          - Cleaner typography and robust hover states
          ==========================================
      */}
      <div className="bg-[#232F3E] py-1 relative z-40 select-none border-t border-slate-900 overflow-x-auto whitespace-nowrap scrollbar-none" id="sh_category_bar">
        <div className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8 flex items-center justify-between text-[11px]">
          
          {/* Scrollable list with compact spacing */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none scroll-smooth py-0.5 w-full">
            
            {/* Primary Command Item: ☰ ALL */}
            <button 
              onClick={() => setIsCategoryDrawerOpen(true)}
              className="hover:ring-1 hover:ring-white px-2.5 py-1 rounded text-white font-extrabold text-[11px] inline-flex items-center gap-1 cursor-pointer shrink-0 transition-all active:scale-95 text-amber-400 bg-slate-850/60"
              id="sh_all_categories_btn"
            >
              <Menu className="w-3.5 h-3.5 text-amber-400 stroke-[2.5]" />
              <span>☰ ALL</span>
            </button>
  
            {/* Mapped clean items block */}
            {[
              { label: 'Electronics', path: 'category/Electronics' },
              { label: 'Fashion', path: 'category/Fashion' },
              { label: 'Beauty', path: 'category/Beauty & Personal Care' },
              { label: 'Home Appliances', path: 'category/Home Appliances' },
              { label: 'Mobile', path: 'category/Mobile & Accessories' },
              { label: 'Sports', path: 'category/Sports & Fitness' }
            ].map((navInfo, index) => {
              const isSelected = selectedCategoryFilter && navInfo.path && navInfo.path.includes(selectedCategoryFilter);
              return (
                <button
                  key={index}
                  onClick={() => {
                    if (navInfo.path) {
                      const cleanCategory = navInfo.path.replace('category/', '');
                      setSelectedCategoryFilter(cleanCategory);
                      onNavigate(navInfo.path);
                    }
                  }}
                  className={`hover:ring-1 hover:ring-white px-2.5 py-1 rounded text-[11px] transition-all cursor-pointer inline-flex items-center gap-1 shrink-0 whitespace-nowrap truncate max-w-[140px] ${
                    isSelected 
                      ? 'ring-1 ring-amber-400 text-amber-300 font-extrabold' 
                      : 'text-slate-100 font-bold'
                  }`}
                >
                  <span className="truncate">{navInfo.label}</span>
                </button>
              );
            })}
  
            {/* Replace static currency code with More Categories click drawer trigger */}
            <button 
              onClick={() => setIsCategoryDrawerOpen(true)}
              className="hover:ring-1 hover:ring-white px-2.5 py-1 rounded text-amber-400 font-extrabold text-[11px] inline-flex items-center gap-1 cursor-pointer shrink-0 transition-all active:scale-95 bg-slate-800/40 ml-auto"
              id="sh_more_categories_trigger"
            >
              <span>More Categories</span>
              <ChevronRight className="w-3.5 h-3.5 text-amber-400" />
            </button>

          </div>

        </div>
      </div>

      {/* ==========================================
          E. AMAZON-STYLE FULL-HEIGHT LEFT CATEGORY DRAWER
          - Smooth slide animation, overlay background, scrollable categories with chevron icons
          ==========================================
      */}
      {isCategoryDrawerOpen && (
        <div className="fixed inset-0 z-[100] flex" id="sh_amazon_category_drawer_system">
          
          {/* Overlay background */}
          <div 
            className="fixed inset-0 bg-slate-900/65 backdrop-blur-xs transition-opacity animate-in fade-in duration-300" 
            onClick={() => setIsCategoryDrawerOpen(false)}
          />

          {/* Slide out side panel */}
          <div className="relative flex flex-col w-[310px] sm:w-[365px] bg-white h-full shadow-2xl z-50 text-[#0F1111] animate-in slide-in-from-left duration-300 border-r border-slate-205">
            
            {/* Header: Dark banner with All Departments */}
            <div className="bg-[#232F3E] text-white p-5 pr-12 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <Menu className="w-5.5 h-5.5 text-amber-400 stroke-[2.5]" />
                <h3 className="font-extrabold text-md tracking-tight">
                  Shop Departments
                </h3>
              </div>
              <button 
                onClick={() => setIsCategoryDrawerOpen(false)}
                className="absolute top-4 right-4 p-1.5 hover:bg-slate-700 rounded-full text-white transition-colors cursor-pointer"
                aria-label="Close Category Drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Categories of full-height panel */}
            <div className="flex-1 overflow-y-auto px-1.5 py-4 divide-y divide-slate-100 bg-white">
              
              {/* Category Section: Shop By Department */}
              <div className="pt-2 pb-12">
                <span className="block text-[11px] font-mono tracking-wider font-extrabold text-slate-400 pl-4 py-2 uppercase">
                  Shop By Department
                </span>
                
                {[
                  { name: 'Combo Offers', path: 'category/Combo Offers' },
                  { name: 'Fashion', path: 'category/Fashion' },
                  { name: 'Electronics', path: 'category/Electronics' },
                  { name: 'Mobile & Accessories', path: 'category/Mobile & Accessories' },
                  { name: 'Beauty & Personal Care', path: 'category/Beauty & Personal Care' },
                  { name: 'Home Appliances', path: 'category/Home Appliances' },
                  { name: 'PC & Laptops', path: 'category/PC & Laptops' },
                  { name: 'Sports & Fitness', path: 'category/Sports & Fitness' },
                  { name: 'Furniture', path: 'category/Furniture' },
                  { name: 'Toys', path: 'category/Toys' },
                  { name: 'Baby Care', path: 'category/Baby Care' },
                  { name: 'Books', path: 'category/Books' },
                  { name: 'eBooks', path: 'category/eBooks' }
                ].map((dept, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setSelectedCategoryFilter(dept.name);
                      onNavigate(dept.path);
                      setIsCategoryDrawerOpen(false);
                    }}
                    className="w-full h-12 px-4 hover:bg-slate-100 font-extrabold text-[#0F1111] text-xs flex items-center justify-between transition-colors cursor-pointer rounded-lg text-left"
                  >
                    <span>{dept.name}</span>
                    <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                  </button>
                ))}
              </div>

            </div>

          </div>

        </div>
      )}

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end" id="sh_amazon_mobile_menu_system">
          
          {/* Overlay background */}
          <div 
            className="fixed inset-0 bg-slate-900/65 backdrop-blur-xs transition-opacity animate-in fade-in duration-300" 
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Slide out side panel */}
          <div className="relative flex flex-col w-[310px] sm:w-[365px] bg-white h-full shadow-2xl z-50 text-[#0F1111] animate-in slide-in-from-right duration-300 border-l border-slate-200">
            
            {/* Header: Dark banner with Hello, Guest */}
            <div className="bg-[#232F3E] text-white p-5 pr-12 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <User className="w-7 h-7 text-white bg-slate-650 p-1 bg-slate-700 rounded-full shrink-0 border border-white" />
                <h3 className="font-extrabold text-md tracking-tight">
                  {currentUser ? `Hello, ${currentUser.name}` : 'Hello, Sign In'}
                </h3>
              </div>
              <button 
                onClick={() => setMobileMenuOpen(false)}
                className="absolute top-4 right-4 p-1.5 hover:bg-slate-700 rounded-full text-white transition-colors cursor-pointer"
                aria-label="Close Hamburger Menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Categories of full-height panel */}
            <div className="flex-1 overflow-y-auto px-1.5 py-4 divide-y divide-slate-100 bg-white">
              
              {/* 1. LOCATION SETTINGS SECTION (Mobile Drawer Only) */}
              <div className="pb-4 px-1.5 pt-2">
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono tracking-wider font-extrabold text-slate-400 uppercase">
                      Current Location
                    </span>
                    <MapPin className="w-4 h-4 text-amber-500" />
                  </div>

                  {!showInlineLocationEdit ? (
                    <div className="space-y-2">
                      <div className="flex flex-col leading-snug">
                        <span className="text-sm font-black text-slate-900 truncate">
                          {userLocation.city}, {userLocation.state}
                        </span>
                        <span className="text-xs text-slate-500 font-bold mt-0.5">
                          {userLocation.country}
                        </span>
                      </div>
                      <button
                        onClick={() => setShowInlineLocationEdit(true)}
                        className="w-full bg-[#2E7D32] hover:bg-[#1b5e20] text-white text-xs font-bold py-2 rounded-lg cursor-pointer transition-all active:scale-95"
                      >
                        Change Location
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2 animate-in fade-in duration-200">
                      <div className="flex items-center justify-between pb-1">
                        <span className="text-[11px] font-bold text-slate-600">Manual Location</span>
                        <button 
                          onClick={() => setShowInlineLocationEdit(false)}
                          className="text-[10px] font-extrabold text-rose-500 hover:underline"
                        >
                          Cancel
                        </button>
                      </div>

                      <button 
                        onClick={() => {
                          handleAutoDetectLocation();
                          setShowInlineLocationEdit(false);
                        }}
                        className="w-full inline-flex items-center justify-center gap-1.5 bg-[#2E7D32]/10 text-[#2E7D32] text-xs font-extrabold py-2 rounded-lg"
                      >
                        {isDetecting ? (
                          <>
                            <Loader2 className="w-3 h-3 animate-spin" />
                            <span>Locating...</span>
                          </>
                        ) : (
                          <>
                            <MapPin className="w-3 h-3" />
                            <span>Auto-Detect Location</span>
                          </>
                        )}
                      </button>

                      <div className="space-y-1.5">
                        <input 
                          type="text" 
                          value={editCity}
                          onChange={(e) => setEditCity(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-850 outline-none"
                          placeholder="City Name"
                        />
                        <input 
                          type="text" 
                          value={editState}
                          onChange={(e) => setEditState(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-850 outline-none"
                          placeholder="State Name"
                        />
                        <input 
                          type="text" 
                          value={editCountry}
                          onChange={(e) => setEditCountry(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-850 outline-none"
                          placeholder="Country Name"
                        />
                      </div>

                      <button
                        onClick={(e) => {
                          handleApplyManualLocation(e);
                          setShowInlineLocationEdit(false);
                        }}
                        className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black py-2 rounded-lg transition-transform active:scale-98"
                      >
                        Apply Shipping Address
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* 2. ACCOUNT & UTILITY MENU */}
              <div className="py-4 px-1">
                <span className="block text-[11px] font-mono tracking-wider font-extrabold text-slate-400 pl-3 py-1 uppercase">
                  Account & Settings
                </span>

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    notifyUser("Profile setting edit panel.");
                  }}
                  className="w-full h-11 px-3.5 hover:bg-slate-100 font-extrabold text-[#0F1111] text-xs flex items-center gap-3 transition-colors cursor-pointer rounded-lg text-left"
                >
                  <User className="w-4.5 h-4.5 text-amber-500 shrink-0" />
                  <span>Profile</span>
                </button>

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onNavigate('track-order');
                  }}
                  className="w-full h-11 px-3.5 hover:bg-slate-100 font-extrabold text-[#0F1111] text-xs flex items-center gap-3 transition-colors cursor-pointer rounded-lg text-left"
                >
                  <ClipboardList className="w-4.5 h-4.5 text-amber-500 shrink-0" />
                  <span>My Orders</span>
                </button>

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onNavigate('wishlist');
                  }}
                  className="w-full h-11 px-3.5 hover:bg-slate-100 font-extrabold text-[#0F1111] text-xs flex items-center gap-3 transition-colors cursor-pointer rounded-lg text-left"
                >
                  <Heart className="w-4.5 h-4.5 text-amber-500 shrink-0" />
                  <span>Wishlist</span>
                </button>

                <button
                  onClick={() => {
                    notifyUser("Alert notifications up-to-date.");
                  }}
                  className="w-full h-11 px-3.5 hover:bg-slate-100 font-extrabold text-[#0F1111] text-xs flex items-center gap-3 transition-colors cursor-pointer rounded-lg text-left"
                >
                  <Bell className="w-4.5 h-4.5 text-amber-500 shrink-0" />
                  <span>Notifications</span>
                </button>

                <button
                  onClick={() => {
                    setShowInlineLocationEdit(true);
                  }}
                  className="w-full h-11 px-3.5 hover:bg-slate-100 font-extrabold text-[#0F1111] text-xs flex items-center gap-3 transition-colors cursor-pointer rounded-lg text-left"
                >
                  <MapPin className="w-4.5 h-4.5 text-amber-500 shrink-0" />
                  <span>Addresses</span>
                </button>

                <button
                  onClick={() => {
                    notifyUser("Payments module configuration.");
                  }}
                  className="w-full h-11 px-3.5 hover:bg-slate-100 font-extrabold text-[#0F1111] text-xs flex items-center gap-3 transition-colors cursor-pointer rounded-lg text-left"
                >
                  <CreditCard className="w-4.5 h-4.5 text-amber-500 shrink-0" />
                  <span>Saved Cards</span>
                </button>

                <button
                  onClick={() => {
                    notifyUser("Opening Location Settings editor panel.");
                    setShowInlineLocationEdit(true);
                  }}
                  className="w-full h-11 px-3.5 hover:bg-slate-100 font-extrabold text-[#0F1111] text-xs flex items-center gap-3 transition-colors cursor-pointer rounded-lg text-left"
                >
                  <Settings className="w-4.5 h-4.5 text-amber-500 shrink-0" />
                  <span>Location Settings</span>
                </button>

                <button
                  onClick={() => {
                    notifyUser("Help FAQs and customer guide.");
                  }}
                  className="w-full h-11 px-3.5 hover:bg-slate-100 font-extrabold text-[#0F1111] text-xs flex items-center gap-3 transition-colors cursor-pointer rounded-lg text-left"
                >
                  <HelpCircle className="w-4.5 h-4.5 text-amber-500 shrink-0" />
                  <span>Help Center</span>
                </button>

                <button
                  onClick={() => {
                    notifyUser("Contact Support trigger. 24/7 client desk.");
                  }}
                  className="w-full h-11 px-3.5 hover:bg-slate-100 font-extrabold text-[#0F1111] text-xs flex items-center gap-3 transition-colors cursor-pointer rounded-lg text-left"
                >
                  <MessageSquare className="w-4.5 h-4.5 text-amber-500 shrink-0" />
                  <span>Contact Us</span>
                </button>

                {currentUser ? (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      if (window.confirm('Are you sure you want to logout?')) {
                        onLogout();
                      }
                    }}
                    className="w-full h-11 px-3.5 hover:bg-rose-50 text-rose-600 font-bold text-xs flex items-center gap-3 transition-colors cursor-pointer mt-2"
                  >
                    <LogOut className="w-4.5 h-4.5 text-rose-500 shrink-0" />
                    <span>Logout</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onNavigate('login');
                    }}
                    className="w-full h-11 px-3.5 hover:bg-[#2E7D32]/5 text-[#2E7D32] font-black text-xs flex items-center gap-3 transition-colors cursor-pointer mt-2"
                  >
                    <UserCheck className="w-4.5 h-4.5 text-[#2E7D32] shrink-0" />
                    <span>Sign In</span>
                  </button>
                )}
              </div>

            </div>

          </div>

        </div>
      )}

    </header>
  );
}
