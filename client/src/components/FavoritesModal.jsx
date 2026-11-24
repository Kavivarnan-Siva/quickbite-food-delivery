import React from 'react';
import { X, Heart, Star, Clock, Bike } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function FavoritesModal({ isOpen, onClose, restaurants, onSelectRestaurant }) {
  const { favorites, toggleFavorite } = useAuth();

  if (!isOpen) return null;

  const favRestaurants = restaurants.filter(r => favorites.includes(r.id));

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl flex flex-col max-h-[85vh] animate-in zoom-in-95">
        <div className="flex justify-between items-center mb-5 pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
            <h2 className="text-lg font-black text-gray-900">Your Favorite Stores ({favRestaurants.length})</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:text-black">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto space-y-3 flex-1">
          {favRestaurants.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-xs">
              <Heart className="w-10 h-10 mx-auto mb-2 text-gray-200" />
              You haven't added any restaurants to your favorites yet. Tap the heart on any store to save it here!
            </div>
          ) : (
            favRestaurants.map(r => (
              <div
                key={r.id}
                onClick={() => {
                  onSelectRestaurant(r);
                  onClose();
                }}
                className="cursor-pointer p-3.5 rounded-2xl border border-gray-100 hover:border-gray-200 bg-gray-50/50 hover:bg-white flex items-center justify-between gap-3 transition-all"
              >
                <div className="flex items-center gap-3">
                  <img src={r.image} alt={r.name} className="w-14 h-14 rounded-xl object-cover bg-gray-100" />
                  <div>
                    <h3 className="font-bold text-sm text-gray-900">{r.name}</h3>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                      <span className="flex items-center text-amber-500 font-bold">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400 mr-0.5" />
                        {r.rating}
                      </span>
                      <span>•</span>
                      <span>{r.deliveryTimeMinutes} mins</span>
                      <span>•</span>
                      <span>{r.priceRange}</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(r.id);
                  }}
                  className="p-2 text-rose-500 hover:text-gray-300 transition-colors"
                >
                  <Heart className="w-4 h-4 fill-rose-500" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
