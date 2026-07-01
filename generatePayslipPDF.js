const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function generatePayslipPDF(payslip, employee) {
  return new Promise((resolve, reject) => {
    const outputDir = path.join(__dirname, '..', 'generated', 'payslips');
    fs.mkdirSync(outputDir, { recursive: true });

    const fileName = `payslip_${employee.employeeId}_${payslip.month}_${payslip.year}.pdf`;
    const filePath = path.join(outputDir, fileName);

    const doc = new PDFDocument({ margin: 50 });
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    doc.fontSize(18).text('Payslip', { align: 'center' });
    doc.moveDown();
    doc.fontSize(10).text(`Pay Period: ${MONTH_NAMES[payslip.month - 1]} ${payslip.year}`, { align: 'center' });
    doc.moveDown(1.5);

    doc.fontSize(11);
    doc.text(`Employee Name: ${employee.name}`);
    doc.text(`Employee ID: ${employee.employeeId}`);
    doc.text(`Department: ${employee.department || '-'}`);
    doc.text(`Designation: ${employee.designation || '-'}`);
    doc.moveDown();

    doc.text(`Days Present: ${payslip.daysPresent ?? '-'}`);
    doc.text(`Days on Leave: ${payslip.daysOnLeave ?? '-'}`);
    doc.moveDown();

    doc.fontSize(13).text('Earnings', { underline: true });
    doc.fontSize(11);
    doc.text(`Basic: ${payslip.earnings.basic}`);
    doc.text(`HRA: ${payslip.earnings.hra}`);
    doc.text(`Allowances: ${payslip.earnings.allowances}`);
    doc.text(`Bonus: ${payslip.earnings.bonus}`);
    doc.moveDown(0.5);
    doc.font('Helvetica-Bold').text(`Gross Earnings: ${payslip.grossEarnings}`);
    doc.font('Helvetica');
    doc.moveDown();

    doc.fontSize(13).text('Deductions', { underline: true });
    doc.fontSize(11);
    doc.text(`Provident Fund: ${payslip.deductions.pf}`);
    doc.text(`Professional Tax: ${payslip.deductions.professionalTax}`);
    doc.text(`Income Tax: ${payslip.deductions.incomeTax}`);
    doc.text(`Loss of Pay: ${payslip.deductions.lossOfPay}`);
    doc.text(`Other: ${payslip.deductions.other}`);
    doc.moveDown(0.5);
    doc.font('Helvetica-Bold').text(`Total Deductions: ${payslip.totalDeductions}`);
    doc.moveDown();

    doc.fontSize(14).text(`Net Pay: ${payslip.netPay}`, { underline: true });
    doc.font('Helvetica');

    doc.end();

    stream.on('finish', () => resolve(`/generated/payslips/${fileName}`));
    stream.on('error', reject);
  });
}

module.exports = generatePayslipPDF;
