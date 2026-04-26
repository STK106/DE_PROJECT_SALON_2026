const Salon = require('../models/Salon');
const BlockedSlot = require('../models/BlockedSlot');
const Booking = require('../models/Booking');
const fs = require('fs');
const path = require('path');

const uploadsDir = path.join(__dirname, '..', 'uploads');

function sanitizeImages(images) {
  if (!Array.isArray(images)) return [];

  return images.filter((img) => {
    if (!img || typeof img !== 'string') return false;
    if (img.startsWith('http://') || img.startsWith('https://')) return true;
    if (!img.startsWith('/uploads/')) return false;

    const filename = path.basename(img);
    const filePath = path.join(uploadsDir, filename);
    return fs.existsSync(filePath);
  });
}

exports.getAll = async (req, res, next) => {
  try {
    const { search, city, page, limit } = req.query;
    const result = await Salon.findAll({
      search, city,
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 12
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const salon = await Salon.findById(req.params.id);
    if (!salon) return res.status(404).json({ error: 'Salon not found.' });

    const cleanImages = sanitizeImages(salon.images);
    if ((salon.images || []).length !== cleanImages.length) {
      await Salon.update(salon.id, { images: cleanImages });
      salon.images = cleanImages;
    }

    res.json({ salon });
  } catch (err) {
    next(err);
  }
};

exports.getMySalon = async (req, res, next) => {
  try {
    const salons = await Salon.findAllByOwner(req.user.id);
    if (!salons || salons.length === 0) return res.status(404).json({ error: 'No salon found. Please create one.' });

    const cleanSalons = salons.map(salon => {
      const cleanImages = sanitizeImages(salon.images);
      if ((salon.images || []).length !== cleanImages.length) {
        return { ...salon, images: cleanImages };
      }
      return salon;
    });

    res.json({ salons: cleanSalons, salon: cleanSalons[0] });
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const salon = await Salon.create({ ...req.body, owner_id: req.user.id });
    res.status(201).json({ message: 'Salon created. Awaiting admin approval.', salon });
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const salon = await Salon.findByOwner(req.user.id);
    if (!salon) return res.status(404).json({ error: 'Salon not found.' });

    const updated = await Salon.update(salon.id, req.body);
    res.json({ message: 'Salon updated', salon: updated });
  } catch (err) {
    next(err);
  }
};

exports.uploadImages = async (req, res, next) => {
  try {
    const salon = await Salon.findByOwner(req.user.id);
    if (!salon) return res.status(404).json({ error: 'Salon not found.' });

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No images were uploaded.' });
    }

    const imageUrls = (req.files || []).map(f => `/uploads/${f.filename}`);
    const currentImages = sanitizeImages(salon.images);
    const allImages = [...currentImages, ...imageUrls];
    const updated = await Salon.update(salon.id, { images: allImages });

    res.json({ message: 'Images uploaded', salon: updated });
  } catch (err) {
    next(err);
  }
};

exports.deleteImage = async (req, res, next) => {
  try {
    const salon = await Salon.findByOwner(req.user.id);
    if (!salon) return res.status(404).json({ error: 'Salon not found.' });

    const index = parseInt(req.params.index, 10);
    const currentImages = sanitizeImages(salon.images);

    if (Number.isNaN(index) || index < 0 || index >= currentImages.length) {
      return res.status(400).json({ error: 'Invalid image index.' });
    }

    const [removedImage] = currentImages.splice(index, 1);
    const updated = await Salon.update(salon.id, { images: currentImages });

    if (removedImage) {
      const filename = path.basename(removedImage);
      const filePath = path.join(__dirname, '..', 'uploads', filename);
      if (fs.existsSync(filePath)) {
        fs.unlink(filePath, () => {});
      }
    }

    res.json({ message: 'Image deleted', salon: updated });
  } catch (err) {
    next(err);
  }
};

exports.getStats = async (req, res, next) => {
  try {
    const stats = await Salon.getStats(req.user.id);
    if (!stats) return res.status(404).json({ error: 'Salon not found.' });
    res.json({ stats });
  } catch (err) {
    next(err);
  }
};

// Blocked slots / availability
exports.getBlockedSlots = async (req, res, next) => {
  try {
    const salon = await Salon.findByOwner(req.user.id);
    if (!salon) return res.status(404).json({ error: 'Salon not found.' });

    const slots = await BlockedSlot.findBySalon(salon.id);
    res.json({ blocked_slots: slots });
  } catch (err) {
    next(err);
  }
};

exports.addBlockedSlot = async (req, res, next) => {
  try {
    const salon = await Salon.findByOwner(req.user.id);
    if (!salon) return res.status(404).json({ error: 'Salon not found.' });

    const slot = await BlockedSlot.create({ ...req.body, salon_id: salon.id });
    res.status(201).json({ message: 'Slot blocked', blocked_slot: slot });
  } catch (err) {
    next(err);
  }
};

exports.removeBlockedSlot = async (req, res, next) => {
  try {
    const result = await BlockedSlot.delete(req.params.slotId);
    if (!result) return res.status(404).json({ error: 'Blocked slot not found.' });
    res.json({ message: 'Blocked slot removed' });
  } catch (err) {
    next(err);
  }
};

exports.rateSalon = async (req, res, next) => {
  try {
    const salon = await Salon.findById(req.params.id);
    if (!salon) return res.status(404).json({ error: 'Salon not found.' });

    const bookingId = req.body.booking_id;
    if (!bookingId) {
      return res.status(400).json({ error: 'Booking is required for rating.' });
    }

    const value = parseInt(req.body.rating, 10);
    if (Number.isNaN(value) || value < 1 || value > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5.' });
    }

    const booking = await Booking.findCompletedBookingForRating(bookingId, req.user.id, salon.id);
    if (!booking) {
      return res.status(403).json({ error: 'You can rate only from your completed booking.' });
    }

    const marked = await Booking.markRated(bookingId, req.user.id, salon.id);
    if (!marked) {
      return res.status(400).json({ error: 'You have already rated this booking.' });
    }

    const updatedSalon = await Salon.addRating(salon.id, value);
    res.json({
      message: 'Thank you for your rating!',
      rating: updatedSalon.rating,
      total_ratings: updatedSalon.total_ratings,
    });
  } catch (err) {
    next(err);
  }
};
