const ExcelJS = require('exceljs');

// Expected column headers in row 1 (case-insensitive, order doesn't matter):
// Employee ID | Name | Email | Phone | Department | Designation | Role | Employment Type |
// Date of Joining | Password
const HEADER_MAP = {
  'employee id': 'employeeId',
  name: 'name',
  email: 'email',
  phone: 'phone',
  department: 'department',
  designation: 'designation',
  role: 'role',
  'employment type': 'employmentType',
  'date of joining': 'dateOfJoining',
  password: 'password',
};

async function parseEmployeeExcel(buffer) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);
  const sheet = workbook.worksheets[0];

  if (!sheet) throw new Error('No sheet found in uploaded file');

  // Map column index -> field name from header row
  const headerRow = sheet.getRow(1);
  const columnMap = {};
  headerRow.eachCell((cell, colNumber) => {
    const key = String(cell.value || '').trim().toLowerCase();
    if (HEADER_MAP[key]) columnMap[colNumber] = HEADER_MAP[key];
  });

  if (Object.keys(columnMap).length === 0) {
    throw new Error('Could not recognize any expected columns. Check the header row matches the template.');
  }

  const rows = [];
  const errors = [];

  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return; // skip header

    const entry = {};
    row.eachCell((cell, colNumber) => {
      const field = columnMap[colNumber];
      if (!field) return;
      entry[field] = cell.value instanceof Date ? cell.value : String(cell.value ?? '').trim();
    });

    if (!entry.name && !entry.email) return; // skip fully blank rows

    if (!entry.name || !entry.email || !entry.employeeId) {
      errors.push({ row: rowNumber, message: 'Missing required field (Employee ID, Name, or Email)' });
      return;
    }

    rows.push({ rowNumber, ...entry });
  });

  return { rows, errors };
}

module.exports = { parseEmployeeExcel };
