const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.post('/login', login);
// Only HR admin can create new employee accounts (onboarding entry point)
router.post('/register', protect, authorize('hr_admin'), register);

module.exports = router;
