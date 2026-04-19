const { query } = require('../config/db');

const Staff = {
  async create({ salon_id, name, email, phone, role, specialization }) {
    const result = await query(
      `INSERT INTO staff (salon_id, name, email, phone, role, specialization)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [salon_id, name, email, phone, role || 'stylist', specialization]
    );
    return result.rows[0];
  },

  async findById(id) {
    const result = await query('SELECT * FROM staff WHERE id = $1', [id]);
    return result.rows[0];
  },

  async findBySalon(salonId) {
    const result = await query(
      'SELECT * FROM staff WHERE salon_id = $1 AND is_active = true ORDER BY name',
      [salonId]
    );
    return result.rows;
  },

  async update(id, fields) {
    const allowed = ['name', 'email', 'phone', 'role', 'specialization', 'is_active'];
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
      `UPDATE staff SET ${sets.join(', ')} WHERE id = $${idx} RETURNING *`,
      values
    );
    return result.rows[0];
  },

  async delete(id) {
    const result = await query(
      'UPDATE staff SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *',
      [id]
    );
    return result.rows[0];
  }
};

module.exports = Staff;
