import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  Package,
  Truck,
  Clock,
  ArrowLeft,
  Copy,
  MapPin,
  CreditCard
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { formatINR } from './ProductCard';

interface OrderStatusPageProps {
  orderIdOrNumber: string;
  onNavigate: (path: string) => void;
}

interface OrderData {
  id: string;
  order_number: string;
  status: string;
  payment_status: string;
  total: number;
  subtotal: number;
  shipping_fee: number;
  shipping_name: string;
  shipping_email: string;
  shipping_phone: string;
  shipping_address: string;
  shipping_city: string;
  shipping_zip: string;
  payment_method: string;
  razorpay_payment_id: string;
  estimated_delivery: string;
  created_at: string;
  items: Array<{
    product_name: string;
    product_image: string;
    size: string;
    colour: string;
    quantity: number;
    unit_price: number;
    total_price: number;
  }>;
}

const ORDER_STEPS = [
  { key: 'accepted', label: 'Order Accepted', icon: CheckCircle2 },
  { key: 'packed', label: 'Order Packed', icon: Package },
  { key: 'picked_up', label: 'Picked Up', icon: Truck },
  { key: 'in_transit', label: 'In Transit', icon: Truck },
  { key: 'out_for_delivery', label: 'Out for Delivery', icon: MapPin },
  { key: 'delivered', label: 'Delivered', icon: CheckCircle2 }
];

export default function OrderStatusPage({ orderIdOrNumber, onNavigate }: OrderStatusPageProps) {
  const [order, setOrder] = useState<OrderData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Parse URL params for failed status
  const urlParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
  const failedReason = urlParams.get('reason') || '';
  const statusParam = urlParams.get('status') || '';

  useEffect(() => {
    const fetchOrder = async () => {
      setIsLoading(true);
      const cleanId = orderIdOrNumber.replace('order-status/', '').split('?')[0];

      const { data, error: fetchErr } = await supabase
        .from('orders')
        .select('*')
        .or(`order_number.eq.${cleanId},id.eq.${cleanId}`)
        .single();

      if (fetchErr || !data) {
        setError('Order not found. It may still be processing.');
        setIsLoading(false);
        return;
      }

      // Fetch order items
      const { data: items } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', data.id);

      setOrder({
        ...data,
        items: items || []
      });
      setIsLoading(false);
    };

    fetchOrder();
  }, [orderIdOrNumber]);

  const getStepIndex = (status: string) => {
    return ORDER_STEPS.findIndex(s => s.key === status);
  };

  const isPaymentFailed = order?.payment_status === 'failed' || statusParam === 'failed';

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="w-10 h-10 border-3 border-violet-200 border-t-violet-600 rounded-full animate-spin mx-auto"></div>
        <p className="text-sm text-slate-500 mt-4">Loading order details...</p>
      </div>
    );
  }

  if (error && !order) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <Clock className="w-12 h-12 text-amber-500 mx-auto" />
        <h2 className="text-xl font-extrabold text-slate-900">Order Processing</h2>
        <p className="text-sm text-slate-500">{error}</p>
        <p className="text-xs text-slate-400">If payment was successful, your order will appear here shortly.</p>
        <button
          onClick={() => onNavigate('my-orders')}
          className="mt-4 bg-slate-900 text-white font-bold text-xs py-2.5 px-6 rounded-xl cursor-pointer"
        >
          View My Orders
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      {/* Back Button */}
      <button
        onClick={() => onNavigate('')}
        className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Store
      </button>

      {/* Status Header */}
      {isPaymentFailed ? (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center space-y-3">
          <XCircle className="w-16 h-16 text-red-500 mx-auto" />
          <h1 className="text-2xl font-extrabold text-red-800">Payment Failed</h1>
          <p className="text-sm text-red-600 max-w-md mx-auto">
            {failedReason || 'Your payment could not be processed. No amount has been deducted from your account.'}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <button
              onClick={() => onNavigate('checkout')}
              className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs py-2.5 px-6 rounded-xl cursor-pointer"
            >
              Retry Payment
            </button>
            <button
              onClick={() => onNavigate('')}
              className="border border-slate-200 text-slate-700 font-bold text-xs py-2.5 px-6 rounded-xl cursor-pointer hover:bg-slate-50"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-8 text-center space-y-3">
          <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto" />
          <h1 className="text-2xl font-extrabold text-emerald-800">Order Confirmed!</h1>
          <p className="text-sm text-emerald-700">Thank you for your purchase. Your order has been placed successfully.</p>
          {order && (
            <div className="flex items-center justify-center gap-2 mt-2">
              <span className="font-mono font-bold text-sm text-slate-800 bg-white border border-slate-200 px-3 py-1 rounded-lg">
                {order.order_number}
              </span>
              <button
                onClick={() => navigator.clipboard.writeText(order.order_number)}
                className="text-slate-400 hover:text-slate-600 p-1"
                title="Copy Order ID"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Order Details (only if we have data) */}
      {order && !isPaymentFailed && (
        <>
          {/* Tracking Progress */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6">
            <h3 className="font-extrabold text-sm text-slate-800 uppercase mb-6">Order Tracking</h3>
            <div className="relative">
              {ORDER_STEPS.map((step, idx) => {
                const currentIdx = getStepIndex(order.status);
                const isDone = idx <= currentIdx;
                const isCurrent = idx === currentIdx;
                return (
                  <div key={step.key} className="flex items-start gap-4 mb-6 last:mb-0">
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                        isDone ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'
                      } ${isCurrent ? 'ring-4 ring-emerald-100' : ''}`}>
                        <step.icon className="w-4 h-4" />
                      </div>
                      {idx < ORDER_STEPS.length - 1 && (
                        <div className={`w-0.5 h-8 mt-1 ${isDone ? 'bg-emerald-300' : 'bg-slate-200'}`} />
                      )}
                    </div>
                    <div className="pt-1">
                      <p className={`text-xs font-bold ${isDone ? 'text-emerald-700' : 'text-slate-500'}`}>{step.label}</p>
                      {isCurrent && <p className="text-[10px] text-slate-400 mt-0.5">Current status</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6">
            <h3 className="font-extrabold text-sm text-slate-800 uppercase mb-4">Items Ordered</h3>
            <div className="space-y-3">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-4 py-3 border-b border-slate-100 last:border-0">
                  {item.product_image && (
                    <img src={item.product_image} alt="" className="w-12 h-12 rounded-lg object-cover bg-slate-100" />
                  )}
                  <div className="flex-grow">
                    <p className="font-bold text-xs text-slate-900">{item.product_name}</p>
                    <p className="text-[10px] text-slate-500">
                      {item.size !== 'Free Size' && `Size: ${item.size}`}
                      {item.colour && ` • Color: ${item.colour}`}
                      {` • Qty: ${item.quantity}`}
                    </p>
                  </div>
                  <span className="font-bold text-xs text-slate-900">{formatINR(item.total_price)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-slate-200 mt-4 pt-4 space-y-2 text-xs">
              <div className="flex justify-between"><span className="text-slate-500">Subtotal</span><span className="font-bold">{formatINR(order.subtotal)}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Shipping</span><span className="font-bold text-emerald-600">FREE</span></div>
              <div className="flex justify-between pt-2 border-t border-slate-100 text-sm">
                <span className="font-extrabold">Total Paid</span>
                <span className="font-black">{formatINR(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Shipping & Payment Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-5">
              <h4 className="font-bold text-xs text-slate-500 uppercase mb-3">Shipping To</h4>
              <p className="text-sm font-bold text-slate-900">{order.shipping_name}</p>
              <p className="text-xs text-slate-600 mt-1">{order.shipping_address}</p>
              <p className="text-xs text-slate-600">{order.shipping_city} • {order.shipping_zip}</p>
              <p className="text-xs text-slate-600 mt-1">{order.shipping_phone}</p>
              <p className="text-xs text-emerald-600 font-bold mt-3">Est. delivery: {order.estimated_delivery}</p>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-5">
              <h4 className="font-bold text-xs text-slate-500 uppercase mb-3">Payment</h4>
              <div className="flex items-center gap-2 mb-2">
                <CreditCard className="w-4 h-4 text-violet-600" />
                <span className="text-sm font-bold text-slate-900">{order.payment_method}</span>
              </div>
              <p className="text-xs text-slate-600">Status: <span className="font-bold text-emerald-600 capitalize">{order.payment_status}</span></p>
              {order.razorpay_payment_id && (
                <p className="text-[10px] text-slate-400 font-mono mt-2">Payment ID: {order.razorpay_payment_id}</p>
              )}
              <p className="text-[10px] text-slate-400 mt-2">Placed on: {new Date(order.created_at).toLocaleString()}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3 justify-center pt-4">
            <button
              onClick={() => onNavigate('my-orders')}
              className="border border-slate-200 text-slate-700 font-bold text-xs py-2.5 px-6 rounded-xl cursor-pointer hover:bg-slate-50"
            >
              View All Orders
            </button>
            <button
              onClick={() => onNavigate('')}
              className="bg-[#7c3aed] text-white font-bold text-xs py-2.5 px-6 rounded-xl cursor-pointer hover:bg-violet-700"
            >
              Continue Shopping
            </button>
          </div>
        </>
      )}
    </div>
  );
}
