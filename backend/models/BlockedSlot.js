const { query } = require('../config/db');

const BlockedSlot = {
  async create({ salon_id, blocked_date, start_time, end_time, reason, is_full_day }) {
    const result = await query(
      `INSERT INTO blocked_slots (salon_id, blocked_date, start_time, end_time, reason, is_full_day)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [salon_id, blocked_date, start_time, end_time, reason, is_full_day || false]
    );
    return result.rows[0];
  },

  async findBySalon(salonId) {
    const result = await query(
      `SELECT * FROM blocked_slots WHERE salon_id = $1 AND blocked_date >= CURRENT_DATE ORDER BY blocked_date`,
      [salonId]
    );
    return result.rows;
  },

  async findById(id) {
    const result = await query('SELECT * FROM blocked_slots WHERE id = $1 LIMIT 1', [id]);
    return result.rows[0];
  },

  async delete(id) {
    const result = await query('DELETE FROM blocked_slots WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  }
};

module.exports = BlockedSlot;
