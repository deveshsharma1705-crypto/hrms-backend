const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/insuranceController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.use(protect);

router.get('/me', ctrl.getMyPolicies);
router.post('/:id/claim', ctrl.fileClaim);

router.post('/', authorize('hr_admin'), ctrl.createPolicy);
router.get('/', authorize('hr_admin'), ctrl.getAllPolicies);
router.get('/:employeeId', authorize('hr_admin'), ctrl.getPoliciesByEmployee);
router.put('/:id', authorize('hr_admin'), ctrl.updatePolicy);
router.put('/:id/claim/:claimId', authorize('hr_admin'), ctrl.updateClaimStatus);

module.exports = router;
