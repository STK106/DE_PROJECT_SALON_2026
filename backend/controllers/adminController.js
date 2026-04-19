const User = require('../models/User');
const Salon = require('../models/Salon');
const Booking = require('../models/Booking');

exports.getDashboard = async (req, res, next) => {
  try {
    const stats = await Booking.getAdminStats();
    res.json({ stats });
  } catch (err) {
    next(err);
  }
};

exports.getUsers = async (req, res, next) => {
  try {
    const { role, page, limit } = req.query;
    const result = await User.findAll({
      role,
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
};

exports.toggleUserActive = async (req, res, next) => {
  try {
    const user = await User.toggleActive(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found.' });
    res.json({ message: `User ${user.is_active ? 'activated' : 'blocked'}`, user });
  } catch (err) {
    next(err);
  }
};

exports.getSalons = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const result = await Salon.getAllForAdmin({
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
};

exports.approveSalon = async (req, res, next) => {
  try {
    const { approved } = req.body;
    const salon = await Salon.approve(req.params.id, approved);
    if (!salon) return res.status(404).json({ error: 'Salon not found.' });
    res.json({ message: `Salon ${approved ? 'approved' : 'rejected'}`, salon });
  } catch (err) {
    next(err);
  }
};

exports.getBookings = async (req, res, next) => {
  try {
    const { status, date, page, limit } = req.query;
    const result = await Booking.findAll({
      status, date,
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
};
