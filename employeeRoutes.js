const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/employeeController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const uploadExcel = require('../middleware/upload');

router.use(protect);

router.get('/me', ctrl.getMyProfile);
router.put('/me', ctrl.updateMyProfile);
router.get('/team', authorize('manager'), ctrl.getMyTeam);

router.get('/', authorize('hr_admin'), ctrl.getAllEmployees);
router.post('/bulk-import', authorize('hr_admin'), uploadExcel.single('file'), ctrl.bulkImportEmployees);
router.get('/:id', authorize('hr_admin', 'manager'), ctrl.getEmployeeById);
router.put('/:id', authorize('hr_admin'), ctrl.updateEmployee);
router.put('/:id/exit', authorize('hr_admin'), ctrl.processExit);

module.exports = router;
