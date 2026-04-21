const { query } = require('../config/db');

const baseSelect = `
  SELECT o.*, s.name AS salon_name, u.name AS user_name, u.email AS user_email
  FROM product_orders o
  JOIN salons s ON o.salon_id = s.id
  JOIN users u ON o.user_id = u.id
`;

const ProductOrder = {
  async findById(id) {
    const orderResult = await query(`${baseSelect} WHERE o.id = $1`, [id]);
    const order = orderResult.rows[0];
    if (!order) return null;

    const itemsResult = await query(
      `SELECT i.*, p.name AS product_name, p.image_url, COALESCE(p.image_urls, CASE WHEN p.image_url IS NOT NULL THEN ARRAY[p.image_url] ELSE ARRAY[]::TEXT[] END) AS image_urls
       FROM product_order_items i
       JOIN products p ON i.product_id = p.id
       WHERE i.order_id = $1
       ORDER BY i.created_at ASC`,
      [id]
    );

    return { ...order, items: itemsResult.rows };
  },

  async findByUser(userId, { page = 1, limit = 10 }) {
    const offset = (page - 1) * limit;
    const result = await query(
      `${baseSelect}
       WHERE o.user_id = $1
       ORDER BY o.created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    const countResult = await query('SELECT COUNT(*) FROM product_orders WHERE user_id = $1', [userId]);

    return {
      orders: result.rows,
      total: parseInt(countResult.rows[0].count, 10),
      page,
      limit,
    };
  },

  async findBySalon(salonId, { status, page = 1, limit = 20 }) {
    const offset = (page - 1) * limit;
    const params = [salonId];
    let where = 'WHERE o.salon_id = $1';

    if (status) {
      params.push(status);
      where += ` AND o.order_status = $${params.length}`;
    }

    params.push(limit, offset);
    const result = await query(
      `${baseSelect}
       ${where}
       ORDER BY o.created_at DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );

    const countParams = params.slice(0, -2);
    const countResult = await query(
      `SELECT COUNT(*) FROM product_orders o ${where}`,
      countParams
    );

    return {
      orders: result.rows,
      total: parseInt(countResult.rows[0].count, 10),
      page,
      limit,
    };
  },

  async updateStatus(id, orderStatus) {
    const result = await query(
      'UPDATE product_orders SET order_status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [orderStatus, id]
    );
    return result.rows[0];
  },
};

module.exports = ProductOrder;
