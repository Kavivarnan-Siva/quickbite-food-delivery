import app from './app.js';

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 QuickBite Server running on http://localhost:${PORT}`);
  console.log(`🍔 Restaurants endpoint: http://localhost:${PORT}/api/restaurants`);
  console.log(`📦 Orders endpoint:      http://localhost:${PORT}/api/orders`);
});
