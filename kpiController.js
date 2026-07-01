const KPI = require('../models/KPI');

// POST /api/kpi  (HR admin/manager - create review cycle entry for employee)
exports.createKPI = async (req, res) => {
  const kpi = await KPI.create(req.body);
  res.status(201).json(kpi);
};

// GET /api/kpi/me
exports.getMyKPIs = async (req, res) => {
  const kpis = await KPI.find({ employee: req.user._id }).sort({ createdAt: -1 });
  res.json(kpis);
};

// PUT /api/kpi/:id/self-review  (employee fills in self rating/achieved values)
exports.submitSelfReview = async (req, res) => {
  const { goals, overallSelfRating } = req.body;
  const kpi = await KPI.findOne({ _id: req.params.id, employee: req.user._id });
  if (!kpi) return res.status(404).json({ message: 'KPI record not found' });

  if (goals) kpi.goals = goals;
  kpi.overallSelfRating = overallSelfRating;
  kpi.status = 'submitted';
  await kpi.save();
  res.json(kpi);
};

// GET /api/kpi/pending-review  (manager - team KPIs awaiting review)
exports.getPendingReviews = async (req, res) => {
  const kpis = await KPI.find({ status: 'submitted' }).populate('employee', 'name employeeId reportingManager');
  const filtered =
    req.user.role === 'manager'
      ? kpis.filter((k) => String(k.employee.reportingManager) === String(req.user._id))
      : kpis;
  res.json(filtered);
};

// PUT /api/kpi/:id/manager-review  (manager finalizes ratings)
exports.submitManagerReview = async (req, res) => {
  const { goals, overallManagerRating } = req.body;
  const kpi = await KPI.findById(req.params.id);
  if (!kpi) return res.status(404).json({ message: 'KPI record not found' });

  if (goals) kpi.goals = goals;
  kpi.overallManagerRating = overallManagerRating;
  kpi.reviewedBy = req.user._id;
  kpi.status = 'finalized';
  await kpi.save();
  res.json(kpi);
};
