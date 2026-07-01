const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/kpiController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.use(protect);

router.get('/me', ctrl.getMyKPIs);
router.put('/:id/self-review', ctrl.submitSelfReview);

router.post('/', authorize('hr_admin', 'manager'), ctrl.createKPI);
router.get('/pending-review', authorize('hr_admin', 'manager'), ctrl.getPendingReviews);
router.put('/:id/manager-review', authorize('hr_admin', 'manager'), ctrl.submitManagerReview);

module.exports = router;
