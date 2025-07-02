// backend/models/userModel.js
const db = require('../db');

const UserModel = {
  getAll: (callback) => {
    db.query('SELECT * FROM users', callback);
  },

  getById: (id, callback) => {
    db.query('SELECT * FROM users WHERE user_id = ?', [id], callback);
  },

  create: (data, callback) => {
    const { first_name, last_name, id_number, email, phone, country } = data;
    const query = `
      INSERT INTO users (first_name, last_name, id_number, email, phone, country)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    db.query(query, [first_name, last_name, id_number, email, phone, country], callback);
  },

  update: (id, data, callback) => {
    const { first_name, last_name, id_number, email, phone, country } = data;
    const query = `
      UPDATE users SET first_name = ?, last_name = ?, id_number = ?, email = ?, phone = ?, country = ?
      WHERE user_id = ?
    `;
    db.query(query, [first_name, last_name, id_number, email, phone, country, id], callback);
  },

  delete: (id, callback) => {
    db.query('DELETE FROM users WHERE user_id = ?', [id], callback);
  }
};

module.exports = UserModel;
