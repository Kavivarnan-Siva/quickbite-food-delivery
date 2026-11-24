import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initialRestaurants, initialCategories, initialPromos } from './seedData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

class Database {
  constructor() {
    this.data = {
      restaurants: [],
      categories: [],
      promos: [],
      orders: []
    };
    this.init();
  }

  init() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(raw);
        // Ensure initial seed if empty
        if (!this.data.restaurants || this.data.restaurants.length === 0) {
          this.data.restaurants = initialRestaurants;
        }
        if (!this.data.categories || this.data.categories.length === 0) {
          this.data.categories = initialCategories;
        }
        if (!this.data.promos || this.data.promos.length === 0) {
          this.data.promos = initialPromos;
        }
        if (!this.data.orders) {
          this.data.orders = [];
        }
        this.save();
      } catch (err) {
        console.error('Error reading db.json, falling back to seed:', err);
        this.resetToSeed();
      }
    } else {
      this.resetToSeed();
    }
  }

  resetToSeed() {
    this.data = {
      restaurants: initialRestaurants,
      categories: initialCategories,
      promos: initialPromos,
      orders: []
    };
    this.save();
  }

  save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write db.json:', err);
    }
  }

  // Categories
  getCategories() {
    return this.data.categories;
  }

  // Restaurants
  getRestaurants({ search = '', category = 'all', maxFee, price, sortBy = 'recommended' } = {}) {
    let result = [...this.data.restaurants];

    if (category && category !== 'all') {
      result = result.filter(r => 
        r.cuisine?.toLowerCase() === category.toLowerCase() ||
        r.categories?.some(c => c.toLowerCase().includes(category.toLowerCase())) ||
        r.cuisineTags?.some(t => t.toLowerCase().includes(category.toLowerCase()))
      );
    }

    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter(r => 
        r.name.toLowerCase().includes(q) ||
        r.cuisineTags?.some(t => t.toLowerCase().includes(q)) ||
        r.menu?.some(m => m.name.toLowerCase().includes(q) || m.description.toLowerCase().includes(q))
      );
    }

    if (maxFee !== undefined && maxFee !== null && maxFee !== '') {
      const feeNum = parseFloat(maxFee);
      result = result.filter(r => r.deliveryFee <= feeNum);
    }

    if (price && price !== 'all') {
      result = result.filter(r => r.priceRange === price);
    }

    // Sort
    if (sortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'deliveryTime') {
      result.sort((a, b) => {
        const timeA = parseInt(a.deliveryTimeMinutes) || 30;
        const timeB = parseInt(b.deliveryTimeMinutes) || 30;
        return timeA - timeB;
      });
    } else if (sortBy === 'fee') {
      result.sort((a, b) => a.deliveryFee - b.deliveryFee);
    }

    return result;
  }

  getRestaurantById(id) {
    return this.data.restaurants.find(r => r.id === id || r.slug === id);
  }

  updateRestaurant(id, updates) {
    const idx = this.data.restaurants.findIndex(r => r.id === id);
    if (idx === -1) return null;
    this.data.restaurants[idx] = { ...this.data.restaurants[idx], ...updates };
    this.save();
    return this.data.restaurants[idx];
  }

  addMenuItem(restaurantId, item) {
    const restaurant = this.getRestaurantById(restaurantId);
    if (!restaurant) return null;
    const newItem = {
      id: `item-${Date.now()}`,
      options: [],
      isPopular: false,
      isVegetarian: false,
      isSpicy: false,
      ...item
    };
    restaurant.menu.push(newItem);
    this.save();
    return newItem;
  }

  updateMenuItem(restaurantId, itemId, updates) {
    const restaurant = this.getRestaurantById(restaurantId);
    if (!restaurant) return null;
    const itemIdx = restaurant.menu.findIndex(m => m.id === itemId);
    if (itemIdx === -1) return null;
    restaurant.menu[itemIdx] = { ...restaurant.menu[itemIdx], ...updates };
    this.save();
    return restaurant.menu[itemIdx];
  }

  deleteMenuItem(restaurantId, itemId) {
    const restaurant = this.getRestaurantById(restaurantId);
    if (!restaurant) return false;
    const initialLen = restaurant.menu.length;
    restaurant.menu = restaurant.menu.filter(m => m.id !== itemId);
    if (restaurant.menu.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  // Promos
  validatePromo(code, subtotal, deliveryFee = 0) {
    const promo = this.data.promos.find(p => p.code.toUpperCase() === code.toUpperCase().trim());
    if (!promo) {
      return { valid: false, message: 'Invalid promo code' };
    }
    if (promo.minOrder && subtotal < promo.minOrder) {
      return { 
        valid: false, 
        message: `Order must be at least $${promo.minOrder.toFixed(2)} to use this code` 
      };
    }

    let discount = 0;
    if (promo.type === 'percent') {
      discount = (subtotal * promo.value) / 100;
      if (promo.maxDiscount) {
        discount = Math.min(discount, promo.maxDiscount);
      }
    } else if (promo.type === 'fixed') {
      discount = Math.min(promo.value, subtotal);
    } else if (promo.type === 'free_delivery') {
      discount = deliveryFee;
    }

    return {
      valid: true,
      promo,
      discount: Math.round(discount * 100) / 100,
      message: `Coupon applied: ${promo.description}`
    };
  }

  // Orders
  getOrders(customerId = null) {
    if (customerId) {
      return this.data.orders.filter(o => o.customerId === customerId);
    }
    return this.data.orders;
  }

  getOrderById(id) {
    return this.data.orders.find(o => o.id === id);
  }

  createOrder(orderData) {
    const id = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
    const now = new Date();
    
    // Default simulated driver details
    const drivers = [
      { name: 'Marcus Chen', rating: 4.9, vehicle: 'Toyota Prius (White - #4AB98)', phone: '+1 (555) 349-8120', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80' },
      { name: 'Sarah Jenkins', rating: 4.95, vehicle: 'Honda Civic (Midnight Blue - #8KR41)', phone: '+1 (555) 782-9941', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80' },
      { name: 'David Rodriguez', rating: 4.88, vehicle: 'Vespa Scooter (Matte Red - #2XP77)', phone: '+1 (555) 491-0329', avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&q=80' }
    ];
    const driver = drivers[Math.floor(Math.random() * drivers.length)];

    const newOrder = {
      id,
      ...orderData,
      status: 'confirmed', // confirmed -> preparing -> on_the_way -> delivered
      createdAt: now.toISOString(),
      driver,
      driverProgress: 15, // 0 to 100%
      timeline: [
        { status: 'confirmed', time: now.toISOString(), title: 'Order Confirmed', description: 'Restaurant has accepted your order.' }
      ]
    };

    this.data.orders.unshift(newOrder);
    this.save();
    return newOrder;
  }

  updateOrderStatus(id, newStatus, driverProgress) {
    const order = this.getOrderById(id);
    if (!order) return null;

    order.status = newStatus;
    if (driverProgress !== undefined) {
      order.driverProgress = driverProgress;
    }

    const titles = {
      confirmed: 'Order Confirmed',
      preparing: 'Kitchen Preparing Your Meal',
      on_the_way: 'Driver Picked Up & On the Way',
      delivered: 'Order Delivered Successfully',
      cancelled: 'Order Cancelled'
    };

    const descriptions = {
      confirmed: 'Restaurant accepted your order.',
      preparing: 'The chef is cooking your fresh dishes.',
      on_the_way: `${order.driver?.name || 'Driver'} is heading to your delivery address.`,
      delivered: 'Enjoy your meal! Please rate your experience.',
      cancelled: 'Order was cancelled.'
    };

    // Only add timeline entry if not already present for this status
    if (!order.timeline.some(t => t.status === newStatus)) {
      order.timeline.push({
        status: newStatus,
        time: new Date().toISOString(),
        title: titles[newStatus] || newStatus,
        description: descriptions[newStatus] || ''
      });
    }

    this.save();
    return order;
  }
}

export const db = new Database();
