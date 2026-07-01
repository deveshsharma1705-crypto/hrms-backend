const ExcelJS = require('exceljs');

const styleHeader = (row) => {
  row.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2F5496' } };
  row.alignment = { vertical: 'middle', horizontal: 'center' };
};

// Builds a workbook with one sheet: employee master list
async function buildEmployeeSheet(employees) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Employees');

  sheet.columns = [
    { header: 'Employee ID', key: 'employeeId', width: 14 },
    { header: 'Name', key: 'name', width: 24 },
    { header: 'Email', key: 'email', width: 28 },
    { header: 'Phone', key: 'phone', width: 16 },
    { header: 'Department', key: 'department', width: 18 },
    { header: 'Designation', key: 'designation', width: 20 },
    { header: 'Role', key: 'role', width: 12 },
    { header: 'Employment Type', key: 'employmentType', width: 16 },
    { header: 'Status', key: 'status', width: 14 },
    { header: 'Date of Joining', key: 'dateOfJoining', width: 16 },
    { header: 'Reporting Manager', key: 'reportingManager', width: 22 },
  ];
  styleHeader(sheet.getRow(1));

  employees.forEach((e) => {
    sheet.addRow({
      employeeId: e.employeeId,
      name: e.name,
      email: e.email,
      phone: e.phone || '',
      department: e.department || '',
      designation: e.designation || '',
      role: e.role,
      employmentType: e.employmentType,
      status: e.status,
      dateOfJoining: e.dateOfJoining ? new Date(e.dateOfJoining).toISOString().split('T')[0] : '',
      reportingManager: e.reportingManager ? e.reportingManager.name || String(e.reportingManager) : '',
    });
  });

  return workbook;
}

// Builds a workbook: one row per employee per day in the given range
async function buildAttendanceSheet(records) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Attendance');

  sheet.columns = [
    { header: 'Employee ID', key: 'employeeId', width: 14 },
    { header: 'Name', key: 'name', width: 24 },
    { header: 'Date', key: 'date', width: 14 },
    { header: 'Status', key: 'status', width: 14 },
    { header: 'Clock In', key: 'clockIn', width: 20 },
    { header: 'Clock Out', key: 'clockOut', width: 20 },
    { header: 'Worked Hours', key: 'workedHours', width: 14 },
    { header: 'Half Day Session', key: 'halfDaySession', width: 16 },
    { header: 'Source', key: 'source', width: 14 },
  ];
  styleHeader(sheet.getRow(1));

  records.forEach((r) => {
    sheet.addRow({
      employeeId: r.employee?.employeeId || '',
      name: r.employee?.name || '',
      date: new Date(r.date).toISOString().split('T')[0],
      status: r.status,
      clockIn: r.clockIn ? new Date(r.clockIn).toLocaleString() : '',
      clockOut: r.clockOut ? new Date(r.clockOut).toLocaleString() : '',
      workedHours: r.workedHours ? Number(r.workedHours.toFixed(2)) : '',
      halfDaySession: r.halfDaySession || '',
      source: r.source,
    });
  });

  return workbook;
}

// Builds a workbook: one row per leave request
async function buildLeaveSheet(records) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Leave Requests');

  sheet.columns = [
    { header: 'Employee ID', key: 'employeeId', width: 14 },
    { header: 'Name', key: 'name', width: 24 },
    { header: 'Leave Type', key: 'leaveType', width: 16 },
    { header: 'Start Date', key: 'startDate', width: 14 },
    { header: 'End Date', key: 'endDate', width: 14 },
    { header: 'Half Day', key: 'isHalfDay', width: 10 },
    { header: 'Days Count', key: 'daysCount', width: 12 },
    { header: 'Status', key: 'status', width: 12 },
    { header: 'Reason', key: 'reason', width: 30 },
    { header: 'Approver Remarks', key: 'approverRemarks', width: 30 },
  ];
  styleHeader(sheet.getRow(1));

  records.forEach((r) => {
    sheet.addRow({
      employeeId: r.employee?.employeeId || '',
      name: r.employee?.name || '',
      leaveType: r.leaveType,
      startDate: new Date(r.startDate).toISOString().split('T')[0],
      endDate: new Date(r.endDate).toISOString().split('T')[0],
      isHalfDay: r.isHalfDay ? 'Yes' : 'No',
      daysCount: r.daysCount,
      status: r.status,
      reason: r.reason || '',
      approverRemarks: r.approverRemarks || '',
    });
  });

  return workbook;
}

module.exports = { buildEmployeeSheet, buildAttendanceSheet, buildLeaveSheet };
