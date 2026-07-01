const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/attendanceController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.use(protect);

router.post('/clock-in', ctrl.clockIn);
router.post('/clock-out', ctrl.clockOut);
router.get('/me', ctrl.getMyAttendance);
router.get('/employee/:employeeId', authorize('hr_admin', 'manager'), ctrl.getEmployeeAttendance);
router.put('/:id', authorize('hr_admin'), ctrl.updateAttendance);

module.exports = router;
