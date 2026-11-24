import React from 'react';
import { SlidersHorizontal, Star, DollarSign, Clock } from 'lucide-react';

export default function FilterBar({
  sortBy,
  setSortBy,
  priceFilter,
  setPriceFilter,
  maxFee,
  setMaxFee,
  onlyOffers,
  setOnlyOffers,
  totalResults
}) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 pb-4">
        
        {/* Results title */}
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold text-gray-900">All Stores</span>
          <span className="text-xs bg-gray-100 text-gray-600 font-semibold px-2.5 py-1 rounded-full">
            {totalResults} available
          </span>
        </div>

        {/* Filter controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Sort By Dropdown */}
          <div className="flex items-center gap-1.5 bg-white border border-gray-200 px-3 py-1.5 rounded-full text-xs font-semibold text-gray-700 shadow-sm">
            <SlidersHorizontal className="w-3.5 h-3.5 text-gray-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="recommended">Recommended</option>
              <option value="rating">Highest Rated (★)</option>
              <option value="deliveryTime">Fastest Delivery (ETA)</option>
              <option value="fee">Lowest Delivery Fee</option>
            </select>
          </div>

          {/* Price Range Pills */}
          <div className="flex items-center bg-gray-100 p-0.5 rounded-full text-xs font-bold">
            {['all', '$', '$$', '$$$'].map((p) => (
              <button
                key={p}
                onClick={() => setPriceFilter(p)}
                className={`px-3 py-1.5 rounded-full transition-all ${
                  priceFilter === p
                    ? 'bg-black text-white shadow-sm'
                    : 'text-gray-600 hover:text-black'
                }`}
              >
                {p === 'all' ? 'All $' : p}
              </button>
            ))}
          </div>

          {/* Under $2 Fee pill */}
          <button
            onClick={() => setMaxFee(maxFee === 1.99 ? '' : 1.99)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              maxFee === 1.99
                ? 'bg-emerald-50 border-[#06C167] text-[#06C167]'
                : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
            }`}
          >
            Under $2 Fee
          </button>

          {/* Free delivery only pill */}
          <button
            onClick={() => setMaxFee(maxFee === 0 ? '' : 0)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              maxFee === 0
                ? 'bg-emerald-50 border-[#06C167] text-[#06C167]'
                : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
            }`}
          >
            Free Delivery
          </button>

          {/* Has Promo / Deals */}
          <button
            onClick={() => setOnlyOffers(!onlyOffers)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              onlyOffers
                ? 'bg-emerald-50 border-[#06C167] text-[#06C167]'
                : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
            }`}
          >
            Special Offers
          </button>
        </div>

      </div>
    </div>
  );
}
