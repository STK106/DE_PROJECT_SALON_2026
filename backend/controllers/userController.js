const User = require('../models/User');

exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found.' });
    res.json({ user });
  } catch (err) {
    next(err);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { name, phone } = req.body;
    const user = await User.update(req.user.id, { name, phone });
    if (!user) return res.status(404).json({ error: 'User not found.' });
    res.json({ message: 'Profile updated', user });
  } catch (err) {
    next(err);
  }
};
