import React, { useState, useEffect } from 'react';
import { 
  X, 
  MapPin, 
  Phone, 
  MessageSquare, 
  CheckCircle2, 
  Clock, 
  Bike, 
  Store, 
  Star, 
  Navigation,
  ChevronRight,
  ShieldCheck,
  Send,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';

const STAGES = [
  { id: 'confirmed', label: 'Order Confirmed', description: 'Restaurant has received your order', icon: CheckCircle2 },
  { id: 'preparing', label: 'Preparing Food', description: 'Chefs are cooking your meal', icon: Store },
  { id: 'on_the_way', label: 'Out for Delivery', description: 'Courier is heading to your address', icon: Bike },
  { id: 'delivered', label: 'Delivered', description: 'Meal arrived! Enjoy your food', icon: Sparkles }
];

export default function LiveOrderTrackingModal({ orderId, onClose }) {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCallModal, setShowCallModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { sender: 'driver', text: 'Hi! I just picked up your order and I am on my way now.', time: 'Just now' }
  ]);

  // Fetch order status and poll every 4 seconds for live updates
  const fetchOrder = async () => {
    if (!orderId) return;
    try {
      const res = await fetch(`/api/orders/${orderId}`);
      const data = await res.json();
      if (data.success && data.data) {
        setOrder(data.data);
      }
    } catch (err) {
      console.error('Error fetching order tracking:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
    const interval = setInterval(fetchOrder, 4000);
    return () => clearInterval(interval);
  }, [orderId]);

  // Fast-forward manual tester status update
  const handleUpdateStatus = async (newStatus) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: newStatus,
          driverProgress: newStatus === 'confirmed' ? 10 : newStatus === 'preparing' ? 35 : newStatus === 'on_the_way' ? 70 : 100
        })
      });
      const data = await res.json();
      if (data.success) {
        setOrder(data.data);
        if (newStatus === 'delivered') {
          try {
            confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
          } catch (e) {}
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    const userMsg = { sender: 'user', text: messageText.trim(), time: 'Just now' };
    setChatMessages(prev => [...prev, userMsg]);
    setMessageText('');

    // Simulated driver response after 1.5s
    setTimeout(() => {
      setChatMessages(prev => [
        ...prev,
        { sender: 'driver', text: 'Got it, thank you! Be there shortly.', time: 'Just now' }
      ]);
    }, 1500);
  };

  if (!orderId) return null;

  const currentStageIndex = STAGES.findIndex(s => s.id === (order?.status || 'confirmed'));

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[94vh] animate-in fade-in zoom-in-95 my-auto">
        
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between bg-white flex-shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Live Order Tracking • {order?.id}
              </span>
            </div>
            <h2 className="text-lg font-black text-gray-900 mt-0.5">
              {order?.restaurantName || 'Order in Progress'}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-black transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Fast-Forward Simulation Bar for Testing */}
        <div className="bg-emerald-50 border-b border-emerald-100 px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 flex-shrink-0">
          <div className="text-[11px] font-bold text-emerald-900 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Interactive Simulator: Test Stages</span>
          </div>

          <div className="flex items-center gap-1.5">
            {STAGES.map((st) => (
              <button
                key={st.id}
                onClick={() => handleUpdateStatus(st.id)}
                className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full transition-all ${
                  order?.status === st.id
                    ? 'bg-[#06C167] text-white shadow-sm'
                    : 'bg-white text-gray-700 hover:bg-emerald-100 border border-emerald-200'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* Progress Stage Stepper */}
          <div className="grid grid-cols-4 gap-2 text-center">
            {STAGES.map((st, idx) => {
              const isPast = idx < currentStageIndex;
              const isCurrent = idx === currentStageIndex;
              const Icon = st.icon;

              return (
                <div key={st.id} className="flex flex-col items-center">
                  <div 
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${
                      isCurrent 
                        ? 'bg-[#06C167] text-white shadow-lg ring-4 ring-emerald-100 scale-105' 
                        : isPast 
                          ? 'bg-emerald-100 text-[#06C167]' 
                          : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={`text-[11px] font-bold mt-2 ${isCurrent ? 'text-black' : isPast ? 'text-emerald-700' : 'text-gray-400'}`}>
                    {st.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Interactive Animated Map Simulation */}
          <div className="relative rounded-3xl overflow-hidden bg-slate-900 h-64 border border-gray-200 shadow-inner flex items-center justify-center">
            {/* SVG Roads & River Map Background */}
            <svg className="absolute inset-0 w-full h-full opacity-40" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#334155" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
              {/* Curved river */}
              <path d="M 0 180 Q 200 120 400 210 T 800 160" fill="none" stroke="#1e3a8a" strokeWidth="24" strokeLinecap="round" />
              {/* City avenues */}
              <line x1="0" y1="80" x2="800" y2="80" stroke="#475569" strokeWidth="8" />
              <line x1="0" y1="160" x2="800" y2="160" stroke="#475569" strokeWidth="10" />
              <line x1="180" y1="0" x2="180" y2="400" stroke="#475569" strokeWidth="8" />
              <line x1="420" y1="0" x2="420" y2="400" stroke="#475569" strokeWidth="8" />

              {/* Delivery Path Route Line */}
              <path 
                d="M 90 90 L 260 90 L 260 160 L 520 160" 
                fill="none" 
                stroke="#06C167" 
                strokeWidth="4" 
                strokeDasharray="6 6"
                className="animate-dash"
              />
            </svg>

            {/* Restaurant Pin */}
            <div className="absolute left-[12%] top-[30%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
              <div className="w-9 h-9 rounded-full bg-white shadow-xl flex items-center justify-center text-gray-900 border-2 border-black">
                <Store className="w-5 h-5 text-amber-600" />
              </div>
              <span className="bg-black/80 text-white text-[9px] font-bold px-2 py-0.5 rounded-full mt-1 backdrop-blur-sm">
                Restaurant
              </span>
            </div>

            {/* Destination House Pin */}
            <div className="absolute left-[82%] top-[60%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
              <div className="w-9 h-9 rounded-full bg-[#06C167] shadow-xl flex items-center justify-center text-white border-2 border-white">
                <MapPin className="w-5 h-5" />
              </div>
              <span className="bg-black/80 text-white text-[9px] font-bold px-2 py-0.5 rounded-full mt-1 backdrop-blur-sm">
                Your House
              </span>
            </div>

            {/* Animated Moving Courier Driver Icon */}
            {order?.status !== 'delivered' ? (
              <div 
                className="absolute flex flex-col items-center transition-all duration-1000 ease-in-out"
                style={{
                  left: order?.status === 'confirmed' ? '20%' : order?.status === 'preparing' ? '38%' : '65%',
                  top: order?.status === 'confirmed' ? '34%' : order?.status === 'preparing' ? '45%' : '61%'
                }}
              >
                <div className="relative">
                  <div className="w-11 h-11 rounded-full bg-white shadow-2xl flex items-center justify-center text-[#06C167] border-2 border-[#06C167] animate-pulse-ring">
                    <Bike className="w-6 h-6" />
                  </div>
                </div>
                <span className="bg-[#06C167] text-white text-[9px] font-black px-2 py-0.5 rounded-full mt-1 shadow-md whitespace-nowrap">
                  {order?.driver?.name?.split(' ')[0] || 'Driver'} is moving
                </span>
              </div>
            ) : (
              <div className="absolute left-[82%] top-[60%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-emerald-500 shadow-2xl flex items-center justify-center text-white text-xl animate-bounce">
                  🎉
                </div>
              </div>
            )}

            {/* ETA Overlay Pill */}
            <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/40 shadow-lg flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#06C167]" />
              <div className="text-left">
                <div className="text-[10px] text-gray-500 font-bold uppercase">Estimated Arrival</div>
                <div className="text-xs font-black text-gray-900">
                  {order?.status === 'delivered' ? 'Delivered' : 'In 15 - 20 mins'}
                </div>
              </div>
            </div>
          </div>

          {/* Courier Driver Details Card */}
          {order?.driver && (
            <div className="p-4 rounded-3xl bg-gray-50 border border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <img
                  src={order.driver.avatar}
                  alt={order.driver.name}
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-md"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-extrabold text-sm text-gray-900">{order.driver.name}</h4>
                    <span className="flex items-center text-xs font-bold text-gray-800 bg-amber-100 px-1.5 py-0.5 rounded-md">
                      <Star className="w-3 h-3 fill-amber-500 text-amber-500 mr-0.5" />
                      {order.driver.rating}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 font-medium mt-0.5">
                    {order.driver.vehicle}
                  </div>
                  <div className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1 mt-0.5">
                    <ShieldCheck className="w-3.5 h-3.5" /> Verified Uber Delivery Partner
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => setShowCallModal(true)}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-700 hover:text-black hover:border-gray-300 font-bold text-xs shadow-sm"
                >
                  <Phone className="w-3.5 h-3.5 text-[#06C167]" />
                  <span>Call</span>
                </button>
                <button
                  onClick={() => setShowMessageModal(true)}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-black text-white hover:bg-gray-800 font-bold text-xs shadow-md"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-[#06C167]" />
                  <span>Message</span>
                </button>
              </div>
            </div>
          )}

          {/* Delivery Address & Instructions */}
          <div className="p-4 rounded-2xl bg-white border border-gray-100 flex items-start gap-3">
            <MapPin className="w-5 h-5 text-[#06C167] flex-shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-bold text-gray-500 uppercase tracking-wider">Drop-off Location</span>
              <div className="font-extrabold text-gray-900 text-sm mt-0.5">
                {order?.deliveryAddress}
              </div>
            </div>
          </div>

          {/* Items in this Order */}
          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-2">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
              Order Receipt ({order?.items?.length} items)
            </span>

            {order?.items?.map((item, idx) => (
              <div key={idx} className="flex justify-between text-xs text-gray-700 pb-1.5 border-b border-gray-100 last:border-none">
                <div>
                  <span className="font-bold text-gray-900">{item.quantity}x</span> {item.name}
                </div>
                <span className="font-bold text-gray-900">
                  ${(item.unitPrice * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}

            <div className="pt-2 flex justify-between text-sm font-black text-gray-900 border-t border-gray-200">
              <span>Total Paid</span>
              <span>${order?.total?.toFixed(2)}</span>
            </div>
          </div>

        </div>

      </div>

      {/* Simulated Call Modal */}
      {showCallModal && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-[#06C167] mx-auto flex items-center justify-center mb-3">
              <Phone className="w-8 h-8 animate-pulse" />
            </div>
            <h3 className="text-lg font-black text-gray-900">Calling Courier...</h3>
            <p className="text-xs text-gray-500 mt-1">
              Connecting you securely with {order?.driver?.name} ({order?.driver?.phone})
            </p>
            <div className="mt-6 flex justify-center">
              <button
                onClick={() => setShowCallModal(false)}
                className="px-6 py-2.5 rounded-full bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs shadow-md"
              >
                End Call
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Simulated Message Chat Modal */}
      {showMessageModal && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl flex flex-col h-[480px] animate-in zoom-in-95">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white">
              <div className="flex items-center gap-2.5">
                <img src={order?.driver?.avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
                <div>
                  <h4 className="text-xs font-bold text-gray-900">{order?.driver?.name}</h4>
                  <span className="text-[10px] text-[#06C167] font-semibold">Active now</span>
                </div>
              </div>
              <button onClick={() => setShowMessageModal(false)} className="text-gray-400 hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Body */}
            <div className="p-4 flex-1 overflow-y-auto space-y-3 bg-gray-50 text-xs">
              {chatMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[75%] p-3 rounded-2xl ${
                      msg.sender === 'user'
                        ? 'bg-black text-white rounded-br-none'
                        : 'bg-white text-gray-800 shadow-sm border border-gray-100 rounded-bl-none'
                    }`}
                  >
                    <div>{msg.text}</div>
                    <div className={`text-[9px] mt-1 text-right ${msg.sender === 'user' ? 'text-gray-400' : 'text-gray-400'}`}>
                      {msg.time}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-gray-100 flex gap-2">
              <input
                type="text"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Message your delivery driver..."
                className="flex-1 text-xs px-3.5 py-2 rounded-xl bg-gray-100 focus:bg-white border border-transparent focus:border-black focus:outline-none"
              />
              <button
                type="submit"
                className="p-2.5 rounded-xl bg-[#06C167] text-white hover:bg-[#05944F] transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
