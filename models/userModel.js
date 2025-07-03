const db = require('../db');

const UserModel = {
  getAll: (callback) => {
    db.query('SELECT * FROM users', (err, results) => {
      if (err) {
        console.error('[DB Error] getAll:', err);
        return callback(err);
      }
      callback(null, results);
    });
  },

  getById: (id, callback) => {
    db.query('SELECT * FROM users WHERE user_id = ?', [id], (err, results) => {
      if (err) {
        console.error('[DB Error] getById:', err);
        return callback(err);
      }
      callback(null, results[0]);
    });
  },

  findByEmail: (email, callback) => {
    db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
      if (err) {
        console.error('[DB Error] findByEmail:', err);
        return callback(err);
      }
      callback(null, results[0]);
    });
  },

  create: (data, callback) => {
    const {
      first_name = '', last_name = '', id_number = '', email = '', phone = '',
      country = '', region_or_province = '', address = '',
      password_hash = '', role = 'homeowner',
      auth_provider = 'local', is_active = 1, is_verified = 0,
      gender = null, date_of_birth = null, terms_agreed_at = null,
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

    db.query(query, values, (err, result) => {
      if (err) {
        console.error('[DB Error] create user:', err);
        return callback(err);
      }
      callback(null, result);
    });
  },

  update: (id, data, callback) => {
    const { first_name, last_name, email, phone, country } = data;
    const query = `
      UPDATE users SET first_name = ?, last_name = ?, email = ?, phone = ?, country = ?
      WHERE user_id = ?
    `;
    db.query(query, [first_name, last_name, email, phone, country, id], (err, result) => {
      if (err) {
        console.error('[DB Error] update user:', err);
        return callback(err);
      }
      callback(null, result);
    });
  },

  delete: (id, callback) => {
    db.query('DELETE FROM users WHERE user_id = ?', [id], (err, result) => {
      if (err) {
        console.error('[DB Error] delete user:', err);
        return callback(err);
      }
      callback(null, result);
    });
  },

  // ✅ New: Update OTP for verification
  updateOTP: (userId, otp, expiresAt, callback) => {
    const query = `
      UPDATE users 
      SET email_verification_token = ?, email_verification_expires = ?
      WHERE user_id = ?
    `;
    db.query(query, [otp, expiresAt, userId], (err, result) => {
      if (err) {
        console.error('[DB Error] updateOTP:', err);
        return callback(err);
      }
      callback(null, result);
    });
  }
};

module.exports = UserModel;
