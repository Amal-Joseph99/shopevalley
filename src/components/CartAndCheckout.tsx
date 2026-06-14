import React, { useState, useEffect } from 'react';
import { 
  Trash2, 
  ChevronRight, 
  ShieldCheck, 
  CreditCard, 
  CheckCircle2, 
  ShoppingBag, 
  ArrowLeft,
  Calendar
} from 'lucide-react';
import { CartItem, Order } from '../types';
import { formatINR } from './ProductCard';

interface CartAndCheckoutProps {
  cartItems: CartItem[];
  onModifyQty: (cartItemId: string, quantity: number) => void;
  onRemoveItem: (cartItemId: string) => void;
  onNavigate: (path: string) => void;
  onClearCart: () => void;
  onPlaceOrder: (order: Order) => void;
  currentPath?: string;
}

export default function CartAndCheckout({
  cartItems,
  onModifyQty,
  onRemoveItem,
  onNavigate,
  onClearCart,
  onPlaceOrder,
  currentPath = 'cart'
}: CartAndCheckoutProps) {
  const [step, setStep] = useState<'cart' | 'shipping' | 'summary' | 'payment'>(() => {
    if (currentPath === 'shipping-address') return 'shipping';
    if (currentPath === 'order-summary') return 'summary';
    if (currentPath === 'checkout') return 'payment';
    return 'cart';
  });

  useEffect(() => {
    if (currentPath === 'shipping-address') {
      setStep('shipping');
    } else if (currentPath === 'order-summary') {
      setStep('summary');
    } else if (currentPath === 'checkout') {
      setStep('payment');
    } else {
      setStep('cart');
    }
  }, [currentPath]);

  const [customerName, setCustomerName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [phone, setPhone] = useState('');
  const [artisanNote, setArtisanNote] = useState('');
  const [savedAddresses, setSavedAddresses] = useState<Array<{id: string; name: string; email: string; address: string; city: string; zipCode: string; phone: string}>>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [useNewAddress, setUseNewAddress] = useState(true);

  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'wallet'>('card');
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing'>('idle');
  const [paymentStatusMessage, setPaymentStatusMessage] = useState('');

  const [selectedIds, setSelectedIds] = useState<string[]>(() => cartItems.map(i => i.id));

  useEffect(() => {
    setSelectedIds(prev => {
      const cartItemIds = cartItems.map(i => i.id);
      const activeSelected = prev.filter(id => cartItemIds.includes(id));
      const newlyAdded = cartItemIds.filter(id => !prev.includes(id));
      if (newlyAdded.length > 0) {
        return [...activeSelected, ...newlyAdded];
      }
      return activeSelected;
    });
  }, [cartItems]);

  const selectedItems = cartItems.filter(item => selectedIds.includes(item.id));

  const tax = 0;
  const subtotal = selectedItems.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0);
  const total = Math.round(subtotal * 100) / 100;

  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    itemIdsToRemove: string[];
  }>({
    isOpen: false,
    itemIdsToRemove: []
  });

  const triggerRemoveItemCheck = (id: string) => {
    setConfirmDialog({
      isOpen: true,
      itemIdsToRemove: [id]
    });
  };

  const triggerRemoveSelectedCheck = () => {
    if (selectedIds.length === 0) return;
    setConfirmDialog({
      isOpen: true,
      itemIdsToRemove: selectedIds
    });
  };

  const executeRemovingItems = () => {
    confirmDialog.itemIdsToRemove.forEach(id => {
      onRemoveItem(id);
    });
    setSelectedIds(prev => prev.filter(id => !confirmDialog.itemIdsToRemove.includes(id)));
    setConfirmDialog({ isOpen: false, itemIdsToRemove: [] });
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleSelectAll = () => setSelectedIds(cartItems.map(i => i.id));
  const handleDeselectAll = () => setSelectedIds([]);

  const validateShipping = () => {
    return Boolean(customerName.trim() && email.trim() && address.trim() && city.trim() && zipCode.trim());
  };

  const handleNextStep = () => {
    if (step === 'cart') {
      if (selectedItems.length === 0) {
        alert('Please select at least one item to proceed.');
        return;
      }
      onNavigate('shipping-address');
    } else if (step === 'shipping') {
      if (!validateShipping()) {
        alert('Please fill in all required shipping fields.');
        return;
      }
      onNavigate('order-summary');
    } else if (step === 'summary') {
      onNavigate('checkout');
    }
  };

  const simulatePayment = () => {
    if (paymentMethod === 'card' && (!cardNumber || !cardExpiry || !cardCvv || !cardHolder)) {
      alert('Please fill in card credentials to authorize.');
      return;
    }

    setPaymentStatus('processing');
    const messages = [
      'Securing encrypted payment transfer...',
      'Validating selected items and shipping details...',
      'Processing escrow authorization with ShopeValley vault...',
      'Finalizing gateway confirmation and settlement...',
      'Order is being registered...'
    ];

    let currentMsgIdx = 0;
    setPaymentStatusMessage(messages[0]);

    const interval = setInterval(() => {
      currentMsgIdx++;
      if (currentMsgIdx < messages.length) {
        setPaymentStatusMessage(messages[currentMsgIdx]);
      } else {
        clearInterval(interval);
        const orderId = `SV-${Math.floor(1000 + Math.random() * 9000)}`;
        const finalOrder: Order = {
          id: orderId,
          items: selectedItems.map(item => ({
            productId: item.productId,
            name: item.product.name,
            price: item.unitPrice,
            quantity: item.quantity
          })),
          subtotal: Math.round(subtotal * 100) / 100,
          shipping: 0,
          tax,
          total,
          customerName,
          email,
          address,
          city,
          zipCode,
          phone,
          status: 'accepted',
          paymentMethod: paymentMethod === 'card' ? 'Card Payment' : 'ShopeValley Wallet',
          createdAt: new Date().toISOString(),
          estimatedDelivery: '7-9 business days',
          trackingSteps: [
            { status: 'Order Accepted', description: 'Your order has been accepted and confirmed.', time: 'Just now', done: true },
            { status: 'Order Packed', description: 'Your items are being packed for shipment.', time: 'Processing', done: false },
            { status: 'Picked Up', description: 'Package picked up by courier.', time: 'Pending', done: false },
            { status: 'In Transit', description: 'Your package is on its way.', time: 'Pending', done: false },
            { status: 'Out for Delivery', description: 'Package is out for delivery to your address.', time: 'Pending', done: false },
            { status: 'Delivered', description: 'Package delivered successfully.', time: 'Pending', done: false }
          ]
        };

        onPlaceOrder(finalOrder);
        setPaymentStatus('idle');
        onNavigate(`order-status/${orderId}`);
      }
    }, 1200);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8" id="sh_shopping_checkout_flow">
      <div className="flex items-center justify-center gap-2 sm:gap-6 mb-10 text-xs sm:text-sm max-w-xl mx-auto border-b border-slate-200 pb-5">
        <button
          onClick={() => onNavigate('cart')}
          className={`font-semibold flex items-center gap-1.5 pb-2 border-b-2 transition-all ${step === 'cart' ? 'border-slate-900 text-slate-950 font-extrabold' : 'border-transparent text-slate-400'}`}>
          <span className="bg-slate-100 w-5.5 h-5.5 rounded-full flex items-center justify-center text-[10px] font-bold">1</span>
          Cart
        </button>
        <ChevronRight className="w-4 h-4 text-slate-300 animate-pulse" />
        <button
          onClick={() => selectedItems.length > 0 && onNavigate('shipping-address')}
          disabled={selectedItems.length === 0}
          className={`font-semibold flex items-center gap-1.5 pb-2 border-b-2 transition-all ${step === 'shipping' ? 'border-slate-900 text-slate-950 font-extrabold' : 'border-transparent text-slate-400'}`}>
          <span className="bg-slate-100 w-5.5 h-5.5 rounded-full flex items-center justify-center text-[10px] font-bold">2</span>
          Shipping Address
        </button>
        <ChevronRight className="w-4 h-4 text-slate-300" />
        <button
          onClick={() => { if (validateShipping()) onNavigate('order-summary'); }}
          disabled={!validateShipping()}
          className={`font-semibold flex items-center gap-1.5 pb-2 border-b-2 transition-all ${step === 'summary' ? 'border-slate-900 text-slate-950 font-extrabold' : 'border-transparent text-slate-400'}`}>
          <span className="bg-slate-100 w-5.5 h-5.5 rounded-full flex items-center justify-center text-[10px] font-bold">3</span>
          Order Summary
        </button>
        <ChevronRight className="w-4 h-4 text-slate-300" />
        <button
          onClick={() => onNavigate('checkout')}
          disabled={!validateShipping()}
          className={`font-semibold flex items-center gap-1.5 pb-2 border-b-2 transition-all ${step === 'payment' ? 'border-slate-900 text-slate-950 font-extrabold' : 'border-transparent text-slate-400'}`}>
          <span className="bg-slate-100 w-5.5 h-5.5 rounded-full flex items-center justify-center text-[10px] font-bold">4</span>
          Payment
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8">
          {step === 'cart' && (
            <div className="space-y-6" id="ch_step_cart">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center bg-slate-50 border border-slate-200 p-4 rounded-xl gap-3">
                <div>
                  <h2 className="font-bold text-slate-900 text-md">Items in your cart ({cartItems.length})</h2>
                  <p className="text-xs text-slate-500 font-sans">Choose the items you want to purchase and proceed to shipping.</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => onNavigate('')}
                    className="text-xs text-slate-700 hover:text-amber-500 font-bold flex items-center gap-1 justify-start">
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Continue Shopping
                  </button>
                  <button
                    onClick={onClearCart}
                    className="text-xs text-rose-600 hover:text-rose-800 font-bold flex items-center gap-1 justify-start">
                    <Trash2 className="w-3.5 h-3.5" />
                    Clear Cart
                  </button>
                </div>
              </div>

              {cartItems.length === 0 ? (
                <div className="text-center py-20 border-2 border-dashed border-slate-200 rounded-2xl p-6 bg-white">
                  <div className="p-4 bg-slate-100 border border-slate-200 text-slate-400 rounded-full inline-flex items-center justify-center mb-4">
                    <ShoppingBag className="w-8 h-8" />
                  </div>
                  <h3 className="font-bold text-slate-800 text-lg">Your Cart is Empty</h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">Add products to your cart to begin checkout.</p>
                  <button
                    onClick={() => onNavigate('')}
                    className="mt-6 bg-slate-950 text-white font-bold text-xs py-2 px-6 rounded-xl hover:bg-slate-800">
                    Browse Products
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-white border border-slate-200 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2">
                      <button onClick={handleSelectAll} className="text-[#0066c0] hover:underline font-bold font-sans cursor-pointer">Select All</button>
                      <span className="text-slate-300">|</span>
                      <button onClick={handleDeselectAll} className="text-[#0066c0] hover:underline font-bold font-sans cursor-pointer">Deselect All</button>
                    </div>
                    <div className="text-slate-500 font-sans font-medium text-xs">Selected: <span className="text-slate-900 font-bold font-sans">{selectedIds.length}</span> / {cartItems.length}</div>
                  </div>

                  {selectedIds.length > 0 && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex justify-between items-center text-xs text-slate-800">
                      <span className="font-bold">{selectedIds.length} item{selectedIds.length > 1 ? 's' : ''} selected</span>
                      <button onClick={triggerRemoveSelectedCheck} title="Delete Selected Items" className="bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100 font-bold p-2 rounded-lg flex items-center justify-center cursor-pointer transition-colors shadow-none">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100 bg-white">
                    {cartItems.map((item) => (
                      <div key={item.id} className="p-4.5 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-start sm:items-center gap-3 flex-1">
                          <input type="checkbox" checked={selectedIds.includes(item.id)} onChange={() => handleToggleSelect(item.id)} className="w-4.5 h-4.5 rounded border-slate-300 text-amber-500 focus:ring-transparent focus:ring-0 cursor-pointer shrink-0 mt-1 sm:mt-0" />
                          <div className="flex gap-4.5">
                            <img src={item.product.images[0]} alt={item.product.name} className="w-16 h-16 object-cover rounded-lg bg-slate-100 shrink-0 border border-slate-200" referrerPolicy="no-referrer" />
                            <div>
                              {item.variantId !== 'STANDARD' && <span className="text-[9px] font-mono font-extrabold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">{item.variantId}</span>}
                              <h4 onClick={() => onNavigate(`category/${item.product.category}/${item.product.slug}`)} className="font-bold text-slate-950 hover:text-amber-500 cursor-pointer text-xs sm:text-sm leading-tight mt-1">{item.product.name}</h4>
                              <div className="flex flex-wrap gap-2 text-[11px] text-slate-500 font-mono mt-1">
                                <span>Size: <span className="text-slate-800 font-extrabold">{item.selectedSize || item.size || 'Free Size'}</span></span>
                                <span>•</span>
                                <span>Colour: <span className="text-slate-800 font-extrabold">{item.selectedColour || item.colour || 'Default'}</span></span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                          <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50 overflow-hidden">
                            <button onClick={() => onModifyQty(item.id, item.quantity - 1)} className="px-3.5 py-1 text-slate-600 hover:bg-slate-100 hover:text-slate-950 font-extrabold transition-all text-sm">-</button>
                            <span className="px-3.5 py-1 text-xs text-slate-800 font-bold font-mono">{item.quantity}</span>
                            <button onClick={() => onModifyQty(item.id, item.quantity + 1)} className="px-3.5 py-1 text-slate-600 hover:bg-slate-100 hover:text-slate-950 font-extrabold transition-all text-sm">+</button>
                          </div>
                          <div className="text-right">
                            <p className="font-extrabold text-slate-900 text-xs sm:text-sm">{formatINR(item.subtotal)}</p>
                            <button onClick={() => triggerRemoveItemCheck(item.id)} className="text-[10px] text-rose-500 hover:text-rose-700 font-bold flex items-center gap-1 mt-1 justify-end ml-auto cursor-pointer">
                              <Trash2 className="w-3 h-3" />
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 'shipping' && (
            <div className="space-y-6" id="ch_step_shipping">
              {savedAddresses.length > 0 && (
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                  <h3 className="font-extrabold text-slate-950 text-md tracking-tight border-b border-slate-100 pb-3 mb-4">Saved Addresses</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {savedAddresses.map(addr => (
                      <button
                        key={addr.id}
                        onClick={() => {
                          setSelectedAddressId(addr.id);
                          setCustomerName(addr.name);
                          setEmail(addr.email);
                          setAddress(addr.address);
                          setCity(addr.city);
                          setZipCode(addr.zipCode);
                          setPhone(addr.phone);
                          setUseNewAddress(false);
                        }}
                        className={`p-4 rounded-2xl border-2 text-left transition-all ${selectedAddressId === addr.id ? 'border-slate-900 bg-slate-950 text-white' : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'}`}>
                        <p className={`font-bold text-xs ${selectedAddressId === addr.id ? 'text-white' : 'text-slate-900'}`}>{addr.name}</p>
                        <p className={`text-[11px] mt-1 ${selectedAddressId === addr.id ? 'text-slate-300' : 'text-slate-500'}`}>{addr.address}</p>
                        <p className={`text-[11px] ${selectedAddressId === addr.id ? 'text-slate-300' : 'text-slate-500'}`}>{addr.city} • {addr.zipCode}</p>
                      </button>
                    ))}
                    <button
                      onClick={() => {
                        setSelectedAddressId(null);
                        setUseNewAddress(true);
                        setCustomerName('');
                        setEmail('');
                        setAddress('');
                        setCity('');
                        setZipCode('');
                        setPhone('');
                      }}
                      className="p-4 rounded-2xl border-2 border-dashed border-slate-300 text-left transition-all hover:border-slate-400 flex items-center justify-center text-slate-600 hover:text-slate-700">
                      <span className="font-bold text-xs">+ Add New Address</span>
                    </button>
                  </div>
                </div>
              )}

              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <h3 className="font-extrabold text-slate-950 text-md tracking-tight border-b border-slate-100 pb-3 mb-5">{selectedAddressId && !useNewAddress ? 'Edit Shipping Address' : 'Enter Shipping Address'}</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-2">Full Name *</label>
                      <input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="e.g. John Doe" className="w-full text-xs sm:text-sm px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-1 focus:ring-slate-900 focus:outline-none bg-white font-sans" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-2">Email Address *</label>
                      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="e.g. j.doe@gmail.com" className="w-full text-xs sm:text-sm px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-1 focus:ring-slate-900 focus:outline-none bg-white font-sans" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2">Street Address *</label>
                    <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="e.g. 1045 Broadway St" className="w-full text-xs sm:text-sm px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-1 focus:ring-slate-900 focus:outline-none bg-white font-sans" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-2">City *</label>
                      <input type="text" value={city} onChange={(e) => setCity(e.target.value)} placeholder="e.g. Denver" className="w-full text-xs sm:text-sm px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-1 focus:ring-slate-900 focus:outline-none bg-white font-sans" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-2">State/Province</label>
                      <input type="text" placeholder="e.g. CO" className="w-full text-xs sm:text-sm px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-1 focus:ring-slate-900 focus:outline-none bg-white font-sans" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-2">Postal Code *</label>
                      <input type="text" value={zipCode} onChange={(e) => setZipCode(e.target.value)} placeholder="e.g. 80203" className="w-full text-xs sm:text-sm px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-1 focus:ring-slate-900 focus:outline-none bg-white font-mono" />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
                    <Calendar className="w-4 h-4" />
                    <span><span className="font-bold">FREE Shipping</span> — Estimated delivery: 7-9 business days</span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2">Phone Number *</label>
                    <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="e.g. 303-555-0192" className="w-full text-xs sm:text-sm px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-1 focus:ring-slate-900 focus:outline-none bg-white font-sans" />
                  </div>

                  <div className="border-t border-slate-100 pt-4">
                    <label className="flex items-center gap-2 text-xs cursor-pointer">
                      <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-slate-300 text-slate-900" />
                      <span className="font-semibold text-slate-700">Save this address for future orders</span>
                    </label>
                  </div>
                </div>

                <div className="mt-6 pt-5 border-t border-slate-100">
                  <label className="block text-xs font-bold text-slate-700 mb-2">Special Instructions (Optional)</label>
                  <textarea value={artisanNote} onChange={(e) => setArtisanNote(e.target.value)} rows={3} placeholder="e.g., Leave at front door, apartment number, gate code, etc." className="w-full text-xs sm:text-sm px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-1 focus:ring-slate-900 focus:outline-none bg-white font-sans resize-none" />
                </div>
              </div>
            </div>
          )}

          {step === 'summary' && (
            <div className="space-y-6" id="ch_step_summary">
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <h3 className="font-extrabold text-slate-950 text-md tracking-tight border-b border-slate-100 pb-3 mb-5">Order Summary</h3>
                <div className="grid grid-cols-1 gap-4 text-xs sm:text-sm">
                  <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200">
                    <h4 className="font-bold text-slate-900 text-sm mb-3">Shipping Information</h4>
                    <p className="text-slate-600">{customerName}</p>
                    <p className="text-slate-600">{email}</p>
                    <p className="text-slate-600">{address}</p>
                    <p className="text-slate-600">{city} • {zipCode}</p>
                    <p className="text-slate-600">{phone || 'No phone entered'}</p>
                    <p className="text-slate-600 mt-3"><span className="font-bold">Delivery:</span> Estimated 7-9 business days</p>
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200">
                    <h4 className="font-bold text-slate-900 text-sm mb-3">Selected Items</h4>
                    <div className="space-y-3">
                      {selectedItems.map(item => (
                        <div key={item.id} className="flex justify-between items-start gap-3">
                          <div>
                            <h5 className="font-semibold text-slate-900 text-xs sm:text-sm">{item.product.name}</h5>
                            <p className="text-[11px] text-slate-500">Qty: {item.quantity} • {item.selectedSize || item.size || 'Free Size'} • {item.selectedColour || item.colour || 'Default'}</p>
                          </div>
                          <span className="text-slate-900 font-bold text-xs">{formatINR(item.subtotal)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="mt-6 border-t border-slate-100 pt-4 text-xs sm:text-sm">
                  <div className="flex justify-between mb-2"><span className="text-slate-500">Subtotal</span><span className="font-semibold text-slate-900">{formatINR(subtotal)}</span></div>
                  <div className="flex justify-between mb-2"><span className="text-slate-500">Shipping</span><span className="font-semibold text-emerald-600">FREE</span></div>
                  <div className="flex justify-between pt-3 border-t border-slate-200 text-sm font-bold"><span>Total</span><span>{formatINR(total)}</span></div>
                </div>
              </div>
            </div>
          )}

          {step === 'payment' && (
            <div className="space-y-6" id="ch_step_payment">
              {paymentStatus === 'processing' ? (
                <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-lg animate-pulse">
                  <div className="inline-flex items-center justify-center text-amber-500 mb-6 relative">
                    <CreditCard className="w-12 h-12 text-slate-950" />
                  </div>
                  <h3 className="font-extrabold text-slate-950 text-lg uppercase">Processing Secure Payment</h3>
                  <div className="max-w-sm mx-auto mt-3">
                    <div className="bg-amber-50 rounded-xl p-3 border border-amber-200 font-mono text-[11px] text-amber-900 leading-normal text-left">{paymentStatusMessage}</div>
                  </div>
                  <p className="text-[10px] text-slate-400 font-mono mt-8">Do not reload this page while we finish the payment.</p>
                </div>
              ) : (
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm text-left">
                  <h3 className="font-extrabold text-slate-950 text-md tracking-tight border-b border-slate-100 pb-3 mb-5">Payment Gateway</h3>
                  <div className="space-y-4">
                    <div className="flex gap-4 mb-6">
                      <button onClick={() => setPaymentMethod('card')} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border text-xs font-bold transition-all ${paymentMethod === 'card' ? 'bg-slate-950 border-slate-950 text-white shadow-sm' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}>
                        <CreditCard className="w-4 h-4" /> Card
                      </button>
                      <button onClick={() => setPaymentMethod('wallet')} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border text-xs font-bold transition-all ${paymentMethod === 'wallet' ? 'bg-slate-950 border-slate-950 text-white shadow-sm' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}>
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Wallet
                      </button>
                    </div>
                    {paymentMethod === 'card' ? (
                      <div className="space-y-4">
                        <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-white rounded-2xl p-6 shadow-md border border-slate-800 font-mono flex flex-col justify-between h-44 relative overflow-hidden">
                          <div className="absolute right-0 bottom-0 p-12 bg-white/5 rounded-tl-full pointer-events-none" />
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="text-[10px] text-slate-400 font-sans">SECURE PAYMENT</span>
                              <h4 className="text-[11px] font-bold tracking-widest uppercase font-sans">SHOPEVALLEY VAULT</h4>
                            </div>
                            <span className="text-sm font-semibold italic text-slate-300">VISA</span>
                          </div>
                          <div className="text-md sm:text-lg tracking-widest text-center my-2 font-bold select-all">{cardNumber || '•••• •••• •••• ••••'}</div>
                          <div className="flex justify-between items-end text-[10px]">
                            <div>
                              <p className="text-[9px] text-slate-400 font-sans uppercase">Holder</p>
                              <p className="font-bold tracking-wide truncate max-w-[130px]">{cardHolder || 'CARDHOLDER NAME'}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-[9px] text-slate-400 font-sans uppercase">Expiry</p>
                              <p className="font-bold">{cardExpiry || 'MM / YY'}</p>
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs font-sans">
                          <div className="sm:col-span-2">
                            <label className="block text-xs font-bold text-slate-700 mb-1">Card Holder Name</label>
                            <input type="text" value={cardHolder} onChange={(e) => setCardHolder(e.target.value.toUpperCase())} placeholder="e.g. JOHN DOE" className="w-full text-xs sm:text-sm px-3.5 py-2 border border-slate-200 rounded-xl focus:ring-1 focus:ring-slate-950 focus:outline-none bg-white uppercase font-mono" />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Card Number</label>
                            <input type="text" value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} placeholder="4000 1234 5678 9010" maxLength={19} className="w-full text-xs sm:text-sm px-3.5 py-2 border border-slate-200 rounded-xl focus:ring-1 focus:ring-slate-950 focus:outline-none bg-white font-mono" />
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <label className="block text-xs font-bold text-slate-700 mb-1">Expiry</label>
                              <input type="text" value={cardExpiry} onChange={(e) => setCardExpiry(e.target.value)} placeholder="MM/YY" maxLength={5} className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-200 rounded-xl focus:ring-1 focus:ring-slate-950 focus:outline-none bg-white text-center font-mono" />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-700 mb-1">CVV</label>
                              <input type="password" value={cardCvv} onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))} placeholder="•••" maxLength={3} className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-200 rounded-xl focus:ring-1 focus:ring-slate-950 focus:outline-none bg-white text-center font-mono" />
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-emerald-50 border border-emerald-100 p-5 rounded-2xl text-left space-y-2.5 text-xs">
                        <p className="font-bold text-emerald-800">Instant Wallet Payment</p>
                        <p className="text-emerald-700/80">Use the ShopeValley wallet to complete checkout without card details.</p>
                      </div>
                    )}
                  </div>
                  <div className="mt-8 pt-5 border-t border-slate-100">
                    <button onClick={simulatePayment} className="w-full bg-[#10b981] hover:bg-emerald-600 text-white font-bold py-3 px-6 rounded-xl transition-all shadow flex items-center justify-center gap-2 cursor-pointer text-xs uppercase tracking-wider font-sans">
                      <ShieldCheck className="w-5 h-5 text-white" />
                      Pay {formatINR(total)}
                    </button>
                    <p className="text-[10px] text-slate-400 text-center mt-2.5 font-mono">Your payment is encrypted and routed through the ShopeValley gateway.</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 shadow-sm relative overflow-hidden text-left">
            <h3 className="font-bold text-sm tracking-wide uppercase font-sans border-b border-slate-800/80 pb-3 mb-4 text-slate-100">Order Summary</h3>
            <div className="space-y-3.5 text-xs">
              <div className="flex justify-between"><span className="text-slate-400">Selected Products</span><span className="font-extrabold text-slate-100">{formatINR(subtotal)}</span></div>
              {(step === 'summary' || step === 'payment') && (
                <>
                  <div className="flex justify-between"><span className="text-slate-400">Shipping</span><span className="font-semibold text-emerald-400">FREE</span></div>
                  <div className="border-t border-slate-800 pt-3.5 mt-3.5 flex justify-between text-sm"><span className="font-extrabold text-amber-400 tracking-wide">Grand Total</span><span className="font-black text-lg text-white font-sans">{formatINR(total)}</span></div>
                </>
              )}
            </div>
            {step !== 'payment' && (
              <div className="mt-6 border-t border-slate-800/60 pt-4.5">
                {selectedItems.length > 0 ? (
                  <button onClick={handleNextStep} className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-3 px-4 rounded-xl text-center flex items-center justify-center gap-1 shadow-md transition-transform active:scale-95 text-xs tracking-wider uppercase cursor-pointer">
                    {step === 'cart' ? 'Proceed to Shipping' : step === 'shipping' ? 'Review Order Summary' : 'Continue to Payment'}
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <p className="text-[11px] text-amber-500 text-left font-mono">Select items in your cart to start checkout.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {confirmDialog.isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 uppercase">Remove Item</h3>
            <p className="text-xs text-slate-500 mt-2">Are you sure you want to remove the selected item(s) from your cart?</p>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setConfirmDialog({ isOpen: false, itemIdsToRemove: [] })} className="px-4 py-2 border border-slate-200 rounded-xl text-[11px] font-semibold text-slate-600 hover:bg-slate-50 transition-colors">Cancel</button>
              <button onClick={executeRemovingItems} className="px-4 py-2 bg-rose-600 text-white rounded-xl text-[11px] font-bold hover:bg-rose-700 transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
