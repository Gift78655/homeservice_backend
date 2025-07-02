const bcrypt = require('bcryptjs');
const UserModel = require('../models/userModel');

exports.registerUser = async (req, res) => {
  try {
    const {
      first_name, last_name, id_number, email, phone,
      country, region_or_province, address, password, role
    } = req.body;

    if (!first_name || !last_name || !email || !password || !role)
      return res.status(400).json({ message: 'Missing required fields' });

    UserModel.findByEmail(email, async (err, user) => {
      if (user?.length) return res.status(409).json({ message: 'Email exists' });

      const password_hash = await bcrypt.hash(password, 10);

      const newUser = {
        first_name, last_name, id_number, email, phone,
        country, region_or_province, address, password_hash, role
      };

      UserModel.create(newUser, (err, result) => {
        if (err) return res.status(500).json({ message: 'Error inserting user', error: err });
        res.status(201).json({ message: 'User registered', user_id: result.insertId });
      });
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};
