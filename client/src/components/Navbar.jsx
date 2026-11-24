import React, { useState } from 'react';
import { 
  ShoppingBag, 
  MapPin, 
  Search, 
  Heart, 
  Clock, 
  ChevronDown, 
  Store, 
  Bike, 
  User, 
  Plus, 
  Check,
  UtensilsCrossed
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ 
  searchQuery, 
  setSearchQuery, 
  onOpenHistory,
  onOpenFavorites,
  onSelectRestaurant
}) {
  const { cart, itemCount, subtotal, setIsCartOpen } = useCart();
  const { 
    addresses, 
    selectedAddress, 
    setSelectedAddress, 
    addAddress, 
    favorites, 
    viewMode, 
    setViewMode 
  } = useAuth();

  const [isAddressDropdownOpen, setIsAddressDropdownOpen] = useState(false);
  const [showAddAddressModal, setShowAddAddressModal] = useState(false);
  const [newAddrLabel, setNewAddrLabel] = useState('Other');
  const [newAddrText, setNewAddrText] = useState('');
  const [newAddrNotes, setNewAddrNotes] = useState('');
  const [deliveryType, setDeliveryType] = useState('delivery'); // 'delivery' | 'pickup'

  const handleAddNewAddress = (e) => {
    e.preventDefault();
    if (!newAddrText.trim()) return;
    addAddress({
      label: newAddrLabel,
      address: newAddrText.trim(),
      instructions: newAddrNotes.trim() || 'Leave at front door'
    });
    setNewAddrText('');
    setNewAddrNotes('');
    setShowAddAddressModal(false);
    setIsAddressDropdownOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 gap-4">
            
            {/* Logo & Delivery Toggle */}
            <div className="flex items-center gap-6">
              <button 
                onClick={() => { setViewMode('customer'); onSelectRestaurant(null); }}
                className="flex items-center gap-2 group text-left"
              >
                <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
                  <span className="font-black text-xl text-[#06C167]">Q</span>
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <span className="text-2xl font-black tracking-tight text-black">Quick<span className="text-[#06C167]">Bite</span></span>
                  </div>
                  <span className="text-[10px] tracking-widest uppercase font-semibold text-gray-400">Food Delivery</span>
                </div>
              </button>

              {/* Delivery / Pickup pills */}
              <div className="hidden md:flex bg-gray-100 p-1 rounded-full text-xs font-semibold">
                <button
                  onClick={() => setDeliveryType('delivery')}
                  className={`px-4 py-2 rounded-full transition-all ${
                    deliveryType === 'delivery' 
                      ? 'bg-black text-white shadow-sm' 
                      : 'text-gray-600 hover:text-black'
                  }`}
                >
                  Delivery
                </button>
                <button
                  onClick={() => setDeliveryType('pickup')}
                  className={`px-4 py-2 rounded-full transition-all ${
                    deliveryType === 'pickup' 
                      ? 'bg-black text-white shadow-sm' 
                      : 'text-gray-600 hover:text-black'
                  }`}
                >
                  Pickup
                </button>
              </div>
            </div>

            {/* Address Selector */}
            <div className="relative hidden lg:block">
              <button 
                onClick={() => setIsAddressDropdownOpen(!isAddressDropdownOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-full hover:bg-gray-100 transition-colors text-left text-sm"
              >
                <div className="w-8 h-8 rounded-full bg-emerald-50 text-[#06C167] flex items-center justify-center">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                    Deliver to <ChevronDown className="w-3 h-3" />
                  </div>
                  <div className="font-semibold text-gray-800 text-xs truncate max-w-[200px]">
                    {selectedAddress.label}: {selectedAddress.address}
                  </div>
                </div>
              </button>

              {/* Address dropdown */}
              {isAddressDropdownOpen && (
                <div className="absolute left-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 p-3 z-50 animate-in fade-in zoom-in-95">
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-wider px-2 py-1">Saved Addresses</div>
                  <div className="space-y-1 mt-1">
                    {addresses.map((addr) => (
                      <button
                        key={addr.id}
                        onClick={() => {
                          setSelectedAddress(addr);
                          setIsAddressDropdownOpen(false);
                        }}
                        className={`w-full text-left p-2.5 rounded-xl flex items-start gap-3 transition-colors ${
                          selectedAddress.id === addr.id ? 'bg-emerald-50 text-emerald-950 font-medium' : 'hover:bg-gray-50'
                        }`}
                      >
                        <MapPin className={`w-4 h-4 mt-0.5 flex-shrink-0 ${selectedAddress.id === addr.id ? 'text-[#06C167]' : 'text-gray-400'}`} />
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold">{addr.label}</div>
                          <div className="text-xs text-gray-500 truncate">{addr.address}</div>
                        </div>
                        {selectedAddress.id === addr.id && <Check className="w-4 h-4 text-[#06C167] mt-0.5" />}
                      </button>
                    ))}
                  </div>

                  <div className="border-t border-gray-100 mt-2 pt-2">
                    <button
                      onClick={() => {
                        setShowAddAddressModal(true);
                        setIsAddressDropdownOpen(false);
                      }}
                      className="w-full text-xs font-semibold text-[#06C167] hover:text-[#05944F] flex items-center justify-center gap-1.5 py-2 hover:bg-emerald-50 rounded-xl transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add New Address
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Search Input */}
            <div className="flex-1 max-w-md relative hidden sm:block">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Food, groceries, drinks, burgers, sushi..."
                className="w-full bg-[#F3F4F6] text-gray-900 text-sm pl-10 pr-4 py-2.5 rounded-full border border-transparent focus:bg-white focus:border-gray-300 focus:outline-none transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600 bg-gray-200 hover:bg-gray-300 rounded-full w-5 h-5 flex items-center justify-center"
                >
                  ✕
                </button>
              )}
            </div>

            {/* View Mode Switcher & Actions */}
            <div className="flex items-center gap-3">
              {/* App Role Switcher (Customer / Partner / Courier) */}
              <div className="flex items-center bg-gray-100 p-1 rounded-xl text-xs font-medium">
                <button
                  onClick={() => { setViewMode('customer'); onSelectRestaurant(null); }}
                  title="Customer Food Ordering View"
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all ${
                    viewMode === 'customer' ? 'bg-white text-black shadow-sm font-semibold' : 'text-gray-500 hover:text-black'
                  }`}
                >
                  <UtensilsCrossed className="w-3.5 h-3.5" />
                  <span className="hidden xl:inline">Order</span>
                </button>
                <button
                  onClick={() => setViewMode('partner')}
                  title="Restaurant Partner Dashboard"
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all ${
                    viewMode === 'partner' ? 'bg-white text-emerald-700 shadow-sm font-semibold' : 'text-gray-500 hover:text-emerald-700'
                  }`}
                >
                  <Store className="w-3.5 h-3.5 text-[#06C167]" />
                  <span className="hidden xl:inline">Partner</span>
                </button>
                <button
                  onClick={() => setViewMode('driver')}
                  title="Courier Driver Simulation"
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all ${
                    viewMode === 'driver' ? 'bg-white text-indigo-700 shadow-sm font-semibold' : 'text-gray-500 hover:text-indigo-700'
                  }`}
                >
                  <Bike className="w-3.5 h-3.5 text-indigo-600" />
                  <span className="hidden xl:inline">Driver</span>
                </button>
              </div>

              {/* Favorites button */}
              <button
                onClick={onOpenFavorites}
                className="relative p-2.5 rounded-full hover:bg-gray-100 text-gray-600 transition-colors"
                title="Saved Favorite Restaurants"
              >
                <Heart className="w-5 h-5" />
                {favorites.length > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {favorites.length}
                  </span>
                )}
              </button>

              {/* Order History */}
              <button
                onClick={onOpenHistory}
                className="p-2.5 rounded-full hover:bg-gray-100 text-gray-600 transition-colors"
                title="Past Orders & Receipts"
              >
                <Clock className="w-5 h-5" />
              </button>

              {/* Cart Button */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="flex items-center gap-2 bg-black hover:bg-gray-800 text-white px-4 py-2.5 rounded-full font-semibold text-sm transition-all shadow-md hover:shadow-lg active:scale-95"
              >
                <ShoppingBag className="w-4 h-4 text-[#06C167]" />
                <span>{itemCount}</span>
                {itemCount > 0 && (
                  <span className="hidden sm:inline border-l border-gray-700 pl-2 text-xs text-gray-300">
                    ${subtotal.toFixed(2)}
                  </span>
                )}
              </button>
            </div>

          </div>

          {/* Mobile search input */}
          <div className="pb-3 sm:hidden">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search food, restaurants, dishes..."
                className="w-full bg-[#F3F4F6] text-gray-900 text-sm pl-9 pr-4 py-2 rounded-full border border-transparent focus:bg-white focus:border-gray-300 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Add Address Modal */}
      {showAddAddressModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#06C167]" /> Add New Delivery Address
              </h3>
              <button 
                onClick={() => setShowAddAddressModal(false)}
                className="text-gray-400 hover:text-gray-600 w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddNewAddress} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Address Label
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['Home', 'Work', 'Other'].map(lbl => (
                    <button
                      type="button"
                      key={lbl}
                      onClick={() => setNewAddrLabel(lbl)}
                      className={`py-2 text-xs font-semibold rounded-xl border transition-all ${
                        newAddrLabel === lbl 
                          ? 'border-black bg-black text-white' 
                          : 'border-gray-200 text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {lbl}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Street Address & Apt / Suite
                </label>
                <input
                  type="text"
                  required
                  value={newAddrText}
                  onChange={(e) => setNewAddrText(e.target.value)}
                  placeholder="e.g. 1024 Ocean Ave, Apt 3A"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-black focus:outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Drop-off Instructions (Optional)
                </label>
                <input
                  type="text"
                  value={newAddrNotes}
                  onChange={(e) => setNewAddrNotes(e.target.value)}
                  placeholder="e.g. Ring buzzer 42, leave with receptionist"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-black focus:outline-none text-sm"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddAddressModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#06C167] hover:bg-[#05944F] text-white font-semibold text-sm shadow-md"
                >
                  Save Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
