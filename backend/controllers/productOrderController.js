const { pool } = require('../config/db');
const ProductOrder = require('../models/ProductOrder');
const Salon = require('../models/Salon');

function computeTotal(items, productsById) {
  return items.reduce((total, item) => {
    const product = productsById.get(item.product_id);
    return total + Number(product.price) * item.quantity;
  }, 0);
}

exports.createCheckout = async (req, res, next) => {
  const client = await pool.connect();
  try {
    const { items, shipping_name, shipping_phone, address_line1, address_line2, city, state, postal_code, notes } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'At least one product is required.' });
    }

    const normalizedItems = items.map((item) => ({
      product_id: item.product_id,
      quantity: parseInt(item.quantity, 10),
    }));

    if (normalizedItems.some((item) => !item.product_id || Number.isNaN(item.quantity) || item.quantity <= 0)) {
      return res.status(400).json({ error: 'Each item must have a valid product and quantity.' });
    }

    const productIds = normalizedItems.map((item) => item.product_id);
    const productsResult = await client.query(
      `SELECT p.*, COALESCE(p.image_urls, CASE WHEN p.image_url IS NOT NULL THEN ARRAY[p.image_url] ELSE ARRAY[]::TEXT[] END) AS image_urls
       FROM products p
       WHERE p.id = ANY($1::uuid[]) AND p.is_active = true`,
      [productIds]
    );

    if (productsResult.rows.length !== productIds.length) {
      return res.status(404).json({ error: 'One or more products were not found.' });
    }

    const productsById = new Map(productsResult.rows.map((product) => [product.id, product]));
    const salonIds = [...new Set(productsResult.rows.map((product) => product.salon_id))];
    if (salonIds.length !== 1) {
      return res.status(400).json({ error: 'All products in an order must belong to the same salon.' });
    }

    const salonId = salonIds[0];
    const salon = await Salon.findById(salonId);
    if (!salon || !salon.is_approved || !salon.is_active) {
      return res.status(400).json({ error: 'This salon is not available for orders.' });
    }

    for (const item of normalizedItems) {
      const product = productsById.get(item.product_id);
      if (product.stock < item.quantity) {
        return res.status(400).json({ error: `${product.name} has only ${product.stock} items left in stock.` });
      }
    }

    const totalAmount = computeTotal(normalizedItems, productsById);

    await client.query('BEGIN');
    const orderResult = await client.query(
      `INSERT INTO product_orders (
         user_id, salon_id, total_amount, currency, shipping_name, shipping_phone,
         address_line1, address_line2, city, state, postal_code, notes, payment_status, order_status
       )
       VALUES ($1, $2, $3, 'INR', $4, $5, $6, $7, $8, $9, $10, $11, 'paid', 'paid')
       RETURNING *`,
      [
        req.user.id,
        salonId,
        totalAmount,
        shipping_name,
        shipping_phone,
        address_line1,
        address_line2 || null,
        city,
        state || null,
        postal_code,
        notes || null,
      ]
    );

    const order = orderResult.rows[0];

    for (const item of normalizedItems) {
      const product = productsById.get(item.product_id);
      const lineTotal = Number(product.price) * item.quantity;
      await client.query(
        `INSERT INTO product_order_items (order_id, product_id, quantity, unit_price, line_total)
         VALUES ($1, $2, $3, $4, $5)`,
        [order.id, item.product_id, item.quantity, product.price, lineTotal]
      );

      const stockUpdate = await client.query(
        `UPDATE products
         SET stock = stock - $1, updated_at = CURRENT_TIMESTAMP
         WHERE id = $2 AND stock >= $1`,
        [item.quantity, item.product_id]
      );

      if (stockUpdate.rowCount === 0) {
        throw new Error(`${product.name} is out of stock.`);
      }
    }

    await client.query('COMMIT');

    res.status(201).json({
      message: 'Order placed successfully',
      order: {
        id: order.id,
        total_amount: order.total_amount,
        currency: order.currency,
        salon_id: order.salon_id,
      },
    });
  } catch (err) {
    try { await client.query('ROLLBACK'); } catch {}
    next(err);
  } finally {
    client.release();
  }
};

exports.getMyOrders = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const result = await ProductOrder.findByUser(req.user.id, {
      page: parseInt(page, 10) || 1,
      limit: parseInt(limit, 10) || 10,
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
};

exports.getSalonOrders = async (req, res, next) => {
  try {
    const salonId = req.query.salon_id;
    if (!salonId) return res.status(400).json({ error: 'salon_id is required.' });

    const salon = await Salon.findByOwnerAndId(req.user.id, salonId);
    if (!salon) return res.status(404).json({ error: 'Salon not found.' });

    const { page, limit, status } = req.query;
    const result = await ProductOrder.findBySalon(salon.id, {
      status: status && status !== 'all' ? status : null,
      page: parseInt(page, 10) || 1,
      limit: parseInt(limit, 10) || 20,
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
};

exports.getOrderById = async (req, res, next) => {
  try {
    const order = await ProductOrder.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found.' });

    const isOwner = req.user.role === 'shopkeeper' && await Salon.findByOwnerAndId(req.user.id, order.salon_id);
    const isUser = req.user.role === 'user' && order.user_id === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isUser && !isAdmin) {
      return res.status(403).json({ error: 'Not authorized.' });
    }

    res.json({ order });
  } catch (err) {
    next(err);
  }
};

exports.updateStatus = async (req, res, next) => {
  try {
    const order = await ProductOrder.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found.' });

    const salon = await Salon.findByOwnerAndId(req.user.id, order.salon_id);
    if (!salon) return res.status(403).json({ error: 'Not authorized.' });

    const updated = await ProductOrder.updateStatus(req.params.id, req.body.order_status);
    res.json({ message: 'Order status updated', order: updated });
  } catch (err) {
    next(err);
  }
};
