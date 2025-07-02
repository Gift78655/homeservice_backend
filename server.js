// backend/server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');


// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// 🔧 Middleware
app.use(cors());
app.use(express.json());

// 📦 Routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');

// 🧩 Mount routes
app.use(authRoutes);              // handles /api/register (and /api/login soon)
app.use('/api/users', userRoutes); // handles CRUD: /api/users/:id etc.

// 🌐 Default route
app.get('/', (req, res) => {
  res.send('🎉 Home Services API running...');
});

// 🚀 Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
