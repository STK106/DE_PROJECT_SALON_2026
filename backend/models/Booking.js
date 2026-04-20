const { query } = require('../config/db');

const Booking = {
  async create({ user_id, salon_id, service_id, staff_id, booking_date, start_time, end_time, notes }) {
    const result = await query(
      `INSERT INTO bookings (user_id, salon_id, service_id, staff_id, booking_date, start_time, end_time, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [user_id, salon_id, service_id, staff_id || null, booking_date, start_time, end_time, notes]
    );
    return result.rows[0];
  },

  async findById(id) {
    const result = await query(
      `SELECT b.*, COALESCE(b.user_rated, false) as user_rated,
       s.name as salon_name, sv.name as service_name, sv.price as service_price,
       sv.duration as service_duration, u.name as user_name, u.email as user_email,
       st.name as staff_name
       FROM bookings b
       JOIN salons s ON b.salon_id = s.id
       JOIN services sv ON b.service_id = sv.id
       JOIN users u ON b.user_id = u.id
       LEFT JOIN staff st ON b.staff_id = st.id
       WHERE b.id = $1`,
      [id]
    );
    return result.rows[0];
  },

  async findByUser(userId, { status, page = 1, limit = 10 }) {
    const offset = (page - 1) * limit;
    const conditions = ['b.user_id = $1'];
    const params = [userId];
    let idx = 2;

    if (status) {
      conditions.push(`b.status = $${idx}`);
      params.push(status);
      idx++;
    }

    params.push(limit, offset);
    const where = conditions.join(' AND ');

    const result = await query(
      `SELECT b.*, COALESCE(b.user_rated, false) as user_rated,
       s.name as salon_name, s.address as salon_address,
       sv.name as service_name, sv.price as service_price, sv.duration as service_duration,
       st.name as staff_name
       FROM bookings b
       JOIN salons s ON b.salon_id = s.id
       JOIN services sv ON b.service_id = sv.id
       LEFT JOIN staff st ON b.staff_id = st.id
       WHERE ${where}
       ORDER BY b.booking_date DESC, b.start_time DESC
       LIMIT $${idx} OFFSET $${idx + 1}`,
      params
    );

    const countParams = params.slice(0, -2);
    const countResult = await query(
      `SELECT COUNT(*) FROM bookings b WHERE ${where}`,
      countParams
    );

    return {
      bookings: result.rows,
      total: parseInt(countResult.rows[0].count),
      page,
      limit
    };
  },

  async findBySalon(salonId, { status, date, page = 1, limit = 20 }) {
    const offset = (page - 1) * limit;
    const conditions = ['b.salon_id = $1'];
    const params = [salonId];
    let idx = 2;

    if (status) {
      conditions.push(`b.status = $${idx}`);
      params.push(status);
      idx++;
    }

    if (date) {
      conditions.push(`b.booking_date = $${idx}`);
      params.push(date);
      idx++;
    }

    params.push(limit, offset);
    const where = conditions.join(' AND ');

    const result = await query(
      `SELECT b.*, u.name as user_name, u.email as user_email, u.phone as user_phone,
       sv.name as service_name, sv.price as service_price, sv.duration as service_duration,
       st.name as staff_name
       FROM bookings b
       JOIN users u ON b.user_id = u.id
       JOIN services sv ON b.service_id = sv.id
       LEFT JOIN staff st ON b.staff_id = st.id
       WHERE ${where}
       ORDER BY b.booking_date DESC, b.start_time ASC
       LIMIT $${idx} OFFSET $${idx + 1}`,
      params
    );

    const countParams = params.slice(0, -2);
    const countResult = await query(
      `SELECT COUNT(*) FROM bookings b WHERE ${where}`,
      countParams
    );

    return {
      bookings: result.rows,
      total: parseInt(countResult.rows[0].count),
      page,
      limit
    };
  },

  async updateStatus(id, status) {
    const result = await query(
      `UPDATE bookings SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`,
      [status, id]
    );
    return result.rows[0];
  },

  async hasCompletedBooking(userId, salonId) {
    const result = await query(
      `SELECT EXISTS(
        SELECT 1 FROM bookings
        WHERE user_id = $1 AND salon_id = $2 AND status = 'completed'
      ) AS has_completed`,
      [userId, salonId]
    );
    return result.rows[0]?.has_completed === true;
  },

  async findCompletedBookingForRating(bookingId, userId, salonId) {
    const result = await query(
      `SELECT *
       FROM bookings
       WHERE id = $1
         AND user_id = $2
         AND salon_id = $3
         AND status = 'completed'
       LIMIT 1`,
      [bookingId, userId, salonId]
    );
    return result.rows[0];
  },

  async markRated(bookingId, userId, salonId) {
    const result = await query(
      `UPDATE bookings
       SET user_rated = true,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
         AND user_id = $2
         AND salon_id = $3
         AND status = 'completed'
         AND COALESCE(user_rated, false) = false
       RETURNING id`,
      [bookingId, userId, salonId]
    );
    return result.rows.length > 0;
  },

  async hasAlreadyRated(bookingId, userId, salonId) {
    const result = await query(
      `SELECT EXISTS(
        SELECT 1 FROM bookings
        WHERE id = $1 AND user_id = $2 AND salon_id = $3 AND status = 'completed' AND COALESCE(user_rated, false) = true
      ) AS has_rated`,
      [bookingId, userId, salonId]
    );
    return result.rows[0]?.has_rated === true;
  },

  async getAvailabilityTimeline(salonId, date, duration, staffId = null) {
    const salonResult = await query(
      'SELECT opening_time, closing_time, working_days FROM salons WHERE id = $1',
      [salonId]
    );

    if (!salonResult.rows[0]) {
      return { slots: [], available_slots: [], next_available_slots: [] };
    }

    const salon = salonResult.rows[0];
    const slotDuration = duration || 30;

    const bookingConditions = ['salon_id = $1', 'booking_date = $2', "status NOT IN ('cancelled', 'rejected')"];
    const bookingParams = [salonId, date];
    if (staffId) {
      bookingConditions.push(`staff_id = $3`);
      bookingParams.push(staffId);
    }

    const bookingsResult = await query(
      `SELECT start_time, end_time, staff_id
       FROM bookings
       WHERE ${bookingConditions.join(' AND ')}
       ORDER BY start_time`,
      bookingParams
    );

    const blockedResult = await query(
      `SELECT start_time, end_time, is_full_day
       FROM blocked_slots
       WHERE salon_id = $1 AND blocked_date = $2`,
      [salonId, date]
    );

    if (blockedResult.rows.some((blockedSlot) => blockedSlot.is_full_day)) {
      return { slots: [], available_slots: [], next_available_slots: [] };
    }

    const booked = bookingsResult.rows;
    const blocked = blockedResult.rows;
    const slots = [];
    const opening = timeToMinutes(salon.opening_time);
    const closing = timeToMinutes(salon.closing_time);

    for (let time = opening; time + slotDuration <= closing; time += 30) {
      const slotStart = minutesToTime(time);
      const slotEnd = minutesToTime(time + slotDuration);

      const bookingConflict = booked.find((booking) =>
        timeOverlaps(slotStart, slotEnd, booking.start_time, booking.end_time)
      );

      const blockedConflict = blocked.find(
        (blockedSlot) =>
          blockedSlot.start_time &&
          blockedSlot.end_time &&
          timeOverlaps(slotStart, slotEnd, blockedSlot.start_time, blockedSlot.end_time)
      );

      slots.push({
        start_time: slotStart,
        end_time: slotEnd,
        available: !bookingConflict && !blockedConflict,
        reason: bookingConflict ? 'busy' : blockedConflict ? 'blocked' : null,
      });
    }

    const availableSlots = slots.filter((slot) => slot.available);

    return {
      slots,
      available_slots: availableSlots,
      next_available_slots: availableSlots.slice(0, 3),
    };
  },

  async getAvailableSlots(salonId, date, duration, staffId = null) {
    const timeline = await this.getAvailabilityTimeline(salonId, date, duration, staffId);
    return timeline.available_slots;
  },

  async findAll({ status, date, page = 1, limit = 20 }) {
    const offset = (page - 1) * limit;
    const conditions = [];
    const params = [];
    let idx = 1;

    if (status) {
      conditions.push(`b.status = $${idx}`);
      params.push(status);
      idx++;
    }

    if (date) {
      conditions.push(`b.booking_date = $${idx}`);
      params.push(date);
      idx++;
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    params.push(limit, offset);

    const result = await query(
      `SELECT b.*, u.name as user_name, s.name as salon_name, 
       sv.name as service_name, sv.price as service_price
       FROM bookings b
       JOIN users u ON b.user_id = u.id
       JOIN salons s ON b.salon_id = s.id
       JOIN services sv ON b.service_id = sv.id
       ${where}
       ORDER BY b.created_at DESC 
       LIMIT $${idx} OFFSET $${idx + 1}`,
      params
    );

    const countParams = params.slice(0, -2);
    const countResult = await query(
      `SELECT COUNT(*) FROM bookings b ${where}`,
      countParams
    );

    return {
      bookings: result.rows,
      total: parseInt(countResult.rows[0].count),
      page,
      limit
    };
  },

  async getAdminStats() {
    const users = await query(`SELECT COUNT(*) FROM users WHERE role = 'user'`);
    const salons = await query('SELECT COUNT(*) FROM salons');
    const bookings = await query('SELECT COUNT(*) FROM bookings');
    const todayBookings = await query(
      'SELECT COUNT(*) FROM bookings WHERE booking_date = CURRENT_DATE'
    );
    const pendingBookings = await query(
      `SELECT COUNT(*) FROM bookings WHERE status = 'pending'`
    );
    const pendingSalons = await query(
      `SELECT COUNT(*) FROM salons WHERE is_approved = false`
    );

    return {
      total_users: parseInt(users.rows[0].count),
      total_salons: parseInt(salons.rows[0].count),
      total_bookings: parseInt(bookings.rows[0].count),
      today_bookings: parseInt(todayBookings.rows[0].count),
      pending_bookings: parseInt(pendingBookings.rows[0].count),
      pending_salons: parseInt(pendingSalons.rows[0].count)
    };
  }
};

// Helper functions
function timeToMinutes(time) {
  const parts = time.split(':');
  return parseInt(parts[0]) * 60 + parseInt(parts[1]);
}

function minutesToTime(minutes) {
  const h = Math.floor(minutes / 60).toString().padStart(2, '0');
  const m = (minutes % 60).toString().padStart(2, '0');
  return `${h}:${m}`;
}

function timeOverlaps(s1, e1, s2, e2) {
  const start1 = timeToMinutes(s1);
  const end1 = timeToMinutes(e1);
  const start2 = timeToMinutes(s2);
  const end2 = timeToMinutes(e2);
  return start1 < end2 && start2 < end1;
}

module.exports = Booking;
