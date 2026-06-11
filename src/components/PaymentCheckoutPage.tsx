import React, { useState } from 'react';
import RazorpayCheckout from './RazorpayCheckout';
import { ShoppingCart, Package } from 'lucide-react';

interface CheckoutItem {
  id: string;
  name: string;
  price: number; // in paise
  quantity: number;
}

interface PaymentCheckoutPageProps {
  items?: CheckoutItem[];
  onPaymentSuccess?: (paymentData: any) => void;
  onPaymentError?: (error: string) => void;
}

export default function PaymentCheckoutPage({
  items = [
    { id: '1', name: 'Handmade Ceramic Vase', price: 29900, quantity: 1 },
    { id: '2', name: 'Wooden Cutting Board', price: 12900, quantity: 2 }
  ],
  onPaymentSuccess,
  onPaymentError
}: PaymentCheckoutPageProps) {
  const [expandedItems, setExpandedItems] = useState(false);

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = Math.round(subtotal * 0.18); // 18% GST
  const shipping = 5000; // ₹50 flat rate
  const total = subtotal + tax + shipping;

  // Generate unique receipt ID
  const receipt = `receipt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-lg">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-black text-slate-900 flex items-center gap-2">
          <ShoppingCart className="w-8 h-8 text-amber-500" />
          Order Summary
        </h1>
        <p className="text-sm text-slate-500 mt-1">Review your order and proceed to payment</p>
      </div>

      {/* Items Section */}
      <div className="bg-slate-50 rounded-lg p-4 mb-6 border border-slate-200">
        <button
          onClick={() => setExpandedItems(!expandedItems)}
          className="w-full flex items-center justify-between font-bold text-slate-900 hover:text-amber-600 transition-colors"
        >
          <span className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Items in Cart ({items.length})
          </span>
          <span className="text-sm text-slate-500">{expandedItems ? '▼' : '▶'}</span>
        </button>

        {expandedItems && (
          <div className="mt-4 space-y-2 pt-4 border-t border-slate-200">
            {items.map((item) => (
              <div key={item.id} className="flex items-center justify-between text-sm">
                <span className="text-slate-700">
                  {item.name} <span className="text-slate-500">× {item.quantity}</span>
                </span>
                <span className="font-bold text-slate-900">
                  ₹{((item.price * item.quantity) / 100).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Price Breakdown */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 mb-6 space-y-3">
        <div className="flex justify-between items-center text-sm">
          <span className="text-slate-600">Subtotal</span>
          <span className="font-bold">₹{(subtotal / 100).toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-slate-600">Tax (18% GST)</span>
          <span className="font-bold">₹{(tax / 100).toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-slate-600">Shipping</span>
          <span className="font-bold">₹{(shipping / 100).toFixed(2)}</span>
        </div>
        <div className="border-t border-slate-200 pt-3 flex justify-between items-center">
          <span className="text-lg font-black text-slate-900">Total Amount</span>
          <span className="text-2xl font-black text-amber-600">₹{(total / 100).toFixed(2)}</span>
        </div>
      </div>

      {/* Payment Section */}
      <div className="bg-slate-50 p-6 rounded-lg border border-slate-200 mb-6">
        <h2 className="text-lg font-bold text-slate-900 mb-4">Payment Method</h2>
        <RazorpayCheckout
          amount={total}
          currency="INR"
          receipt={receipt}
          description={`Order for ${items.length} items - CraftValy`}
          email="customer@example.com"
          customerId="customer_123"
          onSuccess={(data) => {
            console.log('Payment successful:', data);
            onPaymentSuccess?.(data);
          }}
          onError={(error) => {
            console.error('Payment error:', error);
            onPaymentError?.(error);
          }}
          buttonText="Pay Now"
          buttonClassName="w-full bg-[#2E7D32] hover:bg-[#1b5e20] text-white font-extrabold py-4 text-lg"
        />
      </div>

      {/* Security Info */}
      <div className="text-xs text-slate-500 text-center p-4 bg-slate-50 rounded-lg border border-slate-200">
        <p>🔒 Your payment is secure and encrypted with Razorpay's industry-leading security</p>
      </div>
    </div>
  );
}
