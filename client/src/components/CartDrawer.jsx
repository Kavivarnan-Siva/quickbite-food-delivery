import React, { useState } from 'react';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  Tag, 
  ArrowRight, 
  ShoppingBag, 
  AlertCircle,
  CheckCircle2,
  Percent,
  Bike
} from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function CartDrawer({ onOpenCheckout }) {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeItem,
    clearCart,
    subtotal,
    deliveryFee,
    tax,
    tip,
    tipRate,
    setTipRate,
    customTip,
    setCustomTip,
    discount,
    total,
    itemCount,
    promo,
    setPromo,
    restaurantConflict,
    resolveConflict
  } = useCart();

  const [promoInput, setPromoInput] = useState('');
  const [promoError, setPromoError] = useState('');
  const [isValidatingPromo, setIsValidatingPromo] = useState(false);
  const [showCustomTipInput, setShowCustomTipInput] = useState(false);

  const handleApplyPromoCode = async (e) => {
    e.preventDefault();
    if (!promoInput.trim()) return;

    setIsValidatingPromo(true);
    setPromoError('');

    try {
      const res = await fetch('/api/promos/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: promoInput.trim(),
          subtotal,
          deliveryFee
        })
      });
      const data = await res.json();

      if (data.valid) {
        setPromo({
          code: data.promo.code,
          type: data.promo.type,
          value: data.promo.value,
          maxDiscount: data.promo.maxDiscount,
          minOrder: data.promo.minOrder,
          valid: true,
          message: data.message
        });
        setPromoInput('');
      } else {
        setPromoError(data.message || 'Invalid promotion code');
      }
    } catch (err) {
      setPromoError('Failed to validate promo code. Please try again.');
    } finally {
      setIsValidatingPromo(false);
    }
  };

  if (!isCartOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        onClick={() => setIsCartOpen(false)}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity"
      ></div>

      {/* Slide-out Drawer */}
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#06C167]" />
            <h2 className="text-lg font-black text-gray-900">Your Cart</h2>
            <span className="text-xs bg-gray-100 font-bold px-2 py-0.5 rounded-full text-gray-700">
              {itemCount} {itemCount === 1 ? 'item' : 'items'}
            </span>
          </div>

          <button
            onClick={() => setIsCartOpen(false)}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-black transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Conflict Warning Modal if attempting to mix restaurants */}
        {restaurantConflict && (
          <div className="p-4 bg-amber-50 border-b border-amber-200">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-amber-900">
                <div className="font-bold mb-1">Create new order?</div>
                Your cart currently contains items from <span className="font-bold">{cart.restaurant?.name}</span>. Adding items from <span className="font-bold">{restaurantConflict.pendingRestaurant?.name}</span> will clear your current cart.
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => resolveConflict(false)}
                    className="px-3 py-1 bg-white border border-amber-300 rounded-lg font-bold text-amber-800"
                  >
                    Keep Current Cart
                  </button>
                  <button
                    onClick={() => resolveConflict(true)}
                    className="px-3 py-1 bg-amber-600 text-white rounded-lg font-bold"
                  >
                    Start New Cart
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Body Content */}
        {cart.items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 mb-4">
              <ShoppingBag className="w-9 h-9" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Your cart is empty</h3>
            <p className="text-xs text-gray-500 mt-1 max-w-xs">
              Explore our top-rated restaurants and add delicious dishes to get started!
            </p>
            <button
              onClick={() => setIsCartOpen(false)}
              className="mt-6 px-6 py-2.5 rounded-full bg-black text-white font-bold text-xs hover:bg-gray-800 transition-colors"
            >
              Start Exploring
            </button>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-6">
            
            {/* Restaurant header */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Ordering from</span>
                <div className="font-black text-sm text-gray-900">{cart.restaurant?.name}</div>
              </div>
              <button
                onClick={clearCart}
                className="text-xs text-rose-500 hover:text-rose-700 font-semibold flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" /> Clear
              </button>
            </div>

            {/* Items list */}
            <div className="space-y-4">
              {cart.items.map((item) => (
                <div key={item.cartItemId} className="flex gap-3 pb-4 border-b border-gray-50">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 rounded-xl object-cover flex-shrink-0 bg-gray-100"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <h4 className="text-xs font-bold text-gray-900 leading-snug line-clamp-1">
                        {item.name}
                      </h4>
                      <span className="text-xs font-extrabold text-gray-900">
                        ${(item.unitPrice * item.quantity).toFixed(2)}
                      </span>
                    </div>

                    {/* Selected Options summary */}
                    {item.selectedOptions && Object.keys(item.selectedOptions).length > 0 && (
                      <div className="text-[10px] text-gray-500 mt-0.5 space-y-0.5">
                        {Object.entries(item.selectedOptions).map(([k, v]) => {
                          if (Array.isArray(v) && v.length > 0) {
                            return <div key={k}>{k}: {v.map(x => x.label).join(', ')}</div>;
                          } else if (v && v.label) {
                            return <div key={k}>{k}: {v.label}</div>;
                          }
                          return null;
                        })}
                      </div>
                    )}

                    {item.specialInstructions && (
                      <div className="text-[10px] italic text-amber-700 mt-0.5">
                        "{item.specialInstructions}"
                      </div>
                    )}

                    {/* Stepper + Delete */}
                    <div className="flex items-center justify-between mt-2.5">
                      <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                        <button
                          onClick={() => updateQuantity(item.cartItemId, -1)}
                          className="w-6 h-6 rounded bg-white hover:bg-gray-200 text-gray-800 flex items-center justify-center text-xs font-bold shadow-sm"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-black px-1.5">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.cartItemId, 1)}
                          className="w-6 h-6 rounded bg-white hover:bg-gray-200 text-gray-800 flex items-center justify-center text-xs font-bold shadow-sm"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(item.cartItemId)}
                        className="text-gray-400 hover:text-rose-500 p-1 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Promo Code Input */}
            <div className="pt-1">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-[#06C167]" /> Promo Code
              </label>

              {promo ? (
                <div className="flex items-center justify-between p-2.5 rounded-2xl bg-emerald-50 border border-emerald-200">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#06C167]" />
                    <div>
                      <div className="text-xs font-black text-emerald-900 uppercase">{promo.code}</div>
                      <div className="text-[10px] text-emerald-700">{promo.message}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => setPromo(null)}
                    className="text-xs text-emerald-800 hover:text-rose-600 font-bold px-2 py-1"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyPromoCode} className="space-y-1">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                      placeholder="e.g. TASTY20, FREEDEL"
                      className="flex-1 uppercase font-semibold text-xs px-3 py-2 rounded-xl border border-gray-200 focus:border-black focus:outline-none"
                    />
                    <button
                      type="submit"
                      disabled={isValidatingPromo || !promoInput.trim()}
                      className="px-4 py-2 bg-black hover:bg-gray-800 text-white font-bold text-xs rounded-xl disabled:opacity-40 transition-colors"
                    >
                      {isValidatingPromo ? 'Checking...' : 'Apply'}
                    </button>
                  </div>
                  {promoError && (
                    <div className="text-[10px] text-rose-500 font-semibold flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3 h-3" /> {promoError}
                    </div>
                  )}
                </form>
              )}
            </div>

            {/* Courier Tip Options */}
            <div className="pt-2 border-t border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Driver Tip
                </span>
                <span className="text-xs font-bold text-gray-900">${tip.toFixed(2)}</span>
              </div>
              
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { label: '10%', rate: 0.10 },
                  { label: '15%', rate: 0.15 },
                  { label: '20%', rate: 0.20 },
                  { label: 'Custom', rate: null }
                ].map((t) => {
                  const isSelected = t.rate !== null 
                    ? (customTip === null && tipRate === t.rate) 
                    : (customTip !== null || showCustomTipInput);

                  return (
                    <button
                      type="button"
                      key={t.label}
                      onClick={() => {
                        if (t.rate !== null) {
                          setCustomTip(null);
                          setShowCustomTipInput(false);
                          setTipRate(t.rate);
                        } else {
                          setShowCustomTipInput(true);
                        }
                      }}
                      className={`py-1.5 text-xs font-bold rounded-xl border transition-all ${
                        isSelected 
                          ? 'bg-black text-white border-black' 
                          : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {t.label}
                    </button>
                  );
                })}
              </div>

              {showCustomTipInput && (
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-500">$</span>
                  <input
                    type="number"
                    min="0"
                    step="0.50"
                    placeholder="Enter custom tip"
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setCustomTip(isNaN(val) ? 0 : val);
                    }}
                    className="w-full text-xs px-3 py-1.5 rounded-xl border border-gray-200 focus:outline-none focus:border-black font-semibold"
                  />
                </div>
              )}
            </div>

            {/* Cost Breakdown */}
            <div className="pt-4 border-t border-gray-100 space-y-2 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-gray-900">${subtotal.toFixed(2)}</span>
              </div>

              <div className="flex justify-between">
                <span>Delivery Fee</span>
                {deliveryFee === 0 ? (
                  <span className="text-[#06C167] font-bold">Free</span>
                ) : (
                  <span className="font-semibold text-gray-900">${deliveryFee.toFixed(2)}</span>
                )}
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Promotion Discount</span>
                  <span>-${discount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Estimated Taxes (8.25%)</span>
                <span className="font-semibold text-gray-900">${tax.toFixed(2)}</span>
              </div>

              <div className="flex justify-between">
                <span>Courier Tip</span>
                <span className="font-semibold text-gray-900">${tip.toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-base font-black text-gray-900 pt-3 border-t border-gray-200">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

          </div>
        )}

        {/* Footer Checkout CTA */}
        {cart.items.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-gray-100 bg-white">
            <button
              onClick={() => {
                setIsCartOpen(false);
                onOpenCheckout();
              }}
              className="w-full py-4 px-6 rounded-2xl bg-[#06C167] hover:bg-[#05944F] text-white font-black text-sm flex items-center justify-between shadow-xl shadow-emerald-500/20 active:scale-[0.98] transition-all"
            >
              <span>Go to Checkout</span>
              <div className="flex items-center gap-1.5">
                <span>${total.toFixed(2)}</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </button>
          </div>
        )}

      </div>
    </>
  );
}
