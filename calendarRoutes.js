const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/calendarController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.use(protect);

router.get('/', ctrl.getEvents);
router.post('/', authorize('hr_admin'), ctrl.createEvent);
router.put('/:id', authorize('hr_admin'), ctrl.updateEvent);
router.delete('/:id', authorize('hr_admin'), ctrl.deleteEvent);

module.exports = router;
