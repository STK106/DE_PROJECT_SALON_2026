const Product = require('../models/Product');
const ProductReview = require('../models/ProductReview');
const Salon = require('../models/Salon');
const Booking = require('../models/Booking');

async function getOwnedSalon(req, salonId) {
  if (salonId) {
    return Salon.findByOwnerAndId(req.user.id, salonId);
  }
  return Salon.findByOwner(req.user.id);
}

exports.getBySalon = async (req, res, next) => {
  try {
    const salon = await Salon.findById(req.params.salonId);
    if (!salon || !salon.is_approved || !salon.is_active) {
      return res.status(404).json({ error: 'Salon not found.' });
    }

    const products = await Product.findBySalon(req.params.salonId);
    res.json({ products });
  } catch (err) {
    next(err);
  }
};

exports.getMyProducts = async (req, res, next) => {
  try {
    const salon = await getOwnedSalon(req, req.query.salon_id);
    if (!salon) return res.status(404).json({ error: 'Salon not found.' });

    const products = await Product.findBySalon(salon.id, false);
    res.json({ products });
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const salon = await getOwnedSalon(req, req.body.salon_id || req.query.salon_id);
    if (!salon) return res.status(404).json({ error: 'Salon not found.' });

    const imageUrls = (req.files || []).map((file) => `/uploads/${file.filename}`);

    const product = await Product.create({
      ...req.body,
      salon_id: salon.id,
      price: req.body.price !== undefined ? parseFloat(req.body.price) : undefined,
      stock: req.body.stock !== undefined ? parseInt(req.body.stock, 10) : 0,
      image_urls: imageUrls,
    });
    res.status(201).json({ message: 'Product created', product });
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found.' });

    const salon = await Salon.findByOwnerAndId(req.user.id, product.salon_id);
    if (!salon) {
      return res.status(403).json({ error: 'Not authorized.' });
    }

    const payload = {
      ...req.body,
      price: req.body.price !== undefined ? parseFloat(req.body.price) : undefined,
      stock: req.body.stock !== undefined ? parseInt(req.body.stock, 10) : undefined,
    };

    const imageUrls = (req.files || []).map((file) => `/uploads/${file.filename}`);
    if (imageUrls.length > 0) {
      payload.image_urls = imageUrls;
      payload.image_url = imageUrls[0];
    }

    const updated = await Product.update(req.params.id, payload);
    res.json({ message: 'Product updated', product: updated });
  } catch (err) {
    next(err);
  }
};

exports.delete = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found.' });

    const salon = await Salon.findByOwnerAndId(req.user.id, product.salon_id);
    if (!salon) {
      return res.status(403).json({ error: 'Not authorized.' });
    }

    await Product.delete(req.params.id);
    res.json({ message: 'Product deleted' });
  } catch (err) {
    next(err);
  }
};

exports.rate = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product || !product.is_active) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    const salon = await Salon.findById(product.salon_id);
    if (!salon || !salon.is_approved || !salon.is_active) {
      return res.status(404).json({ error: 'Salon not found.' });
    }

    const hasCompletedBooking = await Booking.hasCompletedBooking(req.user.id, product.salon_id);
    if (!hasCompletedBooking) {
      return res.status(403).json({ error: 'Complete a booking at this salon before rating products.' });
    }

    const value = parseInt(req.body.rating, 10);
    if (Number.isNaN(value) || value < 1 || value > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5.' });
    }

    await ProductReview.upsert({
      product_id: product.id,
      user_id: req.user.id,
      rating: value,
      comment: req.body.comment,
    });

    const updatedProduct = await Product.refreshRating(product.id);

    res.json({
      message: 'Product rating submitted.',
      product: updatedProduct,
    });
  } catch (err) {
    next(err);
  }
};
