const router = require('express').Router();
const { body } = require('express-validator');
const controller = require('../controllers/productOrderController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const validate = require('../middleware/validate');

router.post('/checkout', auth, roleCheck('user'), [
  body('shipping_name').trim().notEmpty().withMessage('Shipping name is required'),
  body('shipping_phone').trim().notEmpty().withMessage('Shipping phone is required'),
  body('address_line1').trim().notEmpty().withMessage('Address is required'),
  body('city').trim().notEmpty().withMessage('City is required'),
  body('postal_code').trim().notEmpty().withMessage('Postal code is required'),
], validate, controller.createCheckout);

router.get('/my-orders', auth, roleCheck('user'), controller.getMyOrders);
router.get('/salon-orders', auth, roleCheck('shopkeeper'), controller.getSalonOrders);
router.get('/:id', auth, controller.getOrderById);
router.put('/:id/status', auth, roleCheck('shopkeeper'), [
  body('order_status').isIn(['processing', 'shipped', 'delivered', 'cancelled']).withMessage('Invalid order status'),
], validate, controller.updateStatus);

module.exports = router;
