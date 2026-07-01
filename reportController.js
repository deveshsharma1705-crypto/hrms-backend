const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const { LeaveRequest } = require('../models/Leave');
const { buildEmployeeSheet, buildAttendanceSheet, buildLeaveSheet } = require('../utils/excelExport');

const sendWorkbook = async (res, workbook, filename) => {
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  await workbook.xlsx.write(res);
  res.end();
};

// GET /api/reports/employees/export  (HR admin - all employee profile data)
exports.exportEmployees = async (req, res) => {
  const { department, status } = req.query;
  const filter = {};
  if (department) filter.department = department;
  if (status) filter.status = status;

  const employees = await Employee.find(filter).populate('reportingManager', 'name').select('-password');
  const workbook = await buildEmployeeSheet(employees);
  await sendWorkbook(res, workbook, 'employees.xlsx');
};

// GET /api/reports/attendance/export?month=&year=&employeeId=  (HR admin/manager)
exports.exportAttendance = async (req, res) => {
  const { month, year, employeeId } = req.query;
  const filter = {};

  if (month && year) {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59);
    filter.date = { $gte: start, $lte: end };
  }
  if (employeeId) filter.employee = employeeId;

  const records = await Attendance.find(filter).populate('employee', 'employeeId name').sort({ date: 1 });
  const workbook = await buildAttendanceSheet(records);
  await sendWorkbook(res, workbook, 'attendance.xlsx');
};

// GET /api/reports/leaves/export?year=&status=&employeeId=  (HR admin/manager)
exports.exportLeaves = async (req, res) => {
  const { year, status, employeeId } = req.query;
  const filter = {};

  if (year) {
    filter.startDate = { $gte: new Date(year, 0, 1), $lte: new Date(year, 11, 31, 23, 59, 59) };
  }
  if (status) filter.status = status;
  if (employeeId) filter.employee = employeeId;

  const records = await LeaveRequest.find(filter).populate('employee', 'employeeId name').sort({ startDate: 1 });
  const workbook = await buildLeaveSheet(records);
  await sendWorkbook(res, workbook, 'leave_requests.xlsx');
};
