const express = require('express');
const router = express.Router();
const { registerUser } = require('../controllers/authController');

router.post('/api/register', registerUser); // ✅ THIS MUST MATCH

module.exports = router;
