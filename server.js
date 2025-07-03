// backend/server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// 📦 Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// 🧱 Ensure /uploads folder exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('📂 Created uploads folder');
}

// 🔧 Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(uploadDir)); // Serve uploaded images

// 📦 Import Routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes'); // Optional but must exist if included

// 🧩 Mount Routes
app.use(authRoutes);                // Handles /api/register, /api/verify-otp, etc.
app.use('/api/users', userRoutes); // Handles /api/users/:id, etc.

// 🌐 Root Route
app.get('/', (req, res) => {
  res.send('🎉 Home Services API running...');
});

// 🚀 Start Server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
