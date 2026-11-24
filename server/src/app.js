import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import restaurantsRouter from './routes/restaurants.js';
import ordersRouter from './routes/orders.js';
import promosRouter from './routes/promos.js';
import categoriesRouter from './routes/categories.js';
import { db } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/restaurants', restaurantsRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/promos', promosRouter);
app.use('/api/categories', categoriesRouter);

// Health & System Info
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    app: 'QuickBite Food Delivery API',
    version: '1.0.0',
    restaurantsCount: db.data.restaurants.length,
    ordersCount: db.data.orders.length
  });
});

// Admin reset to factory seeds
app.post('/api/admin/reset', (req, res) => {
  db.resetToSeed();
  res.json({ success: true, message: 'Database reset to default seed data' });
});

// Serve frontend in local production if client/dist exists
const clientDistPath = path.join(__dirname, '..', '..', 'client', 'dist');
app.use(express.static(clientDistPath));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  const indexPath = path.join(clientDistPath, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      res.status(404).send('QuickBite API running. Vite client dev server runs on port 5173.');
    }
  });
});

export default app;
