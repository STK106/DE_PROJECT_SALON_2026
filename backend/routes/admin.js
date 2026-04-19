const router = require('express').Router();
const { body } = require('express-validator');
const adminController = require('../controllers/adminController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const validate = require('../middleware/validate');

// All admin routes require auth + admin role
router.use(auth, roleCheck('admin'));

router.get('/dashboard', adminController.getDashboard);
router.get('/users', adminController.getUsers);
router.put('/users/:id/toggle', adminController.toggleUserActive);
router.get('/salons', adminController.getSalons);
router.put('/salons/:id/approve', [
  body('approved').isBoolean().withMessage('Approved must be boolean')
], validate, adminController.approveSalon);
router.get('/bookings', adminController.getBookings);

module.exports = router;
