const { query } = require('../config/db');

const Product = {
  async create({ salon_id, name, description, price, stock, category, image_urls }) {
    const result = await query(
      `INSERT INTO products (salon_id, name, description, price, stock, category, image_url, image_urls)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [
        salon_id,
        name,
        description,
        price,
        stock ?? 0,
        category,
        image_urls?.[0] || null,
        image_urls || [],
      ]
    );
    return result.rows[0];
  },

  async findById(id) {
    const result = await query(
      `SELECT p.*, COALESCE(p.image_urls, CASE WHEN p.image_url IS NOT NULL THEN ARRAY[p.image_url] ELSE ARRAY[]::TEXT[] END) AS image_urls
       FROM products p
       WHERE p.id = $1`,
      [id]
    );
    return result.rows[0];
  },

  async findBySalon(salonId, activeOnly = true) {
    const condition = activeOnly ? 'AND is_active = true' : '';
    const result = await query(
      `SELECT p.*, COALESCE(p.image_urls, CASE WHEN p.image_url IS NOT NULL THEN ARRAY[p.image_url] ELSE ARRAY[]::TEXT[] END) AS image_urls
       FROM products p
       WHERE p.salon_id = $1 ${condition}
       ORDER BY p.created_at DESC`,
      [salonId]
    );
    return result.rows;
  },

  async update(id, fields) {
    const allowed = ['name', 'description', 'price', 'stock', 'category', 'is_active', 'image_url', 'image_urls'];
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

    sets.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    const result = await query(
      `UPDATE products SET ${sets.join(', ')} WHERE id = $${idx} RETURNING *`,
      values
    );

    return result.rows[0];
  },

  async delete(id) {
    const result = await query(
      'UPDATE products SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *',
      [id]
    );
    return result.rows[0];
  },

  async refreshRating(productId) {
    const aggregate = await query(
      `SELECT COALESCE(AVG(rating), 0)::numeric(2,1) AS rating, COUNT(*)::int AS total_ratings
       FROM product_reviews
       WHERE product_id = $1`,
      [productId]
    );

    const summary = aggregate.rows[0];
    const result = await query(
      `UPDATE products
       SET rating = $1, total_ratings = $2, updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING *`,
      [summary.rating, summary.total_ratings, productId]
    );

    return result.rows[0];
  },
};

module.exports = Product;
