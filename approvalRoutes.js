const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/approvalController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.use(protect);

router.get('/inbox', authorize('hr_admin', 'manager'), ctrl.getInbox);

module.exports = router;
