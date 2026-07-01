const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/regularizationController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.use(protect);

router.post('/', ctrl.applyRegularization);
router.get('/me', ctrl.getMyRegularizations);
router.get('/pending', authorize('hr_admin', 'manager'), ctrl.getPendingRegularizations);
router.put('/:id/decision', authorize('hr_admin', 'manager'), ctrl.decideRegularization);

module.exports = router;
