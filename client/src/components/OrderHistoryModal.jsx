import React, { useState, useEffect } from 'react';
import { X, Clock, ShoppingBag, ArrowRight, CheckCircle2, RotateCcw } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function OrderHistoryModal({ isOpen, onClose, onTrackOrder, onSelectRestaurant }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart, clearCart } = useCart();

  useEffect(() => {
    if (isOpen) {
      fetch('/api/orders')
        .then(res => res.json())
        .then(data => {
          if (data.success && data.data) {
            setOrders(data.data);
          }
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  const handleReorder = async (order) => {
    try {
      // Fetch full restaurant
      const res = await fetch(`/api/restaurants/${order.restaurantId}`);
      const data = await res.json();
      if (data.success && data.data) {
        const restaurant = data.data;
        clearCart();
        order.items.forEach(item => {
          addToCart(restaurant, item, item.selectedOptions || {}, item.quantity, item.specialInstructions || '');
        });
        onClose();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl flex flex-col max-h-[85vh] animate-in zoom-in-95">
        <div className="flex justify-between items-center mb-5 pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#06C167]" />
            <h2 className="text-lg font-black text-gray-900">Your Orders & Receipts</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:text-black">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Orders list */}
        <div className="overflow-y-auto space-y-4 flex-1">
          {orders.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-xs">
              <ShoppingBag className="w-10 h-10 mx-auto mb-2 text-gray-300" />
              You haven't placed any orders yet.
            </div>
          ) : (
            orders.map(order => (
              <div key={order.id} className="p-4 rounded-2xl border border-gray-100 hover:border-gray-200 bg-gray-50/50 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-extrabold text-sm text-gray-900">{order.restaurantName}</h3>
                    <div className="text-[11px] text-gray-400 mt-0.5">
                      {order.id} • {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  <span className="font-black text-sm text-gray-900">${order.total.toFixed(2)}</span>
                </div>

                {/* Items */}
                <div className="text-xs text-gray-600 line-clamp-2">
                  {order.items?.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                </div>

                {/* Action buttons */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                    order.status === 'delivered' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {order.status.replace('_', ' ')}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        onClose();
                        onTrackOrder(order.id);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-black text-white hover:bg-gray-800 font-bold text-xs"
                    >
                      Track Order
                    </button>
                    <button
                      onClick={() => handleReorder(order)}
                      className="px-3 py-1.5 rounded-xl border border-gray-200 text-gray-700 hover:border-black font-bold text-xs flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" /> Reorder
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
