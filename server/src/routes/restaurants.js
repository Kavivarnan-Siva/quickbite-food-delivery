import express from 'express';
import { db } from '../db.js';

const router = express.Router();

// GET all restaurants with filters
router.get('/', (req, res) => {
  try {
    const { search, category, maxFee, price, sortBy } = req.query;
    const restaurants = db.getRestaurants({ search, category, maxFee, price, sortBy });
    res.json({ success: true, count: restaurants.length, data: restaurants });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET restaurant by ID or slug
router.get('/:id', (req, res) => {
  try {
    const restaurant = db.getRestaurantById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }
    res.json({ success: true, data: restaurant });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Partner: Update restaurant details / toggle open
router.put('/:id', (req, res) => {
  try {
    const updated = db.updateRestaurant(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Partner: Add menu item
router.post('/:id/menu', (req, res) => {
  try {
    const item = db.addMenuItem(req.params.id, req.body);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }
    res.status(201).json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Partner: Update menu item
router.put('/:id/menu/:itemId', (req, res) => {
  try {
    const item = db.updateMenuItem(req.params.id, req.params.itemId, req.body);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Menu item or restaurant not found' });
    }
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Partner: Delete menu item
router.delete('/:id/menu/:itemId', (req, res) => {
  try {
    const deleted = db.deleteMenuItem(req.params.id, req.params.itemId);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Menu item not found' });
    }
    res.json({ success: true, message: 'Menu item deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
