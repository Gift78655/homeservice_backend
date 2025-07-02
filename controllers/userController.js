// backend/controllers/userController.js
const UserModel = require('../models/userModel');

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

exports.createUser = (req, res) => {
  UserModel.create(req.body, (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.status(201).json({ message: 'User created', userId: result.insertId });
  });
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
