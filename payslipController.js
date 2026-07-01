const Payslip = require('../models/Payslip');
const Employee = require('../models/Employee');
const generatePayslipPDF = require('../utils/generatePayslipPDF');

// POST /api/payslips  (HR admin - generate a payslip for an employee for a given month)
exports.generatePayslip = async (req, res) => {
  try {
    const { employeeId, month, year, earnings, deductions, daysPresent, daysOnLeave } = req.body;

    const grossEarnings = Object.values(earnings || {}).reduce((a, b) => a + Number(b || 0), 0);
    const totalDeductions = Object.values(deductions || {}).reduce((a, b) => a + Number(b || 0), 0);
    const netPay = grossEarnings - totalDeductions;

    const payslip = await Payslip.findOneAndUpdate(
      { employee: employeeId, month, year },
      { earnings, deductions, grossEarnings, totalDeductions, netPay, daysPresent, daysOnLeave, generatedAt: new Date() },
      { upsert: true, new: true }
    );

    const employee = await Employee.findById(employeeId);
    const pdfUrl = await generatePayslipPDF(payslip, employee);

    payslip.pdfUrl = pdfUrl;
    await payslip.save();

    res.status(201).json(payslip);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/payslips/me
exports.getMyPayslips = async (req, res) => {
  const payslips = await Payslip.find({ employee: req.user._id }).sort({ year: -1, month: -1 });
  res.json(payslips);
};

// GET /api/payslips/me/:id/download
exports.downloadMyPayslip = async (req, res) => {
  const payslip = await Payslip.findOne({ _id: req.params.id, employee: req.user._id });
  if (!payslip || !payslip.pdfUrl) return res.status(404).json({ message: 'Payslip not found' });

  const path = require('path');
  res.download(path.join(__dirname, '..', payslip.pdfUrl));
};

// GET /api/payslips/:employeeId  (HR admin)
exports.getPayslipsByEmployee = async (req, res) => {
  const payslips = await Payslip.find({ employee: req.params.employeeId }).sort({ year: -1, month: -1 });
  res.json(payslips);
};
