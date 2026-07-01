const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/onboardingController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.use(protect);

// Document sub-routes registered before the generic '/:employeeId' catch-all
router.post('/documents', ctrl.addDocument);
router.get('/documents/:employeeId', ctrl.getDocuments);
router.put('/documents/:id/verify', authorize('hr_admin'), ctrl.verifyDocument);

router.get('/me', ctrl.getMyChecklist);
router.get('/:employeeId', authorize('hr_admin', 'manager'), ctrl.getChecklistByEmployee);
router.post('/:employeeId/init', authorize('hr_admin'), ctrl.initChecklist);
router.put('/:employeeId/task/:taskId', ctrl.updateTaskStatus);

module.exports = router;
