const router = require('express').Router();
const { body } = require('express-validator');
const productController = require('../controllers/productController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const validate = require('../middleware/validate');
const upload = require('../middleware/upload');

// Public
router.get('/salon/:salonId', productController.getBySalon);

// Shopkeeper
router.get('/my-products', auth, roleCheck('shopkeeper'), productController.getMyProducts);

router.post('/', auth, roleCheck('shopkeeper'), upload.array('images', 5), [
  body('name').trim().notEmpty().withMessage('Product name is required'),
  body('price').isFloat({ min: 0 }).withMessage('Valid price required'),
  body('stock').optional().isInt({ min: 0 }).withMessage('Stock cannot be negative'),
], validate, productController.create);

router.put('/:id', auth, roleCheck('shopkeeper'), upload.array('images', 5), productController.update);
router.delete('/:id', auth, roleCheck('shopkeeper'), productController.delete);

// User ratings
router.post('/:id/rate', auth, roleCheck('user'), [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
], validate, productController.rate);

module.exports = router;
