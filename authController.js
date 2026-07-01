const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Employee = require('../models/Employee');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

// POST /api/auth/register  (HR admin only - creates a new employee account)
exports.register = async (req, res) => {
  try {
    const { employeeId, name, email, password, role, department, designation, dateOfJoining, reportingManager } = req.body;

    const exists = await Employee.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Employee with this email already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const employee = await Employee.create({
      employeeId,
      name,
      email,
      password: hashedPassword,
      role: role || 'employee',
      department,
      designation,
      dateOfJoining,
      reportingManager,
      status: 'onboarding',
    });

    res.status(201).json({
      _id: employee._id,
      employeeId: employee.employeeId,
      name: employee.name,
      email: employee.email,
      role: employee.role,
      token: generateToken(employee._id),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const employee = await Employee.findOne({ email });

    if (!employee || !(await bcrypt.compare(password, employee.password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    res.json({
      _id: employee._id,
      employeeId: employee.employeeId,
      name: employee.name,
      email: employee.email,
      role: employee.role,
      token: generateToken(employee._id),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
