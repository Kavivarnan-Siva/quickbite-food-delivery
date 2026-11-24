import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('quickbite_cart');
      return saved ? JSON.parse(saved) : { restaurant: null, items: [] };
    } catch {
      return { restaurant: null, items: [] };
    }
  });

  const [promo, setPromo] = useState(null); // { code, discount, message, type }
  const [tipRate, setTipRate] = useState(0.15); // default 15%
  const [customTip, setCustomTip] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [restaurantConflict, setRestaurantConflict] = useState(null);

  useEffect(() => {
    try {
      localStorage.setItem('quickbite_cart', JSON.stringify(cart));
    } catch (e) {
      console.error(e);
    }
  }, [cart]);

  // Add item with customization
  const addToCart = (restaurant, item, selectedOptions = {}, quantity = 1, specialInstructions = '') => {
    // If cart has items from a different restaurant, trigger conflict modal
    if (cart.restaurant && cart.restaurant.id !== restaurant.id && cart.items.length > 0) {
      setRestaurantConflict({
        pendingRestaurant: restaurant,
        pendingItem: item,
        pendingOptions: selectedOptions,
        pendingQuantity: quantity,
        pendingInstructions: specialInstructions
      });
      return;
    }

    // Calculate item unit price based on base price + selected option prices
    let extraPrice = 0;
    Object.values(selectedOptions).forEach(choice => {
      if (Array.isArray(choice)) {
        choice.forEach(c => { extraPrice += (c.price || 0); });
      } else if (choice && choice.price) {
        extraPrice += choice.price;
      }
    });

    const unitPrice = item.price + extraPrice;

    // Check if duplicate item with exact same options exists
    const optionsKey = JSON.stringify(selectedOptions);
    const existingIndex = cart.items.findIndex(
      i => i.id === item.id && JSON.stringify(i.selectedOptions) === optionsKey && i.specialInstructions === specialInstructions
    );

    if (existingIndex > -1) {
      const updated = [...cart.items];
      updated[existingIndex].quantity += quantity;
      setCart({
        restaurant: cart.restaurant || restaurant,
        items: updated
      });
    } else {
      const cartItem = {
        cartItemId: `${item.id}-${Date.now()}-${Math.random()}`,
        id: item.id,
        name: item.name,
        basePrice: item.price,
        unitPrice,
        image: item.image,
        selectedOptions,
        quantity,
        specialInstructions
      };
      setCart({
        restaurant: restaurant,
        items: [...cart.items, cartItem]
      });
    }

    setIsCartOpen(true);
  };

  const resolveConflict = (proceedWithNew) => {
    if (proceedWithNew && restaurantConflict) {
      const { pendingRestaurant, pendingItem, pendingOptions, pendingQuantity, pendingInstructions } = restaurantConflict;
      let extraPrice = 0;
      Object.values(pendingOptions).forEach(choice => {
        if (Array.isArray(choice)) {
          choice.forEach(c => { extraPrice += (c.price || 0); });
        } else if (choice && choice.price) {
          extraPrice += choice.price;
        }
      });
      const unitPrice = pendingItem.price + extraPrice;

      setCart({
        restaurant: pendingRestaurant,
        items: [
          {
            cartItemId: `${pendingItem.id}-${Date.now()}`,
            id: pendingItem.id,
            name: pendingItem.name,
            basePrice: pendingItem.price,
            unitPrice,
            image: pendingItem.image,
            selectedOptions: pendingOptions,
            quantity: pendingQuantity,
            specialInstructions: pendingInstructions
          }
        ]
      });
      setPromo(null);
      setIsCartOpen(true);
    }
    setRestaurantConflict(null);
  };

  const updateQuantity = (cartItemId, delta) => {
    setCart(prev => {
      const updated = prev.items.map(item => {
        if (item.cartItemId === cartItemId) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      }).filter(Boolean);

      return {
        restaurant: updated.length === 0 ? null : prev.restaurant,
        items: updated
      };
    });
  };

  const removeItem = (cartItemId) => {
    setCart(prev => {
      const updated = prev.items.filter(i => i.cartItemId !== cartItemId);
      return {
        restaurant: updated.length === 0 ? null : prev.restaurant,
        items: updated
      };
    });
  };

  const clearCart = () => {
    setCart({ restaurant: null, items: [] });
    setPromo(null);
  };

  // Calculations
  const subtotal = cart.items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
  const deliveryFee = cart.restaurant ? cart.restaurant.deliveryFee : 0;
  const tax = subtotal * 0.0825; // 8.25% sales tax
  
  // Calculate promo discount
  let discount = 0;
  if (promo && promo.valid) {
    if (promo.type === 'percent') {
      discount = (subtotal * promo.value) / 100;
      if (promo.maxDiscount) discount = Math.min(discount, promo.maxDiscount);
    } else if (promo.type === 'fixed') {
      discount = Math.min(promo.value, subtotal);
    } else if (promo.type === 'free_delivery') {
      discount = deliveryFee;
    }
  }

  const tip = customTip !== null ? customTip : subtotal * tipRate;
  const total = Math.max(0, subtotal - discount + deliveryFee + tax + tip);
  const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        restaurantConflict,
        resolveConflict,
        subtotal,
        deliveryFee,
        tax,
        tip,
        tipRate,
        setTipRate,
        customTip,
        setCustomTip,
        discount,
        total,
        itemCount,
        promo,
        setPromo
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}
