const mongoose = require('mongoose');

const leaveRequestSchema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
    leaveType: { type: String, required: true }, // e.g. 'Casual', 'Sick', 'Earned'
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    isHalfDay: { type: Boolean, default: false },
    halfDaySession: { type: String, enum: ['first_half', 'second_half', null], default: null },
    reason: String,
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'cancelled'],
      default: 'pending',
    },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    approverRemarks: String,
    daysCount: Number,
  },
  { timestamps: true }
);

const leaveBalanceSchema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
    leaveType: { type: String, required: true },
    allotted: { type: Number, default: 0 },
    used: { type: Number, default: 0 },
    year: { type: Number, required: true },
  },
  { timestamps: true }
);

module.exports = {
  LeaveRequest: mongoose.model('LeaveRequest', leaveRequestSchema),
  LeaveBalance: mongoose.model('LeaveBalance', leaveBalanceSchema),
};
