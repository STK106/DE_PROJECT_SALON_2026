const { query } = require('../config/db');

const BlockedSlot = {
  async create({ salon_id, staff_id, blocked_date, start_time, end_time, reason, is_full_day }) {
    const result = await query(
      `INSERT INTO blocked_slots (salon_id, staff_id, blocked_date, start_time, end_time, reason, is_full_day)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [salon_id, staff_id || null, blocked_date, start_time, end_time, reason, is_full_day || false]
    );
    return result.rows[0];
  },

  async findBySalon(salonId) {
    const result = await query(
      `SELECT bs.*, s.name AS staff_name
       FROM blocked_slots bs
       LEFT JOIN staff s ON s.id = bs.staff_id
       WHERE bs.salon_id = $1 AND bs.blocked_date >= CURRENT_DATE
       ORDER BY bs.blocked_date`,
      [salonId]
    );
    return result.rows;
  },

  async delete(id) {
    const result = await query('DELETE FROM blocked_slots WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  }
};

module.exports = BlockedSlot;
