import React, { useState, useEffect } from 'react';
import { 
  Package, 
  MapPin, 
  Compass, 
  Clock, 
  Map as MapIcon, 
  Search, 
  Truck, 
  Check, 
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { Order } from '../types';

interface OrderTrackerProps {
  orders: Order[];
  initialOrderId?: string;
}

export default function OrderTracker({ orders, initialOrderId = '' }: OrderTrackerProps) {
  const [searchCode, setSearchCode] = useState(initialOrderId);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  
  // Driving carrier animation state coordinates
  const [driverProgress, setDriverProgress] = useState(15); 

  useEffect(() => {
    if (initialOrderId) {
      const match = orders.find(o => o.id.toLowerCase() === initialOrderId.toLowerCase());
      if (match) setSelectedOrder(match);
    } else if (orders.length > 0) {
      setSelectedOrder(orders[orders.length - 1]); // default to latest
      setSearchCode(orders[orders.length - 1].id);
    }
  }, [initialOrderId, orders]);

  // Handle animate driver truck along state
  useEffect(() => {
    const interval = setInterval(() => {
      setDriverProgress((prev) => {
        if (prev >= 85) return 15; // wrap around
        return prev + 1; // slow drift
      });
    }, 250);
    return () => clearInterval(interval);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const match = orders.find(o => o.id.trim().toLowerCase() === searchCode.trim().toLowerCase());
    if (match) {
      setSelectedOrder(match);
    } else {
      alert(`Tracking code "${searchCode}" was not found. Please try "SV-9812A" or create an order via Cart page.`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8" id="sh_order_tracker_portal">
      
      {/* 1. Portal Heading */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <div className="flex items-center gap-1.5 text-slate-800 text-xs font-mono uppercase bg-slate-100 border border-slate-200 w-fit px-2.5 py-0.5 rounded">
            <Compass className="w-3.5 h-3.5 text-slate-950 animate-spin" />
            <span>Denver Artisan Couriers</span>
          </div>
          <h1 className="font-extrabold text-2xl sm:text-3xl mt-1 tracking-tight text-slate-950 uppercase font-sans">
            Realtime Delivery Tracking
          </h1>
        </div>

        {/* Search input to look up other order codes */}
        <form onSubmit={handleSearch} className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-grow">
            <input 
              type="text"
              placeholder="Search Code e.g. SV-3814"
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value)}
              className="px-4.5 py-2 pl-9 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-950 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-950 block w-full sm:w-60"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
          <button 
            type="submit" 
            className="bg-slate-950 text-white font-bold text-xs px-4.5 py-2 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
          >
            Track Code
          </button>
        </form>
      </div>

      {!selectedOrder ? (
        <div className="text-center py-20 border border-slate-200 rounded-2xl bg-white p-6">
          <div className="p-4 bg-slate-100 border border-slate-200 text-slate-400 rounded-full inline-flex items-center justify-center mb-4 animate-pulse">
            <Package className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-slate-800 text-lg">No Active Courier Route</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            You don't have any placed purchase orders in this session. Go to Cart, complete checkout with testing card, and follow your order here!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Timeline and products lists (Left, 5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Step status list block */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="flex justify-between items-center mb-5 border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">Order Status Steps</h3>
                <span className="text-[11px] font-mono bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded font-bold uppercase animate-pulse">
                  ACTIVE PREP
                </span>
              </div>

              {/* Progress timeline */}
              <div className="relative border-l-2 border-slate-100 pl-6 ml-3 space-y-7 py-2.5">
                
                {/* Step 1: Placed */}
                <div className="relative">
                  <span className="absolute -left-9 top-0.5 w-6 h-6 rounded-full bg-slate-950 text-white border border-slate-950 flex items-center justify-center text-[10px] font-sans">
                    <Check className="w-3.5 h-3.5 text-amber-400" />
                  </span>
                  <div className="text-xs">
                    <h4 className="font-bold text-slate-950">Order Placed & Verified</h4>
                    <p className="text-slate-500 mt-0.5">Secure payment validated; holding funds in Escrow.</p>
                    <span className="text-[10px] font-mono text-slate-400 mt-1 block">Date/Time: {new Date(selectedOrder.createdAt).toLocaleTimeString()}</span>
                  </div>
                </div>

                {/* Step 2: preparation */}
                <div className="relative">
                  <span className="absolute -left-9 top-0.5 w-6 h-6 rounded-full bg-amber-400 text-slate-950 border border-amber-300 flex items-center justify-center text-[10px] ring-4 ring-amber-100">
                    <RefreshCw className="w-3 h-3 animate-spin text-slate-950 font-bold" />
                  </span>
                  <div className="text-xs">
                    <h4 className="font-bold text-slate-950">Preparing in Artisan Custom workshop</h4>
                    <p className="text-slate-500 mt-0.5">Each vendor is individually hand-packing and boxing items.</p>
                    <span className="text-[10px] font-mono text-amber-700 font-bold mt-1 block">Current Phase: Active Packaging</span>
                  </div>
                </div>

                {/* Step 3: Dispatch */}
                <div className="relative">
                  <span className="absolute -left-9 top-0.5 w-6 h-6 rounded-full bg-slate-50 text-slate-400 border border-slate-200 flex items-center justify-center text-[10px]">
                    3
                  </span>
                  <div className="text-xs text-slate-400">
                    <h4 className="font-bold text-slate-500">In Transport Grouping</h4>
                    <p className="mt-0.5">Assigned to eco-friendly electric postal routes.</p>
                  </div>
                </div>

                {/* Step 4: Deliver */}
                <div className="relative">
                  <span className="absolute -left-9 top-0.5 w-6 h-6 rounded-full bg-slate-50 text-slate-400 border border-slate-200 flex items-center justify-center text-[10px]">
                    4
                  </span>
                  <div className="text-xs text-slate-400 font-normal">
                    <h4 className="font-bold text-slate-500">Hand-Delivered Signature</h4>
                    <p className="mt-0.5">Expected timeline: {selectedOrder.estimatedDelivery}</p>
                  </div>
                </div>

              </div>
            </div>

            {/* Product items inside order */}
            <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 shadow-sm space-y-3.5">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 font-mono border-b border-slate-800 pb-2.5">
                Items on Transit
              </h4>
              <div className="space-y-3">
                {selectedOrder.items.map((it, i) => (
                  <div key={i} className="flex justify-between items-center text-xs">
                    <div>
                      <p className="font-bold text-white leading-normal">{it.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono">Qty: {it.quantity}x @ ${it.price}</p>
                    </div>
                    <span className="font-extrabold text-amber-400">${it.price * it.quantity}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-slate-800 pt-3 flex justify-between text-xs">
                <span className="text-slate-400">Tax & Delivery group charges:</span>
                <span className="font-bold text-slate-200">${selectedOrder.shipping + selectedOrder.tax}</span>
              </div>
              <div className="border-t border-slate-800 pt-3 flex justify-between text-sm">
                <span className="font-black text-white">Escrow Total:</span>
                <span className="font-black text-md text-amber-400">${selectedOrder.total}</span>
              </div>
            </div>

          </div>

          {/* 2. Interactive Animated SVG Map (Right, 7 cols) */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between" id="ch_tracking_map_panel">
            <div>
              <div className="flex justify-between items-center border-b border-slate-100 pb-3.5 mb-4">
                <div className="flex items-center gap-1.5">
                  <MapIcon className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base">Live Interactive Delivery Grid Map</h3>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                  <Clock className="w-4 h-4 text-emerald-500 animate-pulse" />
                  <span>Updates Live</span>
                </div>
              </div>

              <p className="text-xs text-slate-500 mb-4 font-sans leading-relaxed">
                Track our electric cargo van. This route groups several pickup points around Boulder and Golden mountain forests, dispatching straight to Denver.
              </p>

              {/* Colorado Landscape Vector Map canvas container */}
              <div className="w-full h-80 bg-emerald-50/50 border border-emerald-100 rounded-2xl relative overflow-hidden" id="sh_svg_track_canvas">
                
                {/* SVG vector backdrop */}
                <svg className="absolute inset-0 w-full h-full select-none" viewBox="0 0 500 350">
                  {/* Outer boundaries or background landscape contours */}
                  <g className="text-emerald-100 stroke-current stroke-3 fill-none">
                    <path d="M 20,50 Q 80,20 150,60 T 320,30 T 480,50" />
                    <path d="M 10,140 Q 120,95 240,130 T 490,140" strokeWidth="2" />
                    <path d="M 5,260 Q 140,220 280,270 T 495,250" strokeWidth="1" />
                  </g>

                  {/* Shading mountain peaks to represent Rocky mountain terrain */}
                  <polygon points="50,110 90,40 130,110" className="fill-emerald-100/40 text-emerald-200/40 stroke-current stroke-1" />
                  <polygon points="110,130 160,50 210,130" className="fill-emerald-100/40 text-emerald-200/40 stroke-current stroke-1" />
                  <polygon points="20,150 70,80 120,150" className="fill-emerald-100/40 text-emerald-200/40 stroke-current stroke-1" />

                  {/* Group route vectors from Boulder down to Denver (Animated dashed array route) */}
                  <path 
                    d="M 120,80 Q 150,180 250,180 T 380,240" 
                    fill="none" 
                    stroke="#cbd5e1" 
                    strokeWidth="6" 
                    strokeLinecap="round"
                  />
                  <path 
                    d="M 120,80 Q 150,180 250,180 T 380,240" 
                    fill="none" 
                    stroke="#10b981" 
                    strokeWidth="3.5" 
                    strokeLinecap="round"
                    strokeDasharray="6,4"
                    className="animate-[dash_21s_linear_infinite]"
                  />

                  {/* Boulder Workshop Node */}
                  <circle cx="120" cy="80" r="9" className="fill-white stroke-slate-900 stroke-2" />
                  <circle cx="120" cy="80" r="4.5" className="fill-amber-500" />

                  {/* Golden Workshop Node */}
                  <circle cx="180" cy="210" r="7" className="fill-white stroke-slate-900 stroke-1.5" />
                  <circle cx="180" cy="210" r="3.5" className="fill-amber-500" />

                  {/* Denver Customer Destination Node */}
                  <circle cx="380" cy="240" r="9" className="fill-white stroke-slate-950 stroke-2" />
                  <circle cx="380" cy="240" r="5" className="fill-rose-600 animate-pulse" />

                  {/* Interactive labels */}
                  <text x="135" y="85" className="text-[10px] font-mono font-bold fill-slate-700 select-none uppercase">Boulder Studios</text>
                  <text x="195" y="215" className="text-[9px] font-mono fill-slate-500 select-none uppercase">Golden Workshops</text>
                  <text x="395" y="244" className="text-[10px] font-mono font-black fill-slate-900 select-none uppercase">My Home Address</text>
                </svg>

                {/* HTML Labels overlaid on position */}
                <div className="absolute top-[85px] left-[100px] flex items-center justify-center">
                  <div className="bg-slate-900 text-white font-mono text-[9px] px-1 rounded shadow -mt-6">Sierra Timber</div>
                </div>

                {/* Animated carrier truck overlay floating precisely on state metric coordinates path */}
                {/* Boulder to Denver approx coordinates path formula for driverProgress percentage */}
                {(() => {
                  // Quad bezier formula mapping percentage (driverProgress)
                  const p = driverProgress / 100;
                  // Points: P0=(120,80), P1=(150,180), P2=(250,180), P3=(380,240)
                  // simplified linear interpolation mapping along path segments
                  let x = 120 + (380 - 120) * p;
                  let y = 80 + (240 - 80) * p + Math.sin(p * Math.PI) * 50;

                  return (
                    <div 
                      className="absolute bg-slate-950 text-white p-2.5 rounded-full border border-slate-700 shadow-xl z-20 flex items-center justify-center transition-all duration-300"
                      style={{ 
                        left: `${x - 18}px`, 
                        top: `${y - 18}px`,
                      }}
                    >
                      <Truck className="w-4 h-4 text-amber-400 animate-bounce" />
                    </div>
                  );
                })()}

              </div>
            </div>

            <div className="mt-4 pt-3.5 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div className="text-xs text-slate-500">
                <span className="font-bold text-slate-900">Carrier Dispatch: </span>
                Colorado eco-truck Route #41B (Denver Metro)
              </div>
              <button 
                onClick={() => setDriverProgress(15)}
                className="text-xs bg-slate-100 text-slate-800 px-3 py-1.5 rounded-lg hover:bg-slate-200 font-bold font-sans cursor-pointer flex items-center gap-1 shrink-0"
              >
                <RefreshCw className="w-3 h-3" />
                Reset Route Demo
              </button>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
