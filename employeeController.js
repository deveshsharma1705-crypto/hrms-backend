const Employee = require('../models/Employee');

// GET /api/employees/me
exports.getMyProfile = async (req, res) => {
  res.json(req.user);
};

// PUT /api/employees/me  (employee can update limited fields about themselves)
exports.updateMyProfile = async (req, res) => {
  const allowedFields = ['phone', 'address', 'emergencyContact', 'bankDetails', 'profilePhotoUrl'];
  const updates = {};
  allowedFields.forEach((f) => {
    if (req.body[f] !== undefined) updates[f] = req.body[f];
  });

  const employee = await Employee.findByIdAndUpdate(req.user._id, updates, { new: true }).select('-password');
  res.json(employee);
};

// GET /api/employees  (HR admin - list all, with filters)
exports.getAllEmployees = async (req, res) => {
  const { department, status, role } = req.query;
  const filter = {};
  if (department) filter.department = department;
  if (status) filter.status = status;
  if (role) filter.role = role;

  const employees = await Employee.find(filter).select('-password');
  res.json(employees);
};

// GET /api/employees/:id
exports.getEmployeeById = async (req, res) => {
  const employee = await Employee.findById(req.params.id).select('-password');
  if (!employee) return res.status(404).json({ message: 'Employee not found' });
  res.json(employee);
};

// PUT /api/employees/:id  (HR admin - full update including role, status, job info)
exports.updateEmployee = async (req, res) => {
  const employee = await Employee.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-password');
  if (!employee) return res.status(404).json({ message: 'Employee not found' });
  res.json(employee);
};

// PUT /api/employees/:id/exit  (HR admin - initiate/update exit process)
exports.processExit = async (req, res) => {
  const { resignationDate, lastWorkingDay, clearanceStatus, fnfStatus, reasonForLeaving } = req.body;

  const employee = await Employee.findByIdAndUpdate(
    req.params.id,
    {
      status: clearanceStatus === 'completed' ? 'exited' : 'notice_period',
      exitDetails: { resignationDate, lastWorkingDay, clearanceStatus, fnfStatus, reasonForLeaving },
    },
    { new: true }
  ).select('-password');

  if (!employee) return res.status(404).json({ message: 'Employee not found' });
  res.json(employee);
};

// GET /api/employees/team  (manager - view direct reports)
exports.getMyTeam = async (req, res) => {
  const team = await Employee.find({ reportingManager: req.user._id }).select('-password');
  res.json(team);
};

// POST /api/employees/bulk-import  (HR admin - upload Excel, auto-create employee profiles)
exports.bulkImportEmployees = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded. Attach an .xlsx file under field name "file".' });

    const bcrypt = require('bcryptjs');
    const { parseEmployeeExcel } = require('../utils/excelImport');
    const { OnboardingChecklist } = require('../models/Onboarding');

    const { rows, errors } = await parseEmployeeExcel(req.file.buffer);

    const created = [];
    const skipped = [...errors];

    for (const row of rows) {
      const exists = await Employee.findOne({ $or: [{ email: row.email }, { employeeId: row.employeeId }] });
      if (exists) {
        skipped.push({ row: row.rowNumber, message: `Employee already exists (${row.email})` });
        continue;
      }

      const tempPassword = row.password || Math.random().toString(36).slice(-10);
      const hashedPassword = await bcrypt.hash(tempPassword, 10);

      const employee = await Employee.create({
        employeeId: row.employeeId,
        name: row.name,
        email: row.email,
        password: hashedPassword,
        phone: row.phone || '',
        department: row.department || '',
        designation: row.designation || '',
        role: ['employee', 'manager', 'hr_admin'].includes(row.role) ? row.role : 'employee',
        employmentType: ['full_time', 'part_time', 'contract', 'intern'].includes(row.employmentType)
          ? row.employmentType
          : 'full_time',
        dateOfJoining: row.dateOfJoining || new Date(),
        status: 'onboarding',
      });

      // Auto-create a default onboarding checklist for each imported employee
      await OnboardingChecklist.create({
        employee: employee._id,
        tasks: [
          { title: 'Submit ID proof', category: 'documentation', assignedTo: 'employee' },
          { title: 'Submit address proof', category: 'documentation', assignedTo: 'employee' },
          { title: 'Sign offer & appointment letter', category: 'hr_formality', assignedTo: 'employee' },
          { title: 'IT asset allocation', category: 'it_setup', assignedTo: 'it' },
          { title: 'Induction session with HR', category: 'induction', assignedTo: 'hr' },
        ],
        overallStatus: 'in_progress',
      });

      created.push({
        employeeId: employee.employeeId,
        name: employee.name,
        email: employee.email,
        tempPassword: row.password ? undefined : tempPassword, // only surfaced if auto-generated
      });
    }

    res.status(201).json({
      summary: { totalRows: rows.length, created: created.length, skipped: skipped.length },
      created,
      skipped,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
