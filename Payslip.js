const mongoose = require('mongoose');

const payslipSchema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
    month: { type: Number, required: true }, // 1-12
    year: { type: Number, required: true },
    earnings: {
      basic: { type: Number, default: 0 },
      hra: { type: Number, default: 0 },
      allowances: { type: Number, default: 0 },
      bonus: { type: Number, default: 0 },
    },
    deductions: {
      pf: { type: Number, default: 0 },
      professionalTax: { type: Number, default: 0 },
      incomeTax: { type: Number, default: 0 },
      lossOfPay: { type: Number, default: 0 },
      other: { type: Number, default: 0 },
    },
    grossEarnings: Number,
    totalDeductions: Number,
    netPay: Number,
    daysPresent: Number,
    daysOnLeave: Number,
    pdfUrl: String,
    generatedAt: Date,
  },
  { timestamps: true }
);

payslipSchema.index({ employee: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('Payslip', payslipSchema);
