const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/leaveController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.use(protect);

router.post('/', ctrl.applyLeave);
router.get('/me', ctrl.getMyLeaves);
router.get('/balance', ctrl.getMyBalance);
router.put('/:id/cancel', ctrl.cancelLeave);

router.get('/pending', authorize('hr_admin', 'manager'), ctrl.getPendingLeaves);
router.put('/:id/decision', authorize('hr_admin', 'manager'), ctrl.decideLeave);
router.post('/balance', authorize('hr_admin'), ctrl.setBalance);

module.exports = router;
