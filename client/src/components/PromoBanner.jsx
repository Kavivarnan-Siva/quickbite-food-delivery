import React, { useState } from 'react';
import { Tag, Sparkles, Check, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function PromoBanner({ promos }) {
  const { setPromo, setIsCartOpen } = useCart();
  const [copiedCode, setCopiedCode] = useState(null);

  const handleApplyPromo = (p) => {
    setPromo({
      code: p.code,
      type: p.type,
      value: p.value,
      maxDiscount: p.maxDiscount,
      minOrder: p.minOrder,
      valid: true,
      message: `Coupon applied: ${p.description}`
    });
    setCopiedCode(p.code);
    setIsCartOpen(true);
    setTimeout(() => setCopiedCode(null), 3000);
  };

  if (!promos || promos.length === 0) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-600 via-[#06C167] to-teal-700 text-white p-6 shadow-xl">
        {/* Background glow graphics */}
        <div className="absolute -right-10 -bottom-10 w-60 h-60 rounded-full bg-white/10 blur-2xl pointer-events-none"></div>
        <div className="absolute right-20 top-2 text-white/10 font-black text-8xl select-none pointer-events-none">
          YUM
        </div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/20 text-xs font-semibold tracking-wide uppercase mb-2">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" /> Today's Exclusive Deals
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              Hungry? Save up to 20% on Top Restaurants!
            </h2>
            <p className="text-emerald-100 text-sm mt-1 max-w-xl">
              Tap any coupon code below to instantly apply it to your order.
            </p>
          </div>

          {/* Promo coupons grid */}
          <div className="flex flex-wrap items-center gap-2.5">
            {promos.map((p) => {
              const isCopied = copiedCode === p.code;
              return (
                <button
                  key={p.code}
                  onClick={() => handleApplyPromo(p)}
                  className="group relative flex items-center gap-2.5 bg-white/15 hover:bg-white text-white hover:text-black backdrop-blur-md px-3.5 py-2.5 rounded-2xl border border-white/20 transition-all shadow-sm hover:shadow-lg active:scale-95 text-left"
                >
                  <Tag className="w-4 h-4 text-yellow-300 group-hover:text-emerald-600" />
                  <div>
                    <div className="text-xs font-black tracking-wider uppercase flex items-center gap-1">
                      {p.code}
                      {isCopied ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      )}
                    </div>
                    <div className="text-[10px] text-emerald-100 group-hover:text-gray-600 font-medium">
                      {p.description}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
