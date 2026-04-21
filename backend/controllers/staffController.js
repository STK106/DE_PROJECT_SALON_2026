const Staff = require('../models/Staff');
const Salon = require('../models/Salon');

async function getOwnedSalon(req, salonId) {
  if (salonId) {
    return Salon.findByOwnerAndId(req.user.id, salonId);
  }
  return Salon.findByOwner(req.user.id);
}

exports.getBySalon = async (req, res, next) => {
  try {
    const salon = await Salon.findById(req.params.salonId);
    if (!salon || !salon.is_approved || !salon.is_active) {
      return res.status(404).json({ error: 'Salon not found.' });
    }

    const staff = await Staff.findBySalon(req.params.salonId);
    res.json({ staff });
  } catch (err) {
    next(err);
  }
};

exports.getMyStaff = async (req, res, next) => {
  try {
    const salon = await getOwnedSalon(req, req.query.salon_id);
    if (!salon) return res.status(404).json({ error: 'Salon not found.' });

    const staff = await Staff.findBySalon(salon.id);
    res.json({ staff });
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const salon = await getOwnedSalon(req, req.body.salon_id || req.query.salon_id);
    if (!salon) return res.status(404).json({ error: 'Salon not found.' });

    const staff = await Staff.create({ ...req.body, salon_id: salon.id });
    res.status(201).json({ message: 'Staff member added', staff });
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const member = await Staff.findById(req.params.id);
    if (!member) return res.status(404).json({ error: 'Staff member not found.' });

    const salon = await Salon.findByOwnerAndId(req.user.id, member.salon_id);
    if (!salon) {
      return res.status(403).json({ error: 'Not authorized.' });
    }

    const updated = await Staff.update(req.params.id, req.body);
    res.json({ message: 'Staff member updated', staff: updated });
  } catch (err) {
    next(err);
  }
};

exports.delete = async (req, res, next) => {
  try {
    const member = await Staff.findById(req.params.id);
    if (!member) return res.status(404).json({ error: 'Staff member not found.' });

    const salon = await Salon.findByOwnerAndId(req.user.id, member.salon_id);
    if (!salon) {
      return res.status(403).json({ error: 'Not authorized.' });
    }

    await Staff.delete(req.params.id);
    res.json({ message: 'Staff member removed' });
  } catch (err) {
    next(err);
  }
};
