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
      password_hash, role,
      auth_provider = 'local',
      is_active = 1,
      is_verified = 0,
      gender = null,
      date_of_birth = null,
      terms_agreed_at = null,
      profile_photo_url = null
    } = data;

    const query = `
      INSERT INTO users (
        first_name, last_name, id_number, email, phone,
        country, region_or_province, address,
        password_hash, role,
        auth_provider, is_active, is_verified,
        gender, date_of_birth, terms_agreed_at,
        profile_photo_url
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      first_name, last_name, id_number, email, phone,
      country, region_or_province, address,
      password_hash, role,
      auth_provider, is_active, is_verified,
      gender, date_of_birth, terms_agreed_at,
      profile_photo_url
    ];

    db.query(query, values, callback);
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
