import React, { useState, useMemo } from 'react';
import { 
  ArrowLeft, 
  Star, 
  Clock, 
  Bike, 
  MapPin, 
  Phone, 
  Search, 
  Plus, 
  Heart,
  Share2,
  Check,
  Flame,
  Leaf
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function RestaurantDetailView({ restaurant, onBack, onSelectItem }) {
  const { favorites, toggleFavorite } = useAuth();
  const [menuSearch, setMenuSearch] = useState('');
  const [selectedCategoryTab, setSelectedCategoryTab] = useState('All');
  const [copiedLink, setCopiedLink] = useState(false);

  const isFav = favorites.includes(restaurant?.id);

  const categories = useMemo(() => {
    if (!restaurant?.menu) return ['All'];
    const cats = new Set(restaurant.menu.map(item => item.category));
    return ['All', ...Array.from(cats)];
  }, [restaurant]);

  const filteredMenu = useMemo(() => {
    if (!restaurant?.menu) return [];
    return restaurant.menu.filter(item => {
      const matchesSearch = !menuSearch.trim() || 
        item.name.toLowerCase().includes(menuSearch.toLowerCase()) ||
        item.description.toLowerCase().includes(menuSearch.toLowerCase());
      
      const matchesCategory = selectedCategoryTab === 'All' || item.category === selectedCategoryTab;
      return matchesSearch && matchesCategory;
    });
  }, [restaurant, menuSearch, selectedCategoryTab]);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  if (!restaurant) return null;

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Back & Top Bar */}
      <div className="sticky top-20 z-30 bg-white/95 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm font-bold text-gray-700 hover:text-black py-1.5 px-3 rounded-full hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Stores
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="p-2.5 rounded-full hover:bg-gray-100 text-gray-600 transition-colors relative"
              title="Share Restaurant"
            >
              {copiedLink ? <Check className="w-4 h-4 text-[#06C167]" /> : <Share2 className="w-4 h-4" />}
            </button>
            <button
              onClick={() => toggleFavorite(restaurant.id)}
              className="p-2.5 rounded-full hover:bg-gray-100 text-gray-600 transition-colors"
              title="Favorite Restaurant"
            >
              <Heart className={`w-4 h-4 ${isFav ? 'fill-rose-500 text-rose-500' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Hero Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div className="relative h-64 sm:h-80 w-full rounded-3xl overflow-hidden bg-gray-100 shadow-md">
          <img
            src={restaurant.image}
            alt={restaurant.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
          
          {/* Cover Overlay Info */}
          <div className="absolute bottom-6 left-6 right-6 text-white flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                {restaurant.offer && (
                  <span className="bg-[#06C167] text-white text-xs font-black uppercase px-2.5 py-1 rounded-lg">
                    {restaurant.offer}
                  </span>
                )}
                <span className="bg-black/50 backdrop-blur-md text-white text-xs font-medium px-2.5 py-1 rounded-lg">
                  {restaurant.priceRange} • {restaurant.cuisineTags?.join(' • ')}
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white mb-2">
                {restaurant.name}
              </h1>
              <p className="text-gray-200 text-sm max-w-2xl hidden sm:block">
                {restaurant.description}
              </p>
            </div>

            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/20">
              <div className="text-center px-2">
                <div className="flex items-center justify-center gap-1 text-sm font-bold">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span>{restaurant.rating}</span>
                </div>
                <div className="text-[10px] text-gray-300 font-medium">({restaurant.reviewCount}+)</div>
              </div>
              <div className="h-7 w-px bg-white/20"></div>
              <div className="text-center px-2">
                <div className="flex items-center justify-center gap-1 text-sm font-bold">
                  <Clock className="w-4 h-4 text-emerald-400" />
                  <span>{restaurant.deliveryTimeMinutes}</span>
                </div>
                <div className="text-[10px] text-gray-300 font-medium">Mins ETA</div>
              </div>
              <div className="h-7 w-px bg-white/20"></div>
              <div className="text-center px-2">
                <div className="text-sm font-bold">
                  {restaurant.deliveryFee === 0 ? '$0' : `$${restaurant.deliveryFee.toFixed(2)}`}
                </div>
                <div className="text-[10px] text-gray-300 font-medium">Delivery</div>
              </div>
            </div>
          </div>
        </div>

        {/* Address & Meta row */}
        <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-gray-500 py-4 border-b border-gray-100">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-gray-400" />
            <span>{restaurant.address}</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5 text-gray-400" />
            <span>{restaurant.phone}</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="text-emerald-700 font-semibold">Open Now (Pickup & Delivery)</span>
          </div>
        </div>

        {/* Search within menu & Category tabs */}
        <div className="sticky top-32 z-20 bg-white py-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 border-b border-gray-100">
          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategoryTab(cat)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                  selectedCategoryTab === cat
                    ? 'bg-black text-white shadow-sm'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search inside menu */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={menuSearch}
              onChange={(e) => setMenuSearch(e.target.value)}
              placeholder="Search dishes..."
              className="w-full bg-[#F3F4F6] text-gray-900 text-xs pl-9 pr-3 py-2 rounded-full border border-transparent focus:bg-white focus:border-gray-300 focus:outline-none"
            />
          </div>
        </div>

        {/* Menu Items Grid */}
        <div className="pt-6">
          <h2 className="text-xl font-black text-gray-900 mb-4">
            {selectedCategoryTab === 'All' ? 'Featured & Full Menu' : selectedCategoryTab}
          </h2>

          {filteredMenu.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-sm">
              No dishes found matching "{menuSearch}".
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMenu.map(item => (
                <div
                  key={item.id}
                  onClick={() => onSelectItem(item)}
                  className="group cursor-pointer p-4 rounded-3xl bg-white border border-gray-100 hover:border-gray-200 hover:shadow-xl transition-all duration-300 flex flex-col justify-between gap-3 relative"
                >
                  <div className="flex gap-4 items-start">
                    <div className="flex-1 min-w-0">
                      {/* Dietary / Popular badges */}
                      <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                        {item.isPopular && (
                          <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                            ★ Bestseller
                          </span>
                        )}
                        {item.isVegetarian && (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-0.5">
                            <Leaf className="w-2.5 h-2.5" /> Veg
                          </span>
                        )}
                        {item.isSpicy && (
                          <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md flex items-center gap-0.5">
                            <Flame className="w-2.5 h-2.5" /> Spicy
                          </span>
                        )}
                      </div>

                      <h3 className="font-bold text-gray-900 text-base group-hover:text-[#06C167] transition-colors leading-snug">
                        {item.name}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    {/* Image with quick add button */}
                    <div className="relative w-28 h-28 rounded-2xl overflow-hidden flex-shrink-0 bg-gray-100">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectItem(item);
                        }}
                        className="absolute bottom-1.5 right-1.5 w-8 h-8 rounded-full bg-white hover:bg-[#06C167] text-gray-800 hover:text-white shadow-lg flex items-center justify-center transition-all active:scale-90"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Price & Calories */}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-50 text-xs font-semibold">
                    <span className="text-gray-900 font-extrabold text-sm">
                      ${item.price.toFixed(2)}
                    </span>
                    {item.calories && (
                      <span className="text-gray-400 font-medium">
                        {item.calories} kcal
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
