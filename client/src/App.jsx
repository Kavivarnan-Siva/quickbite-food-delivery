import React, { useState, useEffect, useMemo } from 'react';
import Navbar from './components/Navbar';
import CategoryBar from './components/CategoryBar';
import PromoBanner from './components/PromoBanner';
import FilterBar from './components/FilterBar';
import RestaurantCard from './components/RestaurantCard';
import RestaurantDetailView from './components/RestaurantDetailView';
import ItemCustomizationModal from './components/ItemCustomizationModal';
import CartDrawer from './components/CartDrawer';
import CheckoutModal from './components/CheckoutModal';
import LiveOrderTrackingModal from './components/LiveOrderTrackingModal';
import PartnerDashboard from './components/PartnerDashboard';
import DriverSimulation from './components/DriverSimulation';
import OrderHistoryModal from './components/OrderHistoryModal';
import FavoritesModal from './components/FavoritesModal';
import { useAuth } from './context/AuthContext';
import { useCart } from './context/CartContext';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function App() {
  const { viewMode, activeTrackingOrderId, setActiveTrackingOrderId } = useAuth();
  const { isCartOpen } = useCart();

  const [restaurants, setRestaurants] = useState([]);
  const [categories, setCategories] = useState([]);
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recommended');
  const [priceFilter, setPriceFilter] = useState('all');
  const [maxFee, setMaxFee] = useState('');
  const [onlyOffers, setOnlyOffers] = useState(false);

  // Active views / modals
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [selectedItemForCustomization, setSelectedItemForCustomization] = useState(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);

  // Fetch initial restaurants, categories and promos
  const fetchData = async () => {
    try {
      setLoading(true);
      const [rRes, cRes, pRes] = await Promise.all([
        fetch('/api/restaurants'),
        fetch('/api/categories'),
        fetch('/api/promos')
      ]);

      const [rData, cData, pData] = await Promise.all([
        rRes.json(),
        cRes.json(),
        pRes.json()
      ]);

      if (rData.success) setRestaurants(rData.data);
      if (cData.success) setCategories(cData.data);
      if (pData.success) setPromos(pData.data);
    } catch (err) {
      console.error('Failed to load QuickBite data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter restaurants on client side for instantaneous responsiveness
  const filteredRestaurants = useMemo(() => {
    return restaurants.filter(r => {
      // Category filter
      if (activeCategory && activeCategory !== 'all') {
        const catMatch = 
          r.cuisine?.toLowerCase() === activeCategory.toLowerCase() ||
          r.categories?.some(c => c.toLowerCase().includes(activeCategory.toLowerCase())) ||
          r.cuisineTags?.some(t => t.toLowerCase().includes(activeCategory.toLowerCase()));
        if (!catMatch) return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = r.name.toLowerCase().includes(q);
        const matchesTags = r.cuisineTags?.some(t => t.toLowerCase().includes(q));
        const matchesDishes = r.menu?.some(m => m.name.toLowerCase().includes(q) || m.description.toLowerCase().includes(q));
        if (!matchesName && !matchesTags && !matchesDishes) return false;
      }

      // Price filter
      if (priceFilter && priceFilter !== 'all') {
        if (r.priceRange !== priceFilter) return false;
      }

      // Max fee filter
      if (maxFee !== '') {
        const fee = parseFloat(maxFee);
        if (r.deliveryFee > fee) return false;
      }

      // Special offers filter
      if (onlyOffers && !r.offer) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'deliveryTime') {
        const tA = parseInt(a.deliveryTimeMinutes) || 30;
        const tB = parseInt(b.deliveryTimeMinutes) || 30;
        return tA - tB;
      }
      if (sortBy === 'fee') return a.deliveryFee - b.deliveryFee;
      return 0; // recommended
    });
  }, [restaurants, activeCategory, searchQuery, priceFilter, maxFee, onlyOffers, sortBy]);

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1E1E1E]">
      {/* Sticky Top Header */}
      <Navbar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenFavorites={() => setIsFavoritesOpen(true)}
        onSelectRestaurant={setSelectedRestaurant}
      />

      {/* Main Content Area based on View Mode */}
      {viewMode === 'partner' ? (
        <PartnerDashboard />
      ) : viewMode === 'driver' ? (
        <DriverSimulation />
      ) : selectedRestaurant ? (
        /* Single Restaurant Menu Detail View */
        <RestaurantDetailView
          restaurant={selectedRestaurant}
          onBack={() => setSelectedRestaurant(null)}
          onSelectItem={(item) => setSelectedItemForCustomization(item)}
        />
      ) : (
        /* Customer Home Browse View */
        <main className="pb-24">
          {/* Categories Carousel */}
          <CategoryBar
            categories={categories}
            activeCategory={activeCategory}
            onSelectCategory={setActiveCategory}
          />

          {/* Promotion Banner */}
          <PromoBanner promos={promos} />

          {/* Filter Bar */}
          <FilterBar
            sortBy={sortBy}
            setSortBy={setSortBy}
            priceFilter={priceFilter}
            setPriceFilter={setPriceFilter}
            maxFee={maxFee}
            setMaxFee={setMaxFee}
            onlyOffers={onlyOffers}
            setOnlyOffers={setOnlyOffers}
            totalResults={filteredRestaurants.length}
          />

          {/* Restaurant Cards Grid */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 py-8">
                {[1, 2, 3, 4, 5, 6].map(n => (
                  <div key={n} className="rounded-3xl bg-gray-200 aspect-[16/11] animate-pulse"></div>
                ))}
              </div>
            ) : filteredRestaurants.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 p-8 my-6">
                <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-gray-800">No restaurants match your filters</h3>
                <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                  Try adjusting your cuisine category, search query, or price filters.
                </p>
                <button
                  onClick={() => {
                    setActiveCategory('all');
                    setSearchQuery('');
                    setPriceFilter('all');
                    setMaxFee('');
                    setOnlyOffers(false);
                  }}
                  className="mt-4 px-5 py-2 bg-black text-white text-xs font-bold rounded-xl"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 py-6">
                {filteredRestaurants.map(r => (
                  <RestaurantCard
                    key={r.id}
                    restaurant={r}
                    onClick={(rest) => setSelectedRestaurant(rest)}
                  />
                ))}
              </div>
            )}
          </div>
        </main>
      )}

      {/* Dish Customization Modal */}
      {selectedItemForCustomization && (
        <ItemCustomizationModal
          item={selectedItemForCustomization}
          restaurant={selectedRestaurant}
          onClose={() => setSelectedItemForCustomization(null)}
        />
      )}

      {/* Cart Drawer */}
      <CartDrawer
        onOpenCheckout={() => setIsCheckoutOpen(true)}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onOrderSuccess={(order) => {
          setActiveTrackingOrderId(order.id);
        }}
      />

      {/* Live Order Tracking Modal */}
      {activeTrackingOrderId && (
        <LiveOrderTrackingModal
          orderId={activeTrackingOrderId}
          onClose={() => setActiveTrackingOrderId(null)}
        />
      )}

      {/* Order History Modal */}
      <OrderHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        onTrackOrder={(orderId) => setActiveTrackingOrderId(orderId)}
        onSelectRestaurant={(rest) => setSelectedRestaurant(rest)}
      />

      {/* Favorites Modal */}
      <FavoritesModal
        isOpen={isFavoritesOpen}
        onClose={() => setIsFavoritesOpen(false)}
        restaurants={restaurants}
        onSelectRestaurant={(rest) => setSelectedRestaurant(rest)}
      />

      {/* Footer */}
      <footer className="bg-black text-white py-12 border-t border-gray-900 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-8 border-b border-gray-800">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#06C167] text-white flex items-center justify-center font-black">
                  Q
                </div>
                <span className="text-xl font-black">Quick<span className="text-[#06C167]">Bite</span></span>
              </div>
              <p className="text-xs text-gray-400 mt-2 max-w-sm">
                Delicious food delivered fast to your doorstep from the best local restaurants and kitchens.
              </p>
            </div>

            <div className="flex flex-wrap gap-8 text-xs font-semibold text-gray-300">
              <a href="#about" className="hover:text-[#06C167] transition-colors">About QuickBite</a>
              <a href="#restaurants" className="hover:text-[#06C167] transition-colors">Add your restaurant</a>
              <a href="#courier" className="hover:text-[#06C167] transition-colors">Sign up to deliver</a>
              <a href="#privacy" className="hover:text-[#06C167] transition-colors">Privacy Policy</a>
              <a href="#terms" className="hover:text-[#06C167] transition-colors">Terms of Service</a>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row justify-between items-center text-xs text-gray-500 gap-2">
            <span>© 2026 QuickBite Technologies Inc. Uber Eats Clone.</span>
            <span>Crafted with React, Tailwind CSS, Node.js & Express.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
