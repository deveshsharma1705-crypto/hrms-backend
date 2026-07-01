const Attendance = require('../models/Attendance');

const startOfDay = (d) => {
  const date = new Date(d);
  date.setHours(0, 0, 0, 0);
  return date;
};

// POST /api/attendance/clock-in
exports.clockIn = async (req, res) => {
  const today = startOfDay(new Date());
  let record = await Attendance.findOne({ employee: req.user._id, date: today });

  if (record && record.clockIn) {
    return res.status(400).json({ message: 'Already clocked in for today' });
  }

  if (!record) {
    record = await Attendance.create({
      employee: req.user._id,
      date: today,
      clockIn: new Date(),
      status: 'present',
      source: req.body.source || 'web',
    });
  } else {
    record.clockIn = new Date();
    await record.save();
  }

  res.json(record);
};

// POST /api/attendance/clock-out
exports.clockOut = async (req, res) => {
  const today = startOfDay(new Date());
  const record = await Attendance.findOne({ employee: req.user._id, date: today });

  if (!record || !record.clockIn) {
    return res.status(400).json({ message: 'You must clock in before clocking out' });
  }

  record.clockOut = new Date();
  record.workedHours = (record.clockOut - record.clockIn) / (1000 * 60 * 60);
  await record.save();

  res.json(record);
};

// GET /api/attendance/me?month=&year=
exports.getMyAttendance = async (req, res) => {
  const { month, year } = req.query;
  const filter = { employee: req.user._id };

  if (month && year) {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59);
    filter.date = { $gte: start, $lte: end };
  }

  const records = await Attendance.find(filter).sort({ date: -1 });
  res.json(records);
};

// GET /api/attendance/employee/:employeeId  (manager/HR view)
exports.getEmployeeAttendance = async (req, res) => {
  const { month, year } = req.query;
  const filter = { employee: req.params.employeeId };

  if (month && year) {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59);
    filter.date = { $gte: start, $lte: end };
  }

  const records = await Attendance.find(filter).sort({ date: -1 });
  res.json(records);
};

// PUT /api/attendance/:id  (HR admin - manual correction)
exports.updateAttendance = async (req, res) => {
  const record = await Attendance.findByIdAndUpdate(req.params.id, { ...req.body, source: 'manual' }, { new: true });
  if (!record) return res.status(404).json({ message: 'Attendance record not found' });
  res.json(record);
};
