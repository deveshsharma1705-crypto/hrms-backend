const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/reportController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.use(protect);
router.use(authorize('hr_admin', 'manager'));

router.get('/employees/export', authorize('hr_admin'), ctrl.exportEmployees);
router.get('/attendance/export', ctrl.exportAttendance);
router.get('/leaves/export', ctrl.exportLeaves);

module.exports = router;
