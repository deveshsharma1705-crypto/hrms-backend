const { OnboardingChecklist, Document } = require('../models/Onboarding');

const DEFAULT_TASKS = [
  { title: 'Submit ID proof', category: 'documentation', assignedTo: 'employee' },
  { title: 'Submit address proof', category: 'documentation', assignedTo: 'employee' },
  { title: 'Submit education certificates', category: 'documentation', assignedTo: 'employee' },
  { title: 'Sign offer & appointment letter', category: 'hr_formality', assignedTo: 'employee' },
  { title: 'IT asset allocation (laptop, email, access)', category: 'it_setup', assignedTo: 'it' },
  { title: 'Induction session with HR', category: 'induction', assignedTo: 'hr' },
  { title: 'Team introduction', category: 'induction', assignedTo: 'manager' },
  { title: 'Bank details & payroll setup', category: 'hr_formality', assignedTo: 'employee' },
  { title: 'Insurance enrollment', category: 'hr_formality', assignedTo: 'hr' },
];

// POST /api/onboarding/:employeeId/init  (HR admin - creates checklist for a new hire)
exports.initChecklist = async (req, res) => {
  const existing = await OnboardingChecklist.findOne({ employee: req.params.employeeId });
  if (existing) return res.status(400).json({ message: 'Checklist already exists for this employee' });

  const checklist = await OnboardingChecklist.create({
    employee: req.params.employeeId,
    tasks: DEFAULT_TASKS,
    overallStatus: 'in_progress',
  });

  res.status(201).json(checklist);
};

// GET /api/onboarding/me
exports.getMyChecklist = async (req, res) => {
  const checklist = await OnboardingChecklist.findOne({ employee: req.user._id });
  if (!checklist) return res.status(404).json({ message: 'No onboarding checklist found' });
  res.json(checklist);
};

// GET /api/onboarding/:employeeId
exports.getChecklistByEmployee = async (req, res) => {
  const checklist = await OnboardingChecklist.findOne({ employee: req.params.employeeId });
  if (!checklist) return res.status(404).json({ message: 'No onboarding checklist found' });
  res.json(checklist);
};

// PUT /api/onboarding/:employeeId/task/:taskId
exports.updateTaskStatus = async (req, res) => {
  const { status } = req.body;
  const checklist = await OnboardingChecklist.findOne({ employee: req.params.employeeId });
  if (!checklist) return res.status(404).json({ message: 'Checklist not found' });

  const task = checklist.tasks.id(req.params.taskId);
  if (!task) return res.status(404).json({ message: 'Task not found' });

  task.status = status;
  if (status === 'completed') task.completedAt = new Date();

  const allDone = checklist.tasks.every((t) => t.status === 'completed');
  checklist.overallStatus = allDone ? 'completed' : 'in_progress';

  await checklist.save();
  res.json(checklist);
};

// POST /api/documents  (upload doc metadata - actual file upload handled via multer/cloud storage)
exports.addDocument = async (req, res) => {
  const { employeeId, docType, fileUrl } = req.body;
  const doc = await Document.create({
    employee: employeeId,
    docType,
    fileUrl,
    uploadedBy: req.user._id,
  });
  res.status(201).json(doc);
};

// GET /api/documents/:employeeId
exports.getDocuments = async (req, res) => {
  const docs = await Document.find({ employee: req.params.employeeId });
  res.json(docs);
};

// PUT /api/documents/:id/verify  (HR admin)
exports.verifyDocument = async (req, res) => {
  const doc = await Document.findByIdAndUpdate(req.params.id, { verified: true }, { new: true });
  if (!doc) return res.status(404).json({ message: 'Document not found' });
  res.json(doc);
};
