const { query } = require('../config/db');
const bcrypt = require('bcryptjs');

const User = {
  async create({ name, email, password, phone, role = 'user' }) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await query(
      `INSERT INTO users (name, email, password, phone, role) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING id, name, email, phone, role, avatar, is_active, created_at`,
      [name, email, hashedPassword, phone, role]
    );
    return result.rows[0];
  },

  async findByEmail(email) {
    const result = await query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0];
  },

  async findById(id) {
    const result = await query(
      'SELECT id, name, email, phone, role, avatar, is_active, created_at, updated_at FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0];
  },

  async update(id, fields) {
    const allowed = ['name', 'phone', 'avatar'];
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
      `UPDATE users SET ${sets.join(', ')} WHERE id = $${idx} 
       RETURNING id, name, email, phone, role, avatar, is_active, created_at, updated_at`,
      values
    );
    return result.rows[0];
  },

  async findAll({ role, page = 1, limit = 20 }) {
    const offset = (page - 1) * limit;
    let whereClause = '';
    const params = [limit, offset];

    if (role) {
      whereClause = 'WHERE role = $3';
      params.push(role);
    }

    const result = await query(
      `SELECT id, name, email, phone, role, is_active, created_at 
       FROM users ${whereClause} 
       ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
      params
    );

    const countResult = await query(
      `SELECT COUNT(*) FROM users ${role ? 'WHERE role = $1' : ''}`,
      role ? [role] : []
    );

    return {
      users: result.rows,
      total: parseInt(countResult.rows[0].count),
      page,
      limit
    };
  },

  async toggleActive(id) {
    const result = await query(
      `UPDATE users SET is_active = NOT is_active, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $1 
       RETURNING id, name, email, is_active`,
      [id]
    );
    return result.rows[0];
  },

  async comparePassword(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
};

module.exports = User;
