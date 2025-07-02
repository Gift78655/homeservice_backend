// backend/controllers/authController.js
const bcrypt = require('bcryptjs');
const UserModel = require('../models/userModel');
const path = require('path');

// 🔧 Format ISO to MySQL DATETIME
function formatMySQLDateTime(isoString) {
  try {
    if (!isoString) return null;
    return new Date(isoString).toISOString().slice(0, 19).replace('T', ' ');
  } catch (err) {
    console.error('❌ Invalid datetime format:', isoString);
    return null;
  }
}

exports.registerUser = async (req, res) => {
  try {
    // 💡 If multipart/form-data, req.body comes as stringified fields
    const body = req.body;

    const {
      first_name, last_name, id_number, email, phone,
      country, region_or_province, address,
      password, role,
      gender, date_of_birth, terms_agreed_at
    } = body;

    // ✅ 1. Validate mandatory fields
    if (!first_name || !last_name || !email || !password || !role) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // ✅ 2. Check for existing email
    UserModel.findByEmail(email, async (err, existingUser) => {
      if (err) return res.status(500).json({ message: 'Database error', error: err });
      if (existingUser && existingUser.length > 0) {
        return res.status(409).json({ message: 'Email already exists' });
      }

      // ✅ 3. Secure the password
      const password_hash = await bcrypt.hash(password, 10);

      // ✅ 4. Optional fields formatting
      const formattedDOB = date_of_birth || null;
      const formattedTerms = formatMySQLDateTime(terms_agreed_at);

      // ✅ 5. Handle file upload
      let profile_photo_url = null;
      if (req.file) {
        profile_photo_url = `/uploads/${req.file.filename}`;
      }

      // ✅ 6. Build new user object
      const newUser = {
        first_name,
        last_name,
        id_number,
        email,
        phone,
        country,
        region_or_province,
        address,
        password_hash,
        role,
        auth_provider: 'local',
        is_active: 1,
        is_verified: 0,
        gender: gender || null,
        date_of_birth: formattedDOB,
        terms_agreed_at: formattedTerms,
        profile_photo_url
      };

      // ✅ 7. Save to DB
      UserModel.create(newUser, (err, result) => {
        if (err) {
          console.error('❌ Insert error:', err);
          console.log('📦 Payload:', newUser);
          return res.status(500).json({ message: 'Error inserting user', error: err });
        }

        res.status(201).json({
          message: 'User registered successfully',
          user_id: result.insertId
        });
      });
    });
  } catch (err) {
    console.error('❌ Server crash:', err);
    res.status(500).json({ message: 'Server error', error: err });
  }
};
