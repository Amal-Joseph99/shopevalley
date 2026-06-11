import React from 'react';
import { Order } from '../types';
import { ShoppingBag, ChevronRight, CalendarDays, DollarSign, Truck } from 'lucide-react';

interface MyOrdersPageProps {
  orders: Order[];
  onNavigate: (path: string) => void;
}

export default function MyOrdersPage({ orders, onNavigate }: MyOrdersPageProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-amber-600 bg-amber-50';
      case 'processing':
        return 'text-blue-600 bg-blue-50';
      case 'shipped':
        return 'text-indigo-600 bg-indigo-50';
      case 'delivered':
        return 'text-green-600 bg-green-50';
      default:
        return 'text-slate-600 bg-slate-50';
    }
  };

  const getStatusLabel = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white px-4 py-8">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-slate-950 mb-2">My Orders</h1>
          <p className="text-sm text-slate-600">{orders.length} order(s)</p>
        </div>

        {/* Orders List */}
        {orders.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 shadow-sm text-center">
            <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600 font-semibold mb-4">No orders yet</p>
            <p className="text-xs text-slate-500 mb-6">Start shopping to place your first order</p>
            <button
              onClick={() => onNavigate('/')}
              className="px-6 py-2 bg-slate-900 text-white font-bold text-xs rounded-lg hover:bg-slate-800 transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => onNavigate(`order-status/${order.id}`)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-extrabold text-slate-950 mb-1">Order {order.id}</h3>
                    <p className="text-xs text-slate-500">
                      {new Date(order.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${getStatusColor(order.status)}`}>
                    {getStatusLabel(order.status)}
                  </span>
                </div>

                {/* Order Items Preview */}
                <div className="mb-4 pb-4 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-600 mb-2">
                    {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                  </p>
                  <div className="space-y-2">
                    {order.items.slice(0, 2).map((item, idx) => (
                      <p key={idx} className="text-xs text-slate-700">
                        • {item.name}
                        {item.quantity > 1 && ` (qty: ${item.quantity})`}
                      </p>
                    ))}
                    {order.items.length > 2 && (
                      <p className="text-xs text-slate-500 italic">
                        +{order.items.length - 2} more item{order.items.length - 2 !== 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                </div>

                {/* Order Details */}
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Order Total</p>
                    <p className="font-extrabold text-slate-950">
                      ₹{(order.total).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Est. Delivery</p>
                    <p className="font-semibold text-xs text-slate-700">{order.estimatedDelivery}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Payment</p>
                    <p className="font-semibold text-xs text-slate-700">{order.paymentMethod}</p>
                  </div>
                </div>

                {/* Shipping Details */}
                <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-600 mb-4 flex items-start gap-2">
                  <Truck className="w-4 h-4 shrink-0 mt-0.5 text-slate-500" />
                  <div>
                    <p className="font-semibold text-slate-700 mb-1">{order.customerName}</p>
                    <p>{order.address}</p>
                    <p>{order.city}, {order.zipCode}</p>
                  </div>
                </div>

                {/* Track Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onNavigate(`order-status/${order.id}`);
                  }}
                  className="w-full py-2.5 border-2 border-slate-200 text-slate-900 font-bold text-xs rounded-lg hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
                >
                  Track Order
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
