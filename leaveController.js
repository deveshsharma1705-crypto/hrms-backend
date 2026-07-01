const { LeaveRequest, LeaveBalance } = require('../models/Leave');

const calcDays = (start, end, isHalfDay) => {
  if (isHalfDay) return 0.5;
  const diff = (new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24);
  return diff + 1;
};

// POST /api/leaves  (apply for leave - supports half-day via isHalfDay + halfDaySession)
exports.applyLeave = async (req, res) => {
  const { leaveType, startDate, endDate, isHalfDay, halfDaySession, reason } = req.body;

  const daysCount = calcDays(startDate, isHalfDay ? startDate : endDate, isHalfDay);

  const leave = await LeaveRequest.create({
    employee: req.user._id,
    leaveType,
    startDate,
    endDate: isHalfDay ? startDate : endDate,
    isHalfDay: !!isHalfDay,
    halfDaySession: isHalfDay ? halfDaySession : null,
    reason,
    daysCount,
    status: 'pending',
  });

  res.status(201).json(leave);
};

// GET /api/leaves/me
exports.getMyLeaves = async (req, res) => {
  const leaves = await LeaveRequest.find({ employee: req.user._id }).sort({ createdAt: -1 });
  res.json(leaves);
};

// GET /api/leaves/pending  (manager/HR - approval queue)
exports.getPendingLeaves = async (req, res) => {
  const leaves = await LeaveRequest.find({ status: 'pending' })
    .populate('employee', 'name employeeId department reportingManager')
    .sort({ createdAt: 1 });

  // Managers only see their direct reports' requests
  const filtered =
    req.user.role === 'manager'
      ? leaves.filter((l) => String(l.employee.reportingManager) === String(req.user._id))
      : leaves;

  res.json(filtered);
};

// PUT /api/leaves/:id/decision  (approve/reject)
exports.decideLeave = async (req, res) => {
  const { decision, remarks } = req.body; // decision: 'approved' | 'rejected'

  const leave = await LeaveRequest.findById(req.params.id);
  if (!leave) return res.status(404).json({ message: 'Leave request not found' });

  leave.status = decision;
  leave.approvedBy = req.user._id;
  leave.approverRemarks = remarks;
  await leave.save();

  if (decision === 'approved') {
    const year = new Date(leave.startDate).getFullYear();
    await LeaveBalance.findOneAndUpdate(
      { employee: leave.employee, leaveType: leave.leaveType, year },
      { $inc: { used: leave.daysCount } },
      { upsert: true }
    );
  }

  res.json(leave);
};

// PUT /api/leaves/:id/cancel  (employee cancels their own pending/approved request)
exports.cancelLeave = async (req, res) => {
  const leave = await LeaveRequest.findOne({ _id: req.params.id, employee: req.user._id });
  if (!leave) return res.status(404).json({ message: 'Leave request not found' });

  leave.status = 'cancelled';
  await leave.save();
  res.json(leave);
};

// GET /api/leaves/balance
exports.getMyBalance = async (req, res) => {
  const year = req.query.year || new Date().getFullYear();
  const balances = await LeaveBalance.find({ employee: req.user._id, year });
  res.json(balances);
};

// POST /api/leaves/balance  (HR admin - set/adjust allotment)
exports.setBalance = async (req, res) => {
  const { employeeId, leaveType, allotted, year } = req.body;
  const balance = await LeaveBalance.findOneAndUpdate(
    { employee: employeeId, leaveType, year },
    { allotted },
    { upsert: true, new: true }
  );
  res.json(balance);
};
