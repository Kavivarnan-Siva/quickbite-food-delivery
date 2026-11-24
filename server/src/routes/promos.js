import express from 'express';
import { db } from '../db.js';

const router = express.Router();

// GET all promo codes (for display / promotions banner)
router.get('/', (req, res) => {
  try {
    res.json({ success: true, data: db.data.promos });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST validate promo code
router.post('/validate', (req, res) => {
  try {
    const { code, subtotal, deliveryFee } = req.body;
    if (!code) {
      return res.status(400).json({ valid: false, message: 'Promo code is required' });
    }

    const result = db.validatePromo(code, parseFloat(subtotal) || 0, parseFloat(deliveryFee) || 0);
    res.json(result);
  } catch (error) {
    res.status(500).json({ valid: false, message: error.message });
  }
});

export default router;
