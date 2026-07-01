const { LeaveRequest } = require('../models/Leave');
const Regularization = require('../models/Regularization');

// GET /api/approvals/inbox  (manager/HR admin - all pending items across modules)
exports.getInbox = async (req, res) => {
  const [leaves, regularizations] = await Promise.all([
    LeaveRequest.find({ status: 'pending' }).populate('employee', 'name employeeId department reportingManager'),
    Regularization.find({ status: 'pending' }).populate('employee', 'name employeeId department reportingManager'),
  ]);

  const isMine = (item) => req.user.role !== 'manager' || String(item.employee.reportingManager) === String(req.user._id);

  const inbox = [
    ...leaves.filter(isMine).map((l) => ({
      type: l.isHalfDay ? 'half_day' : 'leave',
      id: l._id,
      employee: l.employee,
      details: { leaveType: l.leaveType, startDate: l.startDate, endDate: l.endDate, daysCount: l.daysCount, reason: l.reason },
      createdAt: l.createdAt,
    })),
    ...regularizations.filter(isMine).map((r) => ({
      type: 'regularization',
      id: r._id,
      employee: r.employee,
      details: { date: r.date, requestedClockIn: r.requestedClockIn, requestedClockOut: r.requestedClockOut, reason: r.reason },
      createdAt: r.createdAt,
    })),
  ].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  res.json(inbox);
};
