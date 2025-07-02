// backend/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { registerUser } = require('../controllers/authController');

// 📁 Configure Multer Storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) =>
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`)
});

const upload = multer({ storage });

// 🔐 Registration Route with File Upload
router.post('/api/register', upload.single('profile_photo'), registerUser);

// 🔜 Future Auth Endpoints (add as needed)
// router.post('/api/login', loginUser);
// router.post('/api/logout', logoutUser);
// router.post('/api/verify-email', verifyEmail);

module.exports = router;
