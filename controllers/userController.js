const bcrypt = require('bcryptjs');
const UserModel = require('../models/userModel');
const nodemailer = require('nodemailer');

// Utility: format ISO to MySQL DATETIME
const formatMySQLDateTime = (isoString) => {
  return new Date(isoString).toISOString().slice(0, 19).replace('T', ' ');
};

// Configure email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
});

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

      // 📤 Generate and send OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      UserModel.updateOTP(result.insertId, otp, otpExpiry, async (err2) => {
        if (err2) return res.status(500).json({ message: 'Failed to store OTP', error: err2 });

        const subject = "Verify Your Email (OTP)";
        const html = `<p>Hello ${first_name},</p><p>Your OTP code is: <strong>${otp}</strong></p><p>This code will expire in 10 minutes.</p>`;

        try {
          await transporter.sendMail({
            from: `"Home Services" <${process.env.MAIL_USER}>`,
            to: email,
            subject,
            html
          });

          res.status(200).json({
            message: 'OTP sent to email. Please verify.',
            user_id: result.insertId,
            otp_sent: true
          });
        } catch (emailErr) {
          console.error('❌ Failed to send OTP email:', emailErr);
          res.status(500).json({ message: 'OTP email failed', error: emailErr });
        }
      });
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
