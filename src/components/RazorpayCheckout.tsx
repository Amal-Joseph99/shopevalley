import React, { useState } from 'react';
import { CreditCard, Loader2, AlertCircle, CheckCircle } from 'lucide-react';

interface RazorpayCheckoutProps {
  amount: number; // Amount in paise (e.g., 100 paise = ₹1)
  currency?: string; // Default: INR
  receipt?: string; // Unique receipt ID for the order
  description?: string; // Description of the payment
  email?: string; // Customer email
  customerId?: string; // Customer ID
  onSuccess?: (data: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) => void;
  onError?: (error: string) => void;
  buttonText?: string;
  buttonClassName?: string;
}

export default function RazorpayCheckout({
  amount,
  currency = 'INR',
  receipt,
  description = 'Payment for order',
  email,
  customerId,
  onSuccess,
  onError,
  buttonText = 'Proceed to Payment',
  buttonClassName = 'bg-[#FEB103] hover:bg-[#F3A801] text-slate-950 font-extrabold'
}: RazorpayCheckoutProps) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  // Load Razorpay script dynamically
  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    // Validation
    if (!amount || amount < 100) {
      const errorMsg = 'Invalid amount. Minimum amount is ₹1 (100 paise)';
      setStatusMessage(errorMsg);
      setStatus('error');
      onError?.(errorMsg);
      return;
    }

    if (!receipt) {
      const errorMsg = 'Receipt ID is required';
      setStatusMessage(errorMsg);
      setStatus('error');
      onError?.(errorMsg);
      return;
    }

    setLoading(true);
    setStatus('idle');
    setStatusMessage('');

    try {
      // Step 1: Load Razorpay script if not already loaded
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Failed to load Razorpay script');
      }

      // Step 2: Create order from backend
      const orderResponse = await fetch('/api/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount,
          currency,
          receipt,
          description,
          customer_id: customerId,
          email
        })
      });

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json();
        throw new Error(errorData.error || 'Failed to create order');
      }

      const orderData = await orderResponse.json();

      if (!orderData.success) {
        throw new Error(orderData.error || 'Failed to create order');
      }

      const orderId = orderData.order_id;

      // Step 3: Open Razorpay modal
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        order_id: orderId,
        name: 'CraftValy',
        description: description,
        amount: amount,
        currency: currency,
        prefill: {
          email: email || '',
          contact: ''
        },
        theme: {
          color: '#2E7D32'
        },
        handler: async (response: any) => {
          // Step 4: Payment successful, verify signature
          try {
            const verifyResponse = await fetch('/api/verify-payment', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              })
            });

            const verifyData = await verifyResponse.json();

            if (verifyData.success) {
              setStatus('success');
              setStatusMessage('Payment successful! Order confirmed.');
              onSuccess?.(response);
            } else {
              throw new Error(verifyData.error || 'Payment verification failed');
            }
          } catch (verifyError: any) {
            setStatus('error');
            setStatusMessage(verifyError.message);
            onError?.(verifyError.message);
          }
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            setStatus('error');
            setStatusMessage('Payment cancelled by user');
            onError?.('Payment cancelled');
          }
        },
        retry: {
          enabled: true,
          max_count: 3
        }
      };

      // @ts-ignore
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error: any) {
      const errorMsg = error.message || 'Payment initialization failed';
      setStatus('error');
      setStatusMessage(errorMsg);
      onError?.(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Status Message */}
      {status === 'success' && (
        <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
          <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
          <p className="text-sm text-green-700 font-medium">{statusMessage}</p>
        </div>
      )}

      {status === 'error' && (
        <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <p className="text-sm text-red-700 font-medium">{statusMessage}</p>
        </div>
      )}

      {/* Payment Button */}
      <button
        onClick={handlePayment}
        disabled={loading || status === 'success'}
        className={`flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-bold text-sm transition-all cursor-pointer active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${buttonClassName}`}
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Processing...</span>
          </>
        ) : status === 'success' ? (
          <>
            <CheckCircle className="w-4 h-4" />
            <span>Payment Confirmed</span>
          </>
        ) : (
          <>
            <CreditCard className="w-4 h-4" />
            <span>{buttonText}</span>
          </>
        )}
      </button>

      {/* Info Text */}
      <p className="text-xs text-slate-500 text-center">
        Amount: <span className="font-bold text-slate-700">₹{(amount / 100).toFixed(2)}</span>
        {' '} | {currency}
      </p>
    </div>
  );
}
