const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/payslipController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.use(protect);

router.get('/me', ctrl.getMyPayslips);
router.get('/me/:id/download', ctrl.downloadMyPayslip);

router.post('/', authorize('hr_admin'), ctrl.generatePayslip);
router.get('/:employeeId', authorize('hr_admin'), ctrl.getPayslipsByEmployee);

module.exports = router;
