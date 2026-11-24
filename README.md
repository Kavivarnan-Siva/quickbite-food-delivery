# QuickBite — Uber Eats Food Delivery Fullstack Platform 🍔🍕🍣

A complete, high-performance, fullstack food ordering and delivery e-commerce web platform inspired by Uber Eats and DoorDash.

Built with **React 18**, **Tailwind CSS**, **Vite**, **Lucide Icons**, **Express.js**, and a persistent database with real-time order lifecycle simulation.

---

## 🌟 Key Features

### 1. Customer Food Ordering Experience
- **Restaurant Discovery & Filtering**:
  - Filter by cuisine category (*Burgers, Pizza, Sushi, Mexican, Healthy Bowls, Indian Curry, Asian Street Food, Desserts, Beverages*).
  - Search by restaurant name, cuisine tag, or specific food items.
  - Price tier filter (`$`, `$$`, `$$$`).
  - Max delivery fee toggles (Free delivery filter, Under $2 fee).
  - Special offers & deals filter.
  - Sorting options: *Recommended, Highest Rated (★), Fastest Delivery (ETA), Lowest Delivery Fee*.
- **Restaurant Menu & Customization**:
  - Full restaurant details: delivery fee, estimated delivery time, rating & reviews count, address, contact phone, and operating status.
  - Categorized menu with high-resolution food photography, calorie counts, vegetarian/spicy indicators, and bestseller badges.
  - **Customization Modal**: choose sizes, crust styles, required options, and multi-select add-ons (extra cheese, bacon, avocado, etc.) with real-time price updates and special instructions.
- **Cart & Conflict Management**:
  - Multi-item cart drawer with quantity steppers and customizations summary.
  - Multi-restaurant cart conflict guard (prompts user if adding from another store).
  - **Promo Codes**: validate coupons like `TASTY20` (20% off), `FREEDEL` (free delivery), `BITE10` ($10 off), `UBER5` ($5 off).
  - **Courier Tip Selector**: 10%, 15%, 20%, or custom dollar tip.
  - Itemized cost calculation: Subtotal, Delivery Fee, Promotion Discount, Taxes (8.25%), Courier Tip, and Total.
- **Checkout & Confetti Celebration**:
  - Delivery address & drop-off notes ("Leave at front door", gate code).
  - Payment methods: Credit/Debit Card, Apple/Google Pay, Cash on Delivery.
  - Confetti animation on successful order creation.

### 2. Live Order Tracking (Real-Time GPS Simulation)
- **4-Stage Stepper**: *Order Confirmed* ➔ *Kitchen Preparing* ➔ *Out for Delivery* ➔ *Delivered*.
- **Animated Map Simulation**: visual route with street grid, river, restaurant origin pin, customer destination pin, and moving courier vehicle icon with pulsating radar rings.
- **Courier Profile Card**: driver avatar, verified badge, rating, car model & license plate.
- **Interactive Driver Communication**: interactive **Call Courier** and **In-App Messaging** modals.
- **Fast-Forward Testing Controls**: instant buttons to test any stage on demand.

### 3. Restaurant Partner Portal
- Toggle store availability (*Open / Accepting Orders* vs *Store Paused*).
- Real-time incoming kitchen orders list with one-click status transitions (*Start Cooking*, *Ready for Driver Pickup*, *Mark as Delivered*).
- Menu items manager with an **Add New Dish** modal.
- Daily business analytics: Total Sales ($), Active Live Orders, Average Ticket Size.

### 4. Courier Driver App Simulation
- Live queue of available delivery requests.
- Pickup from restaurant and delivery drop-off workflow.
- Earnings dashboard tracking delivery fees + tips.

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18 or newer)
- npm

### Running the App (Single-Command Production Server)
The built client is already bundled and served directly by the Express backend on port `5000`:

```bash
cd server
npm start
```

Open your browser and navigate to:
👉 **[http://localhost:5000](http://localhost:5000)**

---

### Development Mode (Concurrent Client & Server)

If you wish to run with Vite Hot Module Reloading:

1. **Start the backend API** (Port 5000):
   ```bash
   cd server
   npm run dev
   ```

2. **Start the Vite client** (Port 5173, proxies `/api` to 5000):
   ```bash
   cd client
   npm run dev
   ```

Open your browser at:
👉 **[http://localhost:5173](http://localhost:5173)**

---

## 📁 Project Architecture

```
food-delivery-app/
├── package.json                   # Root workspace scripts
├── server/                        # Express.js REST API & Database
│   ├── data/                      # Persistent database file (db.json)
│   ├── src/
│   │   ├── db.js                  # Persistent database class & query logic
│   │   ├── seedData.js            # Initial restaurants, dishes, & promos
│   │   ├── routes/
│   │   │   ├── restaurants.js     # /api/restaurants endpoints
│   │   │   ├── orders.js          # /api/orders endpoints & live timer simulation
│   │   │   ├── promos.js          # /api/promos validation endpoints
│   │   │   └── categories.js      # /api/categories endpoints
│   │   └── index.js               # Express app, CORS, API & static client serving
│   └── package.json
└── client/                        # React 18 + Vite + Tailwind CSS Frontend
    ├── dist/                      # Production compiled assets
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.jsx         # Header, search, addresses, cart badge, role switcher
    │   │   ├── CategoryBar.jsx    # Cuisine category carousel
    │   │   ├── PromoBanner.jsx    # Interactive coupon deals banner
    │   │   ├── FilterBar.jsx      # Sort, price $, max fee, offers filters
    │   │   ├── RestaurantCard.jsx # Uber Eats restaurant card
    │   │   ├── RestaurantDetailView.jsx # Restaurant cover, tabs, search, menu grid
    │   │   ├── ItemCustomizationModal.jsx # Options, toppings, quantity, special notes
    │   │   ├── CartDrawer.jsx     # Slide-over cart, promos, tip options, breakdown
    │   │   ├── CheckoutModal.jsx  # Address, payment methods, confetti trigger
    │   │   ├── LiveOrderTrackingModal.jsx # Live SVG map, driver route, call/chat modals
    │   │   ├── PartnerDashboard.jsx # Restaurant kitchen portal & menu editor
    │   │   ├── DriverSimulation.jsx # Courier delivery jobs & earnings
    │   │   ├── OrderHistoryModal.jsx # Receipts and one-click re-order
    │   │   └── FavoritesModal.jsx # Saved restaurants
    │   ├── context/
    │   │   ├── CartContext.jsx    # Cart state, conflict handling, calculations
    │   │   └── AuthContext.jsx    # User profile, addresses, favorites, app view mode
    │   ├── App.jsx                # Main application coordinator
    │   ├── main.jsx               # React DOM entry point
    │   └── index.css              # Tailwind directives & animation styles
    ├── tailwind.config.js
    ├── vite.config.js
    └── package.json
```
