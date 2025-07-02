// backend/db.js
const mysql = require('mysql2');
require('dotenv').config();

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: true } : false
});

connection.connect(err => {
  if (err) {
    console.error('❌ MySQL Connection Error:', err);
  } else {
    console.log('✅ Connected to Azure MySQL Database');
  }
});

module.exports = connection;
