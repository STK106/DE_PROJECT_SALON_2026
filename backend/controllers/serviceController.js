const Service = require('../models/Service');
const Salon = require('../models/Salon');

exports.getBySalon = async (req, res, next) => {
  try {
    const services = await Service.findBySalon(req.params.salonId);
    res.json({ services });
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const salon = await Salon.findByOwner(req.user.id);
    if (!salon) return res.status(404).json({ error: 'Salon not found.' });

    const service = await Service.create({ ...req.body, salon_id: salon.id });
    res.status(201).json({ message: 'Service created', service });
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ error: 'Service not found.' });

    // Verify ownership
    const salon = await Salon.findByOwner(req.user.id);
    if (!salon || salon.id !== service.salon_id) {
      return res.status(403).json({ error: 'Not authorized.' });
    }

    const updated = await Service.update(req.params.id, req.body);
    res.json({ message: 'Service updated', service: updated });
  } catch (err) {
    next(err);
  }
};

exports.delete = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ error: 'Service not found.' });

    const salon = await Salon.findByOwner(req.user.id);
    if (!salon || salon.id !== service.salon_id) {
      return res.status(403).json({ error: 'Not authorized.' });
    }

    await Service.delete(req.params.id);
    res.json({ message: 'Service deleted' });
  } catch (err) {
    next(err);
  }
};

exports.getMyServices = async (req, res, next) => {
  try {
    const salon = await Salon.findByOwner(req.user.id);
    if (!salon) return res.status(404).json({ error: 'Salon not found.' });

    const services = await Service.findBySalon(salon.id, false);
    res.json({ services });
  } catch (err) {
    next(err);
  }
};
