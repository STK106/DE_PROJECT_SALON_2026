const router = require('express').Router();
const { body } = require('express-validator');
const staffController = require('../controllers/staffController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const validate = require('../middleware/validate');

// Public
router.get('/salon/:salonId', staffController.getBySalon);

// Shopkeeper
router.get('/my-staff', auth, roleCheck('shopkeeper'), staffController.getMyStaff);

router.post('/', auth, roleCheck('shopkeeper'), [
  body('name').trim().notEmpty().withMessage('Staff name is required')
], validate, staffController.create);

router.put('/:id', auth, roleCheck('shopkeeper'), staffController.update);
router.delete('/:id', auth, roleCheck('shopkeeper'), staffController.delete);

module.exports = router;
