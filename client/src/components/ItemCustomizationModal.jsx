import React, { useState, useMemo } from 'react';
import { Plus, Minus, X, Check, Flame, Leaf } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function ItemCustomizationModal({ item, restaurant, onClose }) {
  const { addToCart } = useCart();

  const [quantity, setQuantity] = useState(1);
  const [specialInstructions, setSpecialInstructions] = useState('');
  
  // Selected options state:
  // e.g. { "Patty Size": { label: "Triple Patty", price: 3.50 }, "Add-ons": [ { label: "Avocado", price: 1.75 } ] }
  const [selectedOptions, setSelectedOptions] = useState(() => {
    const initial = {};
    if (item?.options) {
      item.options.forEach(opt => {
        if (!opt.multi) {
          // Default to first choice
          initial[opt.name] = opt.choices[0];
        } else {
          initial[opt.name] = [];
        }
      });
    }
    return initial;
  });

  const handleSingleOption = (optName, choice) => {
    setSelectedOptions(prev => ({
      ...prev,
      [optName]: choice
    }));
  };

  const handleMultiOption = (optName, choice) => {
    setSelectedOptions(prev => {
      const currentList = prev[optName] || [];
      const exists = currentList.some(c => c.label === choice.label);
      let updated;
      if (exists) {
        updated = currentList.filter(c => c.label !== choice.label);
      } else {
        updated = [...currentList, choice];
      }
      return { ...prev, [optName]: updated };
    });
  };

  // Calculate dynamic unit price and total price
  const unitPrice = useMemo(() => {
    if (!item) return 0;
    let extra = 0;
    Object.values(selectedOptions).forEach(val => {
      if (Array.isArray(val)) {
        val.forEach(v => { extra += (v.price || 0); });
      } else if (val && val.price) {
        extra += val.price;
      }
    });
    return item.price + extra;
  }, [item, selectedOptions]);

  const totalPrice = unitPrice * quantity;

  const handleAdd = () => {
    addToCart(restaurant, item, selectedOptions, quantity, specialInstructions);
    onClose();
  };

  if (!item) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 my-auto">
        
        {/* Header with image */}
        <div className="relative h-56 sm:h-64 w-full bg-gray-100 flex-shrink-0">
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover"
          />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center backdrop-blur-md transition-all shadow-md active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable details and options */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Title & Description */}
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              {item.isPopular && (
                <span className="text-[10px] font-black uppercase text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                  ★ Bestseller
                </span>
              )}
              {item.isVegetarian && (
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-0.5">
                  <Leaf className="w-2.5 h-2.5" /> Vegetarian
                </span>
              )}
              {item.isSpicy && (
                <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md flex items-center gap-0.5">
                  <Flame className="w-2.5 h-2.5" /> Spicy
                </span>
              )}
            </div>

            <h2 className="text-2xl font-black text-gray-900 leading-tight">
              {item.name}
            </h2>
            <div className="flex items-center gap-3 mt-1 text-sm font-semibold text-gray-700">
              <span className="text-emerald-600 font-extrabold text-base">
                ${item.price.toFixed(2)}
              </span>
              {item.calories && (
                <span className="text-gray-400 font-medium text-xs">
                  • {item.calories} Calories
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-2 leading-relaxed">
              {item.description}
            </p>
          </div>

          {/* Customization Options */}
          {item.options && item.options.length > 0 && (
            <div className="space-y-6 pt-2 border-t border-gray-100">
              {item.options.map((opt) => (
                <div key={opt.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider text-gray-800">
                      {opt.name}
                    </span>
                    <span className="text-[10px] font-semibold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                      {opt.required ? 'Required (Choose 1)' : opt.multi ? 'Optional (Choose any)' : 'Optional'}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    {opt.choices.map((choice) => {
                      const isSelected = opt.multi
                        ? (selectedOptions[opt.name] || []).some(c => c.label === choice.label)
                        : selectedOptions[opt.name]?.label === choice.label;

                      return (
                        <div
                          key={choice.label}
                          onClick={() => opt.multi ? handleMultiOption(opt.name, choice) : handleSingleOption(opt.name, choice)}
                          className={`flex items-center justify-between p-3 rounded-2xl border cursor-pointer transition-all ${
                            isSelected
                              ? 'border-[#06C167] bg-emerald-50/50 shadow-sm'
                              : 'border-gray-200 hover:border-gray-300 bg-white'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded-${opt.multi ? 'md' : 'full'} border flex items-center justify-center transition-all ${
                              isSelected ? 'bg-[#06C167] border-[#06C167] text-white' : 'border-gray-300 bg-white'
                            }`}>
                              {isSelected && <Check className="w-3.5 h-3.5" />}
                            </div>
                            <span className="text-xs font-semibold text-gray-800">
                              {choice.label}
                            </span>
                          </div>

                          <span className="text-xs font-bold text-gray-600">
                            {choice.price > 0 ? `+$${choice.price.toFixed(2)}` : 'Free'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Special Instructions */}
          <div className="pt-2 border-t border-gray-100">
            <label className="block text-xs font-black uppercase tracking-wider text-gray-800 mb-1.5">
              Special Instructions
            </label>
            <textarea
              rows={2}
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              placeholder="e.g. Extra napkins, dressing on the side, no onions..."
              className="w-full text-xs p-3 rounded-2xl border border-gray-200 focus:border-black focus:outline-none resize-none"
            />
          </div>
        </div>

        {/* Footer Action Bar */}
        <div className="p-4 sm:p-6 bg-white border-t border-gray-100 flex items-center gap-4 flex-shrink-0">
          {/* Quantity Stepper */}
          <div className="flex items-center gap-2 bg-gray-100 p-1.5 rounded-2xl">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1}
              className="w-8 h-8 rounded-xl bg-white hover:bg-gray-200 disabled:opacity-30 disabled:hover:bg-white text-gray-800 flex items-center justify-center transition-colors shadow-sm"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-8 text-center text-sm font-black text-gray-900">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="w-8 h-8 rounded-xl bg-white hover:bg-gray-200 text-gray-800 flex items-center justify-center transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Add to Cart CTA */}
          <button
            onClick={handleAdd}
            className="flex-1 py-3.5 px-6 rounded-2xl bg-[#06C167] hover:bg-[#05944F] text-white font-extrabold text-sm flex items-center justify-between shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-all"
          >
            <span>Add to Order</span>
            <span>${totalPrice.toFixed(2)}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
