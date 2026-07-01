const mongoose = require('mongoose');

const insuranceSchema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
    policyNumber: { type: String, required: true },
    provider: String, // e.g. "Star Health", "ICICI Lombard"
    policyType: { type: String, enum: ['health', 'life', 'accident', 'other'], default: 'health' },
    coverageAmount: Number,
    startDate: Date,
    endDate: Date,
    dependents: [
      {
        name: String,
        relation: String,
        dateOfBirth: Date,
      },
    ],
    claims: [
      {
        claimAmount: Number,
        reason: String,
        status: { type: String, enum: ['filed', 'in_review', 'approved', 'rejected', 'settled'], default: 'filed' },
        filedDate: Date,
      },
    ],
    status: { type: String, enum: ['active', 'expired', 'cancelled'], default: 'active' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('InsurancePolicy', insuranceSchema);
