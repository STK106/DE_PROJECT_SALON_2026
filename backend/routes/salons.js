const router = require('express').Router();
const { body } = require('express-validator');
const salonController = require('../controllers/salonController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const validate = require('../middleware/validate');
const upload = require('../middleware/upload');

// Public routes
router.get('/', salonController.getAll);

// Shopkeeper routes (must come BEFORE /:id)
router.get('/owner/my-salon', auth, roleCheck('shopkeeper'), salonController.getMySalon);
router.get('/owner/stats', auth, roleCheck('shopkeeper'), salonController.getStats);

router.post('/', auth, roleCheck('shopkeeper'), [
  body('name').trim().notEmpty().withMessage('Salon name is required'),
  body('address').trim().notEmpty().withMessage('Address is required'),
  body('city').trim().notEmpty().withMessage('City is required')
], validate, salonController.create);

router.put('/', auth, roleCheck('shopkeeper'), salonController.update);

router.post('/images', auth, roleCheck('shopkeeper'), upload.array('images', 5), salonController.uploadImages);
router.delete('/images/:index', auth, roleCheck('shopkeeper'), salonController.deleteImage);

// Availability
router.get('/availability/blocked', auth, roleCheck('shopkeeper'), salonController.getBlockedSlots);
router.post('/availability/block', auth, roleCheck('shopkeeper'), [
  body('blocked_date').isDate().withMessage('Valid date required')
], validate, salonController.addBlockedSlot);
router.delete('/availability/block/:slotId', auth, roleCheck('shopkeeper'), salonController.removeBlockedSlot);

// User rating route
router.post('/:id/rate', auth, roleCheck('user'), [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5')
], validate, salonController.rateSalon);

// Public - get by id (MUST be last to avoid catching named routes)
router.get('/:id', salonController.getById);

module.exports = router;
