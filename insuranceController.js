const InsurancePolicy = require('../models/Insurance');

// POST /api/insurance  (HR admin - assign policy)
exports.createPolicy = async (req, res) => {
  const policy = await InsurancePolicy.create(req.body);
  res.status(201).json(policy);
};

// GET /api/insurance/me
exports.getMyPolicies = async (req, res) => {
  const policies = await InsurancePolicy.find({ employee: req.user._id });
  res.json(policies);
};

// GET /api/insurance/:employeeId  (HR admin)
exports.getPoliciesByEmployee = async (req, res) => {
  const policies = await InsurancePolicy.find({ employee: req.params.employeeId });
  res.json(policies);
};

// GET /api/insurance  (HR admin - all policies, filterable by status e.g. expiring soon)
exports.getAllPolicies = async (req, res) => {
  const { status } = req.query;
  const filter = {};
  if (status) filter.status = status;
  const policies = await InsurancePolicy.find(filter).populate('employee', 'name employeeId department');
  res.json(policies);
};

// PUT /api/insurance/:id
exports.updatePolicy = async (req, res) => {
  const policy = await InsurancePolicy.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!policy) return res.status(404).json({ message: 'Policy not found' });
  res.json(policy);
};

// POST /api/insurance/:id/claim
exports.fileClaim = async (req, res) => {
  const { claimAmount, reason } = req.body;
  const policy = await InsurancePolicy.findById(req.params.id);
  if (!policy) return res.status(404).json({ message: 'Policy not found' });

  policy.claims.push({ claimAmount, reason, filedDate: new Date(), status: 'filed' });
  await policy.save();
  res.status(201).json(policy);
};

// PUT /api/insurance/:id/claim/:claimId  (HR admin - update claim status)
exports.updateClaimStatus = async (req, res) => {
  const { status } = req.body;
  const policy = await InsurancePolicy.findById(req.params.id);
  if (!policy) return res.status(404).json({ message: 'Policy not found' });

  const claim = policy.claims.id(req.params.claimId);
  if (!claim) return res.status(404).json({ message: 'Claim not found' });

  claim.status = status;
  await policy.save();
  res.json(policy);
};
