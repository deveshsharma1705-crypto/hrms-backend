const Regularization = require('../models/Regularization');
const Attendance = require('../models/Attendance');

// POST /api/regularizations
exports.applyRegularization = async (req, res) => {
  const { date, requestedClockIn, requestedClockOut, reason, attachmentUrl } = req.body;

  const request = await Regularization.create({
    employee: req.user._id,
    date,
    requestedClockIn,
    requestedClockOut,
    reason,
    attachmentUrl,
  });

  res.status(201).json(request);
};

// GET /api/regularizations/me
exports.getMyRegularizations = async (req, res) => {
  const records = await Regularization.find({ employee: req.user._id }).sort({ createdAt: -1 });
  res.json(records);
};

// GET /api/regularizations/pending
exports.getPendingRegularizations = async (req, res) => {
  const records = await Regularization.find({ status: 'pending' })
    .populate('employee', 'name employeeId department reportingManager')
    .sort({ createdAt: 1 });

  const filtered =
    req.user.role === 'manager'
      ? records.filter((r) => String(r.employee.reportingManager) === String(req.user._id))
      : records;

  res.json(filtered);
};

// PUT /api/regularizations/:id/decision
exports.decideRegularization = async (req, res) => {
  const { decision, remarks } = req.body;

  const request = await Regularization.findById(req.params.id);
  if (!request) return res.status(404).json({ message: 'Regularization request not found' });

  request.status = decision;
  request.approvedBy = req.user._id;
  request.approverRemarks = remarks;
  await request.save();

  if (decision === 'approved') {
    const dayStart = new Date(request.date);
    dayStart.setHours(0, 0, 0, 0);

    await Attendance.findOneAndUpdate(
      { employee: request.employee, date: dayStart },
      {
        clockIn: request.requestedClockIn,
        clockOut: request.requestedClockOut,
        status: 'present',
        source: 'regularization',
      },
      { upsert: true }
    );
  }

  res.json(request);
};
