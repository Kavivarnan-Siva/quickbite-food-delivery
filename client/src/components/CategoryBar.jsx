import React from 'react';
import { 
  Utensils, 
  Sandwich, 
  Pizza, 
  Fish, 
  Flame, 
  Salad, 
  Soup, 
  CookingPot, 
  Cake, 
  Coffee 
} from 'lucide-react';

const ICON_MAP = {
  Utensils: Utensils,
  Sandwich: Sandwich,
  Pizza: Pizza,
  Fish: Fish,
  Flame: Flame,
  Salad: Salad,
  Soup: Soup,
  CookingPot: CookingPot,
  Cake: Cake,
  Coffee: Coffee
};

export default function CategoryBar({ categories, activeCategory, onSelectCategory }) {
  return (
    <div className="py-4 border-b border-gray-100 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none no-scrollbar">
          {categories.map((cat) => {
            const IconComponent = ICON_MAP[cat.icon] || Utensils;
            const isActive = activeCategory === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`flex flex-col items-center flex-shrink-0 group focus:outline-none transition-all py-1 px-2.5 rounded-2xl ${
                  isActive ? 'bg-gray-100 text-black' : 'text-gray-600 hover:text-black'
                }`}
              >
                <div 
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-1.5 transition-all overflow-hidden relative shadow-sm ${
                    isActive 
                      ? 'ring-2 ring-black scale-105 shadow-md' 
                      : 'group-hover:scale-105 border border-gray-200 bg-white'
                  }`}
                >
                  {cat.image ? (
                    <img 
                      src={cat.image} 
                      alt={cat.name} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" 
                    />
                  ) : (
                    <IconComponent className={`w-6 h-6 ${isActive ? 'text-[#06C167]' : 'text-gray-700'}`} />
                  )}
                  {isActive && (
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-white"></div>
                    </div>
                  )}
                </div>
                <span className={`text-xs whitespace-nowrap font-medium ${isActive ? 'font-bold text-black' : 'text-gray-700'}`}>
                  {cat.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
