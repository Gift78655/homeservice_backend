const bcrypt = require('bcryptjs');
const path = require('path');
const nodemailer = require('nodemailer');
const db = require('../db');

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

// 📧 Mailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
});

// 🚀 Step 1: Request OTP
exports.requestOtp = async (req, res) => {
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

    const [existing] = await db.promise().query('SELECT * FROM pending_users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ message: 'Pending registration already exists for this email' });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const formattedDOB = date_of_birth || null;
    const formattedTerms = formatMySQLDateTime(terms_agreed_at);
    let profile_photo_url = null;
    if (req.file) {
      profile_photo_url = `/uploads/${req.file.filename}`;
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    const insertQuery = `INSERT INTO pending_users (
      first_name, last_name, id_number, email, phone, country, region_or_province, address,
      password_hash, role, gender, date_of_birth, terms_agreed_at, profile_photo_url,
      otp_code, otp_expires
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const values = [
      first_name, last_name, id_number, email, phone, country, region_or_province, address,
      password_hash, role, gender || null, formattedDOB, formattedTerms, profile_photo_url,
      otp, otpExpiry
    ];

    await db.promise().query(insertQuery, values);

    await transporter.sendMail({
      from: `"Home Services" <${process.env.MAIL_USER}>`,
      to: email,
      subject: 'Verify Your Email (OTP)',
      html: `<p>Hello ${first_name},</p><p>Your OTP code is: <strong>${otp}</strong></p><p>This code will expire in 10 minutes.</p>`
    });

    res.status(200).json({ message: 'OTP sent to email. Please verify.', otp_sent: true, user_id: email });
  } catch (err) {
    console.error('❌ OTP Request Error:', err);
    res.status(500).json({ message: 'Server error', error: err });
  }
};

// 🔐 Step 2: Verify OTP and Register
exports.verifyOtp = async (req, res) => {
  const { userId, otp } = req.body;

  if (!userId || !otp) {
    return res.status(400).json({ message: 'Missing user or OTP' });
  }

  try {
    const [rows] = await db.promise().query(
      'SELECT * FROM pending_users WHERE email = ? AND otp_code = ?',
      [userId, otp]
    );

    if (rows.length === 0) return res.status(401).json({ message: 'Invalid OTP or email' });

    const user = rows[0];
    if (new Date(user.otp_expires) < new Date()) {
      return res.status(410).json({ message: 'OTP expired' });
    }

    const insertUserQuery = `INSERT INTO users (
      first_name, last_name, id_number, email, phone, country, region_or_province, address,
      password_hash, role, gender, date_of_birth, terms_agreed_at, profile_photo_url,
      is_verified, is_active, auth_provider
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 1, 'local')`;

    const userValues = [
      user.first_name, user.last_name, user.id_number, user.email, user.phone,
      user.country, user.region_or_province, user.address,
      user.password_hash, user.role, user.gender, user.date_of_birth,
      user.terms_agreed_at, user.profile_photo_url
    ];

    await db.promise().query(insertUserQuery, userValues);
    await db.promise().query('DELETE FROM pending_users WHERE email = ?', [userId]);

    return res.json({ message: 'Email verified successfully' });
  } catch (error) {
    console.error('❌ OTP Verification Error:', error);
    return res.status(500).json({ message: 'Server error', error });
  }
};

// 🧩 Optional: Step 3 if you want separate finalization (not strictly needed now)
exports.registerFinalUser = (req, res) => {
  res.status(200).json({ message: 'User already registered during OTP step' });
};
