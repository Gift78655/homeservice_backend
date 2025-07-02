const bcrypt = require('bcryptjs');
const UserModel = require('../models/userModel');

// Utility: format ISO to MySQL DATETIME
const formatMySQLDateTime = (isoString) => {
  return new Date(isoString).toISOString().slice(0, 19).replace('T', ' ');
};

exports.getAllUsers = (req, res) => {
  UserModel.getAll((err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
};

exports.getUserById = (req, res) => {
  const id = req.params.id;
  UserModel.getById(id, (err, results) => {
    if (err) return res.status(500).json({ error: err });
    if (results.length === 0) return res.status(404).json({ message: 'User not found' });
    res.json(results[0]);
  });
};

exports.createUser = async (req, res) => {
  try {
    const {
      first_name, last_name, id_number, email, phone,
      country, region_or_province, address,
      password, role,
      gender, date_of_birth, terms_agreed_at
    } = req.body;

    if (!first_name || !last_name || !email || !password || !role) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const formattedTerms = terms_agreed_at ? formatMySQLDateTime(terms_agreed_at) : null;
    const formattedDOB = date_of_birth || null;

    let profile_photo_url = null;
    if (req.file) {
      profile_photo_url = `/uploads/${req.file.filename}`;
    }

    const userData = {
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

    UserModel.create(userData, (err, result) => {
      if (err) {
        console.error('❌ Insert error:', err);
        return res.status(500).json({ message: 'Insert error', error: err });
      }
      res.status(201).json({ message: 'User created', user_id: result.insertId });
    });
  } catch (err) {
    console.error('❌ Error creating user:', err);
    res.status(500).json({ message: 'Server error', error: err });
  }
};

exports.updateUser = (req, res) => {
  const id = req.params.id;
  UserModel.update(id, req.body, (err) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: 'User updated' });
  });
};

exports.deleteUser = (req, res) => {
  const id = req.params.id;
  UserModel.delete(id, (err) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: 'User deleted' });
  });
};
