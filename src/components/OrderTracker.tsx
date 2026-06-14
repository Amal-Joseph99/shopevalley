import React, { useState } from 'react';
import { Check, Clock, Package, Search, Truck } from 'lucide-react';
import { Order } from '../types';
import { supabase } from '../lib/supabaseClient';
import { normalizeOrderRow } from '../lib/buyerDataService';

interface OrderTrackerProps {
  orders: Order[];
  initialOrderId?: string;
}

export default function OrderTracker({ orders, initialOrderId = '' }: OrderTrackerProps) {
  const [searchCode, setSearchCode] = useState(initialOrderId);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  React.useEffect(() => {
    if (initialOrderId) {
      lookupOrder(initialOrderId);
    }
  }, [initialOrderId]);

  const lookupOrder = async (code: string) => {
    const cleanCode = code.trim();
    if (!cleanCode) return;
    const { data } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .or(`order_number.eq.${cleanCode},id.eq.${cleanCode}`)
      .maybeSingle();
    setSelectedOrder(data ? normalizeOrderRow(data) : null);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    await lookupOrder(searchCode);
  };

  const steps: Array<{ key: Order['status']; label: string }> = [
    { key: 'accepted', label: 'Order Accepted' },
    { key: 'packed', label: 'Order Packed' },
    { key: 'picked_up', label: 'Picked Up' },
    { key: 'in_transit', label: 'In Transit' },
    { key: 'out_for_delivery', label: 'Out for Delivery' },
    { key: 'delivered', label: 'Delivered' }
  ];
  const currentIdx = selectedOrder ? steps.findIndex(step => step.key === selectedOrder.status) : -1;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8" id="sh_order_tracker_portal">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="font-extrabold text-2xl sm:text-3xl mt-1 tracking-tight text-slate-950 uppercase font-sans">
            Order Tracking
          </h1>
          <p className="text-xs text-slate-500 mt-1">Track status manually updated by admin.</p>
        </div>

        <form onSubmit={handleSearch} className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-grow">
            <input 
              type="text"
              placeholder="Enter order number"
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
            Track
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
            Enter a valid order number to view live status.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="flex justify-between items-center mb-5 border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">Order Status Steps</h3>
                <span className="text-[11px] font-mono bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded font-bold uppercase animate-pulse">
                  {selectedOrder.status.replaceAll('_', ' ')}
                </span>
              </div>
              <div className="relative border-l-2 border-slate-100 pl-6 ml-3 space-y-7 py-2.5">
                {steps.map((step, idx) => {
                  const done = idx <= currentIdx;
                  return (
                    <div key={step.key} className="relative">
                      <span className={`absolute -left-9 top-0.5 w-6 h-6 rounded-full border flex items-center justify-center text-[10px] ${done ? 'bg-slate-950 text-white border-slate-950' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>
                        {done ? <Check className="w-3.5 h-3.5 text-amber-400" /> : idx + 1}
                      </span>
                      <div className={`text-xs ${done ? 'text-slate-950' : 'text-slate-400'}`}>
                        <h4 className="font-bold">{step.label}</h4>
                        {idx === currentIdx && <p className="mt-0.5">Current status</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 shadow-sm space-y-3.5">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 font-mono border-b border-slate-800 pb-2.5">
                Items on Transit
              </h4>
              <div className="space-y-3">
                {selectedOrder.items.map((it, i) => (
                  <div key={i} className="flex justify-between items-center text-xs">
                    <div>
                      <p className="font-bold text-white leading-normal">{it.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono">Qty: {it.quantity}x @ ₹{it.price}</p>
                    </div>
                    <span className="font-extrabold text-amber-400">₹{it.price * it.quantity}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-slate-800 pt-3 flex justify-between text-xs">
                <span className="text-slate-400">Shipping:</span>
                <span className="font-bold text-slate-200">FREE</span>
              </div>
              <div className="border-t border-slate-800 pt-3 flex justify-between text-sm">
                <span className="font-black text-white">Total:</span>
                <span className="font-black text-md text-amber-400">₹{selectedOrder.total}</span>
              </div>
            </div>
          </div>
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold text-slate-900 text-sm sm:text-base border-b border-slate-100 pb-3 mb-4">Delivery Details</h3>
            <div className="space-y-3 text-sm text-slate-700">
              <p><span className="font-bold">Customer:</span> {selectedOrder.customerName}</p>
              <p><span className="font-bold">Address:</span> {selectedOrder.address}, {selectedOrder.city} {selectedOrder.zipCode}</p>
              <p><span className="font-bold">Phone:</span> {selectedOrder.phone}</p>
              <p><span className="font-bold">Estimated delivery:</span> {selectedOrder.estimatedDelivery}</p>
              <p className="text-xs text-slate-500 pt-2">Courier and tracking number will appear when admin updates them.</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
