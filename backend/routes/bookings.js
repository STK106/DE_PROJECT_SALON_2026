const router = require('express').Router();
const { body } = require('express-validator');
const bookingController = require('../controllers/bookingController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const validate = require('../middleware/validate');

// User routes
router.post('/', auth, roleCheck('user'), [
  body('salon_id').isUUID().withMessage('Valid salon ID required'),
  body('service_id').isUUID().withMessage('Valid service ID required'),
  body('staff_id').optional({ nullable: true, checkFalsy: true }).isUUID().withMessage('Valid staff ID required'),
  body('booking_date').isDate().withMessage('Valid date required'),
  body('start_time').matches(/^\d{2}:\d{2}$/).withMessage('Valid time required (HH:MM)')
], validate, bookingController.create);

router.get('/my-bookings', auth, roleCheck('user'), bookingController.getMyBookings);
router.get('/slots/:salonId', auth, bookingController.getAvailableSlots);
router.put('/:id/cancel', auth, roleCheck('user'), bookingController.cancel);

// Shopkeeper routes
router.get('/salon/all', auth, roleCheck('shopkeeper'), bookingController.getSalonBookings);
router.put('/:id/status', auth, roleCheck('shopkeeper'), [
  body('status').isIn(['confirmed', 'completed', 'rejected']).withMessage('Invalid status')
], validate, bookingController.updateStatus);

// Get by ID (must be last)
router.get('/:id', auth, bookingController.getById);

module.exports = router;
