const { query } = require('../config/db');

const Salon = {
  async create({ owner_id, name, description, address, city, state, phone, email, opening_time, closing_time, working_days }) {
    const result = await query(
      `INSERT INTO salons (owner_id, name, description, address, city, state, phone, email, opening_time, closing_time, working_days)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [owner_id, name, description, address, city, state, phone, email, opening_time || '09:00', closing_time || '21:00', working_days || 'Mon,Tue,Wed,Thu,Fri,Sat']
    );
    return result.rows[0];
  },

  async findById(id) {
    const result = await query(
      `SELECT s.*, u.name as owner_name 
       FROM salons s JOIN users u ON s.owner_id = u.id 
       WHERE s.id = $1`,
      [id]
    );
    return result.rows[0];
  },

  async findByOwner(ownerId) {
    const result = await query('SELECT * FROM salons WHERE owner_id = $1', [ownerId]);
    return result.rows[0];
  },

  async findAll({ search, city, page = 1, limit = 12, approved_only = true }) {
    const offset = (page - 1) * limit;
    const conditions = [];
    const params = [];
    let idx = 1;

    if (approved_only) {
      conditions.push(`s.is_approved = true`);
      conditions.push(`s.is_active = true`);
    }

    if (search) {
      conditions.push(`(s.name ILIKE $${idx} OR s.city ILIKE $${idx})`);
      params.push(`%${search}%`);
      idx++;
    }

    if (city) {
      conditions.push(`s.city ILIKE $${idx}`);
      params.push(`%${city}%`);
      idx++;
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    params.push(limit, offset);
    const result = await query(
      `SELECT s.*, u.name as owner_name,
       (SELECT COUNT(*) FROM services sv WHERE sv.salon_id = s.id AND sv.is_active = true) as service_count
       FROM salons s JOIN users u ON s.owner_id = u.id
       ${where}
       ORDER BY s.rating DESC, s.created_at DESC
       LIMIT $${idx} OFFSET $${idx + 1}`,
      params
    );

    const countParams = params.slice(0, -2);
    const countResult = await query(
      `SELECT COUNT(*) FROM salons s ${where}`,
      countParams
    );

    return {
      salons: result.rows,
      total: parseInt(countResult.rows[0].count),
      page,
      limit
    };
  },

  async update(id, fields) {
    const allowed = ['name', 'description', 'address', 'city', 'state', 'phone', 'email', 'images', 'opening_time', 'closing_time', 'working_days'];
    const sets = [];
    const values = [];
    let idx = 1;

    for (const key of allowed) {
      if (fields[key] !== undefined) {
        sets.push(`${key} = $${idx}`);
        values.push(fields[key]);
        idx++;
      }
    }
    if (sets.length === 0) return null;

    sets.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const result = await query(
      `UPDATE salons SET ${sets.join(', ')} WHERE id = $${idx} RETURNING *`,
      values
    );
    return result.rows[0];
  },

  async approve(id, approved) {
    const result = await query(
      `UPDATE salons SET is_approved = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`,
      [approved, id]
    );
    return result.rows[0];
  },

  async toggleActive(id) {
    const result = await query(
      `UPDATE salons SET is_active = NOT is_active, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`,
      [id]
    );
    return result.rows[0];
  },

  async addRating(id, rating) {
    const salon = await query(
      'SELECT rating, total_ratings FROM salons WHERE id = $1',
      [id]
    );
    if (!salon.rows[0]) return null;

    const currentRating = parseFloat(salon.rows[0].rating || 0);
    const currentTotal = parseInt(salon.rows[0].total_ratings || 0, 10);
    const nextTotal = currentTotal + 1;
    const nextRating = ((currentRating * currentTotal) + rating) / nextTotal;

    const updated = await query(
      `UPDATE salons
       SET rating = $1,
           total_ratings = $2,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING *`,
      [nextRating.toFixed(1), nextTotal, id]
    );

    return updated.rows[0];
  },

  async getStats(ownerId) {
    const salon = await query('SELECT id FROM salons WHERE owner_id = $1', [ownerId]);
    if (!salon.rows[0]) return null;
    const salonId = salon.rows[0].id;

    const totalBookings = await query(
      'SELECT COUNT(*) FROM bookings WHERE salon_id = $1',
      [salonId]
    );
    const todayBookings = await query(
      'SELECT COUNT(*) FROM bookings WHERE salon_id = $1 AND booking_date = CURRENT_DATE',
      [salonId]
    );
    const pendingBookings = await query(
      `SELECT COUNT(*) FROM bookings WHERE salon_id = $1 AND status = 'pending'`,
      [salonId]
    );
    const completedBookings = await query(
      `SELECT COUNT(*) FROM bookings WHERE salon_id = $1 AND status = 'completed'`,
      [salonId]
    );

    return {
      salon_id: salonId,
      total_bookings: parseInt(totalBookings.rows[0].count),
      today_bookings: parseInt(todayBookings.rows[0].count),
      pending_bookings: parseInt(pendingBookings.rows[0].count),
      completed_bookings: parseInt(completedBookings.rows[0].count)
    };
  },

  async getAllForAdmin({ page = 1, limit = 20 }) {
    const offset = (page - 1) * limit;
    const result = await query(
      `SELECT s.*, u.name as owner_name, u.email as owner_email
       FROM salons s JOIN users u ON s.owner_id = u.id
       ORDER BY s.created_at DESC LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    const countResult = await query('SELECT COUNT(*) FROM salons');
    return {
      salons: result.rows,
      total: parseInt(countResult.rows[0].count),
      page,
      limit
    };
  }
};

module.exports = Salon;
