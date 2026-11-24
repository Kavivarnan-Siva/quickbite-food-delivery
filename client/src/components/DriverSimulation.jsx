import React, { useState, useEffect } from 'react';
import { 
  Bike, 
  MapPin, 
  Navigation, 
  Phone, 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  Store,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function DriverSimulation() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      const data = await res.json();
      if (data.success && data.data) {
        setOrders(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: newStatus,
          driverProgress: newStatus === 'on_the_way' ? 70 : 100
        })
      });
      const data = await res.json();
      if (data.success) {
        fetchOrders();
        if (newStatus === 'delivered') {
          try {
            confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
          } catch (e) {}
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const activeDeliveries = orders.filter(o => o.status === 'preparing' || o.status === 'on_the_way');
  const pastDeliveries = orders.filter(o => o.status === 'delivered');

  const totalEarnings = pastDeliveries.reduce((sum, o) => sum + (o.deliveryFee || 2.99) + (o.tip || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Driver Profile Top Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#06C167] text-white flex items-center justify-center font-black text-2xl shadow-lg">
            <Bike className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/60 px-2.5 py-0.5 rounded-md border border-emerald-800">
                Courier Driver App
              </span>
              <span className="text-xs bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Online & Available
              </span>
            </div>
            <h1 className="text-2xl font-black text-white mt-1">
              Marcus Chen • Silver Prius (Plate: 7XYZ89)
            </h1>
          </div>
        </div>

        {/* Driver Earnings Badge */}
        <div className="bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/10 flex items-center gap-4">
          <div>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Today's Courier Earnings</span>
            <div className="text-2xl font-black text-emerald-400 mt-0.5">${totalEarnings.toFixed(2)}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Active Deliveries Queue */}
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-black text-gray-900 mb-4 flex items-center gap-2">
            <Navigation className="w-5 h-5 text-[#06C167]" />
            Active Delivery Requests ({activeDeliveries.length})
          </h2>

          {activeDeliveries.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 text-center border border-gray-100">
              <Bike className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <h3 className="font-bold text-gray-800 text-sm">No Active Deliveries Right Now</h3>
              <p className="text-xs text-gray-400 mt-1">
                Place an order in the Customer view or start one from the Partner view to accept a delivery!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeDeliveries.map(ord => (
                <div key={ord.id} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-gray-900">{ord.id}</span>
                        <span className="text-[10px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md">
                          {ord.status.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        Earnings for this trip: <strong className="text-emerald-600 font-extrabold">+${((ord.deliveryFee || 2.99) + (ord.tip || 0)).toFixed(2)}</strong> (Fee + Tip)
                      </div>
                    </div>
                  </div>

                  {/* Route points */}
                  <div className="space-y-2 border-l-2 border-dashed border-gray-200 ml-3 pl-4 text-xs">
                    <div className="relative">
                      <div className="absolute -left-[23px] top-0.5 w-3.5 h-3.5 rounded-full bg-amber-500 border-2 border-white"></div>
                      <div className="font-bold text-gray-700">Pickup: {ord.restaurantName}</div>
                      <div className="text-[11px] text-gray-400">{ord.items?.length} items ready to collect</div>
                    </div>
                    <div className="relative pt-2">
                      <div className="absolute -left-[23px] top-2.5 w-3.5 h-3.5 rounded-full bg-[#06C167] border-2 border-white"></div>
                      <div className="font-bold text-gray-700">Drop-off: {ord.customerName}</div>
                      <div className="text-[11px] text-gray-500">{ord.deliveryAddress}</div>
                    </div>
                  </div>

                  {/* Courier Action Buttons */}
                  <div className="pt-2 flex gap-2">
                    {ord.status === 'preparing' && (
                      <button
                        onClick={() => handleUpdateStatus(ord.id, 'on_the_way')}
                        className="w-full py-3 bg-[#06C167] hover:bg-[#05944F] text-white rounded-2xl font-black text-xs shadow-md transition-all flex items-center justify-center gap-2"
                      >
                        <Bike className="w-4 h-4" /> Picked Up & Start Heading to Customer
                      </button>
                    )}

                    {ord.status === 'on_the_way' && (
                      <button
                        onClick={() => handleUpdateStatus(ord.id, 'delivered')}
                        className="w-full py-3 bg-black hover:bg-gray-800 text-white rounded-2xl font-black text-xs shadow-md transition-all flex items-center justify-center gap-2"
                      >
                        <CheckCircle2 className="w-4 h-4 text-[#06C167]" /> Confirm Delivered to Customer
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Past Completed Trips */}
        <div>
          <h2 className="text-base font-bold text-gray-900 mb-3">Completed Deliveries Today ({pastDeliveries.length})</h2>
          <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden">
            {pastDeliveries.length === 0 ? (
              <div className="p-6 text-center text-xs text-gray-400">No trips completed yet today.</div>
            ) : (
              <div className="divide-y divide-gray-100">
                {pastDeliveries.map(p => (
                  <div key={p.id} className="p-4 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-gray-900">{p.id} • {p.restaurantName}</div>
                      <div className="text-gray-400">{p.customerName} ({p.deliveryAddress?.slice(0, 30)}...)</div>
                    </div>
                    <div className="text-right">
                      <div className="font-black text-emerald-600">+${((p.deliveryFee || 2.99) + (p.tip || 0)).toFixed(2)}</div>
                      <div className="text-[10px] text-gray-400">Completed</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
