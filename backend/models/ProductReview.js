const { query } = require('../config/db');

const ProductReview = {
  async upsert({ product_id, user_id, rating, comment }) {
    const result = await query(
      `INSERT INTO product_reviews (product_id, user_id, rating, comment)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (product_id, user_id)
       DO UPDATE SET
         rating = EXCLUDED.rating,
         comment = EXCLUDED.comment,
         updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [product_id, user_id, rating, comment || null]
    );

    return result.rows[0];
  },
};

module.exports = ProductReview;
