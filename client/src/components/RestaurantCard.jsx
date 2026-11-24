import React from 'react';
import { Star, Clock, Bike, Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function RestaurantCard({ restaurant, onClick }) {
  const { favorites, toggleFavorite } = useAuth();
  const isFav = favorites.includes(restaurant.id);

  return (
    <div 
      onClick={() => onClick(restaurant)}
      className="group cursor-pointer flex flex-col bg-white rounded-3xl overflow-hidden border border-gray-100 hover:border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300"
    >
      {/* Image container */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-gray-100">
        <img
          src={restaurant.image}
          alt={restaurant.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />

        {/* Favorite heart button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(restaurant.id);
          }}
          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/80 hover:bg-white backdrop-blur-md flex items-center justify-center text-gray-700 hover:text-rose-500 transition-all shadow-md active:scale-90"
        >
          <Heart className={`w-4 h-4 ${isFav ? 'fill-rose-500 text-rose-500' : ''}`} />
        </button>

        {/* Special Offer Pill */}
        {restaurant.offer && (
          <div className="absolute bottom-3 left-3 bg-[#06C167] text-white text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg shadow-md flex items-center gap-1">
            <span>{restaurant.offer}</span>
          </div>
        )}

        {/* Restaurant Small Logo avatar */}
        {restaurant.logo && (
          <div className="absolute -bottom-3 right-4 w-11 h-11 rounded-2xl overflow-hidden border-2 border-white shadow-md bg-white">
            <img src={restaurant.logo} alt="" className="w-full h-full object-cover" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 pt-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Header Row: Name & Rating */}
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-bold text-gray-900 text-base group-hover:text-[#06C167] transition-colors line-clamp-1">
              {restaurant.name}
            </h3>
            <div className="flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded-full text-xs font-bold text-gray-800 flex-shrink-0">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{restaurant.rating}</span>
              <span className="text-gray-400 text-[10px]">({restaurant.reviewCount})</span>
            </div>
          </div>

          {/* Tags & Price */}
          <div className="text-xs text-gray-500 mb-3 flex items-center gap-1.5 flex-wrap">
            <span className="font-semibold text-gray-700">{restaurant.priceRange}</span>
            <span>•</span>
            <span>{restaurant.cuisineTags?.slice(0, 2).join(', ')}</span>
          </div>
        </div>

        {/* Delivery info footer */}
        <div className="flex items-center justify-between text-xs font-medium text-gray-600 border-t border-gray-100 pt-3">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-gray-400" />
            <span>{restaurant.deliveryTimeMinutes} mins</span>
          </div>

          <div className="flex items-center gap-1.5">
            <Bike className="w-3.5 h-3.5 text-gray-400" />
            {restaurant.deliveryFee === 0 ? (
              <span className="text-[#06C167] font-bold">Free Delivery</span>
            ) : (
              <span>${restaurant.deliveryFee.toFixed(2)} delivery</span>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
