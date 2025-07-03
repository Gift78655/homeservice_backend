// backend/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { registerUser } = require('../controllers/authController');

// 📁 Ensure /uploads folder exists
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('✅ Created uploads folder');
}

// 🗂️ Configure Multer Storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const safeName = `${file.fieldname}-${Date.now()}${ext}`;
    cb(null, safeName);
  }
});

// 🛡️ File filter (only allow JPG/PNG under 2MB)
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png'];
  if (!allowedTypes.includes(file.mimetype)) {
    return cb(new Error('Only JPG and PNG files are allowed'), false);
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 } // 2MB
});

// 🔐 Registration Route with File Upload
router.post('/api/register', upload.single('profile_photo'), (req, res, next) => {
  console.log('📥 Registration Request:', req.body);
  console.log('📸 Uploaded file:', req.file?.filename || 'None');
  registerUser(req, res, next);
});

// 🔜 Future Auth Endpoints
// const { loginUser, logoutUser, verifyEmail } = require('../controllers/authController');
// router.post('/api/login', loginUser);
// router.post('/api/logout', logoutUser);
// router.post('/api/verify-email', verifyEmail);

module.exports = router;
