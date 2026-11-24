import express from 'express';
import { db } from '../db.js';

const router = express.Router();

// Simulated order progression active timers
const activeTimers = new Map();

function scheduleOrderProgression(orderId) {
  // Advance to preparing after 8 seconds
  const t1 = setTimeout(() => {
    const o = db.getOrderById(orderId);
    if (o && o.status === 'confirmed') {
      db.updateOrderStatus(orderId, 'preparing', 35);
    }
  }, 10000);

  // Advance to on_the_way after 25 seconds
  const t2 = setTimeout(() => {
    const o = db.getOrderById(orderId);
    if (o && (o.status === 'confirmed' || o.status === 'preparing')) {
      db.updateOrderStatus(orderId, 'on_the_way', 65);
    }
  }, 25000);

  // Advance to delivered after 50 seconds
  const t3 = setTimeout(() => {
    const o = db.getOrderById(orderId);
    if (o && o.status === 'on_the_way') {
      db.updateOrderStatus(orderId, 'delivered', 100);
    }
  }, 50000);

  activeTimers.set(orderId, [t1, t2, t3]);
}

// GET all orders (supports optional ?customerId=)
router.get('/', (req, res) => {
  try {
    const { customerId } = req.query;
    const orders = db.getOrders(customerId);
    res.json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET order by ID
router.get('/:id', (req, res) => {
  try {
    const order = db.getOrderById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST new order
router.post('/', (req, res) => {
  try {
    const {
      customerId,
      customerName,
      customerPhone,
      deliveryAddress,
      restaurantId,
      restaurantName,
      items,
      subtotal,
      deliveryFee,
      tax,
      tip,
      discount,
      total,
      promoCode,
      paymentMethod,
      specialInstructions
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart items cannot be empty' });
    }

    if (!deliveryAddress) {
      return res.status(400).json({ success: false, message: 'Delivery address is required' });
    }

    const newOrder = db.createOrder({
      customerId: customerId || 'guest-user',
      customerName: customerName || 'Valued Guest',
      customerPhone: customerPhone || '+1 (555) 019-2831',
      deliveryAddress,
      restaurantId,
      restaurantName,
      items,
      subtotal: parseFloat(subtotal) || 0,
      deliveryFee: parseFloat(deliveryFee) || 0,
      tax: parseFloat(tax) || 0,
      tip: parseFloat(tip) || 0,
      discount: parseFloat(discount) || 0,
      total: parseFloat(total) || 0,
      promoCode: promoCode || null,
      paymentMethod: paymentMethod || 'credit_card',
      specialInstructions: specialInstructions || ''
    });

    // Schedule background simulation
    scheduleOrderProgression(newOrder.id);

    res.status(201).json({ success: true, data: newOrder });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PATCH order status manually (for Admin / Driver / testing simulation)
router.patch('/:id/status', (req, res) => {
  try {
    const { status, driverProgress } = req.body;
    if (!status) {
      return res.status(400).json({ success: false, message: 'Status is required' });
    }

    const updated = db.updateOrderStatus(req.params.id, status, driverProgress);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Cancel automatic progression if manually changed
    if (activeTimers.has(req.params.id)) {
      activeTimers.get(req.params.id).forEach(clearTimeout);
      activeTimers.delete(req.params.id);
    }

    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
