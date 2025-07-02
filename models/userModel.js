// backend/models/userModel.js
const db = require('../db');

const UserModel = {
  getAll: (callback) => {
    db.query('SELECT * FROM users', callback);
  },

  getById: (id, callback) => {
    db.query('SELECT * FROM users WHERE user_id = ?', [id], callback);
  },

  findByEmail: (email, callback) => {
    db.query('SELECT * FROM users WHERE email = ?', [email], callback);
  },

  create: (data, callback) => {
    const {
      first_name, last_name, id_number, email, phone,
      country, region_or_province, address,
      password_hash, role
    } = data;

    const query = `
      INSERT INTO users (
        first_name, last_name, id_number, email, phone,
        country, region_or_province, address,
        password_hash, role, is_active, is_verified
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 0)
    `;

    db.query(
      query,
      [
        first_name, last_name, id_number, email, phone,
        country, region_or_province, address,
        password_hash, role
      ],
      callback
    );
  },

  update: (id, data, callback) => {
    const { first_name, last_name, email, phone, country } = data;
    const query = `
      UPDATE users SET first_name = ?, last_name = ?, email = ?, phone = ?, country = ?
      WHERE user_id = ?
    `;
    db.query(query, [first_name, last_name, email, phone, country, id], callback);
  },

  delete: (id, callback) => {
    db.query('DELETE FROM users WHERE user_id = ?', [id], callback);
  }
};

module.exports = UserModel;
