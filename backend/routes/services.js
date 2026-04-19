const router = require('express').Router();
const { body } = require('express-validator');
const serviceController = require('../controllers/serviceController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const validate = require('../middleware/validate');

// Public
router.get('/salon/:salonId', serviceController.getBySalon);

// Shopkeeper
router.get('/my-services', auth, roleCheck('shopkeeper'), serviceController.getMyServices);

router.post('/', auth, roleCheck('shopkeeper'), [
  body('name').trim().notEmpty().withMessage('Service name is required'),
  body('price').isFloat({ min: 0 }).withMessage('Valid price required'),
  body('duration').optional().isInt({ min: 5 }).withMessage('Duration must be at least 5 minutes')
], validate, serviceController.create);

router.put('/:id', auth, roleCheck('shopkeeper'), serviceController.update);
router.delete('/:id', auth, roleCheck('shopkeeper'), serviceController.delete);

module.exports = router;
