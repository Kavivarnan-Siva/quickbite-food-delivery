import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  CreditCard, 
  DollarSign, 
  Clock, 
  ShieldCheck, 
  Check, 
  Lock,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function CheckoutModal({ isOpen, onClose, onOrderSuccess }) {
  const { cart, subtotal, deliveryFee, tax, tip, discount, total, promo, clearCart } = useCart();
  const { user, selectedAddress, setActiveTrackingOrderId } = useAuth();

  const [paymentMethod, setPaymentMethod] = useState('card');
  const [deliveryNotes, setDeliveryNotes] = useState(selectedAddress?.instructions || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Dummy card form state
  const [cardNumber, setCardNumber] = useState('•••• •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('123');

  if (!isOpen || !cart.restaurant) return null;

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const orderPayload = {
        customerId: user.id,
        customerName: user.name,
        customerPhone: user.phone,
        deliveryAddress: `${selectedAddress.address} (${deliveryNotes})`,
        restaurantId: cart.restaurant.id,
        restaurantName: cart.restaurant.name,
        items: cart.items.map(i => ({
          id: i.id,
          name: i.name,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          selectedOptions: i.selectedOptions,
          specialInstructions: i.specialInstructions
        })),
        subtotal,
        deliveryFee,
        tax,
        tip,
        discount,
        total,
        promoCode: promo?.code || null,
        paymentMethod,
        specialInstructions: deliveryNotes
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });

      const data = await res.json();

      if (data.success && data.data) {
        // Fire confetti celebration!
        try {
          confetti({
            particleCount: 120,
            spread: 80,
            origin: { y: 0.6 }
          });
        } catch (e) {
          console.error(e);
        }

        const createdOrder = data.data;
        clearCart();
        onClose();
        setActiveTrackingOrderId(createdOrder.id);
        if (onOrderSuccess) onOrderSuccess(createdOrder);
      } else {
        setErrorMessage(data.message || 'Failed to place order.');
      }
    } catch (err) {
      setErrorMessage('Network error while placing order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 my-auto">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-50 text-[#06C167] flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-black text-gray-900">Secure Checkout</h2>
              <span className="text-xs text-gray-400 font-medium">{cart.restaurant.name}</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-black transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* Delivery Address & ETA */}
          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-3">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-[#06C167] flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                    Delivery Address
                  </span>
                  <span className="text-xs font-bold text-emerald-600">Standard Delivery</span>
                </div>
                <div className="text-sm font-bold text-gray-800 mt-0.5">
                  {selectedAddress.label}: {selectedAddress.address}
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-gray-200">
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                Drop-off Note / Gate Code
              </label>
              <input
                type="text"
                value={deliveryNotes}
                onChange={(e) => setDeliveryNotes(e.target.value)}
                placeholder="e.g. Leave on front porch, door code 1234"
                className="w-full text-xs px-3 py-2 bg-white rounded-xl border border-gray-200 focus:outline-none focus:border-black"
              />
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-500 pt-1">
              <Clock className="w-4 h-4 text-gray-400" />
              <span>Estimated Delivery: <strong className="text-gray-900">{cart.restaurant.deliveryTimeMinutes} minutes</strong></span>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <h3 className="text-xs font-black text-gray-800 uppercase tracking-wider mb-3">
              Select Payment Method
            </h3>

            <div className="grid grid-cols-3 gap-2.5">
              {[
                { id: 'card', label: 'Credit Card', icon: CreditCard },
                { id: 'applepay', label: 'Apple / Google Pay', icon: ShieldCheck },
                { id: 'cash', label: 'Cash on Delivery', icon: DollarSign }
              ].map((pm) => {
                const Icon = pm.icon;
                const isSelected = paymentMethod === pm.id;
                return (
                  <button
                    type="button"
                    key={pm.id}
                    onClick={() => setPaymentMethod(pm.id)}
                    className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                      isSelected
                        ? 'border-[#06C167] bg-emerald-50/40 ring-1 ring-[#06C167]'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <Icon className={`w-5 h-5 mb-2 ${isSelected ? 'text-[#06C167]' : 'text-gray-500'}`} />
                    <span className={`text-xs font-bold ${isSelected ? 'text-gray-900' : 'text-gray-700'}`}>
                      {pm.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Simulated Card input if card selected */}
            {paymentMethod === 'card' && (
              <div className="mt-3 p-4 rounded-2xl border border-gray-200 bg-gray-50/60 space-y-3">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                    Card Number
                  </label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full text-xs font-semibold px-3 py-2 rounded-xl bg-white border border-gray-200 focus:outline-none focus:border-black"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                      Expires
                    </label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      className="w-full text-xs font-semibold px-3 py-2 rounded-xl bg-white border border-gray-200 focus:outline-none focus:border-black"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                      CVC / CVV
                    </label>
                    <input
                      type="text"
                      value={cardCvc}
                      onChange={(e) => setCardCvc(e.target.value)}
                      className="w-full text-xs font-semibold px-3 py-2 rounded-xl bg-white border border-gray-200 focus:outline-none focus:border-black"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Recap */}
          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-2 text-xs text-gray-600">
            <div className="font-bold text-gray-900 mb-1 flex items-center justify-between">
              <span>Order Summary</span>
              <span>{cart.items.length} items</span>
            </div>

            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-semibold text-gray-900">${subtotal.toFixed(2)}</span>
            </div>

            <div className="flex justify-between">
              <span>Delivery Fee</span>
              <span>{deliveryFee === 0 ? 'Free' : `$${deliveryFee.toFixed(2)}`}</span>
            </div>

            {discount > 0 && (
              <div className="flex justify-between text-emerald-600 font-bold">
                <span>Discount ({promo?.code})</span>
                <span>-${discount.toFixed(2)}</span>
              </div>
            )}

            <div className="flex justify-between">
              <span>Taxes & Fees</span>
              <span>${tax.toFixed(2)}</span>
            </div>

            <div className="flex justify-between">
              <span>Courier Tip</span>
              <span>${tip.toFixed(2)}</span>
            </div>

            <div className="flex justify-between text-base font-black text-gray-900 pt-2 border-t border-gray-200">
              <span>Total to Pay</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 text-rose-600 text-xs font-semibold">
              {errorMessage}
            </div>
          )}

        </div>

        {/* Modal Footer CTA */}
        <div className="p-5 border-t border-gray-100 bg-white flex-shrink-0">
          <button
            onClick={handlePlaceOrder}
            disabled={isSubmitting}
            className="w-full py-4 px-6 rounded-2xl bg-[#06C167] hover:bg-[#05944F] disabled:opacity-50 text-white font-black text-sm flex items-center justify-between shadow-xl shadow-emerald-500/20 active:scale-[0.98] transition-all"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-yellow-300" />
              <span>{isSubmitting ? 'Placing Order...' : 'Place Order Now'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span>${total.toFixed(2)}</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </button>
        </div>

      </div>
    </div>
  );
}
