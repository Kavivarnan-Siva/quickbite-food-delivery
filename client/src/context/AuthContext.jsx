import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState({
    id: 'usr-101',
    name: 'Alex Morgan',
    email: 'alex.morgan@example.com',
    phone: '+1 (555) 349-7812'
  });

  const [addresses, setAddresses] = useState([
    { id: 'addr-1', label: 'Home', address: '742 Evergreen Terrace, Apt 4B', instructions: 'Leave at front door, ring doorbell' },
    { id: 'addr-2', label: 'Work', address: '500 Market St, Floor 12 (Tech Tower)', instructions: 'Call upon arrival in lobby' }
  ]);

  const [selectedAddress, setSelectedAddress] = useState(addresses[0]);

  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem('quickbite_favs');
      return saved ? JSON.parse(saved) : ['rest-1', 'rest-2'];
    } catch {
      return ['rest-1', 'rest-2'];
    }
  });

  // Active view: 'customer' | 'partner' | 'driver'
  const [viewMode, setViewMode] = useState('customer');

  // Currently tracked order ID for the live tracking modal/view
  const [activeTrackingOrderId, setActiveTrackingOrderId] = useState(null);

  useEffect(() => {
    try {
      localStorage.setItem('quickbite_favs', JSON.stringify(favorites));
    } catch (e) {
      console.error(e);
    }
  }, [favorites]);

  const toggleFavorite = (restaurantId) => {
    setFavorites(prev => 
      prev.includes(restaurantId) 
        ? prev.filter(id => id !== restaurantId) 
        : [...prev, restaurantId]
    );
  };

  const addAddress = (newAddr) => {
    const item = { id: `addr-${Date.now()}`, ...newAddr };
    setAddresses(prev => [...prev, item]);
    setSelectedAddress(item);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        addresses,
        selectedAddress,
        setSelectedAddress,
        addAddress,
        favorites,
        toggleFavorite,
        viewMode,
        setViewMode,
        activeTrackingOrderId,
        setActiveTrackingOrderId
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
