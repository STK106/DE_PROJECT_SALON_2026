const router = require('express').Router();
const { body } = require('express-validator');
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');

router.get('/profile', auth, userController.getProfile);

router.put('/profile', auth, [
  body('name').optional().trim().notEmpty(),
  body('phone').optional().trim()
], validate, userController.updateProfile);

module.exports = router;
