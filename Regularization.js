const mongoose = require('mongoose');

const regularizationSchema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
    date: { type: Date, required: true },
    requestedClockIn: Date,
    requestedClockOut: Date,
    reason: { type: String, required: true },
    attachmentUrl: String,
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    approverRemarks: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Regularization', regularizationSchema);
