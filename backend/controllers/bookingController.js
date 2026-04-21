const Booking = require('../models/Booking');
const Service = require('../models/Service');
const Salon = require('../models/Salon');
const Staff = require('../models/Staff');

exports.create = async (req, res, next) => {
  try {
    const { salon_id, service_id, staff_id, booking_date, start_time, notes } = req.body;
    // Validate required fields
    if (!salon_id || !service_id || !booking_date || !start_time) {
      return res.status(400).json({ error: 'Missing required fields: salon_id, service_id, booking_date, start_time.' });
    }

    const salon = await Salon.findById(salon_id);
    if (!salon || !salon.is_approved || !salon.is_active) {
      return res.status(400).json({ error: 'This salon is not available for booking yet.' });
    }

    // Get service to calculate end time
    const service = await Service.findById(service_id);
    if (!service || service.salon_id !== salon_id || !service.is_active) {
      return res.status(404).json({ error: 'Service not found.' });
    }

    // Validate staff member only if one is selected
    if (staff_id) {
      const staff = await Staff.findById(staff_id);
      if (!staff || staff.salon_id !== salon_id || !staff.is_active) {
        return res.status(400).json({ error: 'Selected staff member is not available.' });
      }
    }

    // Calculate end time
    const [hours, minutes] = start_time.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + service.duration;
    const endHours = Math.floor(totalMinutes / 60).toString().padStart(2, '0');
    const endMinutes = (totalMinutes % 60).toString().padStart(2, '0');
    const end_time = `${endHours}:${endMinutes}`;

    // Check slot availability
    const availability = await Booking.getAvailabilityTimeline(salon_id, booking_date, service.duration, staff_id);
    const isAvailable = availability.slots.some((slot) => slot.start_time === start_time && slot.available);
    if (!isAvailable) {
      return res.status(400).json({
        error: 'Selected time slot is not available.',
        available_slots: availability.available_slots,
        next_available_slots: availability.next_available_slots,
      });
    }

    const booking = await Booking.create({
      user_id: req.user.id,
      salon_id, service_id, staff_id,
      booking_date, start_time, end_time, notes
    });

    const fullBooking = await Booking.findById(booking.id);
    res.status(201).json({ message: 'Booking created', booking: fullBooking });
  } catch (err) {
    next(err);
  }
};

exports.getMyBookings = async (req, res, next) => {
  try {
    const { status, page, limit } = req.query;
    const result = await Booking.findByUser(req.user.id, {
      status,
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 10
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ error: 'Booking not found.' });

    // Verify access
    if (req.user.role === 'user' && booking.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized.' });
    }

    res.json({ booking });
  } catch (err) {
    next(err);
  }
};

exports.cancel = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ error: 'Booking not found.' });

    if (booking.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized.' });
    }

    if (['completed', 'cancelled'].includes(booking.status)) {
      return res.status(400).json({ error: 'Cannot cancel this booking.' });
    }

    const updated = await Booking.updateStatus(req.params.id, 'cancelled');
    res.json({ message: 'Booking cancelled', booking: updated });
  } catch (err) {
    next(err);
  }
};

exports.getAvailableSlots = async (req, res, next) => {
  try {
    const { salonId } = req.params;
    const { date, duration, staff_id } = req.query;

    if (!date) return res.status(400).json({ error: 'Date is required.' });

    const salon = await Salon.findById(salonId);
    if (!salon || !salon.is_approved || !salon.is_active) {
      return res.status(404).json({ error: 'Salon not found.' });
    }

    const timeline = await Booking.getAvailabilityTimeline(
      salonId,
      date,
      parseInt(duration) || 30,
      staff_id || null
    );
    res.json(timeline);
  } catch (err) {
    next(err);
  }
};

// Shopkeeper: get salon bookings
exports.getSalonBookings = async (req, res, next) => {
  try {
    const salon = req.query.salon_id
      ? await Salon.findByOwnerAndId(req.user.id, req.query.salon_id)
      : await Salon.findByOwner(req.user.id);
    if (!salon) return res.status(404).json({ error: 'Salon not found.' });

    const { status, date, page, limit } = req.query;
    const result = await Booking.findBySalon(salon.id, {
      status, date,
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
};

// Shopkeeper: update booking status
exports.updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ['confirmed', 'completed', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status.' });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ error: 'Booking not found.' });

    // Verify salon ownership
    const salon = await Salon.findByOwnerAndId(req.user.id, booking.salon_id);
    if (!salon) {
      return res.status(403).json({ error: 'Not authorized.' });
    }

    // Enforce valid status transitions
    if (booking.status === 'pending' && !['confirmed', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Pending booking can only be confirmed or rejected.' });
    }

    if (booking.status === 'confirmed' && status !== 'completed') {
      return res.status(400).json({ error: 'Confirmed booking can only be marked completed.' });
    }

    if (['completed', 'rejected', 'cancelled'].includes(booking.status)) {
      return res.status(400).json({ error: 'This booking status cannot be changed.' });
    }

    const updated = await Booking.updateStatus(req.params.id, status);
    res.json({ message: `Booking ${status}`, booking: updated });
  } catch (err) {
    next(err);
  }
};
