import React, { useState, useEffect } from 'react';
import { 
  Store, 
  DollarSign, 
  ShoppingBag, 
  Clock, 
  Plus, 
  Check, 
  AlertCircle, 
  Power,
  UtensilsCrossed,
  ChefHat,
  TrendingUp,
  X
} from 'lucide-react';

export default function PartnerDashboard() {
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState('');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'menu' | 'stats'
  
  // Add dish modal
  const [showAddDishModal, setShowAddDishModal] = useState(false);
  const [newDishName, setNewDishName] = useState('');
  const [newDishPrice, setNewDishPrice] = useState('');
  const [newDishCategory, setNewDishCategory] = useState('Burgers');
  const [newDishDesc, setNewDishDesc] = useState('');
  const [newDishImage, setNewDishImage] = useState('https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&q=80');

  const fetchInitialData = async () => {
    try {
      const [rRes, oRes] = await Promise.all([
        fetch('/api/restaurants'),
        fetch('/api/orders')
      ]);
      const rData = await rRes.json();
      const oData = await oRes.json();

      if (rData.success && rData.data) {
        setRestaurants(rData.data);
        if (!selectedRestaurantId && rData.data.length > 0) {
          setSelectedRestaurantId(rData.data[0].id);
        }
      }
      if (oData.success && oData.data) {
        setOrders(oData.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
    const interval = setInterval(fetchInitialData, 5000);
    return () => clearInterval(interval);
  }, []);

  const currentRestaurant = restaurants.find(r => r.id === selectedRestaurantId);
  const restaurantOrders = orders.filter(o => o.restaurantId === selectedRestaurantId);

  // Toggle restaurant open/close
  const toggleStoreStatus = async () => {
    if (!currentRestaurant) return;
    try {
      const newStatus = !currentRestaurant.isOpen;
      const res = await fetch(`/api/restaurants/${currentRestaurant.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isOpen: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        setRestaurants(prev => prev.map(r => r.id === currentRestaurant.id ? { ...r, isOpen: newStatus } : r));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Update order status from restaurant perspective
  const handleUpdateOrderStatus = async (orderId, nextStatus) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      });
      const data = await res.json();
      if (data.success) {
        setOrders(prev => prev.map(o => o.id === orderId ? data.data : o));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Add dish to menu
  const handleAddDish = async (e) => {
    e.preventDefault();
    if (!newDishName || !newDishPrice) return;

    try {
      const payload = {
        name: newDishName,
        price: parseFloat(newDishPrice),
        category: newDishCategory,
        description: newDishDesc,
        image: newDishImage,
        isPopular: true
      };

      const res = await fetch(`/api/restaurants/${currentRestaurant.id}/menu`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        fetchInitialData();
        setShowAddDishModal(false);
        setNewDishName('');
        setNewDishPrice('');
        setNewDishDesc('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Calculate analytics
  const totalSales = restaurantOrders.reduce((sum, o) => sum + (o.subtotal || 0), 0);
  const activeOrdersCount = restaurantOrders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled').length;
  const avgOrderValue = restaurantOrders.length > 0 ? (totalSales / restaurantOrders.length) : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Banner & Restaurant Switcher */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-black text-[#06C167] flex items-center justify-center font-black text-2xl shadow-md">
            <Store className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                Restaurant Partner Portal
              </span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                currentRestaurant?.isOpen ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
              }`}>
                {currentRestaurant?.isOpen ? 'Store Active (Accepting Orders)' : 'Store Paused'}
              </span>
            </div>
            <h1 className="text-2xl font-black text-gray-900 mt-1">
              {currentRestaurant?.name || 'Restaurant Dashboard'}
            </h1>
          </div>
        </div>

        {/* Store Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Restaurant Selector */}
          <select
            value={selectedRestaurantId}
            onChange={(e) => setSelectedRestaurantId(e.target.value)}
            className="text-xs font-bold bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-gray-800 focus:outline-none"
          >
            {restaurants.map(r => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>

          {/* Toggle Store Status */}
          <button
            onClick={toggleStoreStatus}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-colors shadow-sm ${
              currentRestaurant?.isOpen
                ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                : 'bg-emerald-600 text-white hover:bg-emerald-700'
            }`}
          >
            <Power className="w-4 h-4" />
            <span>{currentRestaurant?.isOpen ? 'Pause Orders' : 'Go Online'}</span>
          </button>
        </div>
      </div>

      {/* Analytics KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Sales Today</span>
            <div className="text-2xl font-black text-gray-900 mt-1">${totalSales.toFixed(2)}</div>
            <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3" /> +18.4% from yesterday
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#06C167] flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Active Live Orders</span>
            <div className="text-2xl font-black text-gray-900 mt-1">{activeOrdersCount}</div>
            <span className="text-[10px] text-gray-500 font-medium mt-1">Requiring kitchen attention</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Average Ticket</span>
            <div className="text-2xl font-black text-gray-900 mt-1">${avgOrderValue.toFixed(2)}</div>
            <span className="text-[10px] text-gray-500 font-medium mt-1">Per completed order</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <ChefHat className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Tabs: Orders / Menu */}
      <div className="flex items-center gap-3 border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 text-sm font-bold border-b-2 transition-all ${
            activeTab === 'orders'
              ? 'border-black text-black'
              : 'border-transparent text-gray-400 hover:text-black'
          }`}
        >
          Live Kitchen Orders ({restaurantOrders.length})
        </button>
        <button
          onClick={() => setActiveTab('menu')}
          className={`pb-3 text-sm font-bold border-b-2 transition-all ${
            activeTab === 'menu'
              ? 'border-black text-black'
              : 'border-transparent text-gray-400 hover:text-black'
          }`}
        >
          Menu Management ({currentRestaurant?.menu?.length || 0} items)
        </button>
      </div>

      {/* Tab 1: Orders */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {restaurantOrders.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-gray-100 p-8">
              <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-gray-800">No Orders Yet for this Restaurant</h3>
              <p className="text-xs text-gray-400 mt-1">
                Switch to the "Order" tab to place an order from {currentRestaurant?.name} and watch it arrive here in real-time!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {restaurantOrders.map((ord) => (
                <div key={ord.id} className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-gray-900">{ord.id}</span>
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          ord.status === 'confirmed' ? 'bg-amber-100 text-amber-800' :
                          ord.status === 'preparing' ? 'bg-blue-100 text-blue-800' :
                          ord.status === 'on_the_way' ? 'bg-indigo-100 text-indigo-800' :
                          'bg-emerald-100 text-emerald-800'
                        }`}>
                          {ord.status.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        Customer: <strong className="text-gray-800">{ord.customerName}</strong> ({ord.customerPhone})
                      </div>
                    </div>
                    <span className="text-base font-black text-gray-900">${ord.total.toFixed(2)}</span>
                  </div>

                  {/* Items */}
                  <div className="p-3 rounded-2xl bg-gray-50 text-xs space-y-1">
                    {ord.items.map((it, idx) => (
                      <div key={idx} className="flex justify-between">
                        <span className="font-semibold text-gray-800">{it.quantity}x {it.name}</span>
                        <span className="text-gray-500">${(it.unitPrice * it.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  {/* Actions for kitchen */}
                  <div className="pt-2 flex items-center gap-2">
                    {ord.status === 'confirmed' && (
                      <button
                        onClick={() => handleUpdateOrderStatus(ord.id, 'preparing')}
                        className="flex-1 py-2 bg-black text-white hover:bg-gray-800 rounded-xl font-bold text-xs"
                      >
                        Accept & Start Cooking
                      </button>
                    )}
                    {ord.status === 'preparing' && (
                      <button
                        onClick={() => handleUpdateOrderStatus(ord.id, 'on_the_way')}
                        className="flex-1 py-2 bg-[#06C167] text-white hover:bg-[#05944F] rounded-xl font-bold text-xs"
                      >
                        Ready for Driver Pickup
                      </button>
                    )}
                    {ord.status === 'on_the_way' && (
                      <button
                        onClick={() => handleUpdateOrderStatus(ord.id, 'delivered')}
                        className="flex-1 py-2 bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl font-bold text-xs"
                      >
                        Mark as Delivered
                      </button>
                    )}
                    {ord.status === 'delivered' && (
                      <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                        <Check className="w-4 h-4" /> Order Completed & Delivered
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Menu Management */}
      {activeTab === 'menu' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-base text-gray-900">Current Dishes</h3>
            <button
              onClick={() => setShowAddDishModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-black hover:bg-gray-800 text-white rounded-xl text-xs font-bold shadow-md"
            >
              <Plus className="w-4 h-4 text-[#06C167]" /> Add New Dish
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentRestaurant?.menu?.map(dish => (
              <div key={dish.id} className="bg-white rounded-3xl p-4 border border-gray-100 shadow-sm flex gap-3">
                <img src={dish.image} alt={dish.name} className="w-20 h-20 rounded-2xl object-cover bg-gray-100" />
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-gray-900 line-clamp-1">{dish.name}</h4>
                    <span className="text-xs font-black text-emerald-600">${dish.price.toFixed(2)}</span>
                    <p className="text-[11px] text-gray-400 line-clamp-2 mt-0.5">{dish.description}</p>
                  </div>
                  <span className="text-[10px] text-gray-500 font-semibold uppercase">{dish.category}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Dish Modal */}
      {showAddDishModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Plus className="w-5 h-5 text-[#06C167]" /> Add Dish to {currentRestaurant?.name}
              </h3>
              <button onClick={() => setShowAddDishModal(false)} className="text-gray-400 hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddDish} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Dish Name</label>
                <input
                  type="text"
                  required
                  value={newDishName}
                  onChange={(e) => setNewDishName(e.target.value)}
                  placeholder="e.g. Truffle Bacon Avocado Burger"
                  className="w-full text-xs px-3.5 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-black"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={newDishPrice}
                    onChange={(e) => setNewDishPrice(e.target.value)}
                    placeholder="14.99"
                    className="w-full text-xs px-3.5 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-black font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Category</label>
                  <input
                    type="text"
                    value={newDishCategory}
                    onChange={(e) => setNewDishCategory(e.target.value)}
                    placeholder="Mains, Burgers, Drinks"
                    className="w-full text-xs px-3.5 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-black"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Description</label>
                <textarea
                  rows={2}
                  value={newDishDesc}
                  onChange={(e) => setNewDishDesc(e.target.value)}
                  placeholder="Ingredients, preparation, flavor notes..."
                  className="w-full text-xs p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-black resize-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Image URL</label>
                <input
                  type="url"
                  value={newDishImage}
                  onChange={(e) => setNewDishImage(e.target.value)}
                  className="w-full text-xs px-3.5 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-black text-gray-600"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddDishModal(false)}
                  className="flex-1 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-[#06C167] text-white text-xs font-bold shadow-md"
                >
                  Add Dish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
