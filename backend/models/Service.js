const { query } = require('../config/db');

const Service = {
  async create({ salon_id, name, description, price, duration, category }) {
    const result = await query(
      `INSERT INTO services (salon_id, name, description, price, duration, category)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [salon_id, name, description, price, duration || 30, category]
    );
    return result.rows[0];
  },

  async findById(id) {
    const result = await query('SELECT * FROM services WHERE id = $1', [id]);
    return result.rows[0];
  },

  async findBySalon(salonId, activeOnly = true) {
    const condition = activeOnly ? 'AND is_active = true' : '';
    const result = await query(
      `SELECT * FROM services WHERE salon_id = $1 ${condition} ORDER BY category, name`,
      [salonId]
    );
    return result.rows;
  },

  async update(id, fields) {
    const allowed = ['name', 'description', 'price', 'duration', 'category', 'is_active'];
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
      `UPDATE services SET ${sets.join(', ')} WHERE id = $${idx} RETURNING *`,
      values
    );
    return result.rows[0];
  },

  async delete(id) {
    const result = await query(
      'UPDATE services SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *',
      [id]
    );
    return result.rows[0];
  }
};

module.exports = Service;
