// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 🧠 Controllers
const {
  requestOtp,
  verifyOtp,
  registerFinalUser
} = require('../controllers/authController');

// 📂 Ensure /uploads folder exists
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('✅ uploads folder created');
}

// 💾 Multer config for profile photo upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `${file.fieldname}-${Date.now()}${ext}`;
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png'];
  if (!allowed.includes(file.mimetype)) {
    return cb(new Error('❌ Only JPG and PNG files are allowed'), false);
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 } // 2MB max
});

// 🚀 Step 1: Send OTP & Store Temp Data (with photo)
router.post('/api/request-otp', upload.single('profile_photo'), requestOtp);

// 🔐 Step 2: Verify OTP (no file upload)
router.post('/api/verify-otp', verifyOtp);

// ✅ Step 3: Final Registration (with photo again)
router.post('/api/register-final', upload.single('profile_photo'), registerFinalUser);

module.exports = router;
